import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper,
  TrendingUp,
  RefreshCw,
  Search,
  Clock,
  ArrowUpRight,
  Share2,
  ExternalLink,
  Globe,
  Sparkles,
  Check,
  X,
  Radio,
  SlidersHorizontal,
  PenSquare,
} from 'lucide-react';
import useAuth from '../features/auth/hooks/useAuth.js';
import UserNewsModal from '../features/news/components/UserNewsModal.jsx';
import newsService, { FALLBACK_NEWS, FALLBACK_BREAKING_TICKER } from '../features/news/services/news.service.js';
import { useToast } from '../features/shared/components/toast/ToastContext.jsx';
import Footer from '../features/shared/components/Footer.jsx';
import './NewsPage.css';

const CATEGORIES = [
  { id: 'all', label: 'All Intelligence', icon: Globe },
  { id: 'forex', label: 'Forex & Currencies', icon: TrendingUp },
  { id: 'indian-market', label: 'Indian Market & RBI', icon: Sparkles },
  { id: 'crypto', label: 'Crypto & Bitcoin', icon: Radio },
  { id: 'global', label: 'Global Macro', icon: Globe },
  { id: 'commodities', label: 'Gold & Commodities', icon: TrendingUp },
  { id: 'brokers', label: 'Broker Analyses', icon: Newspaper },
];

const formatTimeAgo = (dateInput) => {
  if (!dateInput) return 'Recently';
  const now = new Date();
  const past = new Date(dateInput);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getCategoryBadgeClass = (category) => {
  switch (category) {
    case 'indian-market':
      return 'badge-india';
    case 'crypto':
      return 'badge-crypto';
    case 'forex':
      return 'badge-forex';
    case 'commodities':
      return 'badge-commodities';
    case 'brokers':
      return 'badge-brokers';
    default:
      return 'badge-global';
  }
};

const getCategoryLabel = (catId) => {
  const match = CATEGORIES.find((c) => c.id === catId);
  return match ? match.label : catId.toUpperCase();
};

export const NewsPage = ({ theme = 'dark' }) => {
  const { slug } = useParams();
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [userNewsModalOpen, setUserNewsModalOpen] = useState(false);
  const [articles, setArticles] = useState(FALLBACK_NEWS);
  const [breakingTicker, setBreakingTicker] = useState(FALLBACK_BREAKING_TICKER);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeArticleModal, setActiveArticleModal] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-open article modal if URL contains :slug
  useEffect(() => {
    if (slug && articles.length > 0) {
      const match = articles.find((a) => a.slug === slug || a._id === slug);
      if (match) {
        setActiveArticleModal(match);
      }
    }
  }, [slug, articles]);

  // Fetch articles from service / backend
  const loadNews = useCallback(async (isSilent = false, isUserRefresh = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await newsService.getPublishedNews({
        category: selectedCategory,
        search: searchQuery,
        refresh: isUserRefresh,
      });

      if (data?.articles && data.articles.length > 0) {
        setArticles(data.articles);
      }
      if (data?.breakingTicker && data.breakingTicker.length > 0) {
        setBreakingTicker(data.breakingTicker);
      }
      setLastUpdated(new Date());
      if (isUserRefresh) {
        showToast('Live news feed refreshed with latest market updates', 'success');
      }
    } catch {
      if (isUserRefresh) {
        showToast('Updated with latest market news cache', 'info');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery, showToast]);

  // Load news on category or search change
  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // Auto-refresh news in background every 45 seconds
  useEffect(() => {
    const autoInterval = setInterval(() => {
      loadNews(true);
    }, 45000);
    return () => clearInterval(autoInterval);
  }, [loadNews]);

  // Filtered list
  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      const matchesCat =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesQuery;
    });
  }, [articles, selectedCategory, searchQuery]);

  // Top featured hero article
  const featuredArticle = useMemo(() => {
    if (selectedCategory !== 'all') {
      return filteredArticles[0] || null;
    }
    return (
      filteredArticles.find((a) => a.isFeatured) || filteredArticles[0] || null
    );
  }, [filteredArticles, selectedCategory]);

  // Remaining articles
  const gridArticles = useMemo(() => {
    if (!featuredArticle) return filteredArticles;
    return filteredArticles.filter((a) => (a._id || a.slug) !== (featuredArticle._id || featuredArticle.slug));
  }, [filteredArticles, featuredArticle]);

  // Handle share
  const handleShare = (article, e) => {
    e?.stopPropagation();
    const url = `${window.location.origin}/news/${article.slug || article._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showToast('Article link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className={`pipwise-news-page ${theme}`}>
      {/* ══════════════════════════════════════════════════════════ */}
      {/* 1. REAL-TIME BREAKING TICKER TAPE                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="news-ticker-container">
        <div className="news-ticker-badge">
          <span className="ticker-pulse-dot" />
          <span className="ticker-badge-text">LIVE WIRE</span>
        </div>
        <div className="news-ticker-track-wrapper">
          <div className="news-ticker-track">
            {breakingTicker.concat(breakingTicker).map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="news-ticker-item">
                <span className="ticker-bullet">⚡</span>
                <span className="ticker-item-text">{item.text}</span>
                <span className="ticker-item-time">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 2. HERO HEADER SECTION                                   */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="news-hero-container">
        <div className="news-hero-content">
          <div className="news-badge-pill">
            <Radio size={14} className="badge-pulse-icon" />
            <span>24/7 Global &amp; Indian Financial Feed</span>
          </div>

          <h1 className="news-hero-title">
            Live Market Intelligence <span className="news-green-accent">&amp; News</span>
          </h1>

          <p className="news-hero-subtitle">
            Institutional macro analysis, real-time RBI &amp; Indian market updates, Bitcoin dynamics,
            and independent forex broker research.
          </p>

          {/* Quick Refresh & Status Pill */}
          <div className="news-meta-status-row">
            <span className="news-last-updated">
              Updated {formatTimeAgo(lastUpdated)}
            </span>
            <button
              className={`news-refresh-btn ${refreshing ? 'is-spinning' : ''}`}
              onClick={() => loadNews(true, true)}
              disabled={refreshing}
              title="Pull latest live market stories"
            >
              <RefreshCw size={13} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Now'}</span>
            </button>
            <button
              className="news-btn-create-post"
              onClick={() => {
                if (!isAuthenticated) {
                  showToast('Please sign in or register to publish market analysis', 'info');
                  return;
                }
                setUserNewsModalOpen(true);
              }}
              title="Share market analysis, price breakdown, or news"
            >
              <PenSquare size={13} />
              <span>Post Analysis / News</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 3. SEARCH & CATEGORY BAR                                 */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="news-control-bar-wrapper">
        <div className="news-control-bar">
          {/* Category Filter Pills */}
          <div className="news-category-scroll">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  className={`news-category-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <Icon size={14} className="cat-btn-icon" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="news-search-box">
            <Search size={15} className="news-search-icon" />
            <input
              type="text"
              placeholder="Search news, RBI, DXY, Bitcoin, broker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="news-search-input"
            />
            {searchQuery && (
              <button
                className="news-search-clear"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 4. MAIN CONTENT AREA                                     */}
      {/* ══════════════════════════════════════════════════════════ */}
      <main className="news-main-layout">
        {loading ? (
          <div className="news-loading-skeleton-grid">
            <div className="skeleton-featured-card" />
            <div className="skeleton-grid-cards">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="news-empty-state">
            <div className="empty-icon-wrap">
              <Newspaper size={36} />
            </div>
            <h3>No matching intelligence found</h3>
            <p>We couldn’t find articles matching "{searchQuery}". Try selecting another category.</p>
            <button
              className="empty-reset-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* FEATURED STORY SHOWCASE */}
            {featuredArticle && (
              <motion.article
                className="news-featured-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setActiveArticleModal(featuredArticle)}
              >
                <div className="featured-image-wrapper">
                  <img
                    src={featuredArticle.imageUrl}
                    alt={featuredArticle.title}
                    className="featured-cover-img"
                    loading="lazy"
                  />
                  <div className="featured-overlay-gradient" />
                  <span className={`featured-cat-tag ${getCategoryBadgeClass(featuredArticle.category)}`}>
                    {getCategoryLabel(featuredArticle.category)}
                  </span>
                </div>

                <div className="featured-body">
                  <div className="featured-meta-top">
                    <span className="featured-source">{featuredArticle.source}</span>
                    <span className="featured-time-dot">•</span>
                    <span className="featured-published">{formatTimeAgo(featuredArticle.publishedAt)}</span>
                    <span className="featured-read-time">
                      <Clock size={12} /> {featuredArticle.readTime}
                    </span>
                  </div>

                  <h2 className="featured-title">{featuredArticle.title}</h2>
                  <p className="featured-summary">{featuredArticle.summary}</p>

                  <div className="featured-footer">
                    <div className="featured-author-row">
                      <img
                        src={featuredArticle.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                        alt={featuredArticle.author?.name || 'Author'}
                        className="author-avatar"
                      />
                      <div className="author-details">
                        <span className="author-name">{featuredArticle.author?.name || 'Market Research Desk'}</span>
                        <span className="author-role">{featuredArticle.author?.role || 'Market Strategist'}</span>
                      </div>
                    </div>

                    <div className="featured-actions">
                      <button
                        className="featured-share-btn"
                        onClick={(e) => handleShare(featuredArticle, e)}
                        title="Share article"
                      >
                        {copiedLink ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
                      </button>
                      <button className="featured-read-btn">
                        <span>Read Full Analysis</span>
                        <ArrowUpRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            )}

            {/* ARTICLE GRID */}
            <div className="news-articles-grid">
              {gridArticles.map((article, idx) => (
                <motion.article
                  key={article._id || article.slug || idx}
                  className="news-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  onClick={() => setActiveArticleModal(article)}
                >
                  <div className="news-card-img-wrap">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="news-card-img"
                      loading="lazy"
                    />
                    <span className={`news-card-badge ${getCategoryBadgeClass(article.category)}`}>
                      {getCategoryLabel(article.category)}
                    </span>
                  </div>

                  <div className="news-card-content">
                    <div className="news-card-meta">
                      <span className="news-card-source">{article.source}</span>
                      <span className="meta-sep">•</span>
                      <span className="news-card-date">{formatTimeAgo(article.publishedAt)}</span>
                    </div>

                    <h3 className="news-card-title">{article.title}</h3>
                    <p className="news-card-excerpt">{article.summary}</p>

                    <div className="news-card-footer">
                      <span className="card-read-duration">
                        <Clock size={12} /> {article.readTime}
                      </span>
                      <div className="card-action-btns">
                        <button
                          className="card-share-btn"
                          onClick={(e) => handleShare(article, e)}
                          title="Share"
                        >
                          <Share2 size={13} />
                        </button>
                        <span className="card-read-arrow">
                          <ArrowUpRight size={15} />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 5. ARTICLE DETAIL MODAL / READER                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeArticleModal && (
          <div
            className="news-reader-backdrop"
            onClick={() => setActiveArticleModal(null)}
          >
            <motion.div
              className="news-reader-modal"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.16 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="reader-modal-header">
                <span className={`reader-cat-pill ${getCategoryBadgeClass(activeArticleModal.category)}`}>
                  {getCategoryLabel(activeArticleModal.category)}
                </span>
                <div className="reader-header-actions">
                  <button
                    className="reader-action-btn"
                    onClick={(e) => handleShare(activeArticleModal, e)}
                    title="Copy Article Link"
                  >
                    {copiedLink ? <Check size={16} color="#10b981" /> : <Share2 size={16} />}
                  </button>
                  <button
                    className="reader-close-btn"
                    onClick={() => setActiveArticleModal(null)}
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="reader-modal-body">
                <h1 className="reader-title">{activeArticleModal.title}</h1>

                <div className="reader-author-bar">
                  <img
                    src={activeArticleModal.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                    alt={activeArticleModal.author?.name}
                    className="reader-avatar"
                  />
                  <div className="reader-author-info">
                    <span className="reader-name">{activeArticleModal.author?.name || 'Market Analyst'}</span>
                    <span className="reader-source-time">
                      {activeArticleModal.source} • {formatTimeAgo(activeArticleModal.publishedAt)} • {activeArticleModal.readTime}
                    </span>
                  </div>
                </div>

                <div className="reader-cover-wrap">
                  <img
                    src={activeArticleModal.imageUrl}
                    alt={activeArticleModal.title}
                    className="reader-cover-img"
                  />
                </div>

                <div className="reader-summary-callout">
                  <strong>Key Takeaway:</strong> {activeArticleModal.summary}
                </div>

                <div className="reader-article-content">
                  {activeArticleModal.content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {activeArticleModal.tags && activeArticleModal.tags.length > 0 && (
                  <div className="reader-tags-row">
                    <span className="reader-tag-label">Related Topics:</span>
                    {activeArticleModal.tags.map((tag, i) => (
                      <span key={i} className="reader-tag-chip">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Market News / Analysis Submission Modal */}
      <UserNewsModal
        isOpen={userNewsModalOpen}
        onClose={() => setUserNewsModalOpen(false)}
        user={user}
        onSuccess={() => {
          loadNews();
          showToast('Market analysis published to live wire!', 'success');
        }}
      />

      <Footer />
    </div>
  );
};

export default NewsPage;
