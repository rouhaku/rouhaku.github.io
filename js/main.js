document.addEventListener('DOMContentLoaded', () => {
    // --- i18n Logic ---

    // Locale codes browsers report that have no dictionary of their own.
    // Without these, zh-CN/zh-TW/zh-HK/zh-SG never reach the zh-Hans/zh-Hant
    // dictionaries that do exist, and fall all the way back to English.
    const LANG_ALIASES = {
        'zh': 'zh-Hans',
        'zh-CN': 'zh-Hans',
        'zh-SG': 'zh-Hans',
        'zh-HK': 'zh-Hant',
        'zh-TW': 'zh-Hant',
        'no': 'nb',
        'nn': 'nb',
        'es-419': 'es-MX',
        'pt-PT': 'pt'
    };

    // Case-insensitive index of everything resolvable, built once after
    // translations.js has finished generating its stubs. A real dictionary
    // always wins over an alias, so adding e.g. a "zh" dictionary later
    // silently takes precedence rather than being shadowed by the alias.
    const LOCALE_LOOKUP = {};
    Object.keys(TRANSLATIONS).forEach(key => {
        LOCALE_LOOKUP[key.toLowerCase()] = key;
    });
    Object.keys(LANG_ALIASES).forEach(alias => {
        const key = alias.toLowerCase();
        const target = LANG_ALIASES[alias];
        if (TRANSLATIONS[target] && !LOCALE_LOOKUP[key]) LOCALE_LOOKUP[key] = target;
    });

    // Resolve a BCP-47 tag to a key that exists in TRANSLATIONS: try the whole
    // tag, then drop one subtag at a time. This reaches zh-Hans from
    // zh-Hans-CN and en from en-NZ, where splitting on the first hyphen would
    // land on the non-existent "zh" / lose the region entirely.
    const resolveLanguage = (tag) => {
        if (!tag) return null;
        const parts = String(tag).toLowerCase().split('-');
        while (parts.length) {
            const hit = LOCALE_LOOKUP[parts.join('-')];
            if (hit) return hit;
            parts.pop();
        }
        return null;
    };

    const getLanguage = () => {
        const params = new URLSearchParams(window.location.search);
        // ?lang= goes through the same resolver, so ?lang=zh-CN is testable.
        const fromQuery = resolveLanguage(params.get('lang'));
        if (fromQuery) return fromQuery;

        return resolveLanguage(navigator.language || navigator.userLanguage) || 'en';
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

        // RTL Support (ar = Arabic, he = Hebrew, ur = Urdu)
        const isRTL = ['ar', 'he', 'ur'].includes(lang.split('-')[0]);
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
