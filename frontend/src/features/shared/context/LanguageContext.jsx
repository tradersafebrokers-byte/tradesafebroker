import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../translations/translations.js';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'tradesafe_detected_country_lang';

// Map Country Codes (from IP Geolocation) to Supported Languages
const COUNTRY_TO_LANG_MAP = {
  // Arabic Countries (MENA & Gulf)
  AE: 'ar', SA: 'ar', EG: 'ar', KW: 'ar', QA: 'ar', OM: 'ar', BH: 'ar',
  IQ: 'ar', JO: 'ar', LB: 'ar', LY: 'ar', MA: 'ar', DZ: 'ar', TN: 'ar',
  SY: 'ar', YE: 'ar', SD: 'ar', PS: 'ar',

  // Russian & CIS Countries
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru', UZ: 'ru', TJ: 'ru', AM: 'ru',

  // India
  IN: 'hi',

  // Spanish (Spain & Latin America)
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es',
  EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es',
  SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es', PR: 'es',

  // French
  FR: 'fr', BE: 'fr', SN: 'fr', CI: 'fr', CM: 'fr', CD: 'fr', MG: 'fr',

  // German
  DE: 'de', AT: 'de', CH: 'de',

  // Portuguese
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt',

  // Chinese
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh', SG: 'zh',

  // Turkish
  TR: 'tr', CY: 'tr',

  // Vietnamese
  VN: 'vi',

  // Urdu / Pakistan
  PK: 'ur',
};

// Map Timezones to Language for 0ms Instant Client-Side Detection
const TIMEZONE_PREFIX_MAP = [
  // Arabic
  { matches: ['Dubai', 'Riyadh', 'Kuwait', 'Qatar', 'Bahrain', 'Muscat', 'Cairo', 'Baghdad', 'Amman', 'Beirut', 'Tripoli', 'Casablanca', 'Algiers', 'Tunis', 'Damascus', 'Aden', 'Khartoum'], lang: 'ar' },
  // Russian
  { matches: ['Moscow', 'Samara', 'Yekaterinburg', 'Omsk', 'Novosibirsk', 'Krasnoyarsk', 'Irkutsk', 'Yakutsk', 'Vladivostok', 'Magadan', 'Kamchatka', 'Minsk', 'Almaty', 'Tashkent', 'Bishkek'], lang: 'ru' },
  // India
  { matches: ['Kolkata', 'Calcutta'], lang: 'hi' },
  // Spanish
  { matches: ['Madrid', 'Mexico_City', 'Bogota', 'Buenos_Aires', 'Santiago', 'Lima', 'Caracas', 'Guatemala', 'Havana', 'Montevideo', 'Panama', 'Guayaquil', 'La_Paz', 'Asuncion', 'San_Jose', 'Santo_Domingo'], lang: 'es' },
  // French
  { matches: ['Paris', 'Brussels', 'Dakar', 'Abidjan', 'Montreal'], lang: 'fr' },
  // German
  { matches: ['Berlin', 'Vienna', 'Zurich'], lang: 'de' },
  // Portuguese
  { matches: ['Sao_Paulo', 'Fortaleza', 'Manaus', 'Lisbon'], lang: 'pt' },
  // Chinese
  { matches: ['Shanghai', 'Chongqing', 'Harbin', 'Urumqi', 'Hong_Kong', 'Taipei', 'Macau', 'Singapore'], lang: 'zh' },
  // Turkish
  { matches: ['Istanbul'], lang: 'tr' },
  // Vietnamese
  { matches: ['Ho_Chi_Minh', 'Saigon', 'Bangkok'], lang: 'vi' },
  // Urdu
  { matches: ['Karachi'], lang: 'ur' },
];

/**
 * 0ms Instant Location Detector using Client Timezone & Browser Locales
 */
const detectLocationLanguageFast = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }

    // 1. Timezone Check (Identifies physical location/country instantly)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    for (const rule of TIMEZONE_PREFIX_MAP) {
      if (rule.matches.some((city) => tz.includes(city))) {
        return rule.lang;
      }
    }

    // 2. Browser Locales Check
    const browserLocales = navigator.languages || [navigator.language || navigator.userLanguage || 'en'];
    for (const rawLocale of browserLocales) {
      if (!rawLocale) continue;
      const primary = rawLocale.toLowerCase().split('-')[0];
      const matched = SUPPORTED_LANGUAGES.find((l) => l.code === primary);
      if (matched) {
        return matched.code;
      }
    }
  } catch (e) {
    console.warn('Could not auto-detect location language:', e);
  }
  return 'en';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => detectLocationLanguageFast());

  // Background IP-based country detection to confirm exact geographic location
  useEffect(() => {
    let isCancelled = false;

    const detectByIp = async () => {
      try {
        // Fast lightweight public IP Geo API
        const res = await fetch('https://ipwho.is/', {
          signal: AbortSignal.timeout(2800),
        });
        if (res.ok) {
          const data = await res.json();
          const countryCode = data?.country_code?.toUpperCase();
          if (countryCode && COUNTRY_TO_LANG_MAP[countryCode]) {
            const detectedLang = COUNTRY_TO_LANG_MAP[countryCode];
            if (!isCancelled && detectedLang !== language) {
              setLanguageState(detectedLang);
              localStorage.setItem(STORAGE_KEY, detectedLang);
            }
          }
        }
      } catch {
        // Fallback silently if offline or blocked
      }
    };

    detectByIp();
    return () => {
      isCancelled = true;
    };
  }, [language]);

  const currentLangConfig = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const isRtl = useMemo(() => {
    return currentLangConfig.dir === 'rtl';
  }, [currentLangConfig]);

  // Sync HTML root attributes (dir and lang)
  useEffect(() => {
    try {
      document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', language);
      localStorage.setItem(STORAGE_KEY, language);
    } catch (e) {
      console.warn('Failed to persist language:', e);
    }
  }, [language, isRtl]);

  const setLanguage = useCallback((langCode) => {
    if (SUPPORTED_LANGUAGES.some((l) => l.code === langCode)) {
      setLanguageState(langCode);
    }
  }, []);

  /**
   * Safe translation lookup with fallback hierarchy:
   * 1. TRANSLATIONS[language][key]
   * 2. TRANSLATIONS['en'][key]
   * 3. fallback or key
   */
  const t = useCallback(
    (key, fallback = null) => {
      if (!key) return '';
      const currentDict = TRANSLATIONS[language];
      if (currentDict && currentDict[key] !== undefined) {
        return currentDict[key];
      }
      const defaultDict = TRANSLATIONS.en;
      if (defaultDict && defaultDict[key] !== undefined) {
        return defaultDict[key];
      }
      return fallback !== null ? fallback : key;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      isRtl,
      currentLangConfig,
      SUPPORTED_LANGUAGES,
    }),
    [language, setLanguage, t, isRtl, currentLangConfig]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key, fallback) => fallback || key,
      isRtl: false,
      currentLangConfig: SUPPORTED_LANGUAGES[0],
      SUPPORTED_LANGUAGES,
    };
  }
  return context;
};

export default useLanguage;
