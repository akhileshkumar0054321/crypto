"use client";

import React, { Suspense } from "react";
import { DexTrendingCoinsSection } from "@/components/dexscreener/DexTrendingCoinsSection";
import { Sparkles, Flame, ShieldAlert, Zap } from "lucide-react";

export default function TrendingSmallCapsPage() {
  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/20 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center gap-1.5">
              <Flame size={13} className="text-amber-400" />
              <span>Powered by DexScreener Token Profiles API v1</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>6-Section Forensic Reports for Microcaps</span>
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Small Cap Coins & Microcap Forensic Intelligence
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Real-time scanner across Solana, Base, Ethereum, and BSC. Discover newly launched tokens, analyze liquidity depth, inspect developer wallet concentration, and generate full 6-section forensic risk reports with 1-click.
          </p>
        </div>
      </div>

      {/* Main Interactive DexScreener Engine */}
      <Suspense fallback={<div className="p-12 text-center text-slate-400 text-xs animate-pulse">Loading DexScreener Trending Engine...</div>}>
        <DexTrendingCoinsSection showSearchHeader={true} />
      </Suspense>
    </div>
  );
}
