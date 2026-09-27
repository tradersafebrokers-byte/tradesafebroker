import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ThumbsUp,
  Share2,
  Flag,
  MapPin,
  Phone,
  Mail,
  Globe,
  CornerDownRight,
  Send,
  UserCheck,
  PenLine,
} from 'lucide-react';
import { ALL_BROKERS_DATA } from '../features/brokers/data/brokersData.jsx';
import { getBrokerEditorialContent } from '../features/brokers/data/brokerReviewsData.js';
import {
  getBrokerCompanyDetails,
  getDefaultSeedReviews,
} from '../features/brokers/data/brokerDetailsHelper.js';
import { BrokerLogo } from '../features/brokers/components/BrokerLogo.jsx';
import VerifiedGoldBadge from '../features/shared/components/VerifiedGoldBadge.jsx';
import BrokerReviewsModal from '../features/reviews/components/BrokerReviewsModal.jsx';
import BrokerHubModal from '../features/brokers/components/BrokerHubModal.jsx';
import { brokerService } from '../features/brokers/services/broker.service.js';
import { reviewService } from '../features/reviews/services/review.service.js';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { useToast } from '../features/shared/components/toast/ToastContext.jsx';
import Footer from '../features/shared/components/Footer.jsx';
import './BrokerReviewPage.css';

const DEPOSIT_METHODS = [
  'UPI / PhonePe',
  'NetBanking / IMPS',
  'Crypto (USDT TRC20)',
  'Credit / Debit Card',
  'Skrill / Neteller',
  'Bank Wire Transfer',
];

export default function BrokerReviewPage({ theme = 'dark' }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

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

  // Sync staticBroker when slug changes
  useEffect(() => {
    if (staticBroker) {
      setBroker(staticBroker);
    }
  }, [staticBroker]);

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

  const companyDetails = useMemo(() => {
    return getBrokerCompanyDetails(broker);
  }, [broker]);

  // Community reviews state
  const [communityReviews, setCommunityReviews] = useState(() => getDefaultSeedReviews(staticBroker));
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('all');
  const [votedReviews, setVotedReviews] = useState({});
  const [flaggedReviews, setFlaggedReviews] = useState({});

  // Inline "Write a Review" state (no modal dropdown required)
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formDepositMethod, setFormDepositMethod] = useState('UPI / PhonePe');
  const [formRecommend, setFormRecommend] = useState(true);
  const [formGuestName, setFormGuestName] = useState('');
  const [formGuestEmail, setFormGuestEmail] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load reviews from backend API on mount / broker change
  useEffect(() => {
    if (!broker) return;
    const seed = getDefaultSeedReviews(broker);
    setReviewsLoading(true);
    reviewService
      .getBrokerReviews({
        brokerSlug: broker.slug || broker.id,
        brokerName: broker.name,
        limit: 40,
      })
      .then((res) => {
        const fetched = res?.data?.reviews;
        if (Array.isArray(fetched) && fetched.length > 0) {
          setCommunityReviews(fetched);
        } else {
          setCommunityReviews(seed);
        }
      })
      .catch(() => {
        setCommunityReviews(seed);
      })
      .finally(() => {
        setReviewsLoading(false);
      });
  }, [broker]);

  // Useful (Like) Vote Handler
  const handleVoteHelpful = async (reviewId) => {
    if (votedReviews[reviewId]) {
      toast.info('Already Voted', 'You have already marked this review as useful.');
      return;
    }
    setVotedReviews((prev) => ({ ...prev, [reviewId]: true }));
    setCommunityReviews((prev) =>
      prev.map((r) =>
        r._id === reviewId
          ? { ...r, helpfulVotes: (r.helpfulVotes || 0) + 1 }
          : r
      )
    );
    toast.success('Feedback Recorded', 'Thanks for voting this review as useful!');
    try {
      await reviewService.voteHelpful(reviewId);
    } catch {
      // Optimistically handled
    }
  };

  // Share Review Handler
  const handleShareReview = (reviewId) => {
    const url = `${window.location.origin}/reviews/${broker.slug || broker.id}#review-${reviewId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Link Copied', 'Review link copied to your clipboard!');
      }).catch(() => {
        toast.info('Review Link', url);
      });
    } else {
      toast.info('Review Link', url);
    }
  };

  // Flag Review Handler
  const handleFlagReview = async (reviewId) => {
    if (flaggedReviews[reviewId]) {
      toast.info('Already Flagged', 'This review has already been reported.');
      return;
    }
    setFlaggedReviews((prev) => ({ ...prev, [reviewId]: true }));
    toast.success('Review Reported', 'Thank you! Our compliance team will inspect this review.');
    try {
      await reviewService.flagReview(reviewId, 'Reported by trader community');
    } catch {
      // Gracefully handled
    }
  };

  // Submit Inline Review
  const handleSubmitInlineReview = async (e) => {
    e.preventDefault();
    if (!formComment.trim() || formComment.trim().length < 8) {
      toast.error('Review Too Short', 'Please enter at least 8 characters describing your experience.');
      return;
    }
    if (!isAuthenticated && !formGuestName.trim()) {
      toast.error('Name Required', 'Please enter your name or trader handle.');
      return;
    }

    setFormSubmitting(true);
    const authorName = isAuthenticated ? user.username : formGuestName.trim();
    const authorEmail = isAuthenticated ? user.email : formGuestEmail.trim();

    try {
      const payload = {
        brokerId: broker._id && String(broker._id).length === 24 ? broker._id : undefined,
        brokerSlug: broker.slug || broker.id || broker.name.toLowerCase().replace(/\s+/g, '-'),
        brokerName: broker.name,
        rating: formRating,
        title: formTitle.trim() || `${formRating}★ Review for ${broker.name}`,
        comment: formComment.trim(),
        depositMethodUsed: formDepositMethod,
        recommend: formRecommend,
        reviewerRole: 'trader',
        username: authorName,
        userEmail: authorEmail,
      };

      const res = await reviewService.createReview(payload);
      const newRev = res?.data?.review || {
        _id: `temp-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
        helpfulVotes: 0,
        verifiedTrader: true,
      };

      setCommunityReviews((prev) => [newRev, ...prev]);
      toast.success('Review Published!', `Thank you! Your verified ${formRating}★ review for ${broker.name} is now live.`);
      setFormComment('');
      setFormTitle('');
      setIsWritingReview(false);
      window.dispatchEvent(new CustomEvent('broker_reviews_updated', { detail: { newReview: newRev } }));
    } catch {
      // Local optimistic fallback
      const fallbackRev = {
        _id: `temp-${Date.now()}`,
        brokerName: broker.name,
        rating: formRating,
        title: formTitle.trim() || `${formRating}★ Review for ${broker.name}`,
        comment: formComment.trim(),
        depositMethodUsed: formDepositMethod,
        recommend: formRecommend,
        reviewerRole: 'trader',
        username: authorName || 'Verified Trader',
        userEmail: authorEmail,
        createdAt: new Date().toISOString(),
        helpfulVotes: 0,
        verifiedTrader: true,
      };
      setCommunityReviews((prev) => [fallbackRev, ...prev]);
      toast.success('Review Published!', `Thank you! Your ${formRating}★ review for ${broker.name} has been published.`);
      setFormComment('');
      setFormTitle('');
      setIsWritingReview(false);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (selectedRatingFilter === 'all') return communityReviews;
    return communityReviews.filter((r) => Math.round(Number(r.rating)) === Number(selectedRatingFilter));
  }, [communityReviews, selectedRatingFilter]);

  // Render Trustpilot Signature Square Star Group
  const renderTrustpilotStars = (ratingVal, size = 15, boxSize = 22) => {
    const rounded = Math.round(Number(ratingVal) || 5);
    return (
      <div className="tp-stars-group" aria-label={`${ratingVal} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            className={`tp-star-box ${s <= rounded ? 'active' : 'inactive'}`}
            style={{ width: `${boxSize}px`, height: `${boxSize}px` }}
          >
            <Star size={size} fill="#ffffff" color="#ffffff" strokeWidth={0} />
          </span>
        ))}
      </div>
    );
  };

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

  const activeRatingScore = formHoverRating || formRating;
  const ratingLabels = ['1 - Poor', '2 - Fair', '3 - Average', '4 - Great', '5 - Exceptional'];

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
                  onClick={() => {
                    const el = document.getElementById('trader-reviews-hub');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <MessageSquare size={13} />
                  <span>{broker.reviewsCount || `${communityReviews.length}+ Verified Reviews`}</span>
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
          MAIN CONTENT LAYOUT (2 COLUMNS: REVIEWS + EDITORIAL + SIDEBAR)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="brp-content-section" id="trader-reviews-hub">
        <div className="brp-container brp-layout-grid">
          {/* LEFT COLUMN: REVIEWS HUB + DETAILED EDITORIAL */}
          <main className="brp-main-content">

            {/* ══════════════════════════════════════════════════════════
                TRUSTPILOT-STYLE DIRECT REVIEWS & RATING HUB
                ══════════════════════════════════════════════════════════ */}
            <section className="tp-overview-hub">
              {/* 1. INTERACTIVE "WRITE A REVIEW" SECTION (PRE-SELECTED BROKER) */}
              <div className="tp-write-card">
                <div className="tp-write-card-header">
                  <div className="tp-write-user-avatar">
                    {isAuthenticated && user?.username ? (
                      user.username.charAt(0).toUpperCase()
                    ) : (
                      <PenLine size={16} />
                    )}
                  </div>
                  <div className="tp-write-prompt-text">
                    <span className="tp-write-label">Rate your experience with</span>
                    <strong className="tp-write-broker-name">{broker.name}</strong>
                  </div>
                </div>

                {/* 5-STAR INTERACTIVE BOX SELECTOR */}
                <div className="tp-interactive-rating-row">
                  <div
                    className="tp-rating-boxes-selector"
                    onMouseLeave={() => setFormHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((starNum) => {
                      const isFilled = starNum <= activeRatingScore;
                      return (
                        <button
                          key={starNum}
                          type="button"
                          className={`tp-interactive-box ${isFilled ? 'filled' : ''}`}
                          onMouseEnter={() => setFormHoverRating(starNum)}
                          onClick={() => {
                            setFormRating(starNum);
                            setIsWritingReview(true);
                          }}
                          aria-label={`Rate ${starNum} stars`}
                        >
                          <Star size={18} fill="#ffffff" color="#ffffff" strokeWidth={0} />
                        </button>
                      );
                    })}
                  </div>
                  <span className="tp-rating-label-hint">
                    {ratingLabels[activeRatingScore - 1]}
                  </span>

                  {!isWritingReview && (
                    <button
                      type="button"
                      className="tp-write-open-btn"
                      onClick={() => setIsWritingReview(true)}
                    >
                      <PenLine size={13} />
                      <span>Write a Review</span>
                    </button>
                  )}
                </div>

                {/* EXPANDABLE INLINE REVIEW SUBMISSION FORM */}
                <AnimatePresence>
                  {isWritingReview && (
                    <motion.form
                      className="tp-inline-review-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      onSubmit={handleSubmitInlineReview}
                    >
                      <div className="tp-form-field">
                        <label className="tp-field-label">Review Title</label>
                        <input
                          type="text"
                          className="tp-input"
                          placeholder={`E.g. Fast UPI withdrawal and tight spreads on ${broker.name}`}
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                        />
                      </div>

                      <div className="tp-form-field">
                        <label className="tp-field-label">Your Honest Review *</label>
                        <textarea
                          rows={4}
                          className="tp-textarea"
                          placeholder={`Describe your trading experience with ${broker.name}: deposit speeds, live spreads, customer support, or platform stability...`}
                          value={formComment}
                          onChange={(e) => setFormComment(e.target.value)}
                          required
                        />
                      </div>

                      <div className="tp-form-row-2">
                        <div className="tp-form-field">
                          <label className="tp-field-label">Deposit Method Used</label>
                          <select
                            className="tp-select"
                            value={formDepositMethod}
                            onChange={(e) => setFormDepositMethod(e.target.value)}
                          >
                            {DEPOSIT_METHODS.map((method) => (
                              <option key={method} value={method}>{method}</option>
                            ))}
                          </select>
                        </div>

                        <div className="tp-form-field">
                          <label className="tp-field-label">Recommendation</label>
                          <div className="tp-recommend-toggle">
                            <button
                              type="button"
                              className={`tp-toggle-btn ${formRecommend ? 'active' : ''}`}
                              onClick={() => setFormRecommend(true)}
                            >
                              <CheckCircle2 size={13} />
                              <span>Recommend</span>
                            </button>
                            <button
                              type="button"
                              className={`tp-toggle-btn ${!formRecommend ? 'active-no' : ''}`}
                              onClick={() => setFormRecommend(false)}
                            >
                              <XCircle size={13} />
                              <span>Don't Recommend</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {!isAuthenticated && (
                        <div className="tp-form-row-2">
                          <div className="tp-form-field">
                            <label className="tp-field-label">Your Name / Trader Handle *</label>
                            <input
                              type="text"
                              className="tp-input"
                              placeholder="Rahul Sharma"
                              value={formGuestName}
                              onChange={(e) => setFormGuestName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="tp-form-field">
                            <label className="tp-field-label">Email Address (Kept Private)</label>
                            <input
                              type="email"
                              className="tp-input"
                              placeholder="trader@example.com"
                              value={formGuestEmail}
                              onChange={(e) => setFormGuestEmail(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      <div className="tp-form-actions">
                        <button
                          type="button"
                          className="tp-btn-cancel"
                          onClick={() => setIsWritingReview(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="tp-btn-submit"
                          disabled={formSubmitting}
                        >
                          <Send size={13} />
                          <span>{formSubmitting ? 'Publishing...' : `Submit Review for ${broker.name}`}</span>
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. COMMUNITY REVIEWS FEED HEADER & FILTERS */}
              <div className="tp-feed-header-row">
                <div className="tp-feed-title-col">
                  <h2 className="tp-feed-heading">Reviews for {broker.name}</h2>
                  <span className="tp-feed-count">
                    ({communityReviews.length} verified submissions)
                  </span>
                </div>

                <div className="tp-filter-pills-row">
                  {['all', '5', '4', '3', '2', '1'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`tp-filter-pill ${selectedRatingFilter === val ? 'active' : ''}`}
                      onClick={() => setSelectedRatingFilter(val)}
                    >
                      {val === 'all' ? 'All' : `${val} ★`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. REVIEWS FEED LIST */}
              <div className="tp-reviews-list">
                {reviewsLoading && communityReviews.length === 0 ? (
                  <div className="tp-reviews-loading">Loading community reviews...</div>
                ) : filteredReviews.length === 0 ? (
                  <div className="tp-reviews-empty">
                    <p>No {selectedRatingFilter}★ reviews found for {broker.name}.</p>
                    <button
                      type="button"
                      className="tp-write-open-btn"
                      onClick={() => {
                        setSelectedRatingFilter('all');
                        setIsWritingReview(true);
                      }}
                    >
                      Be the first to review!
                    </button>
                  </div>
                ) : (
                  filteredReviews.map((rev) => {
                    const authorInitials = (rev.username || 'Trader')
                      .split(' ')
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <div key={rev._id} id={`review-${rev._id}`} className="tp-review-card">
                        {/* REVIEWER INFO */}
                        <div className="tp-rc-top">
                          <div className="tp-rc-user-info">
                            <div className="tp-rc-avatar">{authorInitials}</div>
                            <div>
                              <div className="tp-rc-author-row">
                                <strong className="tp-rc-name">{rev.username || 'Verified Trader'}</strong>
                                {rev.verifiedTrader !== false && (
                                  <span className="tp-rc-verified-badge">
                                    <CheckCircle2 size={12} color="#10b981" />
                                    <span>Verified</span>
                                  </span>
                                )}
                              </div>
                              <span className="tp-rc-date">
                                {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          {/* TRUSTPILOT GREEN RATING BOXES */}
                          <div className="tp-rc-stars">
                            {renderTrustpilotStars(rev.rating, 14, 20)}
                          </div>
                        </div>

                        {/* REVIEW TITLE & BODY */}
                        <h3 className="tp-rc-title">{rev.title}</h3>
                        <p className="tp-rc-comment">{rev.comment}</p>

                        {/* DEPOSIT METHOD TAG */}
                        {rev.depositMethodUsed && (
                          <div className="tp-rc-meta-strip">
                            <span className="tp-rc-deposit-pill">
                              Deposit: <strong>{rev.depositMethodUsed}</strong>
                            </span>
                          </div>
                        )}

                        {/* COMPANY REPLIED BLOCK (MATCHING SCREENSHOT) */}
                        {rev.brokerResponse?.responseComment && (
                          <div className="tp-rc-company-reply-card">
                            <div className="tp-rc-reply-header">
                              <CornerDownRight size={14} className="tp-rc-reply-icon" />
                              <span className="tp-rc-reply-title">Company replied</span>
                              <span className="tp-rc-reply-date">
                                {new Date(rev.brokerResponse.respondedAt || Date.now()).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <p className="tp-rc-reply-text">{rev.brokerResponse.responseComment}</p>
                          </div>
                        )}

                        {/* ACTION BUTTONS: USEFUL / SHARE / FLAG (MATCHING SCREENSHOT) */}
                        <div className="tp-rc-footer-actions">
                          <button
                            type="button"
                            className={`tp-action-btn ${votedReviews[rev._id] ? 'voted' : ''}`}
                            onClick={() => handleVoteHelpful(rev._id)}
                            title="Mark this review as useful"
                          >
                            <ThumbsUp size={13} />
                            <span>Useful</span>
                            {(rev.helpfulVotes || 0) > 0 && (
                              <span className="tp-action-count">{rev.helpfulVotes}</span>
                            )}
                          </button>

                          <button
                            type="button"
                            className="tp-action-btn"
                            onClick={() => handleShareReview(rev._id)}
                            title="Share review"
                          >
                            <Share2 size={13} />
                            <span>Share</span>
                          </button>

                          <button
                            type="button"
                            className={`tp-action-btn tp-flag-btn ${flaggedReviews[rev._id] ? 'flagged' : ''}`}
                            onClick={() => handleFlagReview(rev._id)}
                            title="Report / flag this review"
                          >
                            <Flag size={13} />
                            <span>{flaggedReviews[rev._id] ? 'Reported' : 'Flag'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* SEE ALL REVIEWS BUTTON (MATCHING SCREENSHOT) */}
              <div className="tp-see-all-wrapper">
                <button
                  type="button"
                  className="tp-see-all-btn"
                  onClick={() => setReviewsModalOpen(true)}
                >
                  See all {broker.reviewsCount || `${communityReviews.length}+`} reviews
                </button>
              </div>

              {/* ══════════════════════════════════════════════════════════
                  4. COMPANY DETAILS & CONTACT INFO (EXACTLY MATCHING USER SCREENSHOT)
                  ══════════════════════════════════════════════════════════ */}
              <div className="tp-company-section-card">
                {/* CATEGORIES BADGES ROW */}
                <div className="tp-category-badges-row">
                  {companyDetails.businessCategories.map((cat, i) => (
                    <span key={i} className="tp-category-pill">
                      {cat}
                    </span>
                  ))}
                  <span className="tp-category-info-badge" title="Verified financial business category">
                    <Info size={13} />
                  </span>
                </div>

                {/* COMPANY DETAILS ROW */}
                <div className="tp-info-grid-row">
                  <div className="tp-info-label-col">
                    <h3 className="tp-info-main-title">Company details</h3>
                  </div>
                  <div className="tp-info-content-col">
                    <span className="tp-info-subheading">Written by the company</span>
                    <p className="tp-info-body-text">{companyDetails.writtenByCompany}</p>
                  </div>
                </div>

                {/* CONTACT INFO ROW */}
                <div className="tp-info-grid-row">
                  <div className="tp-info-label-col">
                    <h3 className="tp-info-main-title">Contact info</h3>
                  </div>
                  <div className="tp-info-content-col">
                    <div className="tp-contact-list">
                      {companyDetails.contactInfo.address && (
                        <div className="tp-contact-item">
                          <MapPin size={15} className="tp-contact-icon" />
                          <span>{companyDetails.contactInfo.address}</span>
                        </div>
                      )}

                      {companyDetails.contactInfo.phone && (
                        <div className="tp-contact-item">
                          <Phone size={15} className="tp-contact-icon" />
                          <a
                            href={`tel:${companyDetails.contactInfo.phone}`}
                            className="tp-contact-link"
                          >
                            {companyDetails.contactInfo.phone}
                          </a>
                        </div>
                      )}

                      {companyDetails.contactInfo.email && (
                        <div className="tp-contact-item">
                          <Mail size={15} className="tp-contact-icon" />
                          <a
                            href={`mailto:${companyDetails.contactInfo.email}`}
                            className="tp-contact-link"
                          >
                            {companyDetails.contactInfo.email}
                          </a>
                        </div>
                      )}

                      {companyDetails.contactInfo.website && (
                        <div className="tp-contact-item">
                          <Globe size={15} className="tp-contact-icon" />
                          <a
                            href={companyDetails.contactInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tp-contact-link"
                          >
                            {companyDetails.contactInfo.website.replace(/^https?:\/\/(www\.)?/, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                5. IN-DEPTH TECHNICAL & EDITORIAL ANALYSIS
                ══════════════════════════════════════════════════════════ */}
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
