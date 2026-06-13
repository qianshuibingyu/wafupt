(function () {
    var ADS_ID = 'AW-17790114591';
    var CONVERSION_SEND_TO = 'AW-17790114591/ujr9CP-_iN4bEJ-2_qJC';
    var CONSENT_KEY = 'wafu_analytics_consent';
    var loaded = false;
    var loadingPromise = null;

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;

    function hasHeadGtag() {
        return !!document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    }

    function grantConsent() {
        try {
            localStorage.setItem(CONSENT_KEY, '1');
        } catch (e) { /* ignore */ }

        gtag('consent', 'update', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: 'granted'
        });
    }

    function hasStoredConsent() {
        try {
            return localStorage.getItem(CONSENT_KEY) === '1';
        } catch (e) {
            return false;
        }
    }

    function loadClarity() {
        if (document.querySelector('script[src*="clarity.ms/tag/"]')) return;

        var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        var saveData = conn && conn.saveData;
        var isDesktop = window.matchMedia('(min-width: 959px)').matches;
        if (saveData || !isDesktop) return;

        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
            t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
            y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, 'clarity', 'script', 'vcismxw19t');
    }

    function loadAnalytics() {
        if (loaded) return Promise.resolve();
        if (loadingPromise) return loadingPromise;

        grantConsent();

        if (hasHeadGtag()) {
            loaded = true;
            loadClarity();
            return Promise.resolve();
        }

        loadingPromise = new Promise(function (resolve) {
            gtag('js', new Date());
            gtag('config', ADS_ID, {
                allow_google_signals: false,
                allow_ad_personalization_signals: false
            });

            var gtagScript = document.createElement('script');
            gtagScript.async = true;
            gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + ADS_ID;
            gtagScript.onload = function () {
                loaded = true;
                loadClarity();
                resolve();
            };
            gtagScript.onerror = function () {
                loaded = true;
                resolve();
            };
            document.head.appendChild(gtagScript);
        });

        return loadingPromise;
    }

    function enableAnalytics() {
        return loadAnalytics();
    }

    function trackConversion(sendTo, options) {
        var payload = Object.assign({
            send_to: sendTo || CONVERSION_SEND_TO,
            value: 1.0,
            currency: 'CNY'
        }, options || {});

        return loadAnalytics().then(function () {
            gtag('event', 'conversion', payload);
        });
    }

    function isContactPage() {
        return /\/contact(?:\.html)?\/?$/i.test(location.pathname);
    }

    function bindContactIntent() {
        document.addEventListener('click', function (e) {
            var target = e.target.closest(
                'a[href*="wa.me"], a[href^="tel:"], a[href^="mailto:"], .kefu-item, .float-kefu a, a[href*="contact"]'
            );
            if (target) enableAnalytics();
        }, { passive: true, capture: true });

        document.addEventListener('focusin', function (e) {
            if (e.target.closest('#contactForm')) enableAnalytics();
        }, true);

        document.addEventListener('submit', function (e) {
            if (e.target.closest('#contactForm')) enableAnalytics();
        }, true);
    }

    function scheduleOptionalAnalytics() {
        if (!hasStoredConsent() && !isContactPage()) return;

        var delay = isContactPage() ? 12000 : 8000;

        function trigger() {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(function () { enableAnalytics(); }, { timeout: delay });
            } else {
                setTimeout(enableAnalytics, delay);
            }
        }

        if (document.readyState === 'complete') {
            trigger();
        } else {
            window.addEventListener('load', trigger, { once: true });
        }
    }

    window.WafuAnalytics = {
        enable: enableAnalytics,
        trackConversion: trackConversion,
        CONVERSION_SEND_TO: CONVERSION_SEND_TO
    };

    bindContactIntent();
    scheduleOptionalAnalytics();
})();
