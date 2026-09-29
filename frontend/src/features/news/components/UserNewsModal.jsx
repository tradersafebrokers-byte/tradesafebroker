import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper,
  X,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  Check,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import newsService from '../services/news.service.js';
import './UserNewsModal.css';

const PRESET_IMAGES = [
  {
    label: 'Forex & Currencies',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
    category: 'forex',
  },
  {
    label: 'Indian Market (Nifty/Sensex)',
    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
    category: 'indian-market',
  },
  {
    label: 'Crypto & Bitcoin',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    category: 'crypto',
  },
  {
    label: 'Gold & Commodities',
    url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80',
    category: 'commodities',
  },
  {
    label: 'Global Economy & Fed',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    category: 'global',
  },
];

export default function UserNewsModal({ isOpen, onClose, onSuccess, user }) {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'forex',
    tags: '',
    imageUrl: PRESET_IMAGES[0].url,
    source: 'Community Trader Analysis',
    sourceUrl: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePresetSelect = (preset) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: preset.url,
      category: prev.category === 'forex' ? preset.category : prev.category,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Please enter an article title.');
      return;
    }
    if (!formData.summary.trim()) {
      setErrorMsg('Please provide a short summary/excerpt.');
      return;
    }
    if (!formData.content.trim()) {
      setErrorMsg('Please provide the main content / analysis.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      const result = await newsService.createNewsArticle(payload);
      setSuccessMsg('Market analysis published successfully to the live news wire!');
      setTimeout(() => {
        if (onSuccess) onSuccess(result);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to publish user news:', err);
      setErrorMsg(
        err?.response?.data?.message || err?.message || 'Failed to submit article. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="user-news-modal-overlay" onClick={onClose}>
        <motion.div
          className="user-news-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="user-news-modal-header">
            <div className="user-news-header-meta">
              <div className="user-news-badge-icon">
                <Newspaper size={20} />
              </div>
              <div>
                <h3>Share Market Analysis &amp; News</h3>
                <p>Publish real-time insights, chart breakdowns, and forex/crypto updates to the community.</p>
              </div>
            </div>
            <button
              type="button"
              className="user-news-close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="user-news-alert error">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="user-news-alert success">
              <Check size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="user-news-modal-form">
            <div className="user-news-form-grid">
              {/* Title */}
              <div className="user-news-field full-width">
                <label>
                  Headline / Article Title <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Bitcoin Breaks Resistance at $67,500 with Surge in Derivatives Volume"
                  required
                />
              </div>

              {/* Market Category */}
              <div className="user-news-field">
                <label>
                  Category <span className="req">*</span>
                </label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="forex">Forex &amp; Major Pairs (EUR, USD, GBP, JPY)</option>
                  <option value="indian-market">Indian Market (Nifty, Sensex, USD/INR, RBI)</option>
                  <option value="crypto">Crypto &amp; Bitcoin (BTC, ETH, Web3)</option>
                  <option value="commodities">Gold &amp; Commodities (XAU/USD, Crude)</option>
                  <option value="global">Global Macro &amp; Central Banks</option>
                  <option value="brokers">Broker Research &amp; Spreads</option>
                </select>
              </div>

              {/* Tags */}
              <div className="user-news-field">
                <label>Tags (Comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g. Gold, XAU/USD, Breakout, Intraday"
                />
              </div>

              {/* Summary */}
              <div className="user-news-field full-width">
                <label>
                  Short Summary / Excerpt <span className="req">*</span>
                </label>
                <textarea
                  name="summary"
                  rows="2"
                  value={formData.summary}
                  onChange={handleChange}
                  placeholder="1-2 sentences summarizing the trading catalyst, price levels, or news event..."
                  required
                />
              </div>

              {/* Cover Image & Presets */}
              <div className="user-news-field full-width">
                <div className="user-news-field-header-row">
                  <label>Cover Image (Optional)</label>
                  <span className="user-news-presets-hint">Click a theme preset below:</span>
                </div>
                <div className="user-news-image-row">
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="Thumbnail preview" className="user-news-img-preview" />
                  )}
                </div>
                <div className="user-news-presets-pill-list">
                  {PRESET_IMAGES.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className={`user-news-preset-pill ${formData.imageUrl === p.url ? 'active' : ''}`}
                      onClick={() => handlePresetSelect(p)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Content */}
              <div className="user-news-field full-width">
                <label>
                  Detailed Market Analysis / Article Content <span className="req">*</span>
                </label>
                <textarea
                  name="content"
                  rows="6"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Provide your in-depth breakdown. Detail entry/exit points, support & resistance levels, macroeconomic data prints, or market psychology..."
                  required
                />
              </div>

              {/* Source Link */}
              <div className="user-news-field full-width">
                <label>Reference Link / Source URL (Optional)</label>
                <input
                  type="url"
                  name="sourceUrl"
                  value={formData.sourceUrl}
                  onChange={handleChange}
                  placeholder="https://tradingview.com/chart/... or news source"
                />
              </div>
            </div>

            {/* Author Credit Footer */}
            <div className="user-news-author-preview">
              <span className="author-preview-label">Author Attribution:</span>
              <div className="author-preview-chip">
                <span className="author-preview-avatar">
                  {(user?.username || user?.fullName || 'T')[0].toUpperCase()}
                </span>
                <div className="author-preview-info">
                  <span className="author-preview-name">{user?.username || user?.fullName || 'Trader'}</span>
                  <span className="author-preview-role">Community Trader · Verified Member</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="user-news-modal-actions">
              <button
                type="button"
                className="user-news-btn-cancel"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="user-news-btn-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="spin-icon" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Publish to Live Wire</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
