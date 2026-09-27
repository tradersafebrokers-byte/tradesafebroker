import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, CheckCircle2, ChevronLeft, ChevronRight, Clock, CornerDownRight } from 'lucide-react';
import apiClient from '../../auth/services/api.client.js';
import useAuth from '../../auth/hooks/useAuth.js';
import './AdminReplyPopup.css';

const POLL_INTERVAL = 60000; // 60 seconds

const AdminReplyPopup = () => {
  const { isAuthenticated, user } = useAuth();
  const [replies, setReplies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);

  const fetchReplies = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiClient.get('/contact/my-replies');
      const data = res?.data?.replies || [];
      if (data.length > 0) {
        setReplies(data);
        setDismissed(false);
        setCurrentIndex(0);
      } else {
        setReplies([]);
      }
    } catch {
      // Silently fail — don't disturb the user
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setReplies([]);
      return;
    }
    fetchReplies();
    const interval = setInterval(fetchReplies, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchReplies]);

  const handleMarkAsRead = async (id) => {
    setMarkingRead(true);
    try {
      await apiClient.patch(`/contact/${id}/mark-read`);
      setReplies((prev) => prev.filter((r) => r._id !== id));
      if (currentIndex >= replies.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    } catch {
      // Silently fail
    } finally {
      setMarkingRead(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleMarkAllRead = async () => {
    setMarkingRead(true);
    try {
      await Promise.all(replies.map((r) => apiClient.patch(`/contact/${r._id}/mark-read`)));
      setReplies([]);
      setCurrentIndex(0);
    } catch {} finally {
      setMarkingRead(false);
    }
  };

  if (!isAuthenticated || replies.length === 0 || dismissed) return null;

  const current = replies[currentIndex];
  if (!current) return null;

  const repliedDate = current.repliedAt
    ? new Date(current.repliedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="admin-reply-popup"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        key="admin-reply-popup"
      >
        {/* Header */}
        <div className="arp-header">
          <div className="arp-header-left">
            <div className="arp-icon-badge">
              <MessageSquare size={16} strokeWidth={2.4} />
            </div>
            <div className="arp-header-text">
              <span className="arp-header-title">Admin Response</span>
              {current.ticketId && (
                <span className="arp-ticket-badge">#{current.ticketId}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="arp-close-btn"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>

        {/* Navigation if multiple replies */}
        {replies.length > 1 && (
          <div className="arp-nav-row">
            <button
              type="button"
              className="arp-nav-btn"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft size={14} />
            </button>
            <span className="arp-nav-count">
              {currentIndex + 1} of {replies.length} unread
            </span>
            <button
              type="button"
              className="arp-nav-btn"
              disabled={currentIndex === replies.length - 1}
              onClick={() => setCurrentIndex((i) => Math.min(replies.length - 1, i + 1))}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Reply Content */}
        <div className="arp-body">
          <div className="arp-reply-card">
            <div className="arp-reply-label">
              <CornerDownRight size={13} />
              <span>Admin Reply</span>
            </div>
            <p className="arp-reply-text">{current.replyMessage}</p>
          </div>

          <div className="arp-original-card">
            <div className="arp-original-label">Your Message</div>
            <p className="arp-original-text">{current.message}</p>
          </div>

          {repliedDate && (
            <div className="arp-date-row">
              <Clock size={12} />
              <span>{repliedDate}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="arp-actions">
          <button
            type="button"
            className="arp-mark-read-btn"
            onClick={() => handleMarkAsRead(current._id)}
            disabled={markingRead}
          >
            <CheckCircle2 size={14} />
            <span>{markingRead ? 'Marking...' : 'Mark as Read'}</span>
          </button>
          {replies.length > 1 && (
            <button
              type="button"
              className="arp-mark-all-btn"
              onClick={handleMarkAllRead}
              disabled={markingRead}
            >
              <span>Read All ({replies.length})</span>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default AdminReplyPopup;
