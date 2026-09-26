/**
 * Detailed Editorial Reviews, Spread Breakdowns, and Trading Analysis for Top Brokers
 * Provides in-depth text and structured data for dedicated /reviews/:slug pages
 */

export const BROKER_EDITORIAL_REVIEWS = {
  xm: {
    heroTitle: 'XM Review & Spreads Analysis 2026',
    tagline: 'Lowest minimum deposit entry from ₹450 with ₹2,500 trading bonus and zero requote STP execution.',
    verdict: 'XM stands out as one of the most accessible and trader-friendly brokers for retail forex traders in India and globally. With an ultra-low minimum deposit of just ₹450 ($5) and an instant ₹2,500 ($30) no-deposit bonus, it provides an exceptional sandbox for both beginners learning live market dynamics and experienced traders testing algorithmic models. Regulated by top-tier authorities including the UK FCA, Cyprus CySEC, and Australia ASIC, XM guarantees 100% negative balance protection and complete segregation of client funds in Tier-1 banks.',
    spreadsAnalysis: 'XM offers two main pricing models: the Standard Account with all-in spreads starting from 1.0 pip and zero commission, and the XM Ultra Low Account which tightens spreads down to 0.6 pips on EUR/USD with zero separate commission fees. This all-in model eliminates the confusing calculations of round-turn commissions per lot, making cost tracking simple and predictable.',
    scalpingPolicy: 'XM permits scalping, automated Expert Advisors (EAs), and hedging across all account types. With their strict 99.35% execution rate under 1 second and zero requotes policy, market orders execute cleanly without unexpected rejection during standard market hours.',
    depositWithdrawalDetails: 'For Indian traders, XM supports smooth local payment channels including Instant UPI, NetBanking, Google Pay, and international cards. Deposits are credited instantly with 100% covered transaction fees, while withdrawals are typically processed within 2 to 24 hours back to your verified Indian bank account.',
    regulatoryDetails: 'Operated by Trading Point of Financial Instruments UK Ltd (FCA 705428), Trading Point of Financial Instruments Ltd (CySEC 120/10), and XM Global (FSC). Client funds are safeguarded in segregated Tier-1 banking institutions with statutory investor protection schemes.',
    spreadTable: [
      { pair: 'EUR/USD', standard: '1.0 pips', raw: '0.6 pips', commission: '$0 commission' },
      { pair: 'GBP/USD', standard: '1.2 pips', raw: '0.8 pips', commission: '$0 commission' },
      { pair: 'USD/INR', standard: '2.5 pips', raw: '1.8 pips', commission: '$0 commission' },
      { pair: 'Gold (XAU/USD)', standard: '2.4 pips', raw: '1.6 pips', commission: '$0 commission' },
      { pair: 'Bitcoin (BTC/USD)', standard: '$28', raw: '$18', commission: '$0 commission' },
    ],
    accountTypesList: [
      { name: 'Micro Account', minDep: '₹450 ($5)', spread: 'From 1.0 pip', leverage: '1:1000', bestFor: 'Beginners testing small lots (1,000 units)' },
      { name: 'Standard Account', minDep: '₹450 ($5)', spread: 'From 1.0 pip', leverage: '1:1000', bestFor: 'Regular retail swing and day traders' },
      { name: 'XM Ultra Low', minDep: '₹450 ($5)', spread: 'From 0.6 pips', leverage: '1:1000', bestFor: 'Cost-conscious intraday traders with zero commission' },
    ],
  },
  exness: {
    heroTitle: 'Exness Review & Fees Analysis 2026',
    tagline: 'India\'s #1 chosen broker with 60-second automated UPI payouts and 0.0 pip raw liquidity.',
    verdict: 'Exness is widely recognized as the market leader in forex and CFD trading volume worldwide, holding the #1 ranking for Indian traders. Its standout breakthrough is instant automated withdrawal processing: payout requests are approved algorithmically in under 60 seconds 24/7 without manual back-office waiting. Coupled with raw spreads starting from 0.0 pips and zero overnight swap fees on major currencies and Gold, Exness offers institutional-grade conditions directly to retail traders.',
    spreadsAnalysis: 'Exness provides some of the lowest trading fees in the industry. The Raw Spread and Zero accounts offer spreads starting at 0.0 pips with a competitive $3.50 commission per lot per side. For swing traders, the Standard Account features tight spreads from 0.3 pips with zero commission and zero swap charges, drastically cutting holding costs on extended positions.',
    scalpingPolicy: 'Exness provides market execution with unlimited leverage for eligible account tiers and ultra-low slippage. Scalpers, news traders, and high-frequency automated bots operate with zero restrictions on order distance or holding time.',
    depositWithdrawalDetails: 'Deposits and withdrawals are automated through UPI, IMPS, NetBanking, Paytm, and crypto (USDT). The minimum deposit is ₹850 ($10), and INR conversions use live fair market interbank rates with zero hidden currency fees.',
    regulatoryDetails: 'Regulated by the UK Financial Conduct Authority (FCA), Cyprus Securities and Exchange Commission (CySEC), and the Seychelles FSA. All client assets are segregated in Tier-1 banks with negative balance protection.',
    spreadTable: [
      { pair: 'EUR/USD', standard: '0.6 pips', raw: '0.0 pips', commission: '$3.50/lot' },
      { pair: 'GBP/USD', standard: '0.8 pips', raw: '0.1 pips', commission: '$3.50/lot' },
      { pair: 'USD/INR', standard: '1.4 pips', raw: '0.4 pips', commission: '$3.50/lot' },
      { pair: 'Gold (XAU/USD)', standard: '1.2 pips', raw: '0.0 pips', commission: '$3.50/lot' },
      { pair: 'Bitcoin (BTC/USD)', standard: '$14', raw: '$0', commission: '$3.50/lot' },
    ],
    accountTypesList: [
      { name: 'Standard Account', minDep: '₹850 ($10)', spread: 'From 0.3 pips', leverage: '1:Unlimited', bestFor: 'Commission-free trading with zero swaps' },
      { name: 'Raw Spread Account', minDep: '₹16,500 ($200)', spread: 'From 0.0 pips', leverage: '1:Unlimited', bestFor: 'Professional day traders and scalpers' },
      { name: 'Zero Account', minDep: '₹16,500 ($200)', spread: '0.0 pips on top 30 pairs', leverage: '1:Unlimited', bestFor: 'High frequency EAs and algorithmic traders' },
    ],
  },
  'ic-markets': {
    heroTitle: 'IC Markets Scalping & True ECN Review 2026',
    tagline: 'World\'s premier True ECN broker with sub-35ms fiber optic routing and TradingView integration.',
    verdict: 'Headquartered in Sydney, Australia, IC Markets is the premier destination for high-volume scalpers, algorithmic developers, and professional traders worldwide. By connecting directly to over 25 Tier-1 liquidity providers via fiber-optic cross connects in the Equinix NY4 (New York) and LD4 (London) financial data centers, IC Markets delivers institutional execution speed under 35ms with true raw spreads starting at 0.0 pips.',
    spreadsAnalysis: 'On the Raw Spread account, IC Markets regularly displays EUR/USD spreads of 0.0 to 0.1 pips during European and US market hours. Commission is fixed at $3.50 per standard lot per side ($7.00 round turn) on MetaTrader, and $3.00 per side on cTrader, representing the lowest net trading cost profile available in retail forex.',
    scalpingPolicy: 'IC Markets has zero restrictions on trading style. There is no minimum stop-loss distance, scalping is 100% permitted, and automated Expert Advisors (EAs) can execute thousands of transactions per day without dealer desk interference.',
    depositWithdrawalDetails: 'Supported deposit methods include Indian NetBanking, international credit/debit cards, crypto, Skrill, and Neteller. While the initial deposit of ₹16,500 ($200) is higher than entry-level brokers, it unlocks raw institutional trading pools with zero markup.',
    regulatoryDetails: 'Licensed by the Australian Securities and Investments Commission (ASIC AFSL 335692), CySEC (362/18), and the FSA. Client funds are kept in ring-fenced trust accounts at National Australia Bank (NAB) and Westpac.',
    spreadTable: [
      { pair: 'EUR/USD', standard: '0.8 pips', raw: '0.0 pips', commission: '$3.50/lot' },
      { pair: 'GBP/USD', standard: '1.0 pips', raw: '0.1 pips', commission: '$3.50/lot' },
      { pair: 'USD/JPY', standard: '0.9 pips', raw: '0.1 pips', commission: '$3.50/lot' },
      { pair: 'Gold (XAU/USD)', standard: '1.5 pips', raw: '0.6 pips', commission: '$3.50/lot' },
      { pair: 'US500 Index', standard: '0.4 pts', raw: '0.2 pts', commission: '$0' },
    ],
    accountTypesList: [
      { name: 'Raw Spread (MetaTrader)', minDep: '₹16,500 ($200)', spread: 'From 0.0 pips', leverage: '1:500', bestFor: 'EAs, scalpers, and MT4/MT5 traders' },
      { name: 'Raw Spread (cTrader)', minDep: '₹16,500 ($200)', spread: 'From 0.0 pips', leverage: '1:500', bestFor: 'cTrader users with lower $6 round-turn commission' },
      { name: 'Standard Account', minDep: '₹16,500 ($200)', spread: 'From 0.6 pips', leverage: '1:500', bestFor: 'Discretionary traders preferring all-in spread pricing' },
    ],
  },
  pepperstone: {
    heroTitle: 'Pepperstone ECN & Low-Latency Review 2026',
    tagline: 'Multi-award winning broker with direct TradingView charting and dual Tier-1 ASIC & FCA regulation.',
    verdict: 'Pepperstone is renowned among active traders for combining institutional pricing with modern trading platforms. It offers direct integration with TradingView, allowing traders to execute orders directly from advanced technical charts without switching windows. With dual licensing from the UK Financial Conduct Authority (FCA) and Australian ASIC, Pepperstone is one of the safest and most reliable choices for serious currency traders.',
    spreadsAnalysis: 'The Pepperstone Razor account provides institutional spreads from 0.0 pips with a competitive $3.50 commission per lot per side. Average EUR/USD spreads during London and New York overlaps sit at 0.17 pips, while major index CFDs like the US Tech 100 and US 500 offer tight pricing with zero commission.',
    scalpingPolicy: 'Pepperstone welcomes scalping, hedging, news trading, and automated algorithms. With average execution speeds under 30ms and Equinix data center infrastructure, latency is minimized for maximum fill accuracy.',
    depositWithdrawalDetails: 'Indian traders can fund accounts using local NetBanking, UPI gateways, Visa/Mastercard, and cryptocurrency. Zero deposit and withdrawal fees are charged by Pepperstone.',
    regulatoryDetails: 'Supervised by the FCA (UK), ASIC (Australia), CySEC (Cyprus), BaFin (Germany), and SCB. Complete segregation of client assets and participation in client compensation programs.',
    spreadTable: [
      { pair: 'EUR/USD', standard: '0.8 pips', raw: '0.0 pips', commission: '$3.50/lot' },
      { pair: 'GBP/USD', standard: '1.0 pips', raw: '0.2 pips', commission: '$3.50/lot' },
      { pair: 'EUR/GBP', standard: '1.1 pips', raw: '0.3 pips', commission: '$3.50/lot' },
      { pair: 'Gold (XAU/USD)', standard: '1.8 pips', raw: '0.8 pips', commission: '$3.50/lot' },
      { pair: 'NAS100', standard: '1.0 pts', raw: '0.8 pts', commission: '$0' },
    ],
    accountTypesList: [
      { name: 'Razor Account', minDep: '₹16,000 ($200)', spread: 'From 0.0 pips', leverage: '1:500', bestFor: 'Scalpers, TradingView chart traders, and algorithmic bots' },
      { name: 'Standard Account', minDep: '₹16,000 ($200)', spread: 'From 0.6 pips', leverage: '1:500', bestFor: 'Commission-free discretionary technical trading' },
    ],
  },
  fxtm: {
    heroTitle: 'FXTM Zero Spread & Local Banking Review 2026',
    tagline: 'High leverage up to 1:2000 with smooth Indian NetBanking and comprehensive trader education.',
    verdict: 'ForexTime (FXTM) has established a deep presence in the Asian and Indian trading markets by offering dedicated local banking channels and high leverage tiers up to 1:2000. FXTM\'s Advantage Account provides true raw pricing starting from 0.0 pips with variable commissions that decrease as trading volume grows, making it an attractive platform for both ambitious new traders and experienced scalpers.',
    spreadsAnalysis: 'FXTM offers three account tiers. The Advantage Account delivers ultra-tight spreads from 0.0 pips with an average commission of $0.40 to $2.00 per lot depending on volume. The Micro and Advantage Plus accounts offer commission-free floating spreads starting from 1.5 pips.',
    scalpingPolicy: 'Scalping and EA execution are fully supported on Advantage and Advantage Plus accounts. FXTM guarantees rapid order execution with zero requotes on market orders.',
    depositWithdrawalDetails: 'FXTM supports local Indian NetBanking, UPI, IMPS, international bank wires, and cryptocurrency. Local rupee deposits are credited within minutes without third-party exchange markup.',
    regulatoryDetails: 'Regulated by the UK FCA (600475), Cyprus CySEC (185/12), and South Africa FSCA. Segregated client bank accounts and negative balance protection apply across all accounts.',
    spreadTable: [
      { pair: 'EUR/USD', standard: '1.5 pips', raw: '0.1 pips', commission: '$1.50/lot' },
      { pair: 'GBP/USD', standard: '1.7 pips', raw: '0.3 pips', commission: '$1.50/lot' },
      { pair: 'USD/JPY', standard: '1.6 pips', raw: '0.2 pips', commission: '$1.50/lot' },
      { pair: 'Gold (XAU/USD)', standard: '2.5 pips', raw: '1.0 pips', commission: '$1.50/lot' },
      { pair: 'WTI Oil', standard: '3.0 pts', raw: '1.8 pts', commission: '$0' },
    ],
    accountTypesList: [
      { name: 'Advantage Account', minDep: '₹16,000 ($200)', spread: 'From 0.0 pips', leverage: '1:2000', bestFor: 'Tight raw spreads and competitive commissions' },
      { name: 'Advantage Plus', minDep: '₹16,000 ($200)', spread: 'From 1.5 pips', leverage: '1:2000', bestFor: 'Commission-free trading with no extra calculations' },
      { name: 'Micro Account', minDep: '₹850 ($10)', spread: 'From 1.5 pips', leverage: '1:1000', bestFor: 'Budget entry with micro lot sizes' },
    ],
  },
  avatrade: {
    heroTitle: 'AvaTrade Multi-Asset & Risk Protection Review 2026',
    tagline: 'Pioneering risk management with AvaProtect loss reimbursement and multi-continental regulation.',
    verdict: 'AvaTrade is a globally trusted pioneer in multi-asset trading, regulated across 6 jurisdictions including the Central Bank of Ireland, Australia ASIC, and Japan FSA. Its unique flagship feature, AvaProtect, is an innovative risk management tool that allows traders to purchase loss reimbursement insurance for specific trades during volatile news announcements. If the trade ends in a loss within the protected window, AvaTrade refunds the capital directly to your balance.',
    spreadsAnalysis: 'Unlike pure ECN brokers with variable commissions, AvaTrade specializes in transparent, fixed-spread and floating-spread accounts with zero separate commission fees. This predictability makes it popular for swing traders and multi-asset investors trading Forex, Commodities, Indices, and Vanilla Options simultaneously.',
    scalpingPolicy: 'AvaTrade supports all standard trading styles, social copy trading via AvaSocial, and automated strategies. AvaTradeGO mobile app provides integrated market sentiment and real-time alerts.',
    depositWithdrawalDetails: 'Deposits can be made via local NetBanking, UPI, Visa/Mastercard, and wire transfer with a low minimum deposit of ₹8,000 ($100). No withdrawal fees are levied by AvaTrade.',
    regulatoryDetails: 'Regulated by Central Bank of Ireland (C53877), ASIC (406684), FSA Japan, FSCA South Africa, and BVI FSC. Tier-1 bank segregation and European investor compensation framework.',
    spreadTable: [
      { pair: 'EUR/USD', standard: '0.9 pips', raw: '0.9 pips (Fixed)', commission: '$0' },
      { pair: 'GBP/USD', standard: '1.4 pips', raw: '1.4 pips (Fixed)', commission: '$0' },
      { pair: 'USD/JPY', standard: '1.0 pips', raw: '1.0 pips (Fixed)', commission: '$0' },
      { pair: 'Gold (XAU/USD)', standard: '2.8 pips', raw: '2.8 pips (Fixed)', commission: '$0' },
      { pair: 'S&P 500', standard: '0.5 pts', raw: '0.5 pts', commission: '$0' },
    ],
    accountTypesList: [
      { name: 'Standard Account', minDep: '₹8,000 ($100)', spread: 'From 0.9 pips', leverage: '1:400', bestFor: 'Multi-asset trading with AvaProtect risk insurance' },
      { name: 'Islamic Swap-Free', minDep: '₹8,000 ($100)', spread: 'From 0.9 pips', leverage: '1:400', bestFor: '100% Sharia-compliant zero overnight interest' },
      { name: 'Professional Account', minDep: '₹40,000 ($500)', spread: 'From 0.6 pips', leverage: '1:400', bestFor: 'Institutional volume traders with priority desk' },
    ],
  },
};

/**
 * Returns tailored review content for a broker, with fallback generation
 */
export function getBrokerEditorialContent(broker) {
  if (!broker) return null;
  const rawKey = (broker.slug || broker.id || broker.name || '').toLowerCase();
  const cleanKey = rawKey.replace(/[^a-z0-9]/g, '');
  
  for (const [key, val] of Object.entries(BROKER_EDITORIAL_REVIEWS)) {
    if (key.toLowerCase() === rawKey || key.replace(/[^a-z0-9]/g, '') === cleanKey) {
      return val;
    }
  }

  // Generative fallback for any other broker in directory
  return {
    heroTitle: `${broker.name} Review & Complete Analysis 2026`,
    tagline: `Comprehensive analysis of ${broker.name} spreads, leverage, execution and safety standards.`,
    verdict: `${broker.name} is an established international forex brokerage providing direct market access across global currency pairs and CFDs. Regulated under ${broker.regulation || 'strict regulatory authorities'}, it combines competitive liquidity, ${broker.spread || 'low spreads'}, and maximum leverage up to ${broker.maxLeverage || '1:500'}. Client deposits are ring-fenced in segregated accounts with Tier-1 banking partners.`,
    spreadsAnalysis: `${broker.name} offers pricing starting from ${broker.spread || '0.5 pips'} with flexible execution models. Traders can choose between Standard commission-free accounts or raw ECN spread accounts depending on their strategy requirements.`,
    scalpingPolicy: `Scalping, hedging, automated Expert Advisors (EAs), and intraday momentum strategies are supported on ${broker.platforms || 'MT4 & MT5'}. Fast order routing ensures minimal slippage under normal liquidity conditions.`,
    depositWithdrawalDetails: `Supported funding methods include ${broker.payments || 'NetBanking, Cards, UPI, and Crypto'}. Minimum deposit is ${broker.minDeposit || '₹850 ($10)'} with fast withdrawal processing directly to verified payment rails.`,
    regulatoryDetails: `Licensed and monitored by ${broker.regulation || 'international supervisory bodies'}. Adheres to strict client segregation, regular compliance audits, and negative balance protection.`,
    spreadTable: [
      { pair: 'EUR/USD', standard: broker.spread || '0.8 pips', raw: '0.1 pips', commission: '$3.50/lot' },
      { pair: 'GBP/USD', standard: '1.2 pips', raw: '0.3 pips', commission: '$3.50/lot' },
      { pair: 'USD/JPY', standard: '1.0 pips', raw: '0.2 pips', commission: '$3.50/lot' },
      { pair: 'Gold (XAU/USD)', standard: '2.0 pips', raw: '1.0 pips', commission: '$3.50/lot' },
      { pair: 'Crypto', standard: 'Floating', raw: 'Market', commission: '0.1%' },
    ],
    accountTypesList: [
      { name: 'Standard Account', minDep: broker.minDeposit || '₹850', spread: broker.spread || '0.8 pips', leverage: broker.maxLeverage || '1:500', bestFor: 'Commission-free retail trading' },
      { name: 'Raw / ECN Account', minDep: '₹16,500 ($200)', spread: 'From 0.0 pips', leverage: broker.maxLeverage || '1:500', bestFor: 'Scalpers and high-frequency traders' },
    ],
  };
}
