/* NACAYA reference intro: native canvas particle portrait and timed name reveal.
   No video background or third-party animation library. */
(() => {
    "use strict";

    function init() {
        const root = document.documentElement;
        const hero = document.querySelector("#home.reference-home");
        const stage = document.querySelector(".ref-portrait");
        const image = document.getElementById("ref-portrait-image");
        const canvas = document.getElementById("ref-particles");
        const nav = document.querySelector(".ref-nav");
        if (!hero || !stage || !image || !canvas) return;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const play = !reduced && root.classList.contains("intro-enabled");
        const animationStart = performance.now();

        // The original site remains fully navigable while the intro is running.
        // Scrolling or using a deep link ends the intro without locking the page.
        let introFinished = !play;
        function finishIntro() {
            if (introFinished) return;
            introFinished = true;
            root.classList.remove("intro-enabled");
            if (nav) nav.inert = false;
        }
        if (play) {
            if (nav) nav.inert = true;
            // Navigation becomes clickable once it visibly arrives.
            window.setTimeout(() => { if (nav) nav.inert = false; }, 5750);
            window.setTimeout(finishIntro, 8200);
            window.addEventListener("scroll", () => {
                if (window.scrollY > 90) finishIntro();
            }, { passive: true, once: true });
        }

        if (reduced) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        const colors = ["#dce5f5", "#a9b9d0", "#e2e8f3", "#6e8cae"];
        let dots = [];
        let w = 0, h = 0;
        let frame = 0, previous = 0, assembled = false, inView = true;

        function rand(seed) {
            let n = (seed + 0x6d2b79f5) | 0;
            n = Math.imul(n ^ (n >>> 15), n | 1);
            n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
            return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
        }

        function build() {
            const rect = stage.getBoundingClientRect();
            w = Math.round(rect.width);
            h = Math.round(rect.height);
            if (w < 60 || h < 60 || image.naturalWidth < 20) return;

            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(w * pixelRatio);
            canvas.height = Math.round(h * pixelRatio);
            ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

            const sampling = document.createElement("canvas");
            sampling.width = image.naturalWidth;
            sampling.height = image.naturalHeight;
            const sampleCtx = sampling.getContext("2d", { willReadFrequently: true });
            if (!sampleCtx) return;
            sampleCtx.drawImage(image, 0, 0);
            let rgba;
            try {
                rgba = sampleCtx.getImageData(0, 0, sampling.width, sampling.height).data;
            } catch (_) {
                return; // Static portrait remains available.
            }

            const step = window.innerWidth < 600 ? 4 : 3;
            const list = [];
            for (let y = step; y < sampling.height - step; y += step) {
                for (let x = step; x < sampling.width - step; x += step) {
                    const idx = (y * sampling.width + x) * 4;
                    const r = rgba[idx], g = rgba[idx + 1], b = rgba[idx + 2];
                    const brightness = (r + g + b) / 3;
                    const deviation = Math.hypot(245 - r, 245 - g, 245 - b);
                    // Keep face, clothes and hair; omit the pale studio background.
                    const density = Math.max(0, Math.min(1, (deviation - 23) / 115));
                    const seed = x * 97 + y * 137;
                    if (rand(seed) > density * .85) continue;

                    const px = x / sampling.width * w;
                    const py = y / sampling.height * h;
                    // Feather the far edges for a softly disappearing silhouette.
                    const edge = Math.max(0, 1 - Math.pow(Math.abs(x / sampling.width - .5) / .58, 4));
                    list.push({
                        x: px, y: py,
                        sx: px + (rand(seed + 1) - .5) * w * 1.45,
                        sy: -rand(seed + 2) * h * 1.35 - h * .12,
                        delay: rand(seed + 3) * 1100,
                        radius: .55 + rand(seed + 4) * .9,
                        alpha: (.26 + density * .74) * edge,
                        tone: brightness < 95 ? 3 : rand(seed + 5) > .67 ? 0 : rand(seed + 6) > .6 ? 1 : 2
                    });
                }
            }

            dots = list;
            if (!dots.length) return;
            assembled = false;
            if (frame) cancelAnimationFrame(frame);
            frame = 0;
            previous = 0;
            if (inView && !document.hidden) start();
        }

        function draw(now) {
            ctx.clearRect(0, 0, w, h);
            const elapsed = play && !introFinished ? now - animationStart - 4250 : 5000;

            // Fewer state changes than assigning color and opacity per dot.
            for (let tone = 0; tone < colors.length; tone++) {
                ctx.fillStyle = colors[tone];
                for (const dot of dots) {
                    if (dot.tone !== tone) continue;
                    const t = Math.max(0, Math.min(1, (elapsed - dot.delay) / 1700));
                    if (t <= 0) continue;
                    const eased = 1 - Math.pow(1 - t, 3);
                    const x = dot.sx + (dot.x - dot.sx) * eased;
                    const y = dot.sy + (dot.y - dot.sy) * eased;
                    ctx.globalAlpha = dot.alpha * Math.min(1, t * 3);
                    ctx.fillRect(x, y, dot.radius, dot.radius);
                }
            }
            ctx.globalAlpha = 1;

            if (!stage.classList.contains("particles-ready") && elapsed > 0) {
                stage.classList.add("particles-ready");
            }
            return elapsed > 3100;
        }

        function tick(now) {
            frame = 0;
            if (!inView || document.hidden) return;
            if (now - previous >= 40) {  // up to ~25 fps
                previous = now;
                assembled = draw(now);
            }
            if (!assembled) frame = requestAnimationFrame(tick);
        }
        function start() {
            if (!frame && dots.length && !assembled && inView && !document.hidden) {
                frame = requestAnimationFrame(tick);
            }
        }
        function stop() {
            if (frame) cancelAnimationFrame(frame);
            frame = 0;
        }
        if ("IntersectionObserver" in window) {
            new IntersectionObserver(([entry]) => {
                inView = entry.isIntersecting;
                if (inView) start();
                else stop();
            }, { threshold: .01 }).observe(hero);
        }
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) stop();
            else start();
        });
        let pendingResize;
        window.addEventListener("resize", () => {
            clearTimeout(pendingResize);
            pendingResize = setTimeout(() => {
                if (image.naturalWidth) build();
            }, 150);
        }, { passive: true });

        if (image.complete) {
            if (image.naturalWidth) build();
        } else {
            image.addEventListener("load", build, { once: true });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else init();
})();
