import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper,
  X,
  Sparkles,
  Check,
  TrendingUp,
  Image,
  Globe,
  Radio,
  FileText,
  Clock,
  User,
  Star,
} from 'lucide-react';
import './AdminNewsModal.css';

const PRESET_IMAGES = [
  {
    label: 'Forex FX',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
    category: 'forex',
  },
  {
    label: 'Indian Market',
    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
    category: 'indian-market',
  },
  {
    label: 'Bitcoin Crypto',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    category: 'crypto',
  },
  {
    label: 'Gold / Commodities',
    url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80',
    category: 'commodities',
  },
  {
    label: 'Broker Trading Desk',
    url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80',
    category: 'brokers',
  },
  {
    label: 'Global Economy',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    category: 'global',
  },
];

export default function AdminNewsModal({
  isOpen,
  mode = 'create',
  formData,
  setFormData,
  onClose,
  onSave,
  saving = false,
}) {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const setPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: preset.url,
      category: prev.category === 'forex' ? preset.category : prev.category,
    }));
  };

  return (
    <AnimatePresence>
      <div className="d2-news-modal-overlay" onClick={onClose}>
        <motion.div
          className="d2-news-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="d2-news-modal-header">
            <div className="d2-news-modal-header-left">
              <div className="d2-news-icon-halo">
                <Newspaper size={20} color="#10b981" />
              </div>
              <div>
                <h3>{mode === 'create' ? 'Publish News / Blog Article' : 'Edit News Article'}</h3>
                <p>Articles published here immediately appear on the live /news section and homepage wire.</p>
              </div>
            </div>
            <button className="d2-news-modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSave} className="d2-news-modal-form">
            <div className="d2-news-form-grid">
              {/* Title */}
              <div className="d2-form-group span-2">
                <label>Article Headline / Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. RBI Maintains 6.50% Repo Rate: Rupee Defends 83.40 as Reserves Surge"
                  required
                />
              </div>

              {/* Category */}
              <div className="d2-form-group">
                <label>Market Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="forex">Forex &amp; Major Currencies</option>
                  <option value="indian-market">Indian Market &amp; RBI</option>
                  <option value="crypto">Crypto &amp; Bitcoin</option>
                  <option value="global">Global Macro &amp; Central Banks</option>
                  <option value="commodities">Gold &amp; Commodities</option>
                  <option value="brokers">Broker Research &amp; Spreads</option>
                </select>
              </div>

              {/* Read Time */}
              <div className="d2-form-group">
                <label>Estimated Read Time</label>
                <input
                  type="text"
                  name="readTime"
                  value={formData.readTime}
                  onChange={handleChange}
                  placeholder="e.g. 4 min read"
                />
              </div>

              {/* Summary / Excerpt */}
              <div className="d2-form-group span-2">
                <label>Brief Summary / Excerpt * (Displayed on News Cards)</label>
                <textarea
                  name="summary"
                  rows="2"
                  value={formData.summary}
                  onChange={handleChange}
                  placeholder="1-2 sentences summarizing the key catalyst, figures, and market impact..."
                  required
                />
              </div>

              {/* Image URL & Presets */}
              <div className="d2-form-group span-2">
                <label>Cover Image URL</label>
                <div className="d2-image-input-row">
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="Preview" className="d2-input-preview-thumb" />
                  )}
                </div>
                <div className="d2-presets-row">
                  <span className="d2-presets-label">Quick Presets:</span>
                  {PRESET_IMAGES.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className="d2-preset-pill"
                      onClick={() => setPreset(p)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Content */}
              <div className="d2-form-group span-2">
                <label>Full Article Content * (Supports paragraphs &amp; bullet points)</label>
                <textarea
                  name="content"
                  rows="6"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write the full analytical article here. Use blank lines between paragraphs and bullet points (•) for key takeaways..."
                  required
                />
              </div>

              {/* Source & Source URL */}
              <div className="d2-form-group">
                <label>Source / Publication</label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  placeholder="e.g. Global Financial Wire / Reuters"
                />
              </div>

              <div className="d2-form-group">
                <label>Tags (Comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g. RBI, USD/INR, Nifty, Forex"
                />
              </div>

              {/* Author Details */}
              <div className="d2-form-group">
                <label>Author Name</label>
                <input
                  type="text"
                  name="authorName"
                  value={formData.authorName}
                  onChange={handleChange}
                  placeholder="e.g. Aditya Sharma"
                />
              </div>

              <div className="d2-form-group">
                <label>Author Role</label>
                <input
                  type="text"
                  name="authorRole"
                  value={formData.authorRole}
                  onChange={handleChange}
                  placeholder="e.g. Macro & Currency Strategist"
                />
              </div>

              {/* Checkboxes: Featured & Published */}
              <div className="d2-form-group span-2 d2-toggles-row">
                <label className="d2-checkbox-label">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                  />
                  <span>Pin as <strong>Featured Story</strong> (Highlighted in large hero card)</span>
                </label>

                <label className="d2-checkbox-label">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleChange}
                  />
                  <span><strong>Publish to Live News Feed</strong> immediately</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="d2-news-modal-footer">
              <button type="button" className="d2-btn-cancel" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="d2-btn-publish" disabled={saving}>
                {saving ? (
                  <span>Saving Article...</span>
                ) : (
                  <>
                    <Check size={16} />
                    <span>{mode === 'create' ? 'Publish Article to Live Feed' : 'Save Changes'}</span>
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
