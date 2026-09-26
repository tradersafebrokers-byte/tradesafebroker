import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/home.jsx';
import AllBrokers from '../pages/AllBrokers.jsx';
import CompareBrokers from '../pages/CompareBrokers.jsx';
import JoinBroker from '../pages/JoinBroker.jsx';
import PrivacyPolicy from '../pages/PrivacyPolicy.jsx';
import ContactPage from '../pages/ContactPage.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import AdminRoute from '../features/auth/components/AdminRoute.jsx';
import BrokerReviewPage from '../pages/BrokerReviewPage.jsx';

export const AppRoutes = React.memo(({ theme, heroComplete, setHeroComplete, onHeroFinished }) => {
  return (
    <Routes>
      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
        <Route
          path="/admin/dashboard"
          element={<Navigate to="/admin" replace />}
        />
        <Route
          path="/"
          element={
            <Home
              theme={theme}
              heroComplete={heroComplete}
              onTitleComplete={onHeroFinished || (() => setHeroComplete(true))}
            />
          }
        />
        <Route
          path="/brokers"
          element={<AllBrokers theme={theme} />}
        />
        <Route
          path="/all-brokers"
          element={<Navigate to="/brokers" replace />}
        />
        <Route
          path="/reviews/:slug"
          element={<BrokerReviewPage theme={theme} />}
        />
        <Route
          path="/review/:slug"
          element={<BrokerReviewPage theme={theme} />}
        />
        <Route
          path="/brokers/:slug"
          element={<BrokerReviewPage theme={theme} />}
        />
        <Route
          path="/compare"
          element={<CompareBrokers theme={theme} />}
        />
        <Route
          path="/compare-brokers"
          element={<Navigate to="/compare" replace />}
        />
        <Route
          path="/comparisons"
          element={<Navigate to="/compare" replace />}
        />
        <Route
          path="/join-broker"
          element={<JoinBroker theme={theme} />}
        />
        <Route
          path="/add-broker"
          element={<Navigate to="/join-broker" replace />}
        />
        <Route
          path="/privacy-policy"
          element={<PrivacyPolicy theme={theme} />}
        />
        <Route
          path="/privacy"
          element={<Navigate to="/privacy-policy" replace />}
        />
        <Route
          path="/contact"
          element={<ContactPage />}
        />
        <Route
          path="/support"
          element={<Navigate to="/contact" replace />}
        />
        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
});

export default AppRoutes;

