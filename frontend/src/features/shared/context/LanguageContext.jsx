import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../translations/translations.js';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'tradesafe_language';

/**
 * Helper to detect preferred language based on browser/system locale
 */
const detectUserLanguage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }

    const browserLocales = navigator.languages || [navigator.language || navigator.userLanguage || 'en'];
    for (const rawLocale of browserLocales) {
      if (!rawLocale) continue;
      const primary = rawLocale.toLowerCase().split('-')[0];

      // Exact match with supported codes
      const matched = SUPPORTED_LANGUAGES.find((l) => l.code === primary);
      if (matched) {
        return matched.code;
      }
    }
  } catch (e) {
    console.warn('Could not auto-detect browser language:', e);
  }
  return 'en';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => detectUserLanguage());

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
    // Graceful fallback if used outside provider
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
