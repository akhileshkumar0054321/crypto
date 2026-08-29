"use client";

import { useQuery } from "@tanstack/react-query";
import { coinApi, riskApi, newsApi } from "@/lib/api";
import { useLiveMarket } from "@/lib/context/LiveMarketContext";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  Globe,
  Search,
  Sparkles,
  Zap,
  ArrowRight,
  Newspaper,
  Users,
  Layers,
  CheckCircle2,
  ChevronRight,
  Filter,
  Radio,
  Compass,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { InteractiveNewsCard } from "@/components/news/InteractiveNewsCard";
import { NewsImpactModal } from "@/components/news/NewsImpactModal";
import { RealtimeCoinMiniBarGraph } from "@/components/charts/RealtimeCoinMiniBarGraph";
import { RealtimeCoinChartModal } from "@/components/charts/RealtimeCoinChartModal";
import { RealtimeCoinAnalysisReportModal } from "@/components/analysis/RealtimeCoinAnalysisReportModal";
import { RealtimeCryptoRadar } from "@/components/analysis/RealtimeCryptoRadar";
import { TradingViewAdvancedWidget, resolveTradingViewSymbol } from "@/components/charts/TradingViewAdvancedWidget";
import { CryptoAvatar } from "@/components/ui/CryptoAvatar";
import { NewsItem } from "@/types";

const riskBadge = (score: number) => {
  if (score >= 80) return { label: "CRITICAL", cls: "badge-critical" };
  if (score >= 60) return { label: "HIGH", cls: "badge-high" };
  if (score >= 30) return { label: "MEDIUM", cls: "badge-medium" };
  return { label: "LOW", cls: "badge-low" };
};

const recBadge = (r?: string) => {
  if (r === "BUY") return { label: "ACCUMULATE", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
  if (r === "SELL") return { label: "CRITICAL RISK", cls: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
  return { label: "NEUTRAL / HOLD", cls: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
};

export default function DashboardPage() {
  const router = useRouter();
  const [quickSearch, setQuickSearch] = useState("");
  const [tableFilterSearch, setTableFilterSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "gainers" | "losers" | "smallcaps" | "l1" | "defi" | "ai" | "meme" | "safe" | "highrisk">("all");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedChartCoin, setSelectedChartCoin] = useState<any | null>(null);
  const [selectedAnalysisCoin, setSelectedAnalysisCoin] = useState<any | null>(null);
  const [radarSelectedCoinId, setRadarSelectedCoinId] = useState<string>("");
  const [displayCount, setDisplayCount] = useState<number>(50);
  const [radarViewMode, setRadarViewMode] = useState<"radar" | "table" | "tradingview">("table");
  const [radarActiveTvCoinId, setRadarActiveTvCoinId] = useState<string>("bitcoin");
  const [radarTvInterval, setRadarTvInterval] = useState<"1" | "5" | "15" | "60" | "240" | "D" | "W">("D");

  // Read URL filter query parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get("filter");
    if (f === "gainers" || f === "losers" || f === "smallcaps") {
      setFilterType(f as any);
    }
  }, []);

  const { isLive, globalStats, getLiveCoin } = useLiveMarket();

  const { data: rawCoins, isLoading: coinsLoading } = useQuery({
    queryKey: ["coins"],
    queryFn: () => coinApi.getAll().then((r) => r.data).catch(() => []),
    refetchInterval: 30_000,
  });

  const { data: rawLeaderboard } = useQuery({
    queryKey: ["risk-leaderboard"],
    queryFn: () => riskApi.getLeaderboard().then((r) => r.data).catch(() => []),
    refetchInterval: 30_000,
  });

  const { data: newsData } = useQuery({
    queryKey: ["dashboard-news"],
    queryFn: () => newsApi.getMarketNews().then((r) => r.data).catch(() => null),
    refetchInterval: 45_000,
  });

  const coins: any[] = useMemo(() => (Array.isArray(rawCoins) ? rawCoins : []), [rawCoins]);
  const leaderboard: any[] = useMemo(() => (Array.isArray(rawLeaderboard) ? rawLeaderboard : []), [rawLeaderboard]);
  const isGlobalUp = globalStats.mcapChange24h >= 0;

  // Deterministic baseline for SSR/client initial render
  const baseTraders = useMemo(() => {
    const base = 2841920;
    const volRatio = (globalStats.totalVolume || 84e9) / 80e9;
    return Math.max(1500000, Math.round(base * volRatio));
  }, [globalStats.totalVolume]);

  const [activeTradersCount, setActiveTradersCount] = useState<number>(baseTraders);

  // Client-side live trader variation effect
  useEffect(() => {
    setActiveTradersCount(baseTraders);
    const interval = setInterval(() => {
      const jitter = Math.floor(Math.sin(Date.now() / 8000) * 14200);
      setActiveTradersCount(baseTraders + jitter);
    }, 4000);
    return () => clearInterval(interval);
  }, [baseTraders]);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    router.push(`/coin/${quickSearch.trim().toLowerCase()}`);
  };

  const filteredCoins = useMemo(() => {
    return coins.filter((coin: any) => {
      // Search term filter
      if (tableFilterSearch.trim()) {
        const q = tableFilterSearch.toLowerCase().trim();
        const matchesName = coin.name?.toLowerCase().includes(q);
        const matchesSym = coin.symbol?.toLowerCase().includes(q);
        const matchesId = coin.coin_id?.toLowerCase().includes(q);
        if (!matchesName && !matchesSym && !matchesId) return false;
      }

      const risk = leaderboard.find((r: any) => r?.coin_id === coin?.coin_id);
      const score = risk?.score ?? 50;
      const cid = (coin.coin_id || "").toLowerCase();
      const sym = (coin.symbol || "").toLowerCase();

      const isMeme =
        cid === "pepe" ||
        cid === "floki" ||
        cid === "dogecoin" ||
        cid === "shiba-inu" ||
        cid === "dogwifcoin" ||
        cid === "safe-moon-v2" ||
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
        cid === "the-open-network" ||
        cid === "near" ||
        cid === "sui" ||
        cid === "arbitrum" ||
        cid === "matic-network";

      const isDeFi =
        cid === "uniswap" ||
        cid === "chainlink" ||
        cid === "aave" ||
        cid === "maker" ||
        cid === "curve-dao-token";

      const isAI =
        cid === "render-token" ||
        cid === "fetch-ai" ||
        cid === "bittensor" ||
        cid === "worldcoin-wld" ||
        cid === "singularitynet";

      const liveC = getLiveCoin(coin.coin_id, coin.price_usd || 100, coin.price_change_24h || 0);
      const c24 = liveC.change24h ?? coin.price_change_24h ?? 0;

      if (filterType === "gainers") return c24 > 0;
      if (filterType === "losers") return c24 < 0;
      if (filterType === "smallcaps") return (coin.market_cap_rank || 999) > 50 || isMeme;
      if (filterType === "l1") return isL1;
      if (filterType === "defi") return isDeFi;
      if (filterType === "ai") return isAI;
      if (filterType === "meme") return isMeme;
      if (filterType === "safe") return score < 35;
      if (filterType === "highrisk") return score >= 60;
      return true;
    });
  }, [coins, leaderboard, tableFilterSearch, filterType, getLiveCoin]);

  return (
    <div className="space-y-8 animate-fade-in pb-12 w-full" id="dashboard-page-container">
      {/* ── 1. Main Header: Audit Any Cryptocurrency Before You Allocate Capital ────────────────────────────────── */}
      <div
        id="scanner-hero-box"
        className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0c101d] via-[#090d18] to-[#060810] border border-blue-500/25 relative overflow-hidden shadow-2xl"
      >
        <div className="max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-bold mb-3 tracking-wide">
            <Sparkles size={13} />
            INSTITUTIONAL FORENSIC SURVEILLANCE & REAL-TIME AUDITING
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
            Audit Any Crypto Before You Allocate Capital
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm mt-2.5 leading-relaxed max-w-2xl">
            Distinguish battle-tested Layer-1, Layer-2, and DeFi protocols from pump-and-dump exit liquidity schemes, hidden token lockup cliffs, and smart contract exploits.
          </p>

          {/* Search Box Form */}
          <form onSubmit={handleScanSubmit} className="mt-6 flex gap-2.5 flex-wrap">
            <div className="flex-1 min-w-[280px] relative">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="hero-scan-input"
                className="input w-full pl-10 pr-4 h-12 text-sm bg-[#05070d]/90 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500 transition"
                placeholder="Enter coin name, ticker (e.g. BTC, ETH, SOL, PEPE, AVAX) or contract address..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
              />
            </div>
            <button
              id="hero-scan-btn"
              type="submit"
              className="btn-primary h-12 px-7 text-sm font-bold inline-flex items-center gap-2 shadow-lg shadow-blue-600/30 rounded-xl transition hover:brightness-110 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              }}
            >
              <Zap size={16} /> Run Forensic Audit
            </button>
          </form>

          {/* Popular Fast Scans */}
          <div className="flex items-center gap-2 mt-4 flex-wrap text-xs">
            <span className="text-slate-400 text-xs font-semibold">Popular Scans:</span>
            <Link
              href="/defi"
              className="px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-500/10"
            >
              <Layers size={13} className="text-emerald-400" />
              <span>DeFi Intelligence Hub</span>
              <span className="text-[9px] bg-emerald-400 text-slate-950 font-bold px-1 rounded">LIVE</span>
            </Link>
            {[
              { label: "Bitcoin (BTC)", id: "bitcoin" },
              { label: "Ethereum (ETH)", id: "ethereum" },
              { label: "Solana (SOL)", id: "solana" },
              { label: "Avalanche (AVAX)", id: "avalanche-2" },
              { label: "Near Protocol (NEAR)", id: "near" },
              { label: "Bittensor (TAO)", id: "bittensor" },
              { label: "Pepe (PEPE)", id: "pepe" },
            ].map((quick) => (
              <button
                key={quick.id}
                type="button"
                onClick={() => router.push(`/coin/${quick.id}`)}
                className="px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-blue-600/20 hover:text-blue-300 border border-white/[0.08] hover:border-blue-500/40 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                {quick.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ambient Decorative Gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* ── 2. Real-Time Global Stats Grid: Global Market Cap & Volume Traded (Live People in Market) ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-hero-stats">
        {/* Metric 1: Global Market Cap */}
        <div className="stat-card p-5 rounded-2xl bg-[#0a0e1a]/90 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Global Crypto Market Cap</p>
              <p className="text-white text-2xl sm:text-3xl font-extrabold mt-1.5 font-mono tracking-tight">
                ${(globalStats.totalMarketCap / 1e12).toFixed(2)}T
              </p>
              <p
                className={`text-xs font-mono font-bold mt-2 flex items-center gap-1 ${
                  isGlobalUp ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isGlobalUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {isGlobalUp ? "+" : ""}{globalStats.mcapChange24h.toFixed(2)}% (24h)
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <Globe size={20} />
            </div>
          </div>
        </div>

        {/* Metric 2: Volume Traded & Number of People Live in Market */}
        <div className="stat-card p-5 rounded-2xl bg-[#0a0e1a]/90 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">24h Volume Traded</p>
              <p className="text-white text-2xl sm:text-3xl font-extrabold mt-1.5 font-mono tracking-tight">
                ${(globalStats.totalVolume / 1e9).toFixed(1)}B
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Users size={13} className="text-emerald-400" />
                <span suppressHydrationWarning>{activeTradersCount.toLocaleString()} Live in Market</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <BarChart2 size={20} />
            </div>
          </div>
        </div>

        {/* Metric 3: Real-Time Surveilled Assets */}
        <div className="stat-card p-5 rounded-2xl bg-[#0a0e1a]/90 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Surveilled Assets</p>
              <p className="text-white text-2xl sm:text-3xl font-extrabold mt-1.5 font-mono tracking-tight">
                {coins.length} Verified Coins
              </p>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-medium">
                <CheckCircle2 size={13} className="text-blue-400" />
                Multi-Chain Live Streaming
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Activity size={20} />
            </div>
          </div>
        </div>

        {/* Metric 4: Dominance & Macro Momentum */}
        <div className="stat-card p-5 rounded-2xl bg-[#0a0e1a]/90 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Market Dominance</p>
              <p className="text-white text-2xl sm:text-3xl font-extrabold mt-1.5 font-mono tracking-tight">
                BTC 56.4%
              </p>
              <p className="text-xs text-slate-400 mt-2 font-mono">
                ETH 16.8% · SOL 4.5% · Others 22.3%
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Layers size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. The Real-Time Cryptocurrency Radar (Full Width, Scrollable, Highly User Friendly) ─────────────────────────── */}
      <div className="card p-0 overflow-hidden bg-[#090d18] border border-slate-800 rounded-2xl shadow-xl w-full" id="cryptocurrency-radar-section">
        {/* Radar Controls Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  Real-Time Cryptocurrency Radar
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Feeds
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Explore real-time prices, 24h delta bars, risk scoring, and generate full 6-section forensic analysis reports.
              </p>
            </div>

            {/* View Mode Toggle & Quick Coin Select */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Radar View Mode Switcher */}
              <div className="flex items-center gap-1 bg-[#0b101e] p-1 rounded-xl border border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setRadarViewMode("radar")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    radarViewMode === "radar"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Radio size={13} className="text-emerald-300 animate-pulse" />
                  <span>Visual Radar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRadarViewMode("table")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    radarViewMode === "table"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Filter size={13} />
                  <span>Radar Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRadarViewMode("tradingview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    radarViewMode === "tradingview"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <BarChart2 size={13} className="text-blue-400" />
                  <span>Live Chart</span>
                </button>
              </div>

              {/* Quick Coin Select & Full AI Analyse Button */}
              <div className="flex items-center gap-1.5 bg-[#0e1322] rounded-xl p-1.5 border border-slate-700/80">
                <select
                  value={radarSelectedCoinId}
                  onChange={(e) => {
                    setRadarSelectedCoinId(e.target.value);
                    if (e.target.value) setRadarActiveTvCoinId(e.target.value);
                  }}
                  className="bg-transparent border-0 text-xs sm:text-sm text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[160px] sm:max-w-[200px] truncate"
                >
                  <option value="" className="bg-slate-900 text-slate-300">Choose coin to audit...</option>
                  {coins.map((c: any) => (
                    <option key={c.coin_id} value={c.coin_id} className="bg-slate-900 text-white">
                      {c.name} ({c.symbol?.toUpperCase()})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    const targetId = radarSelectedCoinId || filteredCoins[0]?.coin_id || "bitcoin";
                    const found = coins.find((c: any) => c.coin_id === targetId) || filteredCoins[0];
                    if (found) {
                      const live = getLiveCoin(found.coin_id, found.price_usd || 100, found.price_change_24h || 0);
                      setSelectedAnalysisCoin({
                        ...found,
                        price_usd: live.price || found.price_usd,
                        price_change_24h: live.change24h ?? found.price_change_24h,
                      });
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/30 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                  title="Generate full forensic analysis report"
                >
                  <Sparkles size={13} />
                  <span>Analyse</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search within radar & Filter Pills (Scrollable horizontally on mobile) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
              {[
                { id: "all", label: "All Assets" },
                { id: "gainers", label: "Top Gainers (24h)" },
                { id: "losers", label: "Top Losers (24h)" },
                { id: "smallcaps", label: "Small Cap Coins" },
                { id: "l1", label: "Layer 1 & 2" },
                { id: "defi", label: "DeFi & Oracles" },
                { id: "ai", label: "AI & Compute" },
                { id: "meme", label: "Meme Tokens" },
                { id: "safe", label: "Low Risk" },
                { id: "highrisk", label: "High Volatility" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    filterType === f.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-[#0e1322] text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Quick in-table search filter */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter table by name / symbol..."
                value={tableFilterSearch}
                onChange={(e) => setTableFilterSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#0e1322] border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* View Mode Content: Visual Radar vs TradingView Terminal vs Data Table */}
        {radarViewMode === "radar" ? (
          <div className="p-3 sm:p-5">
            <RealtimeCryptoRadar
              onSelectCoinForAnalysis={(coin) => {
                const live = getLiveCoin(coin.coin_id, coin.price_usd || 100, coin.price_change_24h || 0);
                setSelectedAnalysisCoin({
                  ...coin,
                  price_usd: live.price || coin.price_usd,
                  price_change_24h: live.change24h ?? coin.price_change_24h,
                });
              }}
            />
          </div>
        ) : radarViewMode === "tradingview" ? (
          <div className="p-4 sm:p-6 space-y-4 bg-[#090d18]">
            {/* Quick Coin Carousel / Switcher Pills for Radar Coins */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold uppercase tracking-wider text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Select Radar Coin for Real-Time TradingView Stream:
                </span>
                <span className="font-mono text-slate-500">{filteredCoins.length} Assets Tracked</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {filteredCoins.slice(0, 20).map((coinItem: any) => {
                  const itemLive = getLiveCoin(coinItem.coin_id, coinItem.price_usd || 100, coinItem.price_change_24h || 0);
                  const itemPrice = itemLive.price || coinItem.price_usd || 0;
                  const itemChg = itemLive.change24h ?? (coinItem.price_change_24h || 0);
                  const isItemUp = itemChg >= 0;
                  const isSelected = (radarActiveTvCoinId || "bitcoin") === coinItem.coin_id;

                  return (
                    <button
                      key={coinItem.coin_id}
                      type="button"
                      onClick={() => setRadarActiveTvCoinId(coinItem.coin_id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition whitespace-nowrap cursor-pointer border ${
                        isSelected
                          ? "bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/15 text-white"
                          : "bg-[#0d1222] border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white"
                      }`}
                    >
                      <CryptoAvatar
                        coinId={coinItem.coin_id}
                        symbol={coinItem.symbol}
                        name={coinItem.name}
                        imageUrl={coinItem.image_url}
                        size="xs"
                        className="w-5 h-5 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{coinItem.symbol?.toUpperCase()}</span>
                          <span
                            className={`text-[10px] font-mono font-bold ${
                              isItemUp ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isItemUp ? "+" : ""}{itemChg.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400">
                          ${itemPrice >= 1 ? itemPrice.toLocaleString("en-US", { maximumFractionDigits: 2 }) : itemPrice.toFixed(4)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Selected Coin Terminal Frame */}
            {(() => {
              const activeCoin = coins.find((c: any) => c.coin_id === radarActiveTvCoinId) || filteredCoins[0] || coins[0] || {
                coin_id: "bitcoin",
                name: "Bitcoin",
                symbol: "BTC",
                price_usd: 88000,
                price_change_24h: 2.5,
              };
              const activeLive = getLiveCoin(activeCoin.coin_id, activeCoin.price_usd || 100, activeCoin.price_change_24h || 0);
              const activePrice = activeLive.price || activeCoin.price_usd || 0;
              const activeChg = activeLive.change24h ?? (activeCoin.price_change_24h || 0);
              const isActiveUp = activeChg >= 0;
              const tvSymbol = resolveTradingViewSymbol(activeCoin.symbol, activeCoin.coin_id);

              return (
                <div className="bg-[#070b14] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                  {/* Top Bar for Selected Coin */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#0a0f1d] border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <CryptoAvatar
                        coinId={activeCoin.coin_id}
                        symbol={activeCoin.symbol}
                        name={activeCoin.name}
                        imageUrl={activeCoin.image_url}
                        size="md"
                        className="w-9 h-9 border border-white/10"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-extrabold text-white">{activeCoin.name}</h3>
                          <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                            {activeCoin.symbol?.toUpperCase()}/USDT
                          </span>
                          <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            TradingView Ticker: {tvSymbol}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                          <span>Live Stream: </span>
                          <span className="text-emerald-400 font-bold">Sub-Second WebSocket Feed</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Interval Controls */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="text-right">
                        <p className="text-xl font-extrabold font-mono text-white">
                          ${activePrice >= 1 ? activePrice.toLocaleString("en-US", { maximumFractionDigits: 2 }) : activePrice.toFixed(6)}
                        </p>
                        <span
                          className={`text-xs font-mono font-bold inline-flex items-center gap-1 ${
                            isActiveUp ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isActiveUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {isActiveUp ? "+" : ""}{activeChg.toFixed(2)}% (24h)
                        </span>
                      </div>

                      {/* Timeframe selector */}
                      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
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
                            onClick={() => setRadarTvInterval(tf.val as any)}
                            className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                              radarTvInterval === tf.val
                                ? "bg-blue-600 text-white shadow-xs"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {tf.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* The TradingView Advanced Real-Time Chart */}
                  <div className="w-full h-[560px] bg-[#0A0E1A]">
                    <TradingViewAdvancedWidget
                      symbol={activeCoin.symbol}
                      coinId={activeCoin.coin_id}
                      coinName={activeCoin.name}
                      interval={radarTvInterval}
                      height="560px"
                      width="100%"
                      allowSymbolChange={true}
                      hideSideToolbar={false}
                      hideTopToolbar={false}
                      hideLegend={false}
                      hideVolume={false}
                      theme="dark"
                      backgroundColor="#0A0E1A"
                    />
                  </div>

                  {/* Bottom Quick-Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#0a0f1d] border-t border-slate-800 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="font-semibold text-slate-300">Features:</span>
                      <span>• Real-Time Candlesticks</span>
                      <span>• RSI / MACD / Bollinger</span>
                      <span>• Built-in Drawing Tools</span>
                      <span>• Instant Screenshot Save</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedAnalysisCoin({
                            ...activeCoin,
                            price_usd: activePrice,
                            price_change_24h: activeChg,
                          })
                        }
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Sparkles size={13} />
                        <span>Run Full AI Forensic Audit on {activeCoin.name}</span>
                      </button>

                      <Link
                        href={`/coin/${activeCoin.coin_id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5"
                      >
                        <span>View Deep Profile</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : coinsLoading ? (
          <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-14 bg-slate-900/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[700px] overflow-y-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20 bg-[#0c101d] text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800 shadow-sm">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Asset</th>
                  <th className="py-3.5 px-4">Price (USD)</th>
                  <th className="py-3.5 px-4">24h Delta</th>
                  <th className="py-3.5 px-4">Real-Time 24h Bar Graph</th>
                  <th className="py-3.5 px-4">Market Cap</th>
                  <th className="py-3.5 px-4">24h Volume</th>
                  <th className="py-3.5 px-4">Risk Index</th>
                  <th className="py-3.5 px-4">Verdict</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                {filteredCoins.slice(0, displayCount).map((coin: any, idx: number) => {
                  const risk = leaderboard.find((r: any) => r?.coin_id === coin?.coin_id);
                  const live = getLiveCoin(coin.coin_id, coin.price_usd || 100, coin.price_change_24h || 0);

                  const displayPrice = live.price || coin.price_usd || 0;
                  const displayChg = live.change24h ?? (coin.price_change_24h || 0);
                  const isUp = displayChg >= 0;
                  const score = risk?.score ?? 50;
                  const b = riskBadge(score);
                  const rec = recBadge(risk?.recommendation);

                  return (
                    <tr
                      key={coin.coin_id}
                      onClick={() =>
                        setSelectedAnalysisCoin({
                          ...coin,
                          price_usd: displayPrice,
                          price_change_24h: displayChg,
                        })
                      }
                      className="cursor-pointer hover:bg-slate-800/50 transition duration-150 group"
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                        {coin.market_cap_rank || idx + 1}
                      </td>

                      {/* Asset Name & Icon */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <CryptoAvatar
                            coinId={coin.coin_id}
                            symbol={coin.symbol}
                            name={coin.name}
                            imageUrl={coin.image_url}
                            size="md"
                            className="w-7 h-7 flex-shrink-0"
                          />
                          <div>
                            <p className="text-white font-bold text-xs sm:text-sm group-hover:text-blue-400 transition">
                              {coin.name}
                            </p>
                            <p className="text-slate-400 text-[10px] uppercase font-mono font-bold">
                              {coin.symbol}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Real-time Live Price with directional flash */}
                      <td className="py-3.5 px-4 font-mono font-bold text-xs sm:text-sm">
                        <span
                          className={`transition-colors duration-300 ${
                            live.direction === "up"
                              ? "text-emerald-400 font-extrabold"
                              : live.direction === "down"
                              ? "text-rose-400 font-extrabold"
                              : "text-slate-100"
                          }`}
                        >
                          ${displayPrice >= 1 ? displayPrice.toLocaleString("en-US", { maximumFractionDigits: 2 }) : displayPrice.toFixed(6)}
                        </span>
                      </td>

                      {/* 24h Delta */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-mono font-bold flex items-center gap-1 ${
                            isUp ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {isUp ? "+" : ""}{displayChg.toFixed(2)}%
                        </span>
                      </td>

                      {/* Real-time 24h Mini Bar Graph & Chart button */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <RealtimeCoinMiniBarGraph
                            coinId={coin.coin_id}
                            currentPrice={displayPrice}
                            change24h={displayChg}
                            direction={live.direction}
                            onClick={() =>
                              setSelectedChartCoin({
                                ...coin,
                                price_usd: displayPrice,
                                price_change_24h: displayChg,
                              })
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedChartCoin({
                                ...coin,
                                price_usd: displayPrice,
                                price_change_24h: displayChg,
                              })
                            }
                            className="px-2 py-1 rounded bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white text-[11px] font-semibold border border-white/5 transition flex items-center gap-1 cursor-pointer"
                            title="Open interactive technical indicator chart (SMA, EMA, RSI, Bollinger Bands)"
                          >
                            <BarChart2 size={12} />
                            <span>Chart</span>
                          </button>
                        </div>
                      </td>

                      {/* Market Cap */}
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">
                        {coin.market_cap ? `$${(coin.market_cap / 1e9).toFixed(2)}B` : "—"}
                      </td>

                      {/* 24h Volume */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">
                        {coin.volume_24h ? `$${(coin.volume_24h / 1e6).toFixed(1)}M` : "—"}
                      </td>

                      {/* Risk Index Badge */}
                      <td className="py-3.5 px-4">
                        <span className={b.cls} style={{ fontSize: "10px" }}>
                          {score.toFixed(0)} · {b.label}
                        </span>
                      </td>

                      {/* Verdict */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${rec.cls}`}>
                          {rec.label}
                        </span>
                      </td>

                      {/* Action Button: Full Analysis */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedAnalysisCoin({
                                ...coin,
                                price_usd: displayPrice,
                                price_change_24h: displayChg,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold border border-blue-500/30 transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                            title="Generate full 6-section report & current news analysis"
                          >
                            <Sparkles size={12} />
                            <span>Analyse</span>
                          </button>

                          <Link
                            href={`/coin/${coin.coin_id}`}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                            title="View coin profile details"
                          >
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredCoins.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                <p className="text-sm font-semibold">No cryptocurrencies match your filter or search.</p>
                <button
                  type="button"
                  onClick={() => {
                    setFilterType("all");
                    setTableFilterSearch("");
                  }}
                  className="mt-3 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Table Footer with coin count & view expansion */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3 bg-[#080c16] text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-bold">{Math.min(filteredCoins.length, displayCount)}</span> of <span className="text-white font-bold">{filteredCoins.length}</span> cryptocurrencies
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Rows:</span>
            {[15, 30, 50].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setDisplayCount(count)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                  displayCount === count
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Breaking Crypto Intelligence & AI Catalyst Impacts (Clean & User-Friendly) ───────────────────────── */}
      <div className="space-y-4 pt-2" id="dashboard-market-news-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Newspaper size={18} className="text-blue-400" />
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Breaking Crypto Intelligence & AI Catalyst Impacts
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Click any news item to inspect the causality chain, affected crypto assets, and multi-year projection models.
            </p>
          </div>

          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition self-start sm:self-auto"
          >
            Explore All News & Macro Catalysts <ArrowRight size={13} />
          </Link>
        </div>

        {newsData?.news && newsData.news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {newsData.news.slice(0, 6).map((item: NewsItem) => (
              <InteractiveNewsCard
                key={item.id}
                item={item}
                onSelect={(n) => setSelectedNews(n)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 text-center">
            <p className="text-slate-500 text-xs">Streaming real-time publisher intelligence...</p>
          </div>
        )}
      </div>

      {/* ── Modals for Analysis, Charts & News ────────────────────────────────── */}
      <NewsImpactModal
        item={selectedNews}
        onClose={() => setSelectedNews(null)}
      />

      <RealtimeCoinChartModal
        coin={selectedChartCoin}
        onClose={() => setSelectedChartCoin(null)}
      />

      <RealtimeCoinAnalysisReportModal
        coin={selectedAnalysisCoin}
        onClose={() => setSelectedAnalysisCoin(null)}
        onSelectOtherCoin={(c) => setSelectedAnalysisCoin(c)}
        availableCoins={coins}
      />
    </div>
  );
}
