/* Motion enhancements are progressive: content remains visible without JavaScript. */
(() => {
    function initMotion() {
        const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
        const sections = navLinks
            .map(link => document.getElementById(link.getAttribute('href').slice(1)))
            .filter(Boolean);

        const progress = document.createElement('div');
        progress.className = 'scroll-progress';
        progress.setAttribute('aria-hidden', 'true');
        document.body.appendChild(progress);

        // One animation frame per scroll, even during quick touch scrolling.
        let frameRequested = false;
        const updateNavigation = () => {
            frameRequested = false;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const fraction = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
            progress.style.transform = `scaleX(${fraction})`;

            const marker = Math.min(window.innerHeight * 0.35, 270);
            let currentSection = sections[0] ? sections[0].id : '';
            sections.forEach(section => {
                if (section.getBoundingClientRect().top <= marker) currentSection = section.id;
            });

            navLinks.forEach(link => {
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.setAttribute('aria-current', 'location');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        };

        const scheduleNavigationUpdate = () => {
            if (frameRequested) return;
            frameRequested = true;
            window.requestAnimationFrame(updateNavigation);
        };

        window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true });
        window.addEventListener('resize', scheduleNavigationUpdate, { passive: true });
        window.addEventListener('load', scheduleNavigationUpdate, { once: true });
        scheduleNavigationUpdate();

        // No hidden elements or movement when a visitor requests less motion.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            !('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries, instance) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                instance.unobserve(entry.target);
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -36px 0px'
        });

        const observe = (element, delay = 0) => {
            if (!element || element.classList.contains('reveal-on-scroll')) return;
            element.classList.add('reveal-on-scroll');
            if (delay) element.style.setProperty('--reveal-delay', `${delay}ms`);
            observer.observe(element);
        };

        const observeGroup = (selector, stagger = 0) => {
            document.querySelectorAll(selector).forEach((element, index) => {
                observe(element, index * stagger);
            });
        };

        observeGroup('#about > div', 110);
        observeGroup('#stack > h2, #stack > p', 90);
        observeGroup('#stack > div.grid > div', 85);
        observeGroup('#contact > h2');
        observeGroup('#contact > div.grid > *', 90);
        observeGroup('footer');

        const archiveGrid = document.getElementById('archive-grid');
        if (archiveGrid) {
            observe(archiveGrid.previousElementSibling);

            // Project cards are generated after screenshots have preloaded.
            const observeArchiveCards = () => {
                [...archiveGrid.children].forEach((card, index) => {
                    observe(card, (index % 5) * 65);
                });
            };

            observeArchiveCards();
            if ('MutationObserver' in window) {
                new MutationObserver(observeArchiveCards).observe(archiveGrid, { childList: true });
            }
        }

        document.documentElement.classList.add('motion-ready');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMotion, { once: true });
    } else {
        initMotion();
    }
})();
