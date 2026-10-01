import apiClient from '../../auth/services/api.client.js';
import {
  POPULAR_INSTRUMENTS,
  ACCOUNT_CURRENCIES_LIST,
} from '../data/calculatorData.js';

// Fast lookup maps
const instrumentsMap = new Map(POPULAR_INSTRUMENTS.map((i) => [i.id, i]));
const currencyMap = new Map(ACCOUNT_CURRENCIES_LIST.map((c) => [c.code, c]));

/**
 * 0ms instant client-side calculation engine for ultra-smooth UI interactions
 */
export const clientCalculateLotSize = ({
  pair = 'EURUSD',
  accountCurrency = 'USD',
  balance = 10000,
  riskPercent = 1,
  riskAmount = null,
  stopLossPips = 20,
  currentPrice = null,
}) => {
  const numBalance = Math.max(1, parseFloat(balance) || 10000);
  const numStopLoss = Math.max(0.1, parseFloat(stopLossPips) || 20);

  let cashRisk = 0;
  let finalRiskPercent = 0;

  if (riskAmount && parseFloat(riskAmount) > 0) {
    cashRisk = parseFloat(riskAmount);
    finalRiskPercent = (cashRisk / numBalance) * 100;
  } else {
    finalRiskPercent = Math.max(0.01, parseFloat(riskPercent) || 1);
    cashRisk = (numBalance * finalRiskPercent) / 100;
  }

  const cleanPair = String(pair).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const info = instrumentsMap.get(cleanPair) || instrumentsMap.get('EURUSD');
  const price = currentPrice ? parseFloat(currentPrice) : info.defaultRate;

  // Pip value in quote currency = contractSize * pipSize
  const pipValueInQuote = info.contractSize * info.pipSize;
  let pipValueInUSD = pipValueInQuote;

  if (info.quote === 'USD') {
    pipValueInUSD = pipValueInQuote;
  } else if (info.base === 'USD') {
    pipValueInUSD = pipValueInQuote / price;
  } else {
    // Cross
    const quoteUSD = instrumentsMap.get(`${info.quote}USD`);
    const usdQuote = instrumentsMap.get(`USD${info.quote}`);
    if (quoteUSD) pipValueInUSD = pipValueInQuote * quoteUSD.defaultRate;
    else if (usdQuote) pipValueInUSD = pipValueInQuote / usdQuote.defaultRate;
  }

  const accInfo = currencyMap.get(accountCurrency) || currencyMap.get('USD');
  const pipValueInAccount = pipValueInUSD / accInfo.rateToUSD;

  // Standard Lot Formula: Lot = Cash Risk / (Stop Loss in Pips * Pip Value per 1 Standard Lot)
  const exactLots = cashRisk / (numStopLoss * pipValueInAccount);
  const standardLots = Number(Math.max(0.01, exactLots).toFixed(2));
  const miniLots = Number((standardLots * 10).toFixed(2));
  const microLots = Number((standardLots * 100).toFixed(2));
  const units = Math.round(standardLots * info.contractSize);
  const totalPositionPipValue = Number((standardLots * pipValueInAccount).toFixed(2));
  const notionalValue = Math.round(units * price);

  let riskClassification = 'conservative';
  let riskBadgeColor = '#10b981';
  if (finalRiskPercent > 3.0) {
    riskClassification = 'aggressive';
    riskBadgeColor = '#ef4444';
  } else if (finalRiskPercent >= 1.5) {
    riskClassification = 'moderate';
    riskBadgeColor = '#f59e0b';
  }

  return {
    pair: cleanPair,
    pairName: info.name,
    accountCurrency,
    currencySymbol: accInfo.symbol,
    balance: numBalance,
    riskPercent: Number(finalRiskPercent.toFixed(2)),
    riskAmountCash: Number(cashRisk.toFixed(2)),
    stopLossPips: numStopLoss,
    standardLots,
    miniLots,
    microLots,
    units,
    pipValuePerStandardLot: Number(pipValueInAccount.toFixed(3)),
    totalPositionPipValue,
    notionalValue,
    currentPrice: price,
    riskClassification,
    riskBadgeColor,
    marginAtLeverage: {
      '1:100': Number((notionalValue / 100).toFixed(2)),
      '1:200': Number((notionalValue / 200).toFixed(2)),
      '1:500': Number((notionalValue / 500).toFixed(2)),
      '1:1000': Number((notionalValue / 1000).toFixed(2)),
    },
  };
};

export const clientCalculateSpreadCost = ({
  pair = 'EURUSD',
  accountCurrency = 'USD',
  lots = 1.0,
  spreadPips = null,
  commissionPerLot = 0.0,
}) => {
  const numLots = Math.max(0.01, parseFloat(lots) || 1.0);
  const cleanPair = String(pair).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const info = instrumentsMap.get(cleanPair) || instrumentsMap.get('EURUSD');
  const numSpreadPips = spreadPips !== null && spreadPips !== undefined
    ? Math.max(0.0, parseFloat(spreadPips))
    : info.typicalSpread;

  const numCommission = Math.max(0.0, parseFloat(commissionPerLot) || 0.0);
  const price = info.defaultRate;

  const pipValueInQuote = info.contractSize * info.pipSize;
  let pipValueInUSD = pipValueInQuote;

  if (info.quote === 'USD') {
    pipValueInUSD = pipValueInQuote;
  } else if (info.base === 'USD') {
    pipValueInUSD = pipValueInQuote / price;
  } else {
    const quoteUSD = instrumentsMap.get(`${info.quote}USD`);
    const usdQuote = instrumentsMap.get(`USD${info.quote}`);
    if (quoteUSD) pipValueInUSD = pipValueInQuote * quoteUSD.defaultRate;
    else if (usdQuote) pipValueInUSD = pipValueInQuote / usdQuote.defaultRate;
  }

  const accInfo = currencyMap.get(accountCurrency) || currencyMap.get('USD');
  const pipValueInAccount = pipValueInUSD / accInfo.rateToUSD;

  const spreadCost = Number((numSpreadPips * pipValueInAccount * numLots).toFixed(2));
  const commissionCost = Number((numCommission * numLots).toFixed(2));
  const totalTradeCost = Number((spreadCost + commissionCost).toFixed(2));
  const costPerPip = Number((pipValueInAccount * numLots).toFixed(2));

  let spreadRating = 'competitive';
  let ratingLabel = 'Competitive Spread';
  if (numSpreadPips <= 0.6) {
    spreadRating = 'raw_ecn';
    ratingLabel = 'Ultra-Tight Raw ECN';
  } else if (numSpreadPips > 1.6) {
    spreadRating = 'high';
    ratingLabel = 'Standard / High Spread';
  }

  const baselineCost = 1.8 * pipValueInAccount * numLots;
  const potentialSavings = Math.max(0, Number((baselineCost - totalTradeCost).toFixed(2)));

  return {
    pair: cleanPair,
    pairName: info.name,
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
    currentPrice: price,
  };
};

export const calculatorService = {
  async fetchLiveRates() {
    try {
      const res = await apiClient.get('/calculator/rates');
      if (res?.data?.data) {
        return res.data.data;
      }
    } catch (e) {
      console.warn('Backend calculator rates endpoint unreachable, trying public live ticker fallback:', e?.message);
    }

    // Direct browser fallback for Realtime Gold (PAXG 1:1 London Gold Spot)
    try {
      const goldRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT', {
        signal: AbortSignal.timeout(3500),
      });
      if (goldRes.ok) {
        const gData = await goldRes.json();
        const price = parseFloat(gData.price);
        if (price > 1000 && price < 10000) {
          return {
            rates: { XAUUSD: Number(price.toFixed(2)) },
          };
        }
      }
    } catch {
      // Ignore
    }

    return null;
  },

  async calculateLotSize(params) {
    try {
      const res = await apiClient.post('/calculator/lot-size', params);
      if (res?.data?.data) {
        return res.data.data;
      }
    } catch {
      // Instant client-side fallback
    }
    return clientCalculateLotSize(params);
  },

  async calculateSpreadCost(params) {
    try {
      const res = await apiClient.post('/calculator/spread-cost', params);
      if (res?.data?.data) {
        return res.data.data;
      }
    } catch {
      // Instant client-side fallback
    }
    return clientCalculateSpreadCost(params);
  },
};

export default calculatorService;
