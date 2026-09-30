import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calculator,
  Percent,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Scale,
  Sparkles,
  Info,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import {
  POPULAR_INSTRUMENTS,
  ACCOUNT_CURRENCIES_LIST,
  RISK_PERCENT_PRESETS,
  TOP_BROKER_SPREAD_BENCHMARKS,
} from '../features/calculator/data/calculatorData.js';
import calculatorService, {
  clientCalculateLotSize,
  clientCalculateSpreadCost,
} from '../features/calculator/services/calculator.service.js';
import { useToast } from '../features/shared/components/toast/ToastContext.jsx';
import Footer from '../features/shared/components/Footer.jsx';
import './CalculatorPage.css';

export const CalculatorPage = ({ theme = 'dark' }) => {
  const { showToast } = useToast();

  // Active Tab: 'lot-size' | 'spread-cost' | 'pip-value' | 'profit-loss'
  const [activeTab, setActiveTab] = useState('lot-size');

  // Shared Parameters
  const [selectedPair, setSelectedPair] = useState('EURUSD');
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [balance, setBalance] = useState(10000);

  // Lot Size Specific States
  const [riskMode, setRiskMode] = useState('percent'); // 'percent' | 'cash'
  const [riskPercent, setRiskPercent] = useState(2.0);
  const [riskCashAmount, setRiskCashAmount] = useState(200);
  const [stopLossMode, setStopLossMode] = useState('pips'); // 'pips' | 'price'
  const [stopLossPips, setStopLossPips] = useState(25);
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [tradeDirection, setTradeDirection] = useState('buy'); // 'buy' | 'sell'

  // Spread Cost Specific States
  const [tradeLots, setTradeLots] = useState(1.0);
  const [customSpread, setCustomSpread] = useState(0.8);
  const [commissionPerLot, setCommissionPerLot] = useState(3.5);

  // Profit/Loss Specific States
  const [pnlLots, setPnlLots] = useState(1.0);
  const [pnlDirection, setPnlDirection] = useState('buy');
  const [pnlEntryPrice, setPnlEntryPrice] = useState('');
  const [pnlExitPrice, setPnlExitPrice] = useState('');

  // UI States
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [instrumentCategory, setInstrumentCategory] = useState('All');
  const [liveRates, setLiveRates] = useState(null);

  // Current instrument metadata
  const currentInstrument = useMemo(() => {
    return POPULAR_INSTRUMENTS.find((i) => i.id === selectedPair) || POPULAR_INSTRUMENTS[0];
  }, [selectedPair]);

  // Current currency metadata
  const currentCurrency = useMemo(() => {
    return ACCOUNT_CURRENCIES_LIST.find((c) => c.code === accountCurrency) || ACCOUNT_CURRENCIES_LIST[0];
  }, [accountCurrency]);

  // Fetch live market benchmark rates on load
  useEffect(() => {
    const loadRates = async () => {
      const data = await calculatorService.fetchLiveRates();
      if (data?.rates) {
        setLiveRates(data.rates);
      }
    };
    loadRates();
  }, []);

  // Update default prices when pair changes
  useEffect(() => {
    if (currentInstrument) {
      setCustomSpread(currentInstrument.typicalSpread);
      if (!entryPrice || entryPrice === '') {
        setEntryPrice(currentInstrument.defaultRate);
      }
      if (!pnlEntryPrice || pnlEntryPrice === '') {
        setPnlEntryPrice(currentInstrument.defaultRate);
      }
      if (!pnlExitPrice || pnlExitPrice === '') {
        const move = currentInstrument.pipSize * 30;
        setPnlExitPrice(Number((currentInstrument.defaultRate + move).toFixed(5)));
      }
    }
  }, [currentInstrument]);

  // Calculate pips from Entry Price & Stop Loss Price
  useEffect(() => {
    if (stopLossMode === 'price' && entryPrice && stopLossPrice) {
      const e = parseFloat(entryPrice);
      const sl = parseFloat(stopLossPrice);
      if (!isNaN(e) && !isNaN(sl) && currentInstrument) {
        const diff = Math.abs(e - sl);
        const pips = Number((diff / currentInstrument.pipSize).toFixed(1));
        if (pips > 0) {
          setStopLossPips(pips);
        }
      }
    }
  }, [stopLossMode, entryPrice, stopLossPrice, currentInstrument]);

  // Instant Position / Lot Size Calculation
  const lotSizeResult = useMemo(() => {
    return clientCalculateLotSize({
      pair: selectedPair,
      accountCurrency,
      balance,
      riskPercent: riskMode === 'percent' ? riskPercent : null,
      riskAmount: riskMode === 'cash' ? riskCashAmount : null,
      stopLossPips,
      currentPrice: currentInstrument.defaultRate,
    });
  }, [selectedPair, accountCurrency, balance, riskMode, riskPercent, riskCashAmount, stopLossPips, currentInstrument]);

  // Instant Spread Cost Calculation
  const spreadResult = useMemo(() => {
    return clientCalculateSpreadCost({
      pair: selectedPair,
      accountCurrency,
      lots: tradeLots,
      spreadPips: customSpread,
      commissionPerLot,
    });
  }, [selectedPair, accountCurrency, tradeLots, customSpread, commissionPerLot]);

  // Instant Pip Value Calculation across lot sizes
  const pipValuesResult = useMemo(() => {
    const basePipVal = lotSizeResult.pipValuePerStandardLot;
    return {
      standard: Number(basePipVal.toFixed(2)),
      mini: Number((basePipVal * 0.1).toFixed(2)),
      micro: Number((basePipVal * 0.01).toFixed(3)),
      nano: Number((basePipVal * 0.001).toFixed(4)),
    };
  }, [lotSizeResult]);

  // Instant Profit / Loss Calculation
  const pnlResult = useMemo(() => {
    const e = parseFloat(pnlEntryPrice) || currentInstrument.defaultRate;
    const x = parseFloat(pnlExitPrice) || currentInstrument.defaultRate;
    const isBuy = pnlDirection === 'buy';
    const priceDiff = isBuy ? x - e : e - x;
    const pipsGained = Number((priceDiff / currentInstrument.pipSize).toFixed(1));
    const cashPnL = Number((pipsGained * lotSizeResult.pipValuePerStandardLot * pnlLots).toFixed(2));
    const isProfit = cashPnL >= 0;
    const roi = balance > 0 ? Number(((cashPnL / balance) * 100).toFixed(2)) : 0;

    return {
      pipsGained,
      cashPnL,
      isProfit,
      roi,
    };
  }, [pnlEntryPrice, pnlExitPrice, pnlDirection, currentInstrument, lotSizeResult, pnlLots, balance]);

  // Copy Calculation Summary
  const handleCopySummary = () => {
    let summaryText = '';
    if (activeTab === 'lot-size') {
      summaryText = `📊 TradeSafe Position Size Plan:
• Instrument: ${currentInstrument.symbol}
• Account Balance: ${currentCurrency.symbol}${Number(balance).toLocaleString()} (${accountCurrency})
• Risk: ${lotSizeResult.riskPercent}% (${currentCurrency.symbol}${lotSizeResult.riskAmountCash})
• Stop Loss: ${stopLossPips} pips
👉 Recommended Lot Size: ${lotSizeResult.standardLots} Standard Lots (${lotSizeResult.miniLots} Mini / ${lotSizeResult.microLots} Micro)
• Total Position Pip Value: ${currentCurrency.symbol}${lotSizeResult.totalPositionPipValue}/pip
• Notional Value: $${lotSizeResult.notionalValue.toLocaleString()}
Calculated on TradeSafeBrokers.com`;
    } else if (activeTab === 'spread-cost') {
      summaryText = `📊 TradeSafe Spread Cost Audit:
• Instrument: ${currentInstrument.symbol}
• Trade Size: ${tradeLots} Lots
• Spread: ${customSpread} pips
• Total Spread Cost: ${currentCurrency.symbol}${spreadResult.spreadCost}
• Commission: ${currentCurrency.symbol}${spreadResult.commissionCost}
👉 Total Cost per Round Turn: ${currentCurrency.symbol}${spreadResult.totalTradeCost}
Calculated on TradeSafeBrokers.com`;
    } else {
      summaryText = `📊 TradeSafe Profit/Loss Projection:
• Instrument: ${currentInstrument.symbol} (${pnlDirection.toUpperCase()})
• Size: ${pnlLots} Lots
• Gain/Loss: ${pnlResult.pipsGained} pips
👉 Net Cash Outcome: ${currentCurrency.symbol}${pnlResult.cashPnL} (${pnlResult.roi}% ROI)
Calculated on TradeSafeBrokers.com`;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      showToast('Calculation summary copied to clipboard!', 'success');
      setTimeout(() => setCopiedSummary(false), 2400);
    }
  };

  // Filtered Instruments List
  const filteredInstruments = useMemo(() => {
    if (instrumentCategory === 'All') return POPULAR_INSTRUMENTS;
    return POPULAR_INSTRUMENTS.filter((i) => i.category === instrumentCategory);
  }, [instrumentCategory]);

  return (
    <div className={`pipwise-calculator-page ${theme}`}>
      {/* ══════════════════════════════════════════════════════════ */}
      {/* 1. HERO HEADER                                           */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="calc-hero-container">
        <div className="calc-hero-badge">
          <Sparkles size={13} className="calc-badge-sparkle" />
          <span>Professional Risk Management Suite</span>
        </div>

        <h1 className="calc-hero-title">
          Forex Lot Size <span className="calc-accent-text">&amp; Spread Calculator</span>
        </h1>

        <p className="calc-hero-subtitle">
          Calculate exact position size in standard, mini, and micro lots, audit broker spread costs,
          and manage your risk with institutional mathematical precision.
        </p>

        {/* Tab Switcher */}
        <div className="calc-tabs-wrapper">
          <button
            type="button"
            className={`calc-tab-btn ${activeTab === 'lot-size' ? 'active' : ''}`}
            onClick={() => setActiveTab('lot-size')}
          >
            <Calculator size={15} />
            <span>Position / Lot Size</span>
          </button>

          <button
            type="button"
            className={`calc-tab-btn ${activeTab === 'spread-cost' ? 'active' : ''}`}
            onClick={() => setActiveTab('spread-cost')}
          >
            <Scale size={15} />
            <span>Spread &amp; Broker Fee</span>
          </button>

          <button
            type="button"
            className={`calc-tab-btn ${activeTab === 'pip-value' ? 'active' : ''}`}
            onClick={() => setActiveTab('pip-value')}
          >
            <Layers size={15} />
            <span>Pip Value Matrix</span>
          </button>

          <button
            type="button"
            className={`calc-tab-btn ${activeTab === 'profit-loss' ? 'active' : ''}`}
            onClick={() => setActiveTab('profit-loss')}
          >
            <TrendingUp size={15} />
            <span>Profit &amp; Loss</span>
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 2. MAIN INTERACTIVE CALCULATOR ENGINE                    */}
      {/* ══════════════════════════════════════════════════════════ */}
      <main className="calc-main-layout">
        <div className="calc-grid-container">
          {/* ──────────────────────────────────────────────────────── */}
          {/* LEFT COLUMN: INPUT PARAMETERS PANEL                     */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="calc-card calc-input-card">
            <div className="calc-card-header">
              <div className="calc-card-title-group">
                <h3>Trade Parameters</h3>
                <p>Customize instrument, risk tolerance, and account specs</p>
              </div>
              <button
                type="button"
                className="calc-reset-btn"
                onClick={() => {
                  setBalance(10000);
                  setRiskPercent(2.0);
                  setRiskCashAmount(200);
                  setStopLossPips(25);
                  setTradeLots(1.0);
                  showToast('Calculator parameters reset to standard', 'info');
                }}
                title="Reset to defaults"
              >
                <RefreshCw size={13} />
                <span>Reset</span>
              </button>
            </div>

            {/* Instrument Selection */}
            <div className="calc-field-group">
              <div className="calc-label-row">
                <label htmlFor="instrument-select">Currency Pair / Instrument</label>
                <span className="calc-live-price-pill" title="Live Benchmark Reference Quote">
                  1 {currentInstrument.base} = {currentInstrument.defaultRate} {currentInstrument.quote}
                </span>
              </div>

              <div className="calc-select-wrap">
                <select
                  id="instrument-select"
                  className="calc-select"
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                >
                  <optgroup label="Forex Majors">
                    {POPULAR_INSTRUMENTS.filter((i) => i.category === 'Forex Majors').map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.symbol} — {i.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Indian Rupee (INR) Pairs">
                    {POPULAR_INSTRUMENTS.filter((i) => i.category === 'INR Pairs').map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.symbol} — {i.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Forex Crosses">
                    {POPULAR_INSTRUMENTS.filter((i) => i.category === 'Forex Crosses').map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.symbol} — {i.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Metals & Commodities">
                    {POPULAR_INSTRUMENTS.filter((i) => i.category === 'Metals & Commodities').map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.symbol} — {i.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Crypto">
                    {POPULAR_INSTRUMENTS.filter((i) => i.category === 'Crypto').map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.symbol} — {i.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown size={15} className="select-chevron-icon" />
              </div>
            </div>

            {/* Account Currency & Balance */}
            <div className="calc-two-col-row">
              <div className="calc-field-group">
                <label htmlFor="account-currency-select">Account Currency</label>
                <div className="calc-select-wrap">
                  <select
                    id="account-currency-select"
                    className="calc-select"
                    value={accountCurrency}
                    onChange={(e) => setAccountCurrency(e.target.value)}
                  >
                    {ACCOUNT_CURRENCIES_LIST.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="select-chevron-icon" />
                </div>
              </div>

              <div className="calc-field-group">
                <label htmlFor="account-balance-input">Account Balance</label>
                <div className="calc-input-adornment">
                  <span className="input-currency-tag">{currentCurrency.symbol}</span>
                  <input
                    id="account-balance-input"
                    type="number"
                    min="1"
                    step="any"
                    value={balance}
                    onChange={(e) => setBalance(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="calc-input"
                    placeholder="10000"
                  />
                </div>
              </div>
            </div>

            {/* Quick Balance Presets */}
            <div className="calc-quick-pills-row">
              <span className="quick-pill-label">Quick Balance:</span>
              {[1000, 5000, 10000, 25000, 100000].map((presetVal) => (
                <button
                  key={presetVal}
                  type="button"
                  className={`calc-preset-pill ${balance === presetVal ? 'active' : ''}`}
                  onClick={() => setBalance(presetVal)}
                >
                  {currentCurrency.symbol}
                  {presetVal >= 1000 ? `${presetVal / 1000}k` : presetVal}
                </button>
              ))}
            </div>

            {/* ────────────────────────────────────────────────── */}
            {/* TAB SPECIFIC CONTROLS                              */}
            {/* ────────────────────────────────────────────────── */}
            {activeTab === 'lot-size' && (
              <>
                {/* Risk Mode Switcher (% vs Cash) */}
                <div className="calc-field-group">
                  <div className="calc-label-row">
                    <label>Risk Sizing Mode</label>
                    <div className="calc-sub-mode-toggle">
                      <button
                        type="button"
                        className={`sub-toggle-btn ${riskMode === 'percent' ? 'active' : ''}`}
                        onClick={() => setRiskMode('percent')}
                      >
                        <Percent size={12} /> Percentage (%)
                      </button>
                      <button
                        type="button"
                        className={`sub-toggle-btn ${riskMode === 'cash' ? 'active' : ''}`}
                        onClick={() => {
                          setRiskMode('cash');
                          setRiskCashAmount((balance * riskPercent) / 100);
                        }}
                      >
                        <DollarSign size={12} /> Cash Amount
                      </button>
                    </div>
                  </div>

                  {riskMode === 'percent' ? (
                    <div>
                      <div className="calc-input-adornment">
                        <input
                          type="number"
                          step="0.1"
                          min="0.05"
                          max="100"
                          value={riskPercent}
                          onChange={(e) => setRiskPercent(Math.max(0.01, parseFloat(e.target.value) || 0.1))}
                          className="calc-input"
                          placeholder="2.0"
                        />
                        <span className="input-suffix-tag">%</span>
                      </div>
                      {/* Risk Presets */}
                      <div className="calc-quick-pills-row mt-2">
                        <span className="quick-pill-label">Risk Presets:</span>
                        {RISK_PERCENT_PRESETS.map((p) => (
                          <button
                            key={p}
                            type="button"
                            className={`calc-preset-pill ${riskPercent === p ? 'active' : ''}`}
                            onClick={() => setRiskPercent(p)}
                          >
                            {p}%
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="calc-input-adornment">
                      <span className="input-currency-tag">{currentCurrency.symbol}</span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={riskCashAmount}
                        onChange={(e) => setRiskCashAmount(Math.max(1, parseFloat(e.target.value) || 1))}
                        className="calc-input"
                        placeholder="200"
                      />
                    </div>
                  )}
                </div>

                {/* Stop Loss (Pips vs Price Mode) */}
                <div className="calc-field-group">
                  <div className="calc-label-row">
                    <label>Stop Loss Parameter</label>
                    <div className="calc-sub-mode-toggle">
                      <button
                        type="button"
                        className={`sub-toggle-btn ${stopLossMode === 'pips' ? 'active' : ''}`}
                        onClick={() => setStopLossMode('pips')}
                      >
                        Pips
                      </button>
                      <button
                        type="button"
                        className={`sub-toggle-btn ${stopLossMode === 'price' ? 'active' : ''}`}
                        onClick={() => setStopLossMode('price')}
                      >
                        Price Levels
                      </button>
                    </div>
                  </div>

                  {stopLossMode === 'pips' ? (
                    <div>
                      <div className="calc-input-adornment">
                        <input
                          type="number"
                          min="0.5"
                          step="any"
                          value={stopLossPips}
                          onChange={(e) => setStopLossPips(Math.max(0.1, parseFloat(e.target.value) || 1))}
                          className="calc-input"
                          placeholder="25"
                        />
                        <span className="input-suffix-tag">Pips</span>
                      </div>
                      <div className="calc-quick-pills-row mt-2">
                        <span className="quick-pill-label">Presets:</span>
                        {[10, 15, 20, 25, 35, 50, 100].map((slVal) => (
                          <button
                            key={slVal}
                            type="button"
                            className={`calc-preset-pill ${stopLossPips === slVal ? 'active' : ''}`}
                            onClick={() => setStopLossPips(slVal)}
                          >
                            {slVal}p
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="calc-two-col-row">
                      <div className="calc-field-group">
                        <label className="sub-field-label">Entry Price</label>
                        <input
                          type="number"
                          step="any"
                          value={entryPrice}
                          onChange={(e) => setEntryPrice(e.target.value)}
                          className="calc-input"
                          placeholder="1.08650"
                        />
                      </div>
                      <div className="calc-field-group">
                        <label className="sub-field-label">Stop Loss Price</label>
                        <input
                          type="number"
                          step="any"
                          value={stopLossPrice}
                          onChange={(e) => setStopLossPrice(e.target.value)}
                          className="calc-input"
                          placeholder="1.08400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* SPREAD CALCULATOR CONTROLS */}
            {activeTab === 'spread-cost' && (
              <>
                <div className="calc-two-col-row">
                  <div className="calc-field-group">
                    <label>Trade Size (Lots)</label>
                    <div className="calc-input-adornment">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={tradeLots}
                        onChange={(e) => setTradeLots(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                        className="calc-input"
                      />
                      <span className="input-suffix-tag">Lots</span>
                    </div>
                  </div>

                  <div className="calc-field-group">
                    <label>Broker Spread (Pips)</label>
                    <div className="calc-input-adornment">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={customSpread}
                        onChange={(e) => setCustomSpread(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="calc-input"
                      />
                      <span className="input-suffix-tag">Pips</span>
                    </div>
                  </div>
                </div>

                <div className="calc-quick-pills-row">
                  <span className="quick-pill-label">Spread Tier:</span>
                  {[
                    { label: 'Raw ECN (0.2)', val: 0.2 },
                    { label: 'Competitive (0.8)', val: 0.8 },
                    { label: 'Standard (1.4)', val: 1.4 },
                    { label: 'High (2.2)', val: 2.2 },
                  ].map((tier) => (
                    <button
                      key={tier.val}
                      type="button"
                      className={`calc-preset-pill ${customSpread === tier.val ? 'active' : ''}`}
                      onClick={() => setCustomSpread(tier.val)}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>

                <div className="calc-field-group mt-3">
                  <label>Commission per Lot (Optional)</label>
                  <div className="calc-input-adornment">
                    <span className="input-currency-tag">{currentCurrency.symbol}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={commissionPerLot}
                      onChange={(e) => setCommissionPerLot(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="calc-input"
                      placeholder="3.50"
                    />
                    <span className="input-suffix-tag">/ Round Turn</span>
                  </div>
                </div>
              </>
            )}

            {/* PROFIT & LOSS CALCULATOR CONTROLS */}
            {activeTab === 'profit-loss' && (
              <>
                <div className="calc-field-group">
                  <label>Order Direction</label>
                  <div className="calc-order-direction-toggle">
                    <button
                      type="button"
                      className={`order-btn buy ${pnlDirection === 'buy' ? 'active' : ''}`}
                      onClick={() => setPnlDirection('buy')}
                    >
                      <TrendingUp size={14} /> Buy (Long)
                    </button>
                    <button
                      type="button"
                      className={`order-btn sell ${pnlDirection === 'sell' ? 'active' : ''}`}
                      onClick={() => setPnlDirection('sell')}
                    >
                      <TrendingDown size={14} /> Sell (Short)
                    </button>
                  </div>
                </div>

                <div className="calc-two-col-row">
                  <div className="calc-field-group">
                    <label>Trade Size (Lots)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={pnlLots}
                      onChange={(e) => setPnlLots(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                      className="calc-input"
                    />
                  </div>

                  <div className="calc-field-group">
                    <label>Entry Price</label>
                    <input
                      type="number"
                      step="any"
                      value={pnlEntryPrice}
                      onChange={(e) => setPnlEntryPrice(e.target.value)}
                      className="calc-input"
                    />
                  </div>
                </div>

                <div className="calc-field-group">
                  <label>Target Exit Price</label>
                  <input
                    type="number"
                    step="any"
                    value={pnlExitPrice}
                    onChange={(e) => setPnlExitPrice(e.target.value)}
                    className="calc-input"
                  />
                </div>
              </>
            )}

            {/* PIP VALUE MATRIX CONTROLS */}
            {activeTab === 'pip-value' && (
              <div className="calc-field-group">
                <label>Custom Trade Size (Lots)</label>
                <div className="calc-input-adornment">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={tradeLots}
                    onChange={(e) => setTradeLots(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                    className="calc-input"
                  />
                  <span className="input-suffix-tag">Lots</span>
                </div>
              </div>
            )}
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* RIGHT COLUMN: REAL-TIME RESULTS & RISK RADAR            */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="calc-card calc-result-card">
            {/* LOT SIZE RESULTS DISPLAY */}
            {activeTab === 'lot-size' && (
              <>
                <div className="calc-hero-result-banner">
                  <span className="hero-result-eyebrow">Recommended Position Size</span>
                  <div className="hero-result-big-number">
                    {lotSizeResult.standardLots}{' '}
                    <span className="hero-lot-unit">Standard Lots</span>
                  </div>

                  <div className="hero-breakdown-subchips">
                    <span className="subchip">
                      <strong>{lotSizeResult.miniLots}</strong> Mini Lots
                    </span>
                    <span className="subchip-dot">•</span>
                    <span className="subchip">
                      <strong>{lotSizeResult.microLots}</strong> Micro Lots
                    </span>
                    <span className="subchip-dot">•</span>
                    <span className="subchip">
                      <strong>{lotSizeResult.units.toLocaleString()}</strong> Units
                    </span>
                  </div>
                </div>

                {/* Risk Level Radar Badge */}
                <div
                  className={`calc-risk-radar-pill ${lotSizeResult.riskClassification}`}
                  style={{ '--badge-theme': lotSizeResult.riskBadgeColor }}
                >
                  <div className="radar-pulse-dot" />
                  <span className="radar-label">
                    Risk Profile: <strong>{lotSizeResult.riskClassification.toUpperCase()}</strong> (
                    {lotSizeResult.riskPercent}% of account)
                  </span>
                  <span className="radar-cash-tag">
                    Max Loss: {currentCurrency.symbol}
                    {lotSizeResult.riskAmountCash.toLocaleString()}
                  </span>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="calc-metrics-grid">
                  <div className="calc-metric-box">
                    <span className="metric-label">Cash at Risk</span>
                    <span className="metric-value">
                      {currentCurrency.symbol}
                      {lotSizeResult.riskAmountCash.toLocaleString()}
                    </span>
                    <span className="metric-note">{lotSizeResult.riskPercent}% Balance</span>
                  </div>

                  <div className="calc-metric-box">
                    <span className="metric-label">Pip Value (Position)</span>
                    <span className="metric-value text-accent">
                      {currentCurrency.symbol}
                      {lotSizeResult.totalPositionPipValue}
                    </span>
                    <span className="metric-note">Per 1.0 pip movement</span>
                  </div>

                  <div className="calc-metric-box">
                    <span className="metric-label">Notional Trade Value</span>
                    <span className="metric-value">
                      ${lotSizeResult.notionalValue.toLocaleString()}
                    </span>
                    <span className="metric-note">{lotSizeResult.units.toLocaleString()} contract units</span>
                  </div>

                  <div className="calc-metric-box">
                    <span className="metric-label">Stop Loss Range</span>
                    <span className="metric-value">
                      {stopLossPips} <span className="small-unit">pips</span>
                    </span>
                    <span className="metric-note">Safety buffer</span>
                  </div>
                </div>

                {/* Leverage Margin Requirement Matrix */}
                <div className="calc-leverage-matrix-card">
                  <div className="matrix-title-row">
                    <ShieldCheck size={14} className="text-accent" />
                    <span>Estimated Required Margin by Leverage</span>
                  </div>
                  <div className="matrix-table-row">
                    <div className="matrix-cell">
                      <span className="cell-lev">1:100</span>
                      <span className="cell-val">
                        ${lotSizeResult.marginAtLeverage['1:100'].toLocaleString()}
                      </span>
                    </div>
                    <div className="matrix-cell">
                      <span className="cell-lev">1:200</span>
                      <span className="cell-val">
                        ${lotSizeResult.marginAtLeverage['1:200'].toLocaleString()}
                      </span>
                    </div>
                    <div className="matrix-cell highlight">
                      <span className="cell-lev">1:500</span>
                      <span className="cell-val">
                        ${lotSizeResult.marginAtLeverage['1:500'].toLocaleString()}
                      </span>
                    </div>
                    <div className="matrix-cell">
                      <span className="cell-lev">1:1000</span>
                      <span className="cell-val">
                        ${lotSizeResult.marginAtLeverage['1:1000'].toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* SPREAD RESULTS DISPLAY */}
            {activeTab === 'spread-cost' && (
              <>
                <div className="calc-hero-result-banner">
                  <span className="hero-result-eyebrow">Estimated Total Round-Turn Cost</span>
                  <div className="hero-result-big-number">
                    {currentCurrency.symbol}
                    {spreadResult.totalTradeCost}{' '}
                    <span className="hero-lot-unit">Total Cost</span>
                  </div>

                  <div className="hero-breakdown-subchips">
                    <span className="subchip">
                      Spread Fee: {currentCurrency.symbol}{spreadResult.spreadCost}
                    </span>
                    <span className="subchip-dot">•</span>
                    <span className="subchip">
                      Commission: {currentCurrency.symbol}{spreadResult.commissionCost}
                    </span>
                  </div>
                </div>

                <div className={`calc-risk-radar-pill ${spreadResult.spreadRating}`}>
                  <div className="radar-pulse-dot" />
                  <span className="radar-label">
                    Broker Condition: <strong>{spreadResult.ratingLabel}</strong> ({customSpread} pips)
                  </span>
                  {spreadResult.potentialSavings > 0 && (
                    <span className="radar-cash-tag green">
                      Saves ~{currentCurrency.symbol}{spreadResult.potentialSavings} vs Retail Standard
                    </span>
                  )}
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="calc-metrics-grid">
                  <div className="calc-metric-box">
                    <span className="metric-label">Spread in Pips</span>
                    <span className="metric-value">{customSpread} pips</span>
                    <span className="metric-note">Spread Markup</span>
                  </div>

                  <div className="calc-metric-box">
                    <span className="metric-label">Cost per Pip</span>
                    <span className="metric-value text-accent">
                      {currentCurrency.symbol}{spreadResult.costPerPip}
                    </span>
                    <span className="metric-note">For {tradeLots} lots</span>
                  </div>

                  <div className="calc-metric-box">
                    <span className="metric-label">Commission (Round-Turn)</span>
                    <span className="metric-value">
                      {currentCurrency.symbol}{spreadResult.commissionCost}
                    </span>
                    <span className="metric-note">Fixed execution fee</span>
                  </div>

                  <div className="calc-metric-box">
                    <span className="metric-label">Spread Cost as % of Lot</span>
                    <span className="metric-value">
                      {((spreadResult.spreadCost / (tradeLots * currentInstrument.contractSize)) * 100).toFixed(4)}%
                    </span>
                    <span className="metric-note">Drag on trade</span>
                  </div>
                </div>

                {/* Top Broker Benchmark Comparison */}
                <div className="calc-broker-benchmark-card">
                  <div className="matrix-title-row">
                    <Scale size={14} className="text-accent" />
                    <span>Cost for {tradeLots} Lot on Top Regulated Brokers</span>
                  </div>
                  <div className="benchmark-list">
                    {TOP_BROKER_SPREAD_BENCHMARKS.map((b) => {
                      const brokerCost = Number(
                        (b.eurusdSpread * lotSizeResult.pipValuePerStandardLot * tradeLots +
                          (b.commission === '$0 (Zero)' ? 0 : 3.5 * tradeLots)).toFixed(2)
                      );
                      return (
                        <div key={b.broker} className="benchmark-item">
                          <div className="b-left">
                            <span className="b-name">{b.broker}</span>
                            <span className="b-acc">{b.account} ({b.eurusdSpread} pips)</span>
                          </div>
                          <div className="b-right">
                            <span className="b-cost">
                              {currentCurrency.symbol}{brokerCost}
                            </span>
                            <span className="b-badge">{b.rating}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* PIP VALUE RESULTS DISPLAY */}
            {activeTab === 'pip-value' && (
              <>
                <div className="calc-hero-result-banner">
                  <span className="hero-result-eyebrow">Pip Value for {tradeLots} Lots</span>
                  <div className="hero-result-big-number">
                    {currentCurrency.symbol}
                    {Number((pipValuesResult.standard * tradeLots).toFixed(2))}{' '}
                    <span className="hero-lot-unit">/ Pip</span>
                  </div>

                  <div className="hero-breakdown-subchips">
                    <span className="subchip">
                      Pair: {currentInstrument.symbol}
                    </span>
                    <span className="subchip-dot">•</span>
                    <span className="subchip">
                      Account: {accountCurrency}
                    </span>
                  </div>
                </div>

                <div className="calc-pip-matrix-table">
                  <div className="pip-matrix-header">
                    <span>Lot Tier</span>
                    <span>Volume</span>
                    <span>Pip Value ({accountCurrency})</span>
                  </div>

                  <div className="pip-matrix-row">
                    <div className="pip-tier-info">
                      <strong>Standard Lot (1.0)</strong>
                      <span>100,000 units</span>
                    </div>
                    <span className="pip-tier-vol">1.0 Lot</span>
                    <span className="pip-tier-val">{currentCurrency.symbol}{pipValuesResult.standard} / pip</span>
                  </div>

                  <div className="pip-matrix-row">
                    <div className="pip-tier-info">
                      <strong>Mini Lot (0.10)</strong>
                      <span>10,000 units</span>
                    </div>
                    <span className="pip-tier-vol">0.10 Lot</span>
                    <span className="pip-tier-val">{currentCurrency.symbol}{pipValuesResult.mini} / pip</span>
                  </div>

                  <div className="pip-matrix-row">
                    <div className="pip-tier-info">
                      <strong>Micro Lot (0.01)</strong>
                      <span>1,000 units</span>
                    </div>
                    <span className="pip-tier-vol">0.01 Lot</span>
                    <span className="pip-tier-val">{currentCurrency.symbol}{pipValuesResult.micro} / pip</span>
                  </div>

                  <div className="pip-matrix-row highlight">
                    <div className="pip-tier-info">
                      <strong>Your Custom Size ({tradeLots} Lots)</strong>
                      <span>{(tradeLots * currentInstrument.contractSize).toLocaleString()} units</span>
                    </div>
                    <span className="pip-tier-vol">{tradeLots} Lots</span>
                    <span className="pip-tier-val text-accent">
                      {currentCurrency.symbol}{Number((pipValuesResult.standard * tradeLots).toFixed(2))} / pip
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* PROFIT & LOSS RESULTS DISPLAY */}
            {activeTab === 'profit-loss' && (
              <>
                <div className={`calc-hero-result-banner ${pnlResult.isProfit ? 'profit' : 'loss'}`}>
                  <span className="hero-result-eyebrow">
                    {pnlResult.isProfit ? 'Estimated Net Profit' : 'Estimated Net Loss'}
                  </span>
                  <div className={`hero-result-big-number ${pnlResult.isProfit ? 'text-green' : 'text-red'}`}>
                    {pnlResult.isProfit ? '+' : ''}
                    {currentCurrency.symbol}
                    {pnlResult.cashPnL.toLocaleString()}{' '}
                    <span className="hero-lot-unit">({pnlResult.roi}% ROI)</span>
                  </div>

                  <div className="hero-breakdown-subchips">
                    <span className="subchip">
                      Price Delta: {pnlResult.pipsGained} Pips
                    </span>
                    <span className="subchip-dot">•</span>
                    <span className="subchip">
                      Volume: {pnlLots} Lots
                    </span>
                  </div>
                </div>

                <div className="calc-metrics-grid">
                  <div className="calc-metric-box">
                    <span className="metric-label">Pips Gained / Lost</span>
                    <span className={`metric-value ${pnlResult.isProfit ? 'text-green' : 'text-red'}`}>
                      {pnlResult.pipsGained > 0 ? `+${pnlResult.pipsGained}` : pnlResult.pipsGained} pips
                    </span>
                    <span className="metric-note">Distance traveled</span>
                  </div>

                  <div className="calc-metric-box">
                    <span className="metric-label">Account Impact</span>
                    <span className={`metric-value ${pnlResult.isProfit ? 'text-green' : 'text-red'}`}>
                      {pnlResult.roi > 0 ? `+${pnlResult.roi}%` : `${pnlResult.roi}%`}
                    </span>
                    <span className="metric-note">On {currentCurrency.symbol}{Number(balance).toLocaleString()}</span>
                  </div>

                  <div className="calc-metric-box">
                    <span className="metric-label">New Account Balance</span>
                    <span className="metric-value">
                      {currentCurrency.symbol}
                      {Math.max(0, balance + pnlResult.cashPnL).toLocaleString()}
                    </span>
                    <span className="metric-note">After closing trade</span>
                  </div>

                  <div className="calc-metric-box">
                    <span className="metric-label">Pip Multiplier</span>
                    <span className="metric-value">
                      {currentCurrency.symbol}
                      {Number((lotSizeResult.pipValuePerStandardLot * pnlLots).toFixed(2))}
                    </span>
                    <span className="metric-note">Per single pip</span>
                  </div>
                </div>
              </>
            )}

            {/* Actions: Copy Summary & Broker CTA */}
            <div className="calc-card-actions">
              <button
                type="button"
                className="calc-btn-copy"
                onClick={handleCopySummary}
              >
                {copiedSummary ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copiedSummary ? 'Copied to Clipboard!' : 'Copy Trade Summary'}</span>
              </button>

              <Link to="/compare" className="calc-btn-broker-compare">
                <span>Compare Zero-Spread Brokers</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 3. EDUCATIONAL & RISK GUIDE ACCORDION                    */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="calc-guide-section">
          <div className="calc-guide-header">
            <h3>How Position Sizing &amp; Spread Calculations Work</h3>
            <p>Essential mathematical formulas used by proprietary trading desks and institutional risk managers</p>
          </div>

          <div className="calc-guide-grid">
            <div className="guide-card">
              <div className="guide-icon-badge">
                <Calculator size={18} />
              </div>
              <h4>Position Sizing Formula</h4>
              <p>
                <code>Lot Size = Cash at Risk / (Stop Loss in Pips × Pip Value per Standard Lot)</code>
              </p>
              <span className="guide-desc">
                For example, risking $200 on EUR/USD with a 25 pip stop loss and $10/pip standard value yields exactly <strong>0.80 standard lots</strong>.
              </span>
            </div>

            <div className="guide-card">
              <div className="guide-icon-badge">
                <Scale size={18} />
              </div>
              <h4>Spread Cost Calculation</h4>
              <p>
                <code>Spread Cost = Spread (Pips) × Pip Value × Number of Lots</code>
              </p>
              <span className="guide-desc">
                A 1.5 pip spread on 2.0 lots costs <strong>$30.00</strong> upfront. Choosing an ECN broker with 0.1 pip spread saves over <strong>$28.00 per trade</strong>.
              </span>
            </div>

            <div className="guide-card">
              <div className="guide-icon-badge">
                <ShieldCheck size={18} />
              </div>
              <h4>The 1% - 2% Risk Rule</h4>
              <p>
                <code>Risk per trade ≤ 1.0% to 2.0% of Total Equity</code>
              </p>
              <span className="guide-desc">
                Adhering to strict position sizing ensures that a sequence of 10 consecutive drawdown trades degrades less than 15% of your total trading capital.
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default CalculatorPage;
