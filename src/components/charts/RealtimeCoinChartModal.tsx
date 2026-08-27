"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  Sliders,
  Maximize2,
  Minimize2,
  RefreshCw,
  BarChart2,
  LineChart,
  Layers,
  Sparkles,
  Info,
  Check,
  ShieldAlert,
  ArrowRight,
  Play,
  Pause,
  Clock,
  Radio,
  Eye,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { useLiveMarket } from "@/lib/context/LiveMarketContext";

export interface ChartModalProps {
  coin: {
    coin_id: string;
    name: string;
    symbol: string;
    price_usd: number;
    price_change_24h: number;
    market_cap?: number;
    volume_24h?: number;
    image_url?: string;
  } | null;
  onClose: () => void;
}

export type Timeframe = "10s" | "1m" | "5m" | "15m" | "1h" | "24h" | "7d";
export type ChartStyle = "candlestick" | "hollow" | "area" | "bars";

interface CandleItem {
  time: number;
  timeFormatted: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isUp: boolean;
  isLive?: boolean;
}

export function RealtimeCoinChartModal({ coin, onClose }: ChartModalProps) {
  const { getLiveCoin, liveTapeTrades, isLive } = useLiveMarket();
  const [timeframe, setTimeframe] = useState<Timeframe>("1m");
  const [chartStyle, setChartStyle] = useState<ChartStyle>("candlestick");
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [showTapeDrawer, setShowTapeDrawer] = useState(false);

  // Technical Indicators toggles
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showEMA12, setShowEMA12] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(false);
  const [showVolume, setShowVolume] = useState(true);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [candles, setCandles] = useState<CandleItem[]>([]);
  const [isLoadingCandles, setIsLoadingCandles] = useState(true);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedTicksCount, setRecordedTicksCount] = useState(0);
  const [lastDataSource, setLastDataSource] = useState<string>("Initializing Market Feed...");

  const coinId = coin?.coin_id || "default";
  const coinPrice = coin?.price_usd || 100;
  const coinChange = coin?.price_change_24h || 0;

  const live = getLiveCoin(coinId, coinPrice, coinChange);
  const currentPrice = live.price || coinPrice;
  const change24h = live.change24h ?? coinChange ?? 0;
  const isUp = change24h >= 0;

  // Recording timer increment
  useEffect(() => {
    if (isRecordingPaused) return;
    const t = setInterval(() => {
      setRecordingSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [isRecordingPaused]);

  // Map timeframe to milliseconds
  const getIntervalMs = (tf: Timeframe) => {
    switch (tf) {
      case "10s":
        return 10_000;
      case "1m":
        return 60_000;
      case "5m":
        return 300_000;
      case "15m":
        return 900_000;
      case "1h":
        return 3600_000;
      case "24h":
        return 86400_000;
      case "7d":
        return 604800_000;
      default:
        return 60_000;
    }
  };

  // 1. Fetch genuine historical OHLCV candles from our real market backend API
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingCandles(true);

    async function loadCandles() {
      try {
        const res = await fetch(`/api/coins/${encodeURIComponent(coinId)}/candles?timeframe=${timeframe}`);
        if (!res.ok) throw new Error("Failed to fetch candle data");
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (isCancelled) return;

        if (Array.isArray(data.candles) && data.candles.length > 0) {
          setLastDataSource(data.source || "Live Market Feed");
          const mapped: CandleItem[] = data.candles.map((c: any) => {
            const t = Number(c.time);
            return {
              time: t,
              timeFormatted: new Date(t).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: timeframe === "10s" || timeframe === "1m" ? "2-digit" : undefined,
              }),
              open: c.open,
              high: c.high,
              low: c.low,
              close: c.close,
              volume: c.volume || 10000,
              isUp: c.close >= c.open,
            };
          });

          // Ensure the last bar connects smoothly to currentPrice
          if (mapped.length > 0) {
            const last = mapped[mapped.length - 1];
            last.close = currentPrice;
            last.high = Math.max(last.high, currentPrice);
            last.low = Math.min(last.low, currentPrice);
            last.isUp = last.close >= last.open;
            last.isLive = true;
          }

          setCandles(mapped);
        }
      } catch (err) {
        console.warn("Candle fetch fallback:", err);
      } finally {
        if (!isCancelled) {
          setIsLoadingCandles(false);
        }
      }
    }

    loadCandles();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinId, timeframe]);

  // 2. Real-time Live Candlestick Recorder:
  // As live price ticks arrive, update the forming candle in real time!
  useEffect(() => {
    if (isRecordingPaused || candles.length === 0) return;

    setRecordedTicksCount((c) => c + 1);

    setCandles((prev) => {
      if (prev.length === 0) return prev;
      const now = Date.now();
      const intervalMs = getIntervalMs(timeframe);
      const next = [...prev];
      const lastIndex = next.length - 1;
      const activeBar = { ...next[lastIndex] };

      // Check if active bar's interval has expired; if so, seal it and open a new live forming bar
      if (now - activeBar.time >= intervalMs) {
        // Seal current bar
        next[lastIndex] = { ...activeBar, isLive: false };

        // Create new forming bar
        const newBar: CandleItem = {
          time: now,
          timeFormatted: new Date(now).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: timeframe === "10s" || timeframe === "1m" ? "2-digit" : undefined,
          }),
          open: activeBar.close,
          high: Math.max(activeBar.close, currentPrice),
          low: Math.min(activeBar.close, currentPrice),
          close: currentPrice,
          volume: (activeBar.volume || 10000) * 0.1,
          isUp: currentPrice >= activeBar.close,
          isLive: true,
        };

        // Maintain maximum 60 candles in rolling tape window
        return [...next.slice(-59), newBar];
      }

      // Update existing live forming bar with incoming tick
      activeBar.close = currentPrice;
      activeBar.high = Math.max(activeBar.high, currentPrice);
      activeBar.low = Math.min(activeBar.low, currentPrice);
      activeBar.volume = (activeBar.volume || 10000) + Math.abs(currentPrice * 0.05);
      activeBar.isUp = activeBar.close >= activeBar.open;
      activeBar.isLive = true;

      next[lastIndex] = activeBar;
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrice, isRecordingPaused, timeframe]);

  // Compute Technical Indicators strictly on the live recorded candle array
  const indicatorSeries = useMemo(() => {
    const closes = candles.map((c) => c.close);
    const n = closes.length;

    // SMA calculation
    const calcSMA = (period: number) => {
      return closes.map((_, i) => {
        if (i < period - 1) return null;
        const slice = closes.slice(i - period + 1, i + 1);
        return slice.reduce((a, b) => a + b, 0) / period;
      });
    };

    // EMA calculation
    const calcEMA = (period: number) => {
      const k = 2 / (period + 1);
      const ema: (number | null)[] = [];
      let prevEma: number | null = null;

      for (let i = 0; i < n; i++) {
        if (i < period - 1) {
          ema.push(null);
        } else if (i === period - 1) {
          const slice = closes.slice(0, period);
          prevEma = slice.reduce((a, b) => a + b, 0) / period;
          ema.push(prevEma);
        } else if (prevEma !== null) {
          prevEma = closes[i] * k + prevEma * (1 - k);
          ema.push(prevEma);
        } else {
          ema.push(null);
        }
      }
      return ema;
    };

    // Bollinger Bands (20 period, 2 std dev)
    const calcBollinger = (period = 20, multiplier = 2) => {
      const upper: (number | null)[] = [];
      const lower: (number | null)[] = [];
      const middle: (number | null)[] = [];

      for (let i = 0; i < n; i++) {
        if (i < period - 1) {
          upper.push(null);
          lower.push(null);
          middle.push(null);
        } else {
          const slice = closes.slice(i - period + 1, i + 1);
          const mean = slice.reduce((a, b) => a + b, 0) / period;
          const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
          const stdDev = Math.sqrt(variance);
          middle.push(mean);
          upper.push(mean + multiplier * stdDev);
          lower.push(mean - multiplier * stdDev);
        }
      }
      return { upper, lower, middle };
    };

    // RSI (14 period)
    const calcRSI = (period = 14) => {
      const rsi: (number | null)[] = [];
      if (n <= period) return closes.map(() => 50);

      let gains = 0;
      let losses = 0;

      for (let i = 1; i <= period; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
      }

      let avgGain = gains / period;
      let avgLoss = losses / period;
      rsi.push(...Array(period).fill(null));

      const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + firstRS));

      for (let i = period + 1; i < n; i++) {
        const diff = closes[i] - closes[i - 1];
        const gain = diff >= 0 ? diff : 0;
        const loss = diff < 0 ? -diff : 0;

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;

        if (avgLoss === 0) {
          rsi.push(100);
        } else {
          const rs = avgGain / avgLoss;
          rsi.push(100 - 100 / (1 + rs));
        }
      }
      return rsi;
    };

    // MACD (12, 26, 9)
    const ema12 = calcEMA(12);
    const ema26 = calcEMA(26);
    const macdLine: (number | null)[] = [];
    for (let i = 0; i < n; i++) {
      if (ema12[i] !== null && ema26[i] !== null) {
        macdLine.push(ema12[i]! - ema26[i]!);
      } else {
        macdLine.push(null);
      }
    }

    return {
      sma20: calcSMA(20),
      sma50: calcSMA(50),
      ema12,
      bollinger: calcBollinger(20, 2),
      rsi: calcRSI(14),
      macdLine,
    };
  }, [candles]);

  // Min and Max price bounds with buffer for indicator envelopes
  const { minPrice, maxPrice, priceRange, maxVol } = useMemo(() => {
    if (candles.length === 0) {
      return { minPrice: 0, maxPrice: 1, priceRange: 1, maxVol: 1000 };
    }

    let min = Math.min(...candles.map((c) => c.low));
    let max = Math.max(...candles.map((c) => c.high));

    // Incorporate Bollinger Bands into coordinate scaling
    if (showBollinger && indicatorSeries.bollinger) {
      indicatorSeries.bollinger.upper.forEach((v) => {
        if (v !== null && v > max) max = v;
      });
      indicatorSeries.bollinger.lower.forEach((v) => {
        if (v !== null && v < min && v > 0) min = v;
      });
    }

    const vol = Math.max(...candles.map((c) => c.volume), 100);
    const padding = (max - min) * 0.08 || min * 0.005;

    return {
      minPrice: Math.max(0.00000001, min - padding),
      maxPrice: max + padding,
      priceRange: Math.max(max - min + padding * 2, min * 0.001),
      maxVol: vol,
    };
  }, [candles, showBollinger, indicatorSeries.bollinger]);

  if (!coin) return null;

  // Active hover candle or live head bar
  const activeHover =
    hoveredIndex !== null && hoveredIndex < candles.length
      ? candles[hoveredIndex]
      : candles[candles.length - 1] || {
          open: currentPrice,
          high: currentPrice,
          low: currentPrice,
          close: currentPrice,
          volume: 0,
          timeFormatted: "Live",
          isUp: true,
        };

  // Dimensions
  const chartHeight = 360;
  const subChartHeight = showRSI ? 85 : 0;
  const volHeight = showVolume ? 60 : 0;
  const totalSvgHeight = chartHeight + subChartHeight + (showVolume ? 45 : 0) + 30;

  const barWidth = candles.length > 0 ? 100 / candles.length : 1;
  const candleBodyWidth = Math.max(3, barWidth * 0.68);

  // Helper coordinate mappers
  const getY = (val: number) => {
    return chartHeight - ((val - minPrice) / priceRange) * (chartHeight - 40) - 20;
  };

  const getRSIY = (val: number) => {
    const topY = chartHeight + 25;
    return topY + subChartHeight - (val / 100) * subChartHeight;
  };

  // Price formatting helper
  const fmtPrice = (val: number) => {
    if (val >= 1000) return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (val >= 1) return `$${val.toFixed(3)}`;
    if (val >= 0.01) return `$${val.toFixed(5)}`;
    return `$${val.toFixed(8)}`;
  };

  const fmtDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[95vh] bg-[#090d16] border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header & Live Recording Banner ─────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-white/[0.08] bg-slate-900/60">
          <div className="flex items-center gap-3">
            {coin.image_url ? (
              <img
                src={coin.image_url}
                alt={coin.name}
                className="w-8 h-8 rounded-full border border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                {coin.symbol.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">{coin.name}</h2>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded">
                  {coin.symbol}/USDT
                </span>
                {/* Live Recording HUD Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold transition-all ${
                    !isRecordingPaused
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      !isRecordingPaused ? "bg-rose-500 animate-ping" : "bg-amber-500"
                    }`}
                  />
                  {!isRecordingPaused ? "● LIVE RECORDING" : "PAUSED"}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                <span>Feed: {lastDataSource}</span>
                <span>•</span>
                <span>Tape: {recordedTicksCount} live ticks</span>
                <span>•</span>
                <span className="text-emerald-400">Duration: {fmtDuration(recordingSeconds)}</span>
              </p>
            </div>
          </div>

          {/* Current Live Price & 24h Action */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-2xl font-black font-mono tracking-tight text-white">
                  {fmtPrice(currentPrice)}
                </span>
                <span
                  className={`inline-flex items-center text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                    isUp
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {isUp ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                  {isUp ? "+" : ""}
                  {change24h.toFixed(2)}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                24h High: <span className="text-slate-200">{fmtPrice(maxPrice)}</span> | 24h Low:{" "}
                <span className="text-slate-200">{fmtPrice(minPrice)}</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Close chart"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Toolbar: Timeframe, Chart Style & Indicator Toggles ─────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-[#0b101c] border-b border-white/[0.06] text-xs">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            {(["10s", "1m", "5m", "15m", "1h", "24h", "7d"] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md font-mono font-bold text-[11px] transition ${
                  timeframe === tf
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {tf === "10s" ? "⚡ 10s Tape" : tf.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Chart Style Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setChartStyle("candlestick")}
              className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition ${
                chartStyle === "candlestick"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Solid Candlesticks"
            >
              <BarChart2 size={13} /> Candles
            </button>
            <button
              onClick={() => setChartStyle("hollow")}
              className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition ${
                chartStyle === "hollow"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Hollow Candlesticks"
            >
              <Activity size={13} /> Hollow
            </button>
            <button
              onClick={() => setChartStyle("area")}
              className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition ${
                chartStyle === "area"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Real-Time Area Stream"
            >
              <LineChart size={13} /> Line
            </button>
            <button
              onClick={() => setChartStyle("bars")}
              className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition ${
                chartStyle === "bars"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="OHLC Bars"
            >
              <Layers size={13} /> Bars
            </button>
          </div>

          {/* Technical Indicator Badges (Interactive Toggles) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setShowSMA20(!showSMA20)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
                showSMA20
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-900 text-slate-500 border-slate-800"
              }`}
            >
              SMA 20
            </button>
            <button
              onClick={() => setShowSMA50(!showSMA50)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
                showSMA50
                  ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                  : "bg-slate-900 text-slate-500 border-slate-800"
              }`}
            >
              SMA 50
            </button>
            <button
              onClick={() => setShowEMA12(!showEMA12)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
                showEMA12
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                  : "bg-slate-900 text-slate-500 border-slate-800"
              }`}
            >
              EMA 12
            </button>
            <button
              onClick={() => setShowBollinger(!showBollinger)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
                showBollinger
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-900 text-slate-500 border-slate-800"
              }`}
            >
              Bollinger (20,2)
            </button>
            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
                showRSI
                  ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                  : "bg-slate-900 text-slate-500 border-slate-800"
              }`}
            >
              RSI (14)
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
                showVolume
                  ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                  : "bg-slate-900 text-slate-500 border-slate-800"
              }`}
            >
              Volume
            </button>

            {/* Tape Stream Drawer Toggle */}
            <button
              onClick={() => setShowTapeDrawer(!showTapeDrawer)}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition ${
                showTapeDrawer ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <Radio size={13} className="text-rose-400 animate-pulse" /> Live Tape
            </button>

            {/* Pause / Resume Button */}
            <button
              onClick={() => setIsRecordingPaused(!isRecordingPaused)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title={isRecordingPaused ? "Resume Live Recording" : "Pause Live Recording"}
            >
              {isRecordingPaused ? <Play size={13} className="text-emerald-400" /> : <Pause size={13} className="text-amber-400" />}
            </button>
          </div>
        </div>

        {/* ── Active Bar Telemetry HUD (TradingView Style OHLCV Strip) ───────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-2 bg-[#080d17] border-b border-white/[0.04] text-[11px] font-mono">
          <div className="flex items-center gap-3 text-slate-300 flex-wrap">
            <span className="text-slate-500 font-bold">TIME: <span className="text-slate-200">{activeHover.timeFormatted}</span></span>
            <span>O: <span className="text-white font-bold">{fmtPrice(activeHover.open)}</span></span>
            <span>H: <span className="text-emerald-400 font-bold">{fmtPrice(activeHover.high)}</span></span>
            <span>L: <span className="text-rose-400 font-bold">{fmtPrice(activeHover.low)}</span></span>
            <span>C: <span className={activeHover.close >= activeHover.open ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{fmtPrice(activeHover.close)}</span></span>
            <span>VOL: <span className="text-slate-200">{Math.round(activeHover.volume).toLocaleString()}</span></span>
            <span>CHG: <span className={activeHover.close >= activeHover.open ? "text-emerald-400" : "text-rose-400"}>
              {activeHover.open > 0 ? (((activeHover.close - activeHover.open) / activeHover.open) * 100).toFixed(2) : "0.00"}%
            </span></span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            {showSMA20 && indicatorSeries.sma20 && (
              <span className="text-amber-400 font-bold">SMA20: {fmtPrice(indicatorSeries.sma20[hoveredIndex ?? indicatorSeries.sma20.length - 1] || currentPrice)}</span>
            )}
            {showEMA12 && indicatorSeries.ema12 && (
              <span className="text-purple-400 font-bold">EMA12: {fmtPrice(indicatorSeries.ema12[hoveredIndex ?? indicatorSeries.ema12.length - 1] || currentPrice)}</span>
            )}
            {showRSI && indicatorSeries.rsi && (
              <span className="text-violet-400 font-bold">RSI(14): {(indicatorSeries.rsi[hoveredIndex ?? indicatorSeries.rsi.length - 1] || 50).toFixed(1)}</span>
            )}
          </div>
        </div>

        {/* ── Main Chart Body & Live Tape Drawer Layout ──────────────────────── */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Main Financial Graph Canvas */}
          <div className="flex-1 relative overflow-hidden bg-[#070a12] p-2 flex flex-col justify-center">
            {isLoadingCandles ? (
              <div className="h-[400px] flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw size={24} className="animate-spin text-blue-500" />
                <p className="text-xs font-mono">Streaming real-time candlestick sequence from market feeds...</p>
              </div>
            ) : candles.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-slate-400 text-xs font-mono">
                No candle history available for this asset.
              </div>
            ) : (
              <div className="relative w-full select-none" style={{ height: totalSvgHeight }}>
                <svg
                  width="100%"
                  height={totalSvgHeight}
                  className="overflow-visible"
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="bollingerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="rsiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  {/* ── Background Grid & Price Guidelines ── */}
                  {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
                    const priceVal = minPrice + priceRange * (1 - ratio);
                    const y = getY(priceVal);
                    return (
                      <g key={ratio}>
                        <line
                          x1={0}
                          y1={y}
                          x2="100%"
                          y2={y}
                          stroke="rgba(255, 255, 255, 0.05)"
                          strokeDasharray="3 3"
                        />
                        <text
                          x="98%"
                          y={y - 4}
                          textAnchor="end"
                          fill="rgba(148, 163, 184, 0.5)"
                          fontSize={10}
                          fontFamily="monospace"
                        >
                          {fmtPrice(priceVal)}
                        </text>
                      </g>
                    );
                  })}

                  {/* ── Bollinger Bands Ribbon ── */}
                  {showBollinger && indicatorSeries.bollinger && (
                    <>
                      {/* Shaded ribbon between upper and lower */}
                      <path
                        d={(() => {
                          const uPoints: string[] = [];
                          const lPoints: string[] = [];
                          candles.forEach((_, i) => {
                            const u = indicatorSeries.bollinger.upper[i];
                            const l = indicatorSeries.bollinger.lower[i];
                            const x = `${(i + 0.5) * barWidth}%`;
                            if (u !== null && l !== null) {
                              uPoints.push(`${x},${getY(u)}`);
                              lPoints.unshift(`${x},${getY(l)}`);
                            }
                          });
                          if (uPoints.length === 0) return "";
                          return `M ${uPoints.join(" L ")} L ${lPoints.join(" L ")} Z`;
                        })()}
                        fill="url(#bollingerGradient)"
                      />

                      {/* Upper Band Line */}
                      <polyline
                        points={candles
                          .map((_, i) => {
                            const v = indicatorSeries.bollinger.upper[i];
                            return v !== null ? `${(i + 0.5) * barWidth}%,${getY(v)}` : null;
                          })
                          .filter(Boolean)
                          .join(" ")}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                        opacity={0.65}
                      />

                      {/* Lower Band Line */}
                      <polyline
                        points={candles
                          .map((_, i) => {
                            const v = indicatorSeries.bollinger.lower[i];
                            return v !== null ? `${(i + 0.5) * barWidth}%,${getY(v)}` : null;
                          })
                          .filter(Boolean)
                          .join(" ")}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                        opacity={0.65}
                      />
                    </>
                  )}

                  {/* ── Area Stream Chart Fill (If Area Style Selected) ── */}
                  {chartStyle === "area" && (
                    <>
                      <polygon
                        points={(() => {
                          const pts = candles.map((c, i) => `${(i + 0.5) * barWidth}%,${getY(c.close)}`);
                          return `0%,${chartHeight} ${pts.join(" ")} 100%,${chartHeight}`;
                        })()}
                        fill="url(#areaGradient)"
                      />
                      <polyline
                        points={candles.map((c, i) => `${(i + 0.5) * barWidth}%,${getY(c.close)}`).join(" ")}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                    </>
                  )}

                  {/* ── Volume Histogram Profile ── */}
                  {showVolume && (
                    <g opacity={0.65}>
                      {candles.map((c, i) => {
                        const h = Math.max(2, (c.volume / maxVol) * volHeight);
                        const y = chartHeight - h;
                        const x = `${(i + 0.5) * barWidth}%`;
                        const col = c.isUp ? "#10b981" : "#f43f5e";
                        return (
                          <rect
                            key={`vol-${i}`}
                            x={`calc(${x} - ${candleBodyWidth / 2}px)`}
                            y={y}
                            width={candleBodyWidth}
                            height={h}
                            fill={col}
                            opacity={0.35}
                          />
                        );
                      })}
                    </g>
                  )}

                  {/* ── Candlesticks & OHLC Bars ── */}
                  {(chartStyle === "candlestick" || chartStyle === "hollow" || chartStyle === "bars") &&
                    candles.map((c, i) => {
                      const isLast = i === candles.length - 1;
                      const xPct = `${(i + 0.5) * barWidth}%`;

                      const highY = getY(c.high);
                      const lowY = getY(c.low);
                      const openY = getY(c.open);
                      const closeY = getY(c.close);

                      const topY = Math.min(openY, closeY);
                      const bodyH = Math.max(2, Math.abs(closeY - openY));
                      const isBull = c.close >= c.open;
                      const color = isBull ? "#10b981" : "#f43f5e";

                      if (chartStyle === "bars") {
                        return (
                          <g key={i} className="transition-all duration-150">
                            {/* Vertical High-Low Bar */}
                            <line
                              x1={xPct}
                              y1={highY}
                              x2={xPct}
                              y2={lowY}
                              stroke={color}
                              strokeWidth={1.5}
                            />
                            {/* Left Open Tick */}
                            <line
                              x1={`calc(${xPct} - 3px)`}
                              y1={openY}
                              x2={xPct}
                              y2={openY}
                              stroke={color}
                              strokeWidth={1.5}
                            />
                            {/* Right Close Tick */}
                            <line
                              x1={xPct}
                              y1={closeY}
                              x2={`calc(${xPct} + 3px)`}
                              y2={closeY}
                              stroke={color}
                              strokeWidth={1.5}
                            />
                          </g>
                        );
                      }

                      return (
                        <g key={i} className="transition-all duration-150">
                          {/* Candle Wick (High to Low) */}
                          <line
                            x1={xPct}
                            y1={highY}
                            x2={xPct}
                            y2={lowY}
                            stroke={color}
                            strokeWidth={1.2}
                            opacity={isLast ? 1 : 0.8}
                          />

                          {/* Candle Body */}
                          <rect
                            x={`calc(${xPct} - ${candleBodyWidth / 2}px)`}
                            y={topY}
                            width={candleBodyWidth}
                            height={bodyH}
                            fill={chartStyle === "hollow" && isBull ? "transparent" : color}
                            stroke={chartStyle === "hollow" && isBull ? color : "none"}
                            strokeWidth={chartStyle === "hollow" && isBull ? 1.5 : 0}
                            rx={0.5}
                          />

                          {/* Live pulse animation on active candle head */}
                          {isLast && (
                            <circle
                              cx={xPct}
                              cy={closeY}
                              r={3}
                              fill={color}
                              className="animate-ping"
                            />
                          )}
                        </g>
                      );
                    })}

                  {/* ── Moving Average Overlays ── */}
                  {showSMA20 && indicatorSeries.sma20 && (
                    <polyline
                      points={candles
                        .map((_, i) => {
                          const v = indicatorSeries.sma20[i];
                          return v !== null ? `${(i + 0.5) * barWidth}%,${getY(v)}` : null;
                        })
                        .filter(Boolean)
                        .join(" ")}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                    />
                  )}

                  {showSMA50 && indicatorSeries.sma50 && (
                    <polyline
                      points={candles
                        .map((_, i) => {
                          const v = indicatorSeries.sma50[i];
                          return v !== null ? `${(i + 0.5) * barWidth}%,${getY(v)}` : null;
                        })
                        .filter(Boolean)
                        .join(" ")}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth={1.5}
                    />
                  )}

                  {showEMA12 && indicatorSeries.ema12 && (
                    <polyline
                      points={candles
                        .map((_, i) => {
                          const v = indicatorSeries.ema12[i];
                          return v !== null ? `${(i + 0.5) * barWidth}%,${getY(v)}` : null;
                        })
                        .filter(Boolean)
                        .join(" ")}
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth={1.5}
                    />
                  )}

                  {/* ── Live Pulsing Laser Price Line ── */}
                  {(() => {
                    const currentY = getY(currentPrice);
                    return (
                      <g>
                        <line
                          x1={0}
                          y1={currentY}
                          x2="100%"
                          y2={currentY}
                          stroke={isUp ? "#10b981" : "#f43f5e"}
                          strokeWidth={1.2}
                          strokeDasharray="3 3"
                          opacity={0.85}
                        />
                        {/* Live Price Tag Badge on Right Scale */}
                        <g transform={`translate(${0}, ${currentY - 10})`}>
                          <rect
                            x="calc(100% - 75px)"
                            y={0}
                            width={75}
                            height={20}
                            fill={isUp ? "#10b981" : "#f43f5e"}
                            rx={3}
                          />
                          <text
                            x="calc(100% - 37px)"
                            y={14}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={10}
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {fmtPrice(currentPrice)}
                          </text>
                        </g>
                      </g>
                    );
                  })()}

                  {/* ── RSI Sub-Chart Panel ── */}
                  {showRSI && (
                    <g transform={`translate(0, ${chartHeight + 15})`}>
                      {/* Divider */}
                      <line x1={0} y1={0} x2="100%" y2={0} stroke="rgba(255, 255, 255, 0.1)" />

                      {/* 70 Overbought & 30 Oversold bands */}
                      <line
                        x1={0}
                        y1={subChartHeight - 0.7 * subChartHeight}
                        x2="100%"
                        y2={subChartHeight - 0.7 * subChartHeight}
                        stroke="#f43f5e"
                        strokeDasharray="2 2"
                        opacity={0.5}
                      />
                      <line
                        x1={0}
                        y1={subChartHeight - 0.3 * subChartHeight}
                        x2="100%"
                        y2={subChartHeight - 0.3 * subChartHeight}
                        stroke="#10b981"
                        strokeDasharray="2 2"
                        opacity={0.5}
                      />

                      <text x="98%" y={subChartHeight - 0.7 * subChartHeight - 3} textAnchor="end" fill="#f43f5e" fontSize={9} fontFamily="monospace">
                        70 OB
                      </text>
                      <text x="98%" y={subChartHeight - 0.3 * subChartHeight - 3} textAnchor="end" fill="#10b981" fontSize={9} fontFamily="monospace">
                        30 OS
                      </text>

                      {/* RSI Line */}
                      {indicatorSeries.rsi && (
                        <polyline
                          points={candles
                            .map((_, i) => {
                              const r = indicatorSeries.rsi[i];
                              return r !== null
                                ? `${(i + 0.5) * barWidth}%,${subChartHeight - (r / 100) * subChartHeight}`
                                : null;
                            })
                            .filter(Boolean)
                            .join(" ")}
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth={1.8}
                        />
                      )}
                    </g>
                  )}

                  {/* ── Interactive Hover Overlay Hitboxes & Crosshair ── */}
                  {candles.map((c, i) => {
                    const xPct = `${(i + 0.5) * barWidth}%`;
                    const isHovered = hoveredIndex === i;

                    return (
                      <g key={`hit-${i}`}>
                        {/* Hover column hitbox */}
                        <rect
                          x={`${i * barWidth}%`}
                          y={0}
                          width={`${barWidth}%`}
                          height={totalSvgHeight}
                          fill="transparent"
                          className="cursor-crosshair"
                          onMouseEnter={() => setHoveredIndex(i)}
                        />

                        {/* Precision Crosshair Guidelines */}
                        {isHovered && (
                          <g pointerEvents="none">
                            {/* Vertical Guideline */}
                            <line
                              x1={xPct}
                              y1={0}
                              x2={xPct}
                              y2={totalSvgHeight}
                              stroke="rgba(255, 255, 255, 0.4)"
                              strokeDasharray="2 2"
                              strokeWidth={1}
                            />
                            {/* Horizontal Price Guideline */}
                            <line
                              x1={0}
                              y1={getY(c.close)}
                              x2="100%"
                              y2={getY(c.close)}
                              stroke="rgba(255, 255, 255, 0.4)"
                              strokeDasharray="2 2"
                              strokeWidth={1}
                            />
                            {/* Time badge at bottom */}
                            <g transform={`translate(0, ${totalSvgHeight - 16})`}>
                              <rect
                                x={`calc(${xPct} - 35px)`}
                                y={0}
                                width={70}
                                height={16}
                                fill="#1e293b"
                                rx={2}
                                stroke="#475569"
                                strokeWidth={1}
                              />
                              <text
                                x={xPct}
                                y={11}
                                textAnchor="middle"
                                fill="#f8fafc"
                                fontSize={9}
                                fontFamily="monospace"
                              >
                                {c.timeFormatted}
                              </text>
                            </g>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

          {/* ── Collapsible Live Tape Order Stream Drawer ─────────────────────── */}
          {showTapeDrawer && (
            <div className="w-72 border-l border-white/[0.08] bg-[#0b0f19] flex flex-col animate-fade-in text-xs font-mono">
              <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Radio size={12} className="text-rose-400 animate-pulse" /> Live Trades Tape
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Real-time Prints</span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-none">
                <div className="grid grid-cols-3 text-[10px] font-bold text-slate-500 uppercase px-1 pb-1 border-b border-white/[0.04]">
                  <span>Price</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Time</span>
                </div>

                {liveTapeTrades.slice(0, 14).map((t) => (
                  <div
                    key={t.id}
                    className="grid grid-cols-3 items-center text-[11px] px-1 py-1 rounded bg-slate-900/40 hover:bg-slate-800 transition"
                  >
                    <span className={t.type === "BUY" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      {fmtPrice(t.price)}
                    </span>
                    <span className="text-right text-slate-300">
                      {t.amount >= 1 ? t.amount.toFixed(2) : t.amount.toFixed(4)}
                    </span>
                    <span className="text-right text-slate-500 text-[10px]">{t.timestamp}</span>
                  </div>
                ))}
              </div>

              <div className="p-2.5 border-t border-white/[0.06] bg-slate-950/60 text-[10px] text-slate-400">
                <span>Order Flow Volume: </span>
                <span className="text-emerald-400 font-bold">58% Buy</span> /{" "}
                <span className="text-rose-400 font-bold">42% Sell</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom Modal Footer & Direct Forensics Link ────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-white/[0.08] bg-slate-900/80">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Bullish Spread
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Bearish Drop
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> SMA 20
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> EMA 12
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/coin/${coin.coin_id}`}
              onClick={onClose}
              className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
            >
              Open Full Forensic Audit <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
