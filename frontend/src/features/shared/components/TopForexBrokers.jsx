import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TOP_BROKERS_DATA } from '../../brokers/data/brokersData.jsx';
import { useBrokers } from '../../brokers/hooks/useBrokers.js';
import { BrokerLogo } from '../../brokers/components/BrokerLogo.jsx';
import useLanguage from '../context/LanguageContext.jsx';

const TopForexBrokers = ({ onSelectBroker }) => {
  const { t } = useLanguage();
  const { brokers } = useBrokers();
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollLimits = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    const nextLeft = scrollLeft > 10;
    const nextRight = scrollLeft < scrollWidth - clientWidth - 10;
    setCanScrollLeft((prev) => (prev === nextLeft ? prev : nextLeft));
    setCanScrollRight((prev) => (prev === nextRight ? prev : nextRight));
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    checkScrollLimits();
    el.addEventListener('scroll', checkScrollLimits, { passive: true });
    window.addEventListener('resize', checkScrollLimits);
    return () => {
      el.removeEventListener('scroll', checkScrollLimits);
      window.removeEventListener('resize', checkScrollLimits);
    };
  }, []);

  const handlePrev = () => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: -310, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: 310, behavior: 'smooth' });
  };

  return (
    <section className="top-brokers-section" aria-label="Top Forex Brokers">
      <div className="top-brokers-container">
        {/* Header with Title, Subtitle, and Carousel Controls */}
        <div className="top-brokers-header">
          <motion.div
            className="top-brokers-title-wrap"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            <h2 className="top-brokers-title">
              <motion.span
                className="top-brokers-boxed"
                variants={{
                  hidden: { opacity: 0, y: 14, scale: 0.98 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
              >
                {/* 4 Connected Animated Border Lines (Guaranteed 100% full rectangle trace) */}
                <span className="boxed-border-lines" aria-hidden="true">
                  {/* Top Line: Left to Right */}
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
                  {/* Right Line: Top to Bottom */}
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
                  {/* Bottom Line: Right to Left */}
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
                  {/* Left Line: Bottom to Top */}
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
                  className="top-brokers-boxed-glow"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { duration: 0.5, delay: 0.75 },
                    },
                  }}
                  aria-hidden="true"
                />

                {/* Animated Text */}
                <motion.span
                  className="top-brokers-text"
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.08 },
                    },
                  }}
                >
                  {t('top_brokers_heading', 'Top Forex Brokers')}
                </motion.span>

                {/* 4 Animated Corner Handle Dots (Synchronized to line arrivals) */}
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
              </motion.span>
            </h2>

            <motion.p
              className="top-brokers-subtitle"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.35 },
                },
              }}
            >
              {t('top_brokers_subheading', 'Compare real trading conditions, fees, platforms, and user reviews.')}
            </motion.p>
          </motion.div>

          <div className="top-brokers-header-actions">
            <Link to="/brokers" className="top-brokers-see-all-cta" aria-label="See all forex brokers">
              <span>{t('top_brokers_see_all', 'See All Brokers')}</span>
              <span className="see-all-count-pill">16+</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

            <div className="top-brokers-nav-btns" aria-label="Carousel navigation">
              <button
                type="button"
                className={`carousel-nav-btn ${!canScrollLeft ? 'is-disabled' : ''}`}
                onClick={handlePrev}
                disabled={!canScrollLeft}
                aria-label="Previous brokers"
              >
                <svg
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
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <button
                type="button"
                className={`carousel-nav-btn ${!canScrollRight ? 'is-disabled' : ''}`}
                onClick={handleNext}
                disabled={!canScrollRight}
                aria-label="Next brokers"
              >
                <svg
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
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Cards Track */}
        <motion.div
          className="top-brokers-carousel-viewport"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <div className="top-brokers-carousel-track" ref={carouselRef}>
            {(brokers && brokers.length > 0 ? brokers.slice(0, 10) : TOP_BROKERS_DATA).map((broker) => (
              <div key={broker.id} className="broker-card">
                {/* Top Row: Rank Tag and Logo */}
                <div className="broker-card-top">
                  <span
                    className={`broker-rank-badge rank-badge-${
                      broker.rankNum <= 3 ? broker.rankNum : 'other'
                    }`}
                  >
                    {broker.rank}
                  </span>

                  <div className="broker-card-logo-wrap">
                    <BrokerLogo broker={broker} />
                  </div>
                </div>

                {/* Rating & Review Count with Quick Review Button */}
                <div className="broker-card-rating-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span className="broker-star-icon" aria-hidden="true">★</span>
                    <span className="broker-rating-num">{broker.rating}</span>
                    <span className="broker-reviews-count">({broker.reviewsCount})</span>
                  </div>
                  <button
                    type="button"
                    className="broker-card-quick-review-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.dispatchEvent(new CustomEvent('open_review_modal', { detail: { broker, openWrite: true } }));
                    }}
                    title={`Write a verified review for ${broker.name}`}
                  >
                    {t('top_brokers_review_btn', '★ Review')}
                  </button>
                </div>

                {/* Highlight Badge Pill & Verified Badge */}
                <div className="broker-card-badge-wrap" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span className={`broker-highlight-pill pill-theme-${broker.badgeTheme || 'emerald'}`}>
                    {broker.highlightBadge}
                  </span>
                  {(broker.isVerified || broker.isVerifiedPartner) && (
                    <span
                      className="broker-verified-badge"
                      style={{
                        background: 'rgba(16, 185, 129, 0.16)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        borderRadius: '12px',
                        padding: '2px 8px',
                        fontSize: '10px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        letterSpacing: '0.02em',
                      }}
                      title="TradeSafeBrokers Verified Partner & Genuine Broker"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {t('top_brokers_verified', 'Verified Broker')}
                    </span>
                  )}
                </div>

                {/* Specs List Grid */}
                <div className="broker-card-specs">
                  <div className="spec-row">
                    <span className="spec-label">{t('spec_min_deposit', 'Min. Deposit')}</span>
                    <span className="spec-value spec-value-deposit spec-value-strong">{broker.minDeposit}</span>
                  </div>

                  <div className="spec-row">
                    <span className="spec-label">{t('spec_spread', 'Spread')}</span>
                    <span className="spec-value spec-value-spread">{broker.spread}</span>
                  </div>

                  <div className="spec-row">
                    <span className="spec-label">{t('spec_regulation', 'Regulation')}</span>
                    <span className="spec-value spec-value-regulation">{broker.regulation}</span>
                  </div>

                  <div className="spec-row">
                    <span className="spec-label">{t('spec_platforms', 'Platforms')}</span>
                    <span className="spec-value spec-value-platforms">{broker.platforms}</span>
                  </div>
                </div>

                {/* Dark CTA Button */}
                <Link
                  to={`/reviews/${broker.slug || broker.id}`}
                  className="broker-card-cta-btn"
                  aria-label={`View review for ${broker.name}`}
                >
                  <span>{t('view_review_btn', 'View Review')}</span>
                  <svg
                    className="broker-btn-arrow"
                    width="15"
                    height="15"
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
                </Link>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Directory Access Banner */}
        <motion.div
          className="top-brokers-bottom-banner"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="bottom-banner-text">
            <h4>{t('top_brokers_bottom_title', 'Looking for more brokers or specific criteria?')}</h4>
            <p>{t('top_brokers_bottom_desc', 'Access our complete directory of verified brokers with real spreads, zero swap fees & tier-1 regulations.')}</p>
          </div>
          <Link to="/brokers" className="bottom-banner-btn" aria-label="Explore all brokers directory">
            <span>{t('top_brokers_explore_dir', 'Explore All Brokers')}</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default React.memo(TopForexBrokers);
