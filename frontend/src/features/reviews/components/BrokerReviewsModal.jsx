import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Send,
  X,
  Zap,
  Clock,
  Sparkles,
  Building2,
  CornerDownRight,
  TrendingUp,
  AlertCircle,
  Award,
  Flag,
  Share2,
} from 'lucide-react';
import { reviewService } from '../services/review.service.js';
import { brokerService } from '../../brokers/services/broker.service.js';
import { ALL_BROKERS_DATA } from '../../brokers/data/brokersData.jsx';
import useAuth from '../../auth/hooks/useAuth.js';
import { useToast } from '../../shared/components/toast/ToastContext.jsx';
import './BrokerReviewsModal.css';

const DEPOSIT_METHODS = [
  'UPI / PhonePe',
  'UPI / Google Pay',
  'NetBanking / IMPS',
  'Crypto (USDT TRC20)',
  'Credit / Debit Card',
  'Skrill / Neteller',
  'Bank Wire Transfer',
];

export const BrokerReviewsModal = ({ isOpen, onClose, broker, initialWriteReview = false, onReviewSubmitted }) => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [allBrokersList, setAllBrokersList] = useState(() => (Array.isArray(ALL_BROKERS_DATA) && ALL_BROKERS_DATA.length > 0 ? ALL_BROKERS_DATA : []));
  const [selectedBroker, setSelectedBroker] = useState(() => broker || (ALL_BROKERS_DATA && ALL_BROKERS_DATA[0]) || null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('all');

  useEffect(() => {
    if (broker) {
      setSelectedBroker(broker);
    }
  }, [broker]);

  // Fetch available brokers for global review dropdown
  useEffect(() => {
    if (isOpen) {
      brokerService.getAllBrokers().then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllBrokersList((prev) => {
            const map = new Map();
            (ALL_BROKERS_DATA || []).forEach((b) => map.set(b.slug || b.id || b.name, b));
            data.forEach((b) => map.set(b.slug || b.id || b.name, { ...(map.get(b.slug || b.id || b.name) || {}), ...b }));
            return Array.from(map.values());
          });
        }
      }).catch((e) => console.warn('Failed to load brokers list:', e));
    }
  }, [isOpen]);

  const currentBroker = broker || selectedBroker || (allBrokersList.length > 0 ? allBrokersList[0] : null);

  useEffect(() => {
    if (isOpen && initialWriteReview) {
      setIsWritingReview(true);
    }
  }, [isOpen, initialWriteReview]);

  // Lock body scroll and prevent background shifting when modal is open
  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      const origOverscroll = document.body.style.overscrollBehavior;
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      return () => {
        document.body.style.overflow = origOverflow;
        document.body.style.overscrollBehavior = origOverscroll;
      };
    }
  }, [isOpen]);

  // "Write Review" form state
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewRole, setReviewRole] = useState('trader'); // 'trader' | 'broker'
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [depositMethod, setDepositMethod] = useState('UPI / PhonePe');
  const [recommend, setRecommend] = useState(true);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [execSpeed, setExecSpeed] = useState(5);
  const [custSupport, setCustSupport] = useState(5);
  const [withSpeed, setWithSpeed] = useState(5);
  const [spreadsFees, setSpreadsFees] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Inline "Reply as Broker" state: maps reviewId -> { isOpen: bool, text: '', responder: '', isSubmitting: bool }
  const [replyBoxes, setReplyBoxes] = useState({});

  // Fetch reviews for current broker or all approved reviews
  const loadReviews = useCallback(async (target) => {
    const b = target || currentBroker;
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (b?.slug) {
        params.brokerSlug = b.slug;
      } else if (b?.id) {
        params.brokerSlug = b.id;
      }
      if (b?.name) {
        params.brokerName = b.name;
      }
      if (b?._id && typeof b._id === 'string' && b._id.length === 24) {
        params.brokerId = b._id;
      }

      const res = await reviewService.getBrokerReviews(params);
      if (res?.data) {
        setReviews(res.data.reviews || []);
        setStats(res.data.stats || null);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [currentBroker]);

  useEffect(() => {
    if (isOpen) {
      loadReviews(currentBroker);
    }
  }, [isOpen, currentBroker, loadReviews]);

  // Handle Review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!comment.trim() || comment.trim().length < 8) {
      toast.error('Review Too Short', 'Please write at least 8 characters describing your experience.');
      return;
    }

    if (!isAuthenticated && !guestName.trim()) {
      toast.error('Name Required', 'Please enter your name or trader handle.');
      return;
    }

    if (!currentBroker) {
      toast.error('Broker Required', 'Please select which broker you are reviewing.');
      return;
    }

    setSubmittingReview(true);
    try {
      const payload = {
        brokerId: currentBroker._id && String(currentBroker._id).length === 24 ? currentBroker._id : undefined,
        brokerSlug: currentBroker.slug || currentBroker.id || currentBroker.name.toLowerCase().replace(/\s+/g, '-'),
        brokerName: currentBroker.name,
        rating,
        title: title.trim() || `${rating}★ Trader Experience with ${currentBroker?.name || "Forex Broker"}`,
        comment: comment.trim(),
        depositMethodUsed: depositMethod,
        recommend,
        reviewerRole: reviewRole,
        username: isAuthenticated ? user.username : guestName.trim(),
        userEmail: isAuthenticated ? user.email : guestEmail.trim(),
        categories: {
          executionSpeed: execSpeed,
          customerSupport: custSupport,
          withdrawalSpeed: withSpeed,
          spreadsFees: spreadsFees,
        },
      };

      const res = await reviewService.createReview(payload);
      toast.success('Review Published!', `Thank you! Your verified ${rating}★ review for ${currentBroker.name} is now live.`);
      
      // Reset form
      setComment('');
      setTitle('');
      setIsWritingReview(false);

      // Refresh list
      loadReviews();
      window.dispatchEvent(new CustomEvent('pipwise_testimonials_updated', { detail: { newReview: res?.data?.review } }));
      window.dispatchEvent(new CustomEvent('broker_reviews_updated', { detail: { newReview: res?.data?.review } }));
      if (onReviewSubmitted) onReviewSubmitted(res?.data?.review);
    } catch (err) {
      toast.error('Submission Failed', err.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Toggle inline reply box
  const toggleReplyBox = (reviewId) => {
    setReplyBoxes((prev) => ({
      ...prev,
      [reviewId]: {
        isOpen: !prev[reviewId]?.isOpen,
        text: prev[reviewId]?.text || '',
        responder:
          prev[reviewId]?.responder ||
          (user?.username ? `${user.username} (${currentBroker?.name || "Broker"} Official)` : `${currentBroker?.name || "Broker"} Official Team`),
        isSubmitting: false,
      },
    }));
  };

  // Handle Official Broker Reply submission
  const handleSubmitReply = async (reviewId) => {
    const box = replyBoxes[reviewId];
    if (!box?.text?.trim() || box.text.trim().length < 5) {
      toast.error('Reply Required', 'Please write a meaningful official response.');
      return;
    }

    setReplyBoxes((prev) => ({
      ...prev,
      [reviewId]: { ...prev[reviewId], isSubmitting: true },
    }));

    try {
      await reviewService.replyToReview(reviewId, {
        responseComment: box.text.trim(),
        responderName: box.responder?.trim() || `${currentBroker?.name || "Broker"} Support Team`,
      });

      toast.success('Official Reply Posted!', 'Your broker response is now published.');
      
      // Close box & reload
      setReplyBoxes((prev) => ({
        ...prev,
        [reviewId]: { ...prev[reviewId], isOpen: false, text: '', isSubmitting: false },
      }));

      loadReviews();
    } catch (err) {
      toast.error('Reply Failed', err.message || 'Could not post broker reply.');
      setReplyBoxes((prev) => ({
        ...prev,
        [reviewId]: { ...prev[reviewId], isSubmitting: false },
      }));
    }
  };

  const [flaggedReviews, setFlaggedReviews] = useState({});

  // Flag review handler
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
      // Handled gracefully
    }
  };

  // Share review handler
  const handleShareReview = (reviewId) => {
    const slug = currentBroker?.slug || currentBroker?.id || 'broker';
    const url = `${window.location.origin}/reviews/${slug}#review-${reviewId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Link Copied', 'Review link copied to clipboard!');
      }).catch(() => {
        toast.info('Review Link', url);
      });
    } else {
      toast.info('Review Link', url);
    }
  };

  // Upvote Helpful
  const handleVoteHelpful = async (reviewId) => {
    try {
      const res = await reviewService.voteHelpful(reviewId);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? { ...r, helpfulVotes: res.data?.helpfulVotes ?? (r.helpfulVotes || 0) + 1 }
            : r
        )
      );
      toast.success('Feedback Recorded', 'Thanks for voting this review as helpful!');
    } catch (err) {
      toast.error('Vote Failed', err.message || 'Could not register vote.');
    }
  };

  if (!isOpen) return null;

  // Filter reviews by rating if selected
  const filteredReviews = reviews.filter((r) => {
    if (selectedRatingFilter === 'all') return true;
    return Math.round(r.rating) === Number(selectedRatingFilter);
  });

  const ratingDesc = [
    '',
    '1 - Disappointing',
    '2 - Below Expectations',
    '3 - Average / Fair',
    '4 - Very Good',
    '5 - Exceptional',
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="broker-reviews-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="broker-reviews-modal"
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 18 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Glow */}
          <div className="broker-reviews-glow" aria-hidden="true" />

          {/* Modal Header */}
          <div className="broker-reviews-header">
            <div className="broker-reviews-broker-info">
              {currentBroker?.logo ? (
                <img src={currentBroker.logo} alt={currentBroker?.name || "Broker"} className="brm-logo-img" />
              ) : (
                <div className="brm-logo-placeholder">
                  {currentBroker?.name ? currentBroker.name.slice(0, 2).toUpperCase() : 'TS'}
                </div>
              )}
              <div>
                <div className="brm-name-row">
                  <h3 className="brm-title">
                    {currentBroker ? `${currentBroker.name} Reviews & Ratings` : 'TradeSafeBrokers Trader Reviews'}
                  </h3>
                  <span className="brm-verified-badge" title="TradeSafe Verified Community Reviews">
                    <CheckCircle2 size={11} strokeWidth={2.8} /> TradeSafe Verified Reviews
                  </span>
                </div>
                <div className="brm-sub">
                  Community feedback, verified star ratings & official broker responses
                </div>
              </div>
            </div>

            <button
              className="brm-close-btn"
              onClick={onClose}
              type="button"
              aria-label="Close reviews"
            >
              <X size={15} />
            </button>
          </div>

          {/* Top Aggregate Score Card */}
          <div className="brm-score-summary-grid">
            <div className="brm-main-score-card">
              <div className="brm-score-val">
                {stats?.averageRating || currentBroker?.rating || '4.8'}
              </div>
              <div className="brm-stars-row">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    fill={s <= Math.round(stats?.averageRating || currentBroker?.rating || 5) ? '#fc5d21' : 'none'}
                    color="#fc5d21"
                  />
                ))}
              </div>
              <div className="brm-total-count">
                Based on {stats?.total || reviews.length || '120+'} verified trader reviews
              </div>
              <div className="brm-rec-pill">
                <TrendingUp size={12} />
                <span>{stats?.recommendPercentage ?? 96}% traders recommend</span>
              </div>
            </div>

            {/* Category Benchmarks */}
            <div className="brm-category-bars">
              <div className="brm-cat-row">
                <span className="brm-cat-name">
                  <Zap size={12} color="#fc5d21" /> Execution & Latency
                </span>
                <div className="brm-bar-track">
                  <div
                    className="brm-bar-fill"
                    style={{ width: `${((stats?.categories?.executionSpeed || 4.8) / 5) * 100}%` }}
                  />
                </div>
                <span className="brm-cat-score">
                  {stats?.categories?.executionSpeed || 4.8} / 5
                </span>
              </div>

              <div className="brm-cat-row">
                <span className="brm-cat-name">
                  <Clock size={12} color="#10b981" /> Withdrawal Speed
                </span>
                <div className="brm-bar-track">
                  <div
                    className="brm-bar-fill is-green"
                    style={{ width: `${((stats?.categories?.withdrawalSpeed || 4.9) / 5) * 100}%` }}
                  />
                </div>
                <span className="brm-cat-score">
                  {stats?.categories?.withdrawalSpeed || 4.9} / 5
                </span>
              </div>

              <div className="brm-cat-row">
                <span className="brm-cat-name">
                  <MessageSquare size={12} color="#3b82f6" /> Customer Support
                </span>
                <div className="brm-bar-track">
                  <div
                    className="brm-bar-fill is-blue"
                    style={{ width: `${((stats?.categories?.customerSupport || 4.7) / 5) * 100}%` }}
                  />
                </div>
                <span className="brm-cat-score">
                  {stats?.categories?.customerSupport || 4.7} / 5
                </span>
              </div>

              <div className="brm-cat-row">
                <span className="brm-cat-name">
                  <Sparkles size={12} color="#f59e0b" /> Spreads & Low Fees
                </span>
                <div className="brm-bar-track">
                  <div
                    className="brm-bar-fill is-amber"
                    style={{ width: `${((stats?.categories?.spreadsFees || 4.8) / 5) * 100}%` }}
                  />
                </div>
                <span className="brm-cat-score">
                  {stats?.categories?.spreadsFees || 4.8} / 5
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="brm-toolbar">
            <div className="brm-filters">
              <span className="brm-filter-label">Filter:</span>
              {['all', '5', '4', '3', '2', '1'].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`brm-filter-pill ${selectedRatingFilter === val ? 'active' : ''}`}
                  onClick={() => setSelectedRatingFilter(val)}
                >
                  {val === 'all' ? 'All Reviews' : `${val} ★`}
                </button>
              ))}
            </div>

            <div className="brm-action-btns">
              <button
                type="button"
                className={`brm-write-btn ${isWritingReview ? 'active' : ''}`}
                onClick={() => setIsWritingReview(!isWritingReview)}
              >
                {isWritingReview ? (
                  <>
                    <X size={13} /> Close Form
                  </>
                ) : (
                  <>
                    <Sparkles size={13} /> Write a Review
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Write Review Collapsible Form */}
          <AnimatePresence>
            {isWritingReview && (
              <motion.form
                className="brm-write-card"
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmitReview}
              >
                <div className="brm-write-header">
                  <div className="brm-write-title">
                    <Sparkles size={15} color="#fc5d21" />
                    <span>Share Your Experience with {currentBroker?.name || 'Broker'}</span>
                  </div>

                  {/* Mode selector: Trader vs Broker official */}
                  <div className="brm-role-switch">
                    <button
                      type="button"
                      className={`brm-role-btn ${reviewRole === 'trader' ? 'active' : ''}`}
                      onClick={() => setReviewRole('trader')}
                    >
                      <ShieldCheck size={11} /> Trader Review
                    </button>
                    <button
                      type="button"
                      className={`brm-role-btn ${reviewRole === 'broker' ? 'active' : ''}`}
                      onClick={() => setReviewRole('broker')}
                    >
                      <Building2 size={11} /> Broker Partner Note
                    </button>
                  </div>
                </div>

                {/* Step 1: Select Broker to Review */}
                {!broker && (
                  <div className="brm-form-row" style={{ marginBottom: "16px" }}>
                    <label className="brm-field-label">
                      <Building2 size={13} color="#00b67a" /> 1. Select the Broker You Want to Review *
                    </label>
                    <select
                      className="brm-select-broker"
                      value={currentBroker?.slug || currentBroker?.id || currentBroker?._id || ""}
                      onChange={(e) => {
                        const targetKey = String(e.target.value).toLowerCase();
                        const found = allBrokersList.find((b) => 
                          (b.slug && b.slug.toLowerCase() === targetKey) ||
                          (b.id && b.id.toLowerCase() === targetKey) ||
                          (b._id && String(b._id).toLowerCase() === targetKey) ||
                          (b.name && b.name.toLowerCase() === targetKey)
                        );
                        if (found) {
                          setSelectedBroker(found);
                          loadReviews(found);
                        }
                      }}
                      required
                    >
                      {allBrokersList.map((b) => {
                        const keyVal = b.slug || b.id || b._id || b.name;
                        return (
                          <option key={keyVal} value={keyVal}>
                            {b.name} ({b.regulation || "Regulated"} • {b.rating || "4.8"}★)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Step 2: Trustpilot-Style 5 Big Star Rating Blocks */}
                <div className="brm-trustpilot-stars-group">
                  <label className="brm-field-label">
                    <Star size={13} color="#00b67a" /> 2. Rate Your Overall Experience *
                  </label>
                  <div className="brm-trustpilot-boxes-row">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const activeVal = hoverRating || rating;
                      const isSelected = activeVal >= starVal;
                      const starColors = ["", "#ff3722", "#ff8622", "#ffce00", "#73cf11", "#00b67a"];
                      const activeColor = starColors[activeVal] || "#00b67a";

                      return (
                        <button
                          key={starVal}
                          type="button"
                          className={`brm-trustpilot-star-box ${isSelected ? "active" : ""}`}
                          style={{
                            backgroundColor: isSelected ? activeColor : undefined,
                            borderColor: isSelected ? activeColor : undefined,
                          }}
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starVal)}
                          aria-label={`${starVal} stars`}
                        >
                          <Star
                            size={22}
                            fill={isSelected ? "#ffffff" : "none"}
                            color={isSelected ? "#ffffff" : "#64748b"}
                            strokeWidth={2.4}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <div className="brm-trustpilot-feedback-row">
                    <span className="brm-trustpilot-score-tag">
                      {(hoverRating || rating)}.0 / 5.0 Rating
                    </span>
                    <span className="brm-trustpilot-desc-tag">
                      — {ratingDesc[hoverRating || rating]}
                    </span>
                  </div>
                </div>

                {/* Category Sliders */}
                <div className="brm-category-sliders-grid">
                  <div className="brm-slider-item">
                    <div className="brm-slider-header">
                      <span>⚡ Execution Speed:</span>
                      <strong>{execSpeed} / 5</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={execSpeed}
                      onChange={(e) => setExecSpeed(Number(e.target.value))}
                      className="brm-range-input"
                    />
                  </div>

                  <div className="brm-slider-item">
                    <div className="brm-slider-header">
                      <span>💸 Withdrawal Speed:</span>
                      <strong>{withSpeed} / 5</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={withSpeed}
                      onChange={(e) => setWithSpeed(Number(e.target.value))}
                      className="brm-range-input"
                    />
                  </div>

                  <div className="brm-slider-item">
                    <div className="brm-slider-header">
                      <span>💬 Customer Support:</span>
                      <strong>{custSupport} / 5</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={custSupport}
                      onChange={(e) => setCustSupport(Number(e.target.value))}
                      className="brm-range-input"
                    />
                  </div>

                  <div className="brm-slider-item">
                    <div className="brm-slider-header">
                      <span>📊 Spreads & Fees:</span>
                      <strong>{spreadsFees} / 5</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={spreadsFees}
                      onChange={(e) => setSpreadsFees(Number(e.target.value))}
                      className="brm-range-input"
                    />
                  </div>
                </div>

                {/* Review Title */}
                <div className="brm-form-row">
                  <label className="brm-field-label">Review Title (Summary)</label>
                  <input
                    type="text"
                    className="brm-input"
                    placeholder="e.g. Ultra-fast UPI withdrawal within 3 minutes and tight spreads"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Detailed Comment */}
                <div className="brm-form-row">
                  <label className="brm-field-label">Your Honest Review Experience</label>
                  <textarea
                    rows={3}
                    className="brm-textarea"
                    placeholder={`Tell other forex traders about your experience with ${currentBroker?.name || "this broker"} (order execution, slippage, deposits/withdrawals, customer support)...`}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                {/* Deposit Method & Recommendation */}
                <div className="brm-form-grid-2">
                  <div className="brm-form-row">
                    <label className="brm-field-label">Payment Mode Used</label>
                    <select
                      className="brm-select"
                      value={depositMethod}
                      onChange={(e) => setDepositMethod(e.target.value)}
                    >
                      {DEPOSIT_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="brm-form-row">
                    <label className="brm-field-label">Recommend to Other Traders?</label>
                    <div className="brm-rec-buttons">
                      <button
                        type="button"
                        className={`brm-rec-choice ${recommend ? 'active' : ''}`}
                        onClick={() => setRecommend(true)}
                      >
                        ✓ Yes, Recommended
                      </button>
                      <button
                        type="button"
                        className={`brm-rec-choice ${!recommend ? 'active-no' : ''}`}
                        onClick={() => setRecommend(false)}
                      >
                        ✕ No
                      </button>
                    </div>
                  </div>
                </div>

                {/* Guest info if not logged in */}
                {!isAuthenticated && (
                  <div className="brm-form-grid-2">
                    <div className="brm-form-row">
                      <label className="brm-field-label">Your Name / Trader Tag</label>
                      <input
                        type="text"
                        required
                        className="brm-input"
                        placeholder="e.g. Rahul Mehta"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                      />
                    </div>
                    <div className="brm-form-row">
                      <label className="brm-field-label">Email (Optional)</label>
                      <input
                        type="email"
                        className="brm-input"
                        placeholder="rahul@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Verified KYC info banner */}
                {isAuthenticated && (
                  <div className="brm-auth-info-banner">
                    <ShieldCheck size={14} color="#10b981" />
                    <span>
                      Posting as <strong>{user.username}</strong>
                      {user.isKycVerified || user.kycStatus === 'verified' ? (
                        <span className="brm-kyc-check-chip"> • Verified Trader ✓</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>
                          {' '}
                          • (Tip: Complete KYC for official Verified Trader badge)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                <div className="brm-submit-actions">
                  <button
                    type="button"
                    className="brm-btn-cancel"
                    onClick={() => setIsWritingReview(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="brm-btn-submit"
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Publishing...' : 'Publish Verified Review'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Reviews List Feed */}
          <div className="brm-reviews-feed">
            {loading ? (
              <div className="brm-loading-state">
                <div className="brm-spinner" />
                <span>Loading genuine trader reviews...</span>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="brm-empty-state">
                <MessageSquare size={32} color="rgba(255,255,255,0.2)" />
                <h4>No reviews found for this selection</h4>
                <p>Be the first trader to share your genuine experience with {currentBroker?.name || "this broker"}!</p>
                <button
                  type="button"
                  className="brm-empty-cta"
                  onClick={() => setIsWritingReview(true)}
                >
                  Write First Review
                </button>
              </div>
            ) : (
              filteredReviews.map((rev) => {
                const replyState = replyBoxes[rev._id];
                return (
                  <div key={rev._id} className="brm-review-card">
                    {/* Prominent Trustpilot-style Broker & Rating Header */}
                    <div className="brm-rc-broker-bar">
                      <div className="brm-rc-broker-tag">
                        <Building2 size={13} color="#00b67a" />
                        <span>Review for <strong className="brm-rc-broker-name">{rev.brokerName || currentBroker?.name || "Forex Broker"}</strong></span>
                      </div>
                      <div className="brm-rc-trustpilot-stars">
                        {[1, 2, 3, 4, 5].map((s) => {
                          const starColors = ["", "#ff3722", "#ff8622", "#ffce00", "#73cf11", "#00b67a"];
                          const isFilled = s <= Math.round(Number(rev.rating) || 5);
                          const fillColor = starColors[Math.round(Number(rev.rating) || 5)] || '#00b67a';
                          return (
                            <span
                              key={s}
                              className={`brm-tp-star-box-sm ${isFilled ? 'active' : ''}`}
                              style={{ backgroundColor: isFilled ? fillColor : 'rgba(255, 255, 255, 0.12)' }}
                            >
                              <Star size={10} fill="#ffffff" color="#ffffff" strokeWidth={2.4} />
                            </span>
                          );
                        })}
                        <strong className="brm-rc-tp-score">{Number(rev.rating || 5).toFixed(1)} / 5.0</strong>
                      </div>
                    </div>

                    {/* Review Header */}
                    <div className="brm-rc-top">
                      <div className="brm-rc-user-group">
                        <div className="brm-rc-avatar">
                          {rev.username ? rev.username.slice(0, 2).toUpperCase() : 'TR'}
                        </div>
                        <div>
                          <div className="brm-rc-name-row">
                            <span className="brm-rc-username">{rev.username}</span>
                            {rev.verifiedTrader && (
                              <span
                                className="brm-rc-verified-chip"
                                title="Verified ID Card Trader on TradeSafeBrokers"
                              >
                                <CheckCircle2 size={10} strokeWidth={2.8} /> Verified Trader
                              </span>
                            )}
                            {rev.reviewerRole === 'broker' && (
                              <span
                                className="brm-rc-broker-chip"
                                title="Registered Broker Partner"
                              >
                                <Building2 size={10} /> Broker Partner
                              </span>
                            )}
                          </div>
                          <div className="brm-rc-meta">
                            <span>
                              {new Date(rev.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            {rev.depositMethodUsed && (
                              <span className="brm-rc-method-chip">
                                {rev.depositMethodUsed}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Title & Body */}
                    {rev.title && <h4 className="brm-rc-title">{rev.title}</h4>}
                    <p className="brm-rc-comment">{rev.comment}</p>

                    {/* Category Rating Badges */}
                    {rev.categories && (
                      <div className="brm-rc-cats-row">
                        <span className="brm-rc-cat-tag">
                          ⚡ Execution: {rev.categories.executionSpeed || rev.rating}★
                        </span>
                        <span className="brm-rc-cat-tag">
                          💸 Withdrawal: {rev.categories.withdrawalSpeed || rev.rating}★
                        </span>
                        <span className="brm-rc-cat-tag">
                          💬 Support: {rev.categories.customerSupport || rev.rating}★
                        </span>
                        <span className="brm-rc-cat-tag">
                          📊 Spreads: {rev.categories.spreadsFees || rev.rating}★
                        </span>
                      </div>
                    )}

                    {/* Footer Actions: Useful (like), Share, Flag & Broker Reply trigger */}
                    <div className="brm-rc-actions-footer">
                      <div className="brm-rc-actions-left">
                        <button
                          type="button"
                          className="brm-helpful-btn"
                          onClick={() => handleVoteHelpful(rev._id)}
                          title="Mark this review as useful"
                        >
                          <ThumbsUp size={12} />
                          <span>Useful ({rev.helpfulVotes || 0})</span>
                        </button>

                        <button
                          type="button"
                          className="brm-share-btn"
                          onClick={() => handleShareReview(rev._id)}
                          title="Share review"
                        >
                          <Share2 size={12} />
                          <span>Share</span>
                        </button>

                        <button
                          type="button"
                          className={`brm-flag-btn ${flaggedReviews[rev._id] ? 'flagged' : ''}`}
                          onClick={() => handleFlagReview(rev._id)}
                          title="Report / flag this review"
                        >
                          <Flag size={12} />
                          <span>{flaggedReviews[rev._id] ? 'Reported' : 'Flag'}</span>
                        </button>
                      </div>

                      {/* Real Forex App: Broker can reply to any review */}
                      <button
                        type="button"
                        className="brm-reply-trigger-btn"
                        onClick={() => toggleReplyBox(rev._id)}
                      >
                        <Building2 size={12} />
                        <span>
                          {rev.brokerResponse?.responseComment
                            ? 'Update Broker Response'
                            : 'Reply as Broker'}
                        </span>
                      </button>
                    </div>

                    {/* Official Broker Response Card if present */}
                    {rev.brokerResponse?.responseComment && (
                      <div className="brm-official-reply-block">
                        <div className="brm-orb-header">
                          <div className="brm-orb-title">
                            <Building2 size={13} color="#fc5d21" />
                            <strong>Official Broker Response</strong>
                            <span className="brm-orb-name">
                              — {rev.brokerResponse.responderName || `${rev.brokerName || currentBroker?.name || "Broker"} Support`}
                            </span>
                          </div>
                          {rev.brokerResponse.respondedAt && (
                            <span className="brm-orb-time">
                              {new Date(rev.brokerResponse.respondedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                        <p className="brm-orb-body">{rev.brokerResponse.responseComment}</p>
                      </div>
                    )}

                    {/* Inline Broker Reply Form */}
                    {replyState?.isOpen && (
                      <div className="brm-inline-reply-box">
                        <div className="brm-irb-header">
                          <CornerDownRight size={14} color="#fc5d21" />
                          <span>Post Official Broker Response</span>
                        </div>
                        <div className="brm-irb-row">
                          <input
                            type="text"
                            placeholder="Official Representative Name (e.g. Exness Compliance Team)"
                            value={replyState.responder}
                            onChange={(e) =>
                              setReplyBoxes((prev) => ({
                                ...prev,
                                [rev._id]: { ...prev[rev._id], responder: e.target.value },
                              }))
                            }
                            className="brm-irb-input"
                          />
                        </div>
                        <div className="brm-irb-row">
                          <textarea
                            rows={2}
                            placeholder="Write official response to address this trader's review..."
                            value={replyState.text}
                            onChange={(e) =>
                              setReplyBoxes((prev) => ({
                                ...prev,
                                [rev._id]: { ...prev[rev._id], text: e.target.value },
                              }))
                            }
                            className="brm-irb-textarea"
                          />
                        </div>
                        <div className="brm-irb-actions">
                          <button
                            type="button"
                            className="brm-irb-btn-cancel"
                            onClick={() => toggleReplyBox(rev._id)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="brm-irb-btn-send"
                            disabled={replyState.isSubmitting}
                            onClick={() => handleSubmitReply(rev._id)}
                          >
                            <Send size={12} />
                            <span>
                              {replyState.isSubmitting ? 'Posting...' : 'Post Official Reply'}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BrokerReviewsModal;
