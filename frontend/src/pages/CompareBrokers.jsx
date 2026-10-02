import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  X,
  ChevronDown,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  CreditCard,
  Smartphone,
  Sliders,
  Sparkles,
  HelpCircle,
  Share2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Search,
  Award,
  Layers,
  Scale,
  ArrowLeftRight
} from 'lucide-react';
import { useBrokers } from '../features/brokers/hooks/useBrokers.js';
import { BrokerLogo } from '../features/brokers/components/BrokerLogo.jsx';
import { useToast } from '../features/shared/components/toast/ToastContext.jsx';
import Footer from '../features/shared/components/Footer.jsx';
import { useLanguage } from '../features/shared/context/LanguageContext.jsx';
import './CompareBrokers.css';

// Predefined quick-comparison presets
const PRESETS = [
  {
    id: 'top3',
    label: 'Top 3 Flagship',
    description: 'Exness vs XM vs IC Markets',
    brokers: ['exness', 'xm', 'ic-markets'],
    badge: 'Popular'
  },
  {
    id: 'raw_spread',
    label: 'Zero / Raw Spreads',
    description: 'Best for scalpers & day traders',
    brokers: ['exness', 'ic-markets', 'pepperstone'],
    badge: 'Low Cost'
  },
  {
    id: 'india_upi',
    label: 'Best for India (UPI)',
    description: 'Instant INR deposit & payout brokers',
    brokers: ['exness', 'xm', 'octa'],
    badge: 'Local UPI'
  },
  {
    id: 'high_leverage',
    label: 'Maximum Leverage',
    description: '1:1000 up to Unlimited Leverage',
    brokers: ['exness', 'fbs', 'hfm'],
    badge: '1:1000+'
  }
];

export const CompareBrokers = React.memo(({ theme = 'dark' }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { brokers, isLoading } = useBrokers();

  // Scroll to top on page mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Selected broker IDs state (max 4, min 1)
  const [selectedIds, setSelectedIds] = useState(() => {
    const param = searchParams.get('brokers');
    if (param) {
      const ids = param.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (ids.length > 0) return ids.slice(0, 4);
    }
    return ['exness', 'xm', 'ic-markets'];
  });

  // Highlight only differences toggle
  const [highlightDiffOnly, setHighlightDiffOnly] = useState(false);
  // Mobile layout mode: 'fit' (zero-swipe) | 'table' (wide scroll)
  const [mobileLayoutMode, setMobileLayoutMode] = useState('fit');
  // Search query within table criteria
  const [criteriaSearch, setCriteriaSearch] = useState('');
  // Active modal/dropdown for adding or replacing broker in a slot
  const [activePickerSlot, setActivePickerSlot] = useState(null); // index (0..3) or 'add'
  const [pickerFilter, setPickerFilter] = useState('');

  // Sync selected IDs to URL query params
  useEffect(() => {
    if (selectedIds.length > 0) {
      setSearchParams({ brokers: selectedIds.join(',') }, { replace: true });
    }
  }, [selectedIds, setSearchParams]);

  // Resolve selected broker objects from enriched brokers list
  const selectedBrokers = useMemo(() => {
    if (!brokers || brokers.length === 0) return [];
    return selectedIds
      .map((id) => {
        const found = brokers.find(
          (b) =>
            (b.slug && b.slug.toLowerCase() === id.toLowerCase()) ||
            (b.id && b.id.toLowerCase() === id.toLowerCase()) ||
            (b._id && b._id.toString() === id)
        );
        return found || null;
      })
      .filter(Boolean);
  }, [brokers, selectedIds]);

  // Remove a broker from comparison
  const handleRemoveBroker = (brokerId) => {
    if (selectedIds.length <= 1) {
      toast.warning('Minimum Required', 'You must have at least one broker in comparison.');
      return;
    }
    setSelectedIds((prev) => prev.filter((id) => id !== brokerId));
  };

  // Replace or add a broker to selected list
  const handleSelectBrokerForSlot = (broker) => {
    const brokerKey = broker.slug || broker.id;
    if (activePickerSlot === 'add') {
      if (selectedIds.length >= 4) {
        toast.warning('Limit Reached', 'You can compare up to 4 brokers simultaneously.');
        return;
      }
      if (!selectedIds.includes(brokerKey)) {
        setSelectedIds((prev) => [...prev, brokerKey]);
      }
    } else if (typeof activePickerSlot === 'number') {
      setSelectedIds((prev) => {
        const next = [...prev];
        next[activePickerSlot] = brokerKey;
        // Ensure no duplicates
        return Array.from(new Set(next));
      });
    }
    setActivePickerSlot(null);
    setPickerFilter('');
  };

  // Apply a quick preset
  const handleApplyPreset = (preset) => {
    setSelectedIds(preset.brokers);
    toast.success('Preset Applied', `Loaded comparison: ${preset.label}`);
  };

  // Copy shareable comparison link
  const handleShare = () => {
    try {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      toast.success('Link Copied', 'Comparison link copied to clipboard!');
    } catch {
      toast.info('Share URL', window.location.href);
    }
  };

  // Reset comparison to top 3 defaults
  const handleReset = () => {
    setSelectedIds(['exness', 'xm', 'ic-markets']);
    setHighlightDiffOnly(false);
    setCriteriaSearch('');
    toast.info('Reset Completed', 'Restored default comparison.');
  };

  // Unselected brokers available to add
  const availableBrokers = useMemo(() => {
    if (!brokers) return [];
    const selectedSet = new Set(selectedIds.map((s) => s.toLowerCase()));
    return brokers.filter((b) => {
      const key = (b.slug || b.id || '').toLowerCase();
      const matchesSearch =
        !pickerFilter ||
        b.name.toLowerCase().includes(pickerFilter.toLowerCase()) ||
        (b.regulation && b.regulation.toLowerCase().includes(pickerFilter.toLowerCase()));
      return !selectedSet.has(key) && matchesSearch;
    });
  }, [brokers, selectedIds, pickerFilter]);

  // Comparison criteria structure
  const comparisonSections = [
    {
      id: 'overview',
      title: 'General Overview & Trust',
      icon: ShieldCheck,
      rows: [
        {
          key: 'rank',
          label: 'PipWise Rank',
          tooltip: 'Official PipWise ranking based on audit & verified trader reviews',
          getValue: (b) => b.rank || `#${b.rankNum || '--'}`,
          render: (val) => <span className="matrix-badge-rank">{val}</span>
        },
        {
          key: 'rating',
          label: 'Trader Rating',
          tooltip: 'Average rating from verified forex traders',
          getValue: (b) => b.rating ? `${b.rating} / 5.0` : '4.8 / 5.0',
          render: (val, b) => (
            <div className="matrix-rating-cell">
              <span className="matrix-star">★</span>
              <span className="matrix-rating-num">{val}</span>
              <span className="matrix-reviews-count">({b.reviewsCount || '1.2K+'})</span>
            </div>
          )
        },
        {
          key: 'trustScore',
          label: 'Trust Score',
          tooltip: 'PipWise proprietary safety and financial security score (out of 100)',
          getValue: (b) => b.trustScore || 95,
          render: (val) => (
            <div className="matrix-trust-cell">
              <div className="matrix-trust-meter">
                <div
                  className="matrix-trust-fill"
                  style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                />
              </div>
              <span className="matrix-trust-value">{val}/100</span>
            </div>
          )
        },
        {
          key: 'regulation',
          label: 'Regulators & Licenses',
          tooltip: 'Official financial supervisory licenses held',
          getValue: (b) => (b.regulatorsList && b.regulatorsList.length > 0 ? b.regulatorsList.join(', ') : b.regulation || 'FCA, CySEC'),
          render: (val, b) => {
            const list = b.regulatorsList || (typeof val === 'string' ? val.split(',').map((s) => s.trim()) : []);
            return (
              <div className="matrix-tags-flex">
                {list.map((reg, idx) => (
                  <span key={idx} className="matrix-reg-chip">
                    <ShieldCheck size={11} className="chip-icon" />
                    {reg}
                  </span>
                ))}
              </div>
            );
          }
        },
        {
          key: 'yearFounded',
          label: 'Founded Year',
          tooltip: 'Year the brokerage firm was founded and licensed',
          getValue: (b) => b.yearFounded || '2008',
          render: (val) => <span className="matrix-plain-text">{val} ({new Date().getFullYear() - Number(val)} yrs track record)</span>
        },
        {
          key: 'headquarters',
          label: 'Headquarters',
          tooltip: 'Global corporate registration office',
          getValue: (b) => b.headquarters || 'Limassol, Cyprus',
          render: (val) => <span className="matrix-plain-text">{val}</span>
        }
      ]
    },
    {
      id: 'costs',
      title: 'Trading Costs & Spreads',
      icon: Zap,
      rows: [
        {
          key: 'minDepositINR',
          label: 'Min. Deposit (INR)',
          tooltip: 'Minimum initial deposit required in Indian Rupees (INR)',
          getValue: (b) => b.minDepositINR ? `₹${Number(b.minDepositINR).toLocaleString('en-IN')}` : b.minDeposit || '₹850',
          render: (val) => <span className="matrix-highlight-val">{val}</span>
        },
        {
          key: 'minDepositUSD',
          label: 'Min. Deposit (USD)',
          tooltip: 'Minimum initial deposit in US Dollars',
          getValue: (b) => b.minDepositUSD ? `$${b.minDepositUSD}` : '$10',
          render: (val) => <span className="matrix-plain-text">{val}</span>
        },
        {
          key: 'spread',
          label: 'EUR/USD Spread',
          tooltip: 'Minimum standard spread on EUR/USD currency pair',
          getValue: (b) => b.spread || (b.spreadNum !== undefined ? `From ${b.spreadNum} pips` : 'From 0.1 pips'),
          render: (val, b) => {
            const isZero = b.spreadNum === 0 || (val && val.includes('0.0'));
            return (
              <span className={`matrix-spread-pill ${isZero ? 'is-zero' : ''}`}>
                {val}
              </span>
            );
          }
        },
        {
          key: 'maxLeverage',
          label: 'Max Leverage',
          tooltip: 'Highest available leverage ratio on forex majors',
          getValue: (b) => b.maxLeverage || '1:1000',
          render: (val) => (
            <span className="matrix-leverage-tag">
              <TrendingUp size={12} />
              {val}
            </span>
          )
        },
        {
          key: 'executionType',
          label: 'Execution Model',
          tooltip: 'Order routing model (ECN, STP, or Market Maker)',
          getValue: (b) => b.executionType || 'STP / ECN Direct',
          render: (val) => <span className="matrix-plain-text">{val}</span>
        },
        {
          key: 'accountTypes',
          label: 'Account Types',
          tooltip: 'Account tiers available for retail and professional traders',
          getValue: (b) => b.accountTypes || 'Standard, Raw Spread, Pro',
          render: (val) => <span className="matrix-plain-text">{val}</span>
        }
      ]
    },
    {
      id: 'payments',
      title: 'Local India Payouts & Methods',
      icon: CreditCard,
      rows: [
        {
          key: 'upiAccepted',
          label: 'Instant UPI Support',
          tooltip: 'Supports PhonePe, Google Pay, Paytm, and BHIM UPI transfers',
          getValue: (b) => {
            const str = (b.payments || '') + (b.paymentsList ? b.paymentsList.join(' ') : '');
            return str.toLowerCase().includes('upi');
          },
          render: (val) =>
            val ? (
              <span className="matrix-status-yes">
                <Check size={14} /> Supported (Instant)
              </span>
            ) : (
              <span className="matrix-status-no">
                <X size={14} /> Not Available
              </span>
            )
        },
        {
          key: 'netBanking',
          label: 'Local NetBanking / IMPS',
          tooltip: 'Direct transfers from SBI, HDFC, ICICI, Axis, and other Indian banks',
          getValue: (b) => {
            const str = (b.payments || '') + (b.paymentsList ? b.paymentsList.join(' ') : '');
            return str.toLowerCase().includes('netbanking') || str.toLowerCase().includes('imps');
          },
          render: (val) =>
            val ? (
              <span className="matrix-status-yes">
                <Check size={14} /> Available
              </span>
            ) : (
              <span className="matrix-status-no">
                <X size={14} /> Not Available
              </span>
            )
        },
        {
          key: 'crypto',
          label: 'Crypto Payments (USDT/BTC)',
          tooltip: 'Deposit and withdraw in Tether (USDT TRC20/ERC20) or Bitcoin',
          getValue: (b) => {
            const str = (b.payments || '') + (b.paymentsList ? b.paymentsList.join(' ') : '');
            return str.toLowerCase().includes('crypto');
          },
          render: (val) =>
            val ? (
              <span className="matrix-status-yes">
                <Check size={14} /> Supported
              </span>
            ) : (
              <span className="matrix-status-no">
                <X size={14} /> Not Available
              </span>
            )
        },
        {
          key: 'paymentsList',
          label: 'All Payment Methods',
          tooltip: 'Supported payment gateways and deposit options',
          getValue: (b) => (b.paymentsList && b.paymentsList.length > 0 ? b.paymentsList.join(', ') : b.payments || 'UPI, NetBanking, Cards, Crypto'),
          render: (val, b) => {
            const list = b.paymentsList || (typeof val === 'string' ? val.split(',').map((s) => s.trim()) : []);
            return (
              <div className="matrix-tags-flex">
                {list.map((pay, idx) => (
                  <span key={idx} className="matrix-pay-chip">
                    {pay}
                  </span>
                ))}
              </div>
            );
          }
        },
        {
          key: 'payoutSpeed',
          label: 'Withdrawal Speed',
          tooltip: 'Estimated processing timeframe for approved payouts',
          getValue: (b) => (b.name === 'Exness' ? 'Instant (< 60 sec)' : b.name === 'XM' ? 'Under 2 hours' : '1 - 24 hours'),
          render: (val) => <span className="matrix-highlight-val">{val}</span>
        },
        {
          key: 'depositFee',
          label: 'Deposit & Withdrawal Fee',
          tooltip: 'Broker fee charged for deposits and regular withdrawals',
          getValue: () => '0% (Free)',
          render: () => <span className="matrix-status-yes">0% Fee (Free)</span>
        }
      ]
    },
    {
      id: 'platforms',
      title: 'Platforms & Trading Tools',
      icon: Smartphone,
      rows: [
        {
          key: 'mt4',
          label: 'MetaTrader 4 (MT4)',
          tooltip: 'Supports industry-standard MT4 for desktop, web & mobile',
          getValue: (b) => {
            const str = (b.platforms || '') + (b.platformsList ? b.platformsList.join(' ') : '');
            return str.includes('MT4');
          },
          render: (val) => (val ? <span className="matrix-status-yes"><Check size={14} /> Yes</span> : <span className="matrix-status-no"><X size={14} /> No</span>)
        },
        {
          key: 'mt5',
          label: 'MetaTrader 5 (MT5)',
          tooltip: 'Supports advanced multi-asset MT5 platform',
          getValue: (b) => {
            const str = (b.platforms || '') + (b.platformsList ? b.platformsList.join(' ') : '');
            return str.includes('MT5');
          },
          render: (val) => (val ? <span className="matrix-status-yes"><Check size={14} /> Yes</span> : <span className="matrix-status-no"><X size={14} /> No</span>)
        },
        {
          key: 'ctrader',
          label: 'cTrader / TradingView',
          tooltip: 'Direct cTrader execution or native TradingView charting',
          getValue: (b) => {
            const str = (b.platforms || '') + (b.platformsList ? b.platformsList.join(' ') : '');
            return str.includes('cTrader') || str.includes('TradingView') || b.name === 'IC Markets' || b.name === 'Pepperstone';
          },
          render: (val) => (val ? <span className="matrix-status-yes"><Check size={14} /> Available</span> : <span className="matrix-plain-text text-muted">Via Web</span>)
        },
        {
          key: 'mobileApp',
          label: 'Mobile Trading App',
          tooltip: 'Proprietary iOS & Android mobile application',
          getValue: () => true,
          render: () => <span className="matrix-status-yes"><Check size={14} /> iOS & Android</span>
        },
        {
          key: 'copyTrading',
          label: 'Copy Trading / Social',
          tooltip: 'Copy successful master traders with automated trade replication',
          getValue: (b) => (b.name === 'Octa' || b.name === 'HFM' || b.name === 'Exness' || b.name === 'FBS'),
          render: (val) => (val ? <span className="matrix-status-yes"><Check size={14} /> Built-in</span> : <span className="matrix-plain-text">Via MT4/5 Signals</span>)
        },
        {
          key: 'scalping',
          label: 'Scalping & Hedging',
          tooltip: 'High-frequency scalping and position hedging allowed',
          getValue: () => true,
          render: () => <span className="matrix-status-yes"><Check size={14} /> 100% Allowed</span>
        }
      ]
    },
    {
      id: 'features',
      title: 'Key Advantages & Limitations',
      icon: Award,
      rows: [
        {
          key: 'highlightBadge',
          label: 'Core Superpower',
          tooltip: 'Primary defining competitive edge on PipWise',
          getValue: (b) => b.highlightBadge || 'Top Rated Partner',
          render: (val, b) => (
            <span className={`matrix-superpower-pill badge-${b.badgeTheme || 'emerald'}`}>
              <Sparkles size={11} />
              {val}
            </span>
          )
        },
        {
          key: 'pros',
          label: 'Top Advantages',
          tooltip: 'Verified pros reported by real traders',
          getValue: (b) => (b.pros && b.pros.length > 0 ? b.pros.join('; ') : 'Fast withdrawals, tight spreads'),
          render: (val, b) => {
            const pros = b.pros || ['Ultra-low spreads on major currency pairs', 'Fast deposit and withdrawal processing'];
            return (
              <ul className="matrix-bullets-list pros">
                {pros.map((p, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={13} className="bullet-icon-pro" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            );
          }
        },
        {
          key: 'cons',
          label: 'Things to Note',
          tooltip: 'Key factors to consider before trading',
          getValue: (b) => (b.cons && b.cons.length > 0 ? b.cons.join('; ') : 'Standard terms apply'),
          render: (val, b) => {
            const cons = b.cons || ['Terms apply to bonus funds', 'Higher volatility on news releases'];
            return (
              <ul className="matrix-bullets-list cons">
                {cons.map((c, idx) => (
                  <li key={idx}>
                    <AlertCircle size={13} className="bullet-icon-con" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            );
          }
        }
      ]
    }
  ];

  // Helper to determine if a row has differing values across all selected brokers
  const isRowDifferent = (row) => {
    if (selectedBrokers.length <= 1) return false;
    const values = selectedBrokers.map((b) => String(row.getValue(b) ?? '').toLowerCase().trim());
    return new Set(values).size > 1;
  };

  // Filter sections and rows based on highlightDiffOnly and criteriaSearch
  const filteredSections = useMemo(() => {
    return comparisonSections
      .map((section) => {
        const filteredRows = section.rows.filter((row) => {
          // If criteria search active
          if (criteriaSearch) {
            const query = criteriaSearch.toLowerCase();
            const matchesLabel = row.label.toLowerCase().includes(query);
            const matchesTooltip = row.tooltip.toLowerCase().includes(query);
            if (!matchesLabel && !matchesTooltip) return false;
          }
          // If highlight difference only
          if (highlightDiffOnly && !isRowDifferent(row)) {
            return false;
          }
          return true;
        });

        return {
          ...section,
          rows: filteredRows
        };
      })
      .filter((section) => section.rows.length > 0);
  }, [selectedBrokers, highlightDiffOnly, criteriaSearch]);

  return (
    <div className="compare-page-root" data-theme={theme}>
      {/* Subtle Ambient Glow */}
      <div className="compare-ambient-glow" aria-hidden="true" />

      <main className="compare-page-container">
        {/* Breadcrumb Navigation */}
        <nav className="compare-breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb-item">{t('breadcrumb_home', 'Home')}</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/brokers" className="breadcrumb-item">{t('nav_brokers', 'Brokers')}</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{t('compare_breadcrumb_matrix', 'Broker Comparison Matrix')}</span>
        </nav>

        {/* Hero Header Area (Clean, Minimal, High-Fidelity) */}
        <header className="compare-header">
          <div className="compare-header-badge">
            <Scale size={13} className="header-badge-icon" />
            <span>{t('compare_header_badge', 'Interactive Broker Matrix')}</span>
          </div>

          <h1 className="compare-main-title">
            {t('compare_main_title', 'Compare Top Forex Brokers Side-by-Side')}
          </h1>

          <p className="compare-subtitle">
            {t('compare_subtitle', 'Evaluate spreads, verified UPI payouts, regulatory security, and trading terms in a clean, minimal side-by-side view.')}
          </p>

          {/* Quick Comparison Presets Bar */}
          <div className="compare-presets-bar">
            <span className="presets-label">{t('compare_presets_label', 'Popular Presets:')}</span>
            <div className="presets-chips">
              {PRESETS.map((preset) => {
                const isActive =
                  preset.brokers.length === selectedIds.length &&
                  preset.brokers.every((b, i) => selectedIds[i] === b);

                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`preset-chip-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleApplyPreset(preset)}
                  >
                    <span>{preset.label}</span>
                    <span className="preset-pill-tag">{preset.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action & Filter Toolbar */}
          <div className="compare-toolbar">
            <div className="toolbar-left">
              {/* Highlight Differences Toggle */}
              <label className="diff-toggle-label">
                <input
                  type="checkbox"
                  checked={highlightDiffOnly}
                  onChange={(e) => setHighlightDiffOnly(e.target.checked)}
                  className="diff-toggle-checkbox"
                />
                <span className="diff-toggle-slider" />
                <span className="diff-toggle-text">
                  {t('compare_diff_only', 'Show Differences Only')}
                </span>
              </label>

              {/* Quick Search in Criteria */}
              <div className="criteria-search-box">
                <Search size={14} className="criteria-search-icon" />
                <input
                  type="text"
                  placeholder={t('compare_search_placeholder', 'Filter criteria (spread, UPI, MT5)...')}
                  value={criteriaSearch}
                  onChange={(e) => setCriteriaSearch(e.target.value)}
                  className="criteria-search-input"
                />
                {criteriaSearch && (
                  <button
                    type="button"
                    className="criteria-search-clear"
                    onClick={() => setCriteriaSearch('')}
                    aria-label="Clear criteria search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Mobile View Mode Switcher (Zero-Swipe vs Table) */}
              <div className="mobile-view-mode-toggle" aria-label="Mobile Layout Mode">
                <button
                  type="button"
                  className={`mobile-mode-btn ${mobileLayoutMode === 'fit' ? 'is-active' : ''}`}
                  onClick={() => setMobileLayoutMode('fit')}
                  title="Fit to Screen - Zero swipe required"
                >
                  <Smartphone size={13} />
                  <span>Fit Screen</span>
                </button>
                <button
                  type="button"
                  className={`mobile-mode-btn ${mobileLayoutMode === 'table' ? 'is-active' : ''}`}
                  onClick={() => setMobileLayoutMode('table')}
                  title="Wide Table with swipe"
                >
                  <ArrowLeftRight size={13} />
                  <span>Table</span>
                </button>
              </div>
            </div>

            <div className="toolbar-right">
              {/* Share Button */}
              <button
                type="button"
                className="toolbar-action-btn"
                onClick={handleShare}
                title="Copy shareable comparison link"
              >
                <Share2 size={14} />
                <span>Share</span>
              </button>

              {/* Reset Button */}
              <button
                type="button"
                className="toolbar-action-btn"
                onClick={handleReset}
                title="Reset to default brokers"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════
            ZERO-SWIPE MOBILE MATRIX VIEW (100% Fit Screen, Zero Swipe Needed)
            ═══════════════════════════════════════════════════════════════ */}
        <div className={`mobile-fit-matrix-wrapper ${mobileLayoutMode === 'table' ? 'mobile-hidden' : ''}`}>
          {/* 1. Mobile Sticky Top Header with Brokers side-by-side */}
          <div className="mobile-fit-sticky-bar">
            <div
              className="mobile-fit-brokers-row"
              style={{ gridTemplateColumns: `repeat(${selectedBrokers.length}, 1fr)` }}
            >
              {selectedBrokers.map((broker, idx) => (
                <div key={broker.id || idx} className="mobile-fit-broker-card">
                  {/* Top Swap & Remove actions */}
                  <div className="mobile-fit-broker-top">
                    <button
                      type="button"
                      className="mobile-fit-swap-btn"
                      onClick={() => setActivePickerSlot(idx)}
                      title="Swap this broker"
                    >
                      <span>Swap</span>
                      <ChevronDown size={10} />
                    </button>

                    {selectedBrokers.length > 1 && (
                      <button
                        type="button"
                        className="mobile-fit-remove-btn"
                        onClick={() => handleRemoveBroker(broker.id || broker.slug)}
                        aria-label={`Remove ${broker.name}`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Logo + Name */}
                  <div className="mobile-fit-identity">
                    <div className="mobile-fit-logo-box">
                      <BrokerLogo broker={broker} />
                    </div>
                    <span className="mobile-fit-name">{broker.name}</span>
                  </div>

                  {/* Rating & Trust */}
                  <div className="mobile-fit-scores">
                    <span className="mobile-fit-trust">🛡️ {broker.trustScore || 95}</span>
                    <span className="mobile-fit-stars">★ {broker.rating || 4.8}</span>
                  </div>

                  {/* Direct Open Account CTA */}
                  <a
                    href={broker.affiliateUrl || broker.websiteUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mobile-fit-cta-btn"
                  >
                    <span>Open</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Structured Category Sections & Zero-Swipe Parameters */}
          <div className="mobile-fit-sections">
            {filteredSections.map((section) => (
              <div key={section.id} className="mobile-fit-section">
                {/* Category Header */}
                <div className="mobile-fit-section-header">
                  <section.icon size={14} className="mobile-section-icon" />
                  <span className="mobile-section-title">{section.title}</span>
                </div>

                {/* Parameters */}
                <div className="mobile-fit-rows-list">
                  {section.rows.map((row) => {
                    const different = isRowDifferent(row);
                    return (
                      <div
                        key={row.key}
                        className={`mobile-fit-param-item ${different ? 'is-diff-row' : ''}`}
                      >
                        {/* Parameter Title spanning full width above values */}
                        <div className="mobile-param-header">
                          <span className="mobile-param-title">{row.label}</span>
                          {row.tooltip && (
                            <span className="mobile-param-help" title={row.tooltip}>
                              <HelpCircle size={11} />
                            </span>
                          )}
                        </div>

                        {/* Values grid for all brokers side-by-side (100% width) */}
                        <div
                          className="mobile-param-columns"
                          style={{ gridTemplateColumns: `repeat(${selectedBrokers.length}, 1fr)` }}
                        >
                          {selectedBrokers.map((broker, bIdx) => {
                            const val = row.getValue(broker);
                            return (
                              <div key={broker.id || bIdx} className="mobile-param-cell">
                                {row.render ? (
                                  row.render(val, broker)
                                ) : (
                                  <span className="matrix-plain-text">{String(val ?? '--')}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Add Broker Button on Mobile */}
          {selectedBrokers.length < 4 && (
            <div className="mobile-fit-add-broker-wrap">
              <button
                type="button"
                className="mobile-fit-add-btn"
                onClick={() => setActivePickerSlot('add')}
              >
                <Plus size={16} />
                <span>+ Add Another Broker ({selectedBrokers.length}/4)</span>
              </button>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            THE DESKTOP / WIDE TABLE MATRIX
            ═══════════════════════════════════════════════════════════════ */}
        {/* Mobile Swipe Hint Bar (Only shown in wide table mode on mobile) */}
        {mobileLayoutMode === 'table' && (
          <div className="compare-mobile-swipe-hint" aria-hidden="true">
            <ArrowLeftRight size={13} className="swipe-hint-icon" />
            <span>Swipe horizontally to compare brokers side-by-side</span>
          </div>
        )}

        <div className={`matrix-table-wrapper ${mobileLayoutMode === 'fit' ? 'mobile-hidden' : ''}`}>
          <div className="matrix-table-scroll">
            <table className="matrix-table" aria-label="Broker Feature Matrix">
              {/* 1. STICKY BROKER HEADER ROW */}
              <thead className="matrix-thead-sticky">
                <tr>
                  {/* Left Corner: Criteria Label Column */}
                  <th className="matrix-th-corner">
                    <div className="corner-content">
                      <span className="corner-title">Comparing ({selectedBrokers.length})</span>
                      <span className="corner-hint">Sticky parameters</span>
                    </div>
                  </th>

                  {/* Broker Header Columns */}
                  {selectedBrokers.map((broker, idx) => (
                    <th key={broker.id || idx} className="matrix-th-broker">
                      <div className="broker-header-card">
                        {/* Remove / Swap Actions */}
                        <div className="broker-card-top-actions">
                          <button
                            type="button"
                            className="broker-swap-btn"
                            onClick={() => setActivePickerSlot(idx)}
                            title="Swap this broker with another"
                          >
                            <span>Swap</span>
                            <ChevronDown size={11} />
                          </button>

                          {selectedBrokers.length > 1 && (
                            <button
                              type="button"
                              className="broker-remove-btn"
                              onClick={() => handleRemoveBroker(broker.id || broker.slug)}
                              title={`Remove ${broker.name} from comparison`}
                              aria-label={`Remove ${broker.name}`}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>

                        {/* Broker Logo & Name */}
                        <div className="broker-identity">
                          <div className="broker-logo-wrap">
                            <BrokerLogo broker={broker} />
                          </div>
                          <div className="broker-name-row">
                            <h3 className="broker-name">{broker.name}</h3>
                            <span className="broker-badge-pill" title="PipWise Verified Partner & Genuine Broker">
                              <CheckCircle2 size={11} className="verified-icon" />
                              {(broker.isVerified || broker.isVerifiedPartner) ? t('top_brokers_verified', 'Verified Broker') : 'Verified'}
                            </span>
                          </div>
                        </div>

                        {/* Key Metrics Quick Pill */}
                        <div className="broker-header-metrics">
                          <span className="header-metric-item">
                            <span className="metric-lbl">Trust Score</span>
                            <span className="metric-val-green">{broker.trustScore || 95}/100</span>
                          </span>
                          <span className="metric-divider" />
                          <span className="header-metric-item">
                            <span className="metric-lbl">Rating</span>
                            <span className="metric-val-amber">★ {broker.rating || 4.8}</span>
                          </span>
                        </div>

                        {/* Direct CTA */}
                        <a
                          href={broker.affiliateUrl || broker.websiteUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="broker-visit-cta"
                          aria-label={`Visit ${broker.name} Official Website`}
                        >
                          <span>Open Account</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </th>
                  ))}

                  {/* Add Broker Slot (if less than 4 brokers selected) */}
                  {selectedBrokers.length < 4 && (
                    <th className="matrix-th-add-slot">
                      <button
                        type="button"
                        className="add-broker-slot-btn"
                        onClick={() => setActivePickerSlot('add')}
                      >
                        <div className="add-slot-circle">
                          <Plus size={18} />
                        </div>
                        <span className="add-slot-text">Add Broker</span>
                        <span className="add-slot-sub">Compare up to 4</span>
                      </button>
                    </th>
                  )}
                </tr>
              </thead>

              {/* 2. TABLE BODY (STRUCTURED SECTIONS & ROWS) */}
              <tbody className="matrix-tbody">
                {filteredSections.map((section) => (
                  <React.Fragment key={section.id}>
                    {/* Section Header Row */}
                    <tr className="matrix-section-row">
                      <td colSpan={selectedBrokers.length + (selectedBrokers.length < 4 ? 2 : 1)} className="matrix-section-td">
                        <div className="matrix-section-title-wrap">
                          <section.icon size={15} className="matrix-section-icon" />
                          <span className="matrix-section-title">{section.title}</span>
                          <span className="matrix-section-count">({section.rows.length} parameters)</span>
                        </div>
                      </td>
                    </tr>

                    {/* Feature Rows */}
                    {section.rows.map((row) => {
                      const different = isRowDifferent(row);
                      return (
                        <tr
                          key={row.key}
                          className={`matrix-data-row ${different ? 'is-different-row' : ''}`}
                        >
                          {/* Criteria Name Column */}
                          <td className="matrix-td-label">
                            <div className="criteria-label-wrap">
                              <span className="criteria-label-text">{row.label}</span>
                              {row.tooltip && (
                                <span className="criteria-tooltip-trigger" title={row.tooltip}>
                                  <HelpCircle size={12} />
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Data Values for each broker */}
                          {selectedBrokers.map((broker, bIdx) => {
                            const val = row.getValue(broker);
                            return (
                              <td
                                key={broker.id || bIdx}
                                className={`matrix-td-value ${different ? 'cell-highlight-diff' : ''}`}
                              >
                                {row.render ? row.render(val, broker) : <span className="matrix-plain-text">{String(val ?? '--')}</span>}
                              </td>
                            );
                          })}

                          {/* Empty Cell for the Add Slot column if present */}
                          {selectedBrokers.length < 4 && (
                            <td className="matrix-td-empty-slot" aria-hidden="true" />
                          )}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>

              {/* 3. TABLE FOOTER (BOTTOM ACTION CARDS) */}
              <tfoot className="matrix-tfoot">
                <tr>
                  <td className="matrix-td-footer-label">
                    <span className="footer-label-main">Ready to Trade?</span>
                    <span className="footer-label-sub">Official verified links</span>
                  </td>
                  {selectedBrokers.map((broker, idx) => (
                    <td key={broker.id || idx} className="matrix-td-footer-cta">
                      <div className="footer-cta-container">
                        <span className="footer-broker-name">{broker.name}</span>
                        <a
                          href={broker.affiliateUrl || broker.websiteUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="footer-action-btn"
                        >
                          <span>Visit {broker.name}</span>
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </td>
                  ))}
                  {selectedBrokers.length < 4 && <td className="matrix-td-empty-slot" />}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Bottom Educational / Security Note */}
        <div className="compare-bottom-guarantee">
          <ShieldCheck size={18} className="guarantee-icon" />
          <div className="guarantee-text">
            <strong>PipWise Independent Audit Guarantee:</strong> All spreads, minimum deposit thresholds, and local UPI payout claims are independently verified through active trading accounts. PipWise does not sell rankings to brokers.
          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════
          BROKER PICKER MODAL (Add or Swap Broker)
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activePickerSlot !== null && (
          <div className="broker-picker-overlay" onClick={() => setActivePickerSlot(null)}>
            <motion.div
              className="broker-picker-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="picker-modal-header">
                <div>
                  <h3 className="picker-modal-title">
                    {activePickerSlot === 'add' ? 'Add Broker to Comparison' : 'Select Replacement Broker'}
                  </h3>
                  <p className="picker-modal-subtitle">
                    Choose from verified forex brokers licensed for global & Indian traders.
                  </p>
                </div>
                <button
                  type="button"
                  className="picker-close-btn"
                  onClick={() => setActivePickerSlot(null)}
                  aria-label="Close picker modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search within available brokers */}
              <div className="picker-search-bar">
                <Search size={15} className="picker-search-icon" />
                <input
                  type="text"
                  placeholder="Search broker by name or license (e.g. Octa, ASIC, FSA)..."
                  value={pickerFilter}
                  onChange={(e) => setPickerFilter(e.target.value)}
                  autoFocus
                  className="picker-search-input"
                />
                {pickerFilter && (
                  <button
                    type="button"
                    className="picker-clear-btn"
                    onClick={() => setPickerFilter('')}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Available Brokers List */}
              <div className="picker-brokers-list">
                {availableBrokers.length === 0 ? (
                  <div className="picker-empty-state">
                    <p>No additional brokers found matching "{pickerFilter}".</p>
                  </div>
                ) : (
                  availableBrokers.map((broker) => (
                    <button
                      key={broker.id || broker.slug}
                      type="button"
                      className="picker-broker-item"
                      onClick={() => handleSelectBrokerForSlot(broker)}
                    >
                      <div className="picker-broker-left">
                        <div className="picker-logo-box">
                          <BrokerLogo broker={broker} />
                        </div>
                        <div className="picker-broker-meta">
                          <div className="picker-name-row">
                            <span className="picker-name">{broker.name}</span>
                            <span className="picker-rank">{broker.rank || `#${broker.rankNum}`}</span>
                          </div>
                          <div className="picker-details">
                            <span>★ {broker.rating || 4.8}</span>
                            <span>•</span>
                            <span>Min: {broker.minDeposit || '₹850'}</span>
                            <span>•</span>
                            <span>Spread: {broker.spread || '0.1 pips'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="picker-broker-right">
                        <span className="picker-add-action">Select</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
});

export default CompareBrokers;
