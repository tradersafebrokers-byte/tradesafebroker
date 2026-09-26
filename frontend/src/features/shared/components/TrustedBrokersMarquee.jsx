import React from 'react';

// Exact SVG Logos for the 8 featured brokers
const XM_Logo = () => (
  <svg viewBox="0 0 92 26" fill="currentColor" height="22" className="broker-svg" aria-label="XM">
    {/* Stylized bull silhouette */}
    <path d="M2.5 19.5L7.2 4.5l4.8 5.8-2.2 2.4 3.8 5.8h-4.2l-2.1-3.5-2 3.5H2.5zm6.7-9.2L7.3 7 4.7 15.2h2.3l2.2-4.9z" />
    {/* Bold X */}
    <path d="M21 5h5.1l4.2 6.2 4.2-6.2h5.1l-6.8 9.5 7.1 9.9H35l-4.5-6.7-4.5 6.7H21l7.1-9.9L21 5z" />
    {/* Bold M */}
    <path d="M42 5h5l5.3 9.1L57.6 5h5v19.4h-4.2v-13l-4.8 8h-2.6l-4.8-8v13H42V5z" />
  </svg>
);

const Exness_Logo = () => (
  <svg viewBox="0 0 112 26" fill="currentColor" height="20" className="broker-svg" aria-label="Exness">
    {/* Exness infinity loop symbol */}
    <g transform="translate(1, 3.5)">
      <path
        d="M13.2 2.8a5.2 5.2 0 0 0-4 1.9L4.6 9a5.2 5.2 0 0 0 0 7.4 5.2 5.2 0 0 0 7.4 0l3.6-4.1a5.2 5.2 0 0 0 0-7.4 5.2 5.2 0 0 0-2.4-2.1zm-3.6 8.4l3.6-4.1a2.3 2.3 0 0 1 3.3 3.3l-3.6 4.1a2.3 2.3 0 0 1-3.3-3.3z"
        opacity="0.85"
      />
      <path
        d="M18.8 15.8a5.2 5.2 0 0 0 4-1.9l4.6-4.3a5.2 5.2 0 0 0-7.4-7.4l-3.6 4.1a5.2 5.2 0 0 0 0 7.4 5.2 5.2 0 0 0 2.4 2.1zm3.6-8.4l-3.6 4.1a2.3 2.3 0 0 1-3.3-3.3l3.6-4.1a2.3 2.3 0 0 1 3.3 3.3z"
      />
    </g>
    {/* exness lowercase wordmark */}
    <text x="34" y="18.5" fontFamily="system-ui, -apple-system, sans-serif" fontSize="17" fontWeight="700" letterSpacing="-0.6px">
      exness
    </text>
  </svg>
);

const ICMarkets_Logo = () => (
  <svg viewBox="0 0 126 26" fill="currentColor" height="21" className="broker-svg" aria-label="IC Markets">
    {/* 3 Signal bar chart pillars */}
    <rect x="1" y="13.5" width="3.4" height="9.5" rx="1.7" />
    <rect x="7" y="8" width="3.4" height="15" rx="1.7" />
    <rect x="13" y="3.5" width="3.4" height="19.5" rx="1.7" />
    {/* IC Markets text */}
    <text x="23" y="18.5" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16" fontWeight="800" letterSpacing="-0.4px">
      IC Markets
    </text>
  </svg>
);

const Pepperstone_Logo = () => (
  <svg viewBox="0 0 142 26" fill="currentColor" height="20" className="broker-svg" aria-label="Pepperstone">
    {/* Pepperstone curved shield / P-pebble */}
    <path
      d="M3 8C3 4.8 5.6 2.2 8.8 2.2h4.2C17.6 2.2 20.5 6 20 10.4c-.4 4-3.5 8.9-7.8 12.1L5.9 18C4 16.1 3 11.6 3 8zm5.8 1.6v5.2h2.6c1.8 0 3.2-1.2 3.2-2.6s-1.4-2.6-3.2-2.6H8.8z"
    />
    {/* pepperstone lowercase wordmark */}
    <text x="27" y="18.2" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16" fontWeight="600" letterSpacing="-0.4px">
      pepperstone
    </text>
  </svg>
);

const FXTM_Logo = () => (
  <svg viewBox="0 0 104 26" fill="currentColor" height="21" className="broker-svg" aria-label="FXTM">
    {/* Wireframe globe icon */}
    <circle cx="11" cy="13" r="9.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <path d="M4.5 7C7.8 9.8 14.2 16.2 17.5 19M17.5 7C14.2 9.8 7.8 16.2 4.5 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* FXTM uppercase bold wordmark */}
    <text x="28" y="18.5" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16.5" fontWeight="800" letterSpacing="0.6px">
      FXTM
    </text>
  </svg>
);

const AvaTrade_Logo = () => (
  <svg viewBox="0 0 128 26" fill="currentColor" height="20" className="broker-svg" aria-label="AvaTrade">
    {/* Stylized sharp wings chevron */}
    <path d="M2.5 20.5L9.5 5.5l4.8 10.8-2.6 1.3-2.2-4.9-3.9 7.8H2.5zm14-15l7 15h-3l-4-7.8-2.2 4.8 2.2 3H13.5l3-15z" />
    {/* AVATRADE text */}
    <text x="28" y="18.5" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16" fontWeight="800" letterSpacing="0.7px">
      AVATRADE
    </text>
  </svg>
);

const OANDA_Logo = () => (
  <svg viewBox="0 0 110 26" fill="currentColor" height="21" className="broker-svg" aria-label="OANDA">
    {/* Slashed circle emblem */}
    <circle cx="11" cy="13" r="9.2" fill="none" stroke="currentColor" strokeWidth="2.8" />
    <path d="M6.5 19.5L15.5 6.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    {/* OANDA bold text */}
    <text x="26" y="18.5" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16.5" fontWeight="700" letterSpacing="0.8px">
      OANDA
    </text>
  </svg>
);

const Tickmill_Logo = () => (
  <svg viewBox="0 0 118 26" fill="currentColor" height="21" className="broker-svg" aria-label="Tickmill">
    {/* Hexagonal isometric mark */}
    <path d="M10.5 2.5l7 4v8l-7 4-7-4v-8l7-4zm0 3.5l-4.4 2.5v5l4.4 2.5 4.4-2.5v-5L10.5 6z" />
    {/* Tickmill text */}
    <text x="24" y="18.5" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16.5" fontWeight="700" letterSpacing="-0.3px">
      Tickmill
    </text>
  </svg>
);

const BROKERS = [
  { id: 'xm', name: 'XM', Logo: XM_Logo, rating: '4.8', badge: 'Regulated · Spreads 0.6', url: '#xm' },
  { id: 'exness', name: 'Exness', Logo: Exness_Logo, rating: '4.9', badge: 'Instant Withdrawal', url: '#exness' },
  { id: 'icmarkets', name: 'IC Markets', Logo: ICMarkets_Logo, rating: '4.9', badge: 'Raw Spreads 0.0', url: '#icmarkets' },
  { id: 'pepperstone', name: 'Pepperstone', Logo: Pepperstone_Logo, rating: '4.8', badge: 'Fast Execution', url: '#pepperstone' },
  { id: 'fxtm', name: 'FXTM', Logo: FXTM_Logo, rating: '4.7', badge: 'FCA & CySEC', url: '#fxtm' },
  { id: 'avatrade', name: 'AvaTrade', Logo: AvaTrade_Logo, rating: '4.7', badge: 'Multi-Regulated', url: '#avatrade' },
  { id: 'oanda', name: 'OANDA', Logo: OANDA_Logo, rating: '4.8', badge: 'US & Global Licensed', url: '#oanda' },
  { id: 'tickmill', name: 'Tickmill', Logo: Tickmill_Logo, rating: '4.7', badge: 'VIP Spreads', url: '#tickmill' },
];

const TrustedBrokersMarquee = ({ onViewAll }) => {
  return (
    <section className="trusted-brokers-section" aria-label="Trusted Forex Brokers">
      <div className="trusted-brokers-container">
        {/* Top Header Row */}
        <div className="trusted-header-row">
          <span className="trusted-eyebrow">
            TRUSTED. REVIEWED. FEATURED.
          </span>
        </div>

        {/* Infinite Running Marquee Track with Edge Gradients */}
        <div className="trusted-marquee-viewport">
          <div className="trusted-marquee-track">
            {/* First Set of Brokers */}
            <div className="trusted-marquee-group" aria-hidden="false">
              {BROKERS.map((broker) => (
                <a
                  key={`b1-${broker.id}`}
                  href={broker.url}
                  className="broker-marquee-item"
                  title={`${broker.name} - ${broker.badge}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (onViewAll) onViewAll(broker);
                  }}
                >
                  <broker.Logo />
                  <span className="broker-rating-chip" aria-hidden="true">
                    ★ {broker.rating}
                  </span>
                </a>
              ))}
            </div>

            {/* Duplicate Set for Seamless Continuous Infinite Loop */}
            <div className="trusted-marquee-group" aria-hidden="true">
              {BROKERS.map((broker) => (
                <a
                  key={`b2-${broker.id}`}
                  href={broker.url}
                  className="broker-marquee-item"
                  title={`${broker.name} - ${broker.badge}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (onViewAll) onViewAll(broker);
                  }}
                  tabIndex={-1}
                >
                  <broker.Logo />
                  <span className="broker-rating-chip" aria-hidden="true">
                    ★ {broker.rating}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(TrustedBrokersMarquee);
