import apiClient from '../../auth/services/api.client.js';

export const FALLBACK_NEWS = [
  {
    _id: 'fb-1',
    title: 'RBI Keeps Repo Rate Steady at 6.50%: Rupee Defends 83.40 as Forex Reserves Hit Record $652B',
    slug: 'rbi-repo-rate-steady-rupee-forex-reserves-record',
    summary:
      'The Reserve Bank of India retained its benchmark repo rate with a disinflationary focus. Foreign exchange reserves crossed $652 billion, establishing a solid cushion for the Indian Rupee against global volatility.',
    content: `The Reserve Bank of India's Monetary Policy Committee (MPC) unanimously decided to retain the benchmark repo rate at 6.50%, emphasizing that persistent food inflation warrants sustained vigilance.

Governor Shaktikanta Das highlighted that India's macroeconomic fundamentals remain exceptionally resilient, with FY25 GDP growth projected robustly above 7.2%. The central bank's foreign currency reserves reached a historic milestone, crossing $652 billion.

For currency traders and Indian market participants:
• USD/INR is expected to consolidate within a narrow band of 83.25 to 83.65.
• Increased FII debt inflows under global bond index inclusion provide continuous liquidity support.
• The RBI reaffirmed its non-disruptive, proactive market intervention strategy to curb erratic exchange rate volatility without artificially anchoring the currency.`,
    category: 'indian-market',
    tags: ['RBI', 'USD/INR', 'Forex Reserves', 'Indian Market', 'Interest Rates'],
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
    source: 'Market Intelligence Desk',
    author: {
      name: 'Aditya Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      role: 'Macro & Currency Strategist',
    },
    isFeatured: true,
    isPublished: true,
    readTime: '4 min read',
    publishedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    views: 342,
  },
  {
    _id: 'fb-2',
    title: 'Bitcoin Surges Past $67,500 as Institutional Spot Inflows Accelerate: Halving Supply Shock in Motion',
    slug: 'bitcoin-surges-67k-institutional-inflows-supply-shock',
    summary:
      'BTC broke through key resistance levels with surging volume driven by net inflows into Spot ETFs and rising derivative open interest, testing crucial multi-month liquidity zones.',
    content: `Bitcoin (BTC) staged a powerful upward breakout, trading firmly above $67,400 with intraday gains exceeding 3.5%. The rally follows three consecutive sessions of net positive institutional inflows into spot exchange-traded funds.

On-chain metrics reveal:
1. Exchange reserves of BTC have dropped to multi-year lows, signaling long-term holder accumulation.
2. Funding rates on major derivatives desks remain balanced, indicating spot-driven spot absorption rather than speculative leverage.
3. Market structure suggests a test of the all-time high zone if momentum above the $66,800 baseline is defended into the weekly close.

Traders are advised to observe key liquidity pools around $68,500 and maintain disciplined stop-loss parameters given macroeconomic sensitivity.`,
    category: 'crypto',
    tags: ['Bitcoin', 'BTC', 'Crypto', 'ETFs', 'Blockchain'],
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    source: 'CryptoWire Direct',
    author: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      role: 'Digital Assets Analyst',
    },
    isFeatured: true,
    isPublished: true,
    readTime: '3 min read',
    publishedAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    views: 521,
  },
  {
    _id: 'fb-3',
    title: 'US Dollar Index (DXY) Consolidates Around 105.20 Ahead of Core PCE Inflation Data & Fed Speeches',
    slug: 'us-dollar-dxy-pce-inflation-fed-speeches',
    summary:
      'The US Dollar held tight ranges against major peers EUR, GBP, and JPY as currency traders recalibrated the likelihood of Federal Reserve interest rate cuts later this autumn.',
    content: `The greenback remained broadly steady across G10 pairs as investors positioned ahead of key Core PCE Price Index releases and comments from several FOMC voting members.

EUR/USD was pinned near 1.0860, while GBP/USD defended the 1.2700 threshold following constructive UK retail sales prints. Markets are presently pricing in a 65% probability of a 25 basis point rate cut by September, down slightly from 72% earlier in the month.

Technical Outlook:
• Support for the DXY lies at 104.80, with immediate resistance observed at 105.75.
• Treasury yields consolidated with the 10-year benchmark oscillating around 4.28%.
• Volatility is projected to spike during New York morning session liquidity transitions.`,
    category: 'forex',
    tags: ['Forex', 'EUR/USD', 'DXY', 'Federal Reserve', 'Inflation'],
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
    source: 'Global Forex Desk',
    author: {
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      role: 'Senior FX Quantitative Analyst',
    },
    isFeatured: false,
    isPublished: true,
    readTime: '4 min read',
    publishedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    views: 189,
  },
  {
    _id: 'fb-4',
    title: 'Gold (XAU/USD) Consolidates Near $2,385 as Sovereign Central Banks Escalate Physical Bullion Reserves',
    slug: 'gold-xauusd-consolidates-sovereign-central-banks',
    summary:
      'Spot gold retained elevated levels with ongoing sovereign diversification away from sovereign dollar debt and sustained retail demand across Asian and Middle Eastern corridors.',
    content: `Spot bullion prices (XAU/USD) demonstrated strong defensive resilience, trading near $2,384.50 an ounce. Central banks in emerging economies, notably China, India, and Turkey, reported continuing net physical bullion purchases.

Key Catalysts:
• De-dollarization trends and geopolitical hedging continue to underwrite a solid floor above $2,320.
• Silver (XAG/USD) mirrored gold’s strength, outpacing with a 1.8% intraday gain fueled by industrial photovoltaic demand.
• Spread conditions across major Tier-1 ECN brokers remained tight, with raw spreads averaging 0.8 pips during London/NY overlap.`,
    category: 'commodities',
    tags: ['Gold', 'XAU/USD', 'Commodities', 'Central Banks', 'Precious Metals'],
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80',
    source: 'Commodity Pulse',
    author: {
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      role: 'Metals & Energy Specialist',
    },
    isFeatured: false,
    isPublished: true,
    readTime: '3 min read',
    publishedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    views: 295,
  },
  {
    _id: 'fb-5',
    title: 'SEBI Clarification on Currency Derivatives: Hedging Mandate Impact on Indian Retail Forex',
    slug: 'sebi-clarification-currency-derivatives-hedging-mandate',
    summary:
      'The Securities and Exchange Board of India and RBI clarified the operational framework for exchange-traded currency derivatives (ETCD), addressing retail volume shifts and compliance rules.',
    content: `The regulatory landscape for currency trading in India experienced significant clarity following the implementation of updated regulatory directives on Exchange Traded Currency Derivatives (ETCD).

Highlights of the regulatory guidance:
• Market participants utilizing NSE and BSE currency pairs (USDINR, EURINR, GBPINR, JPYINR) can trade contracts within specified limits for genuine underlying currency exposure hedging.
• Proprietary trading desks and retail traders are transitioning strategies toward regulated international entities and licensed brokers providing comprehensive reporting.
• The rupee’s liquidity in onshore markets remains deep, with domestic institutional desks expanding cross-currency swap operations.`,
    category: 'indian-market',
    tags: ['SEBI', 'RBI', 'Currency Derivatives', 'USDINR', 'Regulations'],
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
    source: 'Mumbai Financial Chronicle',
    author: {
      name: 'Rajesh K. Varma',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80',
      role: 'Regulatory & Compliance Editor',
    },
    isFeatured: false,
    isPublished: true,
    readTime: '5 min read',
    publishedAt: new Date(Date.now() - 160 * 60 * 1000).toISOString(),
    views: 412,
  },
  {
    _id: 'fb-6',
    title: 'Top Forex Brokers Report Record Raw Spread Tightness in Q2: ECN Execution Speeds Hit Sub-12ms',
    slug: 'forex-brokers-record-raw-spread-tightness-ecn-speeds',
    summary:
      'Independent latency testing across 40+ Tier-1 regulated brokers reveals major technological upgrades in New York (NY4) and London (LD4) cross-connect infrastructure.',
    content: `Independent quarterly broker execution benchmark report has confirmed that average ECN execution latency has decreased by 24% year-over-year.

Brokers utilizing Equinix LD4 (London) and NY4 (Secaucus, NJ) server colocation recorded tick execution times under 12 milliseconds during heavy market volatility windows.

Key takeaways for retail & algorithmic traders:
• Zero-spread accounts on major pairs like EUR/USD and USD/JPY frequently exhibited 0.0 pip spreads during peak European hours.
• Slippage protection features and negative balance safety nets are now standard across 94% of ASIC, FCA, and CySEC registered brokerage entities.
• Traders are advised to verify VPS proximity to minimize route hops.`,
    category: 'brokers',
    tags: ['Brokers', 'ECN', 'Spreads', 'Execution Speed', 'MT5'],
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80',
    source: 'Broker Research Desk',
    author: {
      name: 'Aditya Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      role: 'Macro & Currency Strategist',
    },
    isFeatured: false,
    isPublished: true,
    readTime: '4 min read',
    publishedAt: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    views: 618,
  },
  {
    _id: 'fb-7',
    title: 'European Central Bank Weighs Summer Growth Risks: Christine Lagarde Stresses Data-Dependent Stance',
    slug: 'ecb-weighs-summer-growth-risks-lagarde-stance',
    summary:
      'ECB policymakers balance cooling wage pressures against stubborn services inflation, sending mixed signals for future 25bps rate reductions.',
    content: `Speaking at the European financial symposium, ECB President Christine Lagarde signaled that while inflation in the Eurozone has moderated toward the 2% target, domestic cost pressures remain sticky.

Economic data from Germany and France indicated mild manufacturing stabilization, though business sentiment indicators reflect caution regarding borrowing costs.

The Euro traded cautiously against both the Swiss Franc (EUR/CHF) and Japanese Yen (EUR/JPY), with hedge funds adjusting short-dated options risk reversals.`,
    category: 'global',
    tags: ['ECB', 'Eurozone', 'EUR', 'Interest Rates', 'Lagarde'],
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    source: 'European Market Dispatch',
    author: {
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      role: 'Senior FX Quantitative Analyst',
    },
    isFeatured: false,
    isPublished: true,
    readTime: '3 min read',
    publishedAt: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
    views: 147,
  },
];

export const FALLBACK_BREAKING_TICKER = [
  { id: 'tk-1', text: 'BTC/USD breaks above $67,400 with 24h institutional volume topping $28B', time: 'Just now' },
  { id: 'tk-2', text: 'USD/INR holds strong at 83.42 as RBI intervenes to balance capital flows', time: '4m ago' },
  { id: 'tk-3', text: 'Gold (XAU/USD) tests $2,385 amid sustained Asian sovereign central bank buying', time: '12m ago' },
  { id: 'tk-4', text: 'EUR/USD steadies at 1.0862 ahead of US core inflation prints', time: '19m ago' },
  { id: 'tk-5', text: 'Crude Oil (WTI) fluctuates around $81.20 as OPEC+ signals voluntary supply discipline', time: '34m ago' },
];

export const newsService = {
  // Public news retrieval with filters
  async getPublishedNews({ category = 'all', search = '', page = 1, limit = 15, refresh = false } = {}) {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search && search.trim()) params.append('search', search.trim());
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (refresh) {
        params.append('refresh', 'true');
        params.append('_t', Date.now().toString());
      }

      const res = await apiClient.get(`/news?${params.toString()}`);
      if (res.data?.data) {
        return res.data.data;
      }
      return {
        articles: FALLBACK_NEWS,
        pagination: { total: FALLBACK_NEWS.length, page: 1, limit, totalPages: 1 },
        breakingTicker: FALLBACK_BREAKING_TICKER,
      };
    } catch (error) {
      console.warn('Backend news fetch failed, falling back to local market news:', error.message);
      let filtered = [...FALLBACK_NEWS];
      if (refresh) {
        // Cycle the list so clicking refresh in fallback mode also brings fresh stories forward
        const shifted = filtered.shift();
        filtered.push(shifted);
        filtered = filtered.map((a, i) => ({
          ...a,
          publishedAt: new Date(Date.now() - (i * 12 + 2) * 60 * 1000).toISOString(),
        }));
      }
      if (category && category !== 'all') {
        filtered = filtered.filter((a) => a.category === category);
      }
      if (search && search.trim()) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.title.toLowerCase().includes(s) ||
            a.summary.toLowerCase().includes(s) ||
            a.tags?.some((t) => t.toLowerCase().includes(s))
        );
      }
      return {
        articles: filtered,
        pagination: { total: filtered.length, page: 1, limit, totalPages: 1 },
        breakingTicker: FALLBACK_BREAKING_TICKER,
      };
    }
  },

  // Single article lookup
  async getNewsArticle(slugOrId) {
    try {
      const res = await apiClient.get(`/news/${slugOrId}`);
      if (res.data?.data) {
        return res.data.data;
      }
      const match = FALLBACK_NEWS.find((a) => a.slug === slugOrId || a._id === slugOrId);
      if (match) {
        return {
          article: match,
          relatedArticles: FALLBACK_NEWS.filter((a) => a._id !== match._id && a.category === match.category).slice(0, 3),
        };
      }
      throw new Error('Article not found');
    } catch (error) {
      const match = FALLBACK_NEWS.find((a) => a.slug === slugOrId || a._id === slugOrId);
      if (match) {
        return {
          article: match,
          relatedArticles: FALLBACK_NEWS.filter((a) => a._id !== match._id && a.category === match.category).slice(0, 3),
        };
      }
      throw error;
    }
  },

  // Admin: Get all articles (drafts + published)
  async getAllAdminNews() {
    const res = await apiClient.get('/news/admin/all');
    return res.data?.data || { articles: [], counts: {} };
  },

  // Admin: Create article
  async createNewsArticle(articleData) {
    const res = await apiClient.post('/news', articleData);
    return res.data?.data;
  },

  // Admin: Update article
  async updateNewsArticle(id, articleData) {
    const res = await apiClient.put(`/news/${id}`, articleData);
    return res.data?.data;
  },

  // Admin: Delete article
  async deleteNewsArticle(id) {
    const res = await apiClient.delete(`/news/${id}`);
    return res.data?.data;
  },
};

export default newsService;
