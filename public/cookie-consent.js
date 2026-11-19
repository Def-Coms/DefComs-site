document.addEventListener('DOMContentLoaded', () => {
    // Resolve the site root from this script's own URL so injected links work
    // at any directory depth (cookie-consent.js is always loaded from the root).
    const _self = document.querySelector('script[src*="cookie-consent.js"]');
    const _root = (_self && _self.src) ? _self.src.slice(0, _self.src.lastIndexOf('/') + 1) : '';
    const privacyUrl = '/privacy';

    // Check if the user has already made a choice
    const consent = localStorage.getItem('cookie_consent');

    // If choice already made, do not render banner
    if (consent === 'accepted' || consent === 'declined') {
        return;
    }

    // Create the cookie banner HTML structure
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.id = 'cookie-consent-banner';

    banner.innerHTML = `
        <div class="cookie-content">
            <h4 class="cookie-title">
                <span>🛡️</span> Защита на данните & Бисквитки
            </h4>
            <p class="cookie-text">
                Нашият портал използва бисквитки (cookies), за да гарантираме оптимална функционалност, висока сигурност и за анализиране на посещенията съгласно GDPR и Директивата ePrivacy. Научете повече в нашата <a href="${privacyUrl}">Политика за поверителност</a>.
            </p>
        </div>
        <div class="cookie-buttons">
            <button class="cookie-btn cookie-btn-decline" id="cookie-decline-btn">Само необходими</button>
            <button class="cookie-btn cookie-btn-accept" id="cookie-accept-btn">Приемам всички</button>
        </div>
    `;

    // Append banner to the body
    document.body.appendChild(banner);

    // Trigger display animation with a slight delay for high-tech transition effect
    setTimeout(() => {
        banner.classList.add('show');
    }, 100);

    // Accept All handler
    const acceptBtn = document.getElementById('cookie-accept-btn');
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookie_consent', 'accepted');
            dismissBanner();
        });
    }

    // Decline/Only Necessary handler
    const declineBtn = document.getElementById('cookie-decline-btn');
    if (declineBtn) {
        declineBtn.addEventListener('click', () => {
            localStorage.setItem('cookie_consent', 'declined');
            dismissBanner();
        });
    }

    // Animation out and DOM cleanup helper function
    function dismissBanner() {
        banner.classList.remove('show');
        // Wait for the slide-out CSS transition before removing element from DOM
        setTimeout(() => {
            banner.remove();
        }, 600);
    }
});
