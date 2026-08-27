"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLiveMarket } from "@/lib/context/LiveMarketContext";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

export function PriceTicker() {
  const { livePrices, isLive } = useLiveMarket();
  const [isPaused, setIsPaused] = useState(false);

  // Default prioritized coin list to match real live ticker entries
  const defaultCoins = [
    { coin_id: "ethereum", symbol: "ETH", name: "Ethereum", price: 2538.00, change24h: 3.81 },
    { coin_id: "solana", symbol: "SOL", name: "Solana", price: 104.74, change24h: 9.08 },
    { coin_id: "binancecoin", symbol: "BNB", name: "BNB", price: 713.27, change24h: 2.59 },
    { coin_id: "ripple", symbol: "XRP", name: "XRP", price: 1.44, change24h: 2.43 },
    { coin_id: "cardano", symbol: "ADA", name: "Cardano", price: 0.2156, change24h: 3.23 },
    { coin_id: "dogecoin", symbol: "DOGE", name: "Dogecoin", price: 0.0891, change24h: 3.78 },
    { coin_id: "polkadot", symbol: "DOT", name: "Polkadot", price: 0.8822, change24h: 4.82 },
    { coin_id: "bitcoin", symbol: "BTC", name: "Bitcoin", price: 64250.00, change24h: 2.41 },
    { coin_id: "avalanche-2", symbol: "AVAX", name: "Avalanche", price: 28.45, change24h: 5.60 },
    { coin_id: "chainlink", symbol: "LINK", name: "Chainlink", price: 14.10, change24h: 4.15 },
    { coin_id: "near", symbol: "NEAR", name: "NEAR Protocol", price: 5.20, change24h: 6.30 },
    { coin_id: "pepe", symbol: "PEPE", name: "Pepe", price: 0.0000088, change24h: 8.20 },
  ];

  // Merge with live context if active
  const dynamicCoinList = defaultCoins.map((def) => {
    const live = livePrices[def.coin_id];
    if (live) {
      return {
        ...def,
        price: live.price ?? def.price,
        change24h: live.change24h ?? def.change24h,
      };
    }
    return def;
  });

  // Duplicate items to ensure a seamless infinite loop marquee
  const tickerItems = [...dynamicCoinList, ...dynamicCoinList];

  return (
    <div
      id="live-price-ticker-bar"
      className="w-full bg-[#040608] border-b border-white/[0.07] text-xs select-none overflow-hidden relative z-40 h-9 flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center w-full">
        {/* Left Greed / Sentiment Indicator (matching the image) */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-1 border-r border-white/[0.08] bg-[#080d14] flex-shrink-0 z-20 h-9">
          <div className="flex items-center gap-1.5 text-lime-400 font-bold font-mono text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
            <Zap size={13} className="text-lime-400" />
            <span className="text-white font-extrabold">71</span>
            <span className="text-slate-300 font-semibold text-[11px]">Greed</span>
          </div>
          <span className="inline-flex items-center text-[10px] font-bold font-mono text-emerald-400">
            ▲ 2.28%
          </span>
        </div>

        {/* Continuous Scrolling Strip of Real Coin Entries */}
        <div className="overflow-hidden flex-1 relative flex items-center h-9">
          <div
            className={`flex items-center gap-7 whitespace-nowrap will-change-transform ${
              isPaused ? "" : "animate-ticker"
            }`}
            style={{
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {tickerItems.map((c, idx) => {
              const coinId = c.coin_id || `coin-${idx}`;
              const symbol = c.symbol || "ASSET";
              const isPositive = (c.change24h || 0) >= 0;
              const formattedPrice =
                c.price >= 1000
                  ? `$${c.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                  : c.price >= 1
                  ? `$${c.price.toFixed(2)}`
                  : c.price >= 0.01
                  ? `$${c.price.toFixed(4)}`
                  : `$${c.price.toFixed(7)}`;

              return (
                <Link
                  key={`${coinId}-${idx}`}
                  href={`/coin/${coinId}`}
                  className="inline-flex items-center gap-1.5 hover:bg-white/[0.05] px-2 py-0.5 rounded transition-colors group cursor-pointer"
                  title={`Live market audit & threat telemetry for ${c.name} (${symbol})`}
                >
                  <span className="font-extrabold text-slate-100 group-hover:text-cyan-400 transition-colors tracking-tight text-[11.5px]">
                    {symbol}
                  </span>

                  <span className="font-mono text-slate-300 font-semibold text-[11.5px]">
                    {formattedPrice}
                  </span>

                  <span
                    className={`inline-flex items-center gap-0.5 text-[10.5px] font-bold font-mono ${
                      isPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    <span className="text-[10px]">{isPositive ? "↗" : "↘"}</span>
                    <span>{isPositive ? "▲" : "▼"}</span>
                    <span>{Math.abs(c.change24h || 0).toFixed(2)}%</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#040608] border-l border-white/[0.08] flex-shrink-0 z-20 text-[10px] text-slate-400 h-9">
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`} />
          <span className="text-slate-400 font-mono">Live Sub-Second Telemetry</span>
        </div>
      </div>
    </div>
  );
}

