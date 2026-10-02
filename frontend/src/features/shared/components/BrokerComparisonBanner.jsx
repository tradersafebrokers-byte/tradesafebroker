import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MacbookScrollChoreography from '../../../macbook/MacbookScrollChoreography';
import useLanguage from '../context/LanguageContext.jsx';

const BrokerComparisonBanner = ({ onStartComparing }) => {
  const { t } = useLanguage();
  const bannerRef = useRef(null);
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCompareClick = (e) => {
    if (typeof onStartComparing === 'function') {
      onStartComparing(e);
    } else {
      navigate('/compare');
    }
  };

  return (
    <section ref={bannerRef} id="comparisons" className="broker-comp-section" aria-label="Compare Brokers Side by Side">
      <div className="broker-comp-container">
        <motion.div
          className="broker-comp-card"
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Ambient Subtle Teal Glow with Gentle Pulse */}
          <motion.div
            className="comp-card-glow"
            aria-hidden="true"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.6, 0.85, 0.6],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Left Column: Content & CTA with cascading scroll entrance */}
          <motion.div
            className="comp-left-content"
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="comp-eyebrow-wrapper"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.18 }}
            >
              <span className="comp-boxed">
                {/* 4 Connected Animated Border Lines */}
                <span className="boxed-border-lines" aria-hidden="true">
                  <motion.span
                    className="border-line-segment line-top"
                    variants={{
                      hidden: { scaleX: 0 },
                      visible: {
                        scaleX: 1,
                        transition: { duration: 0.22, ease: 'easeOut', delay: 0.1 },
                      },
                    }}
                  />
                  <motion.span
                    className="border-line-segment line-right"
                    variants={{
                      hidden: { scaleY: 0 },
                      visible: {
                        scaleY: 1,
                        transition: { duration: 0.22, ease: 'easeOut', delay: 0.32 },
                      },
                    }}
                  />
                  <motion.span
                    className="border-line-segment line-bottom"
                    variants={{
                      hidden: { scaleX: 0 },
                      visible: {
                        scaleX: 1,
                        transition: { duration: 0.22, ease: 'easeOut', delay: 0.54 },
                      },
                    }}
                  />
                  <motion.span
                    className="border-line-segment line-left"
                    variants={{
                      hidden: { scaleY: 0 },
                      visible: {
                        scaleY: 1,
                        transition: { duration: 0.22, ease: 'easeOut', delay: 0.76 },
                      },
                    }}
                  />
                </span>

                {/* Animated Inner Ambient Glow */}
                <motion.span
                  className="comp-boxed-glow"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { duration: 0.5, delay: 0.75 },
                    },
                  }}
                  aria-hidden="true"
                />

                <span className="comp-boxed-text">{t('comp_banner_eyebrow', 'BROKER COMPARISON')}</span>

                {/* 4 Animated Corner Handle Dots */}
                <span className="corner-handles" aria-hidden="true">
                  <motion.span
                    className="handle-dot handle-tl"
                    variants={{
                      hidden: { scale: 0, opacity: 0 },
                      visible: {
                        scale: 1,
                        opacity: 1,
                        transition: { type: 'spring', stiffness: 450, damping: 18, delay: 0.1 },
                      },
                    }}
                  />
                  <motion.span
                    className="handle-dot handle-tr"
                    variants={{
                      hidden: { scale: 0, opacity: 0 },
                      visible: {
                        scale: 1,
                        opacity: 1,
                        transition: { type: 'spring', stiffness: 450, damping: 18, delay: 0.32 },
                      },
                    }}
                  />
                  <motion.span
                    className="handle-dot handle-br"
                    variants={{
                      hidden: { scale: 0, opacity: 0 },
                      visible: {
                        scale: 1,
                        opacity: 1,
                        transition: { type: 'spring', stiffness: 450, damping: 18, delay: 0.54 },
                      },
                    }}
                  />
                  <motion.span
                    className="handle-dot handle-bl"
                    variants={{
                      hidden: { scale: 0, opacity: 0 },
                      visible: {
                        scale: 1,
                        opacity: 1,
                        transition: { type: 'spring', stiffness: 450, damping: 18, delay: 0.76 },
                      },
                    }}
                  />
                </span>
              </span>
            </motion.div>

            <motion.h2
              className="comp-headline"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              {t('comp_banner_title', 'Compare Brokers Side by Side')}
            </motion.h2>

            <motion.p
              className="comp-description"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {t('comp_banner_desc', 'Analyze fees, trading conditions, platforms and more to find your perfect match.')}
            </motion.p>

            {/* Mobile Feature Highlights Chips */}
            <div className="comp-mobile-badges" aria-hidden="true">
              <span className="comp-mini-pill">
                <span className="comp-mini-dot" /> {t('comp_banner_pill_spreads', 'Live Spreads')}
              </span>
              <span className="comp-mini-pill">
                <span className="comp-mini-dot" /> {t('comp_banner_pill_matrix', 'Side-by-Side Matrix')}
              </span>
              <span className="comp-mini-pill">
                <span className="comp-mini-dot" /> {t('comp_banner_pill_fees', 'Verified Fees')}
              </span>
            </div>

            <button
              type="button"
              className="comp-cta-btn"
              onClick={handleCompareClick}
              aria-label="Start Comparing Brokers"
            >
              <span>{t('comp_banner_cta', 'Start Comparing')}</span>
              <svg
                className="comp-btn-arrow"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </motion.div>

          {/* Right Column: 3D Apple MacBook Pro with Scroll Choreography (Desktop/Tablet Only) */}
          {!isMobile && (
            <div className="comp-right-visual">
              <MacbookScrollChoreography scrollContainerRef={bannerRef} />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default React.memo(BrokerComparisonBanner);
