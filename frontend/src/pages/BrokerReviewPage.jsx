import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Star,
  Award,
  TrendingUp,
  Zap,
  Clock,
  ExternalLink,
  HelpCircle,
  Layers,
  CreditCard,
  ChevronRight,
  SlidersHorizontal,
  MessageSquare,
  Check,
  Sparkles,
  Info,
  DollarSign,
  Building2,
  Lock,
} from 'lucide-react';
import { ALL_BROKERS_DATA } from '../features/brokers/data/brokersData.jsx';
import { getBrokerEditorialContent } from '../features/brokers/data/brokerReviewsData.js';
import { BrokerLogo } from '../features/brokers/components/BrokerLogo.jsx';
import VerifiedGoldBadge from '../features/shared/components/VerifiedGoldBadge.jsx';
import BrokerReviewsModal from '../features/reviews/components/BrokerReviewsModal.jsx';
import BrokerHubModal from '../features/brokers/components/BrokerHubModal.jsx';
import { brokerService } from '../features/brokers/services/broker.service.js';
import Footer from '../features/shared/components/Footer.jsx';
import './BrokerReviewPage.css';

export default function BrokerReviewPage({ theme = 'dark' }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  // 1. Instant fallback from static dataset
  const staticBroker = useMemo(() => {
    if (!slug) return null;
    const cleanSlug = slug.toLowerCase().trim();
    const strippedSlug = cleanSlug.replace(/[^a-z0-9]/g, '');
    return (
      ALL_BROKERS_DATA.find((b) => {
        const bId = (b.id || '').toLowerCase().trim();
        const bSlug = (b.slug || '').toLowerCase().trim();
        const bName = (b.name || '').toLowerCase().trim();
        return (
          bId === cleanSlug ||
          bSlug === cleanSlug ||
          bName.replace(/\s+/g, '-') === cleanSlug ||
          bId.replace(/[^a-z0-9]/g, '') === strippedSlug ||
          bSlug.replace(/[^a-z0-9]/g, '') === strippedSlug ||
          bName.replace(/[^a-z0-9]/g, '') === strippedSlug
        );
      }) || ALL_BROKERS_DATA[0]
    );
  }, [slug]);

  const [broker, setBroker] = useState(staticBroker);
  const [loading, setLoading] = useState(false);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [hubModalOpen, setHubModalOpen] = useState(false);

  // Fetch updated real data from backend if available
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!slug) return;

    setLoading(true);
    brokerService
      .getBrokerBySlug(slug)
      .then((data) => {
        if (data) {
          setBroker((prev) => ({
            ...prev,
            ...data,
          }));
        }
      })
      .catch(() => {
        // Keeps staticBroker as solid fallback
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const editorial = useMemo(() => {
    return getBrokerEditorialContent(broker);
  }, [broker]);

  // Find alternative brokers
  const alternativeBrokers = useMemo(() => {
    if (!broker) return [];
    return ALL_BROKERS_DATA.filter((b) => b.id !== broker.id && b.slug !== broker.slug).slice(0, 3);
  }, [broker]);

  if (!broker || !editorial) {
    return (
      <div className="brp-loading-container">
        <div className="brp-spinner" />
        <p>Loading comprehensive broker analysis...</p>
      </div>
    );
  }

  const handleOpenAccount = () => {
    if (broker._id) {
      brokerService.recordClick(broker._id);
    }
    const targetUrl = broker.affiliateUrl || broker.websiteUrl || 'https://www.google.com';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`brp-page ${theme === 'light' ? 'brp-theme-light' : 'brp-theme-dark'}`}>
      {/* ═══════════════════════════════════════════════════════════════
          BREADCRUMBS & TOP NAV BAR
          ═══════════════════════════════════════════════════════════════ */}
      <div className="brp-top-bar-wrapper">
        <div className="brp-container brp-top-bar">
          <nav className="brp-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/" className="brp-crumb-link">Home</Link>
            <ChevronRight size={13} className="brp-crumb-sep" />
            <Link to="/brokers" className="brp-crumb-link">Top Forex Brokers</Link>
            <ChevronRight size={13} className="brp-crumb-sep" />
            <span className="brp-crumb-current">{broker.name} Review</span>
          </nav>

          <Link to="/brokers" className="brp-back-link">
            <ArrowLeft size={14} />
            <span>Back to All Brokers</span>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          HERO BANNER & BROKER IDENTITY
          ═══════════════════════════════════════════════════════════════ */}
      <section className="brp-hero-section">
        <div className="brp-container">
          <div className="brp-hero-card">
            <div className="brp-hero-left">
              <div className="brp-hero-badges-row">
                <span className="brp-rank-badge">
                  {broker.rank || '#1 Pick'}
                </span>
                <span className="brp-verified-pill">
                  <VerifiedGoldBadge size={16} />
                  <span>Verified Safe Broker</span>
                </span>
                <span className="brp-trust-score-pill">
                  <ShieldCheck size={14} color="#10b981" />
                  <span>{broker.trustScore || 98}/100 Trust Score</span>
                </span>
              </div>

              <div className="brp-logo-title-row">
                <div className="brp-logo-box">
                  <BrokerLogo broker={broker} />
                </div>
                <div>
                  <h1 className="brp-hero-title">{editorial.heroTitle}</h1>
                  <p className="brp-hero-tagline">{editorial.tagline}</p>
                </div>
              </div>

              <div className="brp-rating-strip">
                <div className="brp-stars-row">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                  ))}
                  <strong style={{ fontSize: '15px', marginLeft: '6px' }}>{broker.rating || 4.9}</strong>
                </div>
                <span className="brp-rating-sep">•</span>
                <button
                  type="button"
                  className="brp-reviews-link-btn"
                  onClick={() => setReviewsModalOpen(true)}
                >
                  <MessageSquare size={13} />
                  <span>{broker.reviewsCount || '6,400+ Verified Trader Reviews'}</span>
                </button>
                <span className="brp-rating-sep">•</span>
                <span className="brp-reg-tag">
                  Regulated by <strong>{broker.regulation}</strong>
                </span>
              </div>
            </div>

            <div className="brp-hero-right-cta">
              <button
                type="button"
                className="brp-btn-open-real"
                onClick={handleOpenAccount}
              >
                <span>Open Real Account</span>
                <ExternalLink size={15} />
              </button>
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <Link to="/compare" className="brp-btn-compare">
                  <SlidersHorizontal size={13} />
                  <span>Compare</span>
                </Link>
                <button
                  type="button"
                  className="brp-btn-qa"
                  onClick={() => setHubModalOpen(true)}
                >
                  <HelpCircle size={13} />
                  <span>Ask Q&amp;A</span>
                </button>
              </div>
              <span className="brp-cta-caption">
                ✓ Free Demo Account • Instant Setup • Tier-1 Regulated
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          QUICK STATS MATRIX BAR
          ═══════════════════════════════════════════════════════════════ */}
      <section className="brp-stats-section">
        <div className="brp-container">
          <div className="brp-stats-grid">
            <div className="brp-stat-card">
              <span className="brp-stat-label">Min. Deposit</span>
              <strong className="brp-stat-val text-green">{broker.minDeposit}</strong>
              <span className="brp-stat-sub">Low Entry Threshold</span>
            </div>

            <div className="brp-stat-card">
              <span className="brp-stat-label">Spreads (EUR/USD)</span>
              <strong className="brp-stat-val text-blue">{broker.spread}</strong>
              <span className="brp-stat-sub">Raw ECN Available</span>
            </div>

            <div className="brp-stat-card">
              <span className="brp-stat-label">Max Leverage</span>
              <strong className="brp-stat-val">{broker.maxLeverage}</strong>
              <span className="brp-stat-sub">Dynamic Margin</span>
            </div>

            <div className="brp-stat-card">
              <span className="brp-stat-label">Order Execution</span>
              <strong className="brp-stat-val">{broker.executionType || 'True STP / ECN'}</strong>
              <span className="brp-stat-sub">Sub-35ms Latency</span>
            </div>

            <div className="brp-stat-card">
              <span className="brp-stat-label">Local Payouts</span>
              <strong className="brp-stat-val text-orange">UPI / IMPS</strong>
              <span className="brp-stat-sub">₹0 Fees for Traders</span>
            </div>

            <div className="brp-stat-card">
              <span className="brp-stat-label">Platforms</span>
              <strong className="brp-stat-val">{broker.platforms}</strong>
              <span className="brp-stat-sub">PC, Mac, iOS, Android</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT LAYOUT (2 COLUMNS: EDITORIAL REVIEW + SIDEBAR)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="brp-content-section">
        <div className="brp-container brp-layout-grid">
          {/* LEFT COLUMN: DETAILED EDITORIAL TEXT */}
          <main className="brp-main-content">
            {/* 1. EXECUTIVE VERDICT */}
            <article className="brp-article-block">
              <div className="brp-block-header">
                <div className="brp-block-icon"><Award size={18} /></div>
                <h2>Executive Verdict: Why Choose {broker.name}?</h2>
              </div>
              <p className="brp-body-text">{editorial.verdict}</p>
            </article>

            {/* 2. SPREADS & FEES BREAKDOWN TABLE */}
            <article className="brp-article-block">
              <div className="brp-block-header">
                <div className="brp-block-icon"><TrendingUp size={18} /></div>
                <h2>Live Spreads &amp; Commission Fee Breakdown</h2>
              </div>
              <p className="brp-body-text">{editorial.spreadsAnalysis}</p>

              <div className="brp-table-wrapper">
                <table className="brp-data-table">
                  <thead>
                    <tr>
                      <th>Instrument / Asset</th>
                      <th>Standard Account</th>
                      <th>Raw / ECN Account</th>
                      <th>Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editorial.spreadTable.map((row, i) => (
                      <tr key={i}>
                        <td><strong>{row.pair}</strong></td>
                        <td>{row.standard}</td>
                        <td className="text-green font-bold">{row.raw}</td>
                        <td>{row.commission}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="brp-table-note">
                * Spreads are measured in real-time interbank market conditions during active London &amp; New York sessions.
              </p>
            </article>

            {/* 3. ACCOUNT TYPES COMPARISON */}
            <article className="brp-article-block">
              <div className="brp-block-header">
                <div className="brp-block-icon"><Layers size={18} /></div>
                <h2>Account Types &amp; Minimum Deposit Tiers</h2>
              </div>
              <div className="brp-account-cards-grid">
                {editorial.accountTypesList.map((acc, i) => (
                  <div key={i} className="brp-account-card">
                    <h3 className="brp-account-title">{acc.name}</h3>
                    <div className="brp-account-spec-row">
                      <span className="lbl">Min. Deposit:</span>
                      <span className="val font-bold text-green">{acc.minDep}</span>
                    </div>
                    <div className="brp-account-spec-row">
                      <span className="lbl">Spread:</span>
                      <span className="val">{acc.spread}</span>
                    </div>
                    <div className="brp-account-spec-row">
                      <span className="lbl">Leverage:</span>
                      <span className="val">{acc.leverage}</span>
                    </div>
                    <div className="brp-account-best-for">
                      <Check size={12} color="#10b981" />
                      <span>{acc.bestFor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* 4. SCALPING, HEDGING & EA POLICY */}
            <article className="brp-article-block">
              <div className="brp-block-header">
                <div className="brp-block-icon"><Zap size={18} /></div>
                <h2>Scalping, Hedging &amp; Automated Execution Policy</h2>
              </div>
              <p className="brp-body-text">{editorial.scalpingPolicy}</p>
            </article>

            {/* 5. LOCAL DEPOSITS & INSTANT WITHDRAWALS */}
            <article className="brp-article-block">
              <div className="brp-block-header">
                <div className="brp-block-icon"><CreditCard size={18} /></div>
                <h2>Deposit &amp; Withdrawal Speed in India (UPI &amp; NetBanking)</h2>
              </div>
              <p className="brp-body-text">{editorial.depositWithdrawalDetails}</p>
            </article>

            {/* 6. REGULATION & SAFETY OF FUNDS */}
            <article className="brp-article-block">
              <div className="brp-block-header">
                <div className="brp-block-icon"><ShieldCheck size={18} /></div>
                <h2>Regulatory Safety, Segregated Accounts &amp; Investor Protection</h2>
              </div>
              <p className="brp-body-text">{editorial.regulatoryDetails}</p>
            </article>

            {/* 7. PROS & CONS */}
            <article className="brp-article-block">
              <div className="brp-block-header">
                <div className="brp-block-icon"><Sparkles size={18} /></div>
                <h2>{broker.name} Advantages &amp; Considerations</h2>
              </div>
              <div className="brp-pros-cons-grid">
                <div className="brp-pros-box">
                  <h3>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>Key Advantages</span>
                  </h3>
                  <ul>
                    {broker.pros?.map((pro, idx) => (
                      <li key={idx}>
                        <Check size={13} color="#10b981" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="brp-cons-box">
                  <h3>
                    <XCircle size={16} color="#f59e0b" />
                    <span>Considerations</span>
                  </h3>
                  <ul>
                    {broker.cons?.map((con, idx) => (
                      <li key={idx}>
                        <span className="brp-bullet-warn">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>

            {/* 8. CORE HIGHLIGHTS CHECKLIST */}
            {broker.features && broker.features.length > 0 && (
              <article className="brp-article-block">
                <div className="brp-block-header">
                  <div className="brp-block-icon"><CheckCircle2 size={18} /></div>
                  <h2>Core Features Verified by TradeSafeBrokers</h2>
                </div>
                <div className="brp-features-grid">
                  {broker.features.map((feat, idx) => (
                    <div key={idx} className="brp-feature-chip">
                      <Check size={14} color="#10b981" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </article>
            )}

            {/* 9. REVIEWS TRIGGER BOX */}
            <div className="brp-reviews-prompt-card">
              <div className="brp-reviews-prompt-text">
                <h3>Read 6,000+ Verified Trader Reviews for {broker.name}</h3>
                <p>Real experiences regarding withdrawal turnaround, customer support, and spread stability.</p>
              </div>
              <button
                type="button"
                className="brp-btn-open-reviews-modal"
                onClick={() => setReviewsModalOpen(true)}
              >
                <MessageSquare size={14} />
                <span>Open Reviews &amp; Submit Rating</span>
              </button>
            </div>
          </main>

          {/* RIGHT COLUMN: STICKY SUMMARY CARD & ACTION HUB */}
          <aside className="brp-sidebar">
            <div className="brp-sticky-card">
              <div className="brp-sidebar-header">
                <div className="brp-sidebar-logo">
                  <BrokerLogo broker={broker} />
                </div>
                <div className="brp-sidebar-meta">
                  <span className="brp-sidebar-name">{broker.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <strong>{broker.rating}</strong>
                    <span style={{ color: '#94a3b8' }}>({broker.reviewsCount})</span>
                  </div>
                </div>
              </div>

              <div className="brp-sidebar-stats-list">
                <div className="brp-sidebar-stat-item">
                  <span className="lbl">Min. Deposit:</span>
                  <span className="val font-bold text-green">{broker.minDeposit}</span>
                </div>
                <div className="brp-sidebar-stat-item">
                  <span className="lbl">Typical Spread:</span>
                  <span className="val font-bold text-blue">{broker.spread}</span>
                </div>
                <div className="brp-sidebar-stat-item">
                  <span className="lbl">Max Leverage:</span>
                  <span className="val font-bold">{broker.maxLeverage}</span>
                </div>
                <div className="brp-sidebar-stat-item">
                  <span className="lbl">Regulators:</span>
                  <span className="val font-bold">{broker.regulation}</span>
                </div>
                <div className="brp-sidebar-stat-item">
                  <span className="lbl">Year Founded:</span>
                  <span className="val">{broker.yearFounded || 2008}</span>
                </div>
                <div className="brp-sidebar-stat-item">
                  <span className="lbl">Headquarters:</span>
                  <span className="val">{broker.headquarters || 'Cyprus'}</span>
                </div>
              </div>

              <button
                type="button"
                className="brp-sidebar-cta-btn"
                onClick={handleOpenAccount}
              >
                <span>Visit {broker.name} Official Website</span>
                <ExternalLink size={15} />
              </button>

              <button
                type="button"
                className="brp-sidebar-hub-btn"
                onClick={() => setHubModalOpen(true)}
              >
                <HelpCircle size={14} />
                <span>Ask Question to Broker Desk</span>
              </button>

              <div className="brp-sidebar-trust-bullets">
                <div className="bullet"><Lock size={12} color="#10b981" /><span>Tier-1 Bank Segregated Client Funds</span></div>
                <div className="bullet"><Check size={12} color="#10b981" /><span>Negative Balance Protection</span></div>
                <div className="bullet"><Check size={12} color="#10b981" /><span>24/7 Verified Customer Support</span></div>
              </div>

              <div className="brp-sidebar-risk-notice">
                <Info size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  CFDs and leveraged forex trading carry high risk. Ensure you understand how margin products work before committing capital.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ALTERNATIVE BROKERS STRIP
          ═══════════════════════════════════════════════════════════════ */}
      <section className="brp-alternatives-section">
        <div className="brp-container">
          <h2 className="brp-alternatives-title">Top Alternatives to {broker.name}</h2>
          <div className="brp-alternatives-grid">
            {alternativeBrokers.map((alt) => (
              <div key={alt.id} className="brp-alt-card">
                <div className="brp-alt-top">
                  <div className="brp-alt-logo">
                    <BrokerLogo broker={alt} />
                  </div>
                  <span className="brp-alt-rank">{alt.rank}</span>
                </div>
                <div className="brp-alt-details">
                  <div className="brp-alt-name">{alt.name}</div>
                  <div className="brp-alt-badge">{alt.highlightBadge}</div>
                  <div className="brp-alt-spec">Min Deposit: <strong>{alt.minDeposit}</strong> • Spread: <strong>{alt.spread}</strong></div>
                </div>
                <Link to={`/reviews/${alt.slug || alt.id}`} className="brp-alt-link">
                  <span>Read Full Review</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MODALS
          ═══════════════════════════════════════════════════════════════ */}
      {reviewsModalOpen && (
        <BrokerReviewsModal
          broker={broker}
          isOpen={reviewsModalOpen}
          onClose={() => setReviewsModalOpen(false)}
        />
      )}

      {hubModalOpen && (
        <BrokerHubModal
          isOpen={hubModalOpen}
          onClose={() => setHubModalOpen(false)}
          broker={broker}
          onBrokerUpdated={(updated) => setBroker(updated)}
        />
      )}

      {/* SITE FOOTER */}
      <Footer />
    </div>
  );
}
