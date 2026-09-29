import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import InteractiveDotGrid from '../features/shared/components/InteractiveDotGrid';
import TrustedBrokersMarquee from '../features/shared/components/TrustedBrokersMarquee';
import InteractiveRobot from '../features/shared/components/InteractiveRobot';
import TopForexBrokers from '../features/shared/components/TopForexBrokers';
import BrokerComparisonBanner from '../features/shared/components/BrokerComparisonBanner';
import Testimonials from '../features/shared/components/Testimonials';
import Footer from '../features/shared/components/Footer';
import useLiveMarketData from '../features/shared/hooks/useLiveMarketData.js';

const titleLines = [
  { words: ['Find', 'the', 'Best'] },
  { words: ['Forex', 'Broker'] },
  { words: ['for', 'a', 'Smarter'], accentIndexStart: 2 },
  { words: ['Tomorrow'], accentIndexStart: 0 },
];

const descText = 'Unbiased broker reviews, real spread monitoring, and tier-1 regulatory verification to safeguard your trading capital.';

// Reusable Transparency Card Component (used in desktop right column and mobile hero)
const TransparencyCard = React.memo(() => (
  <div className="transparency-card">
    <h3 className="transparency-title">
      100% Transparent
      <br />
      Review System
    </h3>
    <div className="green-accent-line" />

    <div className="transparency-points">
      <div className="transparency-point">
        <svg
          className="transparency-check-svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--brand-green)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>Zero Paid Broker Rankings</span>
      </div>
      <div className="transparency-point">
        <svg
          className="transparency-check-svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--brand-green)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>Verified Withdrawal Proof</span>
      </div>
      <div className="transparency-point">
        <svg
          className="transparency-check-svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--brand-green)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>Tier-1 Regulation Checked</span>
      </div>
      <div className="transparency-point">
        <svg
          className="transparency-check-svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--brand-green)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>Live Execution Spreads</span>
      </div>
    </div>

    {/* Social Proof Avatars */}
    <div className="social-proof-section">
      <div className="avatar-stack-group">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
          alt="Trader"
          className="trader-avatar"
        />
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
          alt="Trader"
          className="trader-avatar"
        />
        <img
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
          alt="Trader"
          className="trader-avatar"
        />
        <span className="avatar-badge-count">+45k</span>
      </div>
      <span className="social-proof-text">Traders joined this month</span>
    </div>
  </div>
));

// Generate smooth cubic bezier SVG path for real-time market sparklines
const generateSparklinePath = (points, width = 160, height = 36) => {
  if (!points || points.length < 2) return `M 0 ${height / 2} L ${width} ${height / 2}`;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const padding = 4;
  const h = height - padding * 2;

  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * width,
    y: height - padding - ((p - min) / range) * h,
  }));

  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const cp1x = (curr.x + (next.x - curr.x) / 2).toFixed(1);
    const cp1y = curr.y.toFixed(1);
    const cp2x = cp1x;
    const cp2y = next.y.toFixed(1);
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }
  return d;
};

const Home = ({ theme = 'dark', heroComplete = false, onTitleComplete }) => {
  const { btc, gold } = useLiveMarketData();
  const [complete, setComplete] = useState(heroComplete);

  useEffect(() => {
    if (heroComplete) {
      setComplete(true);
      return;
    }
    const timer = setTimeout(() => {
      setComplete(true);
      if (onTitleComplete) onTitleComplete();
    }, 900);
    return () => clearTimeout(timer);
  }, [heroComplete, onTitleComplete]);

  let runningChar = 0;
  let runningDescChar = 0;

  return (
    <main className="pipwise-home-page">
      {/* Hero Section */}
      <section className={`pipwise-hero ${heroComplete ? 'no-entrance-anim' : ''}`}>
        {/* Radial Ambient Glow */}
        <div className="pipwise-hero-bg-glow" aria-hidden="true" />

        {/* Interactive Spring Physics Dot Grid Layer */}
        <div className="pipwise-dots-bg-container" aria-hidden="true">
          <InteractiveDotGrid theme={theme} />
        </div>

        {/* Main Content Container */}
        <div className="pipwise-hero-container">
          <div className="pipwise-hero-grid">
            {/* Left Column: Headline, Description, CTAs, Mobile Transparency Card, Stats */}
            <div className="pipwise-hero-left">
              <span className="pipwise-hero-eyebrow">VERIFIED BROKER DIRECTORY</span>

              <h1 className="pipwise-hero-title">
                {titleLines.map((line, lIdx) => (
                  <span key={lIdx} className="pipwise-hero-title-line">
                    {line.words.map((word, wIdx) => {
                      const isAccent = line.accentIndexStart !== undefined && wIdx >= line.accentIndexStart;
                      const letters = word.split('').map((char, cIdx) => {
                        const idx = runningChar++;
                        if (heroComplete) {
                          return (
                            <span key={cIdx} style={{ opacity: 1, display: 'inline-block' }}>
                              {char}
                            </span>
                          );
                        }
                        return (
                          <span
                            key={cIdx}
                            className="hero-wave-letter"
                            style={{ animationDelay: `${idx * 0.03}s` }}
                          >
                            {char}
                          </span>
                        );
                      });

                      return (
                        <span
                          key={wIdx}
                          className={`pipwise-hero-word ${isAccent ? 'accent-green' : ''}`}
                        >
                          {letters}
                        </span>
                      );
                    })}
                  </span>
                ))}
              </h1>

              <p className="pipwise-hero-desc">
                {heroComplete ? (
                  <span>{descText}</span>
                ) : (
                  descText.split(' ').map((word, wIdx) => (
                    <span key={wIdx} className="desc-wave-word">
                      {word.split('').map((char, cIdx) => {
                        const idx = runningDescChar++;
                        return (
                          <span
                            key={cIdx}
                            className="desc-wave-letter"
                            style={{
                              opacity: complete ? undefined : 0,
                              animationDelay: `${idx * 0.012}s`,
                            }}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </span>
                  ))
                )}
              </p>

              {/* Action Buttons */}
              <div className="pipwise-cta-group">
                <Link to="/brokers" className="pipwise-btn-primary">
                  <span className="login-wave-text">
                    {heroComplete ? (
                      <span>Explore Brokers</span>
                    ) : (
                      'Explore Brokers'.split('').map((c, i) => (
                        <span key={i} className="wave-letter" style={{ animationDelay: `${i * 0.02}s` }}>
                          {c === ' ' ? '\u00A0' : c}
                        </span>
                      ))
                    )}
                  </span>
                  <svg
                    className="btn-arrow-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>

                <Link to="/compare" className="pipwise-btn-secondary">
                  <span className="login-wave-text">
                    {heroComplete ? (
                      <span>Compare All</span>
                    ) : (
                      'Compare All'.split('').map((c, i) => (
                        <span key={i} className="wave-letter" style={{ animationDelay: `${i * 0.02}s` }}>
                          {c === ' ' ? '\u00A0' : c}
                        </span>
                      ))
                    )}
                  </span>
                </Link>
              </div>

              {/* Mobile Transparency Card (Rendered here right below CTAs on mobile) */}
              <div className="pipwise-hero-mobile-transparency">
                <TransparencyCard />
              </div>

              {/* Stats Row with Transparent Icon Backgrounds */}
              <div className="pipwise-stats-row">
                <div className="stat-item">
                  <div className="stat-icon-wrapper">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">450+</span>
                    <span className="stat-label">
                      <span>Brokers</span>
                      <span>Reviewed</span>
                    </span>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon-wrapper">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">100%</span>
                    <span className="stat-label">
                      <span>Free &amp;</span>
                      <span>Unbiased</span>
                    </span>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon-wrapper">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">4.9/5</span>
                    <span className="stat-label">
                      <span>User</span>
                      <span>Rating</span>
                    </span>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon-wrapper">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">24/7</span>
                    <span className="stat-label">
                      <span>Live</span>
                      <span>Spreads</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column: 3D Globe with Floating Cards & Badges */}
            <div className="pipwise-hero-center">
              <div className="globe-wrapper">
                <div className="globe-ambient-glow" />

                {/* Globe Image with Pure GPU 60fps Entrance */}
                <img
                  src="/forex_globe_web_300kb.webp"
                  alt="Interactive Forex Globe"
                  className={`globe-image ${heroComplete ? 'no-entrance' : ''}`}
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                />

                {/* Handwritten Annotation & Arrow */}
                <div className="handwritten-annotation">
                  <span className="handwritten-text">
                    Trusted by 50,000+ traders
                    <span className="handwriting-cursor" />
                  </span>
                  <svg
                    className="handwritten-arrow-svg"
                    viewBox="0 0 54 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M 6 6 Q 22 28 42 32 M 30 26 L 42 32 L 38 42" />
                  </svg>
                </div>

                {/* Floating Market Card - BTC/USD (Real-time Live WebSocket & API Stream) */}
                <div className="market-card-eurusd">
                  <div className="market-card-header">
                    <div className="market-pair-title-row">
                      <span className="market-pair-title">{btc.symbol}</span>
                      <span className="market-live-pill" title="Live Real-time Crypto Feed">
                        <span className="market-live-dot" /> LIVE
                      </span>
                    </div>
                    <Link to="/news" className="market-arrow-btn" title="View live crypto & trading news for BTC">↗</Link>
                  </div>
                  <div className={`market-price-val ${btc.flash ? `flash-${btc.flash}` : ""}`}>
                    ${btc.price}
                  </div>
                  <div className={`market-change-badge ${btc.isPositive ? "positive" : "negative"}`}>
                    {btc.change}% Today
                  </div>
                  <svg className="sparkline-svg" viewBox="0 0 160 38" fill="none">
                    <path
                      d={generateSparklinePath(btc.history, 160, 36)}
                      stroke="var(--brand-green)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Floating Market Card - Gold (Real-time Live Spot Stream) */}
                <div className="market-card-gold">
                  <div className="market-card-header">
                    <div className="market-pair-title-row">
                      <span className="market-pair-title">{gold.symbol}</span>
                      <span className="market-live-pill" title="Live Real-time Spot Feed">
                        <span className="market-live-dot" /> LIVE
                      </span>
                    </div>
                    <Link to="/compare" className="market-arrow-btn" title="Compare broker spreads & execution for Gold">↗</Link>
                  </div>
                  <div className={`market-price-val ${gold.flash ? `flash-${gold.flash}` : ""}`}>
                    {gold.price}
                  </div>
                  <div className={`market-change-badge ${gold.isPositive ? "positive" : "negative"}`}>
                    {gold.change}% Today
                  </div>
                  <svg className="sparkline-svg" viewBox="0 0 180 38" fill="none">
                    <path
                      d={generateSparklinePath(gold.history, 180, 36)}
                      stroke="var(--brand-green)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Location Badges on Globe */}
                <div className="globe-location-badge badge-london">
                  <span className="location-pin-icon">●</span>
                  <div className="location-info">
                    <span className="location-city">London</span>
                    <span className="location-desc">LSE Active</span>
                  </div>
                </div>

                <div className="globe-location-badge badge-tokyo">
                  <span className="location-pin-icon">●</span>
                  <div className="location-info">
                    <span className="location-city">Tokyo</span>
                    <span className="location-desc">TSE Active</span>
                  </div>
                </div>

                <div className="globe-location-badge badge-sydney">
                  <span className="location-pin-icon">●</span>
                  <div className="location-info">
                    <span className="location-city">Sydney</span>
                    <span className="location-desc">ASX Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Transparency Card & Social Proof */}
            <div className="pipwise-hero-right">
              <div className="pipwise-hero-desktop-transparency">
                <TransparencyCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trusted Brokers Infinite Marquee Strip */}
      <TrustedBrokersMarquee />

      {/* Interactive Robot Companions Squad */}
      <section className="pipwise-robot-squad-section" aria-label="Interactive Companions Squad">
        <div className="pipwise-robot-squad-container">
          <InteractiveRobot />
        </div>
      </section>

      {/* 3. Top Forex Brokers Cards Carousel */}
      <TopForexBrokers />

      {/* 4. Broker Comparison Banner */}
      <BrokerComparisonBanner />

      {/* 5. Dual Marquee Testimonials */}
      <Testimonials />

      {/* 6. PipWise Footer */}
      <Footer />
    </main>
  );
};

export default React.memo(Home);
