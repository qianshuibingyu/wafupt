(function () {
    function trackConversion() {
        if (window.WafuAnalytics && typeof window.WafuAnalytics.trackConversion === 'function') {
            return window.WafuAnalytics.trackConversion();
        }
        if (typeof gtag === 'function') {
            gtag('event', 'conversion', {
                send_to: 'AW-17790114591/ujr9CP-_iN4bEJ-2_qJC',
                value: 1.0,
                currency: 'CNY'
            });
        }
        return Promise.resolve();
    }

    function initContactForm() {
        var form = document.getElementById('contactForm');
        if (!form || form.dataset.contactReady === 'true') return true;

        form.dataset.contactReady = 'true';

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var name = document.getElementById('name').value.trim();
            var phone = document.getElementById('phone').value.trim();
            var email = document.getElementById('email').value.trim();
            var product = document.getElementById('product').value.trim();
            var scenario = document.getElementById('scenario').value.trim();
            var message = document.getElementById('message').value.trim();

            if (!name || !phone) {
                alert('Por favor, preencha o nome/nome da empresa e o número de telefone.');
                return;
            }

            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('Por favor, insira um endereço de e-mail válido ou deixe em branco.');
                return;
            }

            var submitBtn = form.querySelector('.submit-btn, button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.dataset.originalText = submitBtn.textContent;
                submitBtn.textContent = 'A enviar...';
            }

            fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, phone: phone, email: email, product: product, scenario: scenario, message: message })
            }).then(function (response) {
                return response.json().then(function (data) {
                    if (!response.ok) throw new Error(data.error || 'Falha no envio');
                    return data;
                });
            }).then(function () {
                return trackConversion();
            }).then(function () {
                alert('As informações foram enviadas. Entraremos em contacto o mais breve possível.');
                form.reset();
            }).catch(function (err) {
                console.error('Contact form send failed:', err);
                alert('Falha no envio. Por favor, tente novamente mais tarde ou envie e-mail para wafutechnology@outlook.com');
            }).finally(function () {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = submitBtn.dataset.originalText || 'Enviar mensagem';
                }
            });
        });

        return true;
    }

    window.initContactForm = initContactForm;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContactForm);
    } else {
        initContactForm();
    }
})();
