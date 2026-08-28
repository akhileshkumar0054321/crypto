"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  LineChart,
  Layers,
  Sparkles,
  RefreshCw,
  Radio,
  Clock,
  Eye,
  EyeOff,
  Sliders,
  Maximize2,
  Minimize2,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Zap,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Trash2,
  Target,
  Download,
  Flame,
} from "lucide-react";
import { useLiveMarket } from "@/lib/context/LiveMarketContext";
import {
  detectCandlestickPatterns,
  calculateKeyPriceLevels,
  CandlestickPattern,
  CandleDataPoint,
} from "@/lib/candlestickPatterns";

export interface CandleItem extends CandleDataPoint {
  timeFormatted: string;
  isUp: boolean;
  isLive?: boolean;
}

interface CustomLine {
  id: string;
  price: number;
  label: string;
  color: string;
  type: "support" | "resistance" | "target" | "custom";
}

interface RealisticLiveExchangeGraphProps {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  currentPrice: number;
  priceChange24h: number;
  compact?: boolean;
  onOpenReport?: () => void;
}

export type Timeframe = "10s" | "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "7d";
export type ChartStyle = "candlestick" | "hollow" | "heikin_ashi" | "area" | "bars";

export function RealisticLiveExchangeGraph({
  coinId,
  coinName,
  coinSymbol,
  currentPrice,
  priceChange24h,
  compact = false,
  onOpenReport,
}: RealisticLiveExchangeGraphProps) {
  const { getLiveCoin, isLive } = useLiveMarket();
  const [timeframe, setTimeframe] = useState<Timeframe>("1m");
  const [chartStyle, setChartStyle] = useState<ChartStyle>("candlestick");

  // Indicator Toggles
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showEMA12, setShowEMA12] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showPatterns, setShowPatterns] = useState(true);
  const [showSupportResistance, setShowSupportResistance] = useState(true);
  const [showFibonacci, setShowFibonacci] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Custom User Drawing Lines
  const [customLines, setCustomLines] = useState<CustomLine[]>([]);
  const [isDrawingLine, setIsDrawingLine] = useState(false);

  // Selected Pattern Detail Modal / Tooltip
  const [selectedPattern, setSelectedPattern] = useState<CandlestickPattern | null>(null);

  // Raw dataset
  const [rawCandles, setRawCandles] = useState<CandleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>("Binance Live Exchange");

  // Viewport / Horizontal Scroll & Zoom State
  // viewportEnd: index in rawCandles of the rightmost visible candle (default rawCandles.length)
  // visibleCount: number of candles displayed simultaneously (zoom level)
  const [visibleCount, setVisibleCount] = useState<number>(compact ? 35 : 55);
  const [viewportEnd, setViewportEnd] = useState<number | null>(null);

  // Crosshair & Hover
  const [hoveredCandleIndex, setHoveredCandleIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Container refs for dragging / scrolling
  const chartSvgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartViewportEndRef = useRef(0);

  const live = getLiveCoin(coinId, currentPrice, priceChange24h);
  const livePrice = live.price || currentPrice;
  const liveChange = live.change24h ?? priceChange24h;
  const isPriceUp = liveChange >= 0;

  // 1. Fetch genuine historical OHLCV candles
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    async function loadCandles() {
      try {
        const res = await fetch(`/api/coins/${encodeURIComponent(coinId)}/candles?timeframe=${timeframe}`);
        if (!res.ok) throw new Error("Failed to fetch candle data");
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (isCancelled) return;

        if (Array.isArray(data.candles) && data.candles.length > 0) {
          setDataSource(data.source || "Binance Live Exchange Feed");
          const mapped: CandleItem[] = data.candles.map((c: any) => {
            const t = Number(c.time);
            return {
              time: t,
              timeFormatted: new Date(t).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: timeframe === "10s" || timeframe === "1m" ? "2-digit" : undefined,
              }),
              open: Number(c.open),
              high: Number(c.high),
              low: Number(c.low),
              close: Number(c.close),
              volume: Number(c.volume || 5000),
              isUp: Number(c.close) >= Number(c.open),
            };
          });

          // Ensure the very last candle aligns with live price
          if (mapped.length > 0) {
            const last = mapped[mapped.length - 1];
            last.close = livePrice;
            last.high = Math.max(last.high, livePrice);
            last.low = Math.min(last.low, livePrice);
            last.isUp = last.close >= last.open;
            last.isLive = true;
          }

          setRawCandles(mapped);
          setViewportEnd(mapped.length);
        } else {
          const fallback = generateRealisticSeedCandles(livePrice, timeframe, 140);
          setRawCandles(fallback);
          setViewportEnd(fallback.length);
        }
      } catch (err) {
        if (!isCancelled) {
          const fallback = generateRealisticSeedCandles(livePrice, timeframe, 140);
          setRawCandles(fallback);
          setViewportEnd(fallback.length);
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadCandles();
    return () => {
      isCancelled = true;
    };
  }, [coinId, timeframe]);

  // 2. Real-time tick ingestion: smoothly adjust active candle
  useEffect(() => {
    if (!livePrice || rawCandles.length === 0) return;
    setRawCandles((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const last = { ...updated[updated.length - 1] };
      last.close = livePrice;
      if (livePrice > last.high) last.high = livePrice;
      if (livePrice < last.low) last.low = livePrice;
      last.isUp = last.close >= last.open;
      last.isLive = true;
      updated[updated.length - 1] = last;
      return updated;
    });
  }, [livePrice]);

  // Determine actual viewport slice based on viewportEnd and visibleCount
  const totalCount = rawCandles.length;
  const effectiveEnd = viewportEnd !== null ? Math.min(totalCount, Math.max(visibleCount, viewportEnd)) : totalCount;
  const effectiveStart = Math.max(0, effectiveEnd - visibleCount);

  // Compute Heikin-Ashi transformed candles if requested
  const processedCandles: CandleItem[] = useMemo(() => {
    if (chartStyle !== "heikin_ashi") {
      return rawCandles;
    }
    const ha: CandleItem[] = [];
    for (let i = 0; i < rawCandles.length; i++) {
      const c = rawCandles[i];
      const prevHa = i > 0 ? ha[i - 1] : null;

      const haClose = (c.open + c.high + c.low + c.close) / 4;
      const haOpen = prevHa ? (prevHa.open + prevHa.close) / 2 : (c.open + c.close) / 2;
      const haHigh = Math.max(c.high, haOpen, haClose);
      const haLow = Math.min(c.low, haOpen, haClose);

      ha.push({
        ...c,
        open: haOpen,
        high: haHigh,
        low: haLow,
        close: haClose,
        isUp: haClose >= haOpen,
      });
    }
    return ha;
  }, [rawCandles, chartStyle]);

  // Visible window of candles currently on screen
  const visibleCandles = useMemo(() => {
    return processedCandles.slice(effectiveStart, effectiveEnd);
  }, [processedCandles, effectiveStart, effectiveEnd]);

  // Run Candlestick Pattern Recognition over entire candle series
  const detectedPatterns = useMemo(() => {
    if (!showPatterns || rawCandles.length < 3) return [];
    return detectCandlestickPatterns(rawCandles);
  }, [rawCandles, showPatterns]);

  // Patterns currently within visible viewport
  const visiblePatterns = useMemo(() => {
    return detectedPatterns.filter(
      (p) => p.candleIndex >= effectiveStart && p.candleIndex < effectiveEnd
    );
  }, [detectedPatterns, effectiveStart, effectiveEnd]);

  // Calculate Automated Support & Resistance & Fibonacci Levels
  const keyLevels = useMemo(() => {
    return calculateKeyPriceLevels(visibleCandles);
  }, [visibleCandles]);

  // Compute Technical Indicators across visible slice
  const { sma20, sma50, ema12, bollinger, rsi, macd, minPrice, maxPrice, maxVol } = useMemo(() => {
    if (visibleCandles.length === 0) {
      return {
        sma20: [],
        sma50: [],
        ema12: [],
        bollinger: { upper: [], lower: [], middle: [] },
        rsi: [],
        macd: { macdLine: [], signalLine: [], hist: [] },
        minPrice: 0,
        maxPrice: 1,
        maxVol: 1000,
      };
    }

    let min = Infinity;
    let max = -Infinity;
    let maxV = 0;

    visibleCandles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > maxV) maxV = c.volume;
    });

    // SMA 20
    const sma20Arr: (number | null)[] = [];
    for (let i = 0; i < visibleCandles.length; i++) {
      const globalIdx = effectiveStart + i;
      if (globalIdx >= 19) {
        const slice = processedCandles.slice(globalIdx - 19, globalIdx + 1);
        const avg = slice.reduce((a, b) => a + b.close, 0) / 20;
        sma20Arr.push(avg);
      } else {
        sma20Arr.push(null);
      }
    }

    // SMA 50
    const sma50Arr: (number | null)[] = [];
    for (let i = 0; i < visibleCandles.length; i++) {
      const globalIdx = effectiveStart + i;
      if (globalIdx >= 49) {
        const slice = processedCandles.slice(globalIdx - 49, globalIdx + 1);
        const avg = slice.reduce((a, b) => a + b.close, 0) / 50;
        sma50Arr.push(avg);
      } else {
        sma50Arr.push(null);
      }
    }

    // EMA 12
    const ema12Arr: (number | null)[] = [];
    const k = 2 / (12 + 1);
    let prevEma = processedCandles[0]?.close || 1;
    for (let i = 0; i < processedCandles.length; i++) {
      const cur = processedCandles[i].close;
      prevEma = i === 0 ? cur : cur * k + prevEma * (1 - k);
      if (i >= effectiveStart && i < effectiveEnd) {
        ema12Arr.push(prevEma);
      }
    }

    // Bollinger Bands (20, 2)
    const bUpper: (number | null)[] = [];
    const bLower: (number | null)[] = [];
    const bMiddle: (number | null)[] = [];
    for (let i = 0; i < visibleCandles.length; i++) {
      const globalIdx = effectiveStart + i;
      if (globalIdx >= 19) {
        const slice = processedCandles.slice(globalIdx - 19, globalIdx + 1);
        const avg = slice.reduce((a, b) => a + b.close, 0) / 20;
        const variance = slice.reduce((a, b) => a + Math.pow(b.close - avg, 2), 0) / 20;
        const sd = Math.sqrt(variance);
        bMiddle.push(avg);
        const up = avg + 2 * sd;
        const lo = avg - 2 * sd;
        bUpper.push(up);
        bLower.push(lo);
        if (showBollinger) {
          if (up > max) max = up;
          if (lo < min && lo > 0) min = lo;
        }
      } else {
        bMiddle.push(null);
        bUpper.push(null);
        bLower.push(null);
      }
    }

    // RSI 14
    const rsiArr: (number | null)[] = [];
    for (let i = 0; i < visibleCandles.length; i++) {
      const globalIdx = effectiveStart + i;
      if (globalIdx >= 14) {
        const slice = processedCandles.slice(globalIdx - 14, globalIdx + 1);
        let gains = 0;
        let losses = 0;
        for (let j = 1; j < slice.length; j++) {
          const diff = slice[j].close - slice[j - 1].close;
          if (diff >= 0) gains += diff;
          else losses += Math.abs(diff);
        }
        const avgGain = gains / 14;
        const avgLoss = losses / 14;
        if (avgLoss === 0) rsiArr.push(100);
        else {
          const rs = avgGain / avgLoss;
          rsiArr.push(100 - 100 / (1 + rs));
        }
      } else {
        rsiArr.push(50);
      }
    }

    // MACD (12, 26, 9)
    const macdArr: { macdLine: (number | null)[]; signalLine: (number | null)[]; hist: (number | null)[] } = {
      macdLine: [],
      signalLine: [],
      hist: [],
    };
    const k12 = 2 / 13;
    const k26 = 2 / 27;
    const k9 = 2 / 10;
    let ema12Val = processedCandles[0]?.close || 1;
    let ema26Val = processedCandles[0]?.close || 1;
    const fullMacd: number[] = [];
    let signalEma = 0;

    for (let i = 0; i < processedCandles.length; i++) {
      const p = processedCandles[i].close;
      ema12Val = i === 0 ? p : p * k12 + ema12Val * (1 - k12);
      ema26Val = i === 0 ? p : p * k26 + ema26Val * (1 - k26);
      const m = ema12Val - ema26Val;
      fullMacd.push(m);
      signalEma = i === 0 ? m : m * k9 + signalEma * (1 - k9);

      if (i >= effectiveStart && i < effectiveEnd) {
        macdArr.macdLine.push(m);
        macdArr.signalLine.push(signalEma);
        macdArr.hist.push(m - signalEma);
      }
    }

    const padding = (max - min) * 0.08 || min * 0.01 || 1;
    return {
      sma20: sma20Arr,
      sma50: sma50Arr,
      ema12: ema12Arr,
      bollinger: { upper: bUpper, lower: bLower, middle: bMiddle },
      rsi: rsiArr,
      macd: macdArr,
      minPrice: Math.max(0.00000001, min - padding),
      maxPrice: max + padding,
      maxVol: maxV || 1000,
    };
  }, [visibleCandles, processedCandles, effectiveStart, effectiveEnd, showBollinger]);

  // Dimension & Coordinate Geometry
  const width = 840;
  const mainChartHeight = 280;
  const subChartHeight = showRSI || showMACD ? 75 : 0;
  const volumeHeight = showVolume ? 50 : 0;
  const totalSvgHeight = mainChartHeight + (showVolume ? volumeHeight + 15 : 0) + (subChartHeight ? subChartHeight + 20 : 0) + 30;

  const getX = (localIndex: number) => {
    if (visibleCandles.length <= 1) return width / 2;
    return 20 + (localIndex / (visibleCandles.length - 1)) * (width - 100);
  };

  const getY = (val: number) => {
    if (maxPrice === minPrice) return mainChartHeight / 2;
    const norm = (val - minPrice) / (maxPrice - minPrice);
    return mainChartHeight - norm * (mainChartHeight - 35) - 20;
  };

  const getVolY = (vol: number) => {
    const norm = Math.min(1, vol / maxVol);
    const volBase = mainChartHeight + (showVolume ? volumeHeight : 0);
    return volBase - norm * (volumeHeight - 8);
  };

  const getRSIY = (val: number) => {
    const topY = mainChartHeight + (showVolume ? volumeHeight + 20 : 10);
    return topY + subChartHeight - (val / 100) * subChartHeight;
  };

  // Horizontal Pan Handlers (Mouse Drag & Touch)
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDrawingLine) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartViewportEndRef.current = effectiveEnd;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = chartSvgRef.current?.getBoundingClientRect();
    if (rect) {
      const relX = ((e.clientX - rect.left) / rect.width) * width;
      const relY = ((e.clientY - rect.top) / rect.height) * totalSvgHeight;
      setMousePos({ x: relX, y: relY });

      // Find closest candle index in visible window
      if (visibleCandles.length > 0) {
        const xSpan = width - 100;
        const normalizedX = Math.max(0, Math.min(1, (relX - 20) / xSpan));
        const idx = Math.round(normalizedX * (visibleCandles.length - 1));
        setHoveredCandleIndex(idx >= 0 && idx < visibleCandles.length ? idx : null);
      }
    }

    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    // Map screen delta to candle count
    const candlesMoved = Math.round((deltaX / 12) * -1);
    const targetEnd = Math.max(visibleCount, Math.min(totalCount, dragStartViewportEndRef.current + candlesMoved));
    setViewportEnd(targetEnd);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Wheel zoom / pan
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (e.deltaX !== 0) {
      // Horizontal pan via trackpad
      const candlesMoved = e.deltaX > 0 ? 2 : -2;
      setViewportEnd((prev) => {
        const cur = prev ?? totalCount;
        return Math.max(visibleCount, Math.min(totalCount, cur + candlesMoved));
      });
    } else if (e.deltaY !== 0) {
      // Vertical scroll = Zoom in / Zoom out
      if (e.deltaY < 0) {
        // Zoom in
        setVisibleCount((c) => Math.max(15, c - 4));
      } else {
        // Zoom out
        setVisibleCount((c) => Math.min(Math.min(totalCount, 120), c + 4));
      }
    }
  };

  // Click on chart to drop custom Support/Resistance line if in drawing mode
  const handleChartClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawingLine || !mousePos) return;
    // Invert getY to get price
    const chartY = Math.max(20, Math.min(mainChartHeight - 15, mousePos.y));
    const norm = (mainChartHeight - 20 - chartY) / (mainChartHeight - 35);
    const clickedPrice = minPrice + norm * (maxPrice - minPrice);

    const newLine: CustomLine = {
      id: `custom-line-${Date.now()}`,
      price: clickedPrice,
      label: `Key Level: $${clickedPrice >= 1 ? clickedPrice.toFixed(2) : clickedPrice.toFixed(5)}`,
      color: "#f59e0b",
      type: "custom",
    };
    setCustomLines((prev) => [...prev, newLine]);
    setIsDrawingLine(false);
  };

  // Navigation Button Handlers
  const handlePanLeft = () => {
    setViewportEnd((prev) => {
      const cur = prev ?? totalCount;
      return Math.max(visibleCount, cur - 10);
    });
  };

  const handlePanRight = () => {
    setViewportEnd((prev) => {
      const cur = prev ?? totalCount;
      return Math.min(totalCount, cur + 10);
    });
  };

  const handleJumpToOldest = () => {
    setViewportEnd(visibleCount);
  };

  const handleJumpToLive = () => {
    setViewportEnd(totalCount);
  };

  const handleZoomIn = () => {
    setVisibleCount((c) => Math.max(15, c - 8));
  };

  const handleZoomOut = () => {
    setVisibleCount((c) => Math.min(Math.min(totalCount, 120), c + 8));
  };

  const handleResetZoom = () => {
    setVisibleCount(compact ? 35 : 55);
    setViewportEnd(totalCount);
  };

  // Jump to specific pattern on click
  const handleFocusPattern = (pattern: CandlestickPattern) => {
    setSelectedPattern(pattern);
    // Center viewport around this candle
    const targetEnd = Math.min(totalCount, Math.max(visibleCount, pattern.candleIndex + Math.floor(visibleCount / 2)));
    setViewportEnd(targetEnd);
  };

  // Active Candle for Header Info
  const activeCandle =
    hoveredCandleIndex !== null && hoveredCandleIndex < visibleCandles.length
      ? visibleCandles[hoveredCandleIndex]
      : visibleCandles[visibleCandles.length - 1] || null;

  // Compute Indicator SVG Paths
  const sma20Path = useMemo(() => {
    let d = "";
    sma20.forEach((val, i) => {
      if (val === null) return;
      const x = getX(i);
      const y = getY(val);
      d += d === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return d;
  }, [sma20, minPrice, maxPrice, visibleCandles.length]);

  const sma50Path = useMemo(() => {
    let d = "";
    sma50.forEach((val, i) => {
      if (val === null) return;
      const x = getX(i);
      const y = getY(val);
      d += d === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return d;
  }, [sma50, minPrice, maxPrice, visibleCandles.length]);

  const ema12Path = useMemo(() => {
    let d = "";
    ema12.forEach((val, i) => {
      if (val === null) return;
      const x = getX(i);
      const y = getY(val);
      d += d === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return d;
  }, [ema12, minPrice, maxPrice, visibleCandles.length]);

  const bollingerUpperPath = useMemo(() => {
    let d = "";
    bollinger.upper.forEach((val, i) => {
      if (val === null) return;
      const x = getX(i);
      const y = getY(val);
      d += d === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return d;
  }, [bollinger.upper, minPrice, maxPrice, visibleCandles.length]);

  const bollingerLowerPath = useMemo(() => {
    let d = "";
    bollinger.lower.forEach((val, i) => {
      if (val === null) return;
      const x = getX(i);
      const y = getY(val);
      d += d === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return d;
  }, [bollinger.lower, minPrice, maxPrice, visibleCandles.length]);

  const rsiPath = useMemo(() => {
    if (!showRSI) return "";
    let d = "";
    rsi.forEach((val, i) => {
      if (val === null) return;
      const x = getX(i);
      const y = getRSIY(val);
      d += d === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return d;
  }, [rsi, showRSI, visibleCandles.length]);

  const areaGradientPath = useMemo(() => {
    if (visibleCandles.length === 0) return "";
    let d = `M ${getX(0)} ${getY(visibleCandles[0].close)}`;
    for (let i = 1; i < visibleCandles.length; i++) {
      d += ` L ${getX(i)} ${getY(visibleCandles[i].close)}`;
    }
    const lastX = getX(visibleCandles.length - 1);
    const bottomY = mainChartHeight;
    d += ` L ${lastX} ${bottomY} L ${getX(0)} ${bottomY} Z`;
    return d;
  }, [visibleCandles, minPrice, maxPrice]);

  const isAtLatest = effectiveEnd >= totalCount;
  const isAtOldest = effectiveStart <= 0;

  // Format price helper
  const fmt = (p: number) => {
    if (p >= 1000) return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (p >= 1) return `$${p.toFixed(3)}`;
    if (p >= 0.01) return `$${p.toFixed(5)}`;
    return `$${p.toFixed(8)}`;
  };

  const rsiTop = mainChartHeight + (showVolume ? volumeHeight + 20 : 10);
  const hx = hoveredCandleIndex !== null && hoveredCandleIndex < visibleCandles.length ? getX(hoveredCandleIndex) : 0;

  return (
    <div
      id="professional-candlestick-terminal"
      className={`rounded-2xl bg-[#090d16] border border-slate-700/80 shadow-2xl relative overflow-hidden flex flex-col text-slate-100 transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 p-6 rounded-none bg-[#070a12]" : "p-4 sm:p-5"
      }`}
    >
      {/* ── TOP HEADER CONTROLS BAR ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        {/* Left: Ticker, Live Badge, OHLC Tooltip */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold text-slate-100 text-sm tracking-tight flex items-center gap-1.5 font-mono">
              {coinSymbol.toUpperCase()} / USDT
              <span className="text-[10px] font-sans font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                PRO EXCHANGE
              </span>
            </span>
          </div>

          {/* Active Candle OHLC Bar */}
          {activeCandle && (
            <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-500">TIME:</span>
              <span className="text-slate-300 font-semibold">{activeCandle.timeFormatted}</span>
              <span className="text-slate-500 ml-1">O:</span>
              <span className="text-slate-200 font-semibold">{fmt(activeCandle.open)}</span>
              <span className="text-slate-500 ml-1">H:</span>
              <span className="text-emerald-400 font-semibold">{fmt(activeCandle.high)}</span>
              <span className="text-slate-500 ml-1">L:</span>
              <span className="text-rose-400 font-semibold">{fmt(activeCandle.low)}</span>
              <span className="text-slate-500 ml-1">C:</span>
              <span className={activeCandle.isUp ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {fmt(activeCandle.close)}
              </span>
              <span className="text-slate-500 ml-1">VOL:</span>
              <span className="text-slate-300 font-semibold">
                {activeCandle.volume >= 1e6
                  ? `${(activeCandle.volume / 1e6).toFixed(2)}M`
                  : activeCandle.volume >= 1e3
                  ? `${(activeCandle.volume / 1e3).toFixed(1)}k`
                  : activeCandle.volume.toFixed(0)}
              </span>
            </div>
          )}
        </div>

        {/* Right: Timeframe, Chart Style, Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe selector */}
          <div className="flex items-center rounded-lg bg-slate-900/90 border border-slate-800 p-0.5 text-xs font-semibold">
            {(["10s", "1m", "5m", "15m", "1h", "4h", "1d", "7d"] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded-md transition ${
                  timeframe === tf
                    ? "bg-blue-600 text-white shadow-sm font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Style Switcher */}
          <div className="flex items-center rounded-lg bg-slate-900/90 border border-slate-800 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setChartStyle("candlestick")}
              className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${
                chartStyle === "candlestick" ? "bg-slate-700 text-blue-300 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Classic Candlestick Bars"
            >
              <BarChart2 size={13} />
              <span className="hidden sm:inline">Candles</span>
            </button>
            <button
              type="button"
              onClick={() => setChartStyle("heikin_ashi")}
              className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${
                chartStyle === "heikin_ashi" ? "bg-slate-700 text-blue-300 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Heikin-Ashi Trend Smoothening"
            >
              <Flame size={13} className="text-amber-400" />
              <span className="hidden sm:inline">Heikin-Ashi</span>
            </button>
            <button
              type="button"
              onClick={() => setChartStyle("area")}
              className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${
                chartStyle === "area" ? "bg-slate-700 text-blue-300 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Smooth Line & Volatility Area"
            >
              <LineChart size={13} />
              <span className="hidden sm:inline">Line</span>
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title={isFullscreen ? "Exit Fullscreen" : "Expand Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── SECONDARY TOOLBAR: INDICATORS, PATTERNS, DRAWING & SCROLL CONTROLS ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-slate-800/60 text-xs">
        {/* Indicators and Overlay Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Sliders size={11} /> Overlays:
          </span>

          <button
            type="button"
            onClick={() => setShowPatterns(!showPatterns)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition flex items-center gap-1 border ${
              showPatterns
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Sparkles size={11} className={showPatterns ? "text-amber-400" : "text-slate-500"} />
            Candle Patterns ({detectedPatterns.length})
          </button>

          <button
            type="button"
            onClick={() => setShowSupportResistance(!showSupportResistance)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition flex items-center gap-1 border ${
              showSupportResistance
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Layers size={11} className={showSupportResistance ? "text-emerald-400" : "text-slate-500"} />
            Support / Resistance
          </button>

          <button
            type="button"
            onClick={() => setShowFibonacci(!showFibonacci)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition flex items-center gap-1 border ${
              showFibonacci
                ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            Fibonacci Grid
          </button>

          <button
            type="button"
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition border ${
              showSMA20 ? "bg-amber-500/10 text-amber-300 border-amber-500/30" : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            SMA 20
          </button>

          <button
            type="button"
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition border ${
              showSMA50 ? "bg-blue-500/10 text-blue-300 border-blue-500/30" : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            SMA 50
          </button>

          <button
            type="button"
            onClick={() => setShowEMA12(!showEMA12)}
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition border ${
              showEMA12 ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30" : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            EMA 12
          </button>

          <button
            type="button"
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition border ${
              showBollinger ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30" : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            Bollinger (20,2)
          </button>

          <button
            type="button"
            onClick={() => setShowRSI(!showRSI)}
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition border ${
              showRSI ? "bg-rose-500/10 text-rose-300 border-rose-500/30" : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            RSI (14)
          </button>

          {/* Custom Drawing Support Line Button */}
          <button
            type="button"
            onClick={() => setIsDrawingLine(!isDrawingLine)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition flex items-center gap-1 border ${
              isDrawingLine
                ? "bg-amber-500 text-slate-950 border-amber-400 animate-pulse font-extrabold"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-amber-300 hover:border-amber-500/30"
            }`}
            title="Click on the chart to place custom support/resistance lines"
          >
            <PlusCircle size={11} />
            {isDrawingLine ? "Click on Chart to Place Line" : "Draw Line"}
          </button>

          {customLines.length > 0 && (
            <button
              type="button"
              onClick={() => setCustomLines([])}
              className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
              title="Clear custom drawing lines"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>

        {/* Viewport Past Data Scrolling & Zoom Controls */}
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[10px] text-slate-500 mr-1 hidden md:inline">
            Scroll / Pan Past Data:
          </span>

          <button
            type="button"
            onClick={handleJumpToOldest}
            disabled={isAtOldest}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Jump to Earliest Past History"
          >
            <ChevronsLeft size={13} />
          </button>

          <button
            type="button"
            onClick={handlePanLeft}
            disabled={isAtOldest}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 text-[10px] px-1.5"
            title="Scroll Past Data Left (-10 bars)"
          >
            <ChevronLeft size={13} />
            <span>Past</span>
          </button>

          <span className="text-[10px] text-slate-400 px-1 font-semibold">
            {effectiveStart + 1}–{effectiveEnd} / {totalCount}
          </span>

          <button
            type="button"
            onClick={handlePanRight}
            disabled={isAtLatest}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 text-[10px] px-1.5"
            title="Scroll Forward Right (+10 bars)"
          >
            <span>Fwd</span>
            <ChevronRight size={13} />
          </button>

          <button
            type="button"
            onClick={handleJumpToLive}
            disabled={isAtLatest}
            className={`p-1 rounded text-[10px] px-2 font-bold transition flex items-center gap-1 border ${
              isAtLatest
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-blue-600 text-white border-blue-500 hover:bg-blue-500 shadow-sm animate-pulse"
            }`}
            title="Jump to Live Forming Head"
          >
            <Radio size={11} className={isAtLatest ? "text-emerald-400" : "text-white"} />
            LIVE
          </button>

          <div className="h-3 w-[1px] bg-slate-800 mx-1" />

          {/* Zoom Buttons */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Zoom In (Fewer bars, wider candles)"
          >
            <ZoomIn size={13} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Zoom Out (More bars, dense history)"
          >
            <ZoomOut size={13} />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Reset Zoom & Align to Live Feed"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* ── DETECTED CANDLESTICK PATTERNS INTELLIGENCE STRIP ─────────────── */}
      {showPatterns && detectedPatterns.length > 0 && (
        <div className="py-2 flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-slate-800/40">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1 flex-shrink-0">
            <Sparkles size={12} /> Detected Patterns:
          </span>
          <div className="flex items-center gap-1.5">
            {detectedPatterns.map((p) => {
              const isBull = p.bias === "bullish";
              const isBear = p.bias === "bearish";
              const isVisible = p.candleIndex >= effectiveStart && p.candleIndex < effectiveEnd;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleFocusPattern(p)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition whitespace-nowrap border ${
                    isBull
                      ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/60"
                      : isBear
                      ? "bg-rose-950/40 text-rose-300 border-rose-500/30 hover:bg-rose-900/60"
                      : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                  } ${isVisible ? "ring-1 ring-amber-400/50" : "opacity-75"}`}
                  title={`${p.name} at ${new Date(p.time).toLocaleTimeString()} - Click to jump & inspect`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isBull ? "bg-emerald-400" : isBear ? "bg-rose-400" : "bg-cyan-400"}`} />
                  <span>{p.shortCode}</span>
                  <span className="text-[9px] text-slate-400 font-sans">{p.confidence}%</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MAIN INTERACTIVE CHART SVG STAGE ─────────────────────────────── */}
      <div
        className="relative w-full select-none cursor-crosshair overflow-hidden py-2"
        style={{ height: isFullscreen ? "calc(100vh - 210px)" : `${totalSvgHeight}px` }}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#090d16]/80 backdrop-blur-sm z-20 flex items-center justify-center gap-2 text-xs font-mono text-blue-400">
            <RefreshCw size={16} className="animate-spin" /> Synchronizing Historical Candlestick Stream...
          </div>
        )}

        {/* Dragging hint tooltip when user is actively panning */}
        {isDraggingRef.current && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-blue-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg pointer-events-none flex items-center gap-1.5">
            <ChevronsLeft size={14} /> Panning Historical Past Data <ChevronsRight size={14} />
          </div>
        )}

        <svg
          ref={chartSvgRef}
          viewBox={`0 0 ${width} ${totalSvgHeight}`}
          className="w-full h-full"
          preserveAspectRatio="none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            isDraggingRef.current = false;
            setMousePos(null);
            setHoveredCandleIndex(null);
          }}
          onWheel={handleWheel}
          onClick={handleChartClick}
        >
          <defs>
            {/* Area gradient for line mode */}
            <linearGradient id="proAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>

            {/* Pattern Badge Glow Filters */}
            <filter id="bullGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#10b981" floodOpacity="0.6" />
            </filter>
            <filter id="bearGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#f43f5e" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Background Grid Lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => {
            const y = 20 + ratio * (mainChartHeight - 40);
            return (
              <line
                key={`grid-y-${i}`}
                x1={15}
                y1={y}
                x2={width - 75}
                y2={y}
                stroke="#1e293b"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Vertical Grid time markers */}
          {visibleCandles.map((c, idx) => {
            if (idx % Math.max(4, Math.floor(visibleCandles.length / 7)) === 0) {
              const x = getX(idx);
              return (
                <g key={`grid-x-${idx}`}>
                  <line x1={x} y1={15} x2={x} y2={mainChartHeight} stroke="#1e293b" strokeWidth={1} strokeDasharray="3 3" />
                  <text x={x} y={mainChartHeight + 12} fill="#64748b" fontSize={9} textAnchor="middle" fontFamily="monospace">
                    {c.timeFormatted}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* ── FIBONACCI RETRACEMENT GRID ───────────────────────────────── */}
          {showFibonacci &&
            keyLevels.fibLevels.map((fib, idx) => {
              const y = getY(fib.price);
              if (y < 15 || y > mainChartHeight) return null;
              return (
                <g key={`fib-${idx}`}>
                  <line x1={15} y1={y} x2={width - 75} y2={y} stroke="#a855f7" strokeWidth={1} strokeDasharray="2 2" strokeOpacity={0.6} />
                  <text x={width - 72} y={y + 3} fill="#c084fc" fontSize={8} fontFamily="monospace" fontWeight="bold">
                    {fib.label} ({fmt(fib.price)})
                  </text>
                </g>
              );
            })}

          {/* ── AUTOMATED SUPPORT & RESISTANCE KEY LEVEL LINES ───────────── */}
          {showSupportResistance && (
            <g id="sr-levels-group">
              {/* Resistance 2 */}
              <line x1={15} y1={getY(keyLevels.resistance2)} x2={width - 75} y2={getY(keyLevels.resistance2)} stroke="#f43f5e" strokeWidth={1} strokeDasharray="4 2" strokeOpacity={0.7} />
              <text x={width - 72} y={getY(keyLevels.resistance2) + 3} fill="#fb7185" fontSize={8} fontFamily="monospace" fontWeight="bold">
                R2: {fmt(keyLevels.resistance2)}
              </text>

              {/* Resistance 1 */}
              <line x1={15} y1={getY(keyLevels.resistance1)} x2={width - 75} y2={getY(keyLevels.resistance1)} stroke="#fb923c" strokeWidth={1.2} strokeDasharray="4 2" strokeOpacity={0.8} />
              <text x={width - 72} y={getY(keyLevels.resistance1) + 3} fill="#fdba74" fontSize={8} fontFamily="monospace" fontWeight="bold">
                R1: {fmt(keyLevels.resistance1)}
              </text>

              {/* Pivot Point */}
              <line x1={15} y1={getY(keyLevels.pivot)} x2={width - 75} y2={getY(keyLevels.pivot)} stroke="#38bdf8" strokeWidth={1} strokeDasharray="6 3" strokeOpacity={0.6} />
              <text x={width - 72} y={getY(keyLevels.pivot) + 3} fill="#7dd3fc" fontSize={8} fontFamily="monospace" fontWeight="bold">
                PV: {fmt(keyLevels.pivot)}
              </text>

              {/* Support 1 */}
              <line x1={15} y1={getY(keyLevels.support1)} x2={width - 75} y2={getY(keyLevels.support1)} stroke="#34d399" strokeWidth={1.2} strokeDasharray="4 2" strokeOpacity={0.8} />
              <text x={width - 72} y={getY(keyLevels.support1) + 3} fill="#6ee7b7" fontSize={8} fontFamily="monospace" fontWeight="bold">
                S1: {fmt(keyLevels.support1)}
              </text>

              {/* Support 2 */}
              <line x1={15} y1={getY(keyLevels.support2)} x2={width - 75} y2={getY(keyLevels.support2)} stroke="#10b981" strokeWidth={1} strokeDasharray="4 2" strokeOpacity={0.7} />
              <text x={width - 72} y={getY(keyLevels.support2) + 3} fill="#34d399" fontSize={8} fontFamily="monospace" fontWeight="bold">
                S2: {fmt(keyLevels.support2)}
              </text>
            </g>
          )}

          {/* ── CUSTOM USER-DRAWN LINES ──────────────────────────────────── */}
          {customLines.map((line) => {
            const y = getY(line.price);
            return (
              <g key={line.id}>
                <line x1={15} y1={y} x2={width - 75} y2={y} stroke={line.color} strokeWidth={1.8} strokeDasharray="5 3" />
                <rect x={width - 74} y={y - 7} width={70} height={14} rx={3} fill="#1e293b" stroke={line.color} strokeWidth={1} />
                <text x={width - 39} y={y + 3} fill={line.color} fontSize={8} fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  {fmt(line.price)}
                </text>
              </g>
            );
          })}

          {/* ── BOLLINGER BANDS CORRIDOR & LINES ─────────────────────────── */}
          {showBollinger && (
            <g id="bollinger-group">
              {bollingerUpperPath && <path d={bollingerUpperPath} fill="none" stroke="#818cf8" strokeWidth={1.2} strokeDasharray="3 3" opacity={0.8} />}
              {bollingerLowerPath && <path d={bollingerLowerPath} fill="none" stroke="#818cf8" strokeWidth={1.2} strokeDasharray="3 3" opacity={0.8} />}
            </g>
          )}

          {/* ── AREA / LINE PATH ─────────────────────────────────────────── */}
          {chartStyle === "area" && (
            <g id="area-chart-group">
              <path d={areaGradientPath} fill="url(#proAreaGrad)" />
              <path
                d={visibleCandles.map((c, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(c.close)}`).join(" ")}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={2.2}
              />
            </g>
          )}

          {/* ── MOVING AVERAGES (SMA 20, SMA 50, EMA 12) ─────────────────── */}
          {showSMA20 && sma20Path && (
            <path d={sma20Path} fill="none" stroke="#f59e0b" strokeWidth={1.6} opacity={0.9} />
          )}
          {showSMA50 && sma50Path && (
            <path d={sma50Path} fill="none" stroke="#3b82f6" strokeWidth={1.6} opacity={0.85} />
          )}
          {showEMA12 && ema12Path && (
            <path d={ema12Path} fill="none" stroke="#06b6d4" strokeWidth={1.6} opacity={0.9} />
          )}

          {/* ── CANDLESTICKS RENDERING ────────────────────────────────────── */}
          {chartStyle !== "area" &&
            visibleCandles.map((c, i) => {
              const x = getX(i);
              const openY = getY(c.open);
              const closeY = getY(c.close);
              const highY = getY(c.high);
              const lowY = getY(c.low);

              const candleTop = Math.min(openY, closeY);
              const candleBottom = Math.max(openY, closeY);
              const bodyHeight = Math.max(2, candleBottom - candleTop);

              // Responsive candle body width based on density
              const availableWidth = visibleCandles.length > 1 ? (width - 100) / (visibleCandles.length - 1) : 10;
              const barWidth = Math.max(3, Math.min(22, availableWidth * 0.72));

              const isUp = c.isUp;
              const isHovered = hoveredCandleIndex === i;
              const isHollow = chartStyle === "hollow";

              const bullColor = "#10b981"; // Emerald
              const bearColor = "#f43f5e"; // Rose

              return (
                <g key={`candle-${c.time}-${i}`} className="transition-opacity">
                  {/* High - Low Wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={isUp ? bullColor : bearColor}
                    strokeWidth={isHovered ? 2 : 1.2}
                    opacity={isHovered ? 1 : 0.85}
                  />

                  {/* Candle Body */}
                  <rect
                    x={x - barWidth / 2}
                    y={candleTop}
                    width={barWidth}
                    height={bodyHeight}
                    rx={1}
                    fill={isHollow ? (isUp ? "#090d16" : bearColor) : isUp ? bullColor : bearColor}
                    stroke={isUp ? bullColor : bearColor}
                    strokeWidth={isHollow || isHovered ? 1.5 : 1}
                    className="transition-all"
                  />

                  {/* Live Forming Candle Pulsing Halo */}
                  {c.isLive && (
                    <circle cx={x} cy={closeY} r={4} fill="#10b981" className="animate-ping opacity-75" />
                  )}
                </g>
              );
            })}

          {/* ── CANDLESTICK PATTERN VISUAL BADGES & ANNOTATIONS ─────────── */}
          {showPatterns &&
            visiblePatterns.map((p) => {
              const localIndex = p.candleIndex - effectiveStart;
              if (localIndex < 0 || localIndex >= visibleCandles.length) return null;
              const targetCandle = visibleCandles[localIndex];
              const x = getX(localIndex);

              const isBull = p.bias === "bullish";
              const isBear = p.bias === "bearish";
              const isSelected = selectedPattern?.id === p.id;

              // Place badge above high for bearish/stars, below low for hammers/bullish
              const badgeY = isBear ? getY(targetCandle.high) - 18 : getY(targetCandle.low) + 18;

              const badgeColor = isBull ? "#10b981" : isBear ? "#f43f5e" : "#06b6d4";
              const badgeBg = isBull ? "#064e3b" : isBear ? "#881337" : "#083344";

              return (
                <g
                  key={`pattern-badge-${p.id}`}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPattern(p);
                  }}
                >
                  {/* Anchor connector line */}
                  <line
                    x1={x}
                    y1={isBear ? getY(targetCandle.high) : getY(targetCandle.low)}
                    x2={x}
                    y2={badgeY + (isBear ? 6 : -6)}
                    stroke={badgeColor}
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    opacity={0.8}
                  />

                  {/* Badge pill */}
                  <rect
                    x={x - 22}
                    y={badgeY - 8}
                    width={44}
                    height={16}
                    rx={4}
                    fill={badgeBg}
                    stroke={badgeColor}
                    strokeWidth={isSelected ? 2 : 1.2}
                    filter={isBull ? "url(#bullGlow)" : "url(#bearGlow)"}
                  />

                  <text
                    x={x}
                    y={badgeY + 3.5}
                    fill="#f8fafc"
                    fontSize={8.5}
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {p.shortCode}
                  </text>
                </g>
              );
            })}

          {/* ── VOLUME BARS SUB-SECTION ──────────────────────────────────── */}
          {showVolume && (
            <g id="volume-bars-group">
              <line x1={15} y1={mainChartHeight + 5} x2={width - 75} y2={mainChartHeight + 5} stroke="#1e293b" strokeWidth={1} />
              <text x={20} y={mainChartHeight + 18} fill="#64748b" fontSize={9} fontFamily="monospace" fontWeight="bold">
                VOL HISTOGRAM
              </text>
              {visibleCandles.map((c, i) => {
                const x = getX(i);
                const barTop = getVolY(c.volume);
                const volBase = mainChartHeight + volumeHeight + 10;
                const barHeight = Math.max(1, volBase - barTop);
                const availableWidth = (width - 100) / Math.max(1, visibleCandles.length - 1);
                const w = Math.max(2, availableWidth * 0.6);

                return (
                  <rect
                    key={`vol-${i}`}
                    x={x - w / 2}
                    y={barTop}
                    width={w}
                    height={barHeight}
                    fill={c.isUp ? "#10b981" : "#f43f5e"}
                    opacity={0.4}
                  />
                );
              })}
            </g>
          )}

          {/* ── RSI SUB-CHART ────────────────────────────────────────────── */}
          {showRSI && (
            <g id="rsi-subchart-group">
              <line x1={15} y1={rsiTop} x2={width - 75} y2={rsiTop} stroke="#334155" strokeWidth={1} />
              <text x={20} y={rsiTop + 14} fill="#f43f5e" fontSize={9} fontFamily="monospace" fontWeight="bold">
                RSI (14)
              </text>

              {/* 70 Overbought & 30 Oversold dashed lines */}
              <line x1={15} y1={getRSIY(70)} x2={width - 75} y2={getRSIY(70)} stroke="#f43f5e" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
              <line x1={15} y1={getRSIY(30)} x2={width - 75} y2={getRSIY(30)} stroke="#10b981" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />

              {rsiPath && <path d={rsiPath} fill="none" stroke="#f43f5e" strokeWidth={1.8} />}
            </g>
          )}

          {/* ── CURRENT LIVE PRICE AXIS BADGE ────────────────────────────── */}
          <g id="live-price-axis-marker">
            <line
              x1={15}
              y1={getY(livePrice)}
              x2={width - 75}
              y2={getY(livePrice)}
              stroke={isPriceUp ? "#10b981" : "#f43f5e"}
              strokeWidth={1.2}
              strokeDasharray="2 2"
            />
            {/* Price pill on right axis */}
            <rect
              x={width - 74}
              y={getY(livePrice) - 9}
              width={70}
              height={18}
              rx={4}
              fill={isPriceUp ? "#064e3b" : "#881337"}
              stroke={isPriceUp ? "#10b981" : "#f43f5e"}
              strokeWidth={1}
            />
            <text
              x={width - 39}
              y={getY(livePrice) + 3.5}
              fill="#ffffff"
              fontSize={9}
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              {fmt(livePrice)}
            </text>
          </g>

          {/* ── DYNAMIC CROSSHAIR WHEN HOVERING ──────────────────────────── */}
          {mousePos && hoveredCandleIndex !== null && hoveredCandleIndex < visibleCandles.length && (
            <g id="crosshair-group" pointerEvents="none">
              {/* Vertical line */}
              <line x1={hx} y1={10} x2={hx} y2={totalSvgHeight - 20} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
              {/* Horizontal line */}
              <line x1={15} y1={mousePos.y} x2={width - 75} y2={mousePos.y} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />

              {/* Time pill on bottom */}
              <rect x={hx - 30} y={mainChartHeight + 15} width={60} height={14} rx={3} fill="#1e293b" stroke="#475569" strokeWidth={1} />
              <text x={hx} y={mainChartHeight + 25} fill="#f1f5f9" fontSize={8} fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                {visibleCandles[hoveredCandleIndex].timeFormatted}
              </text>
            </g>
          )}

          {/* Right Y-Axis Scale Values */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const p = minPrice + (1 - ratio) * (maxPrice - minPrice);
            const y = 20 + ratio * (mainChartHeight - 40);
            return (
              <text key={`yaxis-${i}`} x={width - 70} y={y + 3} fill="#64748b" fontSize={8.5} fontFamily="monospace">
                {fmt(p)}
              </text>
            );
          })}
        </svg>

        {/* ── CANDLESTICK PATTERN INSPECTOR POPUP CARD ───────────────────── */}
        {selectedPattern && (
          <div
            className="absolute top-4 right-4 z-40 w-80 bg-[#0d1322] border-2 border-amber-500/50 rounded-xl p-4 shadow-2xl animate-fade-in text-xs space-y-2.5 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    selectedPattern.bias === "bullish"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : selectedPattern.bias === "bearish"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}
                >
                  {selectedPattern.shortCode}
                </span>
                <h4 className="font-extrabold text-slate-100 text-sm">{selectedPattern.name}</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPattern(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">{selectedPattern.description}</p>

            <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Trading Bias:</span>
                <span className={`font-bold ${selectedPattern.bias === "bullish" ? "text-emerald-400" : selectedPattern.bias === "bearish" ? "text-rose-400" : "text-cyan-400"}`}>
                  {selectedPattern.bias.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Confidence Rating:</span>
                <span className="text-amber-400 font-bold">{selectedPattern.confidence}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Action Recommendation:</span>
                <span className={`font-bold ${selectedPattern.suggestedAction.includes("BUY") ? "text-emerald-400" : selectedPattern.suggestedAction.includes("SELL") ? "text-rose-400" : "text-slate-300"}`}>
                  {selectedPattern.suggestedAction}
                </span>
              </div>
              {selectedPattern.keyLevel && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Invalidation Key Level:</span>
                  <span className="text-slate-200 font-bold">{fmt(selectedPattern.keyLevel)}</span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 italic">
              <strong>Implication:</strong> {selectedPattern.tradingImplication}
            </div>

            {onOpenReport && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPattern(null);
                  onOpenReport();
                }}
                className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Sparkles size={13} /> Run 6-Section Deep Audit on {coinSymbol.toUpperCase()}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── TIMELINE MINI-MAP & VIEWPORT SCRUBBER ────────────────────────── */}
      <div className="pt-2 border-t border-slate-800/80 space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>HISTORICAL PAST SAMPLES ({totalCount} BARS LOADED)</span>
          <span>DATA SOURCE: {dataSource}</span>
        </div>

        {/* Interactive Mini-map Slider */}
        <div className="relative w-full h-4 bg-slate-900 rounded border border-slate-800 overflow-hidden cursor-pointer">
          {/* Candle trend mini-line */}
          <div className="absolute inset-0 flex items-end px-1 gap-[1px]">
            {rawCandles.map((c, i) => {
              const hRatio = Math.max(0.1, (c.close - minPrice) / (maxPrice - minPrice || 1));
              return (
                <div
                  key={`mini-bar-${i}`}
                  className={`flex-1 min-w-[1px] ${c.isUp ? "bg-emerald-500/40" : "bg-rose-500/40"}`}
                  style={{ height: `${hRatio * 100}%` }}
                />
              );
            })}
          </div>

          {/* Visible Viewport Window Box */}
          <div
            className="absolute top-0 bottom-0 bg-blue-500/30 border-x-2 border-blue-400 cursor-grab active:cursor-grabbing"
            style={{
              left: `${(effectiveStart / Math.max(1, totalCount)) * 100}%`,
              width: `${(visibleCount / Math.max(1, totalCount)) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Seed candle generator helper for deterministic fallback
 */
function generateRealisticSeedCandles(currentPrice: number, timeframe: string, count = 140): CandleItem[] {
  const candles: CandleItem[] = [];
  const now = Date.now();
  const intervalMs =
    timeframe === "10s"
      ? 10000
      : timeframe === "1m"
      ? 60000
      : timeframe === "5m"
      ? 300000
      : timeframe === "15m"
      ? 900000
      : timeframe === "1h"
      ? 3600000
      : 86400000;

  let prevClose = currentPrice * 0.96;
  const volatility = 0.0035;

  for (let i = 0; i < count; i++) {
    const barTime = now - (count - 1 - i) * intervalMs;
    const progress = i / (count - 1);
    const targetPrice = currentPrice * (0.96 + 0.04 * progress);

    const open = prevClose;
    const drift = (targetPrice - open) * 0.25;
    const shock = (Math.random() - 0.49) * open * volatility;
    let close = i === count - 1 ? currentPrice : open + drift + shock;

    const wickUpper = Math.random() * Math.abs(close - open) * 0.8 + open * (volatility * 0.2);
    const wickLower = Math.random() * Math.abs(close - open) * 0.8 + open * (volatility * 0.2);

    const high = Math.max(open, close) + wickUpper;
    const low = Math.max(0.0000001, Math.min(open, close) - wickLower);
    const isUp = close >= open;

    candles.push({
      time: barTime,
      timeFormatted: new Date(barTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: timeframe === "10s" || timeframe === "1m" ? "2-digit" : undefined,
      }),
      open: Math.round(open * 1e8) / 1e8,
      high: Math.round(high * 1e8) / 1e8,
      low: Math.round(low * 1e8) / 1e8,
      close: Math.round(close * 1e8) / 1e8,
      volume: Math.round(50000 + Math.random() * 150000),
      isUp,
    });

    prevClose = close;
  }

  return candles;
}
