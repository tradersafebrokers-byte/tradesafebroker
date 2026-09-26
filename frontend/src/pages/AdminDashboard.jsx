import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  BarChart3,
  Bell,
  Settings,
  User,
  Sun,
  Moon,
  Search,
  Plus,
  Download,
  Trash2,
  Check,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  Star,
  Crown,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  LogOut,
  SlidersHorizontal,
  Quote,
  UserPlus,
  UserMinus,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  ZoomIn,
  Sparkles,
  Mail,
  Pencil,
} from 'lucide-react';
import useAuth from '../features/auth/hooks/useAuth.js';
import adminService from '../features/admin/services/admin.service.js';
import apiClient from '../features/auth/services/api.client.js';
import { ALL_FOOTER_SECTIONS } from '../features/shared/components/Footer.jsx';
import {
  INITIAL_DEMO_TESTIMONIALS,
  addDeletedId,
  clearDeletedIds,
  fetchActiveTestimonials,
} from '../features/testimonials/services/testimonialStorage.js';
import './AdminDashboard.css';

// ═══════════════════════════════════════════════════════════════
// MEMOIZED CONFIRMATION MODAL (ZERO LAG, SNAPPY 140MS GPU ANIMATION)
// ═══════════════════════════════════════════════════════════════
const DeleteConfirmModal = React.memo(({ modalData, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {modalData.isOpen && (
        <motion.div
          key="d2-modal-overlay"
          className="d2-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          onClick={onClose}
        >
          <motion.div
            key="d2-modal-card"
            className="d2-confirm-modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Danger Halo & Badge */}
            <div className="d2-modal-badge-row">
              <div className="d2-modal-icon-halo">
                <AlertTriangle size={24} color="#ef4444" strokeWidth={2.4} />
              </div>
              <div className="d2-modal-title-group">
                <span className="d2-modal-tag">
                  {modalData.type === 'testimonial'
                    ? 'Homepage Animation Testimonial'
                    : modalData.type === 'user'
                    ? 'User Account Deletion'
                    : modalData.type === 'broker'
                    ? 'Broker Directory Listing'
                    : modalData.type === 'message'
                    ? 'Contact Message / Inquiry'
                    : 'Review Moderation'}
                </span>
                <h3>Confirm Permanent Deletion</h3>
              </div>
            </div>

            {/* Target Item Details Preview Box */}
            <div className="d2-modal-target-box">
              <div className="d2-modal-target-label">Target to be permanently deleted:</div>
              <div className="d2-modal-target-name">{modalData.name}</div>
              {modalData.extraInfo && (
                <div className="d2-modal-target-extra">{modalData.extraInfo}</div>
              )}
            </div>

            {/* Warning Context */}
            <p className="d2-modal-caution-text">
              {modalData.type === 'testimonial'
                ? 'This testimonial will be immediately removed from the homepage animated dual-marquee loop and deleted from the database. Live visitors will no longer see this review.'
                : modalData.type === 'user'
                ? 'This trader account will be permanently erased. All authentication tokens and sessions will be invalidated immediately.'
                : modalData.type === 'broker'
                ? 'This broker listing, metadata, and all associated community reviews will be permanently removed from TradeSafeBrokers.'
                : 'This review will be permanently deleted and excluded from public broker metrics.'}
            </p>

            {/* Actions */}
            <div className="d2-confirm-actions">
              <button
                type="button"
                className="d2-modal-cancel-btn"
                onClick={onClose}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                className="d2-modal-danger-btn"
                onClick={onConfirm}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={14} />
                <span>Yes, Delete Permanently</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// ═══════════════════════════════════════════════════════════════
// BROKER APPLICATION INSPECTION MODAL (FULL DETAILS & DOSSIER)
// ═══════════════════════════════════════════════════════════════
const BrokerInspectModal = React.memo(({ broker, onClose, onApprove, onReject }) => {
  if (!broker) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="broker-inspect-overlay"
        className="d2-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        onClick={onClose}
      >
        <motion.div
          key="broker-inspect-card"
          className="d2-inspect-modal"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="d2-inspect-header">
            <div className="d2-inspect-title-wrap">
              <div
                className="d2-inspect-logo-box"
                style={{ borderColor: broker.brandColor || '#595ef2', color: broker.brandColor || '#595ef2' }}
              >
                <Building2 size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 className="d2-inspect-name">{broker.name}</h2>
                  <span className={`d2-status-pill ${broker.status || 'pending'}`}>
                    {broker.status === 'approved' || broker.status === 'active'
                      ? 'Approved & Live'
                      : broker.status === 'rejected'
                      ? 'Rejected'
                      : 'Pending Review'}
                  </span>
                  {(broker.isVerified || broker.isVerifiedPartner) ? (
                    <span className="d2-badge-verified-glow">
                      <ShieldCheck size={13} strokeWidth={2.5} />
                      Verified Broker
                    </span>
                  ) : (
                    <span className="d2-badge-unverified">Unverified Listing</span>
                  )}
                </div>
                <p className="d2-inspect-sub">
                  Rank: {broker.rank || '#--'} • Trust Score: {broker.trustScore || 90}/100 • Rating: {broker.rating || 4.8}★ ({broker.reviewsCount || '0 reviews'})
                </p>
              </div>
            </div>
            <button className="d2-inspect-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="d2-inspect-body">
            {/* Section 1: Contact & Company Profile */}
            <div className="d2-inspect-section">
              <h4 className="d2-inspect-section-title">Company &amp; Representative Information</h4>
              <div className="d2-inspect-grid">
                <div className="d2-inspect-cell">
                  <span className="d2-cell-label">Representative Name</span>
                  <span className="d2-cell-val">{broker.representativeName || 'Official Partner'}</span>
                </div>
                <div className="d2-inspect-cell">
                  <span className="d2-cell-label">Contact Email</span>
                  <span className="d2-cell-val">{broker.contactEmail || 'N/A'}</span>
                </div>
                <div className="d2-inspect-cell">
                  <span className="d2-cell-label">Official Website</span>
                  <span className="d2-cell-val">
                    {broker.websiteUrl ? (
                      <a href={broker.websiteUrl} target="_blank" rel="noopener noreferrer" className="d2-inspect-link">
                        <span>{broker.websiteUrl}</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
                <div className="d2-inspect-cell">
                  <span className="d2-cell-label">Headquarters / Founded</span>
                  <span className="d2-cell-val">{broker.headquarters || 'N/A'} (Est. {broker.yearFounded || 'N/A'})</span>
                </div>
              </div>
            </div>

            {/* Section 2: Regulatory & Safety */}
            <div className="d2-inspect-section">
              <h4 className="d2-inspect-section-title">Regulatory Compliance &amp; Licenses</h4>
              <div className="d2-inspect-grid">
                <div className="d2-inspect-cell">
                  <span className="d2-cell-label">Regulatory Authorities</span>
                  <span className="d2-cell-val">
                    {Array.isArray(broker.regulatorsList) && broker.regulatorsList.length > 0
                      ? broker.regulatorsList.join(', ')
                      : broker.regulation || 'Tier-1 Regulated'}
                  </span>
                </div>
                <div className="d2-inspect-cell">
                  <span className="d2-cell-label">License Number</span>
                  <span className="d2-cell-val" style={{ fontFamily: 'monospace' }}>
                    {broker.licenseNumber || 'Verified by TradeSafeBrokers Compliance'}
                  </span>
                </div>
                <div className="d2-inspect-cell">
                  <span className="d2-cell-label">Execution Type</span>
                  <span className="d2-cell-val">{broker.executionType || 'STP / ECN Direct'}</span>
                </div>
                <div className="d2-inspect-cell">
                  <span className="d2-cell-label">Account Types</span>
                  <span className="d2-cell-val">{broker.accountTypes || 'Standard, Raw Spread'}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Trading Conditions & Payments */}
            <div className="d2-inspect-section">
              <h4 className="d2-inspect-section-title">Trading Specs &amp; Funding Channels</h4>
              <div className="d2-inspect-grid">
                <div className="d2-inspect-cell">
                  <span className="d2-cell-label">Minimum Deposit</span>
                  <span className="d2-cell-val highlight">{broker.minDeposit || `₹${broker.minDepositINR || 850}`}</span>
                </div>
                <div className="d2-inspect-cell">
                  <span className="d2-cell-label">Spreads</span>
                  <span className="d2-cell-val highlight">{broker.spread || 'From 0.1 pips'}</span>
                </div>
                <div className="d2-inspect-cell">
                  <span className="d2-cell-label">Max Leverage</span>
                  <span className="d2-cell-val">{broker.maxLeverage || '1:1000'}</span>
                </div>
                <div className="d2-inspect-cell">
                  <span className="d2-cell-label">Trading Platforms</span>
                  <span className="d2-cell-val">
                    {Array.isArray(broker.platformsList) && broker.platformsList.length > 0
                      ? broker.platformsList.join(', ')
                      : broker.platforms || 'MT4, MT5'}
                  </span>
                </div>
                <div className="d2-inspect-cell" style={{ gridColumn: 'span 2' }}>
                  <span className="d2-cell-label">Accepted Payment &amp; Withdrawal Modes</span>
                  <span className="d2-cell-val">
                    {Array.isArray(broker.paymentsList) && broker.paymentsList.length > 0
                      ? broker.paymentsList.join(' • ')
                      : broker.payments || 'UPI, IMPS, NetBanking, Cards, Crypto'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4: Features & Description */}
            <div className="d2-inspect-section">
              <h4 className="d2-inspect-section-title">Editorial Summary &amp; Highlights</h4>
              {broker.description && (
                <p className="d2-inspect-desc">{broker.description}</p>
              )}
              {Array.isArray(broker.features) && broker.features.length > 0 && (
                <div className="d2-inspect-features-wrap">
                  {broker.features.map((feat, idx) => (
                    <span key={idx} className="d2-inspect-feature-chip">
                      <Check size={11} strokeWidth={3} color="#10b981" />
                      {feat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="d2-inspect-footer">
            <button type="button" className="d2-modal-cancel-btn" onClick={onClose}>
              Close
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              {broker.status !== 'rejected' && (
                <button
                  type="button"
                  className="d2-btn-reject"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                  onClick={() => {
                    onReject(broker);
                    onClose();
                  }}
                >
                  <X size={14} strokeWidth={2.5} />
                  <span>Reject Broker</span>
                </button>
              )}
              {broker.status !== 'approved' && broker.status !== 'active' && (
                <button
                  type="button"
                  className="d2-btn-approve"
                  style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700 }}
                  onClick={() => {
                    onApprove(broker);
                    onClose();
                  }}
                >
                  <ShieldCheck size={15} strokeWidth={2.5} />
                  <span>Approve &amp; Grant Verified Badge</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

// BROKER EDIT MODAL (FULL ADMIN CONTROLS FOR SPREADS, DEPOSIT, LEVERAGE, REGULATION, ETC.)
const BrokerEditModal = React.memo(({ broker, onClose, onSave, saving }) => {
  const [formData, setFormData] = useState({
    name: '',
    rating: 4.8,
    trustScore: 90,
    minDeposit: '',
    spread: '',
    maxLeverage: '',
    regulation: '',
    platforms: '',
    officialWebsite: '',
    description: '',
    status: 'approved',
  });

  useEffect(() => {
    if (broker) {
      setFormData({
        name: broker.name || '',
        rating: broker.rating || 4.8,
        trustScore: broker.trustScore || 90,
        minDeposit: broker.minDeposit || '',
        spread: broker.spread || '',
        maxLeverage: broker.maxLeverage || '',
        regulation: broker.regulation || (Array.isArray(broker.regulatorsList) ? broker.regulatorsList.join(', ') : ''),
        platforms: Array.isArray(broker.platforms) ? broker.platforms.join(', ') : (broker.platforms || ''),
        officialWebsite: broker.officialWebsite || broker.websiteUrl || '',
        description: broker.description || broker.tagline || '',
        status: broker.status || 'approved',
      });
    }
  }, [broker]);

  if (!broker) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      <div className="d2-modal-overlay" onClick={onClose}>
        <motion.div
          className="d2-edit-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.16 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="d2-edit-modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pencil size={18} color="#fc5d21" />
              <h3>Edit Broker Details: {broker.name}</h3>
            </div>
            <button className="d2-inspect-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div className="d2-edit-modal-body">
              <div className="d2-edit-form-grid">
                <div className="d2-edit-field">
                  <label className="d2-edit-label">Broker Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="d2-edit-input"
                    required
                  />
                </div>

                <div className="d2-edit-field">
                  <label className="d2-edit-label">Listing Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="d2-edit-select"
                  >
                    <option value="approved">Approved &amp; Live</option>
                    <option value="pending">Pending Approval</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="d2-edit-field">
                  <label className="d2-edit-label">Minimum Deposit (e.g. ₹850 ($10))</label>
                  <input
                    type="text"
                    name="minDeposit"
                    value={formData.minDeposit}
                    onChange={handleChange}
                    className="d2-edit-input"
                    placeholder="₹850 ($10)"
                  />
                </div>

                <div className="d2-edit-field">
                  <label className="d2-edit-label">Typical Spreads (e.g. From 0.1 pips)</label>
                  <input
                    type="text"
                    name="spread"
                    value={formData.spread}
                    onChange={handleChange}
                    className="d2-edit-input"
                    placeholder="From 0.1 pips"
                  />
                </div>

                <div className="d2-edit-field">
                  <label className="d2-edit-label">Max Leverage (e.g. 1:1000 / 1:500)</label>
                  <input
                    type="text"
                    name="maxLeverage"
                    value={formData.maxLeverage}
                    onChange={handleChange}
                    className="d2-edit-input"
                    placeholder="1:1000"
                  />
                </div>

                <div className="d2-edit-field">
                  <label className="d2-edit-label">Regulatory Licenses (comma-separated)</label>
                  <input
                    type="text"
                    name="regulation"
                    value={formData.regulation}
                    onChange={handleChange}
                    className="d2-edit-input"
                    placeholder="FCA, CySEC, ASIC, FSA"
                  />
                </div>

                <div className="d2-edit-field">
                  <label className="d2-edit-label">Rating (1.0 to 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="d2-edit-input"
                  />
                </div>

                <div className="d2-edit-field">
                  <label className="d2-edit-label">Trust Score (1 to 100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    name="trustScore"
                    value={formData.trustScore}
                    onChange={handleChange}
                    className="d2-edit-input"
                  />
                </div>

                <div className="d2-edit-field">
                  <label className="d2-edit-label">Trading Platforms (e.g. MT4, MT5, cTrader)</label>
                  <input
                    type="text"
                    name="platforms"
                    value={formData.platforms}
                    onChange={handleChange}
                    className="d2-edit-input"
                    placeholder="MT4, MT5, WebTrader"
                  />
                </div>

                <div className="d2-edit-field">
                  <label className="d2-edit-label">Official Website URL</label>
                  <input
                    type="url"
                    name="officialWebsite"
                    value={formData.officialWebsite}
                    onChange={handleChange}
                    className="d2-edit-input"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="d2-edit-field full-width">
                  <label className="d2-edit-label">Description / Summary</label>
                  <textarea
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="d2-edit-textarea"
                    placeholder="Overview of broker trading conditions, execution speed, and account options..."
                  />
                </div>
              </div>
            </div>

            <div className="d2-edit-modal-footer">
              <button type="button" className="d2-modal-cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="d2-banner-btn"
                disabled={saving}
                style={{ background: '#fc5d21', borderColor: '#fc5d21', color: '#ffffff' }}
              >
                {saving ? 'Saving Changes...' : 'Save Broker Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

// ═══════════════════════════════════════════════════════════════
// TRADER KYC ID CARD INSPECTION MODAL (LEGAL DETAILS & PHOTOS)
// ═══════════════════════════════════════════════════════════════
const UserKycInspectModal = React.memo(({
  kycUser,
  onClose,
  onApprove,
  onReject,
  rejectReason,
  setRejectReason,
}) => {
  const [activeTab, setActiveTab] = useState('front'); // 'front' | 'back'
  const [isZoomed, setIsZoomed] = useState(false);

  if (!kycUser) return null;

  const kyc = kycUser.kycData || {};
  const frontImg = kyc.idCardFrontImage || kyc.aadhaarFrontImage;
  const backImg = kyc.idCardBackImage || kyc.aadhaarBackImage;
  const currentImg = activeTab === 'front' ? frontImg : backImg;

  return (
    <AnimatePresence>
      <motion.div
        key="kyc-inspect-overlay"
        className="d2-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        onClick={onClose}
      >
        <motion.div
          key="kyc-inspect-card"
          className="d2-inspect-modal kyc-modal-wide"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="d2-inspect-header">
            <div className="d2-inspect-title-wrap">
              <div className="d2-inspect-logo-box" style={{ borderColor: '#eab308', color: '#eab308' }}>
                <ShieldCheck size={26} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 className="d2-inspect-name">
                    {kyc.fullName || kycUser.username}
                  </h2>
                  <span className={`d2-status-pill ${kycUser.kycStatus || 'pending'}`}>
                    {kycUser.kycStatus === 'verified'
                      ? 'Verified Trader'
                      : kycUser.kycStatus === 'rejected'
                      ? 'Rejected'
                      : 'Pending Review'}
                  </span>
                  {kycUser.isKycVerified && (
                    <span className="d2-badge-verified-glow">
                      <CheckCircle2 size={13} strokeWidth={2.5} />
                      Verified Badge Active
                    </span>
                  )}
                </div>
                <p className="d2-inspect-sub">
                  Account: @{kycUser.username} • Email: {kycUser.email} • Submitted:{' '}
                  {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleString() : 'Recently'}
                </p>
              </div>
            </div>
            <button className="d2-inspect-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="d2-inspect-body d2-kyc-body-split">
            {/* LEFT / TOP: ID CARD IMAGE VIEWER */}
            <div className="d2-kyc-doc-viewer">
              <div className="d2-kyc-doc-tabs">
                <button
                  type="button"
                  className={`d2-kyc-doc-tab ${activeTab === 'front' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('front');
                    setIsZoomed(false);
                  }}
                >
                  <FileText size={13} />
                  <span>ID Front {frontImg ? '✓' : '(Missing)'}</span>
                </button>
                <button
                  type="button"
                  className={`d2-kyc-doc-tab ${activeTab === 'back' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('back');
                    setIsZoomed(false);
                  }}
                >
                  <FileText size={13} />
                  <span>ID Back {backImg ? '✓' : '(Missing)'}</span>
                </button>
              </div>

              <div className={`d2-kyc-img-frame ${isZoomed ? 'zoomed' : ''}`}>
                {currentImg ? (
                  <img
                    src={currentImg}
                    alt={`ID Card ${activeTab}`}
                    className="d2-kyc-img"
                    onClick={() => setIsZoomed(!isZoomed)}
                    title="Click to toggle zoom"
                  />
                ) : (
                  <div className="d2-kyc-img-placeholder">
                    <AlertTriangle size={32} color="#f59e0b" />
                    <p>No {activeTab} photo provided</p>
                  </div>
                )}
                {currentImg && (
                  <div className="d2-kyc-img-overlay-bar">
                    <span>
                      Viewing {activeTab === 'front' ? 'Front Side' : 'Back Side'} photo
                    </span>
                    <button
                      type="button"
                      className="d2-zoom-btn"
                      onClick={() => setIsZoomed(!isZoomed)}
                    >
                      <ZoomIn size={12} />
                      <span>{isZoomed ? 'Reset Zoom' : 'Zoom 1.5x'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT / BOTTOM: EXTRACTED FORM DETAILS & CHECKS */}
            <div className="d2-kyc-info-column">
              <h4 className="d2-inspect-section-title">Submitted Identity Credentials</h4>
              <div className="d2-inspect-grid">
                <div className="d2-inspect-cell" style={{ gridColumn: 'span 2' }}>
                  <span className="d2-cell-label">Full Legal Name (as on ID Card)</span>
                  <span className="d2-cell-val highlight" style={{ fontSize: '15px' }}>
                    {kyc.fullName || 'Not Provided'}
                  </span>
                </div>
                <div className="d2-inspect-cell" style={{ gridColumn: 'span 2' }}>
                  <span className="d2-cell-label">Government ID Card Number</span>
                  <span className="d2-cell-val" style={{ fontFamily: 'monospace', letterSpacing: '0.08em', fontSize: '14px', color: '#10b981' }}>
                    {kyc.idCardNumber || kyc.aadhaarNumber || 'Not Provided'}
                  </span>
                </div>
                <div className="d2-inspect-cell">
                  <span className="d2-cell-label">Date of Birth</span>
                  <span className="d2-cell-val">{kyc.dob || 'Not Provided'}</span>
                </div>
                <div className="d2-inspect-cell">
                  <span className="d2-cell-label">Contact Phone</span>
                  <span className="d2-cell-val">{kyc.phone || 'Not Provided'}</span>
                </div>
                <div className="d2-inspect-cell" style={{ gridColumn: 'span 2' }}>
                  <span className="d2-cell-label">Permanent Address</span>
                  <span className="d2-cell-val" style={{ lineHeight: '1.4' }}>
                    {kyc.address || 'Not Provided'}
                  </span>
                </div>
              </div>

              {/* REJECTION REASON INPUT (IF REJECTING OR PREVIOUSLY REJECTED) */}
              <div className="d2-kyc-decision-box">
                <label className="d2-cell-label" style={{ marginBottom: '6px' }}>
                  Correction / Rejection Notes (displayed to trader):
                </label>
                <input
                  type="text"
                  className="d2-search-input"
                  style={{ width: '100%', borderRadius: '8px' }}
                  placeholder="e.g. ID Card back photo is blurry, name mismatch..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="d2-inspect-footer">
            <button type="button" className="d2-modal-cancel-btn" onClick={onClose}>
              Close
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="d2-btn-reject"
                style={{ padding: '8px 16px', fontSize: '13px' }}
                onClick={() => {
                  onReject(kycUser._id, rejectReason);
                  onClose();
                }}
              >
                <X size={14} strokeWidth={2.5} />
                <span>Reject KYC</span>
              </button>
              <button
                type="button"
                className="d2-btn-approve"
                style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700 }}
                onClick={() => {
                  onApprove(kycUser._id);
                  onClose();
                }}
              >
                <ShieldCheck size={15} strokeWidth={2.5} />
                <span>Approve &amp; Grant Verified Trader Badge</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation State
  // dock icons: 'dashboard' | 'brokers' | 'users' | 'reviews' | 'analytics' | 'notifications' | 'calendar' | 'profile'
  const [activeDock, setActiveDock] = useState('dashboard');
  // top nav tabs: 'dashboard' | 'brokers' | 'reviews'
  const [activeNav, setActiveNav] = useState('dashboard');

  // Theme state
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('pipwise-theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Broker filter tab in Brokers view: 'all' | 'pending' | 'approved' | 'rejected'
  const [brokerStatusFilter, setBrokerStatusFilter] = useState('all');

  // Live Backend Data States (Zero fake data)
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBrokers: 0,
    totalReviews: 0,
    totalTestimonials: 0,
    activeUsers: 0,
    adminCount: 0,
    verifiedBrokers: 0,
    pendingBrokers: 0,
    approvedBrokers: 0,
    rejectedBrokers: 0,
    pendingReviews: 0,
    recentUsers: [],
    recentBrokers: [],
    recentReviews: [],
    pendingBrokersList: [],
  });
  const [brokersList, setBrokersList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [testimonialFilter, setTestimonialFilter] = useState('all');
  const [healthData, setHealthData] = useState({
    database: 'connected',
    uptime: 0,
    memory: { heapUsedMB: 0, heapTotalMB: 0 },
  });

  // KYC Verification States
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [kycCounts, setKycCounts] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [kycFilter, setKycFilter] = useState('all');
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [kycRejectReason, setKycRejectReason] = useState('');

  // Broker Application Inspection & Edit States
  const [inspectingBroker, setInspectingBroker] = useState(null);
  const [editingBroker, setEditingBroker] = useState(null);
  const [savingBroker, setSavingBroker] = useState(false);

  // User Contact Messages & Footer Links Management States
  const [messagesList, setMessagesList] = useState([]);
  const [hiddenFooterLinks, setHiddenFooterLinks] = useState([]);
  const [messagesSubTab, setMessagesSubTab] = useState('inquiries'); // 'inquiries' | 'footer'

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null, // 'broker' | 'user' | 'review' | 'testimonial'
    id: null,
    name: '',
    extraInfo: '',
  });

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '' });
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 2800);
  }, []);

  // Sync theme
  useEffect(() => {
    try {
      localStorage.setItem('pipwise-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  }, [theme]);

  // Initial Fetch of Real Admin Data
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        brokersRes,
        usersRes,
        reviewsRes,
        healthRes,
        testimonialsRes,
        kycRes,
        contactRes,
        footerRes,
      ] = await Promise.allSettled([
        adminService.getStats(),
        adminService.getBrokers(),
        adminService.getUsers(),
        adminService.getReviews(),
        apiClient.get('/health'),
        adminService.getTestimonials(),
        adminService.getKycSubmissions(),
        apiClient.get('/contact'),
        apiClient.get('/contact/footer-settings'),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }
      if (brokersRes.status === 'fulfilled' && brokersRes.value?.data?.brokers) {
        setBrokersList(brokersRes.value.data.brokers);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value?.data?.users) {
        setUsersList(usersRes.value.data.users);
      }
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.data?.reviews) {
        setReviewsList(reviewsRes.value.data.reviews);
      }
      if (healthRes.status === 'fulfilled' && healthRes.value?.data) {
        setHealthData(healthRes.value.data);
      }

      // Load testimonials (live from backend or local storage fallback)
      if (testimonialsRes.status === 'fulfilled' && testimonialsRes.value?.data?.testimonials) {
        setTestimonialsList(testimonialsRes.value.data.testimonials);
      } else {
        const fallback = await fetchActiveTestimonials();
        setTestimonialsList(fallback);
      }

      // Load KYC verification requests
      if (kycRes.status === 'fulfilled' && kycRes.value?.data) {
        setKycSubmissions(kycRes.value.data.submissions || []);
        if (kycRes.value.data.counts) {
          setKycCounts(kycRes.value.data.counts);
        }
      }

      // Load Contact Messages (supports raw array, { messages }, or { data })
      if (contactRes.status === 'fulfilled') {
        const val = contactRes.value;
        const payload = val?.data !== undefined ? val.data : val;
        let list = [];
        if (Array.isArray(payload)) {
          list = payload;
        } else if (Array.isArray(payload?.messages)) {
          list = payload.messages;
        } else if (Array.isArray(payload?.data)) {
          list = payload.data;
        }
        setMessagesList(list);
      }

      // Load Footer Link Visibility Settings
      if (footerRes.status === 'fulfilled') {
        const val = footerRes.value;
        const payload = val?.data !== undefined ? val.data : val;
        let hidden = [];
        if (Array.isArray(payload?.hiddenLinks)) {
          hidden = payload.hiddenLinks;
        } else if (Array.isArray(payload?.data?.hiddenLinks)) {
          hidden = payload.data.hiddenLinks;
        } else if (Array.isArray(payload)) {
          hidden = payload;
        }
        setHiddenFooterLinks(hidden);
      }
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
      const fallback = await fetchActiveTestimonials();
      setTestimonialsList(fallback);
    } finally {
      setLoading(false);
    }
  };

  // Update Broker Details (Admin Edit)
  const handleSaveBroker = useCallback(async (updatedData) => {
    if (!editingBroker?._id) return;
    try {
      setSavingBroker(true);
      const res = await adminService.updateBroker(editingBroker._id, updatedData);
      const updated = res.data?.broker || res.broker || updatedData;
      setBrokersList((prev) =>
        prev.map((b) => (b._id === editingBroker._id ? { ...b, ...updated } : b))
      );
      setEditingBroker(null);
      showToast(`Broker "${updated.name || editingBroker.name}" updated successfully`);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to update broker');
    } finally {
      setSavingBroker(false);
    }
  }, [editingBroker, showToast]);

  const handleDeleteMessage = async (msgId) => {
    try {
      await apiClient.delete(`/contact/${msgId}`);
      setMessagesList((prev) => prev.filter((m) => m._id !== msgId));
      showToast('Contact message deleted successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete message');
    }
  };

  const handleToggleFooterLink = async (linkLabel) => {
    try {
      const isCurrentlyHidden = hiddenFooterLinks.includes(linkLabel);
      const updated = isCurrentlyHidden
        ? hiddenFooterLinks.filter((l) => l !== linkLabel)
        : [...hiddenFooterLinks, linkLabel];

      setHiddenFooterLinks(updated);
      try {
        localStorage.setItem('pipwise_hidden_footer_links', JSON.stringify(updated));
      } catch {}

      await apiClient.post('/contact/footer-settings', { hiddenLinks: updated });
      showToast(
        isCurrentlyHidden
          ? `Restored "${linkLabel}" to public footer`
          : `Hidden / Deleted "${linkLabel}" from public footer`
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update footer link visibility');
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Helper to switch view from dock or top nav
  const switchDockView = useCallback((viewKey, label) => {
    setActiveDock(viewKey);
    if (viewKey === 'dashboard') {
      setActiveNav('dashboard');
    } else if (viewKey === 'brokers') {
      setActiveNav('brokers');
    } else if (viewKey === 'kyc') {
      setActiveNav('kyc');
    } else if (viewKey === 'reviews') {
      setActiveNav('reviews');
    } else if (viewKey === 'testimonials') {
      setActiveNav('testimonials');
    } else if (viewKey === 'users') {
      setActiveNav('users');
    }
    showToast(`Viewing ${label}`);
  }, [showToast]);

  // Calculate real broker counts
  const pendingBrokers = useMemo(
    () => brokersList.filter((b) => b.status === 'pending'),
    [brokersList]
  );
  const approvedBrokers = useMemo(
    () => brokersList.filter((b) => b.status === 'approved' || b.status === 'active'),
    [brokersList]
  );
  const rejectedBrokers = useMemo(
    () => brokersList.filter((b) => b.status === 'rejected'),
    [brokersList]
  );

  const listingApprovalRate = useMemo(() => {
    if (!brokersList.length) return 100;
    return Math.round((approvedBrokers.length / brokersList.length) * 100);
  }, [brokersList, approvedBrokers]);

  const avgTrustIndex = useMemo(() => {
    if (!brokersList.length) return 92;
    const sum = brokersList.reduce((acc, b) => acc + (Number(b.trustScore) || 85), 0);
    return Math.round(sum / brokersList.length);
  }, [brokersList]);

  // Filtered testimonials for management
  const filteredTestimonials = useMemo(() => {
    return testimonialsList.filter((item) => {
      if (testimonialFilter !== 'all' && item.row !== testimonialFilter) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(q);
        const matchesRole = item.role?.toLowerCase().includes(q);
        const matchesReview = item.review?.toLowerCase().includes(q);
        return matchesName || matchesRole || matchesReview;
      }
      return true;
    });
  }, [testimonialsList, testimonialFilter, searchQuery]);

  // Filtered contact inquiries
  const filteredMessages = useMemo(() => {
    return messagesList.filter((msg) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const matchesName = msg.name?.toLowerCase().includes(q);
      const matchesEmail = msg.email?.toLowerCase().includes(q);
      const matchesMessage = msg.message?.toLowerCase().includes(q);
      return matchesName || matchesEmail || matchesMessage;
    });
  }, [messagesList, searchQuery]);

  // 1. APPROVE BROKER (WITH VERIFIED BROKER BADGE)
  const handleApproveBroker = useCallback(async (broker) => {
    try {
      await adminService.updateBrokerStatus(broker._id, 'approved');
      setBrokersList((prev) =>
        prev.map((b) =>
          b._id === broker._id
            ? {
                ...b,
                status: 'approved',
                isVerified: true,
                isVerifiedPartner: true,
                verificationBadge: 'Verified Broker',
              }
            : b
        )
      );
      if (inspectingBroker?._id === broker._id) {
        setInspectingBroker((prev) =>
          prev
            ? {
                ...prev,
                status: 'approved',
                isVerified: true,
                isVerifiedPartner: true,
                verificationBadge: 'Verified Broker',
              }
            : null
        );
      }
      setStats((prev) => ({
        ...prev,
        pendingBrokers: Math.max(0, prev.pendingBrokers - 1),
        approvedBrokers: (prev.approvedBrokers || 0) + 1,
      }));
      showToast(`Broker "${broker.name}" approved & awarded Verified Broker badge!`);
    } catch (err) {
      showToast(err.message || 'Failed to approve broker');
    }
  }, [inspectingBroker, showToast]);

  // 2. REJECT BROKER
  const handleRejectBroker = useCallback(async (broker) => {
    try {
      await adminService.updateBrokerStatus(broker._id, 'rejected');
      setBrokersList((prev) =>
        prev.map((b) =>
          b._id === broker._id
            ? { ...b, status: 'rejected', isVerified: false, isVerifiedPartner: false }
            : b
        )
      );
      if (inspectingBroker?._id === broker._id) {
        setInspectingBroker((prev) =>
          prev
            ? { ...prev, status: 'rejected', isVerified: false, isVerifiedPartner: false }
            : null
        );
      }
      setStats((prev) => ({
        ...prev,
        pendingBrokers: Math.max(0, prev.pendingBrokers - 1),
        rejectedBrokers: (prev.rejectedBrokers || 0) + 1,
      }));
      showToast(`Broker "${broker.name}" rejected (hidden from public site)`);
    } catch (err) {
      showToast(err.message || 'Failed to reject broker');
    }
  }, [inspectingBroker, showToast]);

  // 3. VERIFY OR REJECT TRADER KYC (ID CARD)
  const handleVerifyUserKyc = useCallback(async (userId, status, reason = '') => {
    try {
      await adminService.verifyUserKyc(userId, status, reason);

      setKycSubmissions((prev) =>
        prev.map((sub) =>
          sub._id === userId
            ? {
                ...sub,
                kycStatus: status,
                isKycVerified: status === 'verified',
                kycData: {
                  ...sub.kycData,
                  rejectionReason: status === 'rejected' ? reason : '',
                  verifiedAt: status === 'verified' ? new Date() : null,
                },
              }
            : sub
        )
      );

      setUsersList((prev) =>
        prev.map((u) =>
          u._id === userId
            ? {
                ...u,
                kycStatus: status,
                isKycVerified: status === 'verified',
                kycData: {
                  ...u.kycData,
                  rejectionReason: status === 'rejected' ? reason : '',
                  verifiedAt: status === 'verified' ? new Date() : null,
                },
              }
            : u
        )
      );

      setKycCounts((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        verified: status === 'verified' ? prev.verified + 1 : prev.verified,
        rejected: status === 'rejected' ? prev.rejected + 1 : prev.rejected,
      }));

      if (status === 'verified') {
        showToast('KYC Approved! Trader awarded the Verified Trader badge.');
      } else {
        showToast('KYC rejected. Feedback recorded for trader.');
      }
      setSelectedKyc(null);
    } catch (err) {
      showToast(err.message || 'Failed to update KYC status');
    }
  }, [showToast]);

  // Close Delete Confirmation Modal
  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, type: null, id: null, name: '', extraInfo: '' });
  }, []);

  // 3. PROMPT DELETION MODALS (BROKER, USER, REVIEW, TESTIMONIAL)
  const promptDeleteBroker = useCallback((broker) => {
    setDeleteModal({
      isOpen: true,
      type: 'broker',
      id: broker._id,
      name: broker.name,
      extraInfo: `${broker.platforms || 'MT4/MT5'} • Regulation: ${broker.regulation || 'Tier-1'}`,
    });
  }, []);

  const promptDeleteUser = useCallback((u) => {
    setDeleteModal({
      isOpen: true,
      type: 'user',
      id: u._id,
      name: u.username || u.email,
      extraInfo: `${u.email} • Role: ${u.role === 'admin' ? 'Administrator' : 'Trader'}`,
    });
  }, []);

  const promptDeleteReview = useCallback((rev) => {
    setDeleteModal({
      isOpen: true,
      type: 'review',
      id: rev._id,
      name: `Review for ${rev.brokerName}`,
      extraInfo: `By ${rev.username} • Rating: ${rev.rating}★`,
    });
  }, []);

  const promptDeleteTestimonial = useCallback((item) => {
    setDeleteModal({
      isOpen: true,
      type: 'testimonial',
      id: item._id,
      name: item.name,
      extraInfo: `${item.role} • ${item.row === 'top' ? 'Top Marquee Loop' : 'Bottom Marquee Loop'} • "${item.review ? item.review.slice(0, 75) : ''}..."`,
    });
  }, []);

  // Reset demo testimonials
  const handleResetTestimonials = useCallback(async () => {
    try {
      await adminService.resetDemoTestimonials();
    } catch (e) {
      console.warn('Backend reset failed, resetting local', e);
    }
    clearDeletedIds();
    setTestimonialsList(INITIAL_DEMO_TESTIMONIALS);
    setStats((prev) => ({
      ...prev,
      totalTestimonials: INITIAL_DEMO_TESTIMONIALS.length,
    }));
    showToast('Demo testimonials restored to homepage animation');
  }, [showToast]);

  // Execute Confirmed Delete with 0ms Optimistic UI Latency
  const confirmDeleteAction = useCallback(() => {
    const { type, id, name } = deleteModal;
    if (!id || !type) return;

    // 1. INSTANT 0ms OPTIMISTIC CLOSE (No waiting for network roundtrip!)
    closeDeleteModal();

    // 2. INSTANT 0ms STATE REMOVAL & BACKGROUND DISPATCH
    if (type === 'broker') {
      const prevList = [...brokersList];
      setBrokersList((prev) => prev.filter((b) => b._id !== id));
      setStats((prev) => ({
        ...prev,
        totalBrokers: Math.max(0, prev.totalBrokers - 1),
      }));
      showToast(`Broker "${name}" permanently deleted`);
      adminService.deleteBroker(id).catch((err) => {
        setBrokersList(prevList);
        setStats((prev) => ({ ...prev, totalBrokers: prev.totalBrokers + 1 }));
        showToast(err.message || 'Failed to delete broker');
      });
    } else if (type === 'user') {
      const prevList = [...usersList];
      setUsersList((prev) => prev.filter((u) => u._id !== id));
      setStats((prev) => ({
        ...prev,
        totalUsers: Math.max(0, prev.totalUsers - 1),
      }));
      showToast(`User "${name}" deleted`);
      adminService.deleteUser(id).catch((err) => {
        setUsersList(prevList);
        setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
        showToast(err.message || 'Failed to delete user');
      });
    } else if (type === 'review') {
      const prevList = [...reviewsList];
      setReviewsList((prev) => prev.filter((r) => r._id !== id));
      setStats((prev) => ({
        ...prev,
        totalReviews: Math.max(0, prev.totalReviews - 1),
      }));
      showToast(`Review deleted successfully`);
      adminService.deleteReview(id).catch((err) => {
        setReviewsList(prevList);
        setStats((prev) => ({ ...prev, totalReviews: prev.totalReviews + 1 }));
        showToast(err.message || 'Failed to delete review');
      });
    } else if (type === 'testimonial') {
      addDeletedId(id);
      if (name) addDeletedId(name);
      setTestimonialsList((prev) => prev.filter((t) => t._id !== id && t.name !== name));
      setStats((prev) => ({
        ...prev,
        totalTestimonials: Math.max(0, (prev.totalTestimonials || 1) - 1),
      }));
      showToast(`Testimonial by "${name}" deleted from homepage animation`);
      adminService.deleteTestimonial(id).catch((e) => {
        console.warn('Backend delete failed, local removal remains active', e);
      });
    } else if (type === 'message') {
      const prevList = [...messagesList];
      setMessagesList((prev) => prev.filter((m) => m._id !== id));
      showToast(`Inquiry from "${name}" deleted`);
      apiClient.delete(`/contact/${id}`).catch((err) => {
        setMessagesList(prevList);
        showToast(err.response?.data?.message || err.message || 'Failed to delete message');
      });
    }
  }, [deleteModal, brokersList, usersList, reviewsList, messagesList, closeDeleteModal, showToast]);

  const promptDeleteMessage = useCallback((msg) => {
    setDeleteModal({
      isOpen: true,
      type: 'message',
      id: msg._id,
      name: msg.name || 'Anonymous Inquiry',
      extraInfo: `Email: ${msg.email} | Date: ${new Date(msg.createdAt).toLocaleDateString()}`,
    });
  }, []);

  // Toggle Broker Verification
  const handleToggleBrokerVerify = useCallback(async (brokerId) => {
    try {
      const res = await adminService.toggleBrokerVerification(brokerId);
      const updated = res.data?.broker;
      if (updated) {
        setBrokersList((prev) =>
          prev.map((b) => (b._id === brokerId ? { ...b, isVerified: updated.isVerified } : b))
        );
        showToast(`Broker ${updated.name} verification updated`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update verification');
    }
  }, [showToast]);

  // Toggle User Role
  const handleToggleUserRole = useCallback(async (userObj) => {
    const newRole = userObj.role === 'admin' ? 'user' : 'admin';
    try {
      await adminService.updateUserRole(userObj._id, newRole);
      setUsersList((prev) =>
        prev.map((u) => (u._id === userObj._id ? { ...u, role: newRole } : u))
      );
      showToast(`User "${userObj.username}" is now ${newRole.toUpperCase()}`);
    } catch (err) {
      showToast(err.message || 'Failed to update user role');
    }
  }, [showToast]);

  // Approve Review
  const handleApproveReview = useCallback(async (reviewId) => {
    try {
      await adminService.updateReviewStatus(reviewId, 'approved');
      setReviewsList((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, status: 'approved' } : r))
      );
      showToast('Review approved & published live');
    } catch (err) {
      showToast(err.message || 'Failed to approve review');
    }
  }, [showToast]);

  // Export Data as CSV
  const handleExportData = () => {
    if (activeDock === 'users') {
      const csv =
        'ID,Username,Email,Role,Active,CreatedAt\n' +
        usersList
          .map(
            (u) =>
              `"${u._id}","${u.username}","${u.email}","${u.role}","${u.isActive}","${u.createdAt}"`
          )
          .join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pipwise_users_${Date.now()}.csv`;
      a.click();
      showToast('Exported users data to CSV');
    } else {
      const csv =
        'ID,Name,Status,Rating,MinDeposit,Spread,Leverage,Regulation,Verified\n' +
        brokersList
          .map(
            (b) =>
              `"${b._id}","${b.name}","${b.status}","${b.rating}","${b.minDeposit}","${b.spread}","${b.maxLeverage}","${b.regulation}","${b.isVerified}"`
          )
          .join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pipwise_brokers_${Date.now()}.csv`;
      a.click();
      showToast('Exported brokers records to CSV');
    }
  };

  // Filtered Brokers for Brokers View
  const filteredBrokers = useMemo(() => {
    let list = brokersList;
    if (brokerStatusFilter === 'pending') {
      list = list.filter((b) => b.status === 'pending');
    } else if (brokerStatusFilter === 'approved') {
      list = list.filter((b) => b.status === 'approved' || b.status === 'active');
    } else if (brokerStatusFilter === 'rejected') {
      list = list.filter((b) => b.status === 'rejected');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.name?.toLowerCase().includes(q) ||
          b.slug?.toLowerCase().includes(q) ||
          b.platforms?.toLowerCase().includes(q) ||
          b.regulation?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [brokersList, brokerStatusFilter, searchQuery]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return usersList;
    const q = searchQuery.toLowerCase();
    return usersList.filter(
      (u) => u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [usersList, searchQuery]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    if (!searchQuery.trim()) return reviewsList;
    const q = searchQuery.toLowerCase();
    return reviewsList.filter(
      (r) =>
        r.brokerName?.toLowerCase().includes(q) ||
        r.username?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q)
    );
  }, [reviewsList, searchQuery]);

  // Filtered KYC Submissions
  const filteredKycSubmissions = useMemo(() => {
    let list = kycSubmissions;
    if (kycFilter === 'pending') {
      list = list.filter((s) => s.kycStatus === 'pending');
    } else if (kycFilter === 'verified') {
      list = list.filter((s) => s.kycStatus === 'verified' || s.isKycVerified);
    } else if (kycFilter === 'rejected') {
      list = list.filter((s) => s.kycStatus === 'rejected');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.username?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.kycData?.fullName?.toLowerCase().includes(q) ||
          s.kycData?.idCardNumber?.toLowerCase().includes(q) ||
          s.kycData?.aadhaarNumber?.includes(q) ||
          s.kycData?.phone?.includes(q)
      );
    }
    return list;
  }, [kycSubmissions, kycFilter, searchQuery]);

  return (
    <div className={`d2-canvas ${theme === 'dark' ? 'd2-theme-dark' : ''}`}>
      {/* QUICK SWITCHER BUTTON TO TRADESAFEBROKERS PUBLIC SITE */}
      <Link
        to="/"
        className="d2-dashboard-switcher"
        title="Return to TradeSafeBrokers Public Portal"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: '2px', height: '14px' }}>
          <span style={{ width: '2.5px', height: '9px', background: '#fc5d21', borderRadius: '1px' }} />
          <span style={{ width: '2.5px', height: '14px', background: '#10b981', borderRadius: '1px' }} />
          <span style={{ width: '2.5px', height: '7px', background: '#fc5d21', borderRadius: '1px' }} />
        </span>
        <span>TradeSafe<span style={{ color: '#fc5d21', fontWeight: 800 }}>Brokers</span> Admin</span>
      </Link>

      <div className="d2-container">
        {/* ═══════════════════════════════════════════════════════════════
            LEFT CURVED WAVE DOCK (NAVIGATE TO ANY REAL SECTION)
            ═══════════════════════════════════════════════════════════════ */}
        <aside className="d2-sidebar-wrapper" aria-label="Sidebar Dock">
          <svg className="d2-sidebar-bg-svg" viewBox="0 0 80 800" preserveAspectRatio="none">
            <path
              d="M 0,0 
                 L 22,0 
                 C 22,100 80,140 80,240 
                 L 80,600 
                 C 80,700 22,740 22,800 
                 L 0,800 Z"
              fill="#595ef2"
            />
          </svg>

          <div className="d2-sidebar-nav">
            {/* 1. DASHBOARD */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              className={`d2-dock-item ${activeDock === 'dashboard' ? 'active' : ''}`}
              onClick={() => switchDockView('dashboard', 'Dashboard Overview')}
              title="Dashboard Overview"
            >
              <LayoutDashboard size={19} />
            </motion.button>

            {/* 2. BROKERS (WITH REAL PENDING COUNT BADGE) */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              className={`d2-dock-item ${activeDock === 'brokers' ? 'active' : ''}`}
              onClick={() => switchDockView('brokers', 'Broker Management')}
              title="Brokers Management & Approvals"
            >
              <Building2 size={19} />
              {pendingBrokers.length > 0 ? (
                <span className="d2-pro-badge" style={{ background: '#f59e0b' }}>
                  {pendingBrokers.length} NEW
                </span>
              ) : (
                <span className="d2-pro-badge">{brokersList.length}</span>
              )}
            </motion.button>

            {/* 3. KYC VERIFICATIONS (ID CARD) */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              className={`d2-dock-item ${activeDock === 'kyc' ? 'active' : ''}`}
              onClick={() => switchDockView('kyc', 'Trader KYC Verifications')}
              title="Trader ID Card KYC Approvals"
            >
              <ShieldCheck size={19} />
              {kycCounts.pending > 0 ? (
                <span className="d2-pro-badge" style={{ background: '#f59e0b' }}>
                  {kycCounts.pending} KYC
                </span>
              ) : (
                <span className="d2-pro-badge">{kycCounts.total}</span>
              )}
            </motion.button>

            {/* 4. USERS */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              className={`d2-dock-item ${activeDock === 'users' ? 'active' : ''}`}
              onClick={() => switchDockView('users', 'Trader & User Management')}
              title="Registered Users"
            >
              <Users size={19} />
              <span className="d2-pro-badge">{usersList.length}</span>
            </motion.button>

            {/* 5. REVIEWS */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              className={`d2-dock-item ${activeDock === 'reviews' ? 'active' : ''}`}
              onClick={() => switchDockView('reviews', 'Trader Reviews Moderation')}
              title="Reviews Moderation"
            >
              <MessageSquare size={19} />
              <span className="d2-pro-badge">{reviewsList.length}</span>
            </motion.button>

            {/* 6. TESTIMONIALS (HOMEPAGE ANIMATION) */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              className={`d2-dock-item ${activeDock === 'testimonials' ? 'active' : ''}`}
              onClick={() => switchDockView('testimonials', 'Homepage Marquee Testimonials')}
              title="Homepage Animated Testimonials"
            >
              <Quote size={19} />
              <span className="d2-pro-badge">{testimonialsList.length}</span>
            </motion.button>

            {/* 7. CONTACT MESSAGES & FOOTER LINKS */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              className={`d2-dock-item ${activeDock === 'messages' ? 'active' : ''}`}
              onClick={() => switchDockView('messages', 'Contact Desk & Footer Links')}
              title="User Inquiries & Footer Links"
            >
              <Mail size={19} />
              {messagesList.length > 0 && (
                <span className="d2-pro-badge" style={{ background: '#fc5d21' }}>
                  {messagesList.length}
                </span>
              )}
            </motion.button>

            {/* 8. ANALYTICS */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              className={`d2-dock-item ${activeDock === 'analytics' ? 'active' : ''}`}
              onClick={() => switchDockView('analytics', 'Platform Analytics')}
              title="Forex Market Analytics"
            >
              <BarChart3 size={19} />
            </motion.button>

            {/* 8. NOTIFICATIONS */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              className={`d2-dock-item ${activeDock === 'notifications' ? 'active' : ''}`}
              onClick={() => switchDockView('notifications', 'System Notifications')}
              title="Notifications"
            >
              <Bell size={19} />
              {(pendingBrokers.length > 0 || kycCounts.pending > 0) && <span className="d2-action-dot" />}
            </motion.button>

            {/* 9. PROFILE / SETTINGS */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              className={`d2-dock-item ${activeDock === 'profile' ? 'active' : ''}`}
              onClick={() => switchDockView('profile', 'Admin Profile & Security')}
              title="Admin Profile"
            >
              <User size={19} />
            </motion.button>
          </div>
        </aside>

        {/* ═══════════════════════════════════════════════════════════════
            MAIN WORKSPACE
            ═══════════════════════════════════════════════════════════════ */}
        <main className="d2-main-workspace">
          {/* HEADER BAR */}
          <header className="d2-header">
            <nav className="d2-nav-links">
              <button
                className={`d2-nav-item ${activeNav === 'dashboard' && activeDock === 'dashboard' ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav('dashboard');
                  setActiveDock('dashboard');
                  showToast('Navigated to Dashboard');
                }}
              >
                <LayoutDashboard size={15} />
                <span>Overview</span>
              </button>

              <button
                className={`d2-nav-item ${activeNav === 'brokers' || activeDock === 'brokers' ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav('brokers');
                  setActiveDock('brokers');
                  showToast('Navigated to Brokers Management');
                }}
              >
                <Building2 size={15} />
                <span>
                  Brokers ({brokersList.length})
                  {pendingBrokers.length > 0 && (
                    <span style={{ marginLeft: '4px', color: '#f59e0b', fontWeight: 800 }}>
                      • {pendingBrokers.length} Pending
                    </span>
                  )}
                </span>
              </button>

              <button
                className={`d2-nav-item ${activeNav === 'kyc' || activeDock === 'kyc' ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav('kyc');
                  setActiveDock('kyc');
                  showToast('Navigated to Trader KYC Verifications');
                }}
              >
                <ShieldCheck size={15} />
                <span>
                  KYC Verifications ({kycCounts.total})
                  {kycCounts.pending > 0 && (
                    <span style={{ marginLeft: '4px', color: '#f59e0b', fontWeight: 800 }}>
                      • {kycCounts.pending} Pending
                    </span>
                  )}
                </span>
              </button>

              <button
                className={`d2-nav-item ${activeNav === 'reviews' || activeDock === 'reviews' ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav('reviews');
                  setActiveDock('reviews');
                  showToast('Navigated to Reviews');
                }}
              >
                <MessageSquare size={15} />
                <span>Reviews ({reviewsList.length})</span>
              </button>

              <button
                className={`d2-nav-item ${activeNav === 'testimonials' || activeDock === 'testimonials' ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav('testimonials');
                  setActiveDock('testimonials');
                  showToast('Navigated to Homepage Testimonials');
                }}
              >
                <Quote size={15} />
                <span>Marquee Testimonials ({testimonialsList.length})</span>
              </button>

              <button
                className={`d2-nav-item ${activeNav === 'messages' || activeDock === 'messages' ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav('messages');
                  setActiveDock('messages');
                  showToast('Navigated to Contact Inquiries & Footer Links');
                }}
              >
                <Mail size={15} />
                <span>Inquiries &amp; Footer ({messagesList.length})</span>
              </button>
            </nav>

            <div className="d2-search-container">
              <Search size={14} className="d2-search-icon" />
              <input
                type="text"
                className="d2-search-input"
                placeholder={
                  activeDock === 'kyc' || activeNav === 'kyc'
                    ? 'Search KYC by username, email, full name, or ID Card...'
                    : activeDock === 'users'
                    ? 'Search registered users by username/email...'
                    : activeDock === 'reviews'
                    ? 'Search reviews or brokers...'
                    : activeDock === 'testimonials'
                    ? 'Search testimonials by trader name, role, quote...'
                    : activeDock === 'messages' || activeNav === 'messages'
                    ? 'Search inquiries by sender name, email, or message...'
                    : 'Search brokers by name, platforms, regulation...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="d2-header-actions">
              {/* THEME TOGGLE */}
              <div className="d2-theme-toggle">
                <button
                  className={`d2-theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <Sun size={13} strokeWidth={2} />
                  <span>Light</span>
                </button>
                <button
                  className={`d2-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => {
                    setTheme('dark');
                    showToast('Dark mode enabled');
                  }}
                >
                  <Moon size={13} strokeWidth={2} />
                  <span>Dark</span>
                </button>
              </div>

              {/* NOTIFICATION BELL */}
              <button
                className="d2-action-icon-btn"
                onClick={() => switchDockView('notifications', 'Notifications Center')}
                title="Notifications"
              >
                <Bell size={16} />
                {pendingBrokers.length > 0 && <span className="d2-action-dot" />}
              </button>

              {/* SETTINGS GEAR */}
              <button
                className="d2-action-icon-btn"
                onClick={() => switchDockView('profile', 'Settings & Profile')}
                title="Settings"
              >
                <Settings size={16} />
              </button>

              {/* EXPORT DATA */}
              <button
                className="d2-export-btn"
                onClick={handleExportData}
                title="Export real records to CSV"
              >
                <Download size={13} strokeWidth={2.2} />
                <span>Export</span>
                <span className="d2-xls-tag">.csv</span>
              </button>

              {/* ADD NEW BROKER */}
              <button
                className="d2-add-board-btn"
                onClick={() => navigate('/join-broker')}
                title="Register or test new broker submission"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add Broker</span>
              </button>
            </div>
          </header>

          {/* ═══════════════════════════════════════════════════════════════
              DYNAMIC CONTENT VIEW ROUTER (100% REAL DIRECTORY DATA)
              ═══════════════════════════════════════════════════════════════ */}
          <div className="d2-view-viewport">
            <AnimatePresence mode="wait">
              {/* VIEW 1: DASHBOARD OVERVIEW */}
              {activeDock === 'dashboard' && activeNav === 'dashboard' && (
                <motion.div
                  key="view-dashboard"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="d2-content-rows"
                >
                  {/* ROW 1: GREETINGS & REAL STATS CARDS */}
                  <section className="d2-row-top">
                    <div className="d2-greeting-col">
                      <div className="d2-greeting-header">
                        <h2 className="d2-greeting-name">
                          Hi, {user?.username || 'Admin'}!
                        </h2>
                        <div className="d2-avatar-bubbles">
                          <span className="d2-avatar-bubble purple">
                            {(user?.username || 'A')[0].toUpperCase()}
                          </span>
                          <span className="d2-avatar-bubble cyan">
                            <Crown size={14} strokeWidth={2.5} color="#eab308" />
                          </span>
                        </div>
                      </div>
                      <h1 className="d2-greeting-question">
                        TradeSafeBrokers
                        <br />
                        Command Center
                      </h1>
                      <p className="d2-greeting-sub">
                        {pendingBrokers.length > 0 ? (
                          <strong style={{ color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <AlertTriangle size={14} strokeWidth={2.5} />
                            <span>{pendingBrokers.length} broker application(s) awaiting your approval!</span>
                          </strong>
                        ) : (
                          `All ${brokersList.length} broker profiles audited and synchronized across global regulatory standards.`
                        )}
                      </p>
                    </div>

                    <div className="d2-feature-cards">
                      {/* CARD 1: ADD BUTTON CARD */}
                      <div
                        className="d2-add-feature-card"
                        onClick={() => navigate('/join-broker')}
                        title="Submit or add new broker"
                      >
                        <div className="d2-add-square-btn">
                          <Plus size={18} strokeWidth={2.5} />
                        </div>
                      </div>

                      {/* CARD 2: REAL BROKERS COUNT */}
                      <div
                        className="d2-feature-card"
                        onClick={() => switchDockView('brokers', 'Brokers')}
                      >
                        <div className="d2-feature-illu">
                          <Building2 size={32} strokeWidth={1.8} color="#595ef2" />
                        </div>
                        <div>
                          <h3 className="d2-feature-card-title">{brokersList.length} Brokers</h3>
                          <p className="d2-feature-card-desc">
                            {approvedBrokers.length} live • {pendingBrokers.length} pending
                          </p>
                        </div>
                      </div>

                      {/* CARD 3: REAL USERS COUNT */}
                      <div
                        className="d2-feature-card"
                        onClick={() => switchDockView('users', 'Users')}
                      >
                        <div className="d2-feature-illu">
                          <Users size={32} strokeWidth={1.8} color="#0284c7" />
                        </div>
                        <div>
                          <h3 className="d2-feature-card-title">{usersList.length} Traders</h3>
                          <p className="d2-feature-card-desc">
                            {usersList.filter((u) => u.role === 'admin').length} admin accounts
                          </p>
                        </div>
                      </div>

                      {/* CARD 4: REAL REVIEWS COUNT */}
                      <div
                        className="d2-feature-card"
                        onClick={() => switchDockView('reviews', 'Reviews')}
                      >
                        <div className="d2-feature-illu">
                          <MessageSquare size={32} strokeWidth={1.8} color="#10b981" />
                        </div>
                        <div>
                          <h3 className="d2-feature-card-title">{reviewsList.length} Reviews</h3>
                          <p className="d2-feature-card-desc">Verified trader feedback</p>
                        </div>
                      </div>

                      {/* CARD 5: REAL MARQUEE TESTIMONIALS */}
                      <div
                        className="d2-feature-card"
                        onClick={() => switchDockView('testimonials', 'Homepage Testimonials')}
                      >
                        <div className="d2-feature-illu">
                          <Quote size={30} strokeWidth={1.8} color="#8b5cf6" />
                        </div>
                        <div>
                          <h3 className="d2-feature-card-title">{testimonialsList.length} Testimonials</h3>
                          <p className="d2-feature-card-desc">Homepage ticker animation</p>
                        </div>
                      </div>

                      {/* CARD 6: REAL KYC SUBMISSIONS */}
                      <div
                        className="d2-feature-card"
                        onClick={() => switchDockView('kyc', 'KYC Verifications')}
                        style={{
                          borderColor: kycCounts.pending > 0 ? 'rgba(234, 179, 8, 0.4)' : undefined,
                        }}
                      >
                        <div className="d2-feature-illu">
                          <ShieldCheck size={30} strokeWidth={1.8} color="#eab308" />
                        </div>
                        <div>
                          <h3 className="d2-feature-card-title">{kycCounts.total} KYC Requests</h3>
                          <p className="d2-feature-card-desc">
                            {kycCounts.pending > 0 ? (
                              <strong style={{ color: '#d97706' }}>{kycCounts.pending} pending review</strong>
                            ) : (
                              `${kycCounts.verified} verified traders`
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ROW 2: REAL PENDING APPROVALS QUEUE & ACTIVITY */}
                  <section className="d2-row-mid">
                    {/* COLUMN 1: REAL PENDING BROKER APPROVALS QUEUE */}
                    <div className="d2-col-notifications">
                      <div className="d2-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={15} color="#f59e0b" />
                          <h3 className="d2-card-title">Pending Approvals</h3>
                          {pendingBrokers.length > 0 && (
                            <span className="d2-status-pill pending">
                              {pendingBrokers.length} Action Needed
                            </span>
                          )}
                        </div>
                        <button className="d2-card-header-btn" onClick={() => loadAdminData()}>
                          <span>Refresh</span>
                        </button>
                      </div>

                      {pendingBrokers.length === 0 ? (
                        <div className="d2-upcoming-card" style={{ textAlign: 'center', padding: '24px 16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                            <CheckCircle2 size={32} color="#10b981" strokeWidth={2} />
                          </div>
                          <strong style={{ fontSize: '12.5px', color: '#10b981' }}>
                            Zero Pending Brokers
                          </strong>
                          <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0' }}>
                            All newly created broker applications have been approved and published live.
                          </p>
                        </div>
                      ) : (
                        pendingBrokers.map((broker) => (
                          <div key={broker._id} className="d2-upcoming-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                            <div className="d2-upcoming-top">
                              <div className="d2-upcoming-title">
                                <span>{broker.name}</span>
                                <span className="d2-status-pill pending">Pending</span>
                              </div>
                              <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                                {new Date(broker.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="d2-upcoming-desc">
                              {broker.regulation} • Min Dep: {broker.minDeposit} • Spread: {broker.spread}
                              <br />
                              <span style={{ color: '#64748b' }}>
                                Contact: {broker.contactEmail} ({broker.representativeName || 'Partner'})
                              </span>
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                              <button
                                className="d2-btn-inspect"
                                onClick={() => setInspectingBroker(broker)}
                                title="View full submitted broker application details"
                              >
                                <Eye size={12} strokeWidth={2.4} />
                                <span>Inspect Details</span>
                              </button>
                              <button
                                className="d2-btn-approve"
                                onClick={() => handleApproveBroker(broker)}
                                title="Approve and make visible on public website"
                              >
                                <Check size={12} strokeWidth={2.8} />
                                <span>Approve &amp; Go Live</span>
                              </button>
                              <button
                                className="d2-btn-reject"
                                onClick={() => handleRejectBroker(broker)}
                                title="Reject submission"
                              >
                                <X size={12} strokeWidth={2.8} />
                                <span>Reject</span>
                              </button>
                              <button
                                className="d2-btn-delete"
                                onClick={() => promptDeleteBroker(broker)}
                                title="Permanently delete"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* COLUMN 2: REAL RECENT REVIEWS */}
                    <div className="d2-col-assignments">
                      <div className="d2-card-header">
                        <h3 className="d2-card-title">Real Trader Reviews</h3>
                        <button className="d2-card-header-btn" onClick={() => switchDockView('reviews', 'Reviews')}>
                          <span>View All ({reviewsList.length})</span>
                        </button>
                      </div>

                      {reviewsList.slice(0, 2).map((rev) => (
                        <div key={rev._id} className="d2-assignment-card">
                          <div className="d2-assignment-top-row">
                            <div>
                              <h4 className="d2-assignment-title">{rev.brokerName}</h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#eab308', marginTop: '2px' }}>
                                {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                                  <Star key={i} size={11} fill="currentColor" strokeWidth={0} />
                                ))}
                                <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '4px' }}>
                                  ({rev.title})
                                </span>
                              </div>
                            </div>
                            <span className={`d2-status-pill ${rev.status}`}>
                              {rev.status}
                            </span>
                          </div>
                          <p style={{ fontSize: '10.5px', color: '#64748b', margin: '4px 0 8px', lineHeight: 1.35 }}>
                            "{rev.comment}"
                          </p>
                          <div className="d2-assignment-bottom-row">
                            <span className="d2-package-tag">By {rev.username}</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {rev.status !== 'approved' && (
                                <button
                                  className="d2-btn-approve"
                                  style={{ padding: '3px 8px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                  onClick={() => handleApproveReview(rev._id)}
                                >
                                  <Check size={11} strokeWidth={2.8} />
                                  <span>Approve</span>
                                </button>
                              )}
                              <button
                                className="d2-btn-delete"
                                style={{ padding: '3px 8px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                onClick={() => promptDeleteReview(rev)}
                              >
                                <Trash2 size={11} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* COLUMN 3: REAL REGISTERED TRADERS FEED */}
                    <div className="d2-col-schedule">
                      <div className="d2-card-header">
                        <h3 className="d2-card-title">Registered Accounts</h3>
                        <button className="d2-card-header-btn" onClick={() => switchDockView('users', 'Users')}>
                          <span>View All ({usersList.length})</span>
                        </button>
                      </div>

                      <div className="d2-timeline-list">
                        {usersList.slice(0, 4).map((u) => (
                          <div key={u._id} className="d2-event-card">
                            <div className="d2-event-left">
                              <div
                                className="d2-event-icon-box"
                                style={{
                                  background: 'transparent',
                                  color: u.role === 'admin' ? '#8b5cf6' : '#0284c7',
                                }}
                              >
                                {u.role === 'admin' ? (
                                  <Crown size={17} strokeWidth={2.2} />
                                ) : (
                                  <User size={17} strokeWidth={2} />
                                )}
                              </div>
                              <div className="d2-event-info">
                                <span className="d2-event-title">
                                  {u.username}{' '}
                                  <span className={u.role === 'admin' ? 'd2-badge-admin' : 'd2-badge-user'}>
                                    {u.role}
                                  </span>
                                </span>
                                <span className="d2-event-sub">
                                  {u.email} • {new Date(u.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                              <button
                                className={u.role === 'admin' ? 'd2-btn-demote' : 'd2-btn-promote'}
                                style={{ padding: '3px 8px', fontSize: '10px' }}
                                onClick={() => handleToggleUserRole(u)}
                                title={u.role === 'admin' ? 'Demote to regular trader' : 'Promote to administrator'}
                              >
                                {u.role === 'admin' ? (
                                  <>
                                    <UserMinus size={11} />
                                    <span>Demote</span>
                                  </>
                                ) : (
                                  <>
                                    <UserPlus size={11} />
                                    <span>Promote</span>
                                  </>
                                )}
                              </button>
                              <button
                                className="d2-btn-delete"
                                style={{ padding: '3px 7px', fontSize: '10px' }}
                                onClick={() => promptDeleteUser(u)}
                                disabled={user?._id === u._id}
                                title={user?._id === u._id ? 'You cannot delete yourself' : 'Delete user account'}
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* ROW 3: REAL BROKERS LIST WITH APPROVE / REJECT / DELETE */}
                  <section className="d2-row-bottom">
                    {/* ALL BROKERS REAL LIST */}
                    <div className="d2-col-today-tasks">
                      <div className="d2-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 className="d2-card-title">Live Broker Directory</h3>
                          <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                            ({brokersList.length} in DB)
                          </span>
                        </div>
                        <button className="d2-card-header-btn" onClick={() => switchDockView('brokers', 'Brokers')}>
                          <span>Full Manager →</span>
                        </button>
                      </div>

                      {brokersList.slice(0, 5).map((broker) => (
                        <div key={broker._id} className="d2-task-row">
                          <div className="d2-task-name-col">
                            <span className="d2-task-name">
                              {broker.name}{' '}
                              <span className={`d2-status-pill ${broker.status || 'approved'}`}>
                                {broker.status || 'approved'}
                              </span>
                            </span>
                            <span className="d2-task-date">
                              Min: {broker.minDeposit} • Spread: {broker.spread} • {broker.regulation}
                            </span>
                          </div>

                          <div className="d2-task-duration-col">
                            <span className="d2-task-duration-label">Rating</span>
                            <span style={{ color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Star size={11} fill="#10b981" color="#10b981" />
                              <span>{broker.rating}</span>
                            </span>
                          </div>

                          <div className="d2-task-meta-col" style={{ gap: '6px' }}>
                            {broker.status === 'pending' ? (
                              <>
                                <button
                                  className="d2-btn-approve"
                                  style={{ padding: '3px 8px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                  onClick={() => handleApproveBroker(broker)}
                                  title="Approve broker"
                                >
                                  <Check size={11} strokeWidth={2.8} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  className="d2-btn-reject"
                                  style={{ padding: '3px 8px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                  onClick={() => handleRejectBroker(broker)}
                                  title="Reject broker"
                                >
                                  <X size={11} strokeWidth={2.8} />
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : broker.status === 'rejected' ? (
                              <button
                                className="d2-btn-approve"
                                style={{ padding: '3px 8px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                onClick={() => handleApproveBroker(broker)}
                                title="Re-approve broker"
                              >
                                <Check size={11} strokeWidth={2.8} />
                                <span>Approve</span>
                              </button>
                            ) : (
                              <button
                                className="d2-btn-reject"
                                style={{ padding: '3px 8px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                onClick={() => handleRejectBroker(broker)}
                                title="Unpublish from live site"
                              >
                                <X size={11} strokeWidth={2.8} />
                                <span>Reject</span>
                              </button>
                            )}

                            {/* Delete Broker */}
                            <button
                              className="d2-quick-del-btn"
                              onClick={() => promptDeleteBroker(broker)}
                              title={`Delete ${broker.name}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* REAL PLATFORM SUMMARY CARD */}
                    <div className="d2-premium-card">
                      <div className="d2-premium-illu">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="d2-premium-title">TradeSafeBrokers Security Gateway</h3>
                        <p className="d2-premium-desc">
                          Only approved brokers are displayed to public visitors. Pending applications stay in admin staging until verified.
                        </p>
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span>• Active & Approved: {approvedBrokers.length}</span>
                        <span>• Pending Review: {pendingBrokers.length}</span>
                        <span>• Rejected: {rejectedBrokers.length}</span>
                      </div>
                    </div>

                    {/* DIRECTORY COMPLIANCE & TRUST METRICS */}
                    <div className="d2-col-metrics-meeting">
                      <div className="d2-gauges-card">
                        <div className="d2-gauge-item">
                          <div className="d2-donut-wrapper">
                            <svg className="d2-donut-svg" viewBox="0 0 36 36">
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray={`${listingApprovalRate}, 100`} strokeLinecap="round" />
                            </svg>
                            <span className="d2-donut-pct">{listingApprovalRate}%</span>
                          </div>
                          <div className="d2-gauge-info">
                            <span className="d2-gauge-category cyan">APPROVAL</span>
                            <span className="d2-gauge-title">Listing Rate</span>
                            <span className="d2-gauge-sub">{approvedBrokers.length} Live • {pendingBrokers.length} Staged</span>
                          </div>
                        </div>

                        <div className="d2-gauge-item">
                          <div className="d2-donut-wrapper">
                            <svg className="d2-donut-svg" viewBox="0 0 36 36">
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#595ef2" strokeWidth="3.5" strokeDasharray={`${avgTrustIndex}, 100`} strokeLinecap="round" />
                            </svg>
                            <span className="d2-donut-pct">{avgTrustIndex}%</span>
                          </div>
                          <div className="d2-gauge-info">
                            <span className="d2-gauge-category purple">TRUST INDEX</span>
                            <span className="d2-gauge-title">Trader Confidence</span>
                            <span className="d2-gauge-sub">Tier-1 Audited Listings</span>
                          </div>
                        </div>
                      </div>

                      <div className="d2-board-meeting-card">
                        <div className="d2-meeting-title-row">
                          <h4 className="d2-meeting-title">Directory Governance</h4>
                          <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>
                            VERIFIED
                          </span>
                        </div>
                        <div className="d2-meeting-time">
                          <span style={{ color: '#10b981', fontSize: '12px' }}>•</span>
                          <span>Tier-1 Regulation Standard (FCA • CySEC • ASIC)</span>
                        </div>
                        <p className="d2-meeting-desc">
                          Broker listing audit active • Trader protection policy enforced • Daily compliance check operational
                        </p>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {/* VIEW 2: BROKERS MANAGEMENT VIEW (FULL APPROVE, REJECT, DELETE CONTROL) */}
              {(activeDock === 'brokers' || (activeNav === 'brokers' && activeDock === 'dashboard')) && (
                <motion.div
                  key="view-brokers"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="d2-generic-view"
                >
                  <div className="d2-view-banner">
                    <div className="d2-view-banner-text">
                      <h2>Forex Brokers Directory ({filteredBrokers.length})</h2>
                      <p>
                        Approve new partner submissions, reject unverified broker applications, or permanently delete records
                      </p>
                    </div>
                    <button className="d2-banner-btn" onClick={() => navigate('/join-broker')}>
                      <Plus size={13} strokeWidth={2.5} />
                      <span>Add New Broker</span>
                    </button>
                  </div>

                  {/* STATUS FILTER TABS */}
                  <div className="d2-filter-tabs">
                    <button
                      className={`d2-tab-btn ${brokerStatusFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setBrokerStatusFilter('all')}
                    >
                      All ({brokersList.length})
                    </button>
                    <button
                      className={`d2-tab-btn ${brokerStatusFilter === 'pending' ? 'active' : ''}`}
                      onClick={() => setBrokerStatusFilter('pending')}
                      style={{
                        color: pendingBrokers.length > 0 ? '#d97706' : undefined,
                        fontWeight: pendingBrokers.length > 0 ? 800 : undefined,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <Clock size={12} strokeWidth={2.5} />
                      <span>Pending Approvals ({pendingBrokers.length})</span>
                    </button>
                    <button
                      className={`d2-tab-btn ${brokerStatusFilter === 'approved' ? 'active' : ''}`}
                      onClick={() => setBrokerStatusFilter('approved')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <CheckCircle2 size={12} strokeWidth={2.5} color="#10b981" />
                      <span>Live &amp; Approved ({approvedBrokers.length})</span>
                    </button>
                    <button
                      className={`d2-tab-btn ${brokerStatusFilter === 'rejected' ? 'active' : ''}`}
                      onClick={() => setBrokerStatusFilter('rejected')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <XCircle size={12} strokeWidth={2.5} color="#ef4444" />
                      <span>Rejected ({rejectedBrokers.length})</span>
                    </button>
                  </div>

                  <div className="d2-management-list">
                    {filteredBrokers.length === 0 ? (
                      <div className="d2-view-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                          No brokers match the selected status filter "{brokerStatusFilter}".
                        </p>
                      </div>
                    ) : (
                      filteredBrokers.map((broker) => (
                        <div key={broker._id} className="d2-admin-item-card">
                          <div className="d2-item-primary">
                            <div
                              className="d2-item-avatar-box"
                              style={{ background: 'transparent', color: broker.brandColor || '#595ef2' }}
                            >
                              <Building2 size={20} strokeWidth={2} />
                            </div>
                            <div className="d2-item-info">
                              <span className="d2-item-title">
                                {broker.rank ? `${broker.rank} ` : ''}
                                {broker.name}
                                <span className={`d2-status-pill ${broker.status || 'approved'}`}>
                                  {broker.status || 'approved'}
                                </span>
                                {broker.isVerified && (
                                  <span className="d2-badge-verified">Verified Partner</span>
                                )}
                              </span>
                              <span className="d2-item-sub">
                                {broker.regulation} • {broker.platforms} • Contact: {broker.contactEmail}
                              </span>
                            </div>
                          </div>

                          <div className="d2-item-metrics">
                            <div className="d2-metric-pill">
                              <span className="d2-metric-pill-label">Rating</span>
                              <span className="d2-metric-pill-val" style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Star size={11} fill="#10b981" color="#10b981" />
                                <span>{broker.rating} ({broker.reviewsCount})</span>
                              </span>
                            </div>
                            <div className="d2-metric-pill">
                              <span className="d2-metric-pill-label">Min Deposit</span>
                              <span className="d2-metric-pill-val">{broker.minDeposit}</span>
                            </div>
                            <div className="d2-metric-pill">
                              <span className="d2-metric-pill-label">Spread</span>
                              <span className="d2-metric-pill-val">{broker.spread}</span>
                            </div>
                            <div className="d2-metric-pill">
                              <span className="d2-metric-pill-label">Leverage</span>
                              <span className="d2-metric-pill-val">{broker.maxLeverage}</span>
                            </div>
                          </div>

                          <div className="d2-item-actions">
                            {/* INSPECT BROKER APPLICATION DETAILS BUTTON */}
                            <button
                              type="button"
                              className="d2-btn-inspect"
                              onClick={() => setInspectingBroker(broker)}
                              title="Inspect full broker application submission"
                            >
                              <Eye size={12} strokeWidth={2.4} />
                              <span>Inspect Details</span>
                            </button>

                            {/* EDIT BROKER DETAILS BUTTON */}
                            <button
                              type="button"
                              className="d2-btn-inspect"
                              onClick={() => setEditingBroker(broker)}
                              title="Edit broker details (spreads, deposit, leverage, regulation, etc.)"
                              style={{ background: 'rgba(252, 93, 33, 0.12)', color: '#fc5d21', borderColor: 'rgba(252, 93, 33, 0.35)', fontWeight: 700 }}
                            >
                              <Pencil size={12} strokeWidth={2.4} />
                              <span>Edit Details</span>
                            </button>

                            {/* APPROVE BUTTON (IF PENDING OR REJECTED) */}
                            {broker.status !== 'approved' && broker.status !== 'active' && (
                              <button
                                className="d2-btn-approve"
                                onClick={() => handleApproveBroker(broker)}
                                title="Approve broker and publish live on public website"
                              >
                                <Check size={12} strokeWidth={2.8} />
                                <span>Approve &amp; Go Live</span>
                              </button>
                            )}

                            {/* REJECT BUTTON (IF PENDING OR APPROVED) */}
                            {broker.status !== 'rejected' && (
                              <button
                                className="d2-btn-reject"
                                onClick={() => handleRejectBroker(broker)}
                                title="Reject broker application"
                              >
                                <X size={12} strokeWidth={2.8} />
                                <span>Reject</span>
                              </button>
                            )}

                            {/* TOGGLE VERIFIED BADGE */}
                            <button
                              className="d2-btn-action"
                              onClick={() => handleToggleBrokerVerify(broker._id)}
                              title="Toggle verified partner badge"
                            >
                              {broker.isVerified ? 'Revoke Badge' : 'Verify'}
                            </button>

                            {/* DELETE BROKER BUTTON */}
                            <button
                              className="d2-btn-delete"
                              onClick={() => promptDeleteBroker(broker)}
                              title={`Delete ${broker.name} permanently`}
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* VIEW: TRADER KYC VERIFICATION MANAGEMENT */}
              {(activeDock === 'kyc' || activeNav === 'kyc') && (
                <motion.div
                  key="view-kyc"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="d2-generic-view"
                >
                  <div className="d2-view-banner">
                    <div className="d2-view-banner-text">
                      <h2>Trader ID Card KYC Queue ({filteredKycSubmissions.length})</h2>
                      <p>
                        Inspect uploaded front and back ID Card documents, verify trader legal identities, and award the official Verified Trader badge.
                      </p>
                    </div>
                    <button className="d2-banner-btn" onClick={() => loadAdminData()}>
                      <RefreshCw size={13} strokeWidth={2.5} />
                      <span>Refresh Queue</span>
                    </button>
                  </div>

                  {/* KYC STATUS FILTER TABS */}
                  <div className="d2-filter-tabs">
                    <button
                      className={`d2-tab-btn ${kycFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setKycFilter('all')}
                    >
                      All Submissions ({kycCounts.total})
                    </button>
                    <button
                      className={`d2-tab-btn ${kycFilter === 'pending' ? 'active' : ''}`}
                      onClick={() => setKycFilter('pending')}
                      style={{
                        color: kycCounts.pending > 0 ? '#d97706' : undefined,
                        fontWeight: kycCounts.pending > 0 ? 800 : undefined,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <Clock size={12} strokeWidth={2.5} />
                      <span>Pending Approvals ({kycCounts.pending})</span>
                    </button>
                    <button
                      className={`d2-tab-btn ${kycFilter === 'verified' ? 'active' : ''}`}
                      onClick={() => setKycFilter('verified')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <CheckCircle2 size={12} strokeWidth={2.5} color="#10b981" />
                      <span>Verified Traders ({kycCounts.verified})</span>
                    </button>
                    <button
                      className={`d2-tab-btn ${kycFilter === 'rejected' ? 'active' : ''}`}
                      onClick={() => setKycFilter('rejected')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <XCircle size={12} strokeWidth={2.5} color="#ef4444" />
                      <span>Rejected ({kycCounts.rejected})</span>
                    </button>
                  </div>

                  {/* LIST OF KYC SUBMISSIONS */}
                  <div className="d2-management-list">
                    {filteredKycSubmissions.length === 0 ? (
                      <div className="d2-view-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                          <ShieldCheck size={36} color="#10b981" />
                        </div>
                        <h3 style={{ fontSize: '15px', marginBottom: '4px' }}>No KYC Submissions in this view</h3>
                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                          {kycFilter === 'pending'
                            ? 'All trader KYC submissions have been verified and processed.'
                            : `No submissions found matching the "${kycFilter}" status filter.`}
                        </p>
                      </div>
                    ) : (
                      filteredKycSubmissions.map((sub) => {
                        const kyc = sub.kycData || {};
                        const isPending = sub.kycStatus === 'pending';
                        const isVerified = sub.kycStatus === 'verified' || sub.isKycVerified;

                        return (
                          <div key={sub._id} className="d2-admin-item-card d2-kyc-card">
                            <div className="d2-item-primary">
                              <div
                                className="d2-item-avatar-box"
                                style={{
                                  background: isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                                  color: isVerified ? '#10b981' : '#eab308',
                                }}
                              >
                                <ShieldCheck size={22} strokeWidth={2} />
                              </div>
                              <div className="d2-item-info">
                                <span className="d2-item-title">
                                  {kyc.fullName || sub.username}
                                  <span className={`d2-status-pill ${sub.kycStatus || 'pending'}`}>
                                    {sub.kycStatus === 'verified'
                                      ? 'Verified Trader'
                                      : sub.kycStatus === 'rejected'
                                      ? 'Rejected'
                                      : 'Pending Review'}
                                  </span>
                                  {sub.isKycVerified && (
                                    <span className="d2-badge-verified">Verified Badge Active</span>
                                  )}
                                </span>
                                <span className="d2-item-sub">
                                  Username: @{sub.username} • Email: {sub.email} • Phone: {kyc.phone || 'N/A'}
                                </span>
                              </div>
                            </div>

                            {/* METRICS / ID CARD SUMMARY & THUMBNAILS */}
                            <div className="d2-item-metrics">
                              <div className="d2-metric-pill">
                                <span className="d2-metric-pill-label">ID Card Number</span>
                                <span className="d2-metric-pill-val" style={{ fontFamily: 'monospace' }}>
                                  {kyc.idCardNumber || kyc.aadhaarNumber || 'N/A'}
                                </span>
                              </div>
                              <div className="d2-metric-pill">
                                <span className="d2-metric-pill-label">DOB</span>
                                <span className="d2-metric-pill-val">{kyc.dob || 'N/A'}</span>
                              </div>
                              {/* Thumbnails */}
                              <div className="d2-kyc-mini-thumbs">
                                {(kyc.idCardFrontImage || kyc.aadhaarFrontImage) ? (
                                  <img src={kyc.idCardFrontImage || kyc.aadhaarFrontImage} alt="Front" className="d2-mini-thumb" title="ID Card Front" />
                                ) : (
                                  <span className="d2-mini-thumb-empty">No Front</span>
                                )}
                                {(kyc.idCardBackImage || kyc.aadhaarBackImage) ? (
                                  <img src={kyc.idCardBackImage || kyc.aadhaarBackImage} alt="Back" className="d2-mini-thumb" title="ID Card Back" />
                                ) : (
                                  <span className="d2-mini-thumb-empty">No Back</span>
                                )}
                              </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="d2-item-actions">
                              <button
                                type="button"
                                className="d2-btn-inspect"
                                onClick={() => {
                                  setSelectedKyc(sub);
                                  setKycRejectReason(kyc.rejectionReason || '');
                                }}
                                title="Inspect full ID Card document images and details"
                              >
                                <Eye size={13} strokeWidth={2.4} />
                                <span>Inspect &amp; Verify</span>
                              </button>

                              {!isVerified && (
                                <button
                                  type="button"
                                  className="d2-btn-approve"
                                  onClick={() => handleVerifyUserKyc(sub._id, 'verified')}
                                  title="Quick Approve KYC"
                                >
                                  <Check size={12} strokeWidth={2.8} />
                                  <span>Approve</span>
                                </button>
                              )}

                              {sub.kycStatus !== 'rejected' && (
                                <button
                                  type="button"
                                  className="d2-btn-reject"
                                  onClick={() => {
                                    setSelectedKyc(sub);
                                    setKycRejectReason('ID Card photo is unclear. Please re-upload clear photos.');
                                  }}
                                  title="Reject KYC"
                                >
                                  <X size={12} strokeWidth={2.8} />
                                  <span>Reject</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}

              {/* VIEW 3: USERS MANAGEMENT VIEW */}
              {activeDock === 'users' && (
                <motion.div
                  key="view-users"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="d2-generic-view"
                >
                  <div className="d2-view-banner">
                    <div className="d2-view-banner-text">
                      <h2>Registered Users & Community Traders ({filteredUsers.length})</h2>
                      <p>Manage registered trader accounts, institutional partner roles, and administrative permissions</p>
                    </div>
                    <button className="d2-banner-btn" onClick={handleExportData}>
                      Export Users CSV
                    </button>
                  </div>

                  <div className="d2-management-list">
                    {filteredUsers.map((u) => (
                      <div key={u._id} className="d2-admin-item-card">
                        <div className="d2-item-primary">
                          <div
                            className="d2-item-avatar-box"
                            style={{
                              background: 'transparent',
                              color: u.role === 'admin' ? '#8b5cf6' : '#0284c7',
                            }}
                          >
                            {u.role === 'admin' ? <Crown size={20} strokeWidth={2.2} /> : <User size={20} strokeWidth={2} />}
                          </div>
                          <div className="d2-item-info">
                            <span className="d2-item-title">
                              {u.username}
                              {u.role === 'admin' ? (
                                <span className="d2-badge-admin">Admin</span>
                              ) : (
                                <span className="d2-badge-user">Trader</span>
                              )}
                              {!u.isActive && (
                                <span style={{ fontSize: '9px', background: '#fee2e2', color: '#ef4444', padding: '1px 6px', borderRadius: '4px' }}>
                                  Deactivated
                                </span>
                              )}
                            </span>
                            <span className="d2-item-sub">{u.email}</span>
                          </div>
                        </div>

                        <div className="d2-item-metrics">
                          <div className="d2-metric-pill">
                            <span className="d2-metric-pill-label">Account ID</span>
                            <span className="d2-metric-pill-val" style={{ fontFamily: 'monospace', fontSize: '10px' }}>
                              {u._id.slice(-8)}
                            </span>
                          </div>
                          <div className="d2-metric-pill">
                            <span className="d2-metric-pill-label">Member Since</span>
                            <span className="d2-metric-pill-val">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="d2-item-actions">
                          {/* Toggle Admin Role */}
                          <button
                            className={u.role === 'admin' ? 'd2-btn-demote' : 'd2-btn-promote'}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                            onClick={() => handleToggleUserRole(u)}
                            title={u.role === 'admin' ? 'Demote to regular trader account' : 'Promote to administrator privileges'}
                          >
                            {u.role === 'admin' ? (
                              <>
                                <UserMinus size={12} />
                                <span>Demote to Trader</span>
                              </>
                            ) : (
                              <>
                                <UserPlus size={12} />
                                <span>Promote to Admin</span>
                              </>
                            )}
                          </button>

                          {/* Delete User */}
                          <button
                            className="d2-btn-delete"
                            onClick={() => promptDeleteUser(u)}
                            disabled={user?._id === u._id}
                            title={user?._id === u._id ? 'You cannot delete yourself' : 'Delete user'}
                            style={{ opacity: user?._id === u._id ? 0.4 : 1, cursor: user?._id === u._id ? 'not-allowed' : 'pointer' }}
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* VIEW 4: REVIEWS MODERATION VIEW */}
              {(activeDock === 'reviews' || (activeNav === 'reviews' && activeDock === 'dashboard')) && (
                <motion.div
                  key="view-reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="d2-generic-view"
                >
                  <div className="d2-view-banner">
                    <div className="d2-view-banner-text">
                      <h2>Trader Reviews Moderation ({filteredReviews.length})</h2>
                      <p>Inspect feedback submitted by forex traders, verify UPI deposits, and moderate comments</p>
                    </div>
                    <button className="d2-banner-btn" onClick={() => loadAdminData()}>
                      Refresh Reviews
                    </button>
                  </div>

                  <div className="d2-management-list">
                    {filteredReviews.map((rev) => (
                      <div key={rev._id} className="d2-admin-item-card" style={{ alignItems: 'flex-start' }}>
                        <div className="d2-item-primary" style={{ flex: 2 }}>
                          <div
                            className="d2-item-avatar-box"
                            style={{ background: 'transparent', color: '#eab308' }}
                          >
                            <Star size={20} fill="#eab308" strokeWidth={0} />
                          </div>
                          <div className="d2-item-info">
                            <span className="d2-item-title">
                              {rev.brokerName}
                              <span style={{ color: '#eab308', display: 'inline-flex', alignItems: 'center', gap: '2px', marginLeft: '6px' }}>
                                {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                                  <Star key={i} size={11} fill="currentColor" strokeWidth={0} />
                                ))}
                              </span>
                              <span className={`d2-status-pill ${rev.status}`}>
                                {rev.status.toUpperCase()}
                              </span>
                            </span>
                            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'inherit', margin: '3px 0 2px' }}>
                              "{rev.title}"
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                              {rev.comment}
                            </span>
                            {rev.categories && (
                              <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '10px', background: 'rgba(252,93,33,0.1)', color: '#fc5d21', padding: '1px 5px', borderRadius: '4px' }}>
                                  ⚡ Exec: {rev.categories.executionSpeed || 5}★
                                </span>
                                <span style={{ fontSize: '10px', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '1px 5px', borderRadius: '4px' }}>
                                  💸 Payout: {rev.categories.withdrawalSpeed || 5}★
                                </span>
                                <span style={{ fontSize: '10px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '1px 5px', borderRadius: '4px' }}>
                                  💬 Support: {rev.categories.customerSupport || 5}★
                                </span>
                              </div>
                            )}
                            {rev.brokerResponse?.responseComment && (
                              <div style={{ marginTop: '6px', padding: '6px 8px', background: 'rgba(252,93,33,0.06)', borderLeft: '2px solid #fc5d21', borderRadius: '4px', fontSize: '10.5px' }}>
                                <strong style={{ color: '#fc5d21' }}>🏢 Broker Reply ({rev.brokerResponse.responderName}):</strong> {rev.brokerResponse.responseComment}
                              </div>
                            )}
                            <span className="d2-item-sub" style={{ marginTop: '4px' }}>
                              By {rev.username} ({rev.userEmail || 'trader'}) • Deposit: {rev.depositMethodUsed} {rev.verifiedTrader && '• Verified Trader ✓'}
                            </span>
                          </div>
                        </div>

                        <div className="d2-item-actions" style={{ alignSelf: 'center' }}>
                          {rev.status !== 'approved' && (
                            <button
                              className="d2-btn-approve"
                              onClick={() => handleApproveReview(rev._id)}
                            >
                              <Check size={12} strokeWidth={2.8} />
                              <span>Approve</span>
                            </button>
                          )}

                          <button
                            className="d2-btn-delete"
                            onClick={() => promptDeleteReview(rev)}
                            title="Delete review"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* VIEW: TESTIMONIALS (HOMEPAGE ANIMATION MARQUEE) */}
              {(activeDock === 'testimonials' || (activeNav === 'testimonials' && activeDock === 'dashboard')) && (
                <motion.div
                  key="view-testimonials"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="d2-generic-view"
                >
                  <div className="d2-view-banner">
                    <div className="d2-view-banner-text">
                      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Quote size={20} color="#595ef2" />
                        <span>Homepage Marquee Testimonials ({filteredTestimonials.length})</span>
                      </h2>
                      <p>
                        Manage real trader testimonials displayed on the homepage dual-track animation loop.
                        Delete any demo or outdated review with immediate real-time sync.
                      </p>
                    </div>
                    <button
                      className="d2-banner-btn"
                      onClick={handleResetTestimonials}
                      title="Restore original 12 demo testimonials"
                    >
                      <RefreshCw size={13} style={{ marginRight: '6px' }} />
                      Reset Demo Testimonials
                    </button>
                  </div>

                  {/* Filter Row */}
                  <div className="d2-filter-bar">
                    <div className="d2-filter-tabs">
                      <button
                        className={`d2-filter-pill ${testimonialFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setTestimonialFilter('all')}
                      >
                        All Testimonials ({testimonialsList.length})
                      </button>
                      <button
                        className={`d2-filter-pill ${testimonialFilter === 'top' ? 'active' : ''}`}
                        onClick={() => setTestimonialFilter('top')}
                      >
                        Top Track (Leftward Loop) ({testimonialsList.filter((t) => t.row === 'top').length})
                      </button>
                      <button
                        className={`d2-filter-pill ${testimonialFilter === 'bottom' ? 'active' : ''}`}
                        onClick={() => setTestimonialFilter('bottom')}
                      >
                        Bottom Track (Rightward Loop) ({testimonialsList.filter((t) => t.row === 'bottom').length})
                      </button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Showing {filteredTestimonials.length} active testimonials
                    </div>
                  </div>

                  {/* Grid of Testimonials */}
                  <div className="d2-testimonials-grid">
                    {filteredTestimonials.length === 0 ? (
                      <div className="d2-empty-state" style={{ gridColumn: '1 / -1', padding: '40px 20px', textAlign: 'center' }}>
                        <Quote size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px' }}>No Testimonials Found</h3>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px' }}>
                          All testimonials in this filter have been deleted or none match your search.
                        </p>
                        <button className="d2-btn-action" onClick={handleResetTestimonials}>
                          <RefreshCw size={13} />
                          <span>Restore Demo Testimonials</span>
                        </button>
                      </div>
                    ) : (
                      filteredTestimonials.map((item) => (
                        <div key={item._id || item.name} className="d2-testimonial-manage-card">
                          <div className="d2-testimonial-card-top">
                            <div className="d2-testimonial-avatar-area">
                              <img
                                src={item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                                alt={item.name}
                                className="d2-testimonial-thumb"
                              />
                              <div>
                                <div className="d2-testimonial-author-name">{item.name}</div>
                                <div className="d2-testimonial-author-role">{item.role}</div>
                              </div>
                            </div>
                            <span className={`d2-row-tag ${item.row === 'top' ? 'top-track' : 'bottom-track'}`}>
                              {item.row === 'top' ? 'Top Loop' : 'Bottom Loop'}
                            </span>
                          </div>

                          <div className="d2-testimonial-rating-row">
                            <div className="d2-stars-cluster">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={13} fill="#eab308" color="#eab308" />
                              ))}
                            </div>
                            <span className="d2-rating-val">{item.rating || '5.0'} / 5.0</span>
                          </div>

                          <p className="d2-testimonial-quote">
                            "{item.review}"
                          </p>

                          <div className="d2-testimonial-card-bottom">
                            <span className="d2-demo-pill">
                              {item.isDemo !== false ? 'Demo Testimonial' : 'Live Trader'}
                            </span>
                            <button
                              className="d2-btn-delete"
                              onClick={() => promptDeleteTestimonial(item)}
                              title="Delete this testimonial from the homepage animation"
                            >
                              <Trash2 size={13} />
                              <span>Delete Testimonial</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* VIEW: CONTACT INQUIRIES & FOOTER LINKS MANAGEMENT */}
              {(activeDock === 'messages' || (activeNav === 'messages' && activeDock === 'dashboard')) && (
                <motion.div
                  key="view-messages"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="d2-generic-view"
                >
                  <div className="d2-view-banner">
                    <div className="d2-view-banner-text">
                      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={20} color="#fc5d21" />
                        <span>Contact Inquiries &amp; Footer Link Manager</span>
                      </h2>
                      <p>
                        View questions &amp; inquiries sent via Contact Us modal, and manage live footer links with instant website synchronization.
                      </p>
                    </div>
                    <button
                      className="d2-banner-btn"
                      onClick={() => loadAdminData()}
                      title="Sync messages and footer settings"
                    >
                      <RefreshCw size={13} style={{ marginRight: '6px' }} />
                      Sync Inquiries
                    </button>
                  </div>

                  {/* Sub-Tabs: Inquiries vs Footer Links */}
                  <div className="d2-filter-bar" style={{ marginBottom: '18px' }}>
                    <div className="d2-filter-tabs-custom">
                      <button
                        type="button"
                        className={`d2-filter-pill-btn ${messagesSubTab === 'inquiries' ? 'active' : ''}`}
                        onClick={() => setMessagesSubTab('inquiries')}
                      >
                        <Mail size={14} />
                        <span>User Inquiries ({messagesList.length})</span>
                      </button>
                      <button
                        type="button"
                        className={`d2-filter-pill-btn ${messagesSubTab === 'footer' ? 'active' : ''}`}
                        onClick={() => setMessagesSubTab('footer')}
                      >
                        <SlidersHorizontal size={14} />
                        <span>Footer Links Manager ({hiddenFooterLinks.length > 0 ? `${hiddenFooterLinks.length} Hidden` : 'All Active'})</span>
                      </button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {messagesSubTab === 'inquiries'
                        ? `Showing ${filteredMessages.length} message(s)`
                        : `Live control of public footer links`}
                    </div>
                  </div>

                  {messagesSubTab === 'inquiries' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {filteredMessages.length === 0 ? (
                        <div className="d2-inquiry-empty-box">
                          <div className="d2-inquiry-empty-icon-wrap">
                            <Mail size={28} />
                          </div>
                          <h3>No Inquiries Yet</h3>
                          <p>
                            When users submit questions or partnership inquiries via the Contact Support &amp; Desk form on the website, they will appear here in real-time.
                          </p>
                        </div>
                      ) : (
                        filteredMessages.map((msg) => (
                          <div key={msg._id} className="d2-inquiry-card">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div
                                  style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #fc5d21 0%, #ff8c42 100%)',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '17px',
                                    flexShrink: 0,
                                  }}
                                >
                                  {msg.name ? msg.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{msg.name || 'Anonymous User'}</div>
                                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                                    <a href={`mailto:${msg.email}`} style={{ color: '#fc5d21', textDecoration: 'none' }}>
                                      {msg.email}
                                    </a>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                  {new Date(msg.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                                <span className="d2-badge-verified" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                  Inquiry
                                </span>
                              </div>
                            </div>

                            <div className="d2-inquiry-msg-box">
                              {msg.message}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                              <a
                                href={`mailto:${msg.email}?subject=TradeSafeBrokers Support: Inquiry Reply&body=Hi ${msg.name},%0D%0A%0D%0AThank you for contacting TradeSafeBrokers Support Desk.`}
                                className="d2-banner-btn"
                                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                              >
                                <Mail size={13} />
                                <span>Reply via Email</span>
                              </a>
                              <button
                                className="d2-btn-delete"
                                onClick={() => promptDeleteMessage(msg)}
                                title="Delete inquiry"
                              >
                                <Trash2 size={13} />
                                <span>Delete Inquiry</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    /* Footer Links Management */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div
                        style={{
                          background: 'rgba(252, 93, 33, 0.08)',
                          border: '1px solid rgba(252, 93, 33, 0.25)',
                          borderRadius: '12px',
                          padding: '14px 18px',
                          fontSize: '13px',
                          lineHeight: '1.5',
                        }}
                      >
                        <strong>Live Footer Synchronization:</strong> Any link removed/hidden here is instantly removed from the live website footer. Click "Remove from Footer" to take down a link or "Restore Link" to put it back live.
                      </div>

                      {ALL_FOOTER_SECTIONS.map((sec) => (
                        <div key={sec.id} className="d2-footer-manage-section">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {sec.title}
                            </h3>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {sec.links.length} total links
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                            {sec.links.map((link) => {
                              const isHidden = hiddenFooterLinks.includes(link.label);
                              return (
                                <div
                                  key={link.label}
                                  className={`d2-footer-manage-link ${isHidden ? 'is-hidden' : ''}`}
                                >
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div
                                      style={{
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        textDecoration: isHidden ? 'line-through' : 'none',
                                        color: isHidden ? '#94a3b8' : 'inherit',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                    >
                                      {link.label}
                                    </div>
                                    <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>
                                      {link.href ? `Route: ${link.href}` : 'Interactive Modal'}
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <button
                                      onClick={() => handleToggleFooterLink(link.label)}
                                      className={isHidden ? 'd2-banner-btn' : 'd2-btn-delete'}
                                      style={{
                                        padding: '5px 10px',
                                        fontSize: '11px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                      }}
                                      title={isHidden ? 'Restore to website footer' : 'Delete / Hide from website footer'}
                                    >
                                      {isHidden ? (
                                        <>
                                          <Eye size={12} />
                                          <span>Restore</span>
                                        </>
                                      ) : (
                                        <>
                                          <Trash2 size={12} />
                                          <span>Remove</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* VIEW 5: ANALYTICS VIEW */}
              {activeDock === 'analytics' && (
                <motion.div
                  key="view-analytics"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="d2-generic-view"
                >
                  <div className="d2-view-banner">
                    <div className="d2-view-banner-text">
                      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart3 size={20} color="#595ef2" />
                        <span>TradeSafeBrokers Platform &amp; Directory Analytics</span>
                      </h2>
                      <p>Aggregated real data across broker listings, trader engagement, and broker statuses</p>
                    </div>
                    <button className="d2-banner-btn" onClick={() => showToast('Generated full CSV export')}>
                      Export Report
                    </button>
                  </div>

                  <div className="d2-kpi-strip">
                    <div className="d2-kpi-card">
                      <div className="d2-kpi-title">Total Brokers</div>
                      <div className="d2-kpi-value">
                        {brokersList.length} <span className="d2-kpi-change up">Profiles</span>
                      </div>
                    </div>
                    <div className="d2-kpi-card">
                      <div className="d2-kpi-title">Approved & Live</div>
                      <div className="d2-kpi-value">
                        {approvedBrokers.length} <span className="d2-kpi-change up">Public</span>
                      </div>
                    </div>
                    <div className="d2-kpi-card">
                      <div className="d2-kpi-title">Pending Approvals</div>
                      <div className="d2-kpi-value">
                        {pendingBrokers.length} <span className="d2-kpi-change down">Staged</span>
                      </div>
                    </div>
                    <div className="d2-kpi-card">
                      <div className="d2-kpi-title">Registered Accounts</div>
                      <div className="d2-kpi-value">
                        {usersList.length} <span className="d2-kpi-change up">Users</span>
                      </div>
                    </div>
                  </div>

                  <div className="d2-generic-grid-2">
                    <div className="d2-view-card">
                      <h3>Broker Status Distribution</h3>
                      <div className="d2-channel-item">
                        <span className="d2-channel-name">Live Approved Brokers</span>
                        <span className="d2-channel-pct" style={{ color: '#10b981' }}>
                          {approvedBrokers.length} ({brokersList.length > 0 ? Math.round((approvedBrokers.length / brokersList.length) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="d2-channel-item">
                        <span className="d2-channel-name">Pending Admin Review</span>
                        <span className="d2-channel-pct" style={{ color: '#f59e0b' }}>
                          {pendingBrokers.length} ({brokersList.length > 0 ? Math.round((pendingBrokers.length / brokersList.length) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="d2-channel-item">
                        <span className="d2-channel-name">Rejected Submissions</span>
                        <span className="d2-channel-pct" style={{ color: '#ef4444' }}>
                          {rejectedBrokers.length} ({brokersList.length > 0 ? Math.round((rejectedBrokers.length / brokersList.length) * 100) : 0}%)
                        </span>
                      </div>
                    </div>

                    <div className="d2-view-card">
                      <h3>Directory &amp; Trust Metrics</h3>
                      <div className="d2-channel-item">
                        <span className="d2-channel-name">Community Reviews</span>
                        <span className="d2-channel-pct" style={{ color: '#595ef2' }}>
                          {reviewsList.length} Verified
                        </span>
                      </div>
                      <div className="d2-channel-item">
                        <span className="d2-channel-name">Avg Broker Trust Score</span>
                        <span className="d2-channel-pct" style={{ color: '#10b981' }}>
                          {brokersList.length > 0
                            ? (brokersList.reduce((acc, b) => acc + (Number(b.trustScore) || 85), 0) / brokersList.length).toFixed(1)
                            : '94.0'} / 100
                        </span>
                      </div>
                      <div className="d2-channel-item">
                        <span className="d2-channel-name">Tier-1 Regulated Ratio</span>
                        <span className="d2-channel-pct" style={{ color: '#0ea5e9' }}>
                          {brokersList.length > 0
                            ? Math.round(
                                (brokersList.filter((b) => b.isRegulated || (b.regulation && b.regulation.length > 0)).length /
                                  brokersList.length) *
                                  100
                              )
                            : 100}%
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VIEW 6: NOTIFICATIONS VIEW */}
              {activeDock === 'notifications' && (
                <motion.div
                  key="view-notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="d2-generic-view"
                >
                  <div className="d2-view-banner">
                    <div className="d2-view-banner-text">
                      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bell size={20} color="#f59e0b" />
                        <span>System Alerts &amp; Activity</span>
                      </h2>
                      <p>Real-time operational alerts on pending broker approvals and directory activity</p>
                    </div>
                    <button className="d2-banner-btn" onClick={() => loadAdminData()}>
                      Sync Alerts
                    </button>
                  </div>

                  <div className="d2-notif-stack">
                    {pendingBrokers.length > 0 && (
                      <div className="d2-notif-center-item" onClick={() => switchDockView('brokers', 'Brokers')} style={{ cursor: 'pointer', borderLeft: '4px solid #f59e0b' }}>
                        <span className="d2-notif-dot amber" />
                        <div className="d2-notif-center-text">
                          <strong>{pendingBrokers.length} Broker(s) Awaiting Review</strong>
                          <span>Click to open broker approval staging and publish live</span>
                        </div>
                      </div>
                    )}
                    <div className="d2-notif-center-item">
                      <span className="d2-notif-dot green" />
                      <div className="d2-notif-center-text">
                        <strong>Directory Inventory Synchronized</strong>
                        <span>{brokersList.length} live broker profiles and {usersList.length} registered accounts</span>
                      </div>
                    </div>
                    <div className="d2-notif-center-item">
                      <span className="d2-notif-dot purple" />
                      <div className="d2-notif-center-text">
                        <strong>Super Administrator Authenticated</strong>
                        <span>Active session for {user?.email}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VIEW 7: ADMIN PROFILE & SECURITY */}
              {activeDock === 'profile' && (
                <motion.div
                  key="view-profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="d2-generic-view"
                >
                  <div className="d2-view-banner">
                    <div className="d2-view-banner-text">
                      <h2>Administrator Credentials & Security</h2>
                      <p>Manage your TradeSafeBrokers admin profile, authentication tokens, and system preferences</p>
                    </div>
                    <button
                      className="d2-banner-btn"
                      onClick={() => {
                        logout();
                        navigate('/');
                        showToast('Signed out of admin dashboard');
                      }}
                    >
                      Sign Out
                    </button>
                  </div>

                  <div className="d2-generic-grid-2">
                    <div className="d2-view-card">
                      <h3>Admin Profile Information</h3>
                      <div className="d2-info-row">
                        <span className="d2-info-label">Username</span>
                        <span className="d2-info-value">{user?.username || 'admin'}</span>
                      </div>
                      <div className="d2-info-row">
                        <span className="d2-info-label">Email Address</span>
                        <span className="d2-info-value">{user?.email || 'admin@tradesafebrokers.com'}</span>
                      </div>
                      <div className="d2-info-row">
                        <span className="d2-info-label">Role Privilege</span>
                        <span className="d2-info-value" style={{ color: '#10b981' }}>
                          Super Administrator (Full Approval Authority)
                        </span>
                      </div>
                      <div className="d2-info-row">
                        <span className="d2-info-label">Account ID</span>
                        <span className="d2-info-value" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                          {user?._id || 'Master'}
                        </span>
                      </div>
                    </div>

                    <div className="d2-view-card">
                      <h3>Platform Inventory Summary</h3>
                      <div className="d2-stat-grid">
                        <div className="d2-stat-item">
                          <span className="d2-stat-num">{brokersList.length}</span>
                          <span className="d2-stat-label">Total Listed Brokers</span>
                        </div>
                        <div className="d2-stat-item">
                          <span className="d2-stat-num">{pendingBrokers.length}</span>
                          <span className="d2-stat-label">Pending Approval</span>
                        </div>
                        <div className="d2-stat-item">
                          <span className="d2-stat-num">{approvedBrokers.length}</span>
                          <span className="d2-stat-label">Live on Website</span>
                        </div>
                        <div className="d2-stat-item">
                          <span className="d2-stat-num">{usersList.length}</span>
                          <span className="d2-stat-label">Registered Traders</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* BROKER APPLICATION INSPECTION MODAL */}
      <BrokerInspectModal
        broker={inspectingBroker}
        onClose={() => setInspectingBroker(null)}
        onApprove={handleApproveBroker}
        onReject={handleRejectBroker}
      />

      {/* BROKER EDIT DETAILS MODAL */}
      <BrokerEditModal
        broker={editingBroker}
        onClose={() => setEditingBroker(null)}
        onSave={handleSaveBroker}
        saving={savingBroker}
      />

      {/* TRADER KYC ID CARD INSPECTION MODAL */}
      <UserKycInspectModal
        kycUser={selectedKyc}
        onClose={() => setSelectedKyc(null)}
        onApprove={(userId) => handleVerifyUserKyc(userId, 'verified')}
        onReject={(userId, reason) => handleVerifyUserKyc(userId, 'rejected', reason)}
        rejectReason={kycRejectReason}
        setRejectReason={setKycRejectReason}
      />

      {/* PROFESSIONAL CONFIRMATION MODAL (PERMANENT DELETE BROKER / USER / REVIEW / TESTIMONIAL) */}
      <DeleteConfirmModal
        modalData={deleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteAction}
      />

      {/* TOAST FEEDBACK */}
      {toast.show && (
        <div className="d2-toast">
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
