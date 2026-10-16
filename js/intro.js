/*
 * Cinematic Home — single-play, approximately four-second intro.
 * Particles are only an enhancement; the original photo remains visible
 * if Canvas is unavailable or the visitor prefers reduced motion.
 */
(() => {
    "use strict";

    function init() {
        const root = document.documentElement;
        const hero = document.querySelector("#home.reference-home");
        const stage = document.querySelector(".ref-portrait");
        const photo = document.getElementById("ref-portrait-image");
        const canvas = document.getElementById("ref-particles");
        const nav = document.querySelector(".ref-nav");
        const menu = document.querySelector(".ref-menu-toggle");
        const menuLinks = document.getElementById("ref-nav-links");
        const skipButton = document.querySelector(".ref-skip-intro");
        if (!hero || !stage || !photo || !canvas || !nav) return;
        stage.classList.add("portrait-cutout-pending");

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const hasIntro = !reduced && root.classList.contains("intro-enabled");
        const began = performance.now();
        const timeline = { particles: 1950, finish: 3950 };
        let finished = !hasIntro;
        let dots = [];
        let context = null;
        let width = 0;
        let height = 0;
        let raf = 0;
        let lastPaint = 0;
        let settled = false;
        let isVisible = true;

        // Always keep navigation accessible for deep links and reduced motion.
        nav.inert = hasIntro;
        const updateNav = () => nav.classList.toggle("is-scrolled", window.scrollY > 28);
        updateNav();
        window.addEventListener("scroll", updateNav, { passive: true });

        // Collapsible mobile navigation, with keyboard and outside-click support.
        function closeMenu() {
            if (!menu) return;
            nav.classList.remove("is-menu-open");
            menu.setAttribute("aria-expanded", "false");
            menu.setAttribute("aria-label", "Open navigation menu");
        }
        if (menu && menuLinks) {
            menu.addEventListener("click", () => {
                const opening = !nav.classList.contains("is-menu-open");
                nav.classList.toggle("is-menu-open", opening);
                menu.setAttribute("aria-expanded", String(opening));
                menu.setAttribute("aria-label", opening ? "Close navigation menu" : "Open navigation menu");
            });
            menuLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
            document.addEventListener("keydown", event => {
                if (event.key === "Escape" && nav.classList.contains("is-menu-open")) {
                    closeMenu();
                    menu.focus();
                }
            });
            document.addEventListener("pointerdown", event => {
                if (!nav.contains(event.target)) closeMenu();
            });
            window.addEventListener("resize", () => {
                if (window.innerWidth > 700) closeMenu();
            }, { passive: true });
        }

        function stop() {
            if (raf) cancelAnimationFrame(raf);
            raf = 0;
        }

        let portraitRevealTimer = 0;
        function revealPortraitSoon(delay = hasIntro ? 520 : 0) {
            if (stage.classList.contains("intro-complete") || portraitRevealTimer) return;
            if (delay <= 0) {
                stage.classList.add("intro-complete");
            } else {
                portraitRevealTimer = window.setTimeout(() => {
                    portraitRevealTimer = 0;
                    stage.classList.add("intro-complete");
                }, delay);
            }
        }

        function showFinal() {
            if (context && dots.length) {
                render(1);
                stage.classList.add("particles-ready");
                settled = true;
                stop();
            }
            // If the image is still loading or Canvas is unavailable, the
            // cut-out photo still becomes fully visible when the intro ends.
            revealPortraitSoon();
        }

        function finishIntro() {
            if (finished) return;
            finished = true;
            root.classList.remove("intro-enabled");
            nav.inert = false;
            showFinal();
        }

        if (hasIntro) {
            // Navigation is usable as soon as the header has appeared.
            window.setTimeout(() => { nav.inert = false; }, 2900);
            window.setTimeout(finishIntro, timeline.finish);
            skipButton?.addEventListener("click", finishIntro);
            const onScroll = () => {
                if (window.scrollY > 75) {
                    finishIntro();
                    window.removeEventListener("scroll", onScroll);
                }
            };
            window.addEventListener("scroll", onScroll, { passive: true });
        }
        /*
         * Remove the studio background BEFORE displaying/sampling the portrait.
         * It is a nearly uniform light gray and otherwise creates a visible
         * rectangle in the dark hero. Keep the original repository image intact.
         */
        function isolatePortrait() {
            if (!photo.naturalWidth || !photo.naturalHeight) return;
            try {
                const mat = document.createElement("canvas");
                mat.width = photo.naturalWidth;
                mat.height = photo.naturalHeight;
                const matCtx = mat.getContext("2d", { willReadFrequently: true });
                if (!matCtx) throw new Error("No image canvas");
                matCtx.drawImage(photo, 0, 0);
                const data = matCtx.getImageData(0, 0, mat.width, mat.height);
                const pixels = data.data;
                const w = mat.width, h = mat.height;
                const corners = [
                    [Math.round(w*.03), Math.round(h*.04)],
                    [Math.round(w*.96), Math.round(h*.04)],
                    [Math.round(w*.03), Math.round(h*.2)],
                    [Math.round(w*.96), Math.round(h*.2)]
                ];
                const bg = [0,0,0];
                for (const [x,y] of corners) {
                    const k = (y * w + x) * 4;
                    for (let c=0;c<3;c++) bg[c] += pixels[k+c] / corners.length;
                }
                let transparent = 0;
                for (let k = 0; k < pixels.length; k += 4) {
                    const d = Math.hypot(
                        pixels[k] - bg[0], pixels[k+1] - bg[1],
                        pixels[k+2] - bg[2]
                    );
                    const v = Math.max(0, Math.min(1, (d - 13) / 32));
                    let alpha = v * v * (3 - 2 * v);
                    // Pale pink shirt can be almost as bright as the backdrop.
                    // Preserve its chroma while still removing neutral-gray pixels.
                    const y = Math.floor(k / 4 / w);
                    if (y > h * .51) {
                        const pink = Math.min(
                            pixels[k] - pixels[k+1],
                            pixels[k+2] - pixels[k+1]
                        );
                        const cloth = Math.max(0, Math.min(1, (pink - 5) / 9));
                        alpha = Math.max(alpha, .99 * cloth * cloth * (3 - 2 * cloth));
                    }
                    pixels[k+3] = Math.round(pixels[k+3] * alpha);
                    if (alpha < .045) transparent++;
                }
                // The mask should remove a significant part of the photo.
                if (transparent < w*h*.1) throw new Error("Background not uniform");
                matCtx.putImageData(data, 0, 0);
                photo.addEventListener("load", () => {
                    stage.classList.add("portrait-cutout-ready");
                    stage.classList.remove("portrait-cutout-pending");
                    if (!reduced && context) build();
                }, { once: true });
                photo.src = mat.toDataURL("image/png");
            } catch (_) {
                stage.classList.remove("portrait-cutout-pending");
                stage.classList.add("portrait-cutout-unavailable");
                if (!reduced && context) build();
            }
        }

        if (reduced) {
            // Never leave the dotted veil visible for reduced-motion visitors.
            stage.classList.add("intro-complete");
            if (photo.complete && photo.naturalWidth) isolatePortrait();
            else photo.addEventListener("load", isolatePortrait, { once: true });
            return;
        }
        context = canvas.getContext("2d", { alpha: true });
        if (!context) {
            // Even without a particle canvas, keep the portrait background-free.
            if (photo.complete && photo.naturalWidth) isolatePortrait();
            else photo.addEventListener("load", isolatePortrait, { once: true });
            return;
        }

        const palette = ["#dce6f6", "#a7bbd4", "#f1f4fa", "#7391b9"];
        function random(seed) {
            let n = (seed + 0x6d2b79f5) | 0;
            n = Math.imul(n ^ (n >>> 15), n | 1);
            n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
            return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
        }
        const clamp = v => Math.max(0, Math.min(1, v));

        function build() {
            const rect = stage.getBoundingClientRect();
            width = Math.round(rect.width);
            height = Math.round(rect.height);
            if (width < 80 || height < 100 || !photo.naturalWidth) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            context.setTransform(dpr, 0, 0, dpr, 0, 0);

            const sample = document.createElement("canvas");
            sample.width = photo.naturalWidth;
            sample.height = photo.naturalHeight;
            const sampleContext = sample.getContext("2d", { willReadFrequently: true });
            if (!sampleContext) return;
            sampleContext.drawImage(photo, 0, 0);

            let pixels;
            try {
                pixels = sampleContext.getImageData(0, 0, sample.width, sample.height).data;
            } catch (_) {
                // Static portrait is deliberately retained if pixels cannot be read.
                return;
            }

            const step = window.innerWidth < 700 ? 4 : 3;
            const results = [];
            for (let y = step; y < sample.height - step; y += step) {
                for (let x = step; x < sample.width - step; x += step) {
                    const offset = (y * sample.width + x) * 4;
                    const r = pixels[offset], g = pixels[offset + 1], b = pixels[offset + 2];
                    // The cutout alpha, not a guess from pixel brightness, drives dots.
                    const density = pixels[offset + 3] / 255;
                    if (density < .055) continue;
                    const seed = x * 97 + y * 137;
                    const faceRegion = y < sample.height * .66 && y > sample.height * .16 &&
                        x > sample.width * .2 && x < sample.width * .8;
                    const skinTone = faceRegion && r > g * 1.045 && g >= b * .96 &&
                        (r + g + b) / 3 > 86;
                    if (random(seed) > density * (skinTone ? 1 : .9)) continue;

                    const targetX = x / sample.width * width;
                    const targetY = y / sample.height * height;
                    const edgeFade = clamp((.49 - Math.abs(x / sample.width - .5)) / .13);
                    results.push({
                        x: targetX, y: targetY,
                        startX: targetX + (random(seed + 1) - .5) * width * 1.35,
                        startY: -height * (.12 + random(seed + 2) * 1.1),
                        delay: random(seed + 3) * 380,
                        size: (window.innerWidth < 700 ? .86 : .95) + random(seed + 4) * .9,
                        alpha: (.48 + density * .52) * edgeFade * density,
                        tone: r + g + b < 285 ? 3 : skinTone && random(seed + 5) > .45 ? 2 :
                            random(seed + 6) > .51 ? 0 : 1
                    });
                }
            }
            dots = results;
            settled = false;
            stop();
            if (!dots.length) return;
            if (!hasIntro || finished || performance.now() - began > timeline.finish) {
                showFinal();
            } else if (isVisible && !document.hidden) {
                raf = requestAnimationFrame(tick);
            }
        }

        function render(progress, now = 0) {
            context.clearRect(0, 0, width, height);
            // Group by tone so large numbers of particles don't constantly change color.
            for (let tone = 0; tone < palette.length; tone++) {
                context.fillStyle = palette[tone];
                for (const dot of dots) {
                    if (dot.tone !== tone) continue;
                    const local = clamp((progress * 1650 - dot.delay) / 1150);
                    if (local <= 0) continue;
                    const ease = 1 - Math.pow(1 - local, 3);
                    const x = dot.startX + (dot.x - dot.startX) * ease;
                    const y = dot.startY + (dot.y - dot.startY) * ease;
                    context.globalAlpha = dot.alpha * Math.min(1, local * 3);
                    context.fillRect(x, y, dot.size, dot.size);
                }
            }
            context.globalAlpha = 1;
        }

        function tick(now) {
            raf = 0;
            if (!isVisible || document.hidden || settled) return;
            if (now - lastPaint >= 34) {
                lastPaint = now;
                const elapsed = now - began - timeline.particles;
                const fraction = clamp(elapsed / 1650);
                if (elapsed > 0) {
                    stage.classList.add("particles-ready");
                    render(fraction, now);
                }
                if (fraction >= 1) {
                    settled = true;
                    // Let the completed particle portrait breathe for a moment,
                    // then cross-fade to the clear photograph. No looping canvas.
                    revealPortraitSoon();
                    return;
                }
            }
            raf = requestAnimationFrame(tick);
        }

        if ("IntersectionObserver" in window) {
            new IntersectionObserver(([entry]) => {
                isVisible = entry.isIntersecting;
                if (!isVisible) stop();
                else if (!settled && dots.length && !raf) raf = requestAnimationFrame(tick);
            }, { threshold: .01 }).observe(hero);
        }
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) stop();
            else if (!settled && dots.length && isVisible && !raf) {
                raf = requestAnimationFrame(tick);
            }
        });
        let resizeTimer;
        window.addEventListener("resize", () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(build, 200);
        }, { passive: true });

        if (photo.complete && photo.naturalWidth) isolatePortrait();
        else photo.addEventListener("load", isolatePortrait, { once: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else init();
})();
