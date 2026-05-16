// =========================================================================
// 1. CAROUSEL PROJECT DATABASE
// =========================================================================
// Customize this array to change your projects. 
// Place your project screenshots into your root 'images/' folder and update the filenames here.
const IMAGES = [
    { 
        src: 'images/Xmas.jpg', 
        bg: '#0b132b',          // Card overall background color
        panel: '#1c2541',       // Behind-the-photo card container color
        glow: '#2563eb',        // Ambient neon backdrop glow color
        tag: 'PROJECT 01',
        title: 'N-Insights Christmas Greeting Card',
        desc: 'A luxury digital interaction project featuring a virtual envelope reveal system with dynamic custom gold dust particles.',
        link: 'https://1erdna.github.io/christmas/' // URL used by the marquee link
    },
    { 
        src: 'images/PingPongPro.jpg', // Change this to your second image file
        bg: '#0d0e15', 
        panel: '#1a1c28', 
        glow: '#3b82f6',
        tag: 'PROJECT 02',
        title: 'PingPongPro Tracker',
        desc: 'An application that visualizes monthly spending. Focused on data structures and local storage.',
        link: '#' 
    },
    { 
        src: 'images/Quench.jpg', // Change this to your third image file
        bg: '#110c24', 
        panel: '#1f183a', 
        glow: '#6366f1',
        tag: 'PROJECT 03',
        title: 'POS SYSTEM - Quench Water Refilling Station',
        desc: 'An interactive chatbot integration connected directly to natural language processing models.',
        link: '#' 
    },
    { 
        src: 'images/LibReserve.jpg', // Change this to your fourth image file
        bg: '#07162c', 
        panel: '#0f2b48', 
        glow: '#1d4ed8',
        tag: 'PROJECT 04',
        title: 'Library Reserve',
        desc: 'A robust management layout designed for modern workplace asset tracking and assignments.',
        link: '#' 
    }
];

// =========================================================================
// 2. 3D CAROUSEL CORE WORKSPACE ENGINE
// =========================================================================
class WorkspaceCarousel {
    constructor() {
        this.activeIndex = 0;
        this.isTransitionLocked = false;
        this.isMobile = window.innerWidth < 768;
        this.lockoutDuration = 650; // Millisecond lock matches CSS animation length
        
        // Grab layout nodes from index.html stage
        this.container = document.getElementById('carousel-container');
        this.glowElement = document.getElementById('carousel-glow');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');

        if (!this.container) return;

        this.init();
    }

    async init() {
        // Enforce asynchronous absolute-image preloading criteria on setup mount
        await this.preloadImages();
        this.buildSlidesHTML();
        this.attachResizeEngine();
        this.bindInputControls();
        this.updateStateMatrix();
    }

    // Preloads photos before displaying the stage to prevent flickering elements
    preloadImages() {
        const promises = IMAGES.map(item => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = item.src;
                img.onload = resolve;
                img.onerror = resolve; // Continue execution gracefully if any path fails
            });
        });
        return Promise.all(promises);
    }

    // Programmatically generates and injects your HTML cards using the data array
    buildSlidesHTML() {
        this.container.innerHTML = '';
        IMAGES.forEach((data, index) => {
            const card = document.createElement('div');
            card.className = `carousel-card absolute w-full max-w-[340px] md:max-w-[420px] h-[480px] rounded-[32px] p-6 flex flex-col justify-between cursor-pointer border select-none`;
            card.dataset.index = index;
            card.style.backgroundColor = data.bg;

            card.innerHTML = `
                <div class="w-full h-3/5 rounded-2xl flex items-center justify-center p-4 overflow-hidden border border-white/5" style="background-color: ${data.panel}">
                    <img src="${data.src}" alt="${data.title}" class="max-w-full max-h-full object-contain filter drop-shadow-2xl select-none pointer-events-none">
                </div>
                <div class="mt-4 flex flex-col gap-2 flex-grow justify-end pb-2">
                    <span class="font-['Anton'] tracking-wider text-sm text-blue-400 opacity-80">${data.tag}</span>
                    <h3 class="font-['Anton'] text-3xl uppercase tracking-tight leading-none text-white">${data.title}</h3>
                    <p class="text-xs font-normal text-gray-400 leading-relaxed font-sans line-clamp-2">${data.desc}</p>
                </div>
            `;
            
            card.addEventListener('click', () => this.handleDirectCardClick(index));
            this.container.appendChild(card);
        });
    }

    // Evaluates visual rules (center, left, right, back) and color styling relative to active index
    updateStateMatrix() {
        const total = IMAGES.length;
        const cards = this.container.querySelectorAll('.carousel-card');

        // Cycle matching neon ambient glow parameters behind the deck
        if (this.glowElement) {
            this.glowElement.style.backgroundColor = IMAGES[this.activeIndex].glow;
        }

        // Dynamically update the destination path of the "DISCOVER IT" marquee link button
        const discoverLink = document.querySelector('#projects a');
        if (discoverLink) {
            discoverLink.href = IMAGES[this.activeIndex].link || '#';
        }

        cards.forEach((card) => {
            const index = parseInt(card.dataset.index);
            
            // Clear current positional state tokens
            card.classList.remove('card-center', 'card-left', 'card-right', 'card-back');
            card.classList.remove('border-blue-500/40', 'border-white/10');

            // Apply 3D coordinate transformation metrics
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
    }

    // Handles index movement commands with state transition locks
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

        // Release lock mechanism after cubic-bezier timing ends
        setTimeout(() => {
            this.isTransitionLocked = false;
        }, this.lockoutDuration);
    }

    // Allows clicking side cards directly to shift to them
    handleDirectCardClick(clickedIndex) {
        if (clickedIndex === this.activeIndex || this.isTransitionLocked) return;
        
        const total = IMAGES.length;
        if (clickedIndex === (this.activeIndex + 1) % total) {
            this.navigate('next');
        } else if (clickedIndex === (this.activeIndex - 1 + total) % total) {
            this.navigate('prev');
        }
    }

    // Binds navigation hardware triggers (Buttons + Keyboard)
    bindInputControls() {
        this.prevBtn.addEventListener('click', () => this.navigate('prev'));
        this.nextBtn.addEventListener('click', () => this.navigate('next'));

        document.addEventListener('keydown', (e) => {
            const section = document.getElementById('projects');
            if (!section) return;
            const sectionBounds = section.getBoundingClientRect();
            // Check if user is looking at the projects section before stealing key inputs
            const isInViewport = (sectionBounds.top >= -window.innerHeight && sectionBounds.bottom <= window.innerHeight * 2);
            
            if (isInViewport) {
                if (e.key === 'ArrowLeft') this.navigate('prev');
                if (e.key === 'ArrowRight') this.navigate('next');
            }
        });
    }

    // Checks and corrects coordinates during live window changes
    attachResizeEngine() {
        window.addEventListener('resize', () => {
            const currentMobileState = window.innerWidth < 768;
            if (currentMobileState !== this.isMobile) {
                this.isMobile = currentMobileState;
                this.updateStateMatrix(); // Fire layout alignment re-evaluation pass
            }
        });
    }
}

// =========================================================================
// 3. GLOBAL APPLICATION INITIALIZER
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Process icon fallbacks
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    // Launch Carousel Engine Instance
    new WorkspaceCarousel();
});