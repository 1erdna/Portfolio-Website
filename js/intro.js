/* Cinematic, image-driven particle intro.
   Uses the existing personal portrait asset and the browser Canvas API. */
(() => {
    "use strict";

    function init() {
        const hero = document.getElementById("home");
        const canvas = document.getElementById("hero-particles");
        const photo = document.getElementById("hero-photo");
        const visual = document.querySelector(".hero-visual");
        if (!hero || !canvas || !photo || !visual) return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const skipSequence = Boolean(location.hash && location.hash !== "#home")
            || window.scrollY > 120;

        if (prefersReducedMotion.matches) return;

        const context = canvas.getContext("2d", { alpha: true });
        if (!context) return;

        const playingIntro = !skipSequence;
        const sequenceStart = performance.now();
        if (playingIntro) {
            hero.classList.add("play-intro");
            window.setTimeout(() => hero.classList.remove("play-intro"), 3600);
        }

        let points = [];
        let width = 0;
        let height = 0;
        let raf = 0;
        let lastPaint = 0;
        let inView = true;
        let loaded = false;
        const PALETTE = [
            "rgba(238, 243, 255, 0.92)",
            "rgba(180, 197, 226, 0.82)",
            "rgba(123, 165, 241, 0.78)",
            "rgba(250, 250, 255, 0.65)"
        ];

        // Repeatable pseudo-random points avoid reshuffling during small resizes.
        function random(seed) {
            let n = seed + 0x6D2B79F5;
            n = Math.imul(n ^ (n >>> 15), n | 1);
            n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
            return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
        }

        function build() {
            const bounds = visual.getBoundingClientRect();
            width = Math.round(bounds.width);
            height = Math.round(bounds.height);
            if (width < 60 || height < 80) return;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            context.setTransform(dpr, 0, 0, dpr, 0, 0);

            const sampler = document.createElement("canvas");
            // Sample at the original photo resolution, not at display resolution.
            sampler.width = photo.naturalWidth;
            sampler.height = photo.naturalHeight;
            const sampleContext = sampler.getContext("2d", { willReadFrequently: true });
            if (!sampleContext) return;
            sampleContext.drawImage(photo, 0, 0);
            let pixels;
            try {
                pixels = sampleContext.getImageData(0, 0, sampler.width, sampler.height).data;
            } catch (_) {
                return; // The normal static portrait remains visible.
            }

            const step = window.innerWidth < 600 ? 6 : 5;
            const list = [];
            const sourceWidth = sampler.width;
            const sourceHeight = sampler.height;

            for (let y = step; y < sourceHeight - step; y += step) {
                for (let x = step; x < sourceWidth - step; x += step) {
                    const i = (y * sourceWidth + x) * 4;
                    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];

                    // The supplied studio background is near-neutral and pale.
                    // Retain the person's dark hair, skin and pink clothes.
                    const difference = Math.hypot(r - 244, g - 244, b - 244);
                    const density = Math.min(1, Math.max(0, (difference - 19) / 112));
                    const seed = x * 97 + y * 131;
                    if (random(seed) > density * .74) continue;

                    const targetX = (x / sourceWidth) * width;
                    const targetY = (y / sourceHeight) * height;
                    const scatterX = (random(seed + 1) - .5) * width * 1.85;
                    const scatterY = (random(seed + 2) - .5) * height * 1.6;
                    const tone = random(seed + 3);
                    const color = tone < .13 ? 2 : tone < .42 ? 1 : tone < .57 ? 3 : 0;

                    list.push({
                        x: targetX,
                        y: targetY,
                        fromX: targetX + scatterX,
                        fromY: targetY + scatterY,
                        delay: random(seed + 4) * 1050,
                        phase: random(seed + 5) * Math.PI * 2,
                        radius: .6 + random(seed + 6) * .65,
                        alpha: .34 + Math.min(density, 1) * .61,
                        color
                    });
                }
            }

            points = list;
            if (!points.length) return;
            loaded = true;
            visual.classList.add("particles-ready");
            if (inView && !document.hidden) start();
        }

        function render(now) {
            context.clearRect(0, 0, width, height);
            const elapsed = playingIntro ? now - sequenceStart - 1150 : 8000;
            const assembled = elapsed > 2800;

            // Group by shade to avoid a fillStyle change for every tiny point.
            for (let color = 0; color < PALETTE.length; color++) {
                context.fillStyle = PALETTE[color];
                for (let i = 0; i < points.length; i++) {
                    const p = points[i];
                    if (p.color !== color) continue;

                    const progress = Math.max(0, Math.min(1, (elapsed - p.delay) / 1650));
                    if (progress <= 0 && !assembled) continue;
                    const ease = 1 - Math.pow(1 - progress, 3);
                    const float = Math.sin(now * .00065 + p.phase) * .78 * ease;
                    const x = p.fromX + (p.x - p.fromX) * ease + float;
                    const y = p.fromY + (p.y - p.fromY) * ease +
                        Math.cos(now * .00043 + p.phase) * .58 * ease;
                    context.globalAlpha = p.alpha * Math.min(1, progress * 3);
                    context.fillRect(x, y, p.radius, p.radius);
                }
            }
            context.globalAlpha = 1;
        }

        function tick(now) {
            raf = 0;
            if (!inView || document.hidden || !loaded) return;
            if (now - lastPaint >= 50) { // approximately 20 FPS, to keep CPU use restrained
                lastPaint = now;
                render(now);
            }
            // The intro finishes once, rather than running a continuous heavy particle effect.
            if (playingIntro && now - sequenceStart < 4450) {
                raf = window.requestAnimationFrame(tick);
            }
        }

        function start() {
            if (!raf && loaded && inView && !document.hidden) {
                raf = window.requestAnimationFrame(tick);
            }
        }

        function stop() {
            if (raf) window.cancelAnimationFrame(raf);
            raf = 0;
        }

        if ("IntersectionObserver" in window) {
            new IntersectionObserver(entries => {
                inView = entries[0].isIntersecting;
                if (inView) start();
                else stop();
            }, { threshold: .01 }).observe(hero);
        }

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) stop();
            else start();
        });

        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => {
                if (photo.naturalWidth) build();
            }, 180);
        }, { passive: true });

        const onPhotoReady = () => {
            if (photo.naturalWidth > 0) build();
        };
        if (photo.complete) onPhotoReady();
        else {
            photo.addEventListener("load", onPhotoReady, { once: true });
            photo.addEventListener("error", () => {
                hero.classList.remove("play-intro");
            }, { once: true });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
