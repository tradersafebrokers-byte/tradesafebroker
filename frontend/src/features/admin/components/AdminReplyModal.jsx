import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  X,
  User,
  Clock,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import './AdminReplyModal.css';

const QUICK_TEMPLATES = [
  {
    id: 'ack',
    label: 'Acknowledgment',
    icon: Clock,
    subject: (ticketId) => `Re: [Ticket #${ticketId}] We are reviewing your inquiry - TradeSafeBrokers`,
    body: (name, ticketId) =>
      `Hi ${name},\n\nThank you for reaching out to the TradeSafeBrokers Executive Support Desk.\n\nWe have received your message regarding ticket #${ticketId}. Our compliance and research team is currently investigating your query and checking global regulatory records.\n\nWe will update you with complete findings shortly.\n\nWarm regards,\nTradeSafeBrokers Support Team`,
  },
  {
    id: 'kyc',
    label: 'KYC Verification',
    icon: ShieldCheck,
    subject: (ticketId) => `Re: [Ticket #${ticketId}] Trader KYC Verification Assistance - TradeSafeBrokers`,
    body: (name, ticketId) =>
      `Hi ${name},\n\nThank you for contacting us regarding your account verification.\n\nTo ensure rapid approval of your KYC:\n1. Upload a clear, government-issued photo ID (Passport, Driving License, or National ID Card).\n2. Ensure all four corners are visible without glare or blur.\n3. Make sure the full name matches your registered TradeSafeBrokers profile.\n\nOnce submitted via your dashboard, our compliance team reviews documents within 15–30 minutes.\n\nBest regards,\nTradeSafeBrokers Compliance Desk`,
  },
  {
    id: 'broker',
    label: 'Broker Audit',
    icon: HelpCircle,
    subject: (ticketId) => `Re: [Ticket #${ticketId}] Broker Listing & Regulation Audit - TradeSafeBrokers`,
    body: (name, ticketId) =>
      `Hi ${name},\n\nThank you for your inquiry regarding broker listings on TradeSafeBrokers.\n\nEvery broker listed in our directory undergoes strict multi-tier vetting across SEBI, FCA, ASIC, and CySEC frameworks. If you are reporting a dispute or inquiring about a specific broker's regulatory authenticity, our audit department will review the submission details against our real-time database.\n\nSincerely,\nTradeSafeBrokers Research Desk`,
  },
  {
    id: 'resolved',
    label: 'Issue Resolved',
    icon: CheckCircle2,
    subject: (ticketId) => `Re: [Ticket #${ticketId}] Issue Resolved - TradeSafeBrokers`,
    body: (name, ticketId) =>
      `Hi ${name},\n\nWe are pleased to inform you that your inquiry under ticket #${ticketId} has been successfully resolved.\n\nPlease log into your account or check the updated directory to confirm. If you have any further questions, feel free to reply directly to this email at any time.\n\nThank you for choosing TradeSafeBrokers!\nTradeSafeBrokers Customer Support`,
  },
];

export default function AdminReplyModal({
  isOpen,
  message,
  onClose,
  onSendReply,
  sending = false,
}) {
  const [subject, setSubject] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activeTemplate, setActiveTemplate] = useState('');

  const ticketId = message
    ? message.ticketId || `TSB-${message._id.slice(-6).toUpperCase()}`
    : '';

  useEffect(() => {
    if (message && isOpen) {
      setSubject(`Re: [Ticket #${ticketId}] Support Inquiry - TradeSafeBrokers`);
      setReplyText(
        message.replyMessage
          ? `Hi ${message.name},\n\nFollowing up on your inquiry:\n\n`
          : `Hi ${message.name},\n\nThank you for reaching out to the TradeSafeBrokers Support Desk.\n\n`
      );
      setActiveTemplate('');
    }
  }, [message, isOpen, ticketId]);

  if (!isOpen || !message) return null;

  const handleApplyTemplate = (tpl) => {
    setActiveTemplate(tpl.id);
    setSubject(tpl.subject(ticketId));
    setReplyText(tpl.body(message.name || 'Trader', ticketId));
  };

  const handleSend = () => {
    if (!replyText.trim()) return;
    onSendReply({
      messageId: message._id,
      replySubject: subject.trim(),
      replyMessage: replyText.trim(),
    });
  };

  return (
    <AnimatePresence>
      <div className="d2-reply-modal-backdrop" onClick={onClose}>
        <motion.div
          className="d2-reply-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="d2-reply-modal-header">
            <div className="d2-reply-modal-header-left">
              <div className="d2-reply-modal-icon-wrap">
                <Mail size={18} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 className="d2-reply-modal-title">Reply to User Inquiry</h3>
                  <span className="d2-reply-ticket-pill">#{ticketId}</span>
                </div>
                <p className="d2-reply-modal-sub">
                  Official response will be delivered directly to the user's email inbox.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="d2-reply-close-btn"
              onClick={onClose}
              disabled={sending}
              title="Close modal"
            >
              <X size={17} strokeWidth={2.4} />
            </button>
          </div>

          <div className="d2-reply-modal-body">
            {/* User Info & Original Message Card */}
            <div className="d2-reply-user-card">
              <div className="d2-reply-user-top">
                <div className="d2-reply-avatar">
                  {message.name ? message.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="d2-reply-user-info">
                  <div className="d2-reply-user-name">
                    {message.name}
                    <span className="d2-reply-user-email">({message.email})</span>
                  </div>
                  <div className="d2-reply-time">
                    <Clock size={11} />
                    <span>
                      Received {new Date(message.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="d2-reply-original-quote">
                <div className="d2-reply-quote-label">
                  <FileText size={11} />
                  <span>Original User Message:</span>
                </div>
                <p className="d2-reply-quote-text">{message.message}</p>
              </div>
            </div>

            {/* Quick Templates Row */}
            <div className="d2-reply-templates-section">
              <div className="d2-reply-templates-label">
                <Sparkles size={12} color="#fc5d21" />
                <span>Quick Response Templates:</span>
              </div>
              <div className="d2-reply-template-chips">
                {QUICK_TEMPLATES.map((tpl) => {
                  const Icon = tpl.icon;
                  const isSelected = activeTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      className={`d2-reply-template-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => handleApplyTemplate(tpl)}
                    >
                      <Icon size={12} />
                      <span>{tpl.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Field */}
            <div className="d2-reply-field-group">
              <label className="d2-reply-label" htmlFor="reply-subject">
                Email Subject Line
              </label>
              <input
                id="reply-subject"
                type="text"
                className="d2-reply-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject of the email..."
                disabled={sending}
              />
            </div>

            {/* Reply Textarea */}
            <div className="d2-reply-field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="d2-reply-label" htmlFor="reply-body" style={{ margin: 0 }}>
                  Official Email Response
                </label>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {replyText.length} characters
                </span>
              </div>
              <textarea
                id="reply-body"
                className="d2-reply-textarea"
                rows={7}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your official response to the user here..."
                disabled={sending}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="d2-reply-modal-footer">
            <div className="d2-reply-footer-hint">
              <span>⚡ Formatted into official TradeSafeBrokers HTML template</span>
            </div>
            <div className="d2-reply-footer-actions">
              <button
                type="button"
                className="d2-reply-btn-cancel"
                onClick={onClose}
                disabled={sending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="d2-reply-btn-send"
                onClick={handleSend}
                disabled={sending || !replyText.trim()}
              >
                {sending ? (
                  <>
                    <span className="d2-reply-spinner" />
                    <span>Dispatching Email...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} strokeWidth={2.2} />
                    <span>Send Email Response</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
