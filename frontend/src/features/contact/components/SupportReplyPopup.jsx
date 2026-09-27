import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  ShieldCheck,
  Clock,
  ChevronRight,
  CheckCircle2,
  Mail,
  User,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import apiClient from "../../auth/services/api.client.js";
import useAuth from "../../auth/hooks/useAuth.js";
import "./SupportReplyPopup.css";

const DISMISSED_KEY = "tsb_dismissed_reply_ids";
const SUBMITTED_TICKETS_KEY = "tsb_submitted_tickets";
const USER_EMAIL_KEY = "tsb_user_email";
const ACTIVE_UNSEEN_KEY = "tsb_active_unseen_reply";
const CHANNEL_NAME = "tsb_support_channel";

export default function SupportReplyPopup() {
  const { user } = useAuth();

  // Load initial active reply from localStorage so any opened tab immediately displays it
  const [activeReply, setActiveReply] = useState(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_UNSEEN_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const dismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
        const replyId = String(parsed._id || parsed.ticketId || "");
        if (parsed && !dismissed.includes(replyId)) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

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
        localStorage.removeItem(ACTIVE_UNSEEN_KEY);
      } catch (e) {
        console.warn("Could not save dismissed ID:", e);
      }
      return next;
    });

    // Notify all other browser tabs via BroadcastChannel
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const ch = new BroadcastChannel(CHANNEL_NAME);
        ch.postMessage({ type: "DISMISS_REPLY", id, ticketId });
        ch.close();
      }
    } catch {}
  }, []);

  // Save active unseen reply so new/other tabs get it immediately
  useEffect(() => {
    if (activeReply) {
      try {
        localStorage.setItem(ACTIVE_UNSEEN_KEY, JSON.stringify(activeReply));
      } catch {}
    } else {
      try {
        localStorage.removeItem(ACTIVE_UNSEEN_KEY);
      } catch {}
    }
  }, [activeReply]);

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
    } catch {
      // Quietly ignore network failures during background polling
    }
  }, [user?.email]);

  // Initial check & interval polling (every 10 seconds)
  useEffect(() => {
    checkReplies();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        checkReplies();
      }
    }, 10000);

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
            const currentDismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
            const replyId = String(reply._id || reply.ticketId || "");
            if (!currentDismissed.includes(replyId)) {
              setActiveReply(reply);
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
            const currentDismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
            const replyId = String(parsed.reply._id || parsed.reply.ticketId || "");
            if (!currentDismissed.includes(replyId)) {
              setActiveReply(parsed.reply);
            }
          }
        } catch {}
      } else if (e.key === ACTIVE_UNSEEN_KEY) {
        try {
          if (e.newValue) {
            setActiveReply(JSON.parse(e.newValue));
          } else {
            setActiveReply(null);
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

  // Find user's original message if available in tickets
  let submittedTickets = [];
  try {
    submittedTickets = JSON.parse(localStorage.getItem(SUBMITTED_TICKETS_KEY) || "[]");
  } catch {}
  const localMatch = submittedTickets.find(
    (t) => t.ticketId === activeReply.ticketId || t.id === activeReply._id
  );
  const userOriginalMessage =
    activeReply.message || localMatch?.message || "Inquiry submitted to TradeSafeBrokers team";
  const userDisplayName = activeReply.name || localMatch?.name || user?.username || "You";

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          1. FIXED BOTTOM POPUP (CLEAN WHITE MINIMAL - STAYS UNTIL OPENED OR X)
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {!isExpandedModal && (
          <div className="tsb-white-bottom-anchor">
            <motion.div
              className="tsb-white-reply-bar"
              initial={{ opacity: 0, y: 35, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 25, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={handleOpenFullModal}
              role="dialog"
              aria-label="Admin reply notification"
            >
              {/* Top Row: Status Badge & Close X */}
              <div className="tsb-wrb-top-row">
                <div className="tsb-wrb-badge-group">
                  <span className="tsb-wrb-ping-dot" />
                  <span className="tsb-wrb-brand">Admin Replied</span>
                  <span className="tsb-wrb-ticket">#{ticketId}</span>
                </div>

                <button
                  type="button"
                  className="tsb-wrb-close-btn"
                  onClick={handleDismissCard}
                  title="Dismiss (X)"
                  aria-label="Close"
                >
                  <X size={15} strokeWidth={2.4} />
                </button>
              </div>

              {/* Message Preview Text */}
              <div className="tsb-wrb-content">
                <h4 className="tsb-wrb-heading">
                  TradeSafeBrokers Support replied to your inquiry
                </h4>

                <p className="tsb-wrb-snippet">
                  "{activeReply.replyMessage}"
                </p>
              </div>

              {/* Bottom Row: Timestamp and Open CTA */}
              <div className="tsb-wrb-footer">
                <span className="tsb-wrb-time">
                  <Clock size={11} />
                  <span>
                    {activeReply.repliedAt
                      ? new Date(activeReply.repliedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Just now"}
                  </span>
                </span>

                <span className="tsb-wrb-open-link">
                  <span>Open Message</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          2. CLEAN WHITE MINIMAL THREAD MODAL (NO CLUNKY BOXES)
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isExpandedModal && (
          <div className="tsb-white-modal-overlay" onClick={handleModalMinimize}>
            <motion.div
              className="tsb-white-modal-sheet"
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Header */}
              <div className="tsb-wm-header">
                <div>
                  <div className="tsb-wm-ticket-tag">
                    <ShieldCheck size={14} color="#10b981" />
                    <span>Verified Support Ticket #{ticketId}</span>
                  </div>
                  <h3 className="tsb-wm-title">Inquiry Conversation</h3>
                </div>

                <button
                  type="button"
                  className="tsb-wm-close-btn"
                  onClick={handleModalMinimize}
                  title="Close to bottom"
                >
                  <X size={18} strokeWidth={2.2} />
                </button>
              </div>

              {/* Modal Conversation Thread */}
              <div className="tsb-wm-body">
                {/* 1. User Message (Clean bubble) */}
                <div className="tsb-wm-msg-row user-row">
                  <div className="tsb-wm-avatar user-avatar">
                    <User size={15} />
                  </div>
                  <div className="tsb-wm-msg-bubble user-bubble">
                    <div className="tsb-wm-msg-meta">
                      <strong>{userDisplayName}</strong>
                      {activeReply.createdAt && (
                        <span>
                          {new Date(activeReply.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="tsb-wm-msg-text">{userOriginalMessage}</p>
                  </div>
                </div>

                {/* 2. Admin Reply (Clean bubble) */}
                <div className="tsb-wm-msg-row admin-row">
                  <div className="tsb-wm-avatar admin-avatar">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="tsb-wm-msg-bubble admin-bubble">
                    <div className="tsb-wm-msg-meta">
                      <div className="tsb-wm-admin-name-row">
                        <strong>TradeSafeBrokers Support Desk</strong>
                        <span className="tsb-wm-admin-pill">Staff</span>
                      </div>
                      {activeReply.repliedAt && (
                        <span>
                          {new Date(activeReply.repliedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>

                    {activeReply.replySubject && (
                      <div className="tsb-wm-subject">
                        <Mail size={13} />
                        <span>{activeReply.replySubject}</span>
                      </div>
                    )}

                    <p className="tsb-wm-msg-text admin-text">
                      {activeReply.replyMessage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="tsb-wm-footer">
                <span className="tsb-wm-footer-info">
                  A copy has also been sent to your email.
                </span>

                <div className="tsb-wm-footer-buttons">
                  <button
                    type="button"
                    className="tsb-wm-btn-keep"
                    onClick={handleModalMinimize}
                    title="Keep popup at the bottom of your screen"
                  >
                    Keep at Bottom
                  </button>
                  <button
                    type="button"
                    className="tsb-wm-btn-close"
                    onClick={handleModalDismiss}
                    title="Mark as read and remove popup"
                  >
                    <CheckCircle2 size={15} />
                    <span>Mark as Read &amp; Close</span>
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
