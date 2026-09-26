import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  X,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Trash2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { authService } from '../../auth/services/auth.service.js';
import useAuth from '../../auth/hooks/useAuth.js';
import { useToast } from '../../shared/components/toast/ToastContext.jsx';
import './KycModal.css';

export const KycModal = ({ isOpen, onClose, onKycUpdated }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [frontImage, setFrontImage] = useState('');
  const [backImage, setBackImage] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Body scroll lock and Escape key listener to close modal reliably
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Pre-fill existing data if user already submitted
  useEffect(() => {
    if (user?.kycData) {
      setFullName(user.kycData.fullName || '');
      setDob(user.kycData.dob || '');
      setPhone(user.kycData.phone || '');
      setAddress(user.kycData.address || '');
      setIdCardNumber(
        user.kycData.idCardNumber || user.kycData.aadhaarNumber || ''
      );
      setFrontImage(user.kycData.idCardFrontImage || user.kycData.aadhaarFrontImage || '');
      setBackImage(user.kycData.idCardBackImage || user.kycData.aadhaarBackImage || '');
      setConsent(true);
    }
  }, [user]);

  // Handle ID Card Number input
  const handleIdCardChange = (e) => {
    setIdCardNumber(e.target.value.toUpperCase());
  };

  // Convert uploaded image file to lightweight Base64 string with canvas compression
  const handleFileUpload = (e, setImage) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File', 'Please upload a photo file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const scaleSize = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.78);
        setImage(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Required Field', 'Please enter your Full Legal Name as on ID Card.');
      return;
    }

    const cleanId = idCardNumber.trim();
    if (!cleanId || cleanId.length < 3) {
      toast.error('Invalid ID Card', 'Please enter a valid ID Card number.');
      return;
    }

    if (!frontImage) {
      toast.error('ID Card Photo Required', 'Please upload a photo of the Front of your ID Card.');
      return;
    }

    if (!consent) {
      toast.error('Consent Required', 'Please accept the verification consent declaration.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.submitKyc({
        fullName: fullName.trim(),
        dob,
        phone,
        address,
        idCardNumber: cleanId,
        aadhaarNumber: cleanId,
        idCardFrontImage: frontImage,
        aadhaarFrontImage: frontImage,
        idCardBackImage: backImage,
        aadhaarBackImage: backImage,
      });

      toast.success(
        'KYC Submitted!',
        'Your ID Card details & documents were submitted for verification.'
      );

      if (onKycUpdated) {
        onKycUpdated(res.data?.user);
      }
      onClose();
    } catch (err) {
      toast.error('Submission Failed', err.message || 'Could not submit KYC. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const kycStatus = user?.kycStatus || 'not_submitted';
  const isVerified = user?.isKycVerified || false;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="kyc-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose?.();
          }
        }}
      >
        <motion.div
          className="kyc-modal-card"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle Ambient Brand Glow */}
          <div className="kyc-modal-ambient-glow" aria-hidden="true" />

          {/* Modal Header */}
          <div className="kyc-modal-header">
            <div className="kyc-header-left">
              <div className="kyc-shield-halo">
                <ShieldCheck size={20} strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="kyc-modal-title">Trader KYC Verification</h3>
                <p className="kyc-modal-subtitle">
                  Verify your Government ID to earn the Verified Trader badge
                </p>
              </div>
            </div>
            <button
              className="kyc-close-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose?.();
              }}
              type="button"
              aria-label="Close modal"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Status Banners */}
          {isVerified ? (
            <div className="kyc-status-banner verified">
              <CheckCircle2 size={16} strokeWidth={2.6} />
              <div>
                <strong>Account Fully Verified</strong>
                <div>You hold the official TradeSafe Verified Trader badge.</div>
              </div>
            </div>
          ) : kycStatus === 'pending' ? (
            <div className="kyc-status-banner pending">
              <Clock size={16} strokeWidth={2.6} />
              <div>
                <strong>Under Compliance Review</strong>
                <div>Your ID card and identity details are currently being inspected.</div>
              </div>
            </div>
          ) : kycStatus === 'rejected' ? (
            <div className="kyc-status-banner rejected">
              <AlertTriangle size={16} strokeWidth={2.6} />
              <div>
                <strong>Verification Needs Update</strong>
                <div>
                  Reason: {user?.kycData?.rejectionReason || 'Document unreadable. Please upload clearer photos.'}
                </div>
              </div>
            </div>
          ) : null}

          {/* Form */}
          <form className="kyc-form" onSubmit={handleSubmit}>
            {/* Section 1: Personal Details */}
            <div className="kyc-section-block">
              <div className="kyc-section-title">1. Legal Personal Details</div>
              
              <div className="kyc-form-grid">
                <div className="kyc-input-group">
                  <label className="kyc-label">Full Name (As on ID Card)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Syed Arastoo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="kyc-input"
                    disabled={isVerified}
                  />
                </div>

                <div className="kyc-input-group">
                  <label className="kyc-label">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="kyc-input"
                    disabled={isVerified}
                  />
                </div>
              </div>

              <div className="kyc-form-grid" style={{ marginTop: '12px' }}>
                <div className="kyc-input-group">
                  <label className="kyc-label">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="kyc-input"
                    disabled={isVerified}
                  />
                </div>

                <div className="kyc-input-group">
                  <label className="kyc-label">Residential Address</label>
                  <input
                    type="text"
                    placeholder="City, State, PIN code"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="kyc-input"
                    disabled={isVerified}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: ID Card & Document Upload */}
            <div className="kyc-section-block">
              <div className="kyc-section-title">2. Government ID Card Details</div>

              <div className="kyc-input-group" style={{ marginBottom: '14px' }}>
                <label className="kyc-label">Government ID Card Number</label>
                <input
                  type="text"
                  required
                  maxLength={30}
                  placeholder="e.g. A1234567 or National ID"
                  value={idCardNumber}
                  onChange={handleIdCardChange}
                  className="kyc-input kyc-aadhaar-input kyc-id-input"
                  disabled={isVerified}
                />
              </div>

              <div className="kyc-upload-grid">
                {/* Front Photo */}
                <div className="kyc-upload-cell">
                  <div className="kyc-upload-cell-label">
                    <span>ID Card Front Side</span>
                    {frontImage && <span className="kyc-checked-chip">✓ Uploaded</span>}
                  </div>
                  <div
                    className={`kyc-dropzone ${frontImage ? 'has-file' : ''}`}
                    onClick={() => !isVerified && document.getElementById('id-card-front-input').click()}
                  >
                    {frontImage ? (
                      <div className="kyc-preview-container">
                        <img src={frontImage} alt="ID Card Front" className="kyc-preview-img" />
                        {!isVerified && (
                          <button
                            type="button"
                            className="kyc-change-img-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFrontImage('');
                            }}
                          >
                            <Trash2 size={11} /> Change
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="kyc-dropzone-empty">
                        <Upload size={18} className="kyc-dropzone-icon" />
                        <span className="kyc-dropzone-text">Upload Front Side</span>
                        <span className="kyc-dropzone-sub">PNG, JPG up to 5MB</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="id-card-front-input"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, setFrontImage)}
                    disabled={isVerified}
                  />
                </div>

                {/* Back Photo */}
                <div className="kyc-upload-cell">
                  <div className="kyc-upload-cell-label">
                    <span>ID Card Back Side (Optional)</span>
                    {backImage && <span className="kyc-checked-chip">✓ Uploaded</span>}
                  </div>
                  <div
                    className={`kyc-dropzone ${backImage ? 'has-file' : ''}`}
                    onClick={() => !isVerified && document.getElementById('id-card-back-input').click()}
                  >
                    {backImage ? (
                      <div className="kyc-preview-container">
                        <img src={backImage} alt="ID Card Back" className="kyc-preview-img" />
                        {!isVerified && (
                          <button
                            type="button"
                            className="kyc-change-img-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBackImage('');
                            }}
                          >
                            <Trash2 size={11} /> Change
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="kyc-dropzone-empty">
                        <Upload size={18} className="kyc-dropzone-icon" />
                        <span className="kyc-dropzone-text">Upload Back Side</span>
                        <span className="kyc-dropzone-sub">Address proof section</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="id-card-back-input"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, setBackImage)}
                    disabled={isVerified}
                  />
                </div>
              </div>
            </div>

            {/* Consent Box */}
            <div className="kyc-consent-box">
              <input
                type="checkbox"
                id="kyc-consent-checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                disabled={isVerified}
                className="kyc-checkbox"
              />
              <label htmlFor="kyc-consent-checkbox" className="kyc-consent-text">
                I hereby declare that the ID Card details and document copies provided belong to me and are authentic.
                I consent to TradeSafeBrokers using this information exclusively for identity verification.
              </label>
            </div>

            {/* Action Buttons */}
            {!isVerified ? (
              <div className="kyc-actions-row">
                <button
                  type="button"
                  className="kyc-cancel-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose?.();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="kyc-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span>Submitting Details...</span>
                  ) : kycStatus === 'rejected' ? (
                    <>
                      <span>Re-Submit KYC</span>
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </>
                  ) : kycStatus === 'pending' ? (
                    <>
                      <span>Update &amp; Re-Submit</span>
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </>
                  ) : (
                    <>
                      <span>Submit for Verification</span>
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="kyc-actions-row">
                <button
                  type="button"
                  className="kyc-submit-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose?.();
                  }}
                >
                  Close Window
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default KycModal;
