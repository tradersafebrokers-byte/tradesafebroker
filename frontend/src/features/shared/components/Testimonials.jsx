import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, Heart, Building2 } from 'lucide-react';
import {
  getSynchronousTestimonials,
  fetchActiveTestimonials,
} from '../../testimonials/services/testimonialStorage.js';

// Single Testimonial Card Component (Memoized to prevent redundant card re-renders)
const TestimonialCard = React.memo(({ item }) => (
  <div className="pw-testimonial-card">
    <div className="pw-testimonial-body">
      {/* Top Header: Broker Name Pill & Trustpilot Star Boxes */}
      <div className="pw-card-broker-header">
        <div className="pw-broker-badge-pill" title={`Verified Trader review for ${item.brokerName || 'Broker'}`}>
          <Building2 size={12} className="pw-broker-icon" />
          <span>Review for <strong>{item.brokerName || 'Forex Broker'}</strong></span>
        </div>
        <div className="pw-trustpilot-stars-cluster" aria-label={`${item.rating || '5.0'} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((s) => {
            const isFilled = s <= Math.round(Number(item.rating) || 5);
            const fillColor = Number(item.rating) >= 4 ? '#00b67a' : Number(item.rating) === 3 ? '#ffce00' : '#ff3722';
            return (
              <span
                key={s}
                className="pw-tp-star-box"
                style={{ backgroundColor: isFilled ? fillColor : 'rgba(255,255,255,0.12)' }}
              >
                <Star size={9} fill="#ffffff" color="#ffffff" strokeWidth={2.4} />
              </span>
            );
          })}
          <span className="pw-tp-score-text">{Number(item.rating || 5.0).toFixed(1)}</span>
        </div>
      </div>

      {/* Reviewer Header: Avatar, Name & Role */}
      <div className="pw-testimonial-header">
        <div className="pw-testimonial-avatar-wrap">
          <img
            src={item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={item.name}
            loading="lazy"
            className="pw-testimonial-avatar"
          />
          <div className="pw-testimonial-check-badge">
            <CheckCircle2 size={12} className="pw-check-icon" />
          </div>
        </div>
        <div className="pw-testimonial-user-meta">
          <h4 className="pw-testimonial-user-name">{item.name}</h4>
          <span className="pw-testimonial-user-role">{item.role}</span>
        </div>
      </div>

      {/* Review Title */}
      {item.title && (
        <h5 className="pw-testimonial-card-title">{item.title}</h5>
      )}

      {/* Review Quote Text */}
      <p className="pw-testimonial-quote-text">
        "{item.review}"
      </p>
    </div>

    {/* Footer Verified Badge */}
    <div className="pw-testimonial-footer">
      <span className="pw-verified-tag">
        <CheckCircle2 size={11} className="pw-check-icon-footer" /> Verified Trader
      </span>
      {item.depositMethod ? (
        <span className="pw-deposit-tag">{item.depositMethod}</span>
      ) : (
        <span className="pw-supporter-tag">Trustpilot Verified</span>
      )}
    </div>
  </div>
));

const Testimonials = React.memo(() => {
  // Synchronous initial load guarantees instant render with ZERO re-render flash
  const [items, setItems] = useState(() => getSynchronousTestimonials());
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    let isMounted = true;

    // Check remote backend in background; ONLY update if data actually changed
    fetchActiveTestimonials().then((active) => {
      if (!isMounted || !Array.isArray(active)) return;
      const currentIds = itemsRef.current.map((t) => t._id || t.name).join(',');
      const newIds = active.map((t) => t._id || t.name).join(',');
      if (currentIds !== newIds) {
        setItems(active);
      }
    });

    // Real-time listener: instant synchronous update when admin deletes or resets
    const handleUpdate = () => {
      const fresh = getSynchronousTestimonials();
      setItems(fresh);
    };

    window.addEventListener('pipwise_testimonials_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('pipwise_testimonials_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const topRowReviews = useMemo(() => {
    const list = items.filter((t) => t.row === 'top');
    if (list.length > 0) return list;
    return items.slice(0, Math.ceil(items.length / 2));
  }, [items]);

  const bottomRowReviews = useMemo(() => {
    const list = items.filter((t) => t.row === 'bottom');
    if (list.length > 0) return list;
    return items.slice(Math.ceil(items.length / 2));
  }, [items]);

  // If both rows are empty because admin deleted everything
  if (items.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="pw-testimonials-section" aria-label="Trader Testimonials">
      {/* Header Content */}
      <div className="pw-testimonials-header-container">
        {/* Figma Selection Style Badge with Green Border & 4 Corner Resize Handles */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="pw-figma-badge"
        >
          {/* 4 Corner White Resize Handle Squares */}
          <span className="pw-handle-dot pw-h-tl" aria-hidden="true" />
          <span className="pw-handle-dot pw-h-tr" aria-hidden="true" />
          <span className="pw-handle-dot pw-h-bl" aria-hidden="true" />
          <span className="pw-handle-dot pw-h-br" aria-hidden="true" />

          <span className="pw-figma-badge-text">
            HEAR FROM OUR TRADERS & INVESTORS
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="pw-testimonials-heading"
        >
          Trade With True Confidence. <br className="pw-br-desktop" />
          Powered By 50,000+ Real Forex Traders.
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="pw-testimonials-subheading"
        >
          Read real experiences from active scalpers, day traders, and fund managers who empower their trading edge with TradeSafeBrokers comparisons.
        </motion.p>

        {/* Trustpilot-Style Rating & Write Review CTA Strip */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.25 }}
          className="pw-testimonials-cta-bar"
        >
          <div className="pw-trustpilot-score-strip">
            <span className="pw-tp-brand-logo">★ Trustpilot</span>
            <div className="pw-tp-stars-row">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="pw-tp-star-box-lg">
                  <Star size={13} fill="#ffffff" color="#ffffff" strokeWidth={2.4} />
                </span>
              ))}
            </div>
            <span className="pw-tp-score-label">TrustScore <strong>4.9</strong> • 50,000+ Verified Trader Reviews</span>
          </div>

          <button
            type="button"
            className="pw-write-review-hero-btn"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open_review_modal', { detail: { openWrite: true } }));
            }}
          >
            <Star size={14} fill="#ffffff" color="#ffffff" />
            <span>Write a Broker Review</span>
          </button>
        </motion.div>
      </div>

      {/* Seamless Continuous Dual Marquee */}
      <div className="pw-marquee-wrapper">
        {/* Left and Right Fade Gradient Masks */}
        <div className="pw-marquee-mask pw-mask-left" aria-hidden="true" />
        <div className="pw-marquee-mask pw-mask-right" aria-hidden="true" />

        {/* Row 1: Leftward Marquee (Continuous Loop) */}
        {topRowReviews.length > 0 && (
          <div className="pw-marquee-row">
            <div className="pw-marquee-track pw-track-left">
              {topRowReviews.map((item, idx) => (
                <TestimonialCard key={`top-1-${item._id || item.name || idx}`} item={item} />
              ))}
            </div>
            <div className="pw-marquee-track pw-track-left" aria-hidden="true">
              {topRowReviews.map((item, idx) => (
                <TestimonialCard key={`top-2-${item._id || item.name || idx}`} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Row 2: Rightward Marquee (Continuous Loop) */}
        {bottomRowReviews.length > 0 && (
          <div className="pw-marquee-row">
            <div className="pw-marquee-track pw-track-right">
              {bottomRowReviews.map((item, idx) => (
                <TestimonialCard key={`bot-1-${item._id || item.name || idx}`} item={item} />
              ))}
            </div>
            <div className="pw-marquee-track pw-track-right" aria-hidden="true">
              {bottomRowReviews.map((item, idx) => (
                <TestimonialCard key={`bot-2-${item._id || item.name || idx}`} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

export default Testimonials;
