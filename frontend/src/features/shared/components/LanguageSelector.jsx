import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';
import useLanguage from '../context/LanguageContext.jsx';
import './LanguageSelector.css';

export const LanguageSelector = ({ variant = 'default', showLabel = true }) => {
  const { language, setLanguage, currentLangConfig, SUPPORTED_LANGUAGES, isRtl } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
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
    <div className={`lang-selector-container ${variant} ${isRtl ? 'is-rtl' : ''}`} ref={dropdownRef}>
      <button
        type="button"
        className={`lang-selector-trigger ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Change Language / تغيير اللغة / Сменить язык"
      >
        <span className="lang-trigger-globe" aria-hidden="true">
          <Globe size={15} />
        </span>
        <span className="lang-trigger-flag">{currentLangConfig.flag}</span>
        {showLabel && (
          <span className="lang-trigger-text">{currentLangConfig.nativeName}</span>
        )}
        <ChevronDown size={12} className={`lang-chevron ${isOpen ? 'rotated' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="lang-dropdown-menu"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            role="listbox"
          >
            <div className="lang-dropdown-header">
              <Globe size={13} />
              <span>Select Language</span>
            </div>

            <div className="lang-options-grid">
              {SUPPORTED_LANGUAGES.map((item) => {
                const isSelected = item.code === language;
                return (
                  <button
                    key={item.code}
                    type="button"
                    className={`lang-option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(item.code)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="lang-option-flag">{item.flag}</span>
                    <div className="lang-option-names">
                      <span className="lang-native-name">{item.nativeName}</span>
                      <span className="lang-english-name">{item.name}</span>
                    </div>
                    {isSelected && (
                      <span className="lang-check-icon">
                        <Check size={14} />
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

export default LanguageSelector;
