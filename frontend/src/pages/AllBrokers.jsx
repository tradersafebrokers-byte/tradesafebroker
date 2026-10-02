import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutGrid,
  List,
  ShieldCheck,
  TrendingDown,
  Award,
  Zap,
  ExternalLink,
  X,
  Info,
  Plus,
  CheckCircle2,
  Building2,
  Sparkles,
  Tag,
  MessageCircleQuestion,
} from 'lucide-react';
import { useBrokers } from '../features/brokers/hooks/useBrokers.js';
import { BrokerLogo } from '../features/brokers/components/BrokerLogo.jsx';
import { brokerService } from '../features/brokers/services/broker.service.js';
import BrokerReviewsModal from '../features/reviews/components/BrokerReviewsModal.jsx';
import BrokerHubModal from '../features/brokers/components/BrokerHubModal.jsx';
import Footer from '../features/shared/components/Footer.jsx';
import { useLanguage } from '../features/shared/context/LanguageContext.jsx';
import './AllBrokers.css';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Brokers' },
  { id: 'upi-accepted', label: '⚡ Instant UPI & IMPS' },
  { id: 'raw-spread', label: '0.0 Raw Spread' },
  { id: 'low-deposit', label: 'Low Deposit (≤ ₹1,000)' },
  { id: 'high-leverage', label: 'High Leverage (1:1000+)' },
  { id: 'top-rated', label: '★ Top Rated (4.7+)' },
  { id: 'ecn', label: 'True ECN / Scalping' },
  { id: 'tradingview', label: 'TradingView Direct' },
];

export const AllBrokers = React.memo(({ theme = 'dark' }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { brokers, isLoading } = useBrokers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegulator, setSelectedRegulator] = useState('all');
  const [sortBy, setSortBy] = useState('rank');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedBrokerForModal, setSelectedBrokerForModal] = useState(null);
  const [selectedBrokerForReviews, setSelectedBrokerForReviews] = useState(null);
  const [selectedBrokerForHub, setSelectedBrokerForHub] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const categoryTabs = useMemo(() => [
    { id: 'all', label: t('tab_all_brokers', 'All Brokers') },
    { id: 'upi-accepted', label: '⚡ Instant UPI & IMPS' },
    { id: 'raw-spread', label: t('tab_raw_spread', '0.0 Raw Spread') },
    { id: 'low-deposit', label: t('tab_low_deposit', 'Low Deposit (≤ ₹1,000)') },
    { id: 'high-leverage', label: t('tab_high_leverage', 'High Leverage (1:1000+)') },
    { id: 'top-rated', label: t('tab_top_rated', '★ Top Rated (4.7+)') },
    { id: 'ecn', label: t('tab_ecn', 'True ECN / Scalping') },
    { id: 'tradingview', label: t('tab_tradingview', 'TradingView Direct') },
  ], [t]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Filter & Sort Logic
  const filteredBrokers = useMemo(() => {
    return (brokers || []).filter((broker) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = broker.name.toLowerCase().includes(q);
        const matchesReg = broker.regulation.toLowerCase().includes(q);
        const matchesPlatform = broker.platforms.toLowerCase().includes(q);
        const matchesPayments = broker.payments?.toLowerCase().includes(q);
        const matchesBadge = broker.highlightBadge?.toLowerCase().includes(q);
        if (!matchesName && !matchesReg && !matchesPlatform && !matchesPayments && !matchesBadge) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (!broker.categories?.includes(selectedCategory)) {
          return false;
        }
      }

      // Regulator filter
      if (selectedRegulator !== 'all') {
        if (!broker.regulatorsList?.some((r) => r.toLowerCase() === selectedRegulator.toLowerCase())) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rank') return a.rankNum - b.rankNum;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'spread') return a.spreadNum - b.spreadNum;
      if (sortBy === 'deposit') return a.minDepositINR - b.minDepositINR;
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedRegulator, sortBy]);

  const toggleCompare = (broker) => {
    setCompareList((prev) => {
      const exists = prev.some((b) => b.id === broker.id);
      if (exists) {
        return prev.filter((b) => b.id !== broker.id);
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 brokers simultaneously.');
        return prev;
      }
      return [...prev, broker];
    });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedRegulator('all');
    setSortBy('rank');
  };

  const getRankBadgeClass = (rankNum) => {
    if (rankNum === 1) return 'rank-badge-1';
    if (rankNum === 2) return 'rank-badge-2';
    if (rankNum === 3) return 'rank-badge-3';
    return 'rank-badge-other';
  };

  return (
    <div className="pipwise-all-brokers-page">
      {/* Background Ambient Glow */}
      <div className="all-brokers-ambient-glow" aria-hidden="true" />

      <div className="all-brokers-container">
        {/* Header & Breadcrumb */}
        <header className="all-brokers-header">
          <nav className="all-brokers-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/" className="breadcrumb-link">
              {t('breadcrumb_home', 'Home')}
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{t('breadcrumb_brokers_dir', 'Brokers Directory')}</span>
          </nav>

          <div className="all-brokers-eyebrow-wrap">
            <div className="all-brokers-eyebrow-pill">
              <span className="eyebrow-candle-icon">
                <span />
                <span />
                <span />
              </span>
              <span>{t('all_brokers_eyebrow', 'VERIFIED FOREX BROKERS • GLOBAL DIRECTORY')}</span>
            </div>
          </div>

          <h1 className="all-brokers-title">
            {t('all_brokers_title', 'Top Forex Brokers Worldwide')}
          </h1>

          <p className="all-brokers-desc">
            {t('all_brokers_desc', 'Compare top forex brokers audited for live 0.0 spreads, zero swap fees, and tier-1 regulatory safety.')}
          </p>

          {/* Minimalist Seamless Trust Metrics Strip (No Box Clutter) */}
          <div className="all-brokers-trust-bar">
            <div className="trust-metric-item">
              <span className="trust-metric-icon">
                <Zap size={15} />
              </span>
              <div className="trust-metric-text">
                <span className="trust-metric-value">{t('trust_metric_fast_deposits', 'Instant Deposits')}</span>
                <span className="trust-metric-sub">{t('trust_metric_fast_sub', 'Fast Local Payouts')}</span>
              </div>
            </div>

            <div className="trust-metric-divider" />

            <div className="trust-metric-item">
              <span className="trust-metric-icon">
                <TrendingDown size={15} />
              </span>
              <div className="trust-metric-text">
                <span className="trust-metric-value">{t('trust_metric_raw_spreads', 'From 0.0 Pips')}</span>
                <span className="trust-metric-sub">{t('trust_metric_raw_sub', 'Real Audited Spreads')}</span>
              </div>
            </div>

            <div className="trust-metric-divider" />

            <div className="trust-metric-item">
              <span className="trust-metric-icon">
                <ShieldCheck size={15} />
              </span>
              <div className="trust-metric-text">
                <span className="trust-metric-value">{t('trust_metric_multi_currency', 'Multi-Currency')}</span>
                <span className="trust-metric-sub">{t('trust_metric_multi_sub', 'Zero Hidden Markups')}</span>
              </div>
            </div>

            <div className="trust-metric-divider" />

            <div className="trust-metric-item">
              <span className="trust-metric-icon">
                <Award size={15} />
              </span>
              <div className="trust-metric-text">
                <span className="trust-metric-value">{t('trust_metric_unbiased', '100% Unbiased')}</span>
                <span className="trust-metric-sub">{t('trust_metric_unbiased_sub', 'Verified Trader Reviews')}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Toolbar & Filter Chips */}
        <section className="all-brokers-toolbar" aria-label="Broker directory filters">
          <div className="toolbar-primary-row">
            <div className="toolbar-search-box">
              <Search size={16} className="search-box-icon" />
              <input
                type="text"
                className="toolbar-search-input"
                placeholder={t('search_brokers_placeholder', 'Search brokers (Exness, XM, Octa, MT5)...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="toolbar-controls-group">
              {/* Regulator Filter */}
              <div className="toolbar-select-wrap">
                <span className="toolbar-select-label">{t('filter_license_label', 'License:')}</span>
                <select
                  className="toolbar-dropdown"
                  value={selectedRegulator}
                  onChange={(e) => setSelectedRegulator(e.target.value)}
                >
                  <option value="all">{t('filter_all_regulators', 'All Regulators')}</option>
                  <option value="FCA">FCA (UK)</option>
                  <option value="ASIC">ASIC (Australia)</option>
                  <option value="CySEC">CySEC (EU)</option>
                  <option value="FSA">FSA</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="toolbar-select-wrap">
                <span className="toolbar-select-label">{t('filter_sort_label', 'Sort:')}</span>
                <select
                  className="toolbar-dropdown"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="rank">{t('sort_rank', 'Top Ranked')}</option>
                  <option value="rating">{t('sort_rating', 'Highest Rated')}</option>
                  <option value="deposit">{t('sort_deposit', 'Minimum Deposit')}</option>
                  <option value="spread">{t('sort_spread', 'Lowest Spreads')}</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="view-mode-toggle" aria-label="Toggle view format">
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  aria-label="Switch to grid view"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === 'table' ? 'is-active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Comparison Table View"
                  aria-label="Switch to table view"
                >
                  <List size={15} />
                </button>
              </div>

              {/* Join as Broker Link Button */}
              <Link
                to="/join-broker"
                className="toolbar-join-broker-btn"
                title={t('nav_join_broker', 'Join as Broker')}
                aria-label={t('nav_join_broker', 'Join as Broker')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(252, 93, 33, 0.12)',
                  border: '1px solid rgba(252, 93, 33, 0.35)',
                  color: 'var(--brand-green, #fc5d21)',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Plus size={14} />
                <span>{t('nav_join_broker', 'Join as Broker')}</span>
              </Link>
            </div>
          </div>

          {/* Category Chips Strip */}
          <div className="toolbar-categories-strip" role="tablist">
            {categoryTabs.map((tab) => {
              const isActive = selectedCategory === tab.id;
              const count = tab.id === 'all'
                ? (brokers || []).length
                : (brokers || []).filter((b) => b.categories?.includes(tab.id)).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`category-chip ${isActive ? 'is-active' : ''}`}
                  onClick={() => setSelectedCategory(tab.id)}
                >
                  <span>{tab.label}</span>
                  <span className="category-chip-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Active Summary */}
          <div className="toolbar-summary-row">
            <span>
              Showing <strong>{filteredBrokers.length}</strong> brokers for Indian traders
            </span>
            {(searchQuery || selectedCategory !== 'all' || selectedRegulator !== 'all' || sortBy !== 'rank') && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={clearAllFilters}
              >
                <X size={12} />
                <span>Reset filters</span>
              </button>
            )}
          </div>
        </section>

        {/* Brokers Grid View - Minimalist & 2 Cards Per Row on Mobile */}
        {viewMode === 'grid' && (
          <div className="all-brokers-grid">
            {filteredBrokers.map((broker) => {
              const isComparing = compareList.some((b) => b.id === broker.id);

              return (
                <motion.article
                  key={broker.id}
                  className={`minimal-broker-card ${isComparing ? 'is-selected-for-compare' : ''}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  {/* Card Top: Rank Badge + Logo + Compare */}
                  <div className="card-top-header">
                    <div className="card-top-left">
                      <span className={`card-rank-tag ${getRankBadgeClass(broker.rankNum)}`}>
                        {broker.rank}
                      </span>
                      <div className="card-logo-wrap">
                        <BrokerLogo broker={broker} />
                      </div>
                    </div>

                    <label className="card-compare-label" title="Select to compare">
                      <input
                        type="checkbox"
                        checked={isComparing}
                        onChange={() => toggleCompare(broker)}
                      />
                      <span>Compare</span>
                    </label>
                  </div>

                  {/* Rating Row - Clickable to open reviews */}
                  <div
                    className="card-rating-row"
                    onClick={() => setSelectedBrokerForReviews(broker)}
                    title={`View verified reviews & execution benchmarks for ${broker.name}`}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <span className="card-star-icon">★</span>
                    <span className="card-rating-num">{broker.rating}</span>
                    <span className="card-reviews-count">({broker.reviewsCount})</span>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '10.5px',
                        color: '#fc5d21',
                        fontWeight: 700,
                      }}
                    >
                      Reviews →
                    </span>
                  </div>

                  {/* Highlight Badge Pill & Verified Badge */}
                  <div className="card-badge-wrap" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span className={`card-highlight-pill pill-theme-${broker.badgeTheme || 'emerald'}`}>
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
                        title="PipWise Verified Partner & Genuine Broker"
                      >
                        <CheckCircle2 size={11} strokeWidth={2.8} />
                        {t('top_brokers_verified', 'Verified Broker')}
                      </span>
                    )}
                  </div>

                  {/* Broker Promo Offer Banner if available */}
                  {broker.promotionalOffer?.headline && (
                    <div className="card-promo-banner" title="Exclusive Trader Deposit Offer">
                      <div className="promo-left-wrap">
                        <Sparkles size={11} className="promo-sparkle-icon" />
                        <span className="promo-headline-text">
                          {broker.promotionalOffer.headline}
                        </span>
                      </div>
                      {broker.promotionalOffer.code && (
                        <span className="promo-code-pill">
                          {broker.promotionalOffer.code}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Clean Minimal Specs List */}
                  <div className="card-specs-list">
                    <div className="spec-clean-row">
                      <span className="spec-clean-label">{t('spec_min_deposit', 'Min. Deposit')}</span>
                      <span className="spec-clean-value is-deposit">{broker.minDeposit}</span>
                    </div>

                    <div className="spec-clean-row">
                      <span className="spec-clean-label">{t('spec_spread', 'Spread')}</span>
                      <span className="spec-clean-value is-spread">{broker.spread}</span>
                    </div>

                    <div className="spec-clean-row">
                      <span className="spec-clean-label">Max Leverage</span>
                      <span className="spec-clean-value">{broker.maxLeverage}</span>
                    </div>

                    <div className="spec-clean-row">
                      <span className="spec-clean-label">Payments</span>
                      <span className="spec-clean-value">
                        <span className="upi-accept-pill">UPI / IMPS</span>
                      </span>
                    </div>
                  </div>

                  {/* Clean CTA Actions */}
                  <div className="card-actions-group">
                    <a
                      href={broker.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-primary-cta"
                      onClick={() => brokerService.recordClick(broker._id)}
                      aria-label={`Open account with ${broker.name}`}
                    >
                      <span>Open Account</span>
                      <ExternalLink size={13} strokeWidth={2.4} />
                    </a>

                    <div className="card-secondary-actions">
                      <button
                        type="button"
                        className="card-sec-btn sec-btn-reviews"
                        onClick={() => setSelectedBrokerForReviews(broker)}
                        aria-label={`Read trader reviews for ${broker.name}`}
                        title="Trader Reviews"
                      >
                        <span>Reviews</span>
                      </button>

                      <button
                        type="button"
                        className="card-sec-btn sec-btn-desk"
                        onClick={() => setSelectedBrokerForHub(broker)}
                        title={`Broker Partner Desk & Q&A for ${broker.name}`}
                      >
                        <span>Desk</span>
                      </button>

                      <button
                        type="button"
                        className="card-sec-btn sec-btn-specs"
                        onClick={() => setSelectedBrokerForModal(broker)}
                        aria-label={`View specs for ${broker.name}`}
                        title="View Full Specifications"
                      >
                        <span>Specs</span>
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="all-brokers-table-wrapper">
            <table className="all-brokers-table">
              <thead>
                <tr>
                  <th>Broker</th>
                  <th>Rating</th>
                  <th>Min. Deposit</th>
                  <th>Spread</th>
                  <th>Max Leverage</th>
                  <th>Payment Modes</th>
                  <th>Regulation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrokers.map((broker) => (
                  <tr key={broker.id}>
                    <td>
                      <div className="table-broker-cell">
                        <span className={`card-rank-tag ${getRankBadgeClass(broker.rankNum)}`}>
                          {broker.rank}
                        </span>
                        <div style={{ height: '22px', maxWidth: '110px' }}>
                          <BrokerLogo broker={broker} />
                        </div>
                        {(broker.isVerified || broker.isVerifiedPartner) && (
                          <span
                            style={{
                              background: 'rgba(16, 185, 129, 0.16)',
                              color: '#10b981',
                              border: '1px solid rgba(16, 185, 129, 0.35)',
                              borderRadius: '10px',
                              padding: '1px 6px',
                              fontSize: '9.5px',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              marginLeft: '6px',
                              whiteSpace: 'nowrap',
                            }}
                            title="PipWise Verified Partner & Genuine Broker"
                          >
                            <CheckCircle2 size={10} strokeWidth={2.8} />
                            Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                        onClick={() => setSelectedBrokerForReviews(broker)}
                        title={`View community reviews for ${broker.name}`}
                      >
                        <span style={{ color: '#fc5d21' }}>★</span>
                        <strong>{broker.rating}</strong>
                        <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>Reviews</span>
                      </div>
                    </td>
                    <td><strong style={{ color: 'var(--brand-green)' }}>{broker.minDeposit}</strong></td>
                    <td><span style={{ color: '#10b981', fontWeight: 700 }}>{broker.spread}</span></td>
                    <td>{broker.maxLeverage}</td>
                    <td><span className="upi-accept-pill">UPI, NetBanking</span></td>
                    <td>{broker.regulation}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <a
                          href={broker.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="card-primary-cta"
                          onClick={() => brokerService.recordClick(broker._id)}
                          style={{ padding: '4px 10px', height: '32px', fontSize: '0.78rem' }}
                        >
                          Visit
                        </a>
                        <button
                          type="button"
                          className="card-specs-cta"
                          style={{
                            padding: '4px 8px',
                            height: '32px',
                            fontSize: '0.76rem',
                            color: '#fc5d21',
                            borderColor: 'rgba(252, 93, 33, 0.3)',
                          }}
                          onClick={() => setSelectedBrokerForReviews(broker)}
                        >
                          Reviews
                        </button>
                        <button
                          type="button"
                          className="card-specs-cta"
                          style={{
                            padding: '4px 8px',
                            height: '32px',
                            fontSize: '0.74rem',
                            color: '#60a5fa',
                            borderColor: 'rgba(59, 130, 246, 0.3)',
                          }}
                          onClick={() => setSelectedBrokerForHub(broker)}
                        >
                          Desk
                        </button>
                        <button
                          type="button"
                          className="card-specs-cta"
                          style={{ padding: '4px 8px', height: '32px', fontSize: '0.76rem' }}
                          onClick={() => setSelectedBrokerForModal(broker)}
                        >
                          Specs
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {filteredBrokers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Info size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No brokers matched your search</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              Try searching by name, or select a different category pill.
            </p>
            <button
              type="button"
              className="card-primary-cta"
              style={{ display: 'inline-flex', width: 'auto', padding: '0 20px' }}
              onClick={clearAllFilters}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Educational Section for Indian Traders */}
        <section className="all-brokers-methodology-section" aria-label="Indian Trader Safety Guide">
          <div className="methodology-header">
            <h2 className="methodology-title">Guide for Indian Forex Traders</h2>
            <p className="methodology-subtitle">
              Learn how deposits, withdrawals, and leverage work safely for Indian residents using INR (₹).
            </p>
          </div>

          <div className="methodology-steps-grid">
            <div className="methodology-step-card">
              <div className="step-num">01</div>
              <div className="step-title">Instant UPI &amp; IMPS Funding</div>
              <div className="step-desc">
                Recommended brokers support direct INR payments via Google Pay, PhonePe, and Paytm with zero currency conversion commissions.
              </div>
            </div>

            <div className="methodology-step-card">
              <div className="step-num">02</div>
              <div className="step-title">Swap-Free Islamic / Indian Accounts</div>
              <div className="step-desc">
                Brokers like Exness and Octa offer true swap-free accounts so you never pay overnight interest charges on Gold (XAU/USD) or Major FX.
              </div>
            </div>

            <div className="methodology-step-card">
              <div className="step-num">03</div>
              <div className="step-title">Tier-1 Regulatory Segregation</div>
              <div className="step-desc">
                Client capital is held in segregated accounts with Tier-1 international banks, backed by negative balance protection.
              </div>
            </div>

            <div className="methodology-step-card">
              <div className="step-num">04</div>
              <div className="step-title">Fast Local Rupee Cashouts</div>
              <div className="step-desc">
                Payouts are sent directly to Indian savings accounts (SBI, HDFC, ICICI, Axis) via IMPS within minutes to 24 hours.
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Comparison Tray */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <div className="comparison-drawer-tray" role="region" aria-label="Selected brokers for comparison">
            <div className="compare-tray-left">
              <span className="compare-tray-badge">{compareList.length} Selected</span>
              <div className="compare-tray-chips">
                {compareList.map((broker) => (
                  <span key={broker.id} className="tray-broker-pill">
                    <span>{broker.name}</span>
                    <button
                      type="button"
                      className="tray-remove-btn"
                      onClick={() => toggleCompare(broker)}
                      aria-label={`Remove ${broker.name}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="compare-tray-actions">
              <button
                type="button"
                className="tray-compare-btn"
                onClick={() => {
                  if (compareList.length > 0) {
                    const ids = compareList.map((b) => b.slug || b.id).join(',');
                    navigate(`/compare?brokers=${ids}`);
                  } else {
                    navigate('/compare');
                  }
                }}
              >
                Open Comparison ({compareList.length}) →
              </button>
              <button
                type="button"
                className="tray-clear-btn"
                onClick={() => setCompareList([])}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Specs Modal */}
      <AnimatePresence>
        {selectedBrokerForModal && (
          <div
            className="broker-details-modal-overlay"
            onClick={() => setSelectedBrokerForModal(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="broker-details-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedBrokerForModal(null)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>

              <div className="modal-header-section">
                <div className="modal-logo-wrapper">
                  <BrokerLogo broker={selectedBrokerForModal} />
                </div>
                <div className="modal-title-group">
                  <h3>{selectedBrokerForModal.name} Details</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ★ {selectedBrokerForModal.rating} • {selectedBrokerForModal.reviewsCount}
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="modal-specs-grid">
                <div className="modal-spec-card">
                  <div className="lbl">Min. Deposit (INR ₹)</div>
                  <div className="val" style={{ color: 'var(--brand-green)' }}>
                    {selectedBrokerForModal.minDeposit}
                  </div>
                </div>
                <div className="modal-spec-card">
                  <div className="lbl">Spread on EUR/USD</div>
                  <div className="val" style={{ color: '#10b981' }}>
                    {selectedBrokerForModal.spread}
                  </div>
                </div>
                <div className="modal-spec-card">
                  <div className="lbl">Max Leverage</div>
                  <div className="val">{selectedBrokerForModal.maxLeverage}</div>
                </div>
                <div className="modal-spec-card">
                  <div className="lbl">Payment Modes</div>
                  <div className="val">{selectedBrokerForModal.payments}</div>
                </div>
                <div className="modal-spec-card">
                  <div className="lbl">Trading Platforms</div>
                  <div className="val">{selectedBrokerForModal.platforms}</div>
                </div>
                <div className="modal-spec-card">
                  <div className="lbl">Regulation / Safety</div>
                  <div className="val">{selectedBrokerForModal.regulation}</div>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="modal-pros-cons-grid">
                <div className="pros-box">
                  <h4>✓ Key Advantages</h4>
                  <ul>
                    {selectedBrokerForModal.pros?.map((pro, i) => (
                      <li key={i}>• {pro}</li>
                    ))}
                  </ul>
                </div>
                <div className="cons-box">
                  <h4>✕ Considerations</h4>
                  <ul>
                    {selectedBrokerForModal.cons?.map((con, i) => (
                      <li key={i}>• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Modal CTAs with Reviews & Broker Hub Desk triggers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const b = selectedBrokerForModal;
                    setSelectedBrokerForModal(null);
                    setSelectedBrokerForReviews(b);
                  }}
                  className="modal-specs-cta"
                  style={{
                    background: 'rgba(252, 93, 33, 0.12)',
                    border: '1px solid rgba(252, 93, 33, 0.35)',
                    color: '#fc5d21',
                    borderRadius: '10px',
                    padding: '9px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                  }}
                >
                  <Star size={13} fill="#fc5d21" />
                  <span>Trader Reviews</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const b = selectedBrokerForModal;
                    setSelectedBrokerForModal(null);
                    setSelectedBrokerForHub(b);
                  }}
                  className="modal-specs-cta"
                  style={{
                    background: 'rgba(59, 130, 246, 0.12)',
                    border: '1px solid rgba(59, 130, 246, 0.35)',
                    color: '#60a5fa',
                    borderRadius: '10px',
                    padding: '9px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                  }}
                >
                  <Building2 size={13} />
                  <span>Broker Desk & Q&A</span>
                </button>
              </div>

              <a
                href={selectedBrokerForModal.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-open-account-btn"
                onClick={() => brokerService.recordClick(selectedBrokerForModal._id)}
                style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <span>Open Real Account with {selectedBrokerForModal.name}</span>
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Side-by-Side Comparison Modal */}
      <AnimatePresence>
        {showCompareModal && compareList.length > 0 && (
          <div
            className="broker-details-modal-overlay"
            onClick={() => setShowCompareModal(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="broker-details-modal-card"
              style={{ maxWidth: '840px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowCompareModal(false)}
                aria-label="Close comparison"
              >
                <X size={16} />
              </button>

              <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-hero)', marginBottom: '18px' }}>
                Side-by-Side Broker Comparison
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table className="all-brokers-table" style={{ border: '1px solid var(--card-border)' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '160px' }}>Features</th>
                      {compareList.map((b) => (
                        <th key={b.id} style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{ height: '20px' }}>
                              <BrokerLogo broker={b} />
                            </div>
                            <span style={{ fontWeight: 800 }}>{b.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Min. Deposit (₹)</strong></td>
                      {compareList.map((b) => (
                        <td key={b.id} style={{ textAlign: 'center', fontWeight: 700, color: 'var(--brand-green)' }}>
                          {b.minDeposit}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td><strong>EUR/USD Spread</strong></td>
                      {compareList.map((b) => (
                        <td key={b.id} style={{ textAlign: 'center', color: '#10b981', fontWeight: 700 }}>
                          {b.spread}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td><strong>Max Leverage</strong></td>
                      {compareList.map((b) => (
                        <td key={b.id} style={{ textAlign: 'center' }}>
                          {b.maxLeverage}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td><strong>Payments</strong></td>
                      {compareList.map((b) => (
                        <td key={b.id} style={{ textAlign: 'center' }}>
                          <span className="upi-accept-pill">UPI, NetBanking</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td><strong>Regulation</strong></td>
                      {compareList.map((b) => (
                        <td key={b.id} style={{ textAlign: 'center' }}>
                          {b.regulation}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td><strong>Visit Broker</strong></td>
                      {compareList.map((b) => (
                        <td key={b.id} style={{ textAlign: 'center' }}>
                          <a
                            href={b.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card-primary-cta"
                            style={{ padding: '6px 12px', height: '32px', fontSize: '0.78rem', display: 'inline-flex' }}
                          >
                            Open Account
                          </a>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Real Forex App: Broker Reviews & Official Responses Modal */}
      <BrokerReviewsModal
        isOpen={Boolean(selectedBrokerForReviews)}
        broker={selectedBrokerForReviews}
        onClose={() => setSelectedBrokerForReviews(null)}
      />

      {/* Real Forex App: Broker Partner Hub, Traffic Analytics & Q&A Desk */}
      <BrokerHubModal
        isOpen={Boolean(selectedBrokerForHub)}
        broker={selectedBrokerForHub}
        onClose={() => setSelectedBrokerForHub(null)}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
});

export default AllBrokers;
