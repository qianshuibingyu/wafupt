(function () {
    function scheduleIdle(callback, timeout) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(callback, { timeout: timeout || 2000 });
        } else {
            setTimeout(callback, 1);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const isDesktop = window.matchMedia('(min-width: 959px)').matches;
        const isProductPage = !!document.querySelector('main.prod-detail');

        if (isProductPage) {
            initSimpleCarousel();
            scheduleIdle(() => initNavigation(), 0);
        } else {
            initNavigation();
            initCarousel();
        }

        if (document.querySelector('.faq-question')) initFaq();

        const runNonCritical = () => {
            initLazyLoad();
            scheduleIdle(() => {
                initBackToTop();
                initFloatKefu();
                scheduleIdle(() => {
                    if (document.getElementById('contactForm')) initDeferredContactForm();
                    if (document.querySelector('.section-about')) initDeferredSectionMedia();
                    if (!isProductPage) initSimpleCarousel();
                }, isProductPage ? 800 : 400);
            }, isProductPage ? 600 : 300);
        };

        scheduleIdle(runNonCritical, isDesktop ? 2500 : 2000);
    });

    function getJsBase() {
        const script = document.querySelector('script[src*="all.js"]');
        if (!script) return './js/';
        const src = script.getAttribute('src') || './js/all.js';
        return src.slice(0, src.lastIndexOf('/') + 1);
    }

    function loadScript(filename) {
        const src = filename.includes('/') ? filename : `${getJsBase()}${filename}`;
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                if (existing.dataset.loaded === 'true') {
                    resolve();
                    return;
                }
                existing.addEventListener('load', () => resolve(), { once: true });
                existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.dataset.deferred = 'true';
            script.onload = () => {
                script.dataset.loaded = 'true';
                resolve();
            };
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.body.appendChild(script);
        });
    }

    function initDeferredContactForm() {
        const form = document.getElementById('contactForm');
        if (!form || form.dataset.contactReady === 'true') return;

        const isContactPage = /\/contact(?:\.html)?\/?$/i.test(location.pathname);
        if (isContactPage) return;

        let scriptsPromise = null;
        let pendingSubmit = false;

        function ensureEmailReady() {
            if (form.dataset.contactReady === 'true') {
                return Promise.resolve();
            }
            if (typeof emailjs !== 'undefined' && typeof window.initContactForm === 'function') {
                window.initContactForm();
                if (form.dataset.contactReady === 'true') {
                    return Promise.resolve();
                }
            }
            if (scriptsPromise) return scriptsPromise;

            scriptsPromise = loadScript('email.min.js')
                .then(() => loadScript('contact-form.js'))
                .then(() => {
                    if (typeof window.initContactForm === 'function') {
                        window.initContactForm();
                    }
                    if (form.dataset.contactReady !== 'true') {
                        throw new Error('Contact form failed to initialize');
                    }
                })
                .catch((err) => {
                    scriptsPromise = null;
                    console.error('Contact form scripts failed to load', err);
                    throw err;
                });

            return scriptsPromise;
        }

        const isProductPage = !!document.querySelector('main.prod-detail');
        const formVisible = !isProductPage &&
            form.getBoundingClientRect().top < window.innerHeight + 400;

        if (formVisible) {
            ensureEmailReady();
        } else if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                if (entries.some(entry => entry.isIntersecting)) {
                    ensureEmailReady();
                    observer.disconnect();
                }
            }, { rootMargin: '300px' });
            observer.observe(form);
        }

        form.addEventListener('focusin', () => ensureEmailReady(), { once: true });

        form.addEventListener('submit', (e) => {
            if (form.dataset.contactReady === 'true') return;
            e.preventDefault();
            e.stopImmediatePropagation();
            pendingSubmit = true;
            ensureEmailReady()
                .then(() => {
                    if (!pendingSubmit) return;
                    pendingSubmit = false;
                    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                })
                .catch(() => {
                    pendingSubmit = false;
                    alert('Unable to send your message right now. Please email us at wafutechnology@outlook.com directly.');
                });
        }, { capture: true });
    }

    function activateLazyImage(img) {
        const picture = img.closest('picture');
        picture?.querySelectorAll('source[data-srcset]').forEach(source => {
            if (!source.dataset.srcset) return;
            source.srcset = source.dataset.srcset;
            source.removeAttribute('data-srcset');
        });

        const src = img.dataset.src;
        if (!src) return;

        const mobileSrc = img.dataset.mobileSrc;
        if (mobileSrc && !img.srcset) {
            img.srcset = `${mobileSrc} 768w, ${src} 1920w`;
            if (!img.sizes) {
                img.sizes = img.classList.contains('item-img') || img.classList.contains('card-image')
                    ? '(max-width: 768px) 90vw, 280px'
                    : '100vw';
            }
        }

        if (picture && mobileSrc) {
            const hasMobileSource = picture.querySelector('source[media*="768"]');
            if (!hasMobileSource) {
                const mobileSource = document.createElement('source');
                mobileSource.media = '(max-width: 768px)';
                mobileSource.type = 'image/webp';
                mobileSource.srcset = mobileSrc;
                picture.insertBefore(mobileSource, picture.firstChild);
            }
        }

        img.src = src;
        img.removeAttribute('data-src');
        img.removeAttribute('data-mobile-src');
        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
    }

    function initDeferredSectionMedia() {
        const section = document.querySelector('.section-about');
        let videoReady = false;

        const prepareSection = () => {
            section?.querySelectorAll('img[data-src]').forEach(activateLazyImage);
            if (!videoReady) {
                videoReady = true;
                initVideoFacade();
                initAboutVideoChrome();
            }
        };

        if (!section) return;

        if (!('IntersectionObserver' in window)) {
            scheduleIdle(prepareSection);
            return;
        }

        const isDesktop = window.matchMedia('(min-width: 959px)').matches;
        const runPrepare = () => scheduleIdle(prepareSection, isDesktop ? 2000 : 3000);

        const rect = section.getBoundingClientRect();
        const nearViewport = rect.top < window.innerHeight + (isDesktop ? 120 : 300) &&
            rect.bottom > -300;

        if (nearViewport) {
            runPrepare();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            runPrepare();
            observer.disconnect();
        }, { rootMargin: isDesktop ? '80px' : '300px' });

        observer.observe(section);
    }

    function resetFloatKefuState() {
        document.querySelectorAll('.kefu-item').forEach(item => {
            item.classList.remove('is-open');
        });
    }

    function initFloatKefu() {
        const items = document.querySelectorAll('.kefu-item');
        if (!items.length) return;

        const actions = {
            wechat: 'https://wa.me/8615914193183?text=Hello',
            phone: 'tel:+8615914193183',
            email: 'mailto:wafutechnology@gmail.com'
        };

        const isTouch = () => window.matchMedia('(hover: none), (max-width: 1024px)').matches;

        items.forEach(item => {
            const qr = item.querySelector('.qr-code[data-src]');
            const loadQr = () => {
                if (qr) activateLazyImage(qr);
            };

            item.addEventListener('pointerenter', loadQr, { once: true });
            item.addEventListener('focusin', loadQr, { once: true });

            item.addEventListener('click', (e) => {
                e.stopPropagation();

                const type = ['wechat', 'phone', 'email'].find(cls => item.classList.contains(cls));
                if (!type) return;

                if (isTouch() && actions[type]) {
                    resetFloatKefuState();
                    item.blur();
                    if (type === 'wechat') {
                        window.open(actions[type], '_blank', 'noopener,noreferrer');
                    } else {
                        window.location.href = actions[type];
                    }
                    return;
                }

                loadQr();

                const wasOpen = item.classList.contains('is-open');
                items.forEach(i => i.classList.remove('is-open'));
                if (!wasOpen) item.classList.add('is-open');
            });

            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });

        document.addEventListener('click', () => {
            resetFloatKefuState();
        });

        window.addEventListener('pageshow', (e) => {
            if (e.persisted) resetFloatKefuState();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') resetFloatKefuState();
        });
    }

    function initFaq() {
        if (document.documentElement.dataset.faqInit === 'true') return;

        const questions = document.querySelectorAll('.faq-question');
        if (!questions.length) return;

        document.documentElement.dataset.faqInit = 'true';

        questions.forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                const isOpening = !item.classList.contains('active');

                document.querySelectorAll('.faq-item.active').forEach(openItem => {
                    if (openItem !== item) openItem.classList.remove('active');
                });

                item.classList.toggle('active', isOpening);
            });
        });
    }

    // 功能1：导航菜单
    function initNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navList = document.getElementById('navList');
        const dropdownItems = document.querySelectorAll('.nav-item.dropdown');

        if (!navToggle || !navList) return;

        // 汉堡菜单点击
        navToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = navList.classList.toggle('active');
            navToggle.classList.toggle('active');
            document.body.classList.toggle('nav-open', isOpen);

            if (!isOpen) closeAllDropdowns();
        });

        // 处理下拉菜单点击事件
        dropdownItems.forEach(item => {
            const link = item.querySelector('.nav-link');

            link.addEventListener('click', function (e) {
                // 只在移动端处理
                if (window.innerWidth <= 958) {
                    const linkRect = this.getBoundingClientRect();
                    const clickX = e.clientX - linkRect.left;
                    const linkWidth = linkRect.width;


                    // 判断是否点击在箭头区域（右侧30px内）
                    const arrowAreaWidth = 50; // 箭头区域宽度
                    const isArrowClick = clickX > (linkWidth - arrowAreaWidth);

                    if (isArrowClick) {
                        // 点击箭头区域：展开/收起菜单
                        e.preventDefault();
                        e.stopPropagation();

                        const dropdownMenu = item.querySelector('.dropdown-menu');
                        const isActive = item.classList.contains('active');


                        // 先关闭所有其他下拉菜单
                        dropdownItems.forEach(otherItem => {
                            if (otherItem !== item) {
                                otherItem.classList.remove('active');
                                const otherMenu = otherItem.querySelector('.dropdown-menu');
                                if (otherMenu) {
                                    otherMenu.classList.remove('active');
                                }
                            }
                        });

                        // 切换当前菜单
                        if (isActive) {
                            // 当前已展开，收起它
                            item.classList.remove('active');
                            if (dropdownMenu) {
                                dropdownMenu.classList.remove('active');
                            }
                        } else {
                            // 当前未展开，展开它
                            item.classList.add('active');
                            if (dropdownMenu) {
                                dropdownMenu.classList.add('active');
                            }
                        }
                    } else {
                        // 点击文字区域：正常跳转
                        // 不阻止默认行为，让浏览器正常跳转
                        // 在跳转前关闭所有菜单（可选）
                        closeAllMenus();
                    }
                }
            });

            // 阻止下拉菜单内容点击时冒泡到父级
            const dropdownMenu = item.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.addEventListener('click', function (e) {
                    if (window.innerWidth <= 768) {
                        e.stopPropagation();
                        // 点击子菜单项时关闭菜单（可选）
                        if (e.target.classList.contains('dropdown-link')) {
                            setTimeout(() => {
                                closeAllMenus();
                            }, 100);
                        }
                    }
                });
            }
        });

        // 点击页面其他地方关闭所有菜单
        document.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                // 检查点击的是否是导航相关元素
                const clickedInNav =
                    navList.contains(e.target) ||
                    e.target === navToggle ||
                    e.target.closest('.nav-toggle') ||
                    e.target.closest('.nav-list') ||
                    e.target.closest('.dropdown-menu');

                if (!clickedInNav) {
                    closeAllMenus();
                }
            }
        });

        // 窗口大小改变时重置
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) {
                closeAllMenus();
            }
        });

        // 关闭所有下拉菜单
        function closeAllDropdowns() {
            dropdownItems.forEach(item => {
                item.classList.remove('active');
                const menu = item.querySelector('.dropdown-menu');
                if (menu) menu.classList.remove('active');
            });
        }

        // 关闭所有菜单（包括主菜单）
        function closeAllMenus() {
            navList.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.classList.remove('nav-open');
            closeAllDropdowns();
        }
    }

    function initCarousel() {
        const carousel = document.querySelector('.carousel');
        if (!carousel) return;

        const items = carousel.querySelectorAll('.carousel-item');
        const indicators = carousel.querySelectorAll('.indicator');
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');

        if (!items.length) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = window.matchMedia('(max-width: 958px)').matches;
        const intervalMs = prefersReducedMotion ? 0 : (isMobile ? 7000 : 5000);

        let currentIndex = 0;
        let interval = null;
        let isVisible = true;

        function loadSlideImage(index) {
            const item = items[index];
            if (!item) return;

            item.querySelectorAll('picture source[data-srcset]').forEach(source => {
                if (!source.dataset.srcset) return;
                source.srcset = source.dataset.srcset;
                source.removeAttribute('data-srcset');
            });

            item.querySelectorAll('img[data-src]').forEach(img => {
                if (!img.dataset.src) return;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }

        function goToSlide(index) {
            items[currentIndex]?.classList.remove('active');
            indicators[currentIndex]?.classList.remove('active');
            currentIndex = (index + items.length) % items.length;
            items[currentIndex]?.classList.add('active');
            indicators[currentIndex]?.classList.add('active');
            loadSlideImage(currentIndex);
            loadSlideImage((currentIndex + 1) % items.length);
        }

        function nextSlide() { goToSlide(currentIndex + 1); }
        function prevSlide() { goToSlide(currentIndex - 1); }

        function stopInterval() {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        }

        function startInterval() {
            if (!intervalMs || !isVisible) return;
            stopInterval();
            interval = setInterval(nextSlide, intervalMs);
        }

        prevBtn?.addEventListener('click', () => { prevSlide(); startInterval(); });
        nextBtn?.addEventListener('click', () => { nextSlide(); startInterval(); });

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                goToSlide(index);
                startInterval();
            });
        });

        carousel.addEventListener('mouseenter', stopInterval);
        carousel.addEventListener('mouseleave', startInterval);

        let touchStartX = 0;
        carousel.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        carousel.addEventListener('touchend', e => {
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(diff) > 50) {
                diff < 0 ? nextSlide() : prevSlide();
                startInterval();
            }
        }, { passive: true });

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                isVisible = entries[0]?.isIntersecting ?? true;
                if (isVisible) startInterval();
                else stopInterval();
            }, { threshold: 0.15 });
            observer.observe(carousel);
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopInterval();
            else startInterval();
        });

        loadSlideImage(0);
        startInterval();
    }

    /* ========== 功能2b：极简轮播（可多个实例，3秒自动切换，单向循环） ========== */
    function initSimpleCarousel() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const intervalMs = prefersReducedMotion ? 0 : 3000;

        document.querySelectorAll('.s-carousel').forEach(container => {
            const inner = container.querySelector('.s-carousel-inner');
            const originals = [...container.querySelectorAll('.s-carousel-item')];
            const btnPrev = container.querySelector('.s-prev');
            const btnNext = container.querySelector('.s-next');
            if (!inner || originals.length < 2) return;

            const total = originals.length;
            const firstClone = originals[0].cloneNode(true);
            firstClone.classList.add('s-carousel-clone');
            firstClone.setAttribute('aria-hidden', 'true');
            inner.appendChild(firstClone);

            let pos = [...originals].findIndex(slide => slide.classList.contains('active'));
            if (pos < 0) pos = 0;

            let interval = null;
            let isVisible = true;
            let jumping = false;

            function setTransition(on) {
                inner.style.transition = on && !prefersReducedMotion ? 'transform 0.45s ease' : 'none';
            }

            function updateActive() {
                const realIndex = pos >= total ? 0 : pos;
                originals.forEach((slide, i) => {
                    slide.classList.toggle('active', i === realIndex);
                    slide.setAttribute('aria-hidden', i === realIndex ? 'false' : 'true');
                });
            }

            function goTo(index, animate) {
                pos = index;
                setTransition(animate);
                inner.style.transform = `translateX(-${pos * 100}%)`;
                updateActive();
            }

            function handleTransitionEnd(e) {
                if (e.target !== inner || jumping || pos !== total) return;
                jumping = true;
                goTo(0, false);
                jumping = false;
            }

            inner.addEventListener('transitionend', handleTransitionEnd);

            goTo(pos, false);
            requestAnimationFrame(() => setTransition(true));

            function next() {
                if (jumping) return;
                if (pos >= total) {
                    goTo(0, false);
                    return;
                }
                goTo(pos + 1, !prefersReducedMotion);
                if (pos === total && prefersReducedMotion) {
                    goTo(0, false);
                }
            }

            function prev() {
                if (jumping) return;
                if (pos === 0) {
                    goTo(total - 1, false);
                } else {
                    goTo(pos - 1, true);
                }
            }

            function stopInterval() {
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
            }

            function startInterval() {
                if (!intervalMs || !isVisible) return;
                stopInterval();
                interval = setInterval(next, intervalMs);
            }

            btnPrev?.addEventListener('click', () => { prev(); startInterval(); });
            btnNext?.addEventListener('click', () => { next(); startInterval(); });

            container.addEventListener('mouseenter', stopInterval);
            container.addEventListener('mouseleave', startInterval);

            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    isVisible = entries[0]?.isIntersecting ?? true;
                    if (isVisible) startInterval();
                    else stopInterval();
                }, { threshold: 0.15 });
                observer.observe(container);
            }

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) stopInterval();
                else startInterval();
            });

            startInterval();
        });
    }

    // 功能3：返回顶部
    function initBackToTop() {
        const backTop = document.getElementById('backTop');
        if (!backTop) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                backTop.style.display = window.scrollY > 300 ? 'grid' : 'none';
                ticking = false;
            });
        }, { passive: true });

        backTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    function youtubeEmbedSrc(videoId, autoplay) {
        const query = new URLSearchParams({
            rel: '1',
            modestbranding: '1',
            playsinline: '1'
        });
        if (autoplay) query.set('autoplay', '1');
        return `https://www.youtube-nocookie.com/embed/${videoId}?${query.toString()}`;
    }

    function embedYoutubeFacade(facade, autoplay) {
        const videoId = facade.dataset.youtubeId;
        if (!videoId) return;

        const existing = facade.querySelector('iframe');
        if (existing) {
            existing.src = youtubeEmbedSrc(videoId, autoplay);
            facade.dataset.loaded = 'true';
            return;
        }

        if (facade.dataset.loaded === 'true') return;
        facade.dataset.loaded = 'true';

        const iframe = document.createElement('iframe');
        iframe.src = youtubeEmbedSrc(videoId, autoplay);
        iframe.title = 'WAFU product video';
        iframe.loading = 'lazy';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        iframe.setAttribute('allowfullscreen', '');
        iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;border-radius:0;';

        facade.replaceChildren(iframe);
        facade.removeAttribute('role');
        facade.removeAttribute('tabindex');
        facade.style.cursor = 'default';

        if (facade.id === 'aboutVideoFacade') {
            document.getElementById('aboutVideoMoreBelow')?.removeAttribute('hidden');
        }
    }

    function initAboutVideoChrome() {
        const isDesktop = window.matchMedia('(min-width: 959px)').matches;
        const player = document.getElementById('aboutVideoPlayer');
        const facade = document.getElementById('aboutVideoFacade');
        const moreBelow = document.getElementById('aboutVideoMoreBelow');
        const list = document.getElementById('aboutVideoMoreList');
        const thumb = document.getElementById('aboutVideoMoreThumb');
        const trigger = document.getElementById('aboutVideoMoreTrigger');
        if (!player || !facade || !moreBelow || !list) return;

        if (facade.querySelector('iframe')) {
            moreBelow.removeAttribute('hidden');
        }

        if (isDesktop) {
            list.querySelectorAll('img[data-src]').forEach(activateLazyImage);
        }

        const items = list.querySelectorAll('.about-video-more-item');

        const requestPlayerFullscreen = () => {
            const req = player.requestFullscreen || player.webkitRequestFullscreen;
            if (req) return Promise.resolve(req.call(player));
            return Promise.reject();
        };

        const exitPlayerFullscreen = () => {
            const exit = document.exitFullscreen || document.webkitExitFullscreen;
            if (exit && document.fullscreenElement) exit.call(document);
        };

        const toggleFullscreen = () => {
            const active = document.fullscreenElement === player ||
                document.webkitFullscreenElement === player;
            if (active) exitPlayerFullscreen();
            else requestPlayerFullscreen().catch(() => {});
        };

        const isPlayerFocused = () => {
            const active = document.activeElement;
            return active === player || player.contains(active);
        };

        const setActive = videoId => {
            items.forEach(item => {
                item.classList.toggle('is-active', item.dataset.videoId === videoId);
            });
            if (thumb && videoId) {
                thumb.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
            }
        };

        const switchVideo = videoId => {
            if (!videoId || videoId === facade.dataset.youtubeId) return;
            facade.dataset.youtubeId = videoId;
            embedYoutubeFacade(facade, true);
            setActive(videoId);
        };

        items.forEach(item => {
            item.addEventListener('click', e => {
                e.stopPropagation();
                switchVideo(item.dataset.videoId);
            });
        });

        list.addEventListener('wheel', e => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                list.scrollLeft += e.deltaY;
            }
        }, { passive: false });

        if (trigger) {
            trigger.addEventListener('click', e => {
                e.stopPropagation();
                moreBelow.classList.toggle('is-open');
                trigger.setAttribute('aria-expanded', moreBelow.classList.contains('is-open'));
                if (moreBelow.classList.contains('is-open')) {
                    list.querySelectorAll('img[data-src]').forEach(activateLazyImage);
                }
            });
        }

        moreBelow.addEventListener('mouseleave', () => {
            moreBelow.classList.remove('is-open');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
        });

        if (isDesktop) {
            let hoverPlayer = false;
            player.addEventListener('mouseenter', () => { hoverPlayer = true; });
            player.addEventListener('mouseleave', () => { hoverPlayer = false; });
            player.addEventListener('click', () => player.focus({ preventScroll: true }));

            const onEnterFullscreen = e => {
                if (e.key !== 'Enter' || e.repeat) return;
                if (!facade.querySelector('iframe')) return;
                if (!hoverPlayer && !isPlayerFocused()) return;
                e.preventDefault();
                toggleFullscreen();
            };

            player.addEventListener('keydown', onEnterFullscreen);
            document.addEventListener('keydown', onEnterFullscreen);
        }

        setActive(facade.dataset.youtubeId);
    }

    function initVideoFacade() {
        const isDesktop = window.matchMedia('(min-width: 959px)').matches;

        document.querySelectorAll('.video-facade[data-youtube-id]').forEach(facade => {
            const videoId = facade.dataset.youtubeId;
            if (!videoId) return;

            const autoload = facade.dataset.autoload === 'true' ||
                (facade.dataset.autoloadDesktop === 'true' && isDesktop);
            if (autoload) {
                embedYoutubeFacade(facade, false);
                return;
            }

            const activate = () => embedYoutubeFacade(facade, true);

            facade.addEventListener('click', activate);
            facade.addEventListener('touchend', e => {
                e.preventDefault();
                activate();
            }, { passive: false });
            facade.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activate();
                }
            });
        });
    }

    function initLazyLoad() {
        const images = document.querySelectorAll('img.lazy[data-src]');
        if (!images.length) return;

        const isMobile = window.matchMedia('(max-width: 958px)').matches;
        const rootMargin = isMobile ? 120 : 50;

        if (!('IntersectionObserver' in window)) {
            images.forEach((img, index) => {
                if (index < 3) activateLazyImage(img);
            });
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                activateLazyImage(entry.target);
                observer.unobserve(entry.target);
            });
        }, { rootMargin: `${rootMargin}px`, threshold: 0.01 });

        const pending = [...images];
        let index = 0;
        const batchSize = isMobile ? 4 : 6;

        const observeBatch = () => {
            const end = Math.min(index + batchSize, pending.length);
            for (; index < end; index++) {
                imageObserver.observe(pending[index]);
            }
            if (index < pending.length) {
                scheduleIdle(observeBatch, 80);
            }
        };

        observeBatch();
    }
})();