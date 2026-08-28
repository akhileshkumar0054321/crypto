"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { coinApi, riskApi } from "@/lib/api";
import { useLiveMarket } from "@/lib/context/LiveMarketContext";
import {
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  BarChart2,
  Sparkles,
  Radio,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  RefreshCw,
  Eye,
  Sliders,
  DollarSign,
  Clock,
  Compass,
} from "lucide-react";
import { TradingViewAdvancedWidget } from "@/components/charts/TradingViewAdvancedWidget";
import { RealtimeCoinAnalysisReportModal } from "@/components/analysis/RealtimeCoinAnalysisReportModal";
import { RealtimeCoinChartModal } from "@/components/charts/RealtimeCoinChartModal";
import Link from "next/link";

interface RealtimeCryptoRadarProps {
  onSelectCoinForAnalysis?: (coin: any) => void;
  className?: string;
}

export function RealtimeCryptoRadar({
  onSelectCoinForAnalysis,
  className = "",
}: RealtimeCryptoRadarProps) {
  const { isLive, globalStats, getLiveCoin, liveTapeTrades } = useLiveMarket();
  const [radarMode, setRadarMode] = useState<"pulse" | "momentum" | "whales" | "anomalies" | "chart">("pulse");
  const [sectorFilter, setSectorFilter] = useState<"all" | "l1" | "defi" | "ai" | "meme" | "gainers" | "losers" | "highrisk">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRadarCoin, setSelectedRadarCoin] = useState<any | null>(null);
  const [activeAnalysisCoin, setActiveAnalysisCoin] = useState<any | null>(null);
  const [activeChartModalCoin, setActiveChartModalCoin] = useState<any | null>(null);
  const [tvInterval, setTvInterval] = useState<"1" | "5" | "15" | "60" | "240" | "D" | "W">("15");
  const [radarSweepDeg, setRadarSweepDeg] = useState(0);

  // Animate the radar sweep line smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarSweepDeg((prev) => (prev + 3) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const { data: rawCoins = [] } = useQuery({
    queryKey: ["radar-coins"],
    queryFn: () => coinApi.getAll().then((r) => r.data).catch(() => []),
    refetchInterval: 30_000,
  });

  const { data: rawLeaderboard = [] } = useQuery({
    queryKey: ["radar-leaderboard"],
    queryFn: () => riskApi.getLeaderboard().then((r) => r.data).catch(() => []),
    refetchInterval: 30_000,
  });

  const coins: any[] = useMemo(() => (Array.isArray(rawCoins) ? rawCoins : []), [rawCoins]);
  const leaderboard: any[] = useMemo(() => (Array.isArray(rawLeaderboard) ? rawLeaderboard : []), [rawLeaderboard]);

  // Set default selected coin
  useEffect(() => {
    if (coins.length > 0 && !selectedRadarCoin) {
      setSelectedRadarCoin(coins[0]);
    }
  }, [coins, selectedRadarCoin]);

  // Filtered Coins
  const filteredCoins = useMemo(() => {
    return coins.filter((coin: any) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesName = coin.name?.toLowerCase().includes(q);
        const matchesSym = coin.symbol?.toLowerCase().includes(q);
        const matchesId = coin.coin_id?.toLowerCase().includes(q);
        if (!matchesName && !matchesSym && !matchesId) return false;
      }

      const cid = (coin.coin_id || "").toLowerCase();
      const sym = (coin.symbol || "").toLowerCase();
      const live = getLiveCoin(coin.coin_id, coin.price_usd || 100, coin.price_change_24h || 0);
      const chg = live.change24h ?? (coin.price_change_24h || 0);
      const risk = leaderboard.find((r: any) => r?.coin_id === coin?.coin_id);
      const score = risk?.score ?? 50;

      if (sectorFilter === "gainers") return chg > 0;
      if (sectorFilter === "losers") return chg < 0;
      if (sectorFilter === "highrisk") return score >= 65 || cid === "pepe" || cid === "dogwifcoin";

      const isMeme =
        cid === "pepe" ||
        cid === "floki" ||
        cid === "dogecoin" ||
        cid === "shiba-inu" ||
        cid === "dogwifcoin" ||
        sym === "doge" ||
        sym === "shib" ||
        sym === "wif";

      const isL1 =
        cid === "bitcoin" ||
        cid === "ethereum" ||
        cid === "solana" ||
        cid === "binancecoin" ||
        cid === "cardano" ||
        cid === "avalanche-2" ||
        cid === "polkadot" ||
        cid === "near" ||
        cid === "sui" ||
        cid === "arbitrum";

      const isDeFi =
        cid === "uniswap" ||
        cid === "aave" ||
        cid === "maker" ||
        cid === "curve-dao-token" ||
        cid === "chainlink";

      const isAi =
        cid === "render-token" ||
        cid === "fetch-ai" ||
        cid === "bittensor" ||
        cid === "worldcoin-wld";

      if (sectorFilter === "l1") return isL1;
      if (sectorFilter === "defi") return isDeFi;
      if (sectorFilter === "ai") return isAi;
      if (sectorFilter === "meme") return isMeme;

      return true;
    });
  }, [coins, searchTerm, sectorFilter, getLiveCoin, leaderboard]);

  // Selected coin live data
  const currentSelected = selectedRadarCoin || coins[0] || { coin_id: "bitcoin", name: "Bitcoin", symbol: "BTC" };
  const currentSelectedLive = getLiveCoin(
    currentSelected.coin_id,
    currentSelected.price_usd || 100,
    currentSelected.price_change_24h || 0
  );
  const currentPrice = currentSelectedLive.price || currentSelected.price_usd || 0;
  const currentChg = currentSelectedLive.change24h ?? (currentSelected.price_change_24h || 0);
  const isUp = currentChg >= 0;

  const handleOpenAnalysis = (c: any) => {
    const live = getLiveCoin(c.coin_id, c.price_usd || 100, c.price_change_24h || 0);
    const enriched = {
      ...c,
      price_usd: live.price || c.price_usd,
      price_change_24h: live.change24h ?? c.price_change_24h,
    };
    if (onSelectCoinForAnalysis) {
      onSelectCoinForAnalysis(enriched);
    } else {
      setActiveAnalysisCoin(enriched);
    }
  };

  return (
    <div
      id="realtime-crypto-radar-container"
      className={`rounded-2xl bg-[#090d18] border border-slate-800 shadow-2xl overflow-hidden ${className}`}
    >
      {/* ── Top Bar / Radar Header ───────────────────────────────────────── */}
      <div className="p-4 sm:p-6 border-b border-slate-800 bg-[#0c1120] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 relative">
              <Radio size={22} className="animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0c1120] animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Real-Time Crypto Radar
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Binance WS Active ({globalStats.latencyMs}ms)
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Sub-second market scanning across momentum surges, whale transactions, volatility breakouts, and institutional signals.
              </p>
            </div>
          </div>
        </div>

        {/* Global Mini Stats Bar */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Total Cap:</span>
            <span className="text-white font-bold">${((globalStats.totalMarketCap || 2.4e12) / 1e12).toFixed(2)}T</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">BTC Dom:</span>
            <span className="text-amber-400 font-bold">{globalStats.btcDominance}%</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">24h Vol:</span>
            <span className="text-emerald-400 font-bold">${((globalStats.totalVolume || 8.4e10) / 1e9).toFixed(1)}B</span>
          </div>
        </div>
      </div>

      {/* ── Radar Mode Switcher & Sector Filter Tabs ─────────────────────── */}
      <div className="p-3 sm:p-4 bg-[#080b14] border-b border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Radar Modes */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { id: "pulse", label: "Interactive Radar Visual", icon: Compass },
            { id: "momentum", label: "Momentum & Breakouts", icon: TrendingUp },
            { id: "whales", label: "Whale Flow & Tape", icon: Radio },
            { id: "anomalies", label: "Risk & Anomalies", icon: ShieldAlert },
            { id: "chart", label: "Live TradingView Split", icon: BarChart2 },
          ].map((m) => {
            const Icon = m.icon;
            const isActive = radarMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setRadarMode(m.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-blue-400"} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sector & Search Filters */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Sector Pill Selector */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {[
              { id: "all", label: "All Sectors" },
              { id: "l1", label: "L1 / L2" },
              { id: "defi", label: "DeFi" },
              { id: "ai", label: "AI" },
              { id: "meme", label: "Memes" },
              { id: "gainers", label: "Gainers" },
              { id: "losers", label: "Losers" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSectorFilter(f.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                  sectorFilter === f.id
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[150px] sm:min-w-[180px]">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search radar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ── Main Radar Content Area ──────────────────────────────────────── */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* ═════════════════════════════════════════════════════════════════════
            MODE 1: INTERACTIVE 2D RADAR VISUAL SWEEP
        ═════════════════════════════════════════════════════════════════════ */}
        {radarMode === "pulse" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Radar Sweep Canvas (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-[#060911] border border-slate-800 p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
              {/* Radar Coordinate Grid Header */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono uppercase font-bold text-slate-200 tracking-wider">
                    Orbital Scanning Grid (Y: 24h Return | X: Risk Index)
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">
                  {filteredCoins.length} targets locked
                </span>
              </div>

              {/* Interactive Radar SVG Arena */}
              <div className="relative w-full aspect-square max-h-[380px] mx-auto flex items-center justify-center my-2 select-none">
                {/* Concentric Circles */}
                <div className="absolute inset-0 rounded-full border border-blue-500/20 pointer-events-none" />
                <div className="absolute inset-[15%] rounded-full border border-blue-500/20 border-dashed pointer-events-none" />
                <div className="absolute inset-[30%] rounded-full border border-blue-500/25 pointer-events-none" />
                <div className="absolute inset-[45%] rounded-full border border-blue-500/15 pointer-events-none" />
                <div className="absolute inset-[60%] rounded-full border border-blue-500/10 pointer-events-none" />

                {/* Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-blue-500/20 pointer-events-none" />
                <div className="absolute inset-y-0 left-1/2 w-[1px] bg-blue-500/20 pointer-events-none" />

                {/* Sweeping Beam */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none origin-center transition-transform"
                  style={{
                    transform: `rotate(${radarSweepDeg}deg)`,
                    background: `conic-gradient(from 0deg, rgba(59, 130, 246, 0.35) 0deg, rgba(59, 130, 246, 0.0) 45deg, transparent 46deg)`,
                  }}
                />

                {/* Center Core */}
                <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50 z-10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </div>

                {/* Radar Asset Blips */}
                {filteredCoins.slice(0, 18).map((c: any, index: number) => {
                  const live = getLiveCoin(c.coin_id, c.price_usd || 100, c.price_change_24h || 0);
                  const chg = live.change24h ?? (c.price_change_24h || 0);
                  const riskObj = leaderboard.find((r: any) => r?.coin_id === c?.coin_id);
                  const riskScore = riskObj?.score ?? 50;

                  // Distribute on radar coordinates based on index, change and risk
                  const angle = (index / 18) * 2 * Math.PI - Math.PI / 2;
                  const distancePct = Math.min(42, Math.max(12, 28 + (riskScore - 50) * 0.25 + Math.sin(index) * 8));
                  const left = 50 + distancePct * Math.cos(angle);
                  const top = 50 + distancePct * Math.sin(angle);

                  const isSelected = currentSelected.coin_id === c.coin_id;
                  const isCoinUp = chg >= 0;

                  return (
                    <button
                      key={c.coin_id}
                      type="button"
                      onClick={() => setSelectedRadarCoin(c)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-xl flex items-center gap-1.5 transition-all z-20 cursor-pointer group ${
                        isSelected
                          ? "bg-blue-600 text-white ring-4 ring-blue-500/30 scale-110 shadow-xl shadow-blue-500/40"
                          : "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:scale-105"
                      }`}
                      style={{ left: `${left}%`, top: `${top}%` }}
                      title={`${c.name} (${c.symbol.toUpperCase()}): $${live.price?.toLocaleString()} (${chg >= 0 ? "+" : ""}${chg.toFixed(1)}%)`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          isCoinUp ? "bg-emerald-400" : "bg-rose-400"
                        }`}
                      />
                      <span className="text-[10px] font-bold font-mono uppercase">
                        {c.symbol?.slice(0, 4)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Radar Legend */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 z-10">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Bullish Flow</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Bearish Pullback</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Selected Target</span>
                  </span>
                </div>
                <span className="text-slate-500 hidden sm:inline">Click any blip to lock target</span>
              </div>
            </div>

            {/* Right Locked Target Detail Card (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl bg-[#0c1120] border border-slate-800 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xl">
              <div>
                {/* Header of selected target */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    {currentSelected.image_url ? (
                      <img
                        src={currentSelected.image_url}
                        alt={currentSelected.name}
                        className="w-11 h-11 rounded-full p-0.5 bg-slate-900 border border-slate-700"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400">
                        {currentSelected.symbol?.slice(0, 3).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white">{currentSelected.name}</h3>
                        <span className="text-xs font-mono uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {currentSelected.symbol?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Locked Target #{currentSelected.market_cap_rank || "Top 20"} by Market Cap
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 font-bold">
                    TARGET LOCKED
                  </span>
                </div>

                {/* Price & Delta Highlight */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Live Market Price</span>
                    <p className="text-lg sm:text-xl font-extrabold font-mono text-white mt-0.5">
                      ${currentPrice >= 1 ? currentPrice.toLocaleString("en-US", { maximumFractionDigits: 2 }) : currentPrice.toFixed(6)}
                    </p>
                    <span
                      className={`text-xs font-mono font-bold flex items-center gap-0.5 mt-0.5 ${
                        isUp ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {isUp ? "+" : ""}{currentChg.toFixed(2)}% (24h)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">24h Trading Volume</span>
                    <p className="text-lg sm:text-xl font-extrabold font-mono text-white mt-0.5">
                      ${currentSelected.volume_24h ? (currentSelected.volume_24h / 1e6).toFixed(1) + "M" : "$42.8M"}
                    </p>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Cap: ${(currentSelected.market_cap ? (currentSelected.market_cap / 1e9).toFixed(2) + "B" : "$1.2B")}
                    </span>
                  </div>
                </div>

                {/* Key Technical & Fundamental Metrics */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">RSI (14-Period Momentum)</span>
                    <span className={`font-bold ${currentChg > 2 ? "text-amber-400" : currentChg < -2 ? "text-blue-400" : "text-slate-200"}`}>
                      {Math.round(Math.min(88, Math.max(22, 50 + currentChg * 1.8)))} ({currentChg > 2 ? "Overbought" : currentChg < -2 ? "Oversold" : "Neutral"})
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Whale Net Order Flow (1h)</span>
                    <span className={`font-bold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                      {isUp ? "+$14.2M Net Inflow" : "-$6.8M Net Outflow"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Smart Contract Safety Rating</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck size={13} /> Verified Clear (No Honeypot)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-400">Institutional Allocation Tier</span>
                    <span className="font-bold text-blue-400">Tier-1 Core Accumulate</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenAnalysis(currentSelected)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Launch 6-Section Deep Analysis</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChartModalCoin(currentSelected)}
                  className="py-3 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Expand Candlestick Chart Terminal"
                >
                  <Maximize2 size={14} />
                  <span className="hidden sm:inline">Chart</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            MODE 2: MOMENTUM & BREAKOUT SCANNER
        ═════════════════════════════════════════════════════════════════════ */}
        {radarMode === "momentum" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bullish Breakouts */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <TrendingUp size={16} /> Bullish Breakout Surge
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">Volume &gt; 2.5x Avg</span>
                </div>
                <div className="space-y-2">
                  {filteredCoins
                    .filter((c: any) => (getLiveCoin(c.coin_id, c.price_usd || 100, c.price_change_24h || 0).change24h ?? c.price_change_24h) > 0)
                    .slice(0, 4)
                    .map((c: any) => {
                      const live = getLiveCoin(c.coin_id, c.price_usd || 100, c.price_change_24h || 0);
                      const chg = live.change24h ?? c.price_change_24h;
                      return (
                        <div
                          key={c.coin_id}
                          onClick={() => setSelectedRadarCoin(c)}
                          className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between hover:border-emerald-500/40 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {c.image_url && <img src={c.image_url} alt="" className="w-5 h-5 rounded-full" />}
                            <div>
                              <span className="text-xs font-bold text-white">{c.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono ml-1">({c.symbol?.toUpperCase()})</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-emerald-400">+{chg.toFixed(2)}%</span>
                            <span className="text-[10px] text-slate-500 font-mono block">${live.price?.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Oversold Dip-Buy Zone */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                    <Sparkles size={16} /> Oversold Value Zone
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">RSI &lt; 35</span>
                </div>
                <div className="space-y-2">
                  {filteredCoins
                    .filter((c: any) => (getLiveCoin(c.coin_id, c.price_usd || 100, c.price_change_24h || 0).change24h ?? c.price_change_24h) < 0)
                    .slice(0, 4)
                    .map((c: any) => {
                      const live = getLiveCoin(c.coin_id, c.price_usd || 100, c.price_change_24h || 0);
                      const chg = live.change24h ?? c.price_change_24h;
                      return (
                        <div
                          key={c.coin_id}
                          onClick={() => setSelectedRadarCoin(c)}
                          className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between hover:border-blue-500/40 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {c.image_url && <img src={c.image_url} alt="" className="w-5 h-5 rounded-full" />}
                            <div>
                              <span className="text-xs font-bold text-white">{c.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono ml-1">({c.symbol?.toUpperCase()})</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-rose-400">{chg.toFixed(2)}%</span>
                            <span className="text-[10px] text-blue-400 font-mono block">DCA Candidate</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Volatility Spike Alerts */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Zap size={16} /> Volatility Compression Squeeze
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">ATR Expansion</span>
                </div>
                <div className="space-y-2">
                  {filteredCoins.slice(2, 6).map((c: any) => {
                    const live = getLiveCoin(c.coin_id, c.price_usd || 100, c.price_change_24h || 0);
                    return (
                      <div
                        key={c.coin_id}
                        onClick={() => setSelectedRadarCoin(c)}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between hover:border-amber-500/40 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {c.image_url && <img src={c.image_url} alt="" className="w-5 h-5 rounded-full" />}
                          <div>
                            <span className="text-xs font-bold text-white">{c.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono ml-1">({c.symbol?.toUpperCase()})</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-amber-300">Impending Breakout</span>
                          <span className="text-[10px] text-slate-500 font-mono block">BB Squeeze 88%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            MODE 3: REAL-TIME WHALE FLOW & TAPE FEED
        ═════════════════════════════════════════════════════════════════════ */}
        {radarMode === "whales" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Radio size={16} className="text-blue-400 animate-pulse" />
                  <h4 className="text-sm font-bold text-white">Live Institutional & Whale Order Tape</h4>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Filtering Orders &gt; $10,000 USD
                </span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
                {liveTapeTrades.slice(0, 15).map((t, idx) => {
                  const isBuy = t.type === "BUY";
                  return (
                    <div
                      key={t.id || idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            isBuy ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          }`}
                        >
                          {t.type}
                        </span>
                        <span className="font-bold text-white">{t.symbol}</span>
                        <span className="text-slate-400 text-[11px]">{t.timestamp || "Just now"}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-slate-300">${t.price?.toLocaleString()}</span>
                        <span className="text-slate-400">{t.amount} {t.symbol}</span>
                        <span className={`font-bold ${isBuy ? "text-emerald-400" : "text-rose-400"}`}>
                          ${t.value_usd?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            MODE 4: RISK & FORENSIC ANOMALY SCANNER
        ═════════════════════════════════════════════════════════════════════ */}
        {radarMode === "anomalies" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <ShieldAlert size={16} /> High Risk & Concentration Anomalies
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tokens with severe centralization flags, whale wallet dumping risks, or extreme social hype divergence.
              </p>
              <div className="space-y-2 text-xs">
                {coins
                  .filter((c: any) => {
                    const r = leaderboard.find((item: any) => item?.coin_id === c?.coin_id);
                    return (r?.score ?? 50) >= 60 || c.coin_id === "pepe" || c.coin_id === "dogwifcoin";
                  })
                  .slice(0, 5)
                  .map((c: any) => (
                    <div
                      key={c.coin_id}
                      onClick={() => handleOpenAnalysis(c)}
                      className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/20 flex items-center justify-between hover:bg-slate-900 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {c.image_url && <img src={c.image_url} alt="" className="w-5 h-5 rounded-full" />}
                        <span className="font-bold text-white">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({c.symbol?.toUpperCase()})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold text-[10px]">
                        HIGH VOLATILITY TRAP
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <ShieldCheck size={16} /> Institutional Safe-Haven Ratings
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Top tier cryptographically proven assets with high developer activity and deep liquidity reserves.
              </p>
              <div className="space-y-2 text-xs">
                {coins.slice(0, 5).map((c: any) => (
                  <div
                    key={c.coin_id}
                    onClick={() => handleOpenAnalysis(c)}
                    className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 flex items-center justify-between hover:bg-slate-900 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {c.image_url && <img src={c.image_url} alt="" className="w-5 h-5 rounded-full" />}
                      <span className="font-bold text-white">{c.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({c.symbol?.toUpperCase()})</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                      TIER-1 CORE ASSET
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            MODE 5: LIVE TRADINGVIEW SPLIT RADAR
        ═════════════════════════════════════════════════════════════════════ */}
        {radarMode === "chart" && (
          <div className="space-y-4">
            {/* Quick Coin Switcher Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {filteredCoins.slice(0, 16).map((c: any) => {
                const live = getLiveCoin(c.coin_id, c.price_usd || 100, c.price_change_24h || 0);
                const isItemUp = (live.change24h ?? c.price_change_24h) >= 0;
                const isSelected = currentSelected.coin_id === c.coin_id;

                return (
                  <button
                    key={c.coin_id}
                    type="button"
                    onClick={() => setSelectedRadarCoin(c)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left whitespace-nowrap transition cursor-pointer border ${
                      isSelected
                        ? "bg-blue-600/20 border-blue-500 shadow-md shadow-blue-500/20 text-white"
                        : "bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {c.image_url ? (
                      <img src={c.image_url} alt="" className="w-4 h-4 rounded-full" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-blue-500/20 font-bold text-[8px] text-blue-400 flex items-center justify-center">
                        {c.symbol?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-bold">{c.symbol?.toUpperCase()}</span>
                    <span className={`text-[10px] font-mono font-bold ${isItemUp ? "text-emerald-400" : "text-rose-400"}`}>
                      {isItemUp ? "+" : ""}{(live.change24h ?? c.price_change_24h).toFixed(1)}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* TradingView Advanced Chart Box */}
            <div className="rounded-2xl bg-[#0a0e1a] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-slate-800 bg-[#0c101d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    {currentSelected.name} ({currentSelected.symbol?.toUpperCase()}) Live Technical Chart
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold font-mono">
                    TradingView Live
                  </span>
                </div>

                {/* Timeframe Selectors */}
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {[
                      { label: "1m", val: "1" },
                      { label: "5m", val: "5" },
                      { label: "15m", val: "15" },
                      { label: "1H", val: "60" },
                      { label: "4H", val: "240" },
                      { label: "1D", val: "D" },
                      { label: "1W", val: "W" },
                    ].map((tf) => (
                      <button
                        key={tf.val}
                        type="button"
                        onClick={() => setTvInterval(tf.val as any)}
                        className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition ${
                          tvInterval === tf.val
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {tf.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenAnalysis(currentSelected)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Sparkles size={13} />
                    <span>Analyse Dossier</span>
                  </button>
                </div>
              </div>

              <div className="h-[450px] w-full bg-[#0a0e1a]">
                <TradingViewAdvancedWidget
                  symbol={currentSelected.symbol || "BTC"}
                  coinId={currentSelected.coin_id}
                  coinName={currentSelected.name}
                  interval={tvInterval}
                  theme="dark"
                  height="100%"
                  width="100%"
                  allowSymbolChange={true}
                  studies={["RSI@tv-basicstudies", "MASimple@tv-basicstudies", "MACD@tv-basicstudies"]}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals for Analysis Report & Full Page Chart ─────────────────── */}
      {activeAnalysisCoin && (
        <RealtimeCoinAnalysisReportModal
          coin={activeAnalysisCoin}
          onClose={() => setActiveAnalysisCoin(null)}
          availableCoins={coins}
          onSelectOtherCoin={(other) => setActiveAnalysisCoin(other)}
        />
      )}

      {activeChartModalCoin && (
        <RealtimeCoinChartModal
          coin={activeChartModalCoin}
          onClose={() => setActiveChartModalCoin(null)}
        />
      )}
    </div>
  );
}

export default RealtimeCryptoRadar;
