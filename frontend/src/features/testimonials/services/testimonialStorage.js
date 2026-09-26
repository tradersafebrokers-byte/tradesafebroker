import apiClient from '../../auth/services/api.client.js';

export const INITIAL_DEMO_TESTIMONIALS = [
  {
    _id: 'demo-top-1',
    name: 'Mohd Siraj',
    role: 'Funded Scalper & Active Trader',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: '5.0',
    brokerName: 'IC Markets',
    brokerSlug: 'ic-markets',
    title: 'Saved $400/month in raw commissions',
    review: 'TradeSafeBrokers made choosing a broker effortless. The raw spread comparison between IC Markets and Exness saved me over $400 a month in trading commissions. Indispensable tool!',
    row: 'top',
    isDemo: true,
  },
  {
    _id: 'demo-top-2',
    name: 'Dr. Mukti Prasad Dash',
    role: 'Portfolio Manager & Swing Trader',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    rating: '4.9',
    brokerName: 'Exness',
    brokerSlug: 'exness',
    title: 'Tier-1 regulation & instant UPI withdrawal',
    review: 'The regulatory license verification and overnight swap fee transparency on TradeSafeBrokers are incredible. It gives me complete confidence knowing my capital is with Tier-1 regulated brokers.',
    row: 'top',
    isDemo: true,
  },
  {
    _id: 'demo-top-3',
    name: 'Pradum Kumar',
    role: 'Day Trader (EUR/USD, XAU/USD)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: '4.8',
    brokerName: 'Pepperstone',
    brokerSlug: 'pepperstone',
    title: 'Ultra-low slippage on Gold and EUR/USD',
    review: 'I used to trade with an offshore broker suffering massive slippage. TradeSafeBrokers’ live execution speed benchmarks directed me to Pepperstone. Night and day difference!',
    row: 'top',
    isDemo: true,
  },
  {
    _id: 'demo-top-4',
    name: 'Ananya Deshmukh',
    role: 'Algorithmic & EA Strategy Trader',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: '5.0',
    brokerName: 'Exness',
    brokerSlug: 'exness',
    title: 'Sub-30ms VPS latency for algorithmic bots',
    review: 'Ultra-low MT5 VPS execution latency was non-negotiable for my algorithmic bots. TradeSafeBrokers’ latency testing data was 100% accurate. Saved me months of costly trial and error.',
    row: 'top',
    isDemo: true,
  },
  {
    _id: 'demo-top-5',
    name: 'Vikramaditya Sen',
    role: 'Prop Desk Trading Lead',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: '4.9',
    brokerName: 'XM',
    brokerSlug: 'xm',
    title: 'FCA & CySEC verified safety with swift payouts',
    review: 'Our trading desk cross-checks every broker with TradeSafeBrokers before allocating live funds. Timely withdrawal records, FCA/CySEC audit notes, and honest ratings make them our go-to.',
    row: 'top',
    isDemo: true,
  },
  {
    _id: 'demo-top-6',
    name: 'Sneha Roy',
    role: 'Retail Forex Trader',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    rating: '5.0',
    brokerName: 'FXTM',
    brokerSlug: 'fxtm',
    title: 'Low deposit threshold & instant local banking',
    review: 'Clean side-by-side comparison, real trader reviews, and zero deceptive marketing. Finding a broker with $10 minimum deposit and instant local deposits was smooth and hassle-free.',
    row: 'top',
    isDemo: true,
  },
  {
    _id: 'demo-bot-1',
    name: 'Akash Warade',
    role: 'High-Frequency FX Trader',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    rating: '4.9',
    brokerName: 'Pepperstone',
    brokerSlug: 'pepperstone',
    title: 'Fastest withdrawal turnaround in forex',
    review: 'Whenever someone asks about broker withdrawal speeds, TradeSafeBrokers is the first portal I send them. They test the exact metrics brokers usually hide. Pure respect for their team!',
    row: 'bottom',
    isDemo: true,
  },
  {
    _id: 'demo-bot-2',
    name: 'Pragati Nayak',
    role: 'Price Action Mentor & Trader',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    rating: '5.0',
    brokerName: 'Exness',
    brokerSlug: 'exness',
    title: 'Tight spreads during CPI and NFP news',
    review: 'I advise every beginner in my trading mentorship group to first compare broker spreads on TradeSafeBrokers. Genuine transparency and safety save you from catastrophic blow-ups.',
    row: 'bottom',
    isDemo: true,
  },
  {
    _id: 'demo-bot-3',
    name: 'Samarth Jain',
    role: 'Forex Community Lead',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    rating: '4.8',
    brokerName: 'XM',
    brokerSlug: 'xm',
    title: '100% transparent and reliable broker',
    review: '100% transparent and reliable. Comparing spread costs during high-impact news like CPI and NFP gave me realistic expectations. Knowing your broker is safe brings true peace of mind.',
    row: 'bottom',
    isDemo: true,
  },
  {
    _id: 'demo-bot-4',
    name: 'Ritu & Sanjay Joshi',
    role: 'Private Wealth & Multi-Asset Investors',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    rating: '5.0',
    brokerName: 'AvaTrade',
    brokerSlug: 'avatrade',
    title: 'Client fund segregation and negative balance safety',
    review: 'We evaluate multi-asset brokers with TradeSafeBrokers. The side-by-side view showing leverage limits, Tier-1 regulation (FCA, ASIC), and client fund segregation is brilliantly implemented.',
    row: 'bottom',
    isDemo: true,
  },
  {
    _id: 'demo-bot-5',
    name: 'Karan Malhotra',
    role: 'Macro & News Trader',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    rating: '4.9',
    brokerName: 'IC Markets',
    brokerSlug: 'ic-markets',
    title: 'Flawless execution during extreme volatility',
    review: 'During emergency volatility spikes, execution speed and slippage protection are everything. TradeSafeBrokers’ detailed broker breakdowns give you the honest, unedited truth.',
    row: 'bottom',
    isDemo: true,
  },
  {
    _id: 'demo-bot-6',
    name: 'Meera Iyer',
    role: 'Automated Strategy Specialist',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: '5.0',
    brokerName: 'OctaFX',
    brokerSlug: 'octafx',
    title: 'Zero commission trading with UPI payouts',
    review: 'A genuinely honest review platform doing groundbreaking work. Their comprehensive broker fee calculator and raw spread analyses are unmatched anywhere in the industry.',
    row: 'bottom',
    isDemo: true,
  }
];

const DELETED_KEY = 'pipwise_deleted_testimonial_ids';
const CACHED_KEY = 'pipwise_testimonials_cache';

export const getDeletedIds = () => {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addDeletedId = (id) => {
  try {
    const current = getDeletedIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(DELETED_KEY, JSON.stringify(current));
    }
  } catch (e) {
    console.error('Failed to store deleted id', e);
  }
  try {
    window.dispatchEvent(new CustomEvent('pipwise_testimonials_updated', { detail: { deletedId: id } }));
  } catch (e) {}
};

export const clearDeletedIds = () => {
  try {
    localStorage.removeItem(DELETED_KEY);
    localStorage.removeItem(CACHED_KEY);
  } catch (e) {}
  try {
    window.dispatchEvent(new CustomEvent('pipwise_testimonials_updated', { detail: { reset: true } }));
  } catch (e) {}
};

/**
 * Synchronous retrieval of active testimonials (0ms latency, zero re-render flicker)
 */
export const getSynchronousTestimonials = () => {
  const deletedIds = getDeletedIds();
  try {
    const cached = localStorage.getItem(CACHED_KEY);
    if (cached) {
      const list = JSON.parse(cached);
      if (Array.isArray(list) && list.length > 0) {
        return list.filter((t) => !deletedIds.includes(t._id) && !deletedIds.includes(t.name));
      }
    }
  } catch (e) {}

  return INITIAL_DEMO_TESTIMONIALS.filter(
    (t) => !deletedIds.includes(t._id) && !deletedIds.includes(t.name)
  );
};

/**
 * Fetch testimonials with backend API /reviews + local fallback & sync
 */
export const fetchActiveTestimonials = async () => {
  const deletedIds = getDeletedIds();
  try {
    const res = await apiClient.get('/reviews', { params: { limit: 50 }, timeout: 6000 });
    const remoteReviews = res.data?.reviews || [];
    if (Array.isArray(remoteReviews) && remoteReviews.length > 0) {
      const realMapped = remoteReviews.map((r, idx) => ({
        _id: r._id,
        name: r.username || 'Verified Trader',
        role: r.verifiedTrader ? 'Verified Trader' : 'Forex Trader',
        avatar: r.user?.avatar || (idx % 2 === 0 ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
        rating: String(r.rating || 5.0),
        title: r.title || `${r.rating}★ Review for ${r.brokerName || 'Forex Broker'}`,
        review: r.comment,
        brokerName: r.brokerName || 'Forex Broker',
        brokerSlug: r.brokerSlug || 'forex-broker',
        depositMethod: r.depositMethodUsed || 'UPI / IMPS',
        date: r.createdAt,
        row: idx % 2 === 0 ? 'top' : 'bottom',
        isRealReview: true,
      })).filter((t) => !deletedIds.includes(t._id));

      const synchronous = getSynchronousTestimonials();
      const combined = [
        ...realMapped,
        ...synchronous.filter((s) => !realMapped.some((rm) => rm._id === s._id)),
      ];
      try {
        localStorage.setItem(CACHED_KEY, JSON.stringify(combined));
      } catch (e) {}
      return combined;
    }
  } catch (err) {
    // Graceful offline fallback
  }

  return getSynchronousTestimonials();
};
