import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Nav from '../features/shared/components/nav.jsx';
import SeoHead from '../features/shared/components/SeoHead.jsx';
import AuthModal from '../features/auth/components/AuthModal.jsx';
import useAuth from '../features/auth/hooks/useAuth.js';
import ToastContainer from '../features/shared/components/toast/ToastContainer.jsx';
import AppRoutes from './app.routes.jsx';

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

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
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
    </div>
  );
}

export default App;
