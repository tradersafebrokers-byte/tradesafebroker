import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Zap,
  Globe,
  Mail,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Clock,
  Coins,
  Lock,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { useBrokers } from '../features/brokers/hooks/useBrokers.js';
import { BrokerLogo } from '../features/brokers/components/BrokerLogo.jsx';
import { useToast } from '../features/shared/components/toast/ToastContext.jsx';
import Footer from '../features/shared/components/Footer.jsx';
import { useLanguage } from '../features/shared/context/LanguageContext.jsx';
import './JoinBroker.css';

const PRESET_COLORS = [
  '#fc5d21', // TradeSafe Coral/Orange
  '#2EE8C2', // Cyan/Mint
  '#10b981', // Emerald
  '#0284c7', // Ocean Blue
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#f59e0b', // Amber Gold
];

const PRESET_REGULATORS = [
  'FCA',
  'ASIC',
  'CySEC',
  'FSA',
  'FSCA',
  'DFSA',
  'NFA',
  'BaFin',
  'SCB',
  'CBI'
];

const PRESET_PLATFORMS = [
  'MT4',
  'MT5',
  'cTrader',
  'TradingView',
  'Mobile App',
  'WebTrader'
];

const PRESET_PAYMENTS = [
  'UPI',
  'IMPS',
  'NetBanking',
  'Google Pay',
  'PhonePe',
  'Cards',
  'Crypto',
  'Skrill'
];

const PRESET_LEVERAGES = [
  '1:500',
  '1:1000',
  '1:2000',
  '1:3000',
  '1:Unlimited'
];

const PRESET_THEMES = [
  { id: 'emerald', label: 'Emerald' },
  { id: 'coral', label: 'Coral' },
  { id: 'blue', label: 'Sky Blue' },
  { id: 'amber', label: 'Amber Gold' },
  { id: 'purple', label: 'Purple' }
];

export const JoinBroker = ({ theme = 'dark' }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();
  const { brokers, createBroker, isCreating, createError } = useBrokers();
  const { user, isAuthenticated, isInitialChecking, openLogin, openRegister } = useAuth();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Pre-populate user credentials when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        contactEmail: prev.contactEmail || user.email || '',
        representativeName: prev.representativeName || user.name || user.username || '',
      }));
    }
  }, [isAuthenticated, user]);

  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdBrokerInfo, setCreatedBrokerInfo] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    highlightBadge: 'Fast UPI Payouts • Low Spread',
    badgeTheme: 'emerald',
    brandColor: '#fc5d21',
    websiteUrl: '',
    affiliateUrl: '',
    logoUrl: '',
    yearFounded: new Date().getFullYear(),
    headquarters: 'Limassol, Cyprus',
    minDepositINR: 1000,
    minDepositUSD: 12,
    spreadNum: 0.1,
    maxLeverage: '1:1000',
    executionType: 'STP / ECN Direct Liquidity',
    accountTypes: 'Standard, Raw Spread, Pro',
    regulatorsList: ['FCA', 'CySEC'],
    platformsList: ['MT4', 'MT5'],
    paymentsList: ['UPI', 'NetBanking', 'Crypto'],
    categories: ['top-rated', 'upi-accepted', 'raw-spread', 'high-leverage'],
    features: [
      'Instant Local UPI & NetBanking Payouts',
      'Ultra-tight spreads from 0.0 pips',
      'Tier-1 Global Regulatory Compliance',
      '24/7 Dedicated Support Desk'
    ],
    contactEmail: '',
    representativeName: '',
    description: '',
    agreedToTerms: false,
  });

  const [customFeature, setCustomFeature] = useState('');
  const [customRegulator, setCustomRegulator] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Dynamic next rank calculation
  const nextRankNum = (brokers?.length || 12) + 1;

  // Handle generic input change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Toggle items in arrays
  const toggleArrayItem = (field, item) => {
    setFormData((prev) => {
      const list = prev[field] || [];
      const exists = list.includes(item);
      const updated = exists ? list.filter((x) => x !== item) : [...list, item];
      return { ...prev, [field]: updated };
    });
  };

  // Add custom feature
  const handleAddFeature = () => {
    if (!customFeature.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, customFeature.trim()],
    }));
    setCustomFeature('');
  };

  // Remove feature
  const handleRemoveFeature = (idx) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  // Add custom regulator
  const handleAddRegulator = () => {
    if (!customRegulator.trim()) return;
    const tag = customRegulator.trim().toUpperCase();
    if (!formData.regulatorsList.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        regulatorsList: [...prev.regulatorsList, tag],
      }));
    }
    setCustomRegulator('');
  };

  // Validate current step
  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.name.trim()) {
        errors.name = 'Broker name is required';
      } else if (formData.name.trim().length < 2) {
        errors.name = 'Broker name must be at least 2 characters';
      }
      if (formData.websiteUrl && !formData.websiteUrl.startsWith('http')) {
        errors.websiteUrl = 'Please enter a valid URL starting with http:// or https://';
      }
    } else if (step === 2) {
      if (formData.minDepositINR < 0) {
        errors.minDepositINR = 'Deposit must be 0 or positive';
      }
      if (formData.spreadNum < 0) {
        errors.spreadNum = 'Spread must be 0 or positive';
      }
    } else if (step === 3) {
      if (formData.regulatorsList.length === 0) {
        errors.regulatorsList = 'Please select at least 1 regulator';
      }
      if (formData.platformsList.length === 0) {
        errors.platformsList = 'Please select at least 1 trading platform';
      }
    } else if (step === 4) {
      if (!formData.contactEmail.trim()) {
        errors.contactEmail = 'Official contact email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail.trim())) {
        errors.contactEmail = 'Please provide a valid official email address';
      }
      if (!formData.agreedToTerms) {
        errors.agreedToTerms = 'You must accept the broker listing policy';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Authentication Required', 'Please log in to register a broker on TradeSafe Brokers.');
      openLogin();
      return;
    }
    if (!validateStep(4)) return;

    try {
      const payload = {
        name: formData.name.trim(),
        highlightBadge: formData.highlightBadge.trim(),
        badgeTheme: formData.badgeTheme,
        brandColor: formData.brandColor,
        websiteUrl: formData.websiteUrl.trim(),
        affiliateUrl: formData.affiliateUrl.trim() || formData.websiteUrl.trim(),
        logoUrl: formData.logoUrl.trim(),
        yearFounded: Number(formData.yearFounded) || new Date().getFullYear(),
        headquarters: formData.headquarters.trim(),
        minDepositINR: Number(formData.minDepositINR) || 0,
        minDepositUSD: Number(formData.minDepositUSD) || 0,
        spreadNum: Number(formData.spreadNum) || 0.0,
        maxLeverage: formData.maxLeverage,
        executionType: formData.executionType,
        accountTypes: formData.accountTypes,
        regulation: formData.regulatorsList.join(', '),
        regulatorsList: formData.regulatorsList,
        platforms: formData.platformsList.join(', '),
        platformsList: formData.platformsList,
        payments: formData.paymentsList.join(', '),
        paymentsList: formData.paymentsList,
        categories: formData.categories,
        features: formData.features,
        contactEmail: formData.contactEmail.trim(),
        representativeName: formData.representativeName.trim(),
        description: formData.description.trim(),
      };

      const result = await createBroker(payload);
      const isPendingStatus =
        result?.status === 'pending' ||
        (user?.role !== 'admin' && result?.status !== 'approved');

      setCreatedBrokerInfo(
        result || {
          name: formData.name,
          rank: `#${nextRankNum}`,
          status: isPendingStatus ? 'pending' : 'approved',
          contactEmail: formData.contactEmail,
          regulatorsList: formData.regulatorsList,
        }
      );
      setShowSuccessModal(true);

      if (isPendingStatus) {
        toast.info(
          'Application Submitted for Review',
          `"${formData.name}" has been queued. It will appear publicly once approved by an administrator.`
        );
      } else {
        toast.success(
          'Broker Approved & Live!',
          `"${formData.name}" is now officially registered and live in the TradeSafe Brokers directory.`
        );
      }
    } catch (err) {
      console.error('Failed to create broker:', err);
      toast.error('Submission Failed', err?.message || 'Unable to register broker right now.');
    }
  };

  // Synthetic preview broker object
  const previewBroker = {
    name: formData.name.trim() || 'Your Broker Name',
    rank: `#${nextRankNum}`,
    rankNum: nextRankNum,
    highlightBadge: formData.highlightBadge || 'Verified Broker Partner',
    badgeTheme: formData.badgeTheme || 'emerald',
    brandColor: formData.brandColor || '#fc5d21',
    logoUrl: formData.logoUrl,
    rating: 4.8,
    reviewsCount: 'New Verified Partner',
    minDeposit: `₹${Number(formData.minDepositINR || 0).toLocaleString('en-IN')} ($${formData.minDepositUSD || Math.round(formData.minDepositINR / 85) || 0})`,
    spread: `From ${formData.spreadNum || 0.0} pips`,
    maxLeverage: formData.maxLeverage || '1:1000',
    payments: formData.paymentsList.join(', ') || 'UPI, NetBanking',
    affiliateUrl: formData.affiliateUrl || '#',
    features: formData.features || [],
  };

  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // If user is not authenticated and initial checking has completed, show the protected gatekeeper
  if (!isAuthenticated && !isInitialChecking) {
    return (
      <div className="join-broker-root" data-theme={theme}>
        <main className="join-broker-page">
          <div className="join-broker-container">
            <nav className="join-breadcrumb-nav" aria-label="Breadcrumbs">
              <Link to="/" className="join-breadcrumb-link">{t('breadcrumb_home', 'Home')}</Link>
              <span className="join-breadcrumb-sep">/</span>
              <Link to="/brokers" className="join-breadcrumb-link">{t('nav_brokers', 'Brokers')}</Link>
              <span className="join-breadcrumb-sep">/</span>
              <span className="join-breadcrumb-current">{t('nav_join_broker', 'Join as Broker')}</span>
            </nav>

            <motion.div
              className="broker-auth-gatekeeper-seamless"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="gatekeeper-icon-wrap">
                <Lock size={26} strokeWidth={2} className="gatekeeper-clean-lock" />
              </div>

              <div className="gatekeeper-tag-wrap">
                <div className="gatekeeper-tag">
                  <span className="gatekeeper-status-dot" />
                  <span>{t('join_badge', 'INSTITUTIONAL PARTNER ACCESS')}</span>
                </div>
              </div>

              <h1 className="gatekeeper-title">
                {t('join_title', 'Partner Authentication Required')}
              </h1>

              <p className="gatekeeper-desc">
                {t('join_desc', 'To protect traders and maintain regulatory authenticity, broker registration and profile management is restricted to authorized corporate representatives.')}
              </p>

              <div className="gatekeeper-actions">
                <button
                  type="button"
                  className="gatekeeper-primary-btn"
                  onClick={openLogin}
                >
                  <KeyRound size={15} strokeWidth={2.2} />
                  <span>{t('join_login_btn', 'Log In to Partner Account')}</span>
                </button>

                <button
                  type="button"
                  className="gatekeeper-secondary-btn"
                  onClick={openRegister}
                >
                  <span>{t('join_register_btn', 'Register Corporate Account')}</span>
                </button>
              </div>

              <div className="gatekeeper-features-section">
                <div className="gatekeeper-features-label">
                  <span>Institutional Directory Standards</span>
                </div>

                <div className="gatekeeper-features-grid">
                  <div className="gatekeeper-feature-item">
                    <ShieldCheck size={18} strokeWidth={2} className="feature-clean-icon" />
                    <div className="feature-text-wrap">
                      <h4 className="feature-item-title">Verified Legal Entity</h4>
                      <p className="feature-item-desc">All listings are vetted against global regulatory records (FCA, CySEC, ASIC, FSA).</p>
                    </div>
                  </div>

                  <div className="gatekeeper-feature-item">
                    <Zap size={18} strokeWidth={2} className="feature-clean-icon" />
                    <div className="feature-text-wrap">
                      <h4 className="feature-item-title">Priority Listing Audit</h4>
                      <p className="feature-item-desc">Authenticated partners get their submissions indexed within 24 hours.</p>
                    </div>
                  </div>

                  <div className="gatekeeper-feature-item">
                    <Building2 size={18} strokeWidth={2} className="feature-clean-icon" />
                    <div className="feature-text-wrap">
                      <h4 className="feature-item-title">Listing Ownership</h4>
                      <p className="feature-item-desc">Direct control to manage verified deposit tiers, local UPI support proofs, and spread metrics.</p>
                    </div>
                  </div>

                  <div className="gatekeeper-feature-item">
                    <Sparkles size={18} strokeWidth={2} className="feature-clean-icon" />
                    <div className="feature-text-wrap">
                      <h4 className="feature-item-title">TradeSafe Trust Seal</h4>
                      <p className="feature-item-desc">Receive the Verified Partner badge to maximize trader trust and conversions.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="gatekeeper-footer-back">
                <Link to="/brokers" className="gatekeeper-back-link">
                  <ArrowLeft size={14} />
                  <span>Back to Brokers Directory</span>
                </Link>
                <span className="gatekeeper-security-badge">
                  <Lock size={12} strokeWidth={2} />
                  <span>TradeSafe Compliance Framework</span>
                </span>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="join-broker-root" data-theme={theme}>
      <main className="join-broker-page">
        <div className="join-broker-ambient-glow" />
        <div className="join-broker-container">
          {/* Header & Hero Intro */}
          <header className="join-broker-header">
            <nav className="join-breadcrumb-nav" aria-label="Breadcrumbs">
              <Link to="/" className="join-breadcrumb-link">{t('breadcrumb_home', 'Home')}</Link>
              <span className="join-breadcrumb-sep">/</span>
              <Link to="/brokers" className="join-breadcrumb-link">{t('nav_brokers', 'Brokers')}</Link>
              <span className="join-breadcrumb-sep">/</span>
              <span className="join-breadcrumb-current">{t('nav_join_broker', 'Join as Broker')}</span>
            </nav>

          {/* Authenticated Partner Status Banner */}
          <div className="join-auth-status-bar">
            <div className="status-bar-left">
              <span className="status-pulse-dot" />
              <span>
                Logged in as <strong>{user?.name || user?.username || user?.email}</strong>
              </span>
              <span className="status-role-badge">Authorized Representative</span>
            </div>
            <div className="status-bar-right">
              <span className="status-secure-note">
                <ShieldCheck size={13} />
                <span>Protected Listing Channel</span>
              </span>
            </div>
          </div>

          <div className="join-hero-badge">
            <Sparkles size={14} />
            <span>Broker Partnership &amp; Directory Listing</span>
          </div>

          <h1 className="join-hero-title">
            List Your Brokerage on TradeSafe Brokers
          </h1>

          <p className="join-hero-subtitle">
            Get discovered by 50,000+ active forex and CFD traders. Receive transparent, verified reviews, showcase your lowest spreads and instant UPI capabilities, and scale your client base.
          </p>

          <div className="join-trust-chips">
            <span className="join-trust-chip">
              <ShieldCheck size={14} />
              <span>Independent &amp; Transparent Scoring</span>
            </span>
            <span className="join-trust-chip">
              <Zap size={14} />
              <span>Instant Directory Indexing</span>
            </span>
            <span className="join-trust-chip">
              <Globe size={14} />
              <span>India #1 Forex Comparison Portal</span>
            </span>
          </div>
        </header>

        {/* Main Grid: Form + Live Interactive Preview */}
        <div className="join-broker-grid">
          {/* Left Column: Multi-Step Minimal Form */}
          <div className="join-form-wrapper">
            {/* Step Pills Bar */}
            <div className="join-step-pills-bar" role="tablist" aria-label="Broker registration steps">
              {[
                { step: 1, label: 'Identity & Brand' },
                { step: 2, label: 'Trading Terms' },
                { step: 3, label: 'Licenses & Tech' },
                { step: 4, label: 'Contact & Submit' },
              ].map(({ step, label }) => {
                const isActive = currentStep === step;
                const isDone = currentStep > step;
                return (
                  <button
                    key={step}
                    type="button"
                    className={`join-step-pill-btn ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}`}
                    onClick={() => {
                      if (isDone || validateStep(currentStep)) {
                        setCurrentStep(step);
                      }
                    }}
                    role="tab"
                    aria-selected={isActive}
                  >
                    <span className="join-step-num">
                      {isDone ? <Check size={14} /> : step}
                    </span>
                    <span className="join-step-label">{label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* ═══════════════════════════════════════════
                  STEP 1: Identity & Branding
                 ═══════════════════════════════════════════ */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.22 }}
                  className="join-step-content"
                >
                  <div className="join-step-heading">
                    <h3>Broker Identity &amp; Branding</h3>
                    <p>Enter your firm's brand name, color accents, and key tagline.</p>
                  </div>

                  <div className="join-form-fields-grid">
                    {/* Broker Name */}
                    <div className={`join-field ${formErrors.name ? 'has-error' : ''}`}>
                      <div className="join-label-row">
                        <label className="join-field-label" htmlFor="broker-name">
                          Broker Firm Name <span className="req">*</span>
                        </label>
                        <span className="join-field-hint">e.g. ApexFX Global</span>
                      </div>
                      <input
                        type="text"
                        id="broker-name"
                        className="join-input"
                        placeholder="e.g. ApexFX, Vantage Prime, CapitalWise"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                        autoFocus
                      />
                      {formErrors.name && (
                        <div className="join-field-error">
                          <AlertCircle size={13} style={{ display: 'inline', marginRight: 4 }} />
                          {formErrors.name}
                        </div>
                      )}
                    </div>

                    {/* Highlight Badge */}
                    <div className="join-field">
                      <div className="join-label-row">
                        <label className="join-field-label" htmlFor="highlight-badge">
                          Highlight Headline Tag
                        </label>
                        <span className="join-field-hint">Visible on card pill</span>
                      </div>
                      <input
                        type="text"
                        id="highlight-badge"
                        className="join-input"
                        placeholder="e.g. Fast UPI Payouts • Low Spread"
                        value={formData.highlightBadge}
                        onChange={(e) => handleChange('highlightBadge', e.target.value)}
                      />
                    </div>

                    {/* Badge Theme & Brand Color */}
                    <div className="join-field-row-2col">
                      <div className="join-field">
                        <div className="join-label-row">
                          <label className="join-field-label" htmlFor="badge-theme">
                            Badge Accent Color
                          </label>
                        </div>
                        <select
                          id="badge-theme"
                          className="join-select"
                          value={formData.badgeTheme}
                          onChange={(e) => handleChange('badgeTheme', e.target.value)}
                        >
                          {PRESET_THEMES.map((themeOption) => (
                            <option key={themeOption.id} value={themeOption.id}>
                              {themeOption.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="join-field">
                        <div className="join-label-row">
                          <label className="join-field-label">Brand Color Accent</label>
                        </div>
                        <div className="join-color-palette">
                          {PRESET_COLORS.map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              className={`join-color-swatch-btn ${formData.brandColor === hex ? 'is-selected' : ''}`}
                              style={{ backgroundColor: hex }}
                              onClick={() => handleChange('brandColor', hex)}
                              aria-label={`Select color ${hex}`}
                            >
                              {formData.brandColor === hex && <Check size={14} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Logo Image URL */}
                    <div className="join-field">
                      <div className="join-label-row">
                        <label className="join-field-label" htmlFor="logo-url">
                          Logo Image URL (Optional)
                        </label>
                        <span className="join-field-hint">SVG or PNG image URL</span>
                      </div>
                      <input
                        type="url"
                        id="logo-url"
                        className="join-input"
                        placeholder="https://yourbroker.com/logo.png"
                        value={formData.logoUrl}
                        onChange={(e) => handleChange('logoUrl', e.target.value)}
                      />
                    </div>

                    {/* Website & Affiliate URL */}
                    <div className="join-field-row-2col">
                      <div className={`join-field ${formErrors.websiteUrl ? 'has-error' : ''}`}>
                        <div className="join-label-row">
                          <label className="join-field-label" htmlFor="website-url">
                            Official Website URL
                          </label>
                        </div>
                        <input
                          type="url"
                          id="website-url"
                          className="join-input"
                          placeholder="https://www.yourbroker.com"
                          value={formData.websiteUrl}
                          onChange={(e) => handleChange('websiteUrl', e.target.value)}
                        />
                        {formErrors.websiteUrl && (
                          <div className="join-field-error">{formErrors.websiteUrl}</div>
                        )}
                      </div>

                      <div className="join-field">
                        <div className="join-label-row">
                          <label className="join-field-label" htmlFor="affiliate-url">
                            Trader Account Registration Link
                          </label>
                        </div>
                        <input
                          type="url"
                          id="affiliate-url"
                          className="join-input"
                          placeholder="https://yourbroker.com/open-account"
                          value={formData.affiliateUrl}
                          onChange={(e) => handleChange('affiliateUrl', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Year Founded & Headquarters */}
                    <div className="join-field-row-2col">
                      <div className="join-field">
                        <div className="join-label-row">
                          <label className="join-field-label" htmlFor="year-founded">
                            Year Founded
                          </label>
                        </div>
                        <input
                          type="number"
                          id="year-founded"
                          className="join-input"
                          min="1980"
                          max={new Date().getFullYear()}
                          value={formData.yearFounded}
                          onChange={(e) => handleChange('yearFounded', e.target.value)}
                        />
                      </div>

                      <div className="join-field">
                        <div className="join-label-row">
                          <label className="join-field-label" htmlFor="headquarters">
                            Headquarters
                          </label>
                        </div>
                        <input
                          type="text"
                          id="headquarters"
                          className="join-input"
                          placeholder="e.g. Sydney, Australia / Limassol, Cyprus"
                          value={formData.headquarters}
                          onChange={(e) => handleChange('headquarters', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════
                  STEP 2: Trading Terms & Accounts
                 ═══════════════════════════════════════════ */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.22 }}
                  className="join-step-content"
                >
                  <div className="join-step-heading">
                    <h3>Trading Terms &amp; Conditions</h3>
                    <p>Provide specifications that matter most to traders looking for low costs.</p>
                  </div>

                  <div className="join-form-fields-grid">
                    {/* Deposits: INR & USD */}
                    <div className="join-field-row-2col">
                      <div className="join-field">
                        <div className="join-label-row">
                          <label className="join-field-label" htmlFor="min-deposit-inr">
                            Minimum Deposit (INR ₹)
                          </label>
                          <span className="join-field-hint">Indian Rupee</span>
                        </div>
                        <input
                          type="number"
                          id="min-deposit-inr"
                          className="join-input"
                          min="0"
                          placeholder="1000"
                          value={formData.minDepositINR}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleChange('minDepositINR', val);
                            if (val) {
                              handleChange('minDepositUSD', Math.round(Number(val) / 85));
                            }
                          }}
                        />
                      </div>

                      <div className="join-field">
                        <div className="join-label-row">
                          <label className="join-field-label" htmlFor="min-deposit-usd">
                            Minimum Deposit (USD $)
                          </label>
                          <span className="join-field-hint">Equivalent</span>
                        </div>
                        <input
                          type="number"
                          id="min-deposit-usd"
                          className="join-input"
                          min="0"
                          placeholder="12"
                          value={formData.minDepositUSD}
                          onChange={(e) => handleChange('minDepositUSD', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Spread & Leverage */}
                    <div className="join-field-row-2col">
                      <div className="join-field">
                        <div className="join-label-row">
                          <label className="join-field-label" htmlFor="spread-num">
                            Starting EUR/USD Spread (pips)
                          </label>
                          <span className="join-field-hint">e.g. 0.0 or 0.2</span>
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          id="spread-num"
                          className="join-input"
                          min="0"
                          placeholder="0.1"
                          value={formData.spreadNum}
                          onChange={(e) => handleChange('spreadNum', e.target.value)}
                        />
                      </div>

                      <div className="join-field">
                        <div className="join-label-row">
                          <label className="join-field-label" htmlFor="max-leverage">
                            Max Leverage
                          </label>
                        </div>
                        <div className="join-chips-selector">
                          {PRESET_LEVERAGES.map((lev) => (
                            <button
                              key={lev}
                              type="button"
                              className={`join-chip-btn ${formData.maxLeverage === lev ? 'is-checked' : ''}`}
                              onClick={() => handleChange('maxLeverage', lev)}
                            >
                              {lev}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Execution Model & Account Types */}
                    <div className="join-field-row-2col">
                      <div className="join-field">
                        <div className="join-label-row">
                          <label className="join-field-label" htmlFor="execution-type">
                            Order Execution Model
                          </label>
                        </div>
                        <select
                          id="execution-type"
                          className="join-select"
                          value={formData.executionType}
                          onChange={(e) => handleChange('executionType', e.target.value)}
                        >
                          <option value="STP / ECN Direct Liquidity">STP / ECN Direct Liquidity</option>
                          <option value="True ECN / DMA">True ECN / DMA</option>
                          <option value="Instant Market Execution">Instant Market Execution</option>
                          <option value="No Dealing Desk (NDD)">No Dealing Desk (NDD)</option>
                          <option value="Market Maker / Fixed Spreads">Market Maker / Fixed Spreads</option>
                        </select>
                      </div>

                      <div className="join-field">
                        <div className="join-label-row">
                          <label className="join-field-label" htmlFor="account-types">
                            Account Types Offered
                          </label>
                          <span className="join-field-hint">Comma separated</span>
                        </div>
                        <input
                          type="text"
                          id="account-types"
                          className="join-input"
                          placeholder="e.g. Standard, Raw Spread, Pro, Cent"
                          value={formData.accountTypes}
                          onChange={(e) => handleChange('accountTypes', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════
                  STEP 3: Licenses, Platforms & Payments
                 ═══════════════════════════════════════════ */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.22 }}
                  className="join-step-content"
                >
                  <div className="join-step-heading">
                    <h3>Licenses, Platforms &amp; Banking</h3>
                    <p>Select your regulatory oversight and supported trading technology.</p>
                  </div>

                  <div className="join-form-fields-grid">
                    {/* Regulators Selection */}
                    <div className="join-field">
                      <div className="join-label-row">
                        <label className="join-field-label">
                          Regulatory Licenses &amp; Oversight <span className="req">*</span>
                        </label>
                        <span className="join-field-hint">Click chips to toggle</span>
                      </div>
                      <div className="join-chips-selector">
                        {PRESET_REGULATORS.map((reg) => {
                          const isChecked = formData.regulatorsList.includes(reg);
                          return (
                            <button
                              key={reg}
                              type="button"
                              className={`join-chip-btn ${isChecked ? 'is-checked' : ''}`}
                              onClick={() => toggleArrayItem('regulatorsList', reg)}
                            >
                              {isChecked && <Check size={12} />}
                              <span>{reg}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Regulator adder */}
                      <div className="join-item-adder-row" style={{ marginTop: 8 }}>
                        <input
                          type="text"
                          className="join-input"
                          placeholder="Add custom regulator (e.g. MAS, FINMA)"
                          value={customRegulator}
                          onChange={(e) => setCustomRegulator(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddRegulator();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="join-item-adder-btn"
                          onClick={handleAddRegulator}
                        >
                          <Plus size={14} />
                          <span>Add</span>
                        </button>
                      </div>
                      {formErrors.regulatorsList && (
                        <div className="join-field-error">{formErrors.regulatorsList}</div>
                      )}
                    </div>

                    {/* Platforms */}
                    <div className="join-field">
                      <div className="join-label-row">
                        <label className="join-field-label">
                          Supported Trading Platforms <span className="req">*</span>
                        </label>
                      </div>
                      <div className="join-chips-selector">
                        {PRESET_PLATFORMS.map((plat) => {
                          const isChecked = formData.platformsList.includes(plat);
                          return (
                            <button
                              key={plat}
                              type="button"
                              className={`join-chip-btn ${isChecked ? 'is-checked' : ''}`}
                              onClick={() => toggleArrayItem('platformsList', plat)}
                            >
                              {isChecked && <Check size={12} />}
                              <span>{plat}</span>
                            </button>
                          );
                        })}
                      </div>
                      {formErrors.platformsList && (
                        <div className="join-field-error">{formErrors.platformsList}</div>
                      )}
                    </div>

                    {/* Payment Methods */}
                    <div className="join-field">
                      <div className="join-label-row">
                        <label className="join-field-label">
                          Deposit &amp; Withdrawal Methods
                        </label>
                        <span className="join-field-hint">Indian traders prioritize UPI/NetBanking</span>
                      </div>
                      <div className="join-chips-selector">
                        {PRESET_PAYMENTS.map((pmt) => {
                          const isChecked = formData.paymentsList.includes(pmt);
                          return (
                            <button
                              key={pmt}
                              type="button"
                              className={`join-chip-btn ${isChecked ? 'is-checked' : ''}`}
                              onClick={() => toggleArrayItem('paymentsList', pmt)}
                            >
                              {isChecked && <Check size={12} />}
                              <span>{pmt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════
                  STEP 4: Contact & Partner Verification
                 ═══════════════════════════════════════════ */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.22 }}
                  className="join-step-content"
                >
                  <div className="join-step-heading">
                    <h3>Contact &amp; Key Highlights</h3>
                    <p>Submit representative verification info and key features to finalize listing.</p>
                  </div>

                  <div className="join-form-fields-grid">
                    {/* Official Contact Email & Rep Name */}
                    <div className="join-field-row-2col">
                      <div className={`join-field ${formErrors.contactEmail ? 'has-error' : ''}`}>
                        <div className="join-label-row">
                          <label className="join-field-label" htmlFor="contact-email">
                            Official Partner / Support Email <span className="req">*</span>
                          </label>
                        </div>
                        <input
                          type="email"
                          id="contact-email"
                          className="join-input"
                          placeholder="partnerships@yourbroker.com"
                          value={formData.contactEmail}
                          onChange={(e) => handleChange('contactEmail', e.target.value)}
                          required
                        />
                        {formErrors.contactEmail && (
                          <div className="join-field-error">{formErrors.contactEmail}</div>
                        )}
                      </div>

                      <div className="join-field">
                        <div className="join-label-row">
                          <label className="join-field-label" htmlFor="rep-name">
                            Representative Name &amp; Title
                          </label>
                        </div>
                        <input
                          type="text"
                          id="rep-name"
                          className="join-input"
                          placeholder="e.g. Sarah Jenkins (Head of Growth)"
                          value={formData.representativeName}
                          onChange={(e) => handleChange('representativeName', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Key Features Bullet List */}
                    <div className="join-field">
                      <div className="join-label-row">
                        <label className="join-field-label">Key Highlights / Features</label>
                        <span className="join-field-hint">Bullet points for review card</span>
                      </div>
                      <div className="join-items-list">
                        {formData.features.map((feat, idx) => (
                          <div key={idx} className="join-item-row">
                            <span>• {feat}</span>
                            <button
                              type="button"
                              className="join-item-remove-btn"
                              onClick={() => handleRemoveFeature(idx)}
                              aria-label="Remove feature"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="join-item-adder-row">
                        <input
                          type="text"
                          className="join-input"
                          placeholder="Add new feature highlight (e.g. Free VPS, Hindi Support)"
                          value={customFeature}
                          onChange={(e) => setCustomFeature(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddFeature();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="join-item-adder-btn"
                          onClick={handleAddFeature}
                        >
                          <Plus size={14} />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="join-field">
                      <div className="join-label-row">
                        <label className="join-field-label" htmlFor="broker-desc">
                          Brief Broker Description (Optional)
                        </label>
                      </div>
                      <textarea
                        id="broker-desc"
                        className="join-textarea"
                        placeholder="Provide an overview of your brokerage, security guarantees, and execution speeds..."
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                      />
                    </div>

                    {/* Terms Checkbox */}
                    <div className="join-field" style={{ marginTop: 10 }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.agreedToTerms}
                          onChange={(e) => handleChange('agreedToTerms', e.target.checked)}
                          style={{ marginTop: 3, accentColor: 'var(--brand-green, #fc5d21)' }}
                        />
                        <span style={{ fontSize: '0.86rem', color: 'var(--text-body, #cbd5e1)', lineHeight: 1.45 }}>
                          I confirm that I represent this brokerage firm and that all regulatory licenses, spread averages, and terms submitted are true and verifiable.
                        </span>
                      </label>
                      {formErrors.agreedToTerms && (
                        <div className="join-field-error" style={{ marginLeft: 24 }}>
                          {formErrors.agreedToTerms}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Form Navigation / Action Buttons */}
              <div className="join-actions-bar">
                <button
                  type="button"
                  className="join-prev-btn"
                  onClick={handlePrev}
                  disabled={currentStep === 1 || isCreating}
                >
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    className="join-next-btn"
                    onClick={handleNext}
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="join-submit-btn"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <span className="join-spinner" />
                        <span>Submitting Broker Profile...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        <span>Create &amp; List Broker Profile</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Real-Time Interactive Live Preview */}
          <aside className="join-preview-column" aria-label="Live broker card preview">
            <div className="join-preview-header">
              <span className="join-preview-tag">
                <span className="join-preview-dot" />
                <span>Live Card Preview</span>
              </span>
              <span className="join-preview-tip">Updates in real time</span>
            </div>

            {/* Preview Card matching TradeSafe Brokers styling */}
            <div
              className="join-preview-card"
              style={{
                '--preview-accent': previewBroker.brandColor,
              }}
            >
              {/* Card Top: Rank & Logo */}
              <div className="preview-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="preview-rank-tag">{previewBroker.rank}</span>
                  <BrokerLogo broker={previewBroker} />
                </div>
                <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Zap size={12} />
                  <span>Verified</span>
                </div>
              </div>

              {/* Rating */}
              <div className="preview-rating-row">
                <span className="preview-stars">★★★★★</span>
                <span className="preview-rating-val">{previewBroker.rating}</span>
                <span className="preview-reviews-count">({previewBroker.reviewsCount})</span>
              </div>

              {/* Badge Pill */}
              <div style={{ marginBottom: 12 }}>
                <span className={`preview-badge-pill pill-theme-${previewBroker.badgeTheme}`}>
                  {previewBroker.highlightBadge}
                </span>
              </div>

              {/* Specs Table */}
              <div className="preview-specs-table">
                <div className="preview-spec-row">
                  <span className="preview-spec-label">Min. Deposit:</span>
                  <span className="preview-spec-value is-deposit">{previewBroker.minDeposit}</span>
                </div>
                <div className="preview-spec-row">
                  <span className="preview-spec-label">Spread:</span>
                  <span className="preview-spec-value is-spread">{previewBroker.spread}</span>
                </div>
                <div className="preview-spec-row">
                  <span className="preview-spec-label">Max Leverage:</span>
                  <span className="preview-spec-value">{previewBroker.maxLeverage}</span>
                </div>
                <div className="preview-spec-row">
                  <span className="preview-spec-label">Licenses:</span>
                  <span className="preview-spec-value" style={{ fontSize: '0.8rem' }}>
                    {formData.regulatorsList.slice(0, 3).join(', ') || 'FCA, CySEC'}
                  </span>
                </div>
              </div>

              {/* Features List */}
              {previewBroker.features && previewBroker.features.length > 0 && (
                <div className="preview-features-preview">
                  <div className="preview-features-title">Highlights:</div>
                  <div className="preview-features-list">
                    {previewBroker.features.slice(0, 3).map((f, i) => (
                      <div key={i} className="preview-feature-item">
                        <Check size={12} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons Preview */}
              <div className="preview-actions-bar">
                <button type="button" className="preview-cta-btn">
                  <span>Open Account</span>
                  <ExternalLink size={12} />
                </button>
                <button type="button" className="preview-secondary-btn">
                  <span>Specs</span>
                </button>
              </div>
            </div>

            {/* Trust Perks */}
            <div className="join-preview-perks">
              <h5>Why Brokerages Choose TradeSafe Brokers:</h5>
              <ul>
                <li>
                  <Check size={13} />
                  <span>Direct qualified trader sign-ups (Zero intermediaries)</span>
                </li>
                <li>
                  <Check size={13} />
                  <span>Real-time spread &amp; UPI withdrawal speed verification</span>
                </li>
                <li>
                  <Check size={13} />
                  <span>Tier-1 credibility and authentic trader reviews</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>

      {/* ════════════════════════════════════════════════════════════
          Success Celebration Modal
         ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showSuccessModal && (() => {
          const isPending =
            createdBrokerInfo?.status === 'pending' ||
            (user?.role !== 'admin' && createdBrokerInfo?.status !== 'approved');

          return (
            <div className="join-success-backdrop" role="dialog" aria-modal="true">
              <motion.div
                className="join-success-card"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              >
                <div
                  className="join-success-icon-wrap"
                  style={{
                    background: isPending ? 'rgba(245, 158, 11, 0.14)' : 'rgba(16, 185, 129, 0.14)',
                    color: isPending ? '#f59e0b' : '#10b981',
                  }}
                >
                  {isPending ? <Clock size={36} /> : <Sparkles size={36} />}
                </div>

                <h2 className="join-success-title">
                  {isPending ? 'Application Awaiting Admin Approval' : 'Broker Profile Created!'}
                </h2>

                <p className="join-success-desc">
                  {isPending ? (
                    <>
                      Application for <strong>{createdBrokerInfo?.name || formData.name}</strong> has been received and queued for review. Until an administrator reviews and approves this submission, it <strong>will NOT appear on the public directory</strong>.
                    </>
                  ) : (
                    <>
                      Congratulations! <strong>{createdBrokerInfo?.name || formData.name}</strong> has been verified and published live on TradeSafe Brokers as rank <strong>{createdBrokerInfo?.rank || `#${nextRankNum}`}</strong>.
                    </>
                  )}
                </p>

                <div
                  className="join-success-broker-chip"
                  style={{
                    background: isPending ? 'rgba(245, 158, 11, 0.08)' : undefined,
                    border: isPending ? '1px solid rgba(245, 158, 11, 0.25)' : undefined,
                  }}
                >
                  <BrokerLogo broker={createdBrokerInfo || previewBroker} />
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: isPending ? '#d97706' : '#10b981',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    {isPending ? (
                      <>
                        <Clock size={13} /> Pending Admin Approval
                      </>
                    ) : (
                      <>
                        <Check size={13} /> Active &amp; Verified
                      </>
                    )}
                  </span>
                </div>

                {isPending && (
                  <div
                    style={{
                      background: 'rgba(245, 158, 11, 0.06)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: '14px',
                      padding: '12px 16px',
                      marginBottom: '22px',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                      lineHeight: 1.5,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#d97706',
                        fontWeight: 700,
                        marginBottom: '4px',
                      }}
                    >
                      <ShieldAlert size={14} />
                      <span>Admin Moderation Notice</span>
                    </div>
                    <span style={{ color: 'var(--text-body)' }}>
                      Administrators can audit, approve, or reject this broker directly inside the{' '}
                      <strong>Admin Dashboard → Pending Approvals</strong> queue. Once approved, it will be published live with full rankings and spreads.
                    </span>
                  </div>
                )}

                <div className="join-success-actions">
                  {user?.role === 'admin' ? (
                    <Link
                      to="/admin"
                      className="join-success-view-btn"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        boxShadow: '0 4px 18px rgba(245, 158, 11, 0.35)',
                      }}
                      onClick={() => setShowSuccessModal(false)}
                    >
                      <span>Open Admin Dashboard to Approve</span>
                      <ArrowRight size={16} />
                    </Link>
                  ) : null}

                  <Link
                    to="/brokers"
                    className="join-success-view-btn"
                    onClick={() => setShowSuccessModal(false)}
                  >
                    <span>Browse Live Brokers Directory</span>
                    <ArrowRight size={16} />
                  </Link>

                  <button
                    type="button"
                    className="join-success-reset-btn"
                    onClick={() => {
                      setShowSuccessModal(false);
                      setCurrentStep(1);
                      setFormData({
                        name: '',
                        highlightBadge: 'Fast UPI Payouts • Low Spread',
                        badgeTheme: 'emerald',
                        brandColor: '#fc5d21',
                        websiteUrl: '',
                        affiliateUrl: '',
                        logoUrl: '',
                        yearFounded: new Date().getFullYear(),
                        headquarters: 'Financial District, Global',
                        minDepositINR: 1000,
                        minDepositUSD: 12,
                        spreadNum: 0.1,
                        maxLeverage: '1:1000',
                        executionType: 'STP / ECN Direct Liquidity',
                        accountTypes: 'Standard, Raw Spread, Pro',
                        regulatorsList: ['FCA', 'CySEC'],
                        platformsList: ['MT4', 'MT5'],
                        paymentsList: ['UPI', 'NetBanking', 'Crypto'],
                        categories: ['top-rated', 'upi-accepted', 'raw-spread', 'high-leverage'],
                        features: [
                          'Instant Local UPI & NetBanking Payouts',
                          'Ultra-tight spreads from 0.0 pips',
                          'Tier-1 Global Regulatory Compliance',
                          '24/7 Dedicated Support Desk',
                        ],
                        contactEmail: '',
                        representativeName: '',
                        description: '',
                        agreedToTerms: false,
                      });
                    }}
                  >
                    Add Another Broker
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Seamless Transition to Full-Width Footer in Light/Dark Mode */}
      <div className="join-broker-footer-transition" aria-hidden="true" />
      <Footer onNavigate={(id) => navigate(`/#${id}`)} />
    </div>
  );
};

export default JoinBroker;
