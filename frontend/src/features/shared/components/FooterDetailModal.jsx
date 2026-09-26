import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, CheckCircle2, Calculator, Info, Award, Scale, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './FooterDetailModal.css';

const FOOTER_MODAL_CONTENTS = {
  'Pip Value Calculator': {
    icon: Calculator,
    title: 'Pip Value Calculator & Methodology',
    subtitle: 'Understand position risk and precise pip valuations across all major currencies',
    content: (
      <div>
        <p>A pip (percentage in point) measures the smallest price change in a currency pair. For pairs quoted to 4 decimal places, 1 pip = 0.0001. For JPY pairs, 1 pip = 0.01.</p>
        <div className="fdm-highlight-box">
          <strong>Formula:</strong> Pip Value = (1 Pip / Exchange Rate) × Trade Size (in Base Currency)
        </div>
        <h4>Standard Lot Sizes</h4>
        <ul>
          <li><strong>Standard Lot (100,000 units):</strong> ~\$10.00 per pip on EUR/USD</li>
          <li><strong>Mini Lot (10,000 units):</strong> ~\$1.00 per pip on EUR/USD</li>
          <li><strong>Micro Lot (1,000 units):</strong> ~\$0.10 per pip on EUR/USD</li>
        </ul>
        <p>TradeSafeBrokers calculates pip values in real-time to help you calculate appropriate stop-loss distances and enforce strict risk management under 1-2% per trade.</p>
      </div>
    ),
  },
  'Margin & Leverage Tool': {
    icon: Scale,
    title: 'Margin & Leverage Tool',
    subtitle: 'Calculate exact capital requirements and collateral buffers before placing orders',
    content: (
      <div>
        <p>Margin is the collateral required by your broker to keep a leveraged position open. Leverage amplifies both profits and potential capital losses.</p>
        <div className="fdm-highlight-box">
          <strong>Required Margin Formula:</strong> (Contract Size × Lots) / Leverage Ratio
        </div>
        <h4>Leverage Comparison Table</h4>
        <ul>
          <li><strong>1:30 (Tier-1 Regulated - FCA/ASIC):</strong> \$3,333 margin required for 1 Standard Lot EUR/USD</li>
          <li><strong>1:100:</strong> \$1,000 margin required for 1 Standard Lot EUR/USD</li>
          <li><strong>1:500 (Offshore Entities):</strong> \$200 margin required for 1 Standard Lot EUR/USD</li>
        </ul>
        <p>Always maintain a margin level above 200% to avoid automated margin calls or broker stop-outs during high-volatility news events.</p>
      </div>
    ),
  },
  'Live Spread Benchmarks': {
    icon: ShieldCheck,
    title: 'Live Spread & Commission Benchmarks',
    subtitle: 'Transparent, real-time bid/ask spread tracking directly from broker servers',
    content: (
      <div>
        <p>Our infrastructure continuously pings broker FIX API bridges during London and New York market hours to capture genuine average spreads.</p>
        <h4>How We Evaluate Spreads</h4>
        <ul>
          <li><strong>Raw ECN Spreads:</strong> Zero-markup spreads starting from 0.0 pips + fixed round-turn commission (\$3-\$7 per lot).</li>
          <li><strong>Standard Commission-Free:</strong> All-in floating spreads starting around 0.6 - 1.2 pips with zero separate commission fees.</li>
          <li><strong>Slippage Auditing:</strong> We measure difference between requested fill prices and executed fills during volatile CPI and NFP news releases.</li>
        </ul>
      </div>
    ),
  },
  'Broker Withdrawal Speed Test': {
    icon: Award,
    title: 'Broker Withdrawal Speed Audits',
    subtitle: 'Real capital deposits and actual withdrawal turnaround benchmarks',
    content: (
      <div>
        <p>A broker rating is meaningless if withdrawals are delayed. Our testing desk opens live funded accounts with each featured broker and executes real test withdrawals.</p>
        <h4>Benchmarked Withdrawal Rails</h4>
        <ul>
          <li><strong>Cryptocurrency (USDT/BTC):</strong> Averaging under 1 hour for automated back-office approvals.</li>
          <li><strong>E-Wallets (Skrill, Neteller, PayPal):</strong> Instant to same-day execution (0-4 hours).</li>
          <li><strong>Bank Wire &amp; Visa/Mastercard:</strong> 1-3 business days depending on correspondent banking networks.</li>
        </ul>
        <p>Brokers with unjustified delays or KYC loop hurdles are immediately penalized in our rankings.</p>
      </div>
    ),
  },
  'License & Regulatory Check': {
    icon: ShieldCheck,
    title: 'License & Regulatory Verification Desk',
    subtitle: 'Direct cross-referencing with global financial supervisory authorities',
    content: (
      <div>
        <p>Every broker featured on TradeSafeBrokers must possess verifiable licensing. We verify entity registration numbers against official regulatory databases:</p>
        <ul>
          <li><strong>FCA (United Kingdom):</strong> FSCS client money protection up to £85,000 per trader.</li>
          <li><strong>ASIC (Australia):</strong> Strict capital adequacy and AFSL client segregation compliance.</li>
          <li><strong>CySEC (Cyprus / EU):</strong> MiFID II directives with Investor Compensation Fund (ICF) up to €20,000.</li>
          <li><strong>FSCA (South Africa):</strong> ODP licensed regulation for African traders.</li>
        </ul>
        <p>We verify that client deposits are held in ring-fenced, segregated accounts at Tier-1 international banks.</p>
      </div>
    ),
  },
  'About Our Mission': {
    icon: Info,
    title: 'About TradeSafeBrokers',
    subtitle: 'Independent, transparent broker intelligence for global forex traders',
    content: (
      <div>
        <p>TradeSafeBrokers was founded by active retail traders frustrated by pay-to-rank review portals and deceptive broker affiliations.</p>
        <p>Our mission is simple: provide verified data, actual live spread measurements, real trader feedback, and unbiased rankings to safeguard retail trading capital.</p>
        <h4>Our Three Pillars</h4>
        <ul>
          <li><strong>No Pay-to-Rank:</strong> Broker placement is strictly determined by algorithmic scoring, not affiliate bids.</li>
          <li><strong>KYC-Verified Reviews:</strong> Reviews from verified traders carry official badges to eradicate fake bot reviews.</li>
          <li><strong>Open Advocacy:</strong> We assist traders in resolving disputes and regulatory complaints with listed brokers.</li>
        </ul>
      </div>
    ),
  },
  'How We Rate Brokers': {
    icon: Award,
    title: '100-Point Rating Algorithm',
    subtitle: 'Comprehensive mathematical evaluation across 8 critical trading categories',
    content: (
      <div>
        <p>Our proprietary 100-point broker scoring algorithm breaks down every broker into weighted categories:</p>
        <ul>
          <li><strong>Regulation &amp; Trust (25 pts):</strong> Tier-1 licensing, years in business, clean regulatory history.</li>
          <li><strong>Fees &amp; Spreads (20 pts):</strong> Real average spreads, overnight swap rates, hidden inactivity charges.</li>
          <li><strong>Deposit &amp; Withdrawal Speed (15 pts):</strong> Zero-fee processing, payment gateway variety, fast execution.</li>
          <li><strong>Platforms &amp; Tools (15 pts):</strong> MT4, MT5, cTrader, TradingView integration, proprietary mobile apps.</li>
          <li><strong>Execution &amp; Liquidity (10 pts):</strong> Latency in ms, slippage frequency, no-requote guarantees.</li>
          <li><strong>Customer Support (10 pts):</strong> 24/7 responsiveness via live chat and phone.</li>
          <li><strong>Trader Education &amp; Research (5 pts):</strong> Quality of market analysis, webinars, and beginner guides.</li>
        </ul>
      </div>
    ),
  },
  'Editorial Independence': {
    icon: Scale,
    title: 'Editorial Independence Statement',
    subtitle: 'Zero commercial interference in our ratings, reviews, and investigations',
    content: (
      <div>
        <p>Our review team operates independently of commercial partnerships. Brokers cannot buy higher ratings, alter review scores, or suppress negative trader feedback.</p>
        <p>While we may receive affiliate referral compensation when users open accounts through our links, this comes at zero cost to the trader and has zero influence on our factual scoring models.</p>
        <p>Any broker that fails regulatory compliance or withholds client withdrawals is flagged or removed regardless of commercial relationships.</p>
      </div>
    ),
  },
  'Trader Review Policy': {
    icon: CheckCircle2,
    title: 'Trader Review Moderation Policy',
    subtitle: 'Authentic community feedback backed by KYC validation',
    content: (
      <div>
        <p>To prevent fake reviews, review bombing, and marketing bot spam, TradeSafeBrokers enforces strict review standards:</p>
        <ul>
          <li><strong>KYC Verified Badge:</strong> Traders who complete government ID verification earn an official Verified Trader badge on their reviews.</li>
          <li><strong>Proof of Account:</strong> Reviews alleging fraud or withdrawal refusals are inspected with transaction hashes or broker statement proofs.</li>
          <li><strong>No Hate Speech or Defamation:</strong> Factual experiences are published; unverified personal attacks or competitor smear campaigns are removed.</li>
          <li><strong>Broker Right of Reply:</strong> Verified broker representatives have the right to respond publicly to trader feedback on our platform.</li>
        </ul>
      </div>
    ),
  },
};

export const FooterDetailModal = ({ isOpen, onClose, topic }) => {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const data = FOOTER_MODAL_CONTENTS[topic] || {
    icon: HelpCircle,
    title: topic || 'Information',
    subtitle: 'TradeSafeBrokers Verified Resource',
    content: (
      <p>
        Detailed documentation and live benchmarks for {topic}. TradeSafeBrokers provides transparent, independent data to support safe trading decisions worldwide.
      </p>
    ),
  };

  const IconComp = data.icon;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fdm-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <motion.div
          className="fdm-card"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="fdm-header">
            <div className="fdm-header-left">
              <div className="fdm-icon-halo">
                <IconComp size={22} strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="fdm-title">{data.title}</h3>
                <p className="fdm-subtitle">{data.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              className="fdm-close-btn"
              onClick={onClose}
              aria-label="Close details"
            >
              <X size={17} strokeWidth={2.5} />
            </button>
          </div>

          <div className="fdm-divider" />

          {/* Content Body */}
          <div className="fdm-body">{data.content}</div>

          {/* Footer Action */}
          <div className="fdm-footer">
            <span className="fdm-verified-tag">
              <ShieldCheck size={14} color="#10b981" />
              <span>TradeSafe Verified Resource</span>
            </span>
            <button type="button" className="fdm-done-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default FooterDetailModal;
