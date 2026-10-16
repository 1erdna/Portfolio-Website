/* Reference-inspired introduction: a quiet wordmark and navigation on scroll.
   No continuous animation or third-party dependency. */
(() => {
    function init() {
        const nav = document.querySelector(".nacaya-nav");
        const hero = document.querySelector(".hero-wordmark-landing");
        if (!nav || !hero) return;

        // Leave navigation visible if JS is disabled.
        const root = document.documentElement;
        root.classList.add("nacaya-enhanced");

        let pending = false;
        const update = () => {
            pending = false;
            const threshold = Math.max(90, Math.round(hero.getBoundingClientRect().height * .55));
            const reveal = window.scrollY >= threshold;
            root.classList.toggle("show-nacaya-nav", reveal);
            nav.inert = !reveal;
        };

        const requestUpdate = () => {
            if (!pending) {
                pending = true;
                requestAnimationFrame(update);
            }
        };

        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate, { passive: true });
        window.addEventListener("hashchange", requestUpdate);
        window.addEventListener("load", requestUpdate, { once: true });
        update();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
