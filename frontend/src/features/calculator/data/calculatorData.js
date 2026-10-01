// Instruments and Currency Data for Forex Lot Size & Spread Calculator

export const POPULAR_INSTRUMENTS = [
  // Forex Majors
  { id: 'EURUSD', symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'Forex Majors', base: 'EUR', quote: 'USD', pipSize: 0.0001, contractSize: 100000, defaultRate: 1.0865, typicalSpread: 0.8, flag: '🇪🇺/🇺🇸' },
  { id: 'GBPUSD', symbol: 'GBP/USD', name: 'British Pound / US Dollar', category: 'Forex Majors', base: 'GBP', quote: 'USD', pipSize: 0.0001, contractSize: 100000, defaultRate: 1.2890, typicalSpread: 1.0, flag: '🇬🇧/🇺🇸' },
  { id: 'USDJPY', symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'Forex Majors', base: 'USD', quote: 'JPY', pipSize: 0.01, contractSize: 100000, defaultRate: 154.80, typicalSpread: 0.9, flag: '🇺🇸/🇯🇵' },
  { id: 'USDCHF', symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', category: 'Forex Majors', base: 'USD', quote: 'CHF', pipSize: 0.0001, contractSize: 100000, defaultRate: 0.8920, typicalSpread: 1.2, flag: '🇺🇸/🇨🇭' },
  { id: 'AUDUSD', symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', category: 'Forex Majors', base: 'AUD', quote: 'USD', pipSize: 0.0001, contractSize: 100000, defaultRate: 0.6650, typicalSpread: 1.1, flag: '🇦🇺/🇺🇸' },
  { id: 'USDCAD', symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', category: 'Forex Majors', base: 'USD', quote: 'CAD', pipSize: 0.0001, contractSize: 100000, defaultRate: 1.3680, typicalSpread: 1.3, flag: '🇺🇸/🇨🇦' },
  { id: 'NZDUSD', symbol: 'NZD/USD', name: 'NZ Dollar / US Dollar', category: 'Forex Majors', base: 'NZD', quote: 'USD', pipSize: 0.0001, contractSize: 100000, defaultRate: 0.6120, typicalSpread: 1.4, flag: '🇳🇿/🇺🇸' },

  // Indian Rupee (INR) Pairs
  { id: 'USDINR', symbol: 'USD/INR', name: 'US Dollar / Indian Rupee', category: 'INR Pairs', base: 'USD', quote: 'INR', pipSize: 0.0025, contractSize: 100000, defaultRate: 83.52, typicalSpread: 1.5, flag: '🇺🇸/🇮🇳' },
  { id: 'EURINR', symbol: 'EUR/INR', name: 'Euro / Indian Rupee', category: 'INR Pairs', base: 'EUR', quote: 'INR', pipSize: 0.0025, contractSize: 100000, defaultRate: 90.75, typicalSpread: 2.2, flag: '🇪🇺/🇮🇳' },
  { id: 'GBPINR', symbol: 'GBP/INR', name: 'British Pound / Indian Rupee', category: 'INR Pairs', base: 'GBP', quote: 'INR', pipSize: 0.0025, contractSize: 100000, defaultRate: 107.65, typicalSpread: 2.8, flag: '🇬🇧/🇮🇳' },
  { id: 'JPYINR', symbol: 'JPY/INR', name: 'Japanese Yen / Indian Rupee', category: 'INR Pairs', base: 'JPY', quote: 'INR', pipSize: 0.0025, contractSize: 100000, defaultRate: 0.5395, typicalSpread: 2.0, flag: '🇯🇵/🇮🇳' },

  // Forex Crosses
  { id: 'EURGBP', symbol: 'EUR/GBP', name: 'Euro / British Pound', category: 'Forex Crosses', base: 'EUR', quote: 'GBP', pipSize: 0.0001, contractSize: 100000, defaultRate: 0.8430, typicalSpread: 1.2, flag: '🇪🇺/🇬🇧' },
  { id: 'EURJPY', symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', category: 'Forex Crosses', base: 'EUR', quote: 'JPY', pipSize: 0.01, contractSize: 100000, defaultRate: 168.20, typicalSpread: 1.4, flag: '🇪🇺/🇯🇵' },
  { id: 'GBPJPY', symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', category: 'Forex Crosses', base: 'GBP', quote: 'JPY', pipSize: 0.01, contractSize: 100000, defaultRate: 199.50, typicalSpread: 1.8, flag: '🇬🇧/🇯🇵' },
  { id: 'AUDJPY', symbol: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', category: 'Forex Crosses', base: 'AUD', quote: 'JPY', pipSize: 0.01, contractSize: 100000, defaultRate: 102.90, typicalSpread: 1.5, flag: '🇦🇺/🇯🇵' },

  // Commodities & Metals
  { id: 'XAUUSD', symbol: 'XAU/USD (Gold)', name: 'Spot Gold / US Dollar', category: 'Metals & Commodities', base: 'XAU', quote: 'USD', pipSize: 0.01, contractSize: 100, defaultRate: 2658.50, typicalSpread: 1.5, flag: '🥇/🇺🇸' },
  { id: 'XAGUSD', symbol: 'XAG/USD (Silver)', name: 'Spot Silver / US Dollar', category: 'Metals & Commodities', base: 'XAG', quote: 'USD', pipSize: 0.001, contractSize: 5000, defaultRate: 31.45, typicalSpread: 2.0, flag: '🥈/🇺🇸' },
  { id: 'USOIL', symbol: 'USOIL (Crude)', name: 'WTI Light Sweet Crude Oil', category: 'Metals & Commodities', base: 'OIL', quote: 'USD', pipSize: 0.01, contractSize: 1000, defaultRate: 74.20, typicalSpread: 2.5, flag: '🛢️/🇺🇸' },

  // Crypto
  { id: 'BTCUSD', symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', category: 'Crypto', base: 'BTC', quote: 'USD', pipSize: 1.0, contractSize: 1, defaultRate: 67800.00, typicalSpread: 12.0, flag: '₿/🇺🇸' },
  { id: 'ETHUSD', symbol: 'ETH/USD', name: 'Ethereum / US Dollar', category: 'Crypto', base: 'ETH', quote: 'USD', pipSize: 0.1, contractSize: 1, defaultRate: 3520.00, typicalSpread: 2.5, flag: 'Ξ/🇺🇸' },
];

export const ACCOUNT_CURRENCIES_LIST = [
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', rateToUSD: 1.0 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', rateToUSD: 1 / 83.52 },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', rateToUSD: 1.0865 },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', rateToUSD: 1.2890 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham (AED)', rateToUSD: 1 / 3.6725 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)', rateToUSD: 0.6650 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)', rateToUSD: 1 / 154.80 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (CAD)', rateToUSD: 1 / 1.3680 },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc (CHF)', rateToUSD: 1 / 0.8920 },
];

export const RISK_PERCENT_PRESETS = [0.5, 1.0, 2.0, 3.0, 5.0];

export const TOP_BROKER_SPREAD_BENCHMARKS = [
  { broker: 'Exness', account: 'Raw Spread', eurusdSpread: 0.0, commission: '$3.50/lot', rating: 'Ultra-Low ECN' },
  { broker: 'IC Markets', account: 'Raw ECN', eurusdSpread: 0.1, commission: '$3.50/lot', rating: 'Ultra-Low ECN' },
  { broker: 'Pepperstone', account: 'Razor', eurusdSpread: 0.1, commission: '$3.50/lot', rating: 'Ultra-Low ECN' },
  { broker: 'XM', account: 'Ultra Low Standard', eurusdSpread: 0.6, commission: '$0 (Zero)', rating: 'Zero Commission' },
  { broker: 'OctaFX', account: 'Standard', eurusdSpread: 0.8, commission: '$0 (Zero)', rating: 'Standard' },
];
