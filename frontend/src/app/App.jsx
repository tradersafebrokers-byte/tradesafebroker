import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Nav from '../features/shared/components/nav.jsx';
import SeoHead from '../features/shared/components/SeoHead.jsx';
import AuthModal from '../features/auth/components/AuthModal.jsx';
import useAuth from '../features/auth/hooks/useAuth.js';
import ToastContainer from '../features/shared/components/toast/ToastContainer.jsx';
import SupportReplyPopup from '../features/contact/components/SupportReplyPopup.jsx';
import BrokerReviewsModal from '../features/reviews/components/BrokerReviewsModal.jsx';
import AppRoutes from './app.routes.jsx';
import AdminReplyPopup from '../features/contact/components/AdminReplyPopup.jsx';

function App() {
  const { verifySession } = useAuth();
  const location = useLocation();

  // Verify auth session from HTTP-Only cookie on app load
  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('pipwise-theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('pipwise-theme', theme);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  }, [theme]);

  const isHome = location.pathname === '/';

  // Persistent check: If hero animation has already completed once in this session, never play it again
  const [heroComplete, setHeroComplete] = useState(() => {
    if (!isHome) return true;
    try {
      return sessionStorage.getItem('pipwise_hero_done') === '1';
    } catch {
      return false;
    }
  });

  const onHeroFinished = useCallback(() => {
    setHeroComplete(true);
    try {
      sessionStorage.setItem('pipwise_hero_done', '1');
    } catch {}
  }, []);

  useEffect(() => {
    if (!isHome) {
      onHeroFinished();
    }
  }, [isHome, onHeroFinished]);

  // Safety fallback timer to guarantee nav entrance on home on first visit
  useEffect(() => {
    if (isHome && !heroComplete) {
      const timer = setTimeout(() => {
        onHeroFinished();
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [isHome, heroComplete, onHeroFinished]);

  // Disable browser's built-in scroll restoration so we control it
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Instantly scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const nextTheme = prevTheme === 'dark' ? 'light' : 'dark';
      try {
        document.documentElement.setAttribute('data-theme', nextTheme);
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('pipwise-theme', nextTheme);
      } catch (e) {
        console.error('Failed to set theme immediately:', e);
      }
      return nextTheme;
    });
  }, []);

  const [globalReviewModal, setGlobalReviewModal] = useState({
    isOpen: false,
    broker: null,
    initialWriteReview: false,
  });

  useEffect(() => {
    const handleOpenReview = (e) => {
      setGlobalReviewModal({
        isOpen: true,
        broker: e.detail?.broker || null,
        initialWriteReview: e.detail?.openWrite !== false,
      });
    };
    window.addEventListener('open_review_modal', handleOpenReview);
    return () => window.removeEventListener('open_review_modal', handleOpenReview);
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="pipwise-app">
      <SeoHead />
      {!isAdminRoute && (
        <Nav theme={theme} toggleTheme={toggleTheme} heroComplete={heroComplete} />
      )}
      <AppRoutes
        theme={theme}
        heroComplete={heroComplete}
        setHeroComplete={setHeroComplete}
        onHeroFinished={onHeroFinished}
      />
      <AuthModal />
      <ToastContainer />
      {!isAdminRoute && <SupportReplyPopup />}
      {!isAdminRoute && <AdminReplyPopup />}
      <BrokerReviewsModal
        isOpen={globalReviewModal.isOpen}
        broker={globalReviewModal.broker}
        initialWriteReview={globalReviewModal.initialWriteReview}
        onClose={() => setGlobalReviewModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default App;
