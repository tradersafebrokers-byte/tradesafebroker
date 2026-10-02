import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronUp, Check } from 'lucide-react';
import useLanguage from '../context/LanguageContext.jsx';
import './FooterLanguageSelector.css';

export const FooterLanguageSelector = () => {
  const { language, setLanguage, currentLangConfig, SUPPORTED_LANGUAGES, isRtl } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`pw-footer-lang-container ${isRtl ? 'is-rtl' : ''}`} ref={dropdownRef}>
      <button
        type="button"
        className={`pw-footer-lang-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Change Language / تغيير اللغة / Язык"
      >
        <Globe size={14} className="pw-footer-lang-globe" />
        <span className="pw-footer-lang-flag">{currentLangConfig.flag}</span>
        <span className="pw-footer-lang-label">{currentLangConfig.nativeName}</span>
        <ChevronUp size={13} className={`pw-footer-lang-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="pw-footer-lang-popover"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            role="listbox"
          >
            <div className="pw-footer-lang-popover-header">
              <Globe size={13} />
              <span>Select Language / اختر اللغة</span>
            </div>

            <div className="pw-footer-lang-list">
              {SUPPORTED_LANGUAGES.map((item) => {
                const isSelected = item.code === language;
                return (
                  <button
                    key={item.code}
                    type="button"
                    className={`pw-footer-lang-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(item.code)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="pw-lang-item-flag">{item.flag}</span>
                    <div className="pw-lang-item-text">
                      <span className="pw-lang-item-native">{item.nativeName}</span>
                      <span className="pw-lang-item-en">{item.name}</span>
                    </div>
                    {isSelected && (
                      <span className="pw-lang-item-check">
                        <Check size={13} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FooterLanguageSelector;
