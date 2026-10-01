import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

// Base Reference Exchange Rates (live benchmark updated with current interbank quotes)
export const DEFAULT_MARKET_RATES = {
  // Forex Majors
  EURUSD: 1.0865,
  GBPUSD: 1.2890,
  USDJPY: 154.80,
  USDCHF: 0.8920,
  AUDUSD: 0.6650,
  USDCAD: 1.3680,
  NZDUSD: 0.6120,

  // Forex Minors & Crosses
  EURGBP: 0.8430,
  EURJPY: 168.20,
  GBPJPY: 199.50,
  AUDJPY: 102.90,
  EURAUD: 1.6340,
  GBPCAD: 1.7630,
  NZDJPY: 94.75,
  AUDNZD: 1.0865,
  CADJPY: 113.15,
  CHFJPY: 173.55,

  // Indian Rupee (INR) Pairs
  USDINR: 83.52,
  EURINR: 90.75,
  GBPINR: 107.65,
  JPYINR: 0.5395,

  // Commodities & Precious Metals
  XAUUSD: 2658.50, // Real-time Spot Gold (Benchmark)
  XAGUSD: 31.45,   // Silver
  USOIL: 74.20,    // WTI Crude Oil

  // Crypto
  BTCUSD: 66500.00,
  ETHUSD: 2640.00,
};

// In-memory live rates cache
let cachedLiveRates = { ...DEFAULT_MARKET_RATES };
let lastRateFetchTime = 0;

async function refreshLiveRatesIfStale() {
  const now = Date.now();
  // Cache for 60 seconds
  if (now - lastRateFetchTime < 60000) {
    return cachedLiveRates;
  }

  try {
    // Attempt fetching live FX rates from open endpoint if online
    const fxRes = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(3000) });
    if (fxRes.ok) {
      const data = await fxRes.json();
      if (data?.rates) {
        if (data.rates.EUR) cachedLiveRates.EURUSD = Number((1 / data.rates.EUR).toFixed(4));
        if (data.rates.GBP) cachedLiveRates.GBPUSD = Number((1 / data.rates.GBP).toFixed(4));
        if (data.rates.JPY) cachedLiveRates.USDJPY = Number(data.rates.JPY.toFixed(2));
        if (data.rates.CHF) cachedLiveRates.USDCHF = Number(data.rates.CHF.toFixed(4));
        if (data.rates.AUD) cachedLiveRates.AUDUSD = Number((1 / data.rates.AUD).toFixed(4));
        if (data.rates.CAD) cachedLiveRates.USDCAD = Number(data.rates.CAD.toFixed(4));
        if (data.rates.INR) cachedLiveRates.USDINR = Number(data.rates.INR.toFixed(2));
      }
    }
  } catch {
    // Silently continue if network unavailable
  }

  try {
    // Attempt fetching live Gold Spot price (XAU / PAXG)
    const goldRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT', { signal: AbortSignal.timeout(3000) });
    if (goldRes.ok) {
      const goldData = await goldRes.json();
      const goldPrice = parseFloat(goldData.price);
      if (goldPrice > 1000 && goldPrice < 10000) {
        cachedLiveRates.XAUUSD = Number(goldPrice.toFixed(2));
      }
    }
  } catch {
    // Silently continue
  }

  lastRateFetchTime = now;
  return cachedLiveRates;
}

// Instrument Metadata (Contract Size, Pip/Tick size, Decimals, Asset Class)
export const INSTRUMENTS_DATA = {
  EURUSD: { name: 'EUR/USD', category: 'majors', base: 'EUR', quote: 'USD', contractSize: 100000, pipSize: 0.0001, typicalSpread: 0.8 },
  GBPUSD: { name: 'GBP/USD', category: 'majors', base: 'GBP', quote: 'USD', contractSize: 100000, pipSize: 0.0001, typicalSpread: 1.0 },
  USDJPY: { name: 'USD/JPY', category: 'majors', base: 'USD', quote: 'JPY', contractSize: 100000, pipSize: 0.01, typicalSpread: 0.9 },
  USDCHF: { name: 'USD/CHF', category: 'majors', base: 'USD', quote: 'CHF', contractSize: 100000, pipSize: 0.0001, typicalSpread: 1.2 },
  AUDUSD: { name: 'AUD/USD', category: 'majors', base: 'AUD', quote: 'USD', contractSize: 100000, pipSize: 0.0001, typicalSpread: 1.1 },
  USDCAD: { name: 'USD/CAD', category: 'majors', base: 'USD', quote: 'CAD', contractSize: 100000, pipSize: 0.0001, typicalSpread: 1.3 },
  NZDUSD: { name: 'NZD/USD', category: 'majors', base: 'NZD', quote: 'USD', contractSize: 100000, pipSize: 0.0001, typicalSpread: 1.4 },

  EURGBP: { name: 'EUR/GBP', category: 'crosses', base: 'EUR', quote: 'GBP', contractSize: 100000, pipSize: 0.0001, typicalSpread: 1.2 },
  EURJPY: { name: 'EUR/JPY', category: 'crosses', base: 'EUR', quote: 'JPY', contractSize: 100000, pipSize: 0.01, typicalSpread: 1.4 },
  GBPJPY: { name: 'GBP/JPY', category: 'crosses', base: 'GBP', quote: 'JPY', contractSize: 100000, pipSize: 0.01, typicalSpread: 1.8 },
  AUDJPY: { name: 'AUD/JPY', category: 'crosses', base: 'AUD', quote: 'JPY', contractSize: 100000, pipSize: 0.01, typicalSpread: 1.5 },
  EURAUD: { name: 'EUR/AUD', category: 'crosses', base: 'EUR', quote: 'AUD', contractSize: 100000, pipSize: 0.0001, typicalSpread: 1.6 },
  GBPCAD: { name: 'GBP/CAD', category: 'crosses', base: 'GBP', quote: 'CAD', contractSize: 100000, pipSize: 0.0001, typicalSpread: 2.0 },
  NZDJPY: { name: 'NZD/JPY', category: 'crosses', base: 'NZD', quote: 'JPY', contractSize: 100000, pipSize: 0.01, typicalSpread: 1.9 },
  AUDNZD: { name: 'AUD/NZD', category: 'crosses', base: 'AUD', quote: 'NZD', contractSize: 100000, pipSize: 0.0001, typicalSpread: 1.8 },
  CADJPY: { name: 'CAD/JPY', category: 'crosses', base: 'CAD', quote: 'JPY', contractSize: 100000, pipSize: 0.01, typicalSpread: 1.6 },
  CHFJPY: { name: 'CHF/JPY', category: 'crosses', base: 'CHF', quote: 'JPY', contractSize: 100000, pipSize: 0.01, typicalSpread: 1.9 },

  USDINR: { name: 'USD/INR', category: 'inr', base: 'USD', quote: 'INR', contractSize: 100000, pipSize: 0.0025, typicalSpread: 1.5 },
  EURINR: { name: 'EUR/INR', category: 'inr', base: 'EUR', quote: 'INR', contractSize: 100000, pipSize: 0.0025, typicalSpread: 2.2 },
  GBPINR: { name: 'GBP/INR', category: 'inr', base: 'GBP', quote: 'INR', contractSize: 100000, pipSize: 0.0025, typicalSpread: 2.8 },
  JPYINR: { name: 'JPY/INR', category: 'inr', base: 'JPY', quote: 'INR', contractSize: 100000, pipSize: 0.0025, typicalSpread: 2.0 },

  XAUUSD: { name: 'Gold (XAU/USD)', category: 'metals', base: 'XAU', quote: 'USD', contractSize: 100, pipSize: 0.01, typicalSpread: 1.5 },
  XAGUSD: { name: 'Silver (XAG/USD)', category: 'metals', base: 'XAG', quote: 'USD', contractSize: 5000, pipSize: 0.001, typicalSpread: 2.0 },
  USOIL: { name: 'WTI Crude Oil', category: 'commodities', base: 'OIL', quote: 'USD', contractSize: 1000, pipSize: 0.01, typicalSpread: 2.5 },

  BTCUSD: { name: 'Bitcoin (BTC/USD)', category: 'crypto', base: 'BTC', quote: 'USD', contractSize: 1, pipSize: 1.0, typicalSpread: 12.0 },
  ETHUSD: { name: 'Ethereum (ETH/USD)', category: 'crypto', base: 'ETH', quote: 'USD', contractSize: 1, pipSize: 0.1, typicalSpread: 2.5 },
};

// Supported Account Currencies and exchange rate to USD
export const ACCOUNT_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', rateToUSD: 1.0 },
  INR: { symbol: '₹', name: 'Indian Rupee', rateToUSD: 1 / 83.52 },
  EUR: { symbol: '€', name: 'Euro', rateToUSD: 1.0865 },
  GBP: { symbol: '£', name: 'British Pound', rateToUSD: 1.2890 },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', rateToUSD: 1 / 3.6725 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', rateToUSD: 0.6650 },
  JPY: { symbol: '¥', name: 'Japanese Yen', rateToUSD: 1 / 154.80 },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', rateToUSD: 1 / 1.3680 },
  CHF: { symbol: 'Fr', name: 'Swiss Franc', rateToUSD: 1 / 0.8920 },
};

/**
 * Helper to compute 1 pip value in account currency for 1 standard lot
 */
export const calculatePipValuePerStandardLot = (pairKey, accountCurrency = 'USD', customPrice = null) => {
  const info = INSTRUMENTS_DATA[pairKey] || INSTRUMENTS_DATA.EURUSD;
  const currentPrice = customPrice || DEFAULT_MARKET_RATES[pairKey] || 1.0;
  const { quote, contractSize, pipSize } = info;

  // 1 pip value in quote currency = contractSize * pipSize
  const pipValueInQuote = contractSize * pipSize;

  let pipValueInUSD = pipValueInQuote;

  if (quote === 'USD') {
    pipValueInUSD = pipValueInQuote;
  } else if (info.base === 'USD') {
    // Quote is JPY, CAD, CHF, INR, etc. and base is USD
    pipValueInUSD = pipValueInQuote / currentPrice;
  } else {
    // Cross pair: e.g. EUR/GBP (quote is GBP) -> convert GBP to USD
    const quoteUSDKey = `${quote}USD`;
    const usdQuoteKey = `USD${quote}`;
    if (DEFAULT_MARKET_RATES[quoteUSDKey]) {
      pipValueInUSD = pipValueInQuote * DEFAULT_MARKET_RATES[quoteUSDKey];
    } else if (DEFAULT_MARKET_RATES[usdQuoteKey]) {
      pipValueInUSD = pipValueInQuote / DEFAULT_MARKET_RATES[usdQuoteKey];
    }
  }

  // Convert USD pip value to the target Account Currency
  const accInfo = ACCOUNT_CURRENCIES[accountCurrency] || ACCOUNT_CURRENCIES.USD;
  const pipValueInAccount = pipValueInUSD / accInfo.rateToUSD;

  return {
    pipValueInAccount: Number(pipValueInAccount.toFixed(4)),
    pipValueInUSD: Number(pipValueInUSD.toFixed(4)),
    currencySymbol: accInfo.symbol,
    pipSize,
    contractSize,
    currentPrice,
  };
};

/**
 * @desc    Get live benchmark rates, pairs metadata, and currencies
 * @route   GET /api/v1/calculator/rates
 * @access  Public
 */
export const getCalculatorRates = asyncHandler(async (req, res) => {
  const currentRates = await refreshLiveRatesIfStale();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        rates: currentRates,
        instruments: INSTRUMENTS_DATA,
        accountCurrencies: ACCOUNT_CURRENCIES,
        timestamp: new Date().toISOString(),
      },
      'Calculator market rates retrieved successfully'
    )
  );
});

/**
 * @desc    Calculate position / lot size based on balance, risk, and stop loss
 * @route   POST /api/v1/calculator/lot-size
 * @access  Public
 */
export const calculateLotSize = asyncHandler(async (req, res) => {
  const {
    pair = 'EURUSD',
    accountCurrency = 'USD',
    balance = 10000,
    riskPercent = 1,
    riskAmount: customRiskAmount = null,
    stopLossPips = 20,
    currentPrice = null,
  } = req.body;

  const numBalance = Math.max(1, parseFloat(balance) || 10000);
  const numStopLoss = Math.max(0.1, parseFloat(stopLossPips) || 20);

  // Determine cash risk
  let riskCash = 0;
  let finalRiskPercent = 0;

  if (customRiskAmount && parseFloat(customRiskAmount) > 0) {
    riskCash = parseFloat(customRiskAmount);
    finalRiskPercent = (riskCash / numBalance) * 100;
  } else {
    finalRiskPercent = Math.max(0.01, parseFloat(riskPercent) || 1);
    riskCash = (numBalance * finalRiskPercent) / 100;
  }

  const cleanPair = String(pair).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const pairInfo = INSTRUMENTS_DATA[cleanPair] || INSTRUMENTS_DATA.EURUSD;
  const { pipValueInAccount, currentPrice: priceUsed } = calculatePipValuePerStandardLot(
    cleanPair,
    accountCurrency,
    currentPrice ? parseFloat(currentPrice) : null
  );

  // Standard Lot Calculation: Lot Size = Cash at Risk / (Stop Loss in Pips * Pip Value per 1 Standard Lot)
  const exactLots = riskCash / (numStopLoss * pipValueInAccount);
  const standardLots = Number(Math.max(0.01, exactLots).toFixed(2));
  const miniLots = Number((standardLots * 10).toFixed(2));
  const microLots = Number((standardLots * 100).toFixed(2));
  const units = Math.round(standardLots * pairInfo.contractSize);
  const totalPipValueForPosition = Number((standardLots * pipValueInAccount).toFixed(2));
  const notionalValue = Math.round(units * priceUsed);

  // Risk Level Classification
  let riskClassification = 'conservative';
  let riskBadgeColor = '#10b981'; // Green
  if (finalRiskPercent > 3.0) {
    riskClassification = 'aggressive';
    riskBadgeColor = '#ef4444'; // Red
  } else if (finalRiskPercent >= 1.5) {
    riskClassification = 'moderate';
    riskBadgeColor = '#f59e0b'; // Amber
  }

  // Margin requirements at popular broker leverages
  const marginAtLeverage = {
    '1:100': Number((notionalValue / 100).toFixed(2)),
    '1:200': Number((notionalValue / 200).toFixed(2)),
    '1:500': Number((notionalValue / 500).toFixed(2)),
    '1:1000': Number((notionalValue / 1000).toFixed(2)),
  };

  const accInfo = ACCOUNT_CURRENCIES[accountCurrency] || ACCOUNT_CURRENCIES.USD;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        pair: cleanPair,
        pairName: pairInfo.name,
        accountCurrency,
        currencySymbol: accInfo.symbol,
        balance: numBalance,
        riskPercent: Number(finalRiskPercent.toFixed(2)),
        riskAmountCash: Number(riskCash.toFixed(2)),
        stopLossPips: numStopLoss,
        standardLots,
        miniLots,
        microLots,
        units,
        pipValuePerStandardLot: pipValueInAccount,
        totalPositionPipValue: totalPipValueForPosition,
        notionalValue,
        currentPrice: priceUsed,
        riskClassification,
        riskBadgeColor,
        marginAtLeverage,
      },
      'Lot size calculated successfully'
    )
  );
});

/**
 * @desc    Calculate spread cost & broker fee impact
 * @route   POST /api/v1/calculator/spread-cost
 * @access  Public
 */
export const calculateSpreadCost = asyncHandler(async (req, res) => {
  const {
    pair = 'EURUSD',
    accountCurrency = 'USD',
    lots = 1.0,
    spreadPips = null,
    commissionPerLot = 0.0, // e.g. $3.50 per lot
  } = req.body;

  const numLots = Math.max(0.01, parseFloat(lots) || 1.0);
  const cleanPair = String(pair).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const pairInfo = INSTRUMENTS_DATA[cleanPair] || INSTRUMENTS_DATA.EURUSD;
  const numSpreadPips = spreadPips !== null && spreadPips !== undefined
    ? Math.max(0.0, parseFloat(spreadPips))
    : pairInfo.typicalSpread;

  const numCommission = Math.max(0.0, parseFloat(commissionPerLot) || 0.0);

  const { pipValueInAccount, currentPrice } = calculatePipValuePerStandardLot(
    cleanPair,
    accountCurrency
  );

  // Spread Cost = Spread in Pips * Pip Value (Account Currency) * Lots
  const spreadCost = Number((numSpreadPips * pipValueInAccount * numLots).toFixed(2));
  const commissionCost = Number((numCommission * numLots).toFixed(2));
  const totalTradeCost = Number((spreadCost + commissionCost).toFixed(2));
  const costPerPip = Number((pipValueInAccount * numLots).toFixed(2));

  // Rating of broker spread condition
  let spreadRating = 'competitive';
  let ratingLabel = 'Competitive';
  if (numSpreadPips <= 0.6) {
    spreadRating = 'raw_ecn';
    ratingLabel = 'Ultra-Tight ECN';
  } else if (numSpreadPips > 1.6) {
    spreadRating = 'high';
    ratingLabel = 'Standard / High Spread';
  }

  // Potential broker savings vs 1.8 pip typical retail spread
  const baselineCost = 1.8 * pipValueInAccount * numLots;
  const potentialSavings = Math.max(0, Number((baselineCost - totalTradeCost).toFixed(2)));

  const accInfo = ACCOUNT_CURRENCIES[accountCurrency] || ACCOUNT_CURRENCIES.USD;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        pair: cleanPair,
        pairName: pairInfo.name,
        accountCurrency,
        currencySymbol: accInfo.symbol,
        lots: numLots,
        spreadPips: numSpreadPips,
        commissionPerLot: numCommission,
        spreadCost,
        commissionCost,
        totalTradeCost,
        costPerPip,
        spreadRating,
        ratingLabel,
        potentialSavings,
        currentPrice,
      },
      'Spread cost calculated successfully'
    )
  );
});

/**
 * @desc    Calculate pip value across lot sizes
 * @route   POST /api/v1/calculator/pip-value
 * @access  Public
 */
export const calculatePipValue = asyncHandler(async (req, res) => {
  const { pair = 'EURUSD', accountCurrency = 'USD', lots = 1.0 } = req.body;
  const cleanPair = String(pair).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const numLots = Math.max(0.01, parseFloat(lots) || 1.0);

  const { pipValueInAccount, currentPrice } = calculatePipValuePerStandardLot(
    cleanPair,
    accountCurrency
  );

  const accInfo = ACCOUNT_CURRENCIES[accountCurrency] || ACCOUNT_CURRENCIES.USD;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        pair: cleanPair,
        accountCurrency,
        currencySymbol: accInfo.symbol,
        currentPrice,
        standardLotPipValue: Number(pipValueInAccount.toFixed(2)),
        miniLotPipValue: Number((pipValueInAccount * 0.1).toFixed(3)),
        microLotPipValue: Number((pipValueInAccount * 0.01).toFixed(4)),
        customLotPipValue: Number((pipValueInAccount * numLots).toFixed(2)),
        lots: numLots,
      },
      'Pip value calculated successfully'
    )
  );
});
