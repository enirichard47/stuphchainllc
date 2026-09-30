document.addEventListener('DOMContentLoaded', () => {
    // 1. Loader & Initialization
    const loader = document.querySelector('.loader-wrapper');
    
    const hideLoader = () => {
        if (!loader) return;
        setTimeout(() => {
            loader.style.transition = '1s opacity cubic-bezier(0.16, 1, 0.3, 1)';
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                if (typeof initAOS === 'function') initAOS();
                scrollToHash();
            }, 1000);
        }, 300);
    };

    // Arriving from another page with a hash (e.g. index.html#contact): the browser's
    // early jump lands in the wrong place once GSAP pinning adds height, so re-scroll
    // to the target after layout has settled.
    const scrollToHash = () => {
        if (!location.hash || location.hash.length <= 1) return;
        let target;
        try { target = document.querySelector(location.hash); } catch (e) { return; }
        if (!target) return;
        if (window.ScrollTrigger) ScrollTrigger.refresh();
        const navEl = document.getElementById('navbar');
        const offset = navEl ? navEl.offsetHeight : 0;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'auto' });
    };

    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
    }

    // Video Loading Logic (Instant Visibility)
    const fadeVideos = document.querySelectorAll('.fade-video');
    fadeVideos.forEach(vid => {
        vid.classList.add('video-ready'); // Show immediately
    });

    // 2. Navbar & Scroll Progress
    const nav = document.getElementById('navbar');
    const progressBar = document.querySelector('.scroll-progress');
    
    window.addEventListener('scroll', () => {
        // Navbar
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Progress Bar
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (progressBar) progressBar.style.width = scrolled + "%";
    });

    // 3. Testimonial Carousel
    const testTrack = document.querySelector('.carousel-track');
    const testSlides = Array.from(testTrack ? testTrack.children : []);
    const testNext = document.querySelector('.nav-next');
    const testPrev = document.querySelector('.nav-prev');
    const testDotsContainer = document.querySelector('.nav-dots');
    
    let testIdx = 0;

    if (testSlides.length > 0) {
        testSlides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                testIdx = i;
                updateCarousel(testTrack, testIdx, testDotsContainer);
            });
            testDotsContainer.appendChild(dot);
        });

        testNext.addEventListener('click', () => {
            testIdx = (testIdx + 1) % testSlides.length;
            updateCarousel(testTrack, testIdx, testDotsContainer);
        });

        testPrev.addEventListener('click', () => {
            testIdx = (testIdx - 1 + testSlides.length) % testSlides.length;
            updateCarousel(testTrack, testIdx, testDotsContainer);
        });

        setInterval(() => testNext.click(), 7000);
    }

    // 4. Sanctuary Carousel
    const sanctuaryTrack = document.querySelector('.studio-carousel-track');
    const sanctuarySlides = Array.from(sanctuaryTrack ? sanctuaryTrack.children : []);
    const sancNext = document.querySelector('.sanctuary-next');
    const sancPrev = document.querySelector('.sanctuary-prev');
    
    let sancIdx = 0;

    if (sanctuarySlides.length > 0) {
        const moveSanc = (idx) => {
            sanctuaryTrack.style.transform = `translateX(-${idx * 100}%)`;
        };

        sancNext.addEventListener('click', () => {
            sancIdx = (sancIdx + 1) % sanctuarySlides.length;
            moveSanc(sancIdx);
        });

        sancPrev.addEventListener('click', () => {
            sancIdx = (sancIdx - 1 + sanctuarySlides.length) % sanctuarySlides.length;
            moveSanc(sancIdx);
        });
    }

    function updateCarousel(track, idx, dotsContainer) {
        track.style.transform = `translateX(-${idx * 100}%)`;
        if (dotsContainer) {
            const dots = Array.from(dotsContainer.children);
            dots.forEach(d => d.classList.remove('active'));
            dots[idx].classList.add('active');
        }
    }

    // 5. FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // 6. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length <= 1) return; // Placeholder links ("#") - let default/no-op happen
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offset = nav.offsetHeight;
                window.scrollTo({
                    top: target.offsetTop - offset,
                    behavior: 'smooth'
                });
                // Mobile Menu Clean Close
                const menu = document.querySelector('.nav-links');
                if (menu.classList.contains('mobile-active')) {
                    document.querySelector('.mobile-toggle').click();
                }
            }
        });
    });

    // 7. Custom AOS (Animate On Scroll)
    function initAOS() {
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                }
            });
        }, observerOptions);

        const els = document.querySelectorAll('[data-aos]');
        els.forEach(el => {
            observer.observe(el);
        });
    }

    // 8. Mobile Navigation Toggle (With Scroll Lock & Link Close Hooks)
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            const isActive = navLinks.classList.contains('mobile-active');
            if (isActive) {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('mobile-active');
                document.body.style.overflow = '';
            } else {
                mobileToggle.classList.add('active');
                navLinks.classList.add('mobile-active');
                document.body.style.overflow = 'hidden';
            }
        });

        // Auto-close menu when clicking a drawer item link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('mobile-active');
                document.body.style.overflow = '';
            });
        });
    }


    // 9. Forms & Interactions
    const newsForm = document.querySelector('.footer-news-form');
    if (newsForm) {
        newsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = newsForm.querySelector('button');
            btn.innerText = 'SENT';
            newsForm.reset();
            setTimeout(() => { btn.innerText = 'JOIN'; }, 3000);
        });
    }

    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('booking-submit-btn');
            const statusDiv = document.getElementById('booking-form-status');
            const originalBtnText = submitBtn.innerText;

            submitBtn.disabled = true;
            submitBtn.innerText = 'TRANSMITTING...';
            if (statusDiv) {
                statusDiv.style.display = 'block';
                statusDiv.style.color = 'var(--gold)';
                statusDiv.innerText = 'Sending your request...';
            }

            try {
                const formData = new FormData(bookingForm);
                const accessKey = (typeof CONFIG !== 'undefined' && CONFIG.WEB3FORMS_ACCESS_KEY) ? CONFIG.WEB3FORMS_ACCESS_KEY : '';
                formData.append('access_key', accessKey);

                const response = await fetch(bookingForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                const result = await response.json();
                if (response.ok && (result.success !== false)) {
                    submitBtn.innerText = 'TRANSMITTED ✓';
                    if (statusDiv) {
                        statusDiv.style.color = '#4CAF50';
                        statusDiv.innerText = 'Thank you! Your request has been transmitted successfully.';
                    }
                    bookingForm.reset();
                } else {
                    throw new Error(result.message || 'Submission error');
                }
            } catch (err) {
                submitBtn.innerText = originalBtnText;
                if (statusDiv) {
                    statusDiv.style.color = '#e57373';
                    statusDiv.innerText = 'Notice: Please add your free Web3Forms access key in config.js to receive emails in your inbox.';
                }
            } finally {
                submitBtn.disabled = false;
                setTimeout(() => {
                    submitBtn.innerText = originalBtnText;
                }, 5000);
            }
        });
    }

    // 10. Cinema Video Carousel Controller
    const cinemaSlides = document.querySelectorAll('.cinema-slide');
    const cinemaPrev = document.querySelector('.cinema-prev-btn');
    const cinemaNext = document.querySelector('.cinema-next-btn');
    const cinemaDots = document.querySelectorAll('.cinema-dot');
    
    let cinemaIdx = 0;
    let cinemaInterval;

    if (cinemaSlides.length > 0) {
        const playCurrentVideo = (idx) => {
            cinemaSlides.forEach((slide, i) => {
                const vid = slide.querySelector('.cinema-video-file');
                if (i === idx) {
                    slide.classList.add('active');
                    if (vid) {
                        vid.currentTime = 0;
                        vid.play().catch(() => {});
                    }
                } else {
                    slide.classList.remove('active');
                    if (vid) {
                        vid.pause();
                    }
                }
            });

            // Update dots
            cinemaDots.forEach((dot, i) => {
                if (i === idx) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        };

        const nextCinemaSlide = () => {
            cinemaIdx = (cinemaIdx + 1) % cinemaSlides.length;
            playCurrentVideo(cinemaIdx);
        };

        const prevCinemaSlide = () => {
            cinemaIdx = (cinemaIdx - 1 + cinemaSlides.length) % cinemaSlides.length;
            playCurrentVideo(cinemaIdx);
        };

        if (cinemaNext) {
            cinemaNext.addEventListener('click', () => {
                nextCinemaSlide();
                resetCinemaAutoplay();
            });
        }

        if (cinemaPrev) {
            cinemaPrev.addEventListener('click', () => {
                prevCinemaSlide();
                resetCinemaAutoplay();
            });
        }

        cinemaDots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                cinemaIdx = idx;
                playCurrentVideo(cinemaIdx);
                resetCinemaAutoplay();
            });
        });

        const resetCinemaAutoplay = () => {
            clearInterval(cinemaInterval);
            cinemaInterval = setInterval(nextCinemaSlide, 8000);
        };

        // Start autoplay
        resetCinemaAutoplay();
    }

    // 11. Interactive Leadership Slider & Filter Controller (Scroll-Snap Momentum Carousel)
    const teamTabs = document.querySelectorAll('.team-tab-btn');
    const teamTracks = document.querySelectorAll('.team-slider-track');

    if (teamTabs.length > 0) {
        teamTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.target;

                // Deactivate all tabs and tracks
                teamTabs.forEach(t => t.classList.remove('active'));
                teamTracks.forEach(tr => tr.classList.remove('active'));

                // Activate selected
                tab.classList.add('active');
                const activeTrack = document.getElementById(`track-${target}`);
                if (activeTrack) {
                    activeTrack.classList.add('active');
                    // Trigger a scroll event on tab switch to initialize the progress bar bounds
                    const viewport = activeTrack.querySelector('.team-slider-viewport');
                    if (viewport) {
                        viewport.dispatchEvent(new Event('scroll'));
                    }
                }
            });
        });

        // Initialize horizontal sliders for Management and Support
        const setupHorizontalSlider = (trackId) => {
            const track = document.getElementById(trackId);
            if (!track) return;
            const viewport = track.querySelector('.team-slider-viewport');
            const horizontal = track.querySelector('.team-slider-horizontal');
            const prevBtn = track.querySelector('.slider-arrow.prev');
            const nextBtn = track.querySelector('.slider-arrow.next');
            if (!viewport || !horizontal || !prevBtn || !nextBtn) return;

            // Create and inject custom progress indicator below viewport dynamically
            const progressTrack = document.createElement('div');
            progressTrack.className = 'carousel-progress-track';
            const progressFill = document.createElement('div');
            progressFill.className = 'carousel-progress-fill';
            progressTrack.appendChild(progressFill);
            
            // Insert it between the viewport and navigation controls
            track.insertBefore(progressTrack, track.querySelector('.slider-arrows'));

            // Navigation Arrow Click Event Listeners
            nextBtn.addEventListener('click', () => {
                const card = horizontal.querySelector('.team-card-premium');
                const cardWidth = card ? card.offsetWidth + parseInt(window.getComputedStyle(horizontal).gap || 40) : 420;
                viewport.scrollBy({ left: cardWidth, behavior: 'smooth' });
            });

            prevBtn.addEventListener('click', () => {
                const card = horizontal.querySelector('.team-card-premium');
                const cardWidth = card ? card.offsetWidth + parseInt(window.getComputedStyle(horizontal).gap || 40) : 420;
                viewport.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            });

            // Update fill width and disable controls at scroll boundaries
            const updateSliderProgress = () => {
                const scrollLeft = viewport.scrollLeft;
                const maxScroll = viewport.scrollWidth - viewport.clientWidth;
                
                if (maxScroll <= 0) {
                    progressTrack.style.display = 'none';
                    prevBtn.style.opacity = '0.3';
                    nextBtn.style.opacity = '0.3';
                    return;
                }
                
                progressTrack.style.display = 'block';
                const percentage = (scrollLeft / maxScroll) * 100;
                progressFill.style.width = `${percentage}%`;

                // Update arrow opacities for boundary indicators
                prevBtn.style.opacity = scrollLeft <= 5 ? '0.3' : '1';
                nextBtn.style.opacity = scrollLeft >= maxScroll - 5 ? '0.3' : '1';
            };

            viewport.addEventListener('scroll', updateSliderProgress, { passive: true });
            window.addEventListener('resize', updateSliderProgress);
            
            // Small timeout to allow layout rendering before first call
            setTimeout(updateSliderProgress, 100);
        };

        setupHorizontalSlider('track-management');
        setupHorizontalSlider('track-support');
    }



    // 13. GSAP ScrollTrigger Premium Card Stacking Interaction (Zero-Lag Performance)
    gsap.registerPlugin(ScrollTrigger);
    
    const venturesSection = document.querySelector('.ventures-gsap-section');
    if (venturesSection) {
        const cards = gsap.utils.toArray('.ventures-gsap-card');
        let mm = gsap.matchMedia();
        
        mm.add("(min-width: 992px)", () => {
            // Set initial card placement (removed filter: blur to prevent paint-storm lag)
            gsap.set(cards.slice(1), { 
                y: "100vh", 
                opacity: 0, 
                scale: 0.98
            });
            gsap.set(cards[0], { 
                y: "0vh", 
                opacity: 1, 
                scale: 1
            });
            
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".ventures-gsap-section",
                    start: "top top",
                    end: "+=350%", // Slow cinematic scroll duration
                    pin: true,
                    scrub: 1, // Smooth scrub deceleration catch-up
                    invalidateOnRefresh: true
                }
            });
            
            cards.forEach((card, i) => {
                if (i === 0) return;
                const prevCard = cards[i - 1];
                
                tl.to(card, {
                    y: "0vh",
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: "power3.inOut"
                })
                .to(prevCard, {
                    scale: 0.94,
                    opacity: 0.35,
                    duration: 1,
                    ease: "power3.inOut"
                }, "<"); // Layered overlay stacking and undercard scaling/dimming
            });
            
            return () => {
                // Remove triggers and cleanup timelines on width resize breakdown
                ScrollTrigger.getAll().forEach(trigger => {
                    if (trigger.trigger === ".ventures-gsap-section") {
                        trigger.kill();
                    }
                });
            };
        });
    }

    // 14. World-Class Custom Lag-Behind Magnetic Cursor (Desktop only to conserve mobile resources)
    if (window.innerWidth >= 992) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        const cursorDot = document.createElement('div');
        cursorDot.className = 'custom-cursor-dot';
        document.body.appendChild(cursor);
        document.body.appendChild(cursorDot);

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Immediate tracking for the core dot
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });

        const animateCursor = () => {
            // Smooth linear interpolation (lerp) for the external magnetic circle
            const lerpFactor = 0.15;
            cursorX += (mouseX - cursorX) * lerpFactor;
            cursorY += (mouseY - cursorY) * lerpFactor;

            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';

            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Toggle cursors when leaving/entering the viewport
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            cursorDot.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            cursorDot.style.opacity = '1';
        });

        // Expand circle cursor on hoverables
        const hoverables = document.querySelectorAll('a, button, .btn, .slider-arrow, .team-tab-btn, .cinema-dot, .nav-prev, .nav-next');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.width = '52px';
                cursor.style.height = '52px';
                cursor.style.backgroundColor = 'rgba(157, 124, 75, 0.15)';
                cursor.style.borderColor = 'transparent';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                cursor.style.backgroundColor = 'transparent';
                cursor.style.borderColor = 'var(--gold)';
            });
        });
    }

    // 15b. Back To Top Button
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';
    document.body.appendChild(backToTop);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 15. World-Class Smooth Scroll Engine (Lenis)
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple product scroll ease
            smoothWheel: true,
            smoothTouch: false
        });

        // Connect Lenis physics directly into ScrollTrigger calculation hooks
        lenis.on('scroll', ScrollTrigger.update);

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }


});
