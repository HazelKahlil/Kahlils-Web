
document.addEventListener('DOMContentLoaded', () => {

    // --- SNOW EFFECT SYSTEM (AI Studio Style) ---
    const initSnowSystem = () => {
        const btn = document.getElementById('snow-toggle');
        if (!btn) return;

        let isSnowing = false;
        let snowCanvas = null;
        let ctx = null;
        let flakes = [];
        let animationFrame = null;

        function createFlake() {
            return {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                radius: Math.random() * 2 + 1,
                speed: Math.random() * 1 + 0.5,
                wind: Math.random() * 0.5 - 0.25
            };
        }

        function drawSnow() {
            if (!ctx) return;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.fillStyle = 'rgba(173, 216, 230, 0.7)'; // Light Blue Snow
            ctx.beginPath();
            flakes.forEach(f => {
                ctx.moveTo(f.x, f.y);
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
            });
            ctx.fill();
            updateSnow();
            animationFrame = requestAnimationFrame(drawSnow);
        }

        function updateSnow() {
            flakes.forEach(f => {
                f.y += f.speed;
                f.x += f.wind;
                if (f.y > window.innerHeight) f.y = 0;
                if (f.x > window.innerWidth) f.x = 0;
                if (f.x < 0) f.x = window.innerWidth;
            });
        }

        function startSnowing() {
            isSnowing = true;
            if (btn) btn.classList.add('active');

            if (!snowCanvas) {
                snowCanvas = document.createElement('canvas');
                snowCanvas.id = 'snow-canvas';
                snowCanvas.style.position = 'fixed';
                snowCanvas.style.top = '0';
                snowCanvas.style.left = '0';
                snowCanvas.style.width = '100%';
                snowCanvas.style.height = '100%';
                snowCanvas.style.pointerEvents = 'none';
                snowCanvas.style.zIndex = '99999';
                document.body.appendChild(snowCanvas);

                snowCanvas.width = window.innerWidth;
                snowCanvas.height = window.innerHeight;
                window.addEventListener('resize', () => {
                    snowCanvas.width = window.innerWidth;
                    snowCanvas.height = window.innerHeight;
                });
            }

            ctx = snowCanvas.getContext('2d');
            snowCanvas.style.display = 'block';
            flakes = Array.from({ length: 190 }, createFlake);
            drawSnow();
        }

        function stopSnowing() {
            isSnowing = false;
            if (btn) btn.classList.remove('active');
            if (snowCanvas) snowCanvas.style.display = 'none';
            if (animationFrame) cancelAnimationFrame(animationFrame);
        }

        const handleToggle = () => {
            if (isSnowing) {
                stopSnowing();
                localStorage.setItem('isSnowing', 'false');
            } else {
                startSnowing();
                localStorage.setItem('isSnowing', 'true');
            }
        };

        btn.onclick = handleToggle;

        const savedState = localStorage.getItem('isSnowing');
        if (savedState === 'true') {
            startSnowing();
        }
    };

    initSnowSystem();

    // --- SOUND FX SYSTEM ---
    const soundAssets = {
        click: new Audio('assets/sounds/text_custom.mp3'),
        shutter: new Audio('assets/sounds/image_custom.mp3')
    };
    // Preload & Config
    Object.values(soundAssets).forEach(s => {
        s.volume = 0.2; // Subtle volume
        s.load();
    });

    const playSound = (type) => {
        const s = soundAssets[type];
        if (s) {
            s.currentTime = 0;
            s.play().catch(() => { }); // Ignore interaction errors
        }
    };

    // Selectors mapping
    const soundSelectors = [
        { sel: 'nav a, .social-icons a, .contact-link, .tab-btn, #p-title, .project-info-side h1', type: 'click' },
        { sel: '.hero-img, .project-card, .contact-img-wrapper, .contact-random-img', type: 'shutter' }
    ];

    const bindSound = (el) => {
        if (el.dataset.soundBound) return;
        soundSelectors.forEach(({ sel, type }) => {
            if (el.matches(sel)) {
                el.addEventListener('mouseenter', () => playSound(type));
                el.dataset.soundBound = "true";
            }
        });
    };

    // 1. Observer for dynamic content
    const soundObserver = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    bindSound(node);
                    // Check descendants
                    const allSelectors = soundSelectors.map(s => s.sel).join(',');
                    node.querySelectorAll(allSelectors).forEach(bindSound);
                }
            });
        });
    });
    soundObserver.observe(document.body, { childList: true, subtree: true });

    // 2. Initial Bind for static content
    const allSelectors = soundSelectors.map(s => s.sel).join(',');
    document.querySelectorAll(allSelectors).forEach(bindSound);

    // --- END SOUND FX ---

    // 1. Fade-in for Main Content (Handled by CSS animation 'fadeIn' on <main>, but let's add staggered reveal for grid items)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Target generic grid items or project cards
    const revealElements = document.querySelectorAll('.project-card, .bio-text p, .contact-row');

    revealElements.forEach((el, index) => {
        // Set initial state via JS to ensure graceful degradation if JS fails
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease-out';

        // Stagger delay slightly based on index (resetting delay for large groups not necessary for simple effect)
        // We can just imply a natural stagger by scroll, but let's add a tiny fixed delay
        // to make the initial load feel "cascading"
        // el.style.transitionDelay = `${(index % 5) * 0.1}s`; // Optional

        observer.observe(el);
    });

    // 4. Load Data (Projects & Site Info)
    const activePage = window.location.pathname.split('/').pop();

    // PROTECTION: Disable Right Click on Images
    document.addEventListener('contextmenu', function (e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    }, false);

    // PROTECTION: Disable Dragging
    document.addEventListener('dragstart', function (e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });

    fetch('data.json?v=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            const projects = data.projects;
            const siteInfo = data.site || {};

            // A. Update Global Site Info (Title, Copyright) if elements exist
            const copyrightEl = document.querySelector('.copyright');
            if (copyrightEl && siteInfo.copyright) {
                // If copyright text already contains 'copyright', don't add ©
                // If it's just a year or name, prepend ©
                const text = siteInfo.copyright;
                if (text.toLowerCase().includes('copyright')) {
                    copyrightEl.innerHTML = text;
                } else {
                    copyrightEl.innerHTML = `&copy; ${text}`;
                }
            }

            // Header Socials
            const socialLinks = document.querySelectorAll('.social-icons a');
            if (socialLinks.length >= 3) {
                if (siteInfo.header_social_instagram) socialLinks[0].href = siteInfo.header_social_instagram;
                if (siteInfo.header_social_link) socialLinks[1].href = siteInfo.header_social_link;
                if (siteInfo.header_social_email) {
                    let email = siteInfo.header_social_email;
                    if (!email.startsWith('mailto:')) email = 'mailto:' + email;
                    socialLinks[2].href = email;
                }
            }

            // --- HOMEPAGE SPECIFIC LOGIC ---
            const heroGallery = document.querySelector('.hero-gallery');
            if (heroGallery && siteInfo.home_images && Array.isArray(siteInfo.home_images)) {
                const images = siteInfo.home_images;
                if (images.length > 0) {
                    heroGallery.innerHTML = '';
                    images.forEach((item, idx) => {
                        const img = document.createElement('img');

                        // Handle both legacy (string) and new (object) formats
                        let src = typeof item === 'string' ? item : item.src;

                        // Cache bust local images
                        let finalSrc = src;
                        if (src && !src.startsWith('http')) {
                            let time = new Date().getTime();
                            // Encode the path to handle spaces safely
                            finalSrc = encodeURI(src) + '?t=' + time;
                        }
                        img.src = finalSrc;
                        img.className = `hero-img img-${idx + 1}`;
                        img.alt = ""; // Empty alt for decorative
                        img.loading = "lazy"; // Lazy load for performance

                        // Apply Dynamic Layout (Overrides CSS defaults)
                        if (typeof item === 'object' && item.style) {
                            if (item.style.top) img.style.top = item.style.top + '%';
                            if (item.style.left) img.style.left = item.style.left + '%';
                            if (item.style.width) img.style.width = item.style.width + '%';
                        }

                        heroGallery.appendChild(img);
                    });
                }
            }
            // -------------------------------

            // B. Route: Archive Page
            const archiveGrid = document.querySelector('.archive-grid');
            if (archiveGrid) {
                archiveGrid.innerHTML = '';
                projects.forEach((project, index) => {
                    const card = document.createElement('a');
                    card.href = `project.html?id=${project.id}`; // Link to detail page
                    card.className = 'project-card';
                    // Handle spaces in project images too
                    const imagePath = encodeURI(project.image.trim());
                    card.innerHTML = `
                        <div class="project-thumb">
                            <img src="${imagePath}" alt="${project.title}" loading="lazy">
                        </div>
                        <div class="project-info">
                            <h2>${project.title}</h2>
                            <span>${project.year}</span>
                        </div>
                    `;
                    // Styles for fade-in
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.style.transition = 'opacity 0.8s ease, transform 0.8s ease-out';
                    archiveGrid.appendChild(card);
                    observer.observe(card);
                    // Fallback visibility
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 200 + (index * 100));
                });
            }

            // C. Route: Project Detail Page
            const projectContent = document.getElementById('project-content');
            if (projectContent) {
                const urlParams = new URLSearchParams(window.location.search);
                const projectId = urlParams.get('id');
                const project = projects.find(p => p.id === projectId);

                if (project) {
                    if (document.title) document.title = `${project.title} | HAZEL KAHLIL`;

                    // Generate Split Layout HTML
                    // 1. Info Side
                    const descriptionHtml = project.description
                        ? `<div class="project-desc">${project.description}</div>`
                        : `<div class="project-desc"></div>`;

                    // Gallery Layout (Unified)
                    let slideStyle = '';
                    if (project.gallery_layout) {
                        if (project.gallery_layout.width) slideStyle += `width: ${project.gallery_layout.width}%; `;
                        if (project.gallery_layout.top) slideStyle += `position: relative; top: ${project.gallery_layout.top}%; `;
                        if (project.gallery_layout.left) slideStyle += `position: relative; left: ${project.gallery_layout.left}%; `;
                    }

                    // 2. Gallery Side (Slider)
                    const images = project.gallery && project.gallery.length > 0 ? project.gallery : [project.image];
                    let slidesHtml = '';
                    images.forEach((imgItem, idx) => {
                        // Normalize
                        let src = typeof imgItem === 'string' ? imgItem : imgItem.src;
                        if (!src) return; // FIX: Skip empty sources
                        let slideSrc = encodeURI(src);
                        // Metadata placeholder (or extract from imgItem if object)
                        let metaText = "Location, Year, Subject";
                        if (typeof imgItem === 'object' && imgItem.caption) metaText = imgItem.caption;

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

                    // Dynamic Layout for Project Info
                    let infoStyle = '';
                    if (project.layout) {
                        if (project.layout.top) infoStyle += `padding-top: ${project.layout.top}px; `;
                        if (project.layout.left) infoStyle += `padding-left: ${project.layout.left}px; `;
                        if (project.layout.width) infoStyle += `width: ${project.layout.width}%; `;
                        if (project.layout.max_width) infoStyle += `max-width: ${project.layout.max_width}px; `;
                    }

                    const galleryHtml = `
                    <div class="project-split">
                        
                        <div class="project-info-side" style="${infoStyle}">
                            <h1 id="p-title">${project.title}</h1>
                            <div class="meta" id="p-year">${project.year}</div>
                            ${descriptionHtml}
                        </div>

                        <div class="project-gallery-side">
                            <div class="gallery-slider-container">
                                ${slidesHtml}
                                <!-- Invisible click areas for left/right (keep for usability) -->
                                <div class="slider-nav-area nav-left"></div>
                                <div class="slider-nav-area nav-right"></div>
                            </div>
                            <!-- Visible Navigation Arrows (Global, outside image) -->
                            <button class="slider-arrow arrow-left" aria-label="Previous">‹</button>
                            <button class="slider-arrow arrow-right" aria-label="Next">›</button>
                        </div>

                        <!-- Counter: Fixed to right margin, bottom aligned with gallery -->
                        <div class="slider-counter">1 / ${images.length}</div>

                    </div>
                    `;

                    projectContent.innerHTML = galleryHtml;

                    // Slider Logic
                    let currentSlide = 0;
                    const totalSlides = images.length;
                    const slides = document.querySelectorAll('.gallery-slide');
                    const counter = document.querySelector('.slider-counter');
                    const navLeft = document.querySelector('.nav-left');
                    const navRight = document.querySelector('.nav-right');
                    const arrowLeft = document.querySelector('.arrow-left');
                    const arrowRight = document.querySelector('.arrow-right');


                    const updateSlider = (index, withSound = true) => {
                        slides.forEach(s => s.classList.remove('active'));
                        slides[index].classList.add('active');
                        if (counter) counter.innerText = `${index + 1} / ${totalSlides}`;
                        if (withSound) playSound('click');
                    };

                    // Navigation: Click area (invisible)
                    navLeft.addEventListener('click', () => {
                        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                        updateSlider(currentSlide);
                    });

                    navRight.addEventListener('click', () => {
                        currentSlide = (currentSlide + 1) % totalSlides;
                        updateSlider(currentSlide);
                    });

                    // Navigation: Visible arrow buttons (Direct)
                    arrowLeft.addEventListener('click', (e) => {
                        e.stopPropagation();
                        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                        updateSlider(currentSlide);
                    });

                    arrowRight.addEventListener('click', (e) => {
                        e.stopPropagation();
                        currentSlide = (currentSlide + 1) % totalSlides;
                        updateSlider(currentSlide);
                    });

                    // Click on image to advance
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

                    // Touch Swipe Support for Mobile
                    // Reuse sliderContainer variable defined above
                    // Touch Swipe Support for Mobile
                    // Define sliderContainer by selecting from DOM
                    const sliderContainer = document.querySelector('.gallery-slider-container');
                    if (sliderContainer) {
                        let touchStartX = 0;
                        let touchEndX = 0;
                        const minSwipeDistance = 50;

                        sliderContainer.addEventListener('touchstart', (e) => {
                            touchStartX = e.changedTouches[0].screenX;
                        }, { passive: true });

                        sliderContainer.addEventListener('touchend', (e) => {
                            touchEndX = e.changedTouches[0].screenX;
                            const swipeDistance = touchEndX - touchStartX;

                            if (Math.abs(swipeDistance) > minSwipeDistance) {
                                if (swipeDistance > 0) {
                                    // Swipe right -> previous
                                    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                                } else {
                                    // Swipe left -> next
                                    currentSlide = (currentSlide + 1) % totalSlides;
                                }
                                updateSlider(currentSlide);
                            }
                        }, { passive: true });
                    }

                } else {
                    projectContent.innerHTML = `<h1>Project Not Found</h1><p>The requested project ID '${projectId}' does not exist.</p>`;
                }
            }

            // D. Route: Biography Page (Populate text if enabled)
            const bioTextContainer = document.querySelector('.bio-text');
            if (bioTextContainer && siteInfo.bio) {
                bioTextContainer.innerHTML = siteInfo.bio;
            }

            // Apply Dynamic Layout for Bio Page
            const bioContainer = document.querySelector('.bio-container');
            if (bioContainer && siteInfo.bio_layout) {
                if (siteInfo.bio_layout.padding_left) bioContainer.style.paddingLeft = siteInfo.bio_layout.padding_left + 'px';
                if (siteInfo.bio_layout.width) bioContainer.style.width = siteInfo.bio_layout.width + '%';
                if (siteInfo.bio_layout.max_width) bioContainer.style.maxWidth = siteInfo.bio_layout.max_width + 'px';
                if (siteInfo.bio_layout.top) bioContainer.style.paddingTop = siteInfo.bio_layout.top + 'px';
            }

            // E. Route: Contact Page (Populate info & Random Images)
            const contactInfoSide = document.querySelector('.contact-info-side');
            const contactGallerySide = document.querySelector('.contact-gallery-side');

            if (contactInfoSide) {
                // 1. CLEAR & POPULATE LEFT SIDE (Info)
                contactInfoSide.innerHTML = '';

                // Dynamic Contact List
                if (siteInfo.contact_items && Array.isArray(siteInfo.contact_items)) {
                    siteInfo.contact_items.forEach(item => {
                        let valContent = item.value;
                        // If link exists, wrap it
                        if (item.link) {
                            valContent = `<a href="${item.link}" target="_blank" class="contact-link">${item.value}</a>`;
                        } else {
                            valContent = `<span class="contact-link">${item.value}</span>`;
                        }

                        contactInfoSide.innerHTML += `
                        <div class="contact-row">
                            <span class="contact-label">${item.label}</span>
                            ${valContent}
                        </div>`;
                    });
                } else {
                    // Fallback to old keys via explicit check
                    if (siteInfo.studio) {
                        contactInfoSide.innerHTML += `
                        <div class="contact-row">
                            <span class="contact-label">Studio</span>
                            <span class="contact-link">${siteInfo.studio}</span>
                        </div>`;
                    }
                    if (siteInfo.contact_email) {
                        contactInfoSide.innerHTML += `
                        <div class="contact-row">
                            <span class="contact-label">Management</span>
                            <a href="mailto:${siteInfo.contact_email}" class="contact-link">${siteInfo.contact_email}</a>
                        </div>`;
                    }
                }

                // 2. POPULATE RIGHT SIDE (Images)
                // 2. POPULATE RIGHT SIDE (Images)
                if (contactGallerySide) {
                    contactGallerySide.innerHTML = '';

                    const renderImages = (items) => {
                        items.forEach((item, idx) => {
                            let wrapper;
                            if (item.id) {
                                wrapper = document.createElement('a');
                                wrapper.href = `project.html?id=${item.id}`;
                                wrapper.style.cursor = 'pointer';
                            } else {
                                wrapper = document.createElement('div');
                            }
                            wrapper.className = 'contact-img-wrapper';
                            wrapper.style.display = 'block';
                            wrapper.style.width = '100%';
                            wrapper.style.position = 'relative';

                            const img = document.createElement('img');
                            // Determine finalized src
                            let src = item.finalSrc || item.src;
                            img.src = src;
                            img.alt = "";
                            img.className = 'contact-random-img';
                            img.style.transitionDelay = `${idx * 0.2}s`;

                            wrapper.appendChild(img);
                            contactGallerySide.appendChild(wrapper);

                            setTimeout(() => {
                                img.style.opacity = '1';
                            }, 50);
                        });
                    };

                    // Check for fixed images in JSON
                    if (siteInfo.contact_fixed_images && Array.isArray(siteInfo.contact_fixed_images) && siteInfo.contact_fixed_images.length > 0) {
                        const fixedImages = siteInfo.contact_fixed_images.slice(0, 3).map(src => {
                            const rawSrc = typeof src === 'string' ? decodeURI(src) : src;
                            const finalSrc = rawSrc.startsWith('http') ? rawSrc : encodeURI(rawSrc);
                            return { src: finalSrc, id: null };
                        });
                        renderImages(fixedImages);
                    } else {
                        // RANDOM MODE
                        let allImages = [];
                        const seenSrcs = new Set();

                        projects.forEach(p => {
                            const add = (src, id) => {
                                if (src && !seenSrcs.has(src)) {
                                    seenSrcs.add(src);
                                    allImages.push({ src, id });
                                }
                            };

                            if (p.image) add(p.image, p.id);
                            if (p.gallery && Array.isArray(p.gallery)) {
                                p.gallery.forEach(gImg => {
                                    const src = typeof gImg === 'string' ? gImg : gImg.src;
                                    add(src, p.id);
                                });
                            }
                        });

                        // Shuffle the unique pool
                        for (let i = allImages.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
                        }

                        // Use a larger buffer to guarantee good selection
                        let initialCandidates = allImages.slice(0, 30);

                        // Create hidden container for reliable loading
                        let preloader = document.getElementById('image-preloader');
                        if (!preloader) {
                            preloader = document.createElement('div');
                            preloader.id = 'image-preloader';
                            preloader.style.position = 'fixed';
                            preloader.style.left = '-9999px';
                            preloader.style.top = '0';
                            document.body.appendChild(preloader);
                        }
                        preloader.innerHTML = '';

                        // LOAD & DETECT ORIENTATION
                        Promise.all(initialCandidates.map(item => {
                            return new Promise((resolve) => {
                                const tempImg = document.createElement('img');
                                const rawSrc = decodeURI(item.src);
                                const finalSrc = rawSrc.startsWith('http') ? rawSrc : encodeURI(rawSrc);

                                tempImg.style.width = 'auto';
                                tempImg.style.height = 'auto';
                                tempImg.style.maxWidth = 'none';
                                tempImg.style.maxHeight = 'none';

                                tempImg.onload = () => {
                                    if (tempImg.naturalWidth > 0 && tempImg.naturalHeight > 0) {
                                        item.isPortrait = tempImg.naturalHeight >= tempImg.naturalWidth;
                                        item.finalSrc = finalSrc;
                                        item.isValid = true;
                                    } else {
                                        item.isValid = false;
                                    }
                                    resolve(item);
                                };
                                tempImg.onerror = () => {
                                    item.isValid = false;
                                    resolve(item);
                                };
                                tempImg.src = finalSrc;
                                preloader.appendChild(tempImg);
                            });
                        })).then(results => {
                            // Filter valid
                            let validItems = results.filter(item => item.isValid);

                            // Strategy: Select 3 random valid images
                            const finalSelection = validItems.slice(0, 3);

                            finalSelection.sort((a, b) => {
                                if (a.isPortrait === b.isPortrait) return 0;
                                return a.isPortrait ? -1 : 1;
                            });

                            renderImages(finalSelection);

                            // Cleanup
                            if (preloader) preloader.innerHTML = '';
                        });
                    }
                }
            }

            // F. Apply Dynamic Contact Layout
            const cInfo = document.querySelector('.contact-info-side');
            const cGal = document.querySelector('.contact-gallery-side');
            if (cInfo && siteInfo.contact_info_layout) {
                const l = siteInfo.contact_info_layout;
                if (l.top) cInfo.style.paddingTop = l.top + 'px';
                if (l.left) cInfo.style.paddingLeft = l.left + 'px';
                if (l.width) cInfo.style.width = l.width + '%';
            }
            if (cGal && siteInfo.contact_gallery_layout) {
                const l = siteInfo.contact_gallery_layout;
                if (l.top) cGal.style.paddingTop = l.top + 'px';
                if (l.left) cGal.style.marginLeft = l.left + 'px';
                if (l.width) cGal.style.width = l.width + '%';
            }

            // G. Void Page Logic (404)
            const voidText = document.querySelector('.void-text');
            if (voidText) {
                const msgs = siteInfo.void_messages || [
                    "The page has dissolved into white."
                ];
                // Jazz: Random Selection
                const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
                voidText.textContent = randomMsg;
            }
        })
        .catch(err => {
            console.warn('Data Load Error:', err);
        });

    // 2. Homepage Parallax REMOVED
    // (body.is-home has overflow:hidden, scroll events never fire)
    // If parallax is desired, consider mousemove-based effect instead.

    // 3. Keyboard Navigation for Gallery Slider
    document.addEventListener('keydown', (e) => {
        const navLeft = document.querySelector('.nav-left');
        const navRight = document.querySelector('.nav-right');

        if (!navLeft || !navRight) return;

        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            navLeft.click();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            navRight.click();
        }
    });
});
