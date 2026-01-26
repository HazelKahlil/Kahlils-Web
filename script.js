
// --- 1. GLOBAL INITIALIZATION (Runs Once) ---
document.addEventListener('DOMContentLoaded', () => {
    beautifyURL(); // Clean up trailing slashes
    initTheme();
    initSnowSystem();
    initSoundSystem();
    refreshGlobalSounds(); // Initial Global Bind
    initBarba(); // Initialize SPA

    // Initial Page Load
    loadPageContent(document.querySelector('main'));
});

// --- URL BEAUTIFICATION (Pretty URLs) ---
function beautifyURL() {
    const path = window.location.pathname;
    if (path.length > 1 && path.endsWith('/')) {
        const cleanPath = path.slice(0, -1);
        history.replaceState(null, '', cleanPath + window.location.search);
    }
}

// --- 2. BARBA.JS CONFIGURATION (SPA Logic) ---
function initBarba() {
    // Check if Barba is loaded
    if (typeof barba === 'undefined') {
        console.warn('Barba.js not loaded. Falling back to standard navigation.');
        return;
    }

    barba.init({
        transitions: [{
            name: 'fade',
            leave(data) {
                return gsap.to(data.current.container, {
                    opacity: 0,
                    duration: 0.3
                });
            },
            enter(data) {
                // Prepare new container
                data.next.container.style.opacity = 0;
                return gsap.to(data.next.container, {
                    opacity: 1,
                    duration: 0.3
                });
            }
        }],
        views: []
    });

    // Hooks
    barba.hooks.beforeEnter((data) => {
        // Update Navigation Active State
        updateActiveNavLink(data.next.url.path);

        // Scroll to top
        window.scrollTo(0, 0);
    });

    barba.hooks.after((data) => {
        // Re-run page logic for the new container
        loadPageContent(data.next.container);
        refreshGlobalSounds(); // Re-bind for new content

        // Google Analytics / Scripts re-trigger if needed
    });
}

// Fallback for simple fading if GSAP isn't available (Barba has no default anims)
// Since we didn't add GSAP, let's use simple CSS class toggling or standard Barba promise
// Fallback for simple fading if GSAP isn't available (Barba has no default anims)
if (typeof gsap === 'undefined') {
    initBarba = function () {
        if (typeof barba === 'undefined') return;

        barba.init({
            transitions: [{
                name: 'default-transition',
                leave(data) {
                    return new Promise(resolve => {
                        data.current.container.style.opacity = 0;
                        data.current.container.style.transition = 'opacity 0.25s ease'; // Faster leave (250ms)
                        setTimeout(resolve, 250);
                    });
                },
                enter(data) {
                    data.next.container.style.opacity = 0;
                    data.next.container.style.transition = 'opacity 0.3s ease'; // Smooth enter
                    // Force reflow
                    void data.next.container.offsetWidth;
                    data.next.container.style.opacity = 1;
                    return new Promise(resolve => setTimeout(resolve, 300));
                }
            }]
        });

        barba.hooks.before((data) => {
            updateActiveNavLink(data.next.url.path);
            window.scrollTo(0, 0);
        });

        barba.hooks.after((data) => {
            loadPageContent(data.next.container);
            beautifyURL(); // Clean up URL after transition
        });
    };
}


// --- 3. PAGE CONTENT LOADER (Runs Every Transition) ---
let cachedData = null; // Memory Cache

function loadPageContent(container) {
    // A. Fade-in Observer for new elements
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // B. Protection
    container.querySelectorAll('img').forEach(img => {
        img.addEventListener('contextmenu', e => e.preventDefault());
        img.addEventListener('dragstart', e => e.preventDefault());
    });

    // C. Data Loading (Fetch with Cache)
    const namespace = container.dataset.barbaNamespace;

    const processData = (data) => {
        const projects = data.projects;
        const siteInfo = data.site || {};

        // Update Copyright
        const copyrightEl = document.querySelector('.copyright');
        if (copyrightEl && siteInfo.copyright) {
            const text = siteInfo.copyright;
            copyrightEl.innerHTML = text.toLowerCase().includes('copyright') ? text : `&copy; ${text}`;
        }

        // Update Body Class
        if (namespace === 'home') {
            document.body.classList.add('is-home');
        } else {
            document.body.classList.remove('is-home');
        }

        // Route Logic
        if (namespace === 'home') {
            populateHome(container, siteInfo.home_images);
        } else if (namespace === 'portfolios') { // Renamed from archive
            populateArchive(container, projects, observer);
        } else if (namespace === 'info') {
            populateBio(container, siteInfo);
        } else if (namespace === 'contact') {
            populateContact(container, siteInfo, projects);
        } else if (namespace === 'project' || window.location.pathname.includes('/project')) {
            populateProjectDetail(container, projects);
        }
        refreshGlobalSounds();
    };

    // Use Cache if available, otherwise fetch
    if (cachedData) {
        processData(cachedData);
    } else {
        fetch('/data.json?v=' + new Date().getTime()) // Keep timestamp for First Load only
            .then(response => response.json())
            .then(data => {
                cachedData = data; // Store in RAM
                processData(data);
            })
            .catch(err => console.error("Data load failed:", err));
    }
}

// --- 4. DATA POPULATION HELPER FUNCTIONS ---

function populateHome(container, images) {
    const heroGallery = container.querySelector('.hero-gallery');
    if (heroGallery && images && images.length > 0) {
        heroGallery.innerHTML = '';
        images.forEach((item, idx) => {
            const img = document.createElement('img');
            let rawSrc = typeof item === 'string' ? item : item.src;
            let src = rawSrc;
            if (src && !src.startsWith('http') && !src.startsWith('/')) src = '/' + src;
            // Cache bust local
            if (src && !src.startsWith('http')) src = encodeURI(src) + '?t=' + new Date().getTime();

            img.src = src;
            img.className = `hero-img img-${idx + 1}`;
            // img.loading = "lazy"; // REMOVED: Prefer eager load for hero content

            if (typeof item === 'object' && item.style) {
                Object.assign(img.style, item.style); // Simplified style assignment
                // Ensure percent units
                if (item.style.top && !String(item.style.top).includes('%')) img.style.top += '%';
                if (item.style.left && !String(item.style.left).includes('%')) img.style.left += '%';
                if (item.style.width && !String(item.style.width).includes('%')) img.style.width += '%';
            }
            heroGallery.appendChild(img);
        });
        refreshGlobalSounds();
    }
}

function populateArchive(container, projects, observer) {
    const grid = container.querySelector('.archive-grid');
    if (!grid) return;
    grid.innerHTML = '';

    projects.forEach((project, index) => {
        const card = document.createElement('a');
        card.href = `/project?id=${project.id}`;
        card.className = 'project-card';
        let rawPath = project.image.trim();
        if (!rawPath.startsWith('http') && !rawPath.startsWith('/')) rawPath = '/' + rawPath;
        const imagePath = encodeURI(rawPath);

        card.innerHTML = `
            <div class="project-thumb">
                <img src="${imagePath}" alt="${project.title}" loading="lazy">
            </div>
            <div class="project-info">
                <h2>${project.title}</h2>
                <span>${project.year}</span>
            </div>
        `;

        // Init styles for fade-in
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.8s ease, transform 0.8s ease-out';

        grid.appendChild(card);
        observer.observe(card);

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 + (index * 100));
    });
    refreshGlobalSounds();
}

function populateBio(container, siteInfo) {
    const textContainer = container.querySelector('.bio-text');
    if (textContainer && siteInfo.bio) textContainer.innerHTML = siteInfo.bio;

    const layoutContainer = container.querySelector('.bio-container');
    if (layoutContainer && siteInfo.bio_layout) {
        const bl = siteInfo.bio_layout;
        if (bl.padding_left) layoutContainer.style.paddingLeft = bl.padding_left + 'px';
        if (bl.width) layoutContainer.style.width = bl.width + '%';
        if (bl.max_width) layoutContainer.style.maxWidth = bl.max_width + 'px';
        if (bl.top) layoutContainer.style.paddingTop = bl.top + 'px';
    }
}

function populateContact(container, siteInfo, projects) {
    const infoSide = container.querySelector('.contact-info-side');
    const gallerySide = container.querySelector('.contact-gallery-side');

    // 1. Info Side
    if (infoSide) {
        infoSide.innerHTML = '';
        if (siteInfo.contact_items && Array.isArray(siteInfo.contact_items)) {
            siteInfo.contact_items.forEach(item => {
                const val = item.link ? `<a href="${item.link}" target="_blank" class="contact-link">${item.value}</a>` : `<span class="contact-link">${item.value}</span>`;
                infoSide.innerHTML += `<div class="contact-row"><span class="contact-label">${item.label}</span>${val}</div>`;
            });
        }
    }

    // 2. Gallery Side (Random Images)
    if (gallerySide) {
        gallerySide.innerHTML = '';

        let candidates = [];
        // Gather all images
        projects.forEach(p => {
            if (p.image) candidates.push({ src: p.image, id: p.id });
            if (p.gallery) p.gallery.forEach(g => candidates.push({ src: (typeof g === 'string' ? g : g.src), id: p.id }));
        });

        // Shuffle
        candidates.sort(() => Math.random() - 0.5);
        const selected = candidates.slice(0, 3);

        selected.forEach((item, idx) => {
            const wrapper = document.createElement(item.id ? 'a' : 'div');
            if (item.id) wrapper.href = `/project?id=${item.id}`;
            wrapper.className = 'contact-img-wrapper';
            wrapper.style.display = 'block';
            wrapper.style.width = '100%';

            const img = document.createElement('img');
            let src = item.src;
            if (src && !src.startsWith('http') && !src.startsWith('/')) src = '/' + src;
            img.src = src;
            img.className = 'contact-random-img';
            img.style.transitionDelay = `${idx * 0.2}s`;

            wrapper.appendChild(img);
            gallerySide.appendChild(wrapper);

            setTimeout(() => img.style.opacity = '1', 50);
        });
        refreshGlobalSounds();
    }
}

function populateProjectDetail(container, projects) {
    const content = container.querySelector('#project-content');
    if (!content) return;

    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    const project = projects.find(p => p.id === projectId);

    if (project) {
        document.title = `${project.title.toLowerCase()} | hazelkahlil`;

        // 1. Info Side HTML
        const descriptionHtml = project.description
            ? `<div class="project-desc">${project.description}</div>`
            : `<div class="project-desc"></div>`;

        // 2. Gallery Layout Styles
        let slideStyle = '';
        if (project.gallery_layout) {
            if (project.gallery_layout.width) slideStyle += `width: ${project.gallery_layout.width}%; `;
            if (project.gallery_layout.top) slideStyle += `position: relative; top: ${project.gallery_layout.top}%; `;
            if (project.gallery_layout.left) slideStyle += `position: relative; left: ${project.gallery_layout.left}%; `;
        }

        // 3. Slides HTML
        const images = project.gallery && project.gallery.length > 0 ? project.gallery : [project.image];
        let slidesHtml = '';
        images.forEach((imgItem, idx) => {
            let src = typeof imgItem === 'string' ? imgItem : imgItem.src;
            if (!src) return;
            if (!src.startsWith('http') && !src.startsWith('/')) src = '/' + src;
            let slideSrc = encodeURI(src);
            let metaText = (typeof imgItem === 'object' && imgItem.caption) ? imgItem.caption : "Location, Year, Subject";

            slidesHtml += `
                <div class="gallery-slide ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                    <figure class="slide-figure">
                        <div class="image-wrapper">
                            <img src="${slideSrc}" alt="${project.title} ${idx + 1}" style="${slideStyle}" loading="lazy">
                        </div>
                        <figcaption>${metaText}</figcaption>
                    </figure>
                </div>
            `;
        });

        // 4. Info Side Layout Styles
        let infoStyle = '';
        if (project.layout) {
            if (project.layout.top) infoStyle += `padding-top: ${project.layout.top}px; `;
            if (project.layout.left) infoStyle += `padding-left: ${project.layout.left}px; `;
            if (project.layout.width) infoStyle += `width: ${project.layout.width}%; `;
            if (project.layout.max_width) infoStyle += `max-width: ${project.layout.max_width}px; `;
        }

        // 5. Build Final HTML
        content.innerHTML = `
            <div class="project-split">
                <div class="project-info-side" style="${infoStyle}">
                    <h1 id="p-title">${project.title}</h1>
                    <div class="meta" id="p-year">${project.year}</div>
                    ${descriptionHtml}
                </div>
                <div class="project-gallery-side">
                    <div class="gallery-slider-container">
                        ${slidesHtml}
                        <div class="slider-nav-area nav-left"></div>
                        <div class="slider-nav-area nav-right"></div>
                    </div>
                    <button class="slider-arrow arrow-left" aria-label="Previous">‹</button>
                    <button class="slider-arrow arrow-right" aria-label="Next">›</button>
                </div>
                <div class="slider-counter">1 / ${images.length}</div>
            </div>
        `;

        // 6. Slider Interactivity
        let currentSlide = 0;
        const totalSlides = images.length;
        const slides = content.querySelectorAll('.gallery-slide');
        const counter = content.querySelector('.slider-counter');
        const navLeft = content.querySelector('.nav-left');
        const navRight = content.querySelector('.nav-right');
        const arrowLeft = content.querySelector('.arrow-left');
        const arrowRight = content.querySelector('.arrow-right');

        const updateSlider = (index, withSound = true) => {
            slides.forEach(s => s.classList.remove('active'));
            slides[index].classList.add('active');
            if (counter) counter.innerText = `${index + 1} / ${totalSlides}`;
            if (withSound) playSound('click');
        };

        if (navLeft) navLeft.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateSlider(currentSlide);
        });

        if (navRight) navRight.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateSlider(currentSlide);
        });

        if (arrowLeft) arrowLeft.addEventListener('click', (e) => {
            e.stopPropagation();
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateSlider(currentSlide);
        });

        if (arrowRight) arrowRight.addEventListener('click', (e) => {
            e.stopPropagation();
            currentSlide = (currentSlide + 1) % totalSlides;
            updateSlider(currentSlide);
        });

        // Click image to advance
        slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (img) {
                img.style.cursor = 'pointer';
                img.addEventListener('click', () => {
                    currentSlide = (currentSlide + 1) % totalSlides;
                    updateSlider(currentSlide);
                });
            }
        });

        // Touch Swipe
        const sliderContainer = content.querySelector('.gallery-slider-container');
        if (sliderContainer) {
            let touchStartX = 0;
            let touchEndX = 0;
            sliderContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            sliderContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const dist = touchEndX - touchStartX;
                if (Math.abs(dist) > 50) {
                    currentSlide = dist > 0 ? (currentSlide - 1 + totalSlides) % totalSlides : (currentSlide + 1) % totalSlides;
                    updateSlider(currentSlide);
                }
            }, { passive: true });
        }

        // Re-bind sounds for the new content
        content.querySelectorAll('h1, .gallery-slide img').forEach(el => bindSound(el));

    } else {
        content.innerHTML = `<h1>Project Not Found</h1><p>The requested project ID '${projectId}' does not exist.</p>`;
    }
}


// --- 5. INITIALIZATION HELPERS ---

function updateActiveNavLink(path) {
    // 1. Normalize current path (remove leading/trailing slashes and .html)
    let normalizedPath = path.split('?')[0].replace(/\/$/, '').replace('.html', '');
    if (normalizedPath === '' || normalizedPath === '/index') normalizedPath = '/';

    const navLinks = document.querySelectorAll('nav a');
    const nav = document.querySelector('nav');
    const indicator = document.querySelector('.nav-indicator');

    let activeLink = null;

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (!linkHref) return;

        // 2. Normalize link href
        let normalizedLink = linkHref.replace(/\/$/, '').replace('.html', '');
        if (normalizedLink === '' || normalizedLink === '/index') normalizedLink = '/';

        // 3. Match Logic (Exact or Parent)
        const isActive = (normalizedLink === normalizedPath);

        if (isActive) {
            link.classList.add('active');
            activeLink = link;
        } else {
            link.classList.remove('active');
        }

        // Hover Logic for Sliding Indicator
        if (nav && indicator) {
            link.addEventListener('mouseenter', () => {
                moveIndicator(link, nav, indicator);
            });
        }
    });

    // Reset on Nav Leave
    if (nav && indicator) {
        nav.addEventListener('mouseleave', () => {
            if (activeLink) moveIndicator(activeLink, nav, indicator);
        });

        // Initial Position
        if (activeLink) {
            // Small delay to ensure layout is ready or if fonts are loading
            setTimeout(() => moveIndicator(activeLink, nav, indicator), 50);

            // Re-calculate on resize
            window.addEventListener('resize', () => moveIndicator(activeLink, nav, indicator));
        }
    }
}

function moveIndicator(targetLink, navContainer, indicatorLine) {
    if (!targetLink || !navContainer || !indicatorLine) return;

    const navRect = navContainer.getBoundingClientRect();
    const targetRect = targetLink.getBoundingClientRect();

    indicatorLine.style.width = `${targetRect.width}px`;
    indicatorLine.style.transform = `translateX(${targetRect.left - navRect.left}px)`;
}

// Global Sound Re-binding (Nav, Socials, etc)
function refreshGlobalSounds() {
    soundSelectors.forEach(({ sel, type }) => {
        document.querySelectorAll(sel).forEach(el => bindSound(el));
    });
}


// --- 7. SOUND FX SYSTEM ---
let soundAssets = {};

function initSoundSystem() {
    soundAssets = {
        click: new Audio('assets/sounds/text_custom.mp3'),
        shutter: new Audio('assets/sounds/image_custom.mp3')
    };
    // Preload & Config
    Object.values(soundAssets).forEach(s => {
        s.volume = 0.2; // Subtle volume
        s.load();
    });
}

function playSound(type) {
    const s = soundAssets[type];
    if (s) {
        s.currentTime = 0;
        s.play().catch(() => { }); // Ignore interaction errors
    }
}

const soundSelectors = [
    { sel: 'nav a, .social-icons a, .contact-link, .tab-btn, #p-title, .project-info-side h1, .brand h1, #snow-toggle', type: 'click' },
    { sel: '.hero-img, .project-card, .contact-img-wrapper, .contact-random-img, .project-thumb img', type: 'shutter' }
];

function bindSound(el) {
    if (el.dataset.soundBound) return;
    soundSelectors.forEach(({ sel, type }) => {
        if (el.matches(sel)) {
            el.addEventListener('mouseenter', () => playSound(type));
            el.dataset.soundBound = "true";
        }
    });
}

function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

    if (toggleBtn) {
        toggleBtn.onclick = () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);

            // Spin Icon
            const icon = document.getElementById('theme-icon');
            if (icon) {
                icon.classList.remove('icon-spin');
                void icon.offsetWidth;
                icon.classList.add('icon-spin');
            }

            // Update Snow Color
            updateSnowColor();
        };
    }
}

let snowColor = 'rgba(173, 216, 230, 0.7)';
function updateSnowColor() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    snowColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(173, 216, 230, 0.7)';
}

function initSnowSystem() {
    const btn = document.getElementById('snow-toggle');
    if (!btn) return;

    let isSnowing = localStorage.getItem('isSnowing') === 'true';
    let canvas, ctx, flakes, raf;

    function start() {
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.style.position = 'fixed';
            canvas.style.top = '0'; canvas.style.left = '0';
            canvas.style.width = '100%'; canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '99999';
            document.body.appendChild(canvas);
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            window.onresize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
            flakes = Array.from({ length: 150 }, () => ({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                r: Math.random() * 2 + 1, s: Math.random() * 1 + 0.5
            }));
        }
        canvas.style.display = 'block';
        ctx = canvas.getContext('2d');
        btn.classList.add('active');
        loop();
    }

    function stop() {
        if (canvas) canvas.style.display = 'none';
        btn.classList.remove('active');
        cancelAnimationFrame(raf);
    }

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = snowColor;
        ctx.beginPath();
        flakes.forEach(f => {
            ctx.moveTo(f.x, f.y);
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            f.y += f.s;
            if (f.y > canvas.height) f.y = 0;
        });
        ctx.fill();
        raf = requestAnimationFrame(loop);
    }

    btn.onclick = () => {
        isSnowing = !isSnowing;
        localStorage.setItem('isSnowing', isSnowing);
        isSnowing ? start() : stop();
    };

    if (isSnowing) start();
}
