const IMAGES = [
    { 
        src: 'images/Xmas.jpg', 
        bg: '#0b132b',          
        panel: '#1c2541',       
        glow: '#2563eb',        
        tag: 'PROJECT 01',
        title: 'N-Insights Christmas Greeting Card',
        desc: 'A bespoke, high-end digital greeting experience crafted for N-Insights. This project reimagines traditional holiday cards by transforming them into an interactive digital event. Built with a mobile-first philosophy, it combines tactile 3D realism, elegant typography, and perfectly synchronized sensory feedback to deliver a memorable family greeting.',
        link: 'https://1erdna.github.io/christmas/',
        // Easily extend this array to showcase multiple mockups per project inside your detail window
        screenshots: ['images/Xmas.jpg'],
        techStack: ['HTML5', 'CSS3 Canvas', 'JavaScript ES6', 'Web Audio API Engine', 'Mobile-First UI/UX']
    },
    { 
        src: 'images/PingPongPro.jpg', 
        bg: '#0d0e15', 
        panel: '#1a1c28', 
        glow: '#3b82f6',
        tag: 'PROJECT 02',
        title: 'PingPongPro Tracker',
        desc: 'An application that visualizes monthly spending. Focused on data structures, analytical rendering metrics, and persistent local client engine validation structures.',
        link: '#',
        screenshots: ['images/PingPongPro.jpg'],
        techStack: ['React Native', 'TailwindCSS', 'Local Storage Engine', 'Data Parsers']
    },
    { 
        src: 'images/Quench/QuenchLandingPage.jpg', 
        bg: '#110c24', 
        panel: '#1f183a', 
        glow: '#6366f1',
        tag: 'PROJECT 03',
        title: 'POS SYSTEM - Quench Water Refilling Station',
        desc: 'Quench is a modern, high-performance Point-of-Sale (POS) and inventory monitoring terminal custom-tailored for water refilling operations. It introduces a clean, distraction-free corporate dashboard UI designed to minimize administrative overhead. The system features a responsive role-based design layout that bridges the gap between fast-paced counter checkout pipelines and strict backend resource auditing. Operators can execute sales, trace delivery fulfillment statuses, monitor container loans, and track physical supply balances from a single, centralized data hub.',
        link: 'https://1erdna.github.io/POS---Quench-Water-Refilling-Station/',
        screenshots: ['images/Quench/QuenchLandingPage.jpg', 'images/Quench/Quench.jpg', 'images/Quench/NewSaleQuench.jpg', 'images/Quench/InventoryStockTracker.jpg' ,'images/Quench/QuenchLandingPage.jpg', 'images/Quench/Customers.jpg' ,'images/Quench/Receipt.jpg' ],
        techStack: ['Tailwind CSS v4 Engine', 'Vanilla ES6+ JavaScript', 'Component-Driven Architecture', 'Asynchronous Local State Synchronization', 'Responsive UI Layout Engine']
    },
    { 
        src: 'images/LibReserve.jpg', 
        bg: '#07162c', 
        panel: '#0f2b48', 
        glow: '#1d4ed8',
        tag: 'PROJECT 04',
        title: 'Library Reserve',
        desc: 'A robust asset tracking assignment system custom built to optimize real-time corporate validation tracking maps smoothly.',
        link: '#',
        screenshots: ['images/LibReserve.jpg'],
        techStack: ['TypeScript', 'TailwindCSS Component Suite', 'Context State Architecture']
    }
];

class WorkspaceCarousel {
    constructor() {
        this.activeIndex = 0;
        this.isTransitionLocked = false;
        this.isMobile = window.innerWidth < 768;
        this.lockoutDuration = 650; 
        
        this.container = document.getElementById('carousel-container');
        this.glowElement = document.getElementById('carousel-glow');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');

        // Modal Specific Node Bindings
        this.modal = document.getElementById('project-modal');
        this.modalContent = document.getElementById('modal-content');
        this.modalCloseBtn = document.getElementById('modal-close');

        if (!this.container) return;

        this.init();
    }

    async init() {
        await this.preloadImages();
        this.buildSlidesHTML();
        this.buildArchiveHTML();
        this.attachResizeEngine();
        this.bindInputControls();
        this.bindModalWindowControls();
        this.updateStateMatrix();
    }

    preloadImages() {
        const promises = IMAGES.map(item => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = item.src;
                img.onload = resolve;
                img.onerror = resolve; 
            });
        });
        return Promise.all(promises);
    }

    buildSlidesHTML() {
        this.container.innerHTML = '';
        IMAGES.forEach((data, index) => {
            const card = document.createElement('div');
            card.className = `carousel-card absolute w-full max-w-[300px] md:max-w-[420px] h-[460px] md:h-[480px] rounded-[32px] p-6 flex flex-col justify-between cursor-pointer border select-none`;
            card.dataset.index = index;
            card.style.backgroundColor = data.bg;

            card.innerHTML = `
                <div class="w-full h-3/5 rounded-2xl flex items-center justify-center p-4 overflow-hidden border border-white/5 transition-transform duration-300 hover:scale-[1.01]" style="background-color: ${data.panel}">
                    <img src="${data.src}" alt="${data.title}" class="max-w-full max-h-full object-contain filter drop-shadow-2xl select-none pointer-events-none">
                </div>
                <div class="mt-4 flex flex-col gap-2 flex-grow justify-end pb-2">
                    <span class="font-['Anton'] tracking-wider text-sm text-blue-400 opacity-80">${data.tag}</span>
                    <h3 class="font-['Anton'] text-2xl md:text-3xl uppercase tracking-tight leading-none text-white">${data.title}</h3>
                    <p class="text-xs font-normal text-gray-400 leading-relaxed font-sans line-clamp-2">${data.desc}</p>
                </div>
            `;
            
            card.addEventListener('click', () => this.handleDirectCardClick(index));
            this.container.appendChild(card);
        });
    }

    buildArchiveHTML() {
        const archiveGrid = document.getElementById('archive-grid');
        if (!archiveGrid) return;
        
        archiveGrid.innerHTML = '';
        IMAGES.forEach((data, index) => {
            const item = document.createElement('div');
            item.className = `group cursor-pointer flex flex-col gap-2 p-2 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all duration-300`;
            item.dataset.index = index;

            item.innerHTML = `
                <div class="w-full aspect-[4/3] rounded-xl overflow-hidden bg-white/[0.02] border border-white/5 p-2 flex items-center justify-center">
                    <img src="${data.src}" alt="${data.title}" class="max-w-full max-h-full object-contain filter drop-shadow-md select-none pointer-events-none transition-all duration-300">
                </div>
                <div class="px-1 py-1">
                    <p class="text-[10px] font-['Anton'] text-blue-400/60 uppercase tracking-wider">${data.tag}</p>
                    <h4 class="text-xs font-bold text-gray-400 truncate group-hover:text-white transition-colors">${data.title}</h4>
                </div>
            `;

            item.addEventListener('click', () => {
                if (this.isTransitionLocked) return;
                if (this.activeIndex === index) {
                    this.openProjectDetailsModal(index);
                } else {
                    this.activeIndex = index;
                    this.updateStateMatrix();
                }
            });

            archiveGrid.appendChild(item);
        });
    }

    updateStateMatrix() {
        const total = IMAGES.length;
        const cards = this.container.querySelectorAll('.carousel-card');

        if (this.glowElement) {
            this.glowElement.style.backgroundColor = IMAGES[this.activeIndex].glow;
        }

        const discoverLink = document.getElementById('project-marquee-link');
        if (discoverLink) {
            const currentLink = IMAGES[this.activeIndex].link || '#';
            discoverLink.href = currentLink;
            if (currentLink === '#') {
                discoverLink.removeAttribute('target');
                discoverLink.style.opacity = '0.4';
                discoverLink.style.pointerEvents = 'none';
            } else {
                discoverLink.setAttribute('target', '_blank');
                discoverLink.style.opacity = '1';
                discoverLink.style.pointerEvents = 'auto';
            }
        }

        cards.forEach((card) => {
            const index = parseInt(card.dataset.index);
            
            card.classList.remove('card-center', 'card-left', 'card-right', 'card-back');
            card.classList.remove('border-blue-500/40', 'border-white/10');

            if (index === this.activeIndex) {
                card.classList.add('card-center', 'border-blue-500/40');
            } else if (index === (this.activeIndex - 1 + total) % total) {
                card.classList.add('card-left', 'border-white/10');
            } else if (index === (this.activeIndex + 1) % total) {
                card.classList.add('card-right', 'border-white/10');
            } else {
                card.classList.add('card-back', 'border-white/10');
            }
        });

        const archiveItems = document.querySelectorAll('#archive-grid > div');
        archiveItems.forEach((item) => {
            const index = parseInt(item.dataset.index);
            const img = item.querySelector('img');
            if (index === this.activeIndex) {
                item.classList.add('border-blue-500/40', 'bg-blue-950/20');
                if (img) img.classList.remove('opacity-40');
            } else {
                item.classList.remove('border-blue-500/40', 'bg-blue-950/20');
                if (img) img.classList.add('opacity-40');
            }
        });
    }

    navigate(direction) {
        if (this.isTransitionLocked) return;
        
        this.isTransitionLocked = true;
        const total = IMAGES.length;

        if (direction === 'next') {
            this.activeIndex = (this.activeIndex + 1) % total;
        } else if (direction === 'prev') {
            this.activeIndex = (this.activeIndex - 1 + total) % total;
        }

        this.updateStateMatrix();

        setTimeout(() => {
            this.isTransitionLocked = false;
        }, this.lockoutDuration);
    }

    handleDirectCardClick(clickedIndex) {
        if (this.isTransitionLocked) return;
        
        const total = IMAGES.length;
        if (clickedIndex === this.activeIndex) {
            // Clicked active centered item -> Open its screenshots and detail specifications
            this.openProjectDetailsModal(clickedIndex);
        } else if (clickedIndex === (this.activeIndex + 1) % total) {
            this.navigate('next');
        } else if (clickedIndex === (this.activeIndex - 1 + total) % total) {
            this.navigate('prev');
        }
    }

    // --- Dynamic Spec/Modal Engine Methods ---
    openProjectDetailsModal(index) {
        const data = IMAGES[index];
        if (!this.modal || !data) return;

        // Map Content Variables 
        document.getElementById('modal-main-img').src = data.src;
        document.getElementById('modal-tag').innerText = data.tag;
        document.getElementById('modal-title').innerText = data.title;
        document.getElementById('modal-desc').innerText = data.desc;

        // Render Specs Tags
        const specsBox = document.getElementById('modal-specs-box');
        specsBox.innerHTML = '';
        if (data.techStack) {
            data.techStack.forEach(tech => {
                const tagEl = document.createElement('span');
                tagEl.className = 'bg-white/5 border border-white/5 text-gray-400 text-[11px] font-medium px-2.5 py-1 rounded-md';
                tagEl.innerText = tech;
                specsBox.appendChild(tagEl);
            });
        }

        // Render Screenshots Preview Row Track
        const thumbsTrack = document.getElementById('modal-thumbs-track');
        thumbsTrack.innerHTML = '';
        const previewImages = data.screenshots || [data.src];

        previewImages.forEach((imgSrc, i) => {
            const thumbBtn = document.createElement('button');
            thumbBtn.className = `w-16 h-12 rounded-lg overflow-hidden border p-1 bg-white/[0.02] flex-shrink-0 transition-all ${i === 0 ? 'border-blue-500 bg-blue-950/20' : 'border-white/5 opacity-60 hover:opacity-100'}`;
            thumbBtn.innerHTML = `<img src="${imgSrc}" class="w-full h-full object-contain">`;
            
            thumbBtn.addEventListener('click', () => {
                document.getElementById('modal-main-img').src = imgSrc;
                thumbsTrack.querySelectorAll('button').forEach(btn => btn.classList.remove('border-blue-500', 'bg-blue-950/20'));
                thumbBtn.classList.add('border-blue-500', 'bg-blue-950/20');
            });
            thumbsTrack.appendChild(thumbBtn);
        });

        // Map Action URL Button
        const actionBtn = document.getElementById('modal-action-btn');
        if (data.link && data.link !== '#') {
            actionBtn.href = data.link;
            actionBtn.style.display = 'flex';
        } else {
            actionBtn.style.display = 'none';
        }

        // Trigger Layout Entrance State Matrix Animation
        this.modal.classList.remove('opacity-0', 'pointer-events-none');
        this.modalContent.classList.remove('opacity-0', 'scale-95');
        document.body.style.overflow = 'hidden'; // Freeze viewport parsing underneath
    }

    closeProjectDetailsModal() {
        if (!this.modal) return;
        this.modal.classList.add('opacity-0', 'pointer-events-none');
        this.modalContent.classList.add('opacity-0', 'scale-95');
        document.body.style.overflow = ''; // Unfreeze client workflow mechanics
    }

    bindInputControls() {
        this.prevBtn.addEventListener('click', () => this.navigate('prev'));
        this.nextBtn.addEventListener('click', () => this.navigate('next'));

        document.addEventListener('keydown', (e) => {
            const section = document.getElementById('projects');
            if (!section) return;
            const sectionBounds = section.getBoundingClientRect();
            const isInViewport = (sectionBounds.top >= -window.innerHeight && sectionBounds.bottom <= window.innerHeight * 2);
            
            if (isInViewport && !this.modal.classList.contains('pointer-events-none')) {
                if (e.key === 'Escape') this.closeProjectDetailsModal();
            } else if (isInViewport) {
                if (e.key === 'ArrowLeft') this.navigate('prev');
                if (e.key === 'ArrowRight') this.navigate('next');
            }
        });
    }

    bindModalWindowControls() {
        if (!this.modalCloseBtn || !this.modal) return;
        this.modalCloseBtn.addEventListener('click', () => this.closeProjectDetailsModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeProjectDetailsModal();
        });
    }

    attachResizeEngine() {
        window.addEventListener('resize', () => {
            const currentMobileState = window.innerWidth < 768;
            if (currentMobileState !== this.isMobile) {
                this.isMobile = currentMobileState;
                this.updateStateMatrix(); 
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    new WorkspaceCarousel();
});
