(function () {
    // 单入口：DOM 加载完成后执行
    document.addEventListener('DOMContentLoaded', () => {
        initLazyLoad();
        initNavigation();
        initCarousel();        // 自动轮播（全功能）
        initSimpleCarousel();  // 极简手动轮播
        initBackToTop();
        if (typeof emailjs !== 'undefined') {
            initContactForm();
        } else {
            return;
        }

    });

    // 功能1：导航菜单
    function initNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navList = document.getElementById('navList');
        const dropdownItems = document.querySelectorAll('.nav-item.dropdown');

        if (!navToggle || !navList) return;

        // 汉堡菜单点击
        navToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            navList.classList.toggle('active');
            navToggle.classList.toggle('active');

            // 如果关闭主菜单，也关闭所有下拉菜单
            if (!navList.classList.contains('active')) {
                closeAllDropdowns();
            }
        });

        // 处理下拉菜单点击事件
        dropdownItems.forEach(item => {
            const link = item.querySelector('.nav-link');

            link.addEventListener('click', function (e) {
                // 只在移动端处理
                if (window.innerWidth <= 768) {
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
            closeAllDropdowns();
        }
    }
    // 功能2：轮播图
    function initCarousel() {
        const carousel = document.querySelector('.carousel');
        const items = document.querySelectorAll('.carousel-item');
        const indicators = document.querySelectorAll('.indicator');
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const nextBtn = document.querySelector('.carousel-btn.next');

        if (!carousel || items.length === 0) return;

        let currentIndex = 0;
        let interval = setInterval(nextSlide, 5000);

        function goToSlide(index) {
            items[currentIndex]?.classList.remove('active');
            indicators[currentIndex]?.classList.remove('active');
            currentIndex = (index + items.length) % items.length;
            items[currentIndex]?.classList.add('active');
            indicators[currentIndex]?.classList.add('active');
        }

        function nextSlide() { goToSlide(currentIndex + 1); }
        function prevSlide() { goToSlide(currentIndex - 1); }

        prevBtn?.addEventListener('click', () => { prevSlide(); restartInterval(); });
        nextBtn?.addEventListener('click', () => { nextSlide(); restartInterval(); });

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                goToSlide(index);
                restartInterval();
            });
        });

        carousel.addEventListener('mouseenter', () => clearInterval(interval));
        carousel.addEventListener('mouseleave', restartInterval);

        let touchStartX = 0;
        carousel.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
        carousel.addEventListener('touchend', e => {
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(diff) > 50) {
                diff < 0 ? nextSlide() : prevSlide();
                restartInterval();
            }
        });

        function restartInterval() {
            clearInterval(interval);
            interval = setInterval(nextSlide, 5000);
        }
    }
    /* ========== 功能2b：极简手动轮播（可多个实例） ========== */
    function initSimpleCarousel() {
        document.querySelectorAll('.s-carousel').forEach(container => {
            const slides = container.querySelectorAll('.s-carousel-item');
            const btnPrev = container.querySelector('.s-prev');
            const btnNext = container.querySelector('.s-next');
            if (!slides.length) return;

            let slideIndex = 1;

            function showSlides(n) {
                if (n > slides.length) slideIndex = 1;
                if (n < 1) slideIndex = slides.length;
                slides.forEach(el => el.style.display = 'none');
                slides[slideIndex - 1].style.display = 'block';
            }

            btnPrev?.addEventListener('click', () => { slideIndex--; showSlides(slideIndex); });
            btnNext?.addEventListener('click', () => { slideIndex++; showSlides(slideIndex); });

            showSlides(slideIndex); // 初始显示
        });
    }

    // 功能3：返回顶部
    function initBackToTop() {
        const backTop = document.getElementById('backTop');
        if (!backTop) return;

        window.addEventListener('scroll', () => {
            backTop.style.display = window.scrollY > 300 ? 'grid' : 'none';
        });

        backTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 功能4：联系表单
    function initContactForm() {
        emailjs.init('kiY7Ni8dk8ID8Mn47');

        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = form.name?.value.trim() || '';
            const phone = form.phone?.value.trim() || '';
            const email = form.email?.value.trim() || '';
            const product = form.product?.value.trim() || '';
            const scenario = form.scenario?.value.trim() || '';
            const message = form.message?.value.trim() || '';

            if (!name || !phone) {
                alert('请填写姓名/公司名和电话。');
                return;
            }

            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('请填写正确的邮箱地址，或留空。');
                return;
            }

            emailjs.send('service_vs616cb', 'template_u99zynh', {
                from_name: name,
                from_email: email,
                name,
                phone,
                product,
                scenario,
                message
            }).then(() => {
                alert('信息已发送，我们会尽快与您联系。');
                form.reset();
            }).catch(err => {
                alert('发送失败，请稍后再试。');
            });
        });
    }

    function initLazyLoad() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    // 创建新的 Image 对象预加载
                    const tempImg = new Image();
                    tempImg.onload = function () {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                    };
                    tempImg.onerror = function () {
                    };
                    tempImg.src = img.dataset.src;

                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px',
            threshold: 0.1
        });

        // 选择所有懒加载图片
        const lazyImages = document.querySelectorAll('img.lazy');

        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
})();