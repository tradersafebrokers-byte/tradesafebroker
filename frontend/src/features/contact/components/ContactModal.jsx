import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Mail, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import apiClient from '../../auth/services/api.client.js';
import { useToast } from '../../shared/components/toast/ToastContext.jsx';
import './ContactModal.css';

export const ContactModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const planeControls = useAnimation();
  const colorControls = useAnimation();
  const windControls = useAnimation();

  // Escape key and scroll lock
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

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setShowSuccess(false);
      setSubmitting(false);
      planeControls.set({ x: -20, y: 20, scale: 1, rotate: 0 });
      colorControls.set({ fill: '#e25877' });
    }
  }, [isOpen, planeControls, colorControls]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Required Fields', 'Please fill in all fields before sending.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await apiClient.post('/contact', {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });

      // Cache ticket ID and inquiry details for real-time staff reply notification
      const ticketData = res?.data || res;
      if (ticketData) {
        try {
          const existing = JSON.parse(localStorage.getItem('tsb_submitted_tickets') || '[]');
          const newEntry = {
            id: ticketData._id,
            ticketId: ticketData.ticketId || `TSB-${String(ticketData._id || "").slice(-6).toUpperCase()}`,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim(),
            submittedAt: new Date().toISOString(),
          };
          const filtered = existing.filter((t) => t.ticketId !== newEntry.ticketId && t.id !== newEntry.id);
          filtered.unshift(newEntry);
          localStorage.setItem('tsb_submitted_tickets', JSON.stringify(filtered.slice(0, 30)));
          localStorage.setItem('tsb_user_email', email.trim().toLowerCase());

          window.dispatchEvent(new CustomEvent('tsb_ticket_created', { detail: newEntry }));
          if (typeof BroadcastChannel !== 'undefined') {
            const ch = new BroadcastChannel('tsb_support_channel');
            ch.postMessage({ type: 'TICKET_CREATED', ticket: newEntry });
            ch.close();
          }
        } catch (storageErr) {
          console.warn('Could not cache ticket locally:', storageErr);
        }
      }

      setIsSubmitted(true);

      // 1. Fly to center fast
      await planeControls.start({
        x: 180,
        y: 20,
        scale: 1.15,
        rotate: 10,
        transition: { duration: 0.6, ease: 'easeOut' },
      });

      // 2. Turn green
      await colorControls.start('green');

      // 3. Start wind animation
      windControls.start((i) => ({
        pathLength: [0, 0.5, 0],
        pathOffset: [0, 0.5, 1],
        opacity: [0, 1, 0],
        transition: { repeat: Infinity, duration: 0.5, ease: 'linear', delay: i * 0.15 },
      }));

      // 4. Fly away to top right
      planeControls.start({
        x: 1100,
        y: -700,
        scale: 0.8,
        rotate: -15,
        transition: { duration: 0.95, ease: 'easeIn' },
      });

      // 5. Show success message
      setTimeout(() => {
        setShowSuccess(true);
        toast.success('Message Sent!', 'Our support desk has received your inquiry.');
      }, 650);
    } catch (err) {
      toast.error('Submission Failed', err.response?.data?.message || err.message || 'Could not send message.');
      setIsSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setMessage('');
    setIsSubmitted(false);
    setShowSuccess(false);
    planeControls.set({ x: -20, y: 20, scale: 1, rotate: 0 });
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="contact-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose?.();
          }
        }}
      >
        <motion.div
          className="contact-card-wrapper"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="contact-card">
            {/* Close Button */}
            <button
              type="button"
              className="contact-close-btn"
              onClick={onClose}
              aria-label="Close Contact Us"
            >
              <X size={18} strokeWidth={2.4} />
            </button>

            {/* Background circles */}
            <div className="contact-bg-circle contact-bg-circle-1" />
            <div className="contact-bg-circle contact-bg-circle-2" />
            <div className="contact-bg-circle contact-bg-circle-3" />
            <div className="contact-bg-circle contact-bg-circle-4" />

            {/* Illustration Side with Animated Paper Plane */}
            <div className="contact-illustration-side">
              <motion.svg
                className="contact-paper-plane-svg"
                viewBox="0 0 200 200"
                width="260"
                height="260"
                initial={{ x: -20, y: 20, scale: 1, rotate: 0 }}
                animate={planeControls}
              >
                {/* Motion lines fade out on submit */}
                <motion.g animate={{ opacity: isSubmitted ? 0 : 1 }} transition={{ duration: 0.3 }}>
                  <path d="M30 150 L15 165" stroke="#fc5d21" strokeWidth="5" strokeLinecap="round" opacity="0.6" />
                  <path d="M50 170 L35 185" stroke="#fc5d21" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
                  <path d="M70 150 L55 165" stroke="#fc5d21" strokeWidth="5" strokeLinecap="round" opacity="0.6" />
                </motion.g>

                {/* Wind lines for flying away */}
                <g stroke="#fc5d21" strokeWidth="3" strokeLinecap="round">
                  <motion.line custom={0} x1="25" y1="105" x2="-120" y2="170" initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }} animate={windControls} />
                  <motion.line custom={1} x1="85" y1="130" x2="-60" y2="195" initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }} animate={windControls} />
                  <motion.line custom={2} x1="130" y1="175" x2="-15" y2="240" initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }} animate={windControls} />
                  <motion.line custom={3} x1="50" y1="100" x2="-95" y2="165" initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }} animate={windControls} />
                </g>

                <g stroke="#333" strokeWidth="4.5" strokeLinejoin="round">
                  <motion.polygon
                    points="85,130 95,165 170,40"
                    initial={{ fill: '#e25877' }}
                    variants={{ green: { fill: '#10b981', transition: { duration: 0.5 } } }}
                    animate={colorControls}
                  />
                  <motion.polygon
                    points="85,130 170,40 130,175"
                    initial={{ fill: '#ffb49e' }}
                    variants={{ green: { fill: '#6ee7b7', transition: { duration: 0.5 } } }}
                    animate={colorControls}
                  />
                  <motion.polygon
                    points="25,105 85,130 170,40"
                    initial={{ fill: '#ed84a1' }}
                    variants={{ green: { fill: '#34d399', transition: { duration: 0.5 } } }}
                    animate={colorControls}
                  />
                  <motion.polygon
                    points="25,105 75,135 170,40"
                    initial={{ fill: '#ffc3b2' }}
                    variants={{ green: { fill: '#a7f3d0', transition: { duration: 0.5 } } }}
                    animate={colorControls}
                  />
                </g>
                <circle cx="140" cy="115" r="2.5" fill="#333" />
              </motion.svg>
            </div>

            {/* Form Side */}
            <div className="contact-form-side">
              <div className="contact-header">
                <h2>Contact Us</h2>
                <p>Have questions or feedback? Send us a message and our trader desk will reach back.</p>
              </div>

              <div style={{ position: 'relative', width: '100%' }}>
                <motion.form
                  onSubmit={handleSubmit}
                  animate={{
                    opacity: isSubmitted ? 0 : 1,
                    scale: isSubmitted ? 0.95 : 1,
                    filter: isSubmitted ? 'blur(4px)' : 'none',
                  }}
                  transition={{ duration: 0.4 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    width: '100%',
                    pointerEvents: isSubmitted ? 'none' : 'auto',
                  }}
                >
                  <div className="contact-input-group">
                    <User className="contact-input-icon" size={18} />
                    <input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="contact-input-group">
                    <Mail className="contact-input-icon" size={18} />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="contact-input-group textarea-group">
                    <textarea
                      placeholder="How can we help you? (Inquiries, broker review requests, or bug reports)..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="contact-submit-btn"
                    disabled={submitting}
                  >
                    <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                    <ArrowRight size={17} />
                  </button>
                </motion.form>

                {/* Sent Successfully Screen */}
                {showSuccess && (
                  <motion.div
                    className="contact-success-wrap"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      style={{ marginBottom: '14px', color: '#10b981' }}
                    >
                      <CheckCircle2 size={64} strokeWidth={2.3} />
                    </motion.div>
                    <h3 className="contact-success-title">Sent Successfully!</h3>
                    <p className="contact-success-desc">
                      Thank you, {name || 'Trader'}. We have received your message and will reply to{' '}
                      <strong>{email}</strong> shortly.
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        className="contact-reset-btn"
                        onClick={handleReset}
                      >
                        Send Another
                      </button>
                      <button
                        type="button"
                        className="contact-reset-btn"
                        style={{ background: '#10b981', color: '#ffffff', border: 'none' }}
                        onClick={onClose}
                      >
                        Done
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default ContactModal;
