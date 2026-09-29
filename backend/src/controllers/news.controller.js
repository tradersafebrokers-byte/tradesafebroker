import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { News } from '../models/news.model.js';

// Pre-curated initial benchmark market articles
export const INITIAL_MARKET_NEWS = [
  {
    title: 'RBI Keeps Repo Rate Steady at 6.50%: Rupee Defends 83.40 as Forex Reserves Hit Record High',
    slug: 'rbi-repo-rate-steady-rupee-forex-reserves-record',
    summary:
      'The Reserve Bank of India maintained its benchmark repo rate with a focused stance on disinflation. Foreign exchange reserves surged past $650 billion, providing a solid cushion for the Indian Rupee against greenback volatility.',
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
    publishedAt: new Date(Date.now() - 25 * 60 * 1000), // 25 mins ago
  },
  {
    title: 'Bitcoin Surges Toward $68,000 as Institutional ETF Inflows Re-Accelerate Across Global Desks',
    slug: 'bitcoin-surges-68k-institutional-etf-inflows',
    summary:
      'BTC broke through key resistance levels with massive volume driven by net inflows into Spot ETFs and rising derivative open interest, testing crucial multi-month liquidity zones.',
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
    publishedAt: new Date(Date.now() - 48 * 60 * 1000), // 48 mins ago
  },
  {
    title: 'US Dollar Index (DXY) Hovers Around 105.20 Ahead of Core PCE Inflation Data & Fed Speeches',
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
    publishedAt: new Date(Date.now() - 75 * 60 * 1000),
  },
  {
    title: 'Gold (XAU/USD) Consolidates Near $2,385 as Sovereign Central Banks Accumulate Bullion',
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
    publishedAt: new Date(Date.now() - 110 * 60 * 1000),
  },
  {
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
    publishedAt: new Date(Date.now() - 160 * 60 * 1000),
  },
  {
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
    publishedAt: new Date(Date.now() - 210 * 60 * 1000),
  },
  {
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
    publishedAt: new Date(Date.now() - 320 * 60 * 1000),
  },
];

// In-memory cache for live syndicated market news
const syndicatedNewsCache = {
  items: [],
  lastFetched: 0,
  ttl: 2 * 60 * 1000, // 2 minutes cache
  isFetching: false,
};

const stripHtml = (html = '') => {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

const extractImageUrl = (item, fallbackUrl) => {
  if (item.enclosure?.link && typeof item.enclosure.link === 'string' && item.enclosure.link.startsWith('http')) {
    return item.enclosure.link;
  }
  if (item.thumbnail && typeof item.thumbnail === 'string' && item.thumbnail.startsWith('http')) {
    return item.thumbnail;
  }
  const desc = item.description || item.content || '';
  const match = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match && match[1] && match[1].startsWith('http')) {
    return match[1];
  }
  return fallbackUrl;
};

const RSS_FEEDS = [
  {
    name: 'ForexLive',
    category: 'forex',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.forexlive.com%2Ffeed%2Fnews',
    fallbackImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
    source: 'ForexLive Direct',
    author: {
      name: 'ForexLive Desk',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      role: 'Global FX Strategist',
    },
    defaultTags: ['Forex', 'EUR/USD', 'USD/INR', 'Central Banks', 'Currency'],
  },
  {
    name: 'Livemint Markets',
    category: 'indian-market',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.livemint.com%2Frss%2Fmarkets',
    fallbackImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
    source: 'Livemint Markets',
    author: {
      name: 'Mint Markets Desk',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      role: 'Financial Market Wire',
    },
    defaultTags: ['Indian Market', 'Nifty', 'Sensex', 'Rupee', 'SEBI', 'RBI'],
  },
  {
    name: 'Economic Times',
    category: 'indian-market',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Feconomictimes.indiatimes.com%2Fmarkets%2Frssfeeds%2F1977021501.cms',
    fallbackImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
    source: 'Economic Times Markets',
    author: {
      name: 'ET Markets Bureau',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80',
      role: 'Dalal Street Reporter',
    },
    defaultTags: ['Indian Economy', 'Sensex', 'RBI Policy', 'INR', 'FIIs'],
  },
  {
    name: 'Cointelegraph',
    category: 'crypto',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fcointelegraph.com%2Frss',
    fallbackImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    source: 'Cointelegraph Direct',
    author: {
      name: 'Cointelegraph Wire',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      role: 'Digital Assets Desk',
    },
    defaultTags: ['Bitcoin', 'Crypto', 'Blockchain', 'BTC', 'Altcoins'],
  },
  {
    name: 'CNBC Finance',
    category: 'global',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.cnbc.com%2Fid%2F10000664%2Fdevice%2Frss%2Frss.html',
    fallbackImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    source: 'CNBC Finance Wire',
    author: {
      name: 'CNBC Global Markets',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      role: 'Macroeconomic Analyst',
    },
    defaultTags: ['Global Macro', 'US Dollar', 'Federal Reserve', 'Inflation', 'Treasury'],
  },
  {
    name: 'Yahoo Finance',
    category: 'commodities',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffinance.yahoo.com%2Fnews%2Frssindex',
    fallbackImage: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80',
    source: 'Yahoo Finance Wire',
    author: {
      name: 'Yahoo Finance Bureau',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      role: 'Commodities & Macro Strategist',
    },
    defaultTags: ['Commodities', 'Gold', 'Crude Oil', 'Wall Street', 'Market Pulse'],
  },
];

export const fetchLiveSyndicatedNews = async (forceRefresh = false) => {
  const now = Date.now();
  if (
    !forceRefresh &&
    syndicatedNewsCache.items.length > 0 &&
    now - syndicatedNewsCache.lastFetched < syndicatedNewsCache.ttl
  ) {
    return syndicatedNewsCache.items;
  }

  if (syndicatedNewsCache.isFetching && syndicatedNewsCache.items.length > 0 && !forceRefresh) {
    return syndicatedNewsCache.items;
  }

  syndicatedNewsCache.isFetching = true;
  if (forceRefresh) {
    syndicatedNewsCache.items = [];
    syndicatedNewsCache.lastFetched = 0;
  }

  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map(async (feedConfig) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6500);
        try {
          const reqUrl = forceRefresh ? `${feedConfig.url}&_nocache=${Date.now()}` : feedConfig.url;
          const res = await fetch(reqUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'MarketWireNews/1.0',
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
            },
          });
          clearTimeout(timeoutId);
          if (!res.ok) return [];
          const data = await res.json();
          if (!data || !Array.isArray(data.items)) return [];

          return data.items.slice(0, 8).map((item, idx) => {
            const rawTitle = stripHtml(item.title || '');
            const rawDesc = stripHtml(item.description || item.content || '');
            const summary = rawDesc.length > 280 ? rawDesc.substring(0, 277) + '...' : rawDesc || rawTitle;
            const fullContent =
              rawDesc.length > 100
                ? `${rawDesc}\n\nKey Market Notes:\n• Real-time syndicate wire update dispatched by ${feedConfig.source}.\n• For complete live market coverage, visit original source: ${item.link || feedConfig.url}.`
                : `${rawTitle}\n\n${rawDesc}\n\nDispatched via ${feedConfig.source} live terminal.`;

            let slug = rawTitle
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .trim()
              .replace(/\s+/g, '-')
              .slice(0, 90);
            if (!slug) slug = `news-${Date.now()}-${idx}`;

            const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

            return {
              _id: `syn-${slug.slice(0, 24)}-${idx}`,
              title: rawTitle,
              slug,
              summary,
              content: fullContent,
              category: feedConfig.category,
              tags:
                Array.isArray(item.categories) && item.categories.length > 0
                  ? item.categories.map((c) => String(c).trim()).filter(Boolean)
                  : feedConfig.defaultTags,
              imageUrl: extractImageUrl(item, feedConfig.fallbackImage),
              source: feedConfig.source,
              sourceUrl: item.link || '',
              author: {
                name: item.author ? stripHtml(item.author) : feedConfig.author.name,
                avatar: feedConfig.author.avatar,
                role: feedConfig.author.role,
              },
              isFeatured: false,
              isPublished: true,
              readTime: `${Math.max(2, Math.ceil(rawDesc.split(/\s+/).length / 120))} min read`,
              views: Math.floor(Math.random() * 45) + 30,
              publishedAt: pubDate,
              isSyndicated: true,
            };
          });
        } catch (err) {
          clearTimeout(timeoutId);
          return [];
        }
      })
    );

    const merged = [];
    for (const r of results) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        merged.push(...r.value);
      }
    }

    if (merged.length > 0) {
      merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      syndicatedNewsCache.items = merged;
      syndicatedNewsCache.lastFetched = now;
    }
  } catch (err) {
    console.error('Error fetching live syndicated news:', err.message);
  } finally {
    syndicatedNewsCache.isFetching = false;
  }

  return syndicatedNewsCache.items;
};

/**
 * Seed initial market news if database collection is empty
 */
const ensureInitialNewsSeeded = async () => {
  try {
    const count = await News.countDocuments();
    if (count === 0) {
      await News.insertMany(INITIAL_MARKET_NEWS);
    }
  } catch (error) {
    console.error('Error auto-seeding initial news:', error.message);
  }
};

/**
 * @desc    Get all published news articles with category filter, search, & pagination
 * @route   GET /api/v1/news
 * @access  Public
 */
export const getPublishedNews = asyncHandler(async (req, res) => {
  await ensureInitialNewsSeeded();

  const { category, search, page = 1, limit = 15, refresh } = req.query;
  const isForceRefresh = refresh === 'true' || refresh === '1';

  const query = { isPublished: true };

  if (category && category !== 'all') {
    query.category = category;
  }

  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { title: { $regex: s, $options: 'i' } },
      { summary: { $regex: s, $options: 'i' } },
      { tags: { $in: [new RegExp(s, 'i')] } },
      { source: { $regex: s, $options: 'i' } },
    ];
  }

  // 1. Fetch DB articles (includes user-submitted and admin-submitted posts)
  const dbArticles = await News.find(query)
    .sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 })
    .lean();

  // 2. Fetch live syndicated RSS news items
  let syndicatedItems = await fetchLiveSyndicatedNews(isForceRefresh);

  // Filter syndicated items by category if provided
  if (category && category !== 'all') {
    syndicatedItems = syndicatedItems.filter((item) => item.category === category);
  }

  // Filter syndicated items by search keyword if provided
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    syndicatedItems = syndicatedItems.filter(
      (item) =>
        item.title.toLowerCase().includes(s) ||
        item.summary.toLowerCase().includes(s) ||
        (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(s))) ||
        item.source.toLowerCase().includes(s)
    );
  }

  // Merge: Featured DB articles first, then recent DB & syndicated articles sorted by publishedAt
  const featuredDbArticles = dbArticles.filter((a) => a.isFeatured);
  const nonFeaturedDbArticles = dbArticles.filter((a) => !a.isFeatured);

  const combinedChronological = [...nonFeaturedDbArticles, ...syndicatedItems].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const allMergedArticles = [...featuredDbArticles, ...combinedChronological];

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const totalCount = allMergedArticles.length;
  const skip = (pageNum - 1) * limitNum;
  const pagedArticles = allMergedArticles.slice(skip, skip + limitNum);

  // Generate real-time live pulse ticker items dynamically from the freshest syndicated & DB headlines
  const breakingTicker = [];
  const tickerCandidates = [...syndicatedItems, ...dbArticles].slice(0, 8);
  tickerCandidates.forEach((item, idx) => {
    breakingTicker.push({
      id: `tk-${idx}-${item._id}`,
      text: item.title,
      time: idx === 0 ? 'Just now' : `${idx * 4 + 2}m ago`,
      slug: item.slug,
    });
  });

  if (breakingTicker.length === 0) {
    breakingTicker.push(
      { id: 'tk-1', text: 'BTC/USD breaks above $67,400 with 24h institutional volume topping $28B', time: 'Just now' },
      { id: 'tk-2', text: 'USD/INR holds strong at 83.42 as RBI intervenes to balance capital flows', time: '4m ago' },
      { id: 'tk-3', text: 'Gold (XAU/USD) tests $2,385 amid sustained Asian sovereign central bank buying', time: '12m ago' }
    );
  }

  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        articles: pagedArticles,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum),
          hasNextPage: skip + pagedArticles.length < totalCount,
          hasPrevPage: pageNum > 1,
        },
        breakingTicker,
        featuredCount: featuredDbArticles.length,
      },
      'News articles retrieved successfully'
    )
  );
});

/**
 * @desc    Get a single news article by slug or ID
 * @route   GET /api/v1/news/:slugOrId
 * @access  Public
 */
export const getNewsArticleBySlugOrId = asyncHandler(async (req, res) => {
  const { slugOrId } = req.params;

  let article = null;
  if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
    article = await News.findById(slugOrId);
  }

  if (!article) {
    article = await News.findOne({ slug: slugOrId });
  }

  // If not found in DB, check the in-memory syndicated cache!
  if (!article) {
    const liveSyndicated = await fetchLiveSyndicatedNews();
    const synMatch = liveSyndicated.find((item) => item.slug === slugOrId || item._id === slugOrId);
    if (synMatch) {
      const related = liveSyndicated
        .filter((item) => item._id !== synMatch._id && item.category === synMatch.category)
        .slice(0, 3);
      return res.status(200).json(
        new ApiResponse(200, { article: synMatch, relatedArticles: related }, 'Syndicated news article fetched successfully')
      );
    }
    throw new ApiError(404, 'News article not found');
  }

  // Increment view counter
  article.views = (article.views || 0) + 1;
  await article.save({ validateBeforeSave: false });

  // Get related articles in same category
  const relatedArticles = await News.find({
    _id: { $ne: article._id },
    category: article.category,
    isPublished: true,
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        article,
        relatedArticles,
      },
      'News article fetched successfully'
    )
  );
});

/**
 * @desc    Create a news article or market analysis post (Admin or Registered Trader)
 * @route   POST /api/v1/news
 * @access  Private (Authenticated User or Admin)
 */
export const createNewsArticle = asyncHandler(async (req, res) => {
  const {
    title,
    summary,
    content,
    category,
    tags,
    imageUrl,
    source,
    sourceUrl,
    isFeatured = false,
    isPublished = true,
    authorName,
    authorRole,
    readTime,
  } = req.body;

  if (!title || !title.trim()) {
    throw new ApiError(400, 'Article title is required');
  }
  if (!summary || !summary.trim()) {
    throw new ApiError(400, 'Article summary is required');
  }
  if (!content || !content.trim()) {
    throw new ApiError(400, 'Article content is required');
  }

  // Generate unique slug
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  // Check collision
  const existing = await News.findOne({ slug });
  if (existing) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
  }

  const isAdmin = req.user?.role === 'admin';

  const defaultCategoryImages = {
    forex: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
    'indian-market': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
    crypto: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    commodities: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80',
    global: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    brokers: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80',
  };

  const selectedCategory = category || 'forex';

  const author = {
    name: isAdmin
      ? (authorName?.trim() || req.user?.fullName || req.user?.username || 'Editorial Desk')
      : (req.user?.username || req.user?.fullName || 'Community Trader'),
    avatar:
      req.user?.avatar ||
      (isAdmin
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'),
    role: isAdmin ? (authorRole?.trim() || 'Market Strategist') : 'Community Trader',
  };

  const article = await News.create({
    title: title.trim(),
    slug,
    summary: summary.trim(),
    content: content.trim(),
    category: selectedCategory,
    tags: Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [],
    imageUrl: imageUrl?.trim() || defaultCategoryImages[selectedCategory] || defaultCategoryImages.forex,
    source: source?.trim() || (isAdmin ? 'Editorial Desk' : 'Community Trader Wire'),
    sourceUrl: sourceUrl?.trim() || '',
    author,
    authorUserId: req.user?._id || null,
    isCommunityPost: !isAdmin,
    isFeatured: isAdmin ? Boolean(isFeatured) : false,
    isPublished: isAdmin ? (isPublished !== undefined ? Boolean(isPublished) : true) : true,
    readTime: readTime?.trim() || `${Math.max(1, Math.ceil(content.split(/\s+/).length / 180))} min read`,
    publishedAt: new Date(),
  });

  return res.status(201).json(new ApiResponse(201, article, 'News article published successfully'));
});

/**
 * @desc    Update an existing news article (Admin or Original Author)
 * @route   PUT /api/v1/news/:id
 * @access  Private
 */
export const updateNewsArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const article = await News.findById(id);
  if (!article) {
    throw new ApiError(404, 'News article not found');
  }

  const isAdmin = req.user?.role === 'admin';
  const isAuthor = article.authorUserId && article.authorUserId.toString() === req.user?._id?.toString();

  if (!isAdmin && !isAuthor) {
    throw new ApiError(403, 'You are not authorized to update this article');
  }

  const {
    title,
    summary,
    content,
    category,
    tags,
    imageUrl,
    source,
    sourceUrl,
    isFeatured,
    isPublished,
    authorName,
    authorRole,
    readTime,
  } = req.body;

  if (title !== undefined) article.title = title.trim();
  if (summary !== undefined) article.summary = summary.trim();
  if (content !== undefined) article.content = content.trim();
  if (category !== undefined) article.category = category;
  if (tags !== undefined) {
    article.tags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : article.tags;
  }
  if (imageUrl !== undefined) article.imageUrl = imageUrl.trim();
  if (source !== undefined) article.source = source.trim();
  if (sourceUrl !== undefined) article.sourceUrl = sourceUrl.trim();
  if (isAdmin && isFeatured !== undefined) article.isFeatured = Boolean(isFeatured);
  if (isAdmin && isPublished !== undefined) article.isPublished = Boolean(isPublished);
  if (readTime !== undefined) article.readTime = readTime.trim();

  if (isAdmin && (authorName || authorRole)) {
    article.author = {
      ...article.author,
      ...(authorName ? { name: authorName.trim() } : {}),
      ...(authorRole ? { role: authorRole.trim() } : {}),
    };
  }

  await article.save();

  return res.status(200).json(new ApiResponse(200, article, 'News article updated successfully'));
});

/**
 * @desc    Delete a news article (Admin or Original Author)
 * @route   DELETE /api/v1/news/:id
 * @access  Private
 */
export const deleteNewsArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const article = await News.findById(id);
  if (!article) {
    throw new ApiError(404, 'News article not found');
  }

  const isAdmin = req.user?.role === 'admin';
  const isAuthor = article.authorUserId && article.authorUserId.toString() === req.user?._id?.toString();

  if (!isAdmin && !isAuthor) {
    throw new ApiError(403, 'You are not authorized to delete this article');
  }

  await News.findByIdAndDelete(id);

  return res.status(200).json(new ApiResponse(200, { deletedId: id }, 'News article deleted successfully'));
});

/**
 * @desc    Admin: Get all articles (including drafts & stats)
 * @route   GET /api/v1/news/admin/all
 * @access  Private (Admin)
 */
export const getAllAdminNews = asyncHandler(async (req, res) => {
  const articles = await News.find().sort({ createdAt: -1 }).lean();
  const counts = {
    total: articles.length,
    published: articles.filter((a) => a.isPublished).length,
    drafts: articles.filter((a) => !a.isPublished).length,
    featured: articles.filter((a) => a.isFeatured).length,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        articles,
        counts,
      },
      'Admin news list retrieved successfully'
    )
  );
});
