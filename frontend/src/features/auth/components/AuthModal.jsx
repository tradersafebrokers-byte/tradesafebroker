import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import useAuth from "../hooks/useAuth.js";
import { loginUser, registerUser, verifyOtpCode, resendOtpCode } from "../state/auth.slice.js";
import { useToast } from "../../shared/components/toast/ToastContext.jsx";
import "./AuthModal.css";

// Exact Framer Motion Variants from Animated-otp-Verification-2
const boxVariants = {
  idle: {
    x: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  success: (i) => {
    const offsets = [120, 40, -40, -120];
    const rotations = [0, -8, 8, -12];
    const delay = 1.0;

    if (i === 0) {
      return {
        x: [0, 120, 120],
        rotate: [0, 12, 0],
        scale: [1, 1, 1.15, 1],
        zIndex: 4,
        transition: {
          duration: 0.9,
          times: [0, 0.5, 0.7, 1],
          delay,
          ease: [0.25, 1, 0.5, 1],
        },
      };
    }
    return {
      x: offsets[i],
      rotate: rotations[i],
      scale: [1, 0.85, 0],
      opacity: [1, 1, 0],
      zIndex: 3 - i,
      transition: {
        duration: 0.6,
        times: [0, 0.8, 1],
        delay,
        ease: "easeInOut",
      },
    };
  },
};

const textVariants = {
  idle: { color: "#ffffff" },
  success: {
    color: "rgba(255, 255, 255, 0)",
    transition: { delay: 1.0, duration: 0.2 },
  },
};

const tickContainerVariants = {
  idle: { opacity: 0, scale: 0.5, x: "-50%", y: "-50%" },
  success: {
    opacity: 1,
    scale: 1,
    x: "-50%",
    y: "-50%",
    transition: {
      delay: 1.45,
      duration: 0.5,
      type: "spring",
      stiffness: 250,
      damping: 20,
    },
  },
};

const tickPathVariants = {
  idle: { pathLength: 0 },
  success: {
    pathLength: 1,
    transition: { delay: 1.5, duration: 0.4, ease: "easeOut" },
  },
};

export const AuthModal = () => {
  const toast = useToast();
  const {
    isAuthModalOpen,
    authModalMode,
    pendingOtpEmail,
    loading,
    error,
    login,
    register,
    verifyOtp,
    finalizeOtpLogin,
    resendOtp,
    closeModal,
    switchMode,
    clearError,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Animated-otp-Verification-2 State
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [status, setStatus] = useState("idle"); // "idle" | "verifying" | "success"
  const [showVerifiedText, setShowVerifiedText] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const lastSubmittedOtpRef = useRef("");
  const otpSourceModeRef = useRef("login");

  useEffect(() => {
    if (isAuthModalOpen && authModalMode !== "otp") {
      otpSourceModeRef.current = authModalMode;
      setFieldErrors({});
      clearError();
      setOtp(["", "", "", ""]);
      setStatus("idle");
      setShowVerifiedText(false);
      lastSubmittedOtpRef.current = "";
    }
    if (isAuthModalOpen && authModalMode === "otp") {
      setOtp(["", "", "", ""]);
      setStatus("idle");
      setShowVerifiedText(false);
      lastSubmittedOtpRef.current = "";
      setFieldErrors({});
      setResendCooldown((prev) => (prev > 0 ? prev : 60));
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 150);
    }
  }, [isAuthModalOpen, authModalMode, clearError]);

  useEffect(() => {
    if (authModalMode !== "otp" || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [authModalMode, resendCooldown]);

  // Auto-verify once all 4 digits are entered (Animated-otp-Verification-2 flow)
  useEffect(() => {
    if (authModalMode !== "otp") return;
    const isComplete = otp.every((digit) => digit !== "");
    const fullOtp = otp.join("");

    if (isComplete && status === "idle" && lastSubmittedOtpRef.current !== fullOtp) {
      lastSubmittedOtpRef.current = fullOtp;
      inputRefs.forEach((ref) => {
        if (ref.current) ref.current.blur();
      });

      const runVerification = async () => {
        const targetEmail = pendingOtpEmail || email.trim();
        setStatus("verifying");

        const action = await verifyOtp({ email: targetEmail, otp: fullOtp });

        if (verifyOtpCode.fulfilled.match(action)) {
          // Play FULL 2.0s Animated-otp-Verification-2 animation, then wait 1 FULL SECOND (total 3000ms) before redirect
          setStatus("success");

          setTimeout(() => {
            setShowVerifiedText(true);
          }, 1500);

          setTimeout(() => {
            finalizeOtpLogin(action.payload);
            toast.success(
              otpSourceModeRef.current === "login" ? "Welcome back!" : "Verified successfully!",
              `Signed in as ${action.payload?.username || "Trader"}.`
            );
          }, 3000);
        } else {
          setStatus("idle");
          setShowVerifiedText(false);
          setOtp(["", "", "", ""]);
          lastSubmittedOtpRef.current = "";
          setTimeout(() => {
            inputRefs[0].current?.focus();
          }, 100);
        }
      };

      runVerification();
    }
  }, [otp, authModalMode, status, pendingOtpEmail, email, verifyOtp, finalizeOtpLogin, toast]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isAuthModalOpen && status !== "success") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeModal, status]);

  const handleOtpChange = (index, e) => {
    if (status !== "idle") return;
    const value = e.target.value;
    if (isNaN(value)) return;
    if (error) clearError();

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (status !== "idle") return;
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    if (status !== "idle") return;
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 4).split("");
    if (pastedData.some((char) => isNaN(char))) return;
    if (error) clearError();

    const newOtp = [...otp];
    pastedData.forEach((char, index) => {
      newOtp[index] = char;
    });
    setOtp(newOtp);

    const nextEmptyIndex = pastedData.length < 4 ? pastedData.length : 3;
    if (inputRefs[nextEmptyIndex]?.current) {
      inputRefs[nextEmptyIndex].current.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending || status === "success") return;
    const targetEmail = pendingOtpEmail || email.trim();
    if (!targetEmail) return;

    setIsResending(true);
    clearError();
    const action = await resendOtp({ email: targetEmail });
    setIsResending(false);

    if (resendOtpCode.fulfilled.match(action)) {
      setOtp(["", "", "", ""]);
      setStatus("idle");
      setShowVerifiedText(false);
      lastSubmittedOtpRef.current = "";
      setResendCooldown(60);
      inputRefs[0].current?.focus();
      toast.success("Code Resent!", `A fresh 4-digit OTP was sent to ${targetEmail}.`);
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (error) clearError();
    if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: null }));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) clearError();
    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) clearError();
    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
  };

  const validateForm = () => {
    const errs = {};
    if (authModalMode === "register") {
      if (!username.trim()) {
        errs.username = "Username is required";
      } else if (username.trim().length < 3) {
        errs.username = "Username must be at least 3 characters";
      }
    }
    if (!email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      errs.email = "Please provide a valid email address";
    }
    if (!password) {
      errs.password = "Password is required";
    } else if (authModalMode === "register" && password.length < 6) {
      errs.password = "Password must be at least 6 characters long";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    if (authModalMode === "login") {
      otpSourceModeRef.current = "login";
      const toastId = toast.loading("Signing in...", "Verifying your credentials...");
      const action = await login({ email: email.trim(), password });
      if (loginUser.fulfilled.match(action)) {
        if (action.payload?.requiresOtp) {
          setResendCooldown(action.payload.cooldownSeconds || 60);
          toast.update(toastId, {
            type: "success",
            title: "Verification Required",
            message: `Please check ${action.payload?.email || email} for your registration code.`,
          });
        } else {
          toast.update(toastId, {
            type: "success",
            title: "Welcome back!",
            message: `Signed in as ${action.payload?.user?.username || action.payload?.username || "Trader"}.`,
          });
        }
      } else {
        toast.dismiss(toastId);
      }
    } else {
      otpSourceModeRef.current = "register";
      const toastId = toast.loading("Sending 4-digit OTP...", "Preparing verification email");
      const action = await register({
        email: email.trim(),
        username: username.trim(),
        password,
      });
      if (registerUser.fulfilled.match(action)) {
        setResendCooldown(action.payload?.cooldownSeconds || 60);
        toast.update(toastId, {
          type: "success",
          title: "4-Digit OTP Sent!",
          message: `Check ${action.payload?.email || email} for your verification code.`,
        });
      } else {
        toast.dismiss(toastId);
      }
    }
  };

  const usernameError =
    fieldErrors.username ||
    (authModalMode === "register" && error?.toLowerCase().includes("username") ? error : null);

  const emailError =
    fieldErrors.email ||
    (authModalMode === "register" && error?.toLowerCase().includes("email") ? error : null);

  const isCredentialError = Boolean(
    error &&
      (error.toLowerCase().includes("invalid") ||
        error.toLowerCase().includes("password") ||
        error.toLowerCase().includes("credentials"))
  );

  const generalError = error && !isCredentialError ? error : null;
  const passwordError =
    fieldErrors.password ||
    (authModalMode === "register" && error?.toLowerCase().includes("password") ? error : null) ||
    (authModalMode === "login" && isCredentialError ? error : null);

  const hasLoginError = authModalMode === "login" && Boolean(error);

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div
          className="pipwise-modal-overlay"
          onClick={() => status !== "success" && closeModal()}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="pipwise-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />

          {authModalMode === "otp" ? (
            <motion.div
              className={`otp-container ${status === "success" ? "is-complete" : ""}`}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="drag-handle"></div>

              <button
                type="button"
                className="otp-close-btn"
                onClick={() => status !== "success" && closeModal()}
                disabled={status === "success"}
                aria-label="Close OTP verification"
              >
                <X size={18} />
              </button>

              <div className="otp-header">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={showVerifiedText ? "verified" : "unverified"}
                    className="otp-header-inner"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <h1>{showVerifiedText ? "Verified successfully" : "Let's verify your email"}</h1>
                    <p>
                      {showVerifiedText
                        ? "Your email address has been verified."
                        : `We've sent a 4-digit code to ${pendingOtpEmail || email}.\nIt'll auto-verify once entered.`}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="otp-inputs" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <motion.div
                    key={index}
                    className="input-wrapper"
                    custom={index}
                    variants={boxVariants}
                    initial="idle"
                    animate={status === "success" ? "success" : "idle"}
                  >
                    <motion.input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      name={`pipwise-otp-${index}`}
                      id={`pipwise-otp-${index}`}
                      autoComplete="one-time-code"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-form-type="other"
                      autoCorrect="off"
                      spellCheck="false"
                      ref={inputRefs[index]}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="otp-input"
                      readOnly={status !== "idle"}
                      variants={textVariants}
                      initial="idle"
                      animate={status === "success" ? "success" : "idle"}
                    />

                    {index === 0 && (
                      <motion.svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="final-tick"
                        variants={tickContainerVariants}
                        initial="idle"
                        animate={status === "success" ? "success" : "idle"}
                      >
                        <motion.path
                          d="M5 13l4 4L19 7"
                          stroke="#ffffff"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          variants={tickPathVariants}
                        />
                      </motion.svg>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="otp-bottom-slot">
                {error && status === "idle" && (
                  <div className="otp-error-banner">{error}</div>
                )}

                <div className="otp-footer">
                  Didn&apos;t receive the code?{" "}
                  {resendCooldown > 0 ? (
                    <span className="otp-cooldown-text">Resend in {resendCooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isResending || status !== "idle"}
                    >
                      {isResending ? "Sending..." : "Resend"}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="otp-change-email-btn"
                  onClick={() => status === "idle" && switchMode(otpSourceModeRef.current || "login")}
                  disabled={status !== "idle"}
                >
                  <ArrowLeft size={13} />
                  <span>Change email address</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="pipwise-modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                className="pipwise-modal-close-btn"
                onClick={closeModal}
                aria-label="Close authentication modal"
              >
                <X size={18} />
              </button>

              <div className="pipwise-modal-header">
                <div className="pipwise-modal-brand-badge">
                  <span className="badge-candle candle-1" />
                  <span className="badge-candle candle-2" />
                  <span className="badge-candle candle-3" />
                  <span>PipWise Identity</span>
                </div>
                <h2 className="pipwise-modal-title">
                  {authModalMode === "login" ? "Welcome back" : "Create an account"}
                </h2>
                <p className="pipwise-modal-subtitle">
                  {authModalMode === "login"
                    ? "Enter your credentials to access your verified dashboard."
                    : "Join thousands of traders with unbiased forex reviews & tools."}
                </p>
              </div>

              <div className="pipwise-modal-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={authModalMode === "login"}
                  className={`pipwise-tab-btn ${authModalMode === "login" ? "is-active" : ""}`}
                  onClick={() => switchMode("login")}
                >
                  Log In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={authModalMode === "register"}
                  className={`pipwise-tab-btn ${authModalMode === "register" ? "is-active" : ""}`}
                  onClick={() => switchMode("register")}
                >
                  Sign Up
                </button>
              </div>

              <form className="pipwise-modal-form" onSubmit={handleSubmit} noValidate>
                {authModalMode === "register" && (
                  <div className="pipwise-form-group">
                    <label htmlFor="auth-username" className="pipwise-form-label">
                      Username
                    </label>
                    <div className="pipwise-input-wrapper">
                      <User size={16} className="pipwise-input-icon" aria-hidden="true" />
                      <input
                        id="auth-username"
                        type="text"
                        className={`pipwise-form-input ${usernameError ? "has-error" : ""}`}
                        placeholder="Enter your username"
                        value={username}
                        onChange={handleUsernameChange}
                        required
                        autoComplete="username"
                        disabled={loading}
                      />
                    </div>
                    {usernameError && (
                      <span className="pipwise-field-error-text">{usernameError}</span>
                    )}
                  </div>
                )}

                <div className="pipwise-form-group">
                  <label htmlFor="auth-email" className="pipwise-form-label">
                    Email Address
                  </label>
                  <div className="pipwise-input-wrapper">
                    <Mail size={16} className="pipwise-input-icon" aria-hidden="true" />
                    <input
                      id="auth-email"
                      type="email"
                      className={`pipwise-form-input ${
                        emailError || hasLoginError ? "has-error" : ""
                      }`}
                      placeholder="Enter your email"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>
                  {emailError && (
                    <span className="pipwise-field-error-text">{emailError}</span>
                  )}
                </div>

                <div className="pipwise-form-group">
                  <label htmlFor="auth-password" className="pipwise-form-label">
                    Password
                  </label>
                  <div className="pipwise-input-wrapper">
                    <Lock size={16} className="pipwise-input-icon" aria-hidden="true" />
                    <input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      className={`pipwise-form-input pipwise-password-input ${
                        passwordError ? "has-error" : ""
                      }`}
                      placeholder="Enter your password"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      autoComplete={
                        authModalMode === "login" ? "current-password" : "new-password"
                      }
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="pipwise-password-toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordError && (
                    <span className="pipwise-field-error-text">{passwordError}</span>
                  )}
                </div>

                {generalError && (
                  <div
                    className="pipwise-general-error-banner"
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#f87171",
                      fontSize: "0.82rem",
                      textAlign: "center",
                      lineHeight: "1.4",
                    }}
                  >
                    {generalError}
                  </div>
                )}

                <button
                  type="submit"
                  className="pipwise-modal-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-loading-state">
                      <Loader2 size={16} className="pipwise-spinner" />
                      <span>
                        {authModalMode === "login"
                          ? "Authenticating..."
                          : "Sending 4-Digit OTP..."}
                      </span>
                    </span>
                  ) : (
                    <span>
                      {authModalMode === "login"
                        ? "Sign In to PipWise"
                        : "Create Free Account"}
                    </span>
                  )}
                </button>

                {authModalMode === "register" && (
                  <p className="pipwise-modal-consent-text">
                    By creating an account, you consent to lawful data processing under our{" "}
                    <Link to="/privacy" onClick={closeModal} className="pipwise-consent-link">
                      Privacy Policy &amp; DPDP Act Notice
                    </Link>
                    .
                  </p>
                )}
              </form>

              <div className="pipwise-modal-footer">
                <span className="footer-prompt">
                  {authModalMode === "login"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </span>
                <button
                  type="button"
                  className="footer-switch-btn"
                  onClick={() =>
                    switchMode(authModalMode === "login" ? "register" : "login")
                  }
                >
                  {authModalMode === "login" ? "Sign up" : "Log in"}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
