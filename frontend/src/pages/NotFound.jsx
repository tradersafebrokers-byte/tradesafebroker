import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Home,
  Search,
  Building2,
  SlidersHorizontal,
  Briefcase,
  HelpCircle,
  ShieldAlert,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { ALL_BROKERS_DATA } from '../features/brokers/data/brokersData.jsx';
import Footer from '../features/shared/components/Footer.jsx';
import './NotFound.css';

export default function NotFound({ theme = 'light' }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if query matches a broker
    const q = searchQuery.toLowerCase().trim();
    const match = ALL_BROKERS_DATA.find((b) => {
      const name = (b.name || '').toLowerCase();
      const slug = (b.slug || b.id || '').toLowerCase();
      return name.includes(q) || slug.includes(q);
    });

    if (match) {
      navigate(`/reviews/${match.slug || match.id}`);
    } else {
      navigate(`/brokers?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="nf-page-wrapper">
      <main className="nf-main-container">
        <motion.div
          className="nf-content-card"
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top Status Tag */}
          <div className="nf-status-tag">
            <span className="nf-status-dot" />
            <span className="nf-status-text">404 Error • URL Not Found</span>
          </div>

          {/* Large Minimal 404 Headline */}
          <h1 className="nf-number">404</h1>
          <h2 className="nf-title">Lost in the Markets?</h2>
          <p className="nf-description">
            The page, broker review, or comparison route you're trying to reach does not exist or has been relocated to another address.
          </p>

          {/* Search Bar for Quick Navigation */}
          <form className="nf-search-box" onSubmit={handleSearchSubmit}>
            <Search size={16} className="nf-search-icon" />
            <input
              type="text"
              className="nf-search-input"
              placeholder="Search broker name (e.g. Tauro Markets, Exness, XM)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="nf-search-btn">
              Search
            </button>
          </form>

          {/* Primary Action Buttons (Back + Home) */}
          <div className="nf-actions-row">
            <button
              type="button"
              className="nf-btn-back"
              onClick={handleGoBack}
              title="Go back to previous page"
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>

            <Link to="/" className="nf-btn-home" title="Go to home page">
              <Home size={16} />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Quick Helpful Destinations */}
          <div className="nf-quick-links-section">
            <span className="nf-quick-label">Or explore verified pages:</span>
            <div className="nf-pills-grid">
              <Link to="/brokers" className="nf-pill-link">
                <Building2 size={13} color="#fc5d21" />
                <span>Top Forex Brokers</span>
                <ChevronRight size={12} className="nf-pill-arr" />
              </Link>

              <Link to="/compare" className="nf-pill-link">
                <SlidersHorizontal size={13} color="#10b981" />
                <span>Broker Comparison</span>
                <ChevronRight size={12} className="nf-pill-arr" />
              </Link>

              <Link to="/join-broker" className="nf-pill-link">
                <Briefcase size={13} color="#3b82f6" />
                <span>Join as Broker</span>
                <ChevronRight size={12} className="nf-pill-arr" />
              </Link>

              <Link to="/contact" className="nf-pill-link">
                <HelpCircle size={13} color="#8b5cf6" />
                <span>Contact Support</span>
                <ChevronRight size={12} className="nf-pill-arr" />
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
