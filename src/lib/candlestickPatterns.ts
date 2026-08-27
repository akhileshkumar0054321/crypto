export interface CandleDataPoint {
  time: number;
  timeFormatted?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isUp?: boolean;
}

export type PatternBias = "bullish" | "bearish" | "neutral";

export interface CandlestickPattern {
  id: string;
  name: string;
  shortCode: string;
  bias: PatternBias;
  startIndex: number;
  endIndex: number;
  candleIndex: number; // The trigger/culmination candle
  time: number;
  price: number;
  confidence: number; // 0-100%
  description: string;
  tradingImplication: string;
  suggestedAction: "BUY / LONG" | "SELL / SHORT" | "WAIT / CONFIRM";
  keyLevel?: number;
}

/**
 * Scan an array of OHLCV candles and identify classic and modern candlestick patterns
 */
export function detectCandlestickPatterns(candles: CandleDataPoint[]): CandlestickPattern[] {
  if (!candles || candles.length < 3) return [];

  const patterns: CandlestickPattern[] = [];

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const prev1 = i > 0 ? candles[i - 1] : null;
    const prev2 = i > 1 ? candles[i - 2] : null;

    const body = Math.abs(c.close - c.open);
    const range = c.high - c.low || 0.000001;
    const bodyRatio = body / range;
    const upperWick = c.high - Math.max(c.open, c.close);
    const lowerWick = Math.min(c.open, c.close) - c.low;
    const isBullish = c.close >= c.open;

    // Prior trend heuristic (last 3-5 candles)
    const isPriorDowntrend = prev2 && prev1 ? prev1.close < prev2.open && prev1.close < prev2.close : false;
    const isPriorUptrend = prev2 && prev1 ? prev1.close > prev2.open && prev1.close > prev2.close : false;

    // 1. DOJI (Body <= 8% of total range)
    if (bodyRatio <= 0.08) {
      if (lowerWick >= range * 0.65 && upperWick <= range * 0.15) {
        // Dragonfly Doji (Bullish reversal signal)
        patterns.push({
          id: `dragonfly-doji-${i}`,
          name: "Dragonfly Doji",
          shortCode: "D-DOJI",
          bias: "bullish",
          startIndex: i,
          endIndex: i,
          candleIndex: i,
          time: c.time,
          price: c.close,
          confidence: 82,
          description: "Long lower shadow with open and close at session high. Strong rejection of lower prices.",
          tradingImplication: "Bullish price rejection at support. Potential upward reversal.",
          suggestedAction: "BUY / LONG",
          keyLevel: c.low,
        });
      } else if (upperWick >= range * 0.65 && lowerWick <= range * 0.15) {
        // Gravestone Doji (Bearish reversal signal)
        patterns.push({
          id: `gravestone-doji-${i}`,
          name: "Gravestone Doji",
          shortCode: "G-DOJI",
          bias: "bearish",
          startIndex: i,
          endIndex: i,
          candleIndex: i,
          time: c.time,
          price: c.close,
          confidence: 84,
          description: "Long upper shadow with open and close at session low. Rejection of higher price levels.",
          tradingImplication: "Bearish exhaustion after buying test. Potential downward pivot.",
          suggestedAction: "SELL / SHORT",
          keyLevel: c.high,
        });
      } else {
        // Standard / Long-Legged Doji
        patterns.push({
          id: `doji-${i}`,
          name: "Doji (Market Indecision)",
          shortCode: "DOJI",
          bias: "neutral",
          startIndex: i,
          endIndex: i,
          candleIndex: i,
          time: c.time,
          price: c.close,
          confidence: 70,
          description: "Open and close are nearly identical, reflecting an equilibrium battle between buyers and sellers.",
          tradingImplication: "Trend exhaustion point. Watch for breakout direction.",
          suggestedAction: "WAIT / CONFIRM",
          keyLevel: c.close,
        });
      }
      continue;
    }

    // 2. HAMMER & INVERTED HAMMER (Small body at top, lower wick >= 2x body)
    if (lowerWick >= body * 2 && upperWick <= body * 0.35 && (isPriorDowntrend || i > 2)) {
      patterns.push({
        id: `hammer-${i}`,
        name: "Bullish Hammer",
        shortCode: "HAMMER",
        bias: "bullish",
        startIndex: i,
        endIndex: i,
        candleIndex: i,
        time: c.time,
        price: c.low,
        confidence: 88,
        description: "Bears pushed price down aggressively, but bulls stepped in with extreme volume to close near highs.",
        tradingImplication: "Bottom reversal pattern with strong demand absorption.",
        suggestedAction: "BUY / LONG",
        keyLevel: c.low,
      });
      continue;
    }

    // 3. SHOOTING STAR (Small body at bottom, upper wick >= 2x body)
    if (upperWick >= body * 2 && lowerWick <= body * 0.35 && (isPriorUptrend || i > 2)) {
      patterns.push({
        id: `shooting-star-${i}`,
        name: "Shooting Star",
        shortCode: "STAR",
        bias: "bearish",
        startIndex: i,
        endIndex: i,
        candleIndex: i,
        time: c.time,
        price: c.high,
        confidence: 86,
        description: "Bulls attempted a higher push but met overwhelming sell pressure, closing near the candle floor.",
        tradingImplication: "Top rejection signal. Profit taking and short momentum incoming.",
        suggestedAction: "SELL / SHORT",
        keyLevel: c.high,
      });
      continue;
    }

    // 4. BULLISH MARUBOZU / BEARISH MARUBOZU (Full body >= 88% of range)
    if (bodyRatio >= 0.88) {
      if (isBullish) {
        patterns.push({
          id: `bull-marubozu-${i}`,
          name: "Bullish Marubozu",
          shortCode: "MARU-UP",
          bias: "bullish",
          startIndex: i,
          endIndex: i,
          candleIndex: i,
          time: c.time,
          price: c.high,
          confidence: 85,
          description: "Dominant buying pressure from open to close with zero seller pushback.",
          tradingImplication: "High-momentum trend continuation.",
          suggestedAction: "BUY / LONG",
          keyLevel: c.open,
        });
      } else {
        patterns.push({
          id: `bear-marubozu-${i}`,
          name: "Bearish Marubozu",
          shortCode: "MARU-DN",
          bias: "bearish",
          startIndex: i,
          endIndex: i,
          candleIndex: i,
          time: c.time,
          price: c.low,
          confidence: 85,
          description: "Dominant selling pressure from open to close with zero buyer absorption.",
          tradingImplication: "High-momentum downward breakdown.",
          suggestedAction: "SELL / SHORT",
          keyLevel: c.open,
        });
      }
      continue;
    }

    // 5. BULLISH ENGULFING (2-candle pattern: Red candle followed by larger Green candle engulfing previous body)
    if (prev1) {
      const prev1Body = Math.abs(prev1.close - prev1.open);
      const isPrev1Bear = prev1.close < prev1.open;
      if (isPrev1Bear && isBullish && c.open <= prev1.close && c.close >= prev1.open && body > prev1Body * 1.1) {
        patterns.push({
          id: `bull-engulfing-${i}`,
          name: "Bullish Engulfing",
          shortCode: "ENGULF+",
          bias: "bullish",
          startIndex: i - 1,
          endIndex: i,
          candleIndex: i,
          time: c.time,
          price: c.close,
          confidence: 91,
          description: "A strong bullish green candle completely swallows the previous bearish red candle body.",
          tradingImplication: "Major demand surge overcoming prior sellers. Powerful reversal signal.",
          suggestedAction: "BUY / LONG",
          keyLevel: Math.min(prev1.low, c.low),
        });
        continue;
      }

      // 6. BEARISH ENGULFING (2-candle pattern: Green candle followed by larger Red candle engulfing previous body)
      const isPrev1Bull = prev1.close >= prev1.open;
      if (isPrev1Bull && !isBullish && c.open >= prev1.close && c.close <= prev1.open && body > prev1Body * 1.1) {
        patterns.push({
          id: `bear-engulfing-${i}`,
          name: "Bearish Engulfing",
          shortCode: "ENGULF-",
          bias: "bearish",
          startIndex: i - 1,
          endIndex: i,
          candleIndex: i,
          time: c.time,
          price: c.close,
          confidence: 91,
          description: "A strong bearish red candle completely engulfs the prior bullish candle body.",
          tradingImplication: "Supply deluge overtaking buyers. Classic distribution top reversal.",
          suggestedAction: "SELL / SHORT",
          keyLevel: Math.max(prev1.high, c.high),
        });
        continue;
      }

      // 7. PIERCING PATTERN (Bullish 2-candle: Bearish candle followed by Bull candle opening lower and closing >50% up into prior body)
      if (isPrev1Bear && isBullish && c.open < prev1.low && c.close > (prev1.open + prev1.close) / 2 && c.close < prev1.open) {
        patterns.push({
          id: `piercing-line-${i}`,
          name: "Piercing Line",
          shortCode: "PIERCE",
          bias: "bullish",
          startIndex: i - 1,
          endIndex: i,
          candleIndex: i,
          time: c.time,
          price: c.close,
          confidence: 83,
          description: "Bullish candle opens below prior low but rebounds decisively past the 50% midpoint of the previous bear bar.",
          tradingImplication: "Strong dip-buying response. Bullish recovery signal.",
          suggestedAction: "BUY / LONG",
          keyLevel: c.low,
        });
        continue;
      }
    }

    // 8. MORNING STAR (3-candle bullish reversal)
    if (prev2 && prev1) {
      const isPrev2Bear = prev2.close < prev2.open;
      const prev1SmallBody = Math.abs(prev1.close - prev1.open) < (prev2.high - prev2.low) * 0.35;
      const isCurrentBull = c.close > c.open;
      if (isPrev2Bear && prev1SmallBody && isCurrentBull && c.close > (prev2.open + prev2.close) / 2) {
        patterns.push({
          id: `morning-star-${i}`,
          name: "Morning Star",
          shortCode: "M-STAR",
          bias: "bullish",
          startIndex: i - 2,
          endIndex: i,
          candleIndex: i,
          time: c.time,
          price: c.close,
          confidence: 93,
          description: "3-candle bullish reversal: Long bear bar, followed by indecision star gap, completed by a strong bull candle.",
          tradingImplication: "Institutional accumulation confirmed. High-probability trend shift.",
          suggestedAction: "BUY / LONG",
          keyLevel: prev1.low,
        });
        continue;
      }

      // 9. EVENING STAR (3-candle bearish reversal)
      const isPrev2Bull = prev2.close > prev2.open;
      const isCurrentBear = c.close < c.open;
      if (isPrev2Bull && prev1SmallBody && isCurrentBear && c.close < (prev2.open + prev2.close) / 2) {
        patterns.push({
          id: `evening-star-${i}`,
          name: "Evening Star",
          shortCode: "E-STAR",
          bias: "bearish",
          startIndex: i - 2,
          endIndex: i,
          candleIndex: i,
          time: c.time,
          price: c.close,
          confidence: 93,
          description: "3-candle bearish reversal: Long bull bar, hesitation star, followed by a heavy bear bar closing deep into the first candle.",
          tradingImplication: "Institutional distribution peak. High-probability downward reversal.",
          suggestedAction: "SELL / SHORT",
          keyLevel: prev1.high,
        });
        continue;
      }
    }
  }

  return patterns;
}

/**
 * Calculate automated dynamic Support & Resistance lines from pivot highs and lows
 */
export function calculateKeyPriceLevels(candles: CandleDataPoint[]): {
  resistance2: number;
  resistance1: number;
  pivot: number;
  support1: number;
  support2: number;
  allTimeHigh: number;
  allTimeLow: number;
  fibLevels: Array<{ ratio: number; label: string; price: number }>;
} {
  if (!candles || candles.length === 0) {
    return {
      resistance2: 0,
      resistance1: 0,
      pivot: 0,
      support1: 0,
      support2: 0,
      allTimeHigh: 0,
      allTimeLow: 0,
      fibLevels: [],
    };
  }

  let high = -Infinity;
  let low = Infinity;
  let sumClose = 0;

  candles.forEach((c) => {
    if (c.high > high) high = c.high;
    if (c.low < low) low = c.low;
    sumClose += c.close;
  });

  const last = candles[candles.length - 1];
  const close = last.close;
  const pivot = (high + low + close) / 3;
  const r1 = 2 * pivot - low;
  const s1 = 2 * pivot - high;
  const r2 = pivot + (high - low);
  const s2 = pivot - (high - low);

  // Fibonacci Retracement Levels based on visible High & Low
  const diff = high - low;
  const fibLevels = [
    { ratio: 0, label: "0.0% (Swing High)", price: high },
    { ratio: 0.236, label: "23.6% Fib", price: high - diff * 0.236 },
    { ratio: 0.382, label: "38.2% Fib (Key)", price: high - diff * 0.382 },
    { ratio: 0.5, label: "50.0% Equilibrium", price: high - diff * 0.5 },
    { ratio: 0.618, label: "61.8% Golden Pocket", price: high - diff * 0.618 },
    { ratio: 0.786, label: "78.6% Deep Pullback", price: high - diff * 0.786 },
    { ratio: 1.0, label: "100.0% (Swing Low)", price: low },
  ];

  return {
    resistance2: r2,
    resistance1: r1,
    pivot,
    support1: s1,
    support2: s2,
    allTimeHigh: high,
    allTimeLow: low,
    fibLevels,
  };
}
