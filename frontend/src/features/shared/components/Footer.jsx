import React, { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, Shield, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContactModal from '../../contact/components/ContactModal.jsx';
import FooterDetailModal from './FooterDetailModal.jsx';
import FooterLanguageSelector from './FooterLanguageSelector.jsx';
import apiClient from '../../auth/services/api.client.js';

export const ALL_FOOTER_SECTIONS = [
  {
    id: 'brokers',
    title: 'Top Forex Brokers',
    links: [
      { label: 'XM Review & Spreads', href: '/reviews/xm' },
      { label: 'Exness Review & Fees', href: '/reviews/exness' },
      { label: 'IC Markets Scalping', href: '/reviews/ic-markets', highlight: true },
      { label: 'Pepperstone ECN', href: '/reviews/pepperstone' },
      { label: 'FXTM Zero Spread', href: '/reviews/fxtm' },
      { label: 'AvaTrade Multi-Asset', href: '/reviews/avatrade' },
    ],
  },
  {
    id: 'compare',
    title: 'Compare Brokers',
    links: [
      { label: 'Compare Brokers Side by Side', href: '/compare', coral: true },
    ],
  },
  {
    id: 'tools',
    title: 'Trading Tools & Data',
    links: [
      { label: 'Pip Value Calculator', openModal: true },
      { label: 'Margin & Leverage Tool', openModal: true },
      { label: 'Live Spread Benchmarks', openModal: true, highlight: true },
      { label: 'Broker Withdrawal Speed Test', openModal: true },
      { label: 'License & Regulatory Check', openModal: true },
    ],
  },
  {
    id: 'company',
    title: 'About & Partners',
    links: [
      { label: 'About Our Mission', openModal: true },
      { label: 'Join as Broker', href: '/join-broker', joinBroker: true },
      { label: 'How We Rate Brokers', openModal: true },
      { label: 'Editorial Independence', openModal: true },
      { label: 'Trader Review Policy', openModal: true },
      { label: 'Contact Support & Desk', isContact: true, coral: true },
      { label: 'Privacy & Terms of Service', href: '/privacy' },
    ],
  },
];

const Footer = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [detailTopic, setDetailTopic] = useState(null);

  const [hiddenLinks, setHiddenLinks] = useState(() => {
    try {
      const saved = localStorage.getItem('pipwise_hidden_footer_links');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    apiClient
      .get('/contact/footer-settings')
      .then((res) => {
        if (Array.isArray(res.data?.data?.hiddenLinks)) {
          setHiddenLinks(res.data.data.hiddenLinks);
          try {
            localStorage.setItem('pipwise_hidden_footer_links', JSON.stringify(res.data.data.hiddenLinks));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const toggleSection = (id) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const handleLinkAction = (link, e) => {
    if (e) e.preventDefault();
    if (link.isContact) {
      setIsContactOpen(true);
      return;
    }
    if (link.openModal) {
      setDetailTopic(link.label);
      return;
    }
    if (link.href) {
      if (link.href.startsWith('/')) {
        navigate(link.href);
      } else if (link.href.startsWith('#')) {
        if (onNavigate) {
          onNavigate(link.href.replace('#', ''));
        } else {
          const el = document.querySelector(link.href);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <>
      <footer className="pipwise-footer" aria-label="Site Footer">
      <div className="pw-footer-container">
        {/* ════════════════════════════════════════════════════════════
            DESKTOP VIEW (Visible on desktop screens)
           ════════════════════════════════════════════════════════════ */}
        <div className="pw-footer-desktop">
          {/* Top Brand Bar */}
          <div className="pw-footer-brand-bar">
            <a href="/" className="pipwise-logo-brand" aria-label="TradeSafeBrokers Home">
              <div className="pipwise-candles" aria-hidden="true">
                <span className="candle-bar candle-bar-1" />
                <span className="candle-bar candle-bar-2" />
                <span className="candle-bar candle-bar-3" />
              </div>
              <span className="pipwise-logo-text">
                TradeSafe<span style={{ color: 'var(--brand-green, #fc5d21)' }}>Brokers</span>
              </span>
            </a>
            <p className="pw-footer-tagline">
              Independent, transparent forex broker comparisons and verified ratings for traders worldwide.
            </p>
          </div>

          {/* 5 Column Navigation Grid */}
          <div className="pw-footer-grid">
            {ALL_FOOTER_SECTIONS.map((section) => {
              const visibleLinks = section.links.filter((l) => !hiddenLinks.includes(l.label));
              return (
                <div key={section.id} className="pw-footer-col">
                  <h4 className="pw-footer-col-title">{section.title}</h4>
                  <ul className="pw-footer-links-list">
                    {visibleLinks.map((link, idx) => (
                      <li key={idx}>
                        <a
                          href={link.href || '#'}
                          onClick={(e) => handleLinkAction(link, e)}
                          className={`pw-footer-link ${link.highlight ? 'is-highlight' : ''} ${link.coral ? 'is-coral' : ''} ${link.joinBroker ? 'is-join-broker' : ''}`}
                        >
                          <span>{link.label}</span>
                          {link.joinBroker && <span className="pw-join-pill-tag">Partner</span>}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            {/* Column 5: Social Links & Independence Badge */}
            <div className="pw-footer-col pw-footer-col-community">
              <h4 className="pw-footer-col-title">Join Community</h4>
              <p className="pw-footer-social-desc">
                Follow real-time spread updates, broker alerts & trader news.
              </p>

              {/* Social Buttons */}
              <div className="pw-footer-social-cluster">
                {/* X / Twitter */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X (Twitter)"
                  className="pw-social-btn"
                >
                  <svg className="pw-social-svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="pw-social-btn pw-social-yt"
                >
                  <svg className="pw-social-svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="pw-social-btn pw-social-li"
                >
                  <svg className="pw-social-svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 0 0 1.45-1.45c0-.8-.65-1.45-1.45-1.45a1.45 1.45 0 0 0-1.45 1.45c0 .8.65 1.45 1.45 1.45m1.39 9.97V10.36H5.07v8.37h2.78Z" />
                  </svg>
                </a>

                {/* Telegram / Discord community */}
                <a
                  href="https://telegram.org"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram Community"
                  className="pw-social-btn pw-social-tg"
                >
                  <svg className="pw-social-svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                </a>
              </div>

              {/* Highlighted Join as Broker Card */}
              <Link
                to="/join-broker"
                className="pw-footer-join-broker-card"
                aria-label="Join as Broker"
              >
                <div className="pw-join-broker-tag">
                  <span className="pw-join-dot" />
                  <span>Broker Partnership</span>
                </div>
                <div className="pw-join-broker-title-row">
                  <span className="pw-join-broker-title">Join as Broker</span>
                  <ArrowRight size={14} className="pw-join-arrow" />
                </div>
                <span className="pw-join-broker-sub">List your brokerage on TradeSafeBrokers</span>
              </Link>

              {/* Verified Independence Trust Badge */}
              <div className="pw-footer-trust-badge">
                <div className="pw-trust-icon-box">
                  <Shield size={16} className="pw-trust-shield" />
                </div>
                <div className="pw-trust-meta">
                  <span className="pw-trust-title">100% Unbiased & Independent</span>
                  <span className="pw-trust-subtitle">Zero Pay-to-Rank • Real Broker Tests</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            MOBILE VIEW (Touch-Optimized Accordion)
           ════════════════════════════════════════════════════════════ */}
        <div className="pw-footer-mobile">
          {/* Top Brand Block */}
          <div className="pw-footer-mobile-brand">
            <a href="/" className="pipwise-logo-brand" aria-label="TradeSafeBrokers Home">
              <div className="pipwise-candles" aria-hidden="true">
                <span className="candle-bar candle-bar-1" />
                <span className="candle-bar candle-bar-2" />
                <span className="candle-bar candle-bar-3" />
              </div>
              <span className="pipwise-logo-text">
                TradeSafe<span style={{ color: 'var(--brand-green, #fc5d21)' }}>Brokers</span>
              </span>
            </a>
            <p className="pw-footer-mobile-desc">
              Independent forex broker reviews and comparisons for traders.
            </p>
          </div>

          {/* Trust Banner */}
          <div className="pw-footer-mobile-trust-banner">
            <div className="pw-trust-icon-box">
              <Shield size={15} className="pw-trust-shield" />
            </div>
            <div className="pw-trust-meta">
              <span className="pw-trust-title">Verified Transparency</span>
              <span className="pw-trust-subtitle">Independent Broker Benchmarks</span>
            </div>
          </div>

          {/* Mobile Highlighted Join as Broker Card */}
          <Link
            to="/join-broker"
            className="pw-footer-join-broker-card pw-mobile-join-broker-card"
            aria-label="Join as Broker"
          >
            <div className="pw-join-broker-tag">
              <span className="pw-join-dot" />
              <span>Broker Portal</span>
            </div>
            <div className="pw-join-broker-title-row">
              <span className="pw-join-broker-title">Join as Broker</span>
              <ArrowRight size={14} className="pw-join-arrow" />
            </div>
            <span className="pw-join-broker-sub">Get listed and reviewed by 50,000+ traders</span>
          </Link>

          {/* Accordion List */}
          <div className="pw-footer-accordion">
            {ALL_FOOTER_SECTIONS.map((sec) => {
              const visibleLinks = sec.links.filter((l) => !hiddenLinks.includes(l.label));
              if (visibleLinks.length === 0) return null;
              const isOpen = openSection === sec.id;
              return (
                <div key={sec.id} className="pw-accordion-item">
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.id)}
                    className="pw-accordion-btn"
                    aria-expanded={isOpen}
                  >
                    <span>{sec.title}</span>
                    <ChevronDown
                      size={18}
                      className={`pw-accordion-chevron ${isOpen ? 'is-open' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: 'easeInOut' }}
                        className="pw-accordion-drawer"
                      >
                        <div className="pw-accordion-links">
                          {visibleLinks.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.href || '#'}
                              onClick={(e) => handleLinkAction(link, e)}
                              className={`pw-accordion-link ${link.joinBroker ? 'is-join-broker' : ''} ${link.coral ? 'is-coral' : ''} ${link.highlight ? 'is-highlight' : ''}`}
                            >
                              <span>{link.label}</span>
                              <ArrowRight size={13} className="pw-link-arrow" />
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Mobile Social Cluster */}
          <div className="pw-footer-mobile-social">
            <span className="pw-mobile-social-label">Follow TradeSafeBrokers</span>
            <div className="pw-footer-social-cluster">
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X" className="pw-social-btn">
                <svg className="pw-social-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="pw-social-btn pw-social-yt">
                <svg className="pw-social-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="pw-social-btn pw-social-li">
                <svg className="pw-social-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 0 0 1.45-1.45c0-.8-.65-1.45-1.45-1.45a1.45 1.45 0 0 0-1.45 1.45c0 .8.65 1.45 1.45 1.45m1.39 9.97V10.36H5.07v8.37h2.78Z" />
                </svg>
              </a>
              <a href="https://telegram.org" target="_blank" rel="noreferrer" aria-label="Telegram" className="pw-social-btn pw-social-tg">
                <svg className="pw-social-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="pw-footer-divider" aria-hidden="true" />

        {/* Regulatory Risk Disclaimer */}
        <div className="pw-footer-disclaimer-box">
          <p className="pw-footer-disclaimer-text">
            <strong>High-Risk Investment Notice:</strong> Trading Forex and Leveraged Financial Instruments (CFDs) carries a high level of risk and may not be suitable for all investors. Approximately 74% to 89% of retail investor accounts lose capital when trading CFDs. Never trade with funds you cannot afford to lose. TradeSafeBrokers is an independent financial comparison and educational publication; we do not accept funds or provide investment advisory services.
          </p>
        </div>

        {/* Bottom Legal Copyright Bar */}
        <div className="pw-footer-bottom-bar">
          <p className="pw-footer-copyright">
            © 2024-2026 TradeSafeBrokers™ Inc. All rights reserved. All broker trademarks and logos belong to their respective registered entities.
          </p>
          <div className="pw-footer-bottom-group">
            <FooterLanguageSelector />
            <div className="pw-footer-made-with">
              <span>Made with</span>
              <Heart size={13} fill="#fc5d21" stroke="none" className="pw-footer-heart" />
              <span>for traders worldwide</span>
            </div>
          </div>
        </div>
        </div>
      </footer>

      {/* Interactive Contact Us Modal with Paper Plane Takeoff Animation */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Rich Informational Detail Modal for Footer Links */}
      <FooterDetailModal
        isOpen={!!detailTopic}
        topic={detailTopic}
        onClose={() => setDetailTopic(null)}
      />
    </>
  );
};

export default memo(Footer);
