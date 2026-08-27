"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

export interface LivePriceTick {
  coin_id?: string;
  symbol?: string;
  name?: string;
  price: number;
  change24h: number;
  direction: "up" | "down" | null;
  lastTickTime: number;
  volume24h: number;
  marketCap: number;
}

export interface LiveRecordedTick {
  time: number;
  price: number;
  direction: "up" | "down";
  volume: number;
}

export interface LiveTapeTrade {
  id: string;
  coin_id: string;
  symbol: string;
  type: "BUY" | "SELL";
  price: number;
  amount: number;
  value_usd: number;
  timestamp: string;
  time: number;
}

const INITIAL_LIVE_COINS: Record<string, LivePriceTick> = {
  bitcoin: {
    coin_id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    price: 68420.5,
    change24h: 3.42,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 38400000000,
    marketCap: 1345000000000,
  },
  ethereum: {
    coin_id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    price: 3540.2,
    change24h: 2.15,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 19800000000,
    marketCap: 425000000000,
  },
  solana: {
    coin_id: "solana",
    symbol: "SOL",
    name: "Solana",
    price: 182.45,
    change24h: 6.84,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 7420000000,
    marketCap: 84000000000,
  },
  binancecoin: {
    coin_id: "binancecoin",
    symbol: "BNB",
    name: "BNB",
    price: 592.1,
    change24h: 1.05,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 1450000000,
    marketCap: 88500000000,
  },
  ripple: {
    coin_id: "ripple",
    symbol: "XRP",
    name: "XRP",
    price: 0.584,
    change24h: -1.24,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 1200000000,
    marketCap: 32800000000,
  },
  cardano: {
    coin_id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    price: 0.482,
    change24h: 0.85,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 480000000,
    marketCap: 17200000000,
  },
  dogecoin: {
    coin_id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.148,
    change24h: 8.92,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 2100000000,
    marketCap: 21500000000,
  },
  pepe: {
    coin_id: "pepe",
    symbol: "PEPE",
    name: "Pepe",
    price: 0.0000104,
    change24h: 14.25,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 1850000000,
    marketCap: 4380000000,
  },
  chainlink: {
    coin_id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    price: 18.25,
    change24h: 4.12,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 620000000,
    marketCap: 10900000000,
  },
  avalanche: {
    coin_id: "avalanche-2",
    symbol: "AVAX",
    name: "Avalanche",
    price: 34.8,
    change24h: -2.31,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 530000000,
    marketCap: 13800000000,
  },
};

interface LiveMarketContextType {
  isLive: boolean;
  setIsLive: (live: boolean) => void;
  speed: "fast" | "normal" | "slow";
  setSpeed: (speed: "fast" | "normal" | "slow") => void;
  livePrices: Record<string, LivePriceTick>;
  recordedTicks: Record<string, LiveRecordedTick[]>;
  liveTapeTrades: LiveTapeTrade[];
  totalRecordedTicks: number;
  recordingStartedAt: number;
  globalStats: {
    totalMarketCap: number;
    totalVolume: number;
    btcDominance: number;
    mcapChange24h: number;
    activeNodes: number;
    latencyMs: number;
  };
  getLiveCoin: (coinId: string, fallbackPrice?: number, fallbackChange?: number) => LivePriceTick;
  getRecordedTicks: (coinId: string) => LiveRecordedTick[];
}

const LiveMarketContext = createContext<LiveMarketContextType | null>(null);

export function LiveMarketProvider({ children }: { children: React.ReactNode }) {
  const [isLive, setIsLive] = useState(true);
  const [speed, setSpeed] = useState<"fast" | "normal" | "slow">("fast");
  const [livePrices, setLivePrices] = useState<Record<string, LivePriceTick>>(INITIAL_LIVE_COINS);
  const [recordedTicks, setRecordedTicks] = useState<Record<string, LiveRecordedTick[]>>(() => {
    const init: Record<string, LiveRecordedTick[]> = {};
    const now = Date.now();
    Object.entries(INITIAL_LIVE_COINS).forEach(([k, v]) => {
      // Seed 25 realistic initial recorded ticks for continuous line & bar graphs
      const ticks: LiveRecordedTick[] = [];
      let p = v.price * (1 - (v.change24h / 100) * 0.05);
      for (let i = 24; i >= 0; i--) {
        const time = now - i * 3000;
        const drift = (Math.random() - 0.49) * (p * 0.001);
        p = Math.max(0.000001, p + drift);
        ticks.push({
          time,
          price: i === 0 ? v.price : p,
          direction: drift >= 0 ? "up" : "down",
          volume: (v.volume24h / 86400) * (0.5 + Math.random()),
        });
      }
      init[k] = ticks;
    });
    return init;
  });

  const [liveTapeTrades, setLiveTapeTrades] = useState<LiveTapeTrade[]>([
    {
      id: "tape-1",
      coin_id: "bitcoin",
      symbol: "BTC",
      type: "BUY",
      price: 68420.5,
      amount: 1.42,
      value_usd: 97157.11,
      timestamp: "Just now",
      time: Date.now(),
    },
    {
      id: "tape-2",
      coin_id: "ethereum",
      symbol: "ETH",
      type: "BUY",
      price: 3540.2,
      amount: 12.8,
      value_usd: 45314.56,
      timestamp: "1s ago",
      time: Date.now() - 1000,
    },
    {
      id: "tape-3",
      coin_id: "solana",
      symbol: "SOL",
      type: "SELL",
      price: 182.45,
      amount: 180.0,
      value_usd: 32841.0,
      timestamp: "3s ago",
      time: Date.now() - 3000,
    },
  ]);

  const [totalRecordedTicks, setTotalRecordedTicks] = useState(148);
  const [recordingStartedAt] = useState(Date.now());

  const [globalStats, setGlobalStats] = useState({
    totalMarketCap: 2480500000000,
    totalVolume: 94820000000,
    btcDominance: 54.8,
    mcapChange24h: 1.84,
    activeNodes: 64,
    latencyMs: 18,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Interval duration based on speed
  const getIntervalMs = useCallback(() => {
    if (speed === "fast") return 1600; // 1.6s ticks
    if (speed === "normal") return 3200; // 3.2s ticks
    return 5500; // 5.5s ticks
  }, [speed]);

  useEffect(() => {
    if (!isLive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const intervalMs = getIntervalMs();

    intervalRef.current = setInterval(() => {
      const tickTime = Date.now();

      setLivePrices((prev) => {
        const next: Record<string, LivePriceTick> = { ...prev };
        const coinKeys = Object.keys(next);
        if (coinKeys.length === 0) return prev;

        const numToTick = Math.min(coinKeys.length, Math.floor(Math.random() * 4) + 2);
        const shuffled = [...coinKeys].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, numToTick);

        const newTrades: LiveTapeTrade[] = [];

        selected.forEach((key) => {
          const current = next[key];
          if (!current || !current.price) return;

          // Brownian realistic price delta: micro percentage ±(0.015% to 0.16%)
          const drift = (Math.random() - 0.488) * (current.price > 100 ? 0.0018 : 0.0038);
          const priceDelta = current.price * drift;
          const newPrice = Math.max(0.0000001, current.price + priceDelta);
          const isUp = priceDelta >= 0;

          const changeDelta = drift * 25;
          const newChange24h = (current.change24h || 0) + changeDelta;
          const tickVol = (current.volume24h / 86400) * (0.8 + Math.random() * 1.2);

          next[key] = {
            price: newPrice,
            change24h: Math.round(newChange24h * 100) / 100,
            direction: isUp ? "up" : "down",
            lastTickTime: tickTime,
            volume24h: (current.volume24h || 1000000) * (1 + Math.random() * 0.0008),
            marketCap: (current.marketCap || 10000000) * (1 + drift),
          };

          // Append to recorded ticks history
          setRecordedTicks((prevRec) => {
            const currentList = prevRec[key] || [];
            const newTick: LiveRecordedTick = {
              time: tickTime,
              price: newPrice,
              direction: isUp ? "up" : "down",
              volume: tickVol,
            };
            // Keep up to 100 latest recorded ticks in rolling memory
            const updated = [...currentList.slice(-99), newTick];
            return { ...prevRec, [key]: updated };
          });

          // Generate a live tape trade print
          const tradeSizeCoins = (current.price > 1000 ? Math.random() * 2 + 0.1 : Math.random() * 500 + 20);
          newTrades.push({
            id: `trade-${tickTime}-${key}`,
            coin_id: key,
            symbol: current.symbol || key.slice(0, 4).toUpperCase(),
            type: isUp ? "BUY" : "SELL",
            price: newPrice,
            amount: Math.round(tradeSizeCoins * 100) / 100,
            value_usd: Math.round(tradeSizeCoins * newPrice * 100) / 100,
            timestamp: "Just now",
            time: tickTime,
          });
        });

        if (newTrades.length > 0) {
          setLiveTapeTrades((prevTrades) => [...newTrades, ...prevTrades.slice(0, 15)]);
          setTotalRecordedTicks((c) => c + newTrades.length);
        }

        return next;
      });

      // Fluctuate global metrics realistically
      setGlobalStats((prev) => {
        const mcapDrift = (Math.random() - 0.49) * 0.0006;
        const volDrift = (Math.random() - 0.48) * 0.0012;
        return {
          totalMarketCap: Math.round(prev.totalMarketCap * (1 + mcapDrift)),
          totalVolume: Math.round(prev.totalVolume * (1 + volDrift)),
          btcDominance: Math.round((prev.btcDominance + (Math.random() - 0.5) * 0.02) * 10) / 10,
          mcapChange24h: Math.round((prev.mcapChange24h + mcapDrift * 80) * 100) / 100,
          activeNodes: Math.floor(62 + Math.random() * 5),
          latencyMs: Math.floor(12 + Math.random() * 8),
        };
      });
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive, speed, getIntervalMs]);

  const getLiveCoin = useCallback(
    (coinId: string, fallbackPrice = 100, fallbackChange = 0): LivePriceTick => {
      const clean = coinId.toLowerCase().trim();
      const tick = livePrices[clean];
      if (!tick) {
        return {
          coin_id: clean,
          symbol: clean.slice(0, 4).toUpperCase(),
          price: fallbackPrice,
          change24h: fallbackChange,
          direction: null,
          lastTickTime: Date.now(),
          volume24h: fallbackPrice * 50000,
          marketCap: fallbackPrice * 20000000,
        };
      }
      const isRecent = Date.now() - (tick.lastTickTime || 0) < 1500;
      return {
        ...tick,
        direction: isRecent ? tick.direction : null,
      };
    },
    [livePrices]
  );

  const getRecordedTicks = useCallback(
    (coinId: string): LiveRecordedTick[] => {
      const clean = coinId.toLowerCase().trim();
      return recordedTicks[clean] || [];
    },
    [recordedTicks]
  );

  return (
    <LiveMarketContext.Provider
      value={{
        isLive,
        setIsLive,
        speed,
        setSpeed,
        livePrices,
        recordedTicks,
        liveTapeTrades,
        totalRecordedTicks,
        recordingStartedAt,
        globalStats,
        getLiveCoin,
        getRecordedTicks,
      }}
    >
      {children}
    </LiveMarketContext.Provider>
  );
}

export function useLiveMarket() {
  const context = useContext(LiveMarketContext);
  if (!context) {
    throw new Error("useLiveMarket must be used within a LiveMarketProvider");
  }
  return context;
}
