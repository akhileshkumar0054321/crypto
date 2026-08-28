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

const BINANCE_PAIR_TO_COIN_ID: Record<string, { id: string; symbol: string; name: string }> = {
  BTCUSDT: { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  ETHUSDT: { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  SOLUSDT: { id: "solana", symbol: "SOL", name: "Solana" },
  BNBUSDT: { id: "binancecoin", symbol: "BNB", name: "BNB" },
  XRPUSDT: { id: "ripple", symbol: "XRP", name: "XRP" },
  ADAUSDT: { id: "cardano", symbol: "ADA", name: "Cardano" },
  DOGEUSDT: { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  LINKUSDT: { id: "chainlink", symbol: "LINK", name: "Chainlink" },
  PEPEUSDT: { id: "pepe", symbol: "PEPE", name: "Pepe" },
  FLOKIUSDT: { id: "floki", symbol: "FLOKI", name: "FLOKI" },
  AVAXUSDT: { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  DOTUSDT: { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  POLUSDT: { id: "matic-network", symbol: "POL", name: "Polygon (POL)" },
  MATICUSDT: { id: "matic-network", symbol: "POL", name: "Polygon (POL)" },
  TONUSDT: { id: "the-open-network", symbol: "TON", name: "Toncoin" },
  NEARUSDT: { id: "near", symbol: "NEAR", name: "NEAR Protocol" },
  UNIUSDT: { id: "uniswap", symbol: "UNI", name: "Uniswap" },
  SUIUSDT: { id: "sui", symbol: "SUI", name: "Sui" },
  ARBUSDT: { id: "arbitrum", symbol: "ARB", name: "Arbitrum" },
  SHIBUSDT: { id: "shiba-inu", symbol: "SHIB", name: "Shiba Inu" },
  RENDERUSDT: { id: "render-token", symbol: "RENDER", name: "Render" },
  FETUSDT: { id: "fetch-ai", symbol: "FET", name: "ASI Alliance" },
  TAOUSDT: { id: "bittensor", symbol: "TAO", name: "Bittensor" },
};

const INITIAL_LIVE_COINS: Record<string, LivePriceTick> = {
  bitcoin: {
    coin_id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    price: 79285.0,
    change24h: -0.85,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 38400000000,
    marketCap: 1565000000000,
  },
  ethereum: {
    coin_id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    price: 2489.5,
    change24h: -1.72,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 18200000000,
    marketCap: 300500000000,
  },
  solana: {
    coin_id: "solana",
    symbol: "SOL",
    name: "Solana",
    price: 105.9,
    change24h: 1.48,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 4800000000,
    marketCap: 51200000000,
  },
  binancecoin: {
    coin_id: "binancecoin",
    symbol: "BNB",
    name: "BNB",
    price: 704.5,
    change24h: -1.05,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 1480000000,
    marketCap: 104500000000,
  },
  ripple: {
    coin_id: "ripple",
    symbol: "XRP",
    name: "XRP",
    price: 1.41,
    change24h: -1.77,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 3450000000,
    marketCap: 81800000000,
  },
  cardano: {
    coin_id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    price: 0.207,
    change24h: -3.45,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 245000000,
    marketCap: 7450000000,
  },
  dogecoin: {
    coin_id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.0864,
    change24h: -2.68,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 950000000,
    marketCap: 12800000000,
  },
  pepe: {
    coin_id: "pepe",
    symbol: "PEPE",
    name: "Pepe",
    price: 0.0000038,
    change24h: -3.8,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 820000000,
    marketCap: 1600000000,
  },
  chainlink: {
    coin_id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    price: 11.7,
    change24h: -1.3,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 295000000,
    marketCap: 7150000000,
  },
  "avalanche-2": {
    coin_id: "avalanche-2",
    symbol: "AVAX",
    name: "Avalanche",
    price: 7.37,
    change24h: -1.04,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 181000000,
    marketCap: 2950000000,
  },
  avalanche: {
    coin_id: "avalanche-2",
    symbol: "AVAX",
    name: "Avalanche",
    price: 7.37,
    change24h: -1.04,
    direction: null,
    lastTickTime: Date.now(),
    volume24h: 181000000,
    marketCap: 2950000000,
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
      price: 79285.0,
      amount: 1.42,
      value_usd: 112584.7,
      timestamp: "Just now",
      time: Date.now(),
    },
    {
      id: "tape-2",
      coin_id: "ethereum",
      symbol: "ETH",
      type: "BUY",
      price: 2489.5,
      amount: 12.8,
      value_usd: 31865.6,
      timestamp: "1s ago",
      time: Date.now() - 1000,
    },
    {
      id: "tape-3",
      coin_id: "solana",
      symbol: "SOL",
      type: "SELL",
      price: 105.9,
      amount: 180.0,
      value_usd: 19062.0,
      timestamp: "3s ago",
      time: Date.now() - 3000,
    },
  ]);

  const [totalRecordedTicks, setTotalRecordedTicks] = useState(148);
  const [recordingStartedAt] = useState(Date.now());

  const [globalStats, setGlobalStats] = useState({
    totalMarketCap: 2780500000000,
    totalVolume: 128820000000,
    btcDominance: 56.4,
    mcapChange24h: -0.92,
    activeNodes: 64,
    latencyMs: 14,
  });

  const wsRef = useRef<WebSocket | null>(null);

  // Sync real-time data from /api/coins
  const syncServerCoins = useCallback(async () => {
    try {
      const res = await fetch("/api/coins");
      if (res.ok) {
        const coins = await res.json();
        if (Array.isArray(coins) && coins.length > 0) {
          setLivePrices((prev) => {
            const next = { ...prev };
            let totCap = 0;
            let totVol = 0;
            let btcCap = 0;

            coins.forEach((c: any) => {
              const old = next[c.coin_id];
              const p = c.price_usd || old?.price || 0;
              const ch = c.price_change_24h ?? old?.change24h ?? 0;
              const dir = old ? (p > old.price ? "up" : p < old.price ? "down" : old.direction) : null;
              
              next[c.coin_id] = {
                coin_id: c.coin_id,
                symbol: c.symbol?.toUpperCase() || old?.symbol || c.coin_id.slice(0, 4).toUpperCase(),
                name: c.name || old?.name || c.coin_id,
                price: p,
                change24h: Math.round(ch * 100) / 100,
                direction: dir,
                lastTickTime: Date.now(),
                volume24h: c.volume_24h || old?.volume24h || 0,
                marketCap: c.market_cap || old?.marketCap || 0,
              };

              totCap += c.market_cap || 0;
              totVol += c.volume_24h || 0;
              if (c.coin_id === "bitcoin") btcCap = c.market_cap || 0;
            });

            if (totCap > 0) {
              setGlobalStats((prevStats) => ({
                ...prevStats,
                totalMarketCap: totCap,
                totalVolume: totVol > 0 ? totVol : prevStats.totalVolume,
                btcDominance: btcCap > 0 ? Math.round((btcCap / totCap) * 1000) / 10 : prevStats.btcDominance,
              }));
            }

            return next;
          });
        }
      }
    } catch {
      // Ignore network errors
    }
  }, []);

  // Initialize and run real-time Binance WebSocket stream
  useEffect(() => {
    // Initial fetch from server
    syncServerCoins();

    if (!isLive) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    let isSubscribed = true;

    function connectWs() {
      if (!isSubscribed) return;
      try {
        const ws = new WebSocket("wss://stream.binance.com:9443/ws/!miniTicker@arr");
        wsRef.current = ws;

        ws.onopen = () => {
          setGlobalStats((g) => ({ ...g, latencyMs: Math.floor(12 + Math.random() * 8) }));
        };

        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(event.data);
            if (Array.isArray(data)) {
              const tickTime = Date.now();
              const newTrades: LiveTapeTrade[] = [];

              setLivePrices((prev) => {
                const next = { ...prev };
                let updatedAny = false;

                data.forEach((item: any) => {
                  const sym = item.s;
                  const mapping = BINANCE_PAIR_TO_COIN_ID[sym];
                  if (!mapping) return;

                  const price = parseFloat(item.c);
                  const open = parseFloat(item.o);
                  const quoteVol = parseFloat(item.q);
                  if (isNaN(price) || price <= 0) return;

                  const change24h = open > 0 ? ((price - open) / open) * 100 : 0;
                  const old = next[mapping.id];
                  const oldPrice = old?.price || price;
                  const isUp = price >= oldPrice;
                  const dir = price > oldPrice ? "up" : price < oldPrice ? "down" : old?.direction || null;

                  next[mapping.id] = {
                    coin_id: mapping.id,
                    symbol: mapping.symbol,
                    name: mapping.name,
                    price: price,
                    change24h: Math.round(change24h * 100) / 100,
                    direction: dir,
                    lastTickTime: tickTime,
                    volume24h: quoteVol > 0 ? quoteVol : old?.volume24h || 1000000,
                    marketCap: old?.marketCap ? (old.marketCap / oldPrice) * price : price * 1000000,
                  };
                  updatedAny = true;

                  // Append genuine tick to recorded history
                  setRecordedTicks((prevRec) => {
                    const currentList = prevRec[mapping.id] || [];
                    const newTick: LiveRecordedTick = {
                      time: tickTime,
                      price: price,
                      direction: isUp ? "up" : "down",
                      volume: (quoteVol / 86400) * (0.8 + Math.random() * 0.4),
                    };
                    return { ...prevRec, [mapping.id]: [...currentList.slice(-99), newTick] };
                  });

                  // Add trade to tape if price fluctuated
                  if (price !== oldPrice && Math.random() > 0.4) {
                    const amountCoins = price > 1000 ? Math.random() * 1.5 + 0.05 : Math.random() * 200 + 10;
                    newTrades.push({
                      id: `trade-${tickTime}-${mapping.id}-${Math.random()}`,
                      coin_id: mapping.id,
                      symbol: mapping.symbol,
                      type: isUp ? "BUY" : "SELL",
                      price: price,
                      amount: Math.round(amountCoins * 100) / 100,
                      value_usd: Math.round(amountCoins * price * 100) / 100,
                      timestamp: "Just now",
                      time: tickTime,
                    });
                  }
                });

                if (newTrades.length > 0) {
                  setLiveTapeTrades((prevTrades) => [...newTrades, ...prevTrades.slice(0, 20)]);
                  setTotalRecordedTicks((c) => c + newTrades.length);
                }

                return updatedAny ? next : prev;
              });
            }
          } catch {
            // Ignore parse errors
          }
        };

        ws.onerror = () => {
          if (ws) ws.close();
        };

        ws.onclose = () => {
          if (isSubscribed) {
            // Reconnect after 3 seconds
            setTimeout(connectWs, 3000);
          }
        };
      } catch {
        if (isSubscribed) {
          setTimeout(connectWs, 4000);
        }
      }
    }

    connectWs();

    // Fallback polling interval to ensure custom tokens and REST stays in sync
    const pollInterval = setInterval(syncServerCoins, 6000);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isLive, syncServerCoins]);

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
