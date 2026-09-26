import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  LogOut,
  Building2,
  Star,
  SlidersHorizontal,
  Briefcase,
  Info,
  ChevronRight,
  LogIn,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ChevronDown,
  Sun,
  Moon,
  LayoutDashboard,
  CheckCircle2,
  User,
  ArrowRight,
} from 'lucide-react';
import useAuth from '../../auth/hooks/useAuth.js';
import { useToast } from './toast/ToastContext.jsx';
import KycModal from '../../kyc/components/KycModal.jsx';
import './NavProfileDropdown.css';

const bouncySpring = {
  type: 'spring',
  stiffness: 280,
  damping: 17,
  mass: 0.75,
};

const NAV_LINKS = [
  { label: 'Brokers', href: '/brokers', Icon: Building2 },
  { label: 'Reviews', href: '/#reviews', Icon: Star },
  { label: 'Comparisons', href: '/compare', Icon: SlidersHorizontal },
  { label: 'Join as Broker', href: '/join-broker', Icon: Briefcase, badge: 'Partner' },
  { label: 'About', href: '/#about', Icon: Info },
];

const DockNavLink = React.memo(({ link, mouseX }) => {
  const ref = useRef(null);

  const distance = useTransform(mouseX, (val) => {
    if (!ref.current || val === Infinity || typeof val !== 'number') return 1000;
    const bounds = ref.current.getBoundingClientRect();
    return val - (bounds.x + bounds.width / 2);
  });

  // macOS Dock magnification: hovered link scales to 1.25x, immediate neighbor to ~1.12x, farther to 1.0x
  const scaleSync = useTransform(distance, [-110, 0, 110], [1, 1.25, 1]);
  // Subtle lift matching macOS dock
  const ySync = useTransform(distance, [-110, 0, 110], [0, -3.5, 0]);

  const scale = useSpring(scaleSync, {
    mass: 0.1,
    stiffness: 240,
    damping: 16,
  });

  const y = useSpring(ySync, {
    mass: 0.1,
    stiffness: 240,
    damping: 16,
  });

  return (
    <motion.li
      ref={ref}
      className="nav-link-item"
      style={{
        scale,
        y,
        transformOrigin: 'center center',
      }}
    >
      {link.href.startsWith('/') && !link.href.startsWith('/#') ? (
        <Link to={link.href}>
          <span>{link.label}</span>
          <svg
            className="nav-chevron-icon"
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </Link>
      ) : (
        <a href={link.href}>
          <span>{link.label}</span>
          <svg
            className="nav-chevron-icon"
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </a>
      )}
    </motion.li>
  );
});

const Nav = ({ theme, toggleTheme, heroComplete = false }) => {
  const { user, isAuthenticated, openLogin, openRegister, logout, verifySession } = useAuth();
  const toast = useToast();

  const handleLogout = async () => {
    const currentUsername = user?.username;
    await logout();
    toast.info('Logged Out', currentUsername ? `See you next session, ${currentUsername}!` : 'You have been logged out.');
  };

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const profileTriggerRef = useRef(null);

  useEffect(() => {
    if (!profileDropdownOpen) return;

    // Force clipPath to none immediately when dropdown opens so content isn't clipped
    if (navRef.current) {
      navRef.current.style.clipPath = 'none';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setProfileDropdownOpen(false);
      }
    };

    // Use mousedown (fires before click) so it doesn't race with the button's onClick
    const handleClickOutside = (e) => {
      // Don't close if clicking the trigger button itself — the button's onClick handles toggling
      if (profileTriggerRef.current && profileTriggerRef.current.contains(e.target)) {
        return;
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };

    // Use 100ms delay to ensure the opening click event fully completes before we start listening
    const timer = setTimeout(() => {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const linksMouseX = useMotionValue(Infinity);
  const navRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    const handleClickOutside = (e) => {
      if (searchOpen && navRef.current && !navRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  const handleMouseMove = (e) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    navRef.current.style.setProperty('--mouse-x', `${x}px`);
    navRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleMouseEnter = (e) => {
    setIsNavHovered(true);
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    navRef.current.style.setProperty('--mouse-x', `${x}px`);
    navRef.current.style.setProperty('--mouse-y', `${y}px`);
    navRef.current.style.setProperty('--spotlight-opacity', '1');
  };

  const handleMouseLeave = () => {
    setIsNavHovered(false);
    if (!navRef.current) return;
    navRef.current.style.setProperty('--spotlight-opacity', '0');
  };

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = Math.max(0, window.scrollY);

          // Hysteresis deadband: shrink smoothly past 55px, expand back only at top (< 20px)
          setIsScrolled((prev) => {
            if (!prev && currentScrollY > 55) {
              return true;
            }
            if (prev && currentScrollY < 20) {
              return false;
            }
            return prev;
          });

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [waveKey, setWaveKey] = useState(0);

  const triggerLoginWave = () => {
    setWaveKey((prev) => prev + 1);
  };

  const navLinks = NAV_LINKS;

  const hasUser = Boolean(isAuthenticated);
  const baseMaxWidth = hasUser
    ? (isScrolled ? 1050 : 1090)
    : (isScrolled ? 940 : 1020);
  const hoveredMaxWidth = hasUser
    ? (isScrolled ? 1090 : 1130)
    : (isScrolled ? 990 : 1060);
  const searchMaxWidth = hasUser
    ? (isScrolled ? 1150 : 1190)
    : (isScrolled ? 1050 : 1120);
  const searchHoverMaxWidth = hasUser
    ? (isScrolled ? 1190 : 1230)
    : (isScrolled ? 1090 : 1160);

  const targetMaxWidth = searchOpen
    ? (isNavHovered ? searchHoverMaxWidth : searchMaxWidth)
    : (isNavHovered ? hoveredMaxWidth : baseMaxWidth);

  return (
    <>
      <header className={`pipwise-nav-floating-wrapper ${isScrolled ? 'is-scrolled' : ''}`}>
      <motion.nav
        ref={navRef}
        className={`pipwise-nav-floating-bar ${searchOpen ? 'is-search-expanded' : ''} ${isScrolled ? 'is-scrolled' : ''}`}
        aria-label="Main Navigation"
        initial={{
          clipPath: 'inset(0 50% 0 50% round 14px)',
          opacity: 0,
          y: isMobile ? 0 : -10,
          maxWidth: isMobile ? '100%' : targetMaxWidth,
        }}
        animate={
          profileDropdownOpen || heroComplete
            ? {
              clipPath: 'none',
              opacity: 1,
              y: isMobile ? 0 : (isScrolled ? -6 : 0),
              maxWidth: isMobile ? '100%' : targetMaxWidth,
            }
            : {
              clipPath: 'inset(0 50% 0 50% round 14px)',
              opacity: 0,
              y: isMobile ? 0 : -10,
              maxWidth: isMobile ? '100%' : targetMaxWidth,
            }
        }
        style={{ overflow: 'visible' }}
        transition={
          isMobile
            ? { duration: 0 }
            : {
              maxWidth: {
                duration: 0.32,
                ease: [0.16, 1, 0.3, 1],
              },
              y: {
                duration: 0.32,
                ease: [0.16, 1, 0.3, 1],
              },
              clipPath: {
                duration: 0.85,
                ease: [0.16, 1, 0.3, 1],
              },
              opacity: { duration: 0.5 },
            }
        }
        onAnimationComplete={() => {
          if (heroComplete && navRef.current) {
            navRef.current.style.clipPath = 'none';
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Sharp Shiny Border Line Following Mouse */}
        <div className="pipwise-nav-shiny-top-line" aria-hidden="true" />
        <div className="pipwise-nav-shiny-border-line" aria-hidden="true" />

        {/* PipWise Custom Brand: 3 Candlestick bars + PipWise Text */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={heroComplete ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
          transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            to="/"
            className="pipwise-logo-brand"
            aria-label="TradeSafeBrokers Home"
          >
            <div className="pipwise-candles" aria-hidden="true">
              <span className="candle-bar candle-bar-1" />
              <span className="candle-bar candle-bar-2" />
              <span className="candle-bar candle-bar-3" />
            </div>
            <span className="pipwise-logo-text">
              TradeSafe<span style={{ color: 'var(--brand-green, #fc5d21)' }}>Brokers</span>
            </span>
          </Link>
        </motion.div>

        {/* Center Nav Links with macOS Dock Magnification using Framer Motion */}
        <motion.ul
          className="pipwise-nav-links"
          onMouseMove={(e) => linksMouseX.set(e.clientX)}
          onMouseLeave={() => linksMouseX.set(Infinity)}
          initial={{ opacity: 0, y: -6 }}
          animate={heroComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.5, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
        >
          {navLinks.map((link) => (
            <DockNavLink key={link.label} link={link} mouseX={linksMouseX} />
          ))}
        </motion.ul>

        {/* Right Section: Search Icon, Theme Toggle, Login, Get Started */}
        <motion.div
          className="pipwise-nav-right"
          initial={{ opacity: 0, x: 16 }}
          animate={heroComplete ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }}
          transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Expanding Inline Search Bar extending to the Left with Bouncy Spring Animation */}
          {/* Unified Expanding Search Bar - 0ms instant trigger & simultaneous spring with navbar */}
          <div className="pipwise-search-pill-wrapper">
            <motion.div
              className={`pipwise-inline-search-pill ${searchOpen ? 'is-open' : 'is-closed'}`}
              animate={{
                width: searchOpen ? (typeof window !== 'undefined' && window.innerWidth < 480 ? Math.min(window.innerWidth - 120, 230) : 256) : 36,
              }}
              transition={bouncySpring}
              whileTap={!searchOpen ? { scale: 0.92 } : undefined}
              onClick={() => {
                if (!searchOpen) setSearchOpen(true);
              }}
            >
              <button
                type="button"
                className="search-pill-icon-btn"
                onClick={() => {
                  if (!searchOpen) setSearchOpen(true);
                }}
                aria-label="Search"
                title={searchOpen ? '' : 'Search (Click to open)'}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>

              <motion.div
                className="search-pill-expand-content"
                initial={false}
                animate={{
                  opacity: searchOpen ? 1 : 0,
                  x: searchOpen ? 0 : 8,
                }}
                transition={{
                  duration: searchOpen ? 0.22 : 0.1,
                  ease: 'easeOut',
                }}
                style={{
                  pointerEvents: searchOpen ? 'auto' : 'none',
                }}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  className="pipwise-inline-search-input"
                  placeholder="Search brokers, reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  tabIndex={searchOpen ? 0 : -1}
                />

                <div className="search-pill-actions">
                  {searchQuery ? (
                    <button
                      type="button"
                      className="inline-search-clear-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                      aria-label="Clear query"
                      title="Clear query"
                    >
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  ) : (
                    <span className="search-pill-kbd-badge" title="Press Escape to close">
                      ESC
                    </span>
                  )}

                  <button
                    type="button"
                    className="inline-search-close-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    aria-label="Close search"
                    title="Close search"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Theme Toggle Button - Disappears completely on mobile when search is open or on small mobile when user is logged in */}
          <button
            type="button"
            className={`pipwise-icon-btn pipwise-theme-btn ${searchOpen ? 'is-search-hidden' : ''} ${isAuthenticated ? 'hide-on-mobile-auth' : ''}`}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              /* Sun icon */
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              /* Sun/Ray icon */
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="4" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            )}
          </button>

          {/* Auth block moved outside the main navbar */}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </motion.div>
      </motion.nav>

      {/* Side Profile/Login Widget (Fixed to the right on Desktop) */}
      <div className="pipwise-fixed-auth-widget">
        {!isAuthenticated ? (
          <button
            type="button"
            className="pipwise-floating-login-btn"
            onClick={() => {
              triggerLoginWave();
              openLogin();
            }}
            aria-label="Log in"
          >
            <span key={waveKey} className="login-wave-text">
              {'Log in'.split('').map((char, index) => (
                <span
                  key={index}
                  className={`wave-letter ${waveKey > 0 ? 'is-animating' : ''}`}
                  style={{ animationDelay: `${index * 0.035}s` }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          </button>
        ) : (
          <div className="pipwise-profile-container" ref={profileDropdownRef}>
            <button
              ref={profileTriggerRef}
              type="button"
              className={`pipwise-side-avatar-trigger ${profileDropdownOpen ? 'is-active' : ''} ${user?.role === 'admin' ? 'is-admin' : ''}`}
              onClick={() => {
                setProfileDropdownOpen((prev) => !prev);
              }}
              aria-label="User Profile"
              aria-expanded={profileDropdownOpen}
            >
              <div className="profile-avatar-circle">
                {(user?.username || user?.name || user?.email || 'T')[0].toUpperCase()}
              </div>
              {user?.isKycVerified && (
                <span className="side-avatar-verified-badge" title="Verified Trader">
                  <CheckCircle2 size={12} strokeWidth={3} />
                </span>
              )}
            </button>

            {/* Profile Details Dropdown Card */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  className="pipwise-profile-dropdown"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header: Avatar + User Details */}
                  <div className="profile-dropdown-header">
                    <div className="profile-dropdown-avatar-wrap">
                      <div className={`profile-dropdown-avatar ${user?.role === 'admin' ? 'is-admin' : ''}`}>
                        {(user?.username || user?.name || user?.email || 'T')[0].toUpperCase()}
                      </div>
                      <span className="profile-dropdown-online-dot" title="Online" />
                    </div>
                    <div className="profile-dropdown-meta">
                      <span className="profile-dropdown-name">
                        {user?.username || user?.name || 'Trader'}
                      </span>
                      <span className="profile-dropdown-email" title={user?.email || ''}>
                        {user?.email || 'No email registered'}
                      </span>
                      <span
                        className={`profile-dropdown-role-chip ${
                          user?.role === 'admin'
                            ? 'admin'
                            : user?.isKycVerified || user?.kycStatus === 'verified'
                            ? 'verified'
                            : user?.kycStatus === 'pending'
                            ? 'pending'
                            : user?.kycStatus === 'rejected'
                            ? 'rejected'
                            : 'standard'
                        }`}
                      >
                        {user?.role === 'admin' ? (
                          <>
                            <LayoutDashboard size={10} />
                            <span>Administrator</span>
                          </>
                        ) : user?.isKycVerified || user?.kycStatus === 'verified' ? (
                          <>
                            <ShieldCheck size={10} strokeWidth={2.6} />
                            <span>Verified Trader</span>
                          </>
                        ) : user?.kycStatus === 'pending' ? (
                          <>
                            <Clock size={10} strokeWidth={2.4} />
                            <span>KYC Under Review</span>
                          </>
                        ) : user?.kycStatus === 'rejected' ? (
                          <>
                            <ShieldAlert size={10} strokeWidth={2.4} />
                            <span>Action Required</span>
                          </>
                        ) : (
                          <>
                            <User size={10} />
                            <span>Trader Account</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Admin Dashboard Quick Access */}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="profile-dropdown-admin-box"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <div className="kyc-icon-badge admin">
                        <LayoutDashboard size={16} />
                      </div>
                      <div className="kyc-box-text">
                        <div className="kyc-box-title">Admin Dashboard</div>
                        <div className="kyc-box-desc">Brokers, reviews, and KYC queue</div>
                      </div>
                      <ArrowRight size={13} className="kyc-arrow-icon" />
                    </Link>
                  )}

                  {/* KYC Section for Normal Traders */}
                  {user?.role !== 'admin' && (
                    <div
                      className={`profile-dropdown-kyc-box ${
                        user?.isKycVerified || user?.kycStatus === 'verified'
                          ? 'is-verified'
                          : user?.kycStatus === 'pending'
                          ? 'is-pending'
                          : user?.kycStatus === 'rejected'
                          ? 'is-rejected'
                          : 'action-needed'
                      }`}
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setKycModalOpen(true);
                      }}
                      title="Open Trader KYC Verification"
                      role="button"
                      tabIndex={0}
                    >
                      <div
                        className={`kyc-icon-badge ${
                          user?.isKycVerified || user?.kycStatus === 'verified'
                            ? 'verified'
                            : user?.kycStatus === 'pending'
                            ? 'pending'
                            : user?.kycStatus === 'rejected'
                            ? 'rejected'
                            : 'action'
                        }`}
                      >
                        {user?.isKycVerified || user?.kycStatus === 'verified' ? (
                          <ShieldCheck size={16} strokeWidth={2.5} />
                        ) : user?.kycStatus === 'pending' ? (
                          <Clock size={16} strokeWidth={2.5} />
                        ) : user?.kycStatus === 'rejected' ? (
                          <ShieldAlert size={16} strokeWidth={2.5} />
                        ) : (
                          <ShieldCheck size={16} strokeWidth={2.5} />
                        )}
                      </div>
                      <div className="kyc-box-text">
                        <div className="kyc-box-title">
                          {user?.isKycVerified || user?.kycStatus === 'verified'
                            ? 'KYC Verified'
                            : user?.kycStatus === 'pending'
                            ? 'KYC Under Review'
                            : user?.kycStatus === 'rejected'
                            ? 'Update Your KYC'
                            : 'Complete Your KYC'}
                        </div>
                        <div className="kyc-box-desc">
                          {user?.isKycVerified || user?.kycStatus === 'verified'
                            ? 'ID Card verified • Click to view'
                            : user?.kycStatus === 'pending'
                            ? 'Under review • Click to view'
                            : user?.kycStatus === 'rejected'
                            ? 'Photo rejected • Click to re-upload'
                            : 'Verify ID to get official badge'}
                        </div>
                      </div>
                      {!user?.isKycVerified && user?.kycStatus !== 'verified' ? (
                        <div className="kyc-action-pill">
                          <span>
                            {user?.kycStatus === 'rejected'
                              ? 'Fix'
                              : user?.kycStatus === 'pending'
                              ? 'Status'
                              : 'Verify'}
                          </span>
                          <ArrowRight size={11} strokeWidth={2.5} />
                        </div>
                      ) : (
                        <ArrowRight size={13} className="kyc-arrow-icon" />
                      )}
                    </div>
                  )}

                  <div className="profile-dropdown-divider" />

                  {/* Logout Option */}
                  <button
                    type="button"
                    className="profile-dropdown-logout-btn"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Premium Mobile Navigation Drawer with Auth & Theme Switcher */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="pipwise-floating-mobile-menu"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mobile-menu-links-list">
              {navLinks.map((link) => {
                const IconComponent = link.Icon;
                const isExternal = link.href.startsWith('/#');

                const content = (
                  <>
                    <div className="mobile-link-left">
                      {IconComponent && <IconComponent size={17} className="mobile-link-icon" />}
                      <span className="mobile-link-text">{link.label}</span>
                      {link.badge && <span className="mobile-link-badge">{link.badge}</span>}
                    </div>
                    <ChevronRight size={14} className="mobile-link-chevron" />
                  </>
                );

                return isExternal ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="mobile-nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="mobile-nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>

            <div className="mobile-menu-divider" />

            {/* Auth Section in Mobile Menu */}
            <div className="mobile-nav-auth-section">
              {!isAuthenticated ? (
                <div className="mobile-auth-guest-box">
                  <button
                    type="button"
                    className="mobile-menu-primary-login-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openLogin();
                    }}
                  >
                    <LogIn size={15} />
                    <span>Log In to TradeSafeBrokers</span>
                  </button>
                  <button
                    type="button"
                    className="mobile-menu-secondary-register-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openRegister();
                    }}
                  >
                    <span>New Trader? <strong>Create Account</strong></span>
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-user-card">
                  <div className="mobile-auth-top-row">
                    <div className="mobile-user-info">
                      <div className="mobile-user-avatar">
                        {(user?.username || user?.name || 'T')[0].toUpperCase()}
                      </div>
                      <div className="mobile-user-text">
                        {user?.role === 'admin' ? (
                          <Link
                            to="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              color: '#ffffff',
                              textDecoration: 'none',
                              fontWeight: 700,
                              fontSize: '0.92rem'
                            }}
                          >
                            <LayoutDashboard size={13} color="#818cf8" />
                            <span>Dashboard</span>
                          </Link>
                        ) : (
                          <span className="mobile-user-name">{user?.username || user?.name || 'Trader'}</span>
                        )}
                        <span className="mobile-user-role">
                          {user?.isKycVerified || user?.kycStatus === 'verified' ? (
                            <>
                              <ShieldCheck size={11} /> Verified Trader
                            </>
                          ) : user?.role === 'admin' ? (
                            <>
                              <LayoutDashboard size={11} /> Administrator
                            </>
                          ) : (
                            <>
                              <User size={11} /> {user?.email || 'Trader Account'}
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mobile-user-logout-btn"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      title="Log out"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>

                  {/* Mobile KYC Action for Traders (Full width bottom) */}
                  {user?.role !== 'admin' && (
                    <button
                      type="button"
                      className={`mobile-drawer-kyc-btn ${
                        user?.isKycVerified || user?.kycStatus === 'verified'
                          ? 'verified'
                          : user?.kycStatus === 'pending'
                          ? 'pending'
                          : user?.kycStatus === 'rejected'
                          ? 'rejected'
                          : 'action'
                      }`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setKycModalOpen(true);
                      }}
                    >
                      <div className="mobile-kyc-btn-content">
                        <div className="mobile-kyc-btn-icon-wrap">
                          {user?.isKycVerified || user?.kycStatus === 'verified' ? (
                            <ShieldCheck size={14} strokeWidth={2.5} />
                          ) : user?.kycStatus === 'pending' ? (
                            <Clock size={14} strokeWidth={2.5} />
                          ) : user?.kycStatus === 'rejected' ? (
                            <ShieldAlert size={14} strokeWidth={2.5} />
                          ) : (
                            <ShieldCheck size={14} strokeWidth={2.5} />
                          )}
                        </div>
                        <span className="mobile-kyc-btn-title">
                          {user?.isKycVerified || user?.kycStatus === 'verified'
                            ? 'KYC Verified'
                            : user?.kycStatus === 'pending'
                            ? 'KYC Under Review'
                            : user?.kycStatus === 'rejected'
                            ? 'Re-upload KYC ID'
                            : 'Complete Your KYC'}
                        </span>
                      </div>
                      <div className="mobile-kyc-btn-arrow">
                        <ArrowRight size={13} strokeWidth={2.5} />
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mobile-menu-divider" />

            {/* Quick Theme Switcher Row */}
            <div className="mobile-menu-footer-row">
              <span className="mobile-theme-label">Appearance</span>
              <button
                type="button"
                className="mobile-theme-toggle-chip"
                onClick={toggleTheme}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={13} />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={13} />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>

    {/* Trader KYC Modal (Mounted outside header) */}
    <KycModal
      isOpen={kycModalOpen}
      onClose={() => setKycModalOpen(false)}
      onKycUpdated={() => {
        verifySession();
      }}
    />
  </>
  );
};

export default React.memo(Nav);
