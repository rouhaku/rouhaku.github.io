document.addEventListener('DOMContentLoaded', () => {
    // --- i18n Logic ---
    const getLanguage = () => {
        const params = new URLSearchParams(window.location.search);
        const langParam = params.get('lang');
        if (langParam && TRANSLATIONS[langParam]) return langParam;

        // Try exact match first (e.g. en-AU), then base match (en)
        const navLang = navigator.language || navigator.userLanguage;
        if (TRANSLATIONS[navLang]) return navLang;

        const shortLang = navLang.split('-')[0];
        return TRANSLATIONS[shortLang] ? shortLang : 'en';
    };

    const applyTranslations = (lang) => {
        const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
        
        // Translate regular textual elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            // Fallback chain: Selected Lang -> English -> Japanese (final safety)
            const translation = t[key] || TRANSLATIONS['en'][key] || TRANSLATIONS['ja'][key];
            if (translation) {
                el.textContent = translation;
            }
        });

        // Set Document Title and Meta Description
        if (t['page_title']) document.title = t['page_title'];
        const descriptionMeta = document.querySelector('meta[name="description"]');
        if (descriptionMeta && t['meta_description']) {
            descriptionMeta.setAttribute('content', t['meta_description']);
        }

        // RTL Support (ar = Arabic, he = Hebrew)
        const isRTL = ['ar', 'he'].includes(lang.split('-')[0]);
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;

        // Handle App-specific Links (Privacy & Contact)
        const appLinks = {
            'packetloss': {
                privacy: 'https://rouhaku.github.io/PacketLoss-SpeedScan-Privacy-Policy-Pages/',
                contact: 'https://forms.gle/rtELZUBH3G62QxMu5'
            },
            'videncobox': {
                privacy: 'https://rouhaku.github.io/VidEncoBox-Privacy-Policy-Pages/',
                contact: 'https://forms.gle/36QmfxV3Cooq11uP8'
            }
        };

        // Update Privacy Links
        document.querySelectorAll('.privacy-link').forEach(link => {
            const app = link.getAttribute('data-app');
            if (appLinks[app]) {
                link.href = appLinks[app].privacy;
                link.target = '_blank';
            }
        });

        // Update Contact Links
        document.querySelectorAll('.contact-link').forEach(link => {
            const app = link.getAttribute('data-app');
            if (appLinks[app]) {
                link.href = appLinks[app].contact;
                link.target = '_blank';
            }
        });
    };

    const currentLang = getLanguage();
    applyTranslations(currentLang);

    // --- Visual Animations ---
    const observeCards = () => {
        const cards = document.querySelectorAll('.app-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`;
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        });
    };
    observeCards();
});
