import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  CornerDownRight,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Mail,
  User,
} from "lucide-react";
import apiClient from "../../auth/services/api.client.js";
import useAuth from "../../auth/hooks/useAuth.js";
import "./SupportReplyPopup.css";

const DISMISSED_KEY = "tsb_dismissed_reply_ids";
const SUBMITTED_TICKETS_KEY = "tsb_submitted_tickets";
const USER_EMAIL_KEY = "tsb_user_email";
const CHANNEL_NAME = "tsb_support_channel";

export default function SupportReplyPopup() {
  const { user } = useAuth();
  const [activeReply, setActiveReply] = useState(null);
  const [isExpandedModal, setIsExpandedModal] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
    } catch {
      return [];
    }
  });

  // Track dismissed IDs helper
  const addDismissedId = useCallback((id, ticketId) => {
    setDismissedIds((prev) => {
      const next = Array.from(new Set([...prev, String(id), String(ticketId)].filter(Boolean)));
      try {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn("Could not save dismissed ID:", e);
      }
      return next;
    });

    // Notify other tabs via BroadcastChannel
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const ch = new BroadcastChannel(CHANNEL_NAME);
        ch.postMessage({ type: "DISMISS_REPLY", id, ticketId });
        ch.close();
      }
    } catch {}
  }, []);

  // Check if a reply is already dismissed
  const isReplyDismissed = useCallback(
    (reply) => {
      if (!reply) return true;
      const id = String(reply._id || "");
      const ticketId = String(reply.ticketId || "");
      return dismissedIds.includes(id) || dismissedIds.includes(ticketId);
    },
    [dismissedIds]
  );

  // Poll / Fetch user replies from backend
  const checkReplies = useCallback(async () => {
    try {
      let tickets = [];
      try {
        tickets = JSON.parse(localStorage.getItem(SUBMITTED_TICKETS_KEY) || "[]");
      } catch {}

      const ticketIds = tickets.map((t) => t.ticketId).filter(Boolean);
      let storedEmail = "";
      try {
        storedEmail = localStorage.getItem(USER_EMAIL_KEY) || "";
      } catch {}

      const userEmail = (user?.email || storedEmail || "").trim();

      // If no tickets submitted and no email stored, nothing to check
      if (ticketIds.length === 0 && !userEmail) {
        return;
      }

      const res = await apiClient.get("/contact/replies", {
        params: {
          ticketIds: ticketIds.join(","),
          email: userEmail,
        },
      });

      const payload = res?.data?.replies || res?.replies || [];
      if (Array.isArray(payload) && payload.length > 0) {
        // Find latest un-dismissed reply
        const currentDismissed = (() => {
          try {
            return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
          } catch {
            return [];
          }
        })();

        const unread = payload.find(
          (r) => !currentDismissed.includes(String(r._id)) && !currentDismissed.includes(String(r.ticketId))
        );

        if (unread) {
          // Augment with local question text if missing
          const matchingSubmitted = tickets.find(
            (t) => t.ticketId === unread.ticketId || t.id === unread._id
          );
          if (matchingSubmitted && (!unread.message || unread.message.length === 0)) {
            unread.message = matchingSubmitted.message;
          }
          setActiveReply(unread);
        } else {
          setActiveReply(null);
        }
      }
    } catch (err) {
      // Quietly ignore network failures during background polling
    }
  }, [user?.email]);

  // Initial check & interval polling
  useEffect(() => {
    checkReplies();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        checkReplies();
      }
    }, 12000); // Poll every 12s

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkReplies();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", checkReplies);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", checkReplies);
    };
  }, [checkReplies]);

  // Cross-tab synchronization via BroadcastChannel & localStorage events
  useEffect(() => {
    let ch;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        ch = new BroadcastChannel(CHANNEL_NAME);
        ch.onmessage = (event) => {
          const { type, reply, id, ticketId } = event.data || {};
          if (type === "NEW_REPLY" && reply) {
            // Check if matches user or local tickets
            let tickets = [];
            try {
              tickets = JSON.parse(localStorage.getItem(SUBMITTED_TICKETS_KEY) || "[]");
            } catch {}
            const ticketIds = tickets.map((t) => t.ticketId).filter(Boolean);
            const userEmail = (user?.email || localStorage.getItem(USER_EMAIL_KEY) || "").toLowerCase().trim();

            const isMatch =
              ticketIds.includes(reply.ticketId) ||
              (reply.email && reply.email.toLowerCase().trim() === userEmail) ||
              tickets.some((t) => t.id === reply._id);

            if (isMatch) {
              const currentDismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
              if (!currentDismissed.includes(String(reply._id)) && !currentDismissed.includes(String(reply.ticketId))) {
                setActiveReply(reply);
              }
            }
          } else if (type === "DISMISS_REPLY") {
            setDismissedIds((prev) => Array.from(new Set([...prev, String(id), String(ticketId)].filter(Boolean))));
            setActiveReply((cur) => {
              if (cur && (String(cur._id) === String(id) || String(cur.ticketId) === String(ticketId))) {
                return null;
              }
              return cur;
            });
            setIsExpandedModal(false);
          } else if (type === "TICKET_CREATED") {
            checkReplies();
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel not supported:", e);
    }

    // Storage event for other tabs
    const handleStorage = (e) => {
      if (e.key === DISMISSED_KEY) {
        try {
          const updatedDismissed = JSON.parse(e.newValue || "[]");
          setDismissedIds(updatedDismissed);
          setActiveReply((cur) => {
            if (cur && (updatedDismissed.includes(String(cur._id)) || updatedDismissed.includes(String(cur.ticketId)))) {
              return null;
            }
            return cur;
          });
          setIsExpandedModal(false);
        } catch {}
      } else if (e.key === "tsb_latest_admin_reply_event") {
        try {
          const parsed = JSON.parse(e.newValue || "{}");
          if (parsed?.reply) {
            checkReplies();
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    // Custom in-window event (e.g. ticket submitted in this same tab)
    const handleLocalTicket = () => {
      checkReplies();
    };
    window.addEventListener("tsb_ticket_created", handleLocalTicket);

    return () => {
      if (ch) ch.close();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("tsb_ticket_created", handleLocalTicket);
    };
  }, [user?.email, checkReplies]);

  // Handle closing ("X") from bottom card
  const handleDismissCard = (e) => {
    e.stopPropagation();
    if (!activeReply) return;
    addDismissedId(activeReply._id, activeReply.ticketId);
    setActiveReply(null);
    setIsExpandedModal(false);
  };

  // Handle clicking bottom card to open modal
  const handleOpenFullModal = () => {
    setIsExpandedModal(true);
  };

  // Handle "Mark as Read & Dismiss" from modal
  const handleModalDismiss = () => {
    if (!activeReply) return;
    addDismissedId(activeReply._id, activeReply.ticketId);
    setActiveReply(null);
    setIsExpandedModal(false);
  };

  // Handle "Keep at Bottom" from modal
  const handleModalMinimize = () => {
    setIsExpandedModal(false);
  };

  if (!activeReply || isReplyDismissed(activeReply)) {
    return null;
  }

  const ticketId = activeReply.ticketId || `TSB-${String(activeReply._id).slice(-6).toUpperCase()}`;

  return (
    <>
      {/* ------------------------------------------------------------------
          1. FIXED BOTTOM POPUP CARD (Stays fixed across tabs until X or Open)
          ------------------------------------------------------------------ */}
      <AnimatePresence>
        {!isExpandedModal && (
          <div className="tsb-reply-bottom-container">
            <motion.div
              className="tsb-reply-card"
              initial={{ opacity: 0, y: 35, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 25, scale: 0.95 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={handleOpenFullModal}
              role="dialog"
              aria-label="Support desk reply notification"
            >
              <div className="tsb-reply-glow-bar" />

              {/* Header */}
              <div className="tsb-reply-header">
                <div className="tsb-reply-header-left">
                  <div className="tsb-reply-avatar-wrap">
                    <MessageSquare size={17} strokeWidth={2.4} />
                    <span className="tsb-reply-online-ping" />
                  </div>
                  <div className="tsb-reply-title-wrap">
                    <div className="tsb-reply-title">
                      <span>Official Staff Reply</span>
                      <span className="tsb-reply-ticket-badge">#{ticketId}</span>
                    </div>
                    <div className="tsb-reply-meta-sub">
                      <ShieldCheck size={12} color="#10b981" />
                      <span>TradeSafeBrokers Support Desk</span>
                    </div>
                  </div>
                </div>

                {/* Close "X" Button */}
                <button
                  type="button"
                  className="tsb-reply-close-btn"
                  onClick={handleDismissCard}
                  title="Dismiss reply"
                  aria-label="Dismiss notification"
                >
                  <X size={15} strokeWidth={2.4} />
                </button>
              </div>

              {/* Snippet Preview */}
              <div className="tsb-reply-snippet-box">
                {/* Admin Reply Preview */}
                <div className="tsb-reply-msg-preview">
                  <CornerDownRight size={14} className="tsb-reply-icon-accent" strokeWidth={2.5} />
                  <span className="tsb-reply-text-clamp">
                    <strong>Response:</strong> {activeReply.replyMessage}
                  </span>
                </div>

                {/* Original User Message Quote */}
                {activeReply.message && (
                  <div className="tsb-reply-user-quote">
                    <strong>You asked:</strong> "{activeReply.message}"
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="tsb-reply-action-bar">
                <div className="tsb-reply-time-tag">
                  <Clock size={11} />
                  <span>
                    {activeReply.repliedAt
                      ? new Date(activeReply.repliedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "Just now"}
                  </span>
                </div>

                <div className="tsb-reply-open-pill">
                  <span>Open Full Reply</span>
                  <ChevronRight size={13} strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------
          2. FULL THREAD CONVERSATION MODAL
          ------------------------------------------------------------------ */}
      <AnimatePresence>
        {isExpandedModal && (
          <div className="tsb-modal-backdrop" onClick={handleModalMinimize}>
            <motion.div
              className="tsb-modal-card"
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="tsb-modal-header">
                <div className="tsb-modal-header-left">
                  <div className="tsb-modal-icon-badge">
                    <MessageSquare size={20} strokeWidth={2.4} />
                  </div>
                  <div>
                    <h3 className="tsb-modal-title">
                      Official Support Desk Response
                      <span className="tsb-reply-ticket-badge">#{ticketId}</span>
                    </h3>
                    <p className="tsb-modal-sub">
                      Verified communication from TradeSafeBrokers Regulatory & Trader Support
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="tsb-reply-close-btn"
                  onClick={handleModalMinimize}
                  title="Minimize back to bottom"
                >
                  <X size={16} strokeWidth={2.4} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="tsb-modal-body">
                {/* 1. Original User Message */}
                <div className="tsb-thread-user-box">
                  <div className="tsb-thread-user-top">
                    <div className="tsb-thread-tag-user">
                      <User size={12} />
                      <span>Your Original Inquiry</span>
                    </div>
                    {activeReply.createdAt && (
                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                        Sent {new Date(activeReply.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    )}
                  </div>
                  <div className="tsb-thread-user-msg">
                    {activeReply.message || "Support inquiry details"}
                  </div>
                </div>

                {/* 2. Official Staff Response */}
                <div className="tsb-thread-admin-box">
                  <div className="tsb-thread-admin-top">
                    <div className="tsb-thread-tag-admin">
                      <ShieldCheck size={15} color="#10b981" />
                      <span>TradeSafeBrokers Support Response</span>
                    </div>
                    {activeReply.repliedAt && (
                      <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 600 }}>
                        {new Date(activeReply.repliedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    )}
                  </div>

                  {activeReply.replySubject && (
                    <div className="tsb-thread-admin-subject">
                      <Mail size={13} color="#94a3b8" />
                      <span>{activeReply.replySubject}</span>
                    </div>
                  )}

                  <div className="tsb-thread-admin-msg">
                    {activeReply.replyMessage}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="tsb-modal-footer">
                <div className="tsb-modal-footer-hint">
                  <Sparkles size={12} color="#fc5d21" />
                  <span>A copy of this response was also delivered to your email inbox.</span>
                </div>

                <div className="tsb-modal-footer-actions">
                  <button
                    type="button"
                    className="tsb-modal-btn-minimize"
                    onClick={handleModalMinimize}
                    title="Keep popup at the bottom of your screen"
                  >
                    Keep at Bottom
                  </button>
                  <button
                    type="button"
                    className="tsb-modal-btn-dismiss"
                    onClick={handleModalDismiss}
                    title="Mark as read and dismiss across all tabs"
                  >
                    <CheckCircle2 size={14} strokeWidth={2.4} />
                    <span>Mark as Read & Close</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
