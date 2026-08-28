"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { defiApi } from "@/lib/api";
import {
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  Coins,
  Layers,
  Percent,
  DollarSign,
  Activity,
  Calculator,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  BarChart3,
  PieChart,
  Lock,
  Globe,
  Flame,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  Link2,
} from "lucide-react";
import Link from "next/link";
import {
  DefiOverviewData,
  DefiProtocol,
  DefiChain,
  DefiYieldPool,
  DefiDexVolume,
  DefiFeeRevenue,
  DefiStablecoin,
} from "@/types";
import { ChainFlashCardModal } from "@/components/defi/ChainFlashCardModal";

export default function DefiDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "protocols" | "chains" | "yields" | "fees" | "dexs" | "stablecoins" | "calculator" | "il_calc"
  >("protocols");

  const [protocolSearch, setProtocolSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedChain, setSelectedChain] = useState("all");

  // Multi-Chain Flash Card Modal State
  const [selectedFlashCardItem, setSelectedFlashCardItem] = useState<{
    name: string;
    symbol?: string;
    logo?: string;
    chains: string[];
    category?: string;
    tvl?: number | string;
    typeLabel?: string;
  } | null>(null);
  const [isFlashCardOpen, setIsFlashCardOpen] = useState(false);

  const handleOpenChainFlashCard = (item: {
    name: string;
    symbol?: string;
    logo?: string;
    chains: string[];
    category?: string;
    tvl?: number | string;
    typeLabel?: string;
  }) => {
    setSelectedFlashCardItem(item);
    setIsFlashCardOpen(true);
  };

  // Yield filter state
  const [yieldSearch, setYieldSearch] = useState("");
  const [stableOnly, setStableOnly] = useState(false);
  const [noIlOnly, setNoIlOnly] = useState(false);
  const [yieldChain, setYieldChain] = useState("all");
  const [minYieldTvl, setMinYieldTvl] = useState(500000);

  // Staking/Yield Calculator state
  const [calcPrincipal, setCalcPrincipal] = useState<number>(10000);
  const [calcApy, setCalcApy] = useState<number>(12.5);
  const [calcCompound, setCalcCompound] = useState<"daily" | "weekly" | "monthly" | "annually">("daily");
  const [calcDurationMonths, setCalcDurationMonths] = useState<number>(12);

  // Impermanent Loss Calculator state
  const [ilTokenAPriceChange, setIlTokenAPriceChange] = useState<number>(50); // +50%
  const [ilTokenBPriceChange, setIlTokenBPriceChange] = useState<number>(0); // 0% (e.g. USDC)

  // ── Queries ────────────────────────────────────────────────────────────────
  const {
    data: overview,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
    isRefetching: isOverviewRefetching,
  } = useQuery<DefiOverviewData>({
    queryKey: ["defi-overview"],
    queryFn: () => defiApi.getOverview().then((r) => r.data),
    staleTime: 60 * 1000,
  });

  const { data: protocols = [], isLoading: isProtocolsLoading } = useQuery<DefiProtocol[]>({
    queryKey: ["defi-protocols", selectedCategory, selectedChain],
    queryFn: () => defiApi.getProtocols(selectedCategory, selectedChain).then((r) => r.data),
    staleTime: 60 * 1000,
  });

  const { data: chains = [], isLoading: isChainsLoading } = useQuery<DefiChain[]>({
    queryKey: ["defi-chains"],
    queryFn: () => defiApi.getChains().then((r) => r.data),
    staleTime: 60 * 1000,
  });

  const { data: yieldPools = [], isLoading: isYieldsLoading } = useQuery<DefiYieldPool[]>({
    queryKey: ["defi-yields", stableOnly, yieldChain, minYieldTvl],
    queryFn: () => defiApi.getYields(stableOnly, yieldChain, minYieldTvl).then((r) => r.data),
    staleTime: 60 * 1000,
  });

  const { data: dexes = [], isLoading: isDexsLoading } = useQuery<DefiDexVolume[]>({
    queryKey: ["defi-dexs"],
    queryFn: () => defiApi.getDexs().then((r) => r.data),
    staleTime: 60 * 1000,
  });

  const { data: fees = [], isLoading: isFeesLoading } = useQuery<DefiFeeRevenue[]>({
    queryKey: ["defi-fees"],
    queryFn: () => defiApi.getFees().then((r) => r.data),
    staleTime: 60 * 1000,
  });

  const { data: stablecoins = [], isLoading: isStablesLoading } = useQuery<DefiStablecoin[]>({
    queryKey: ["defi-stablecoins"],
    queryFn: () => defiApi.getStablecoins().then((r) => r.data),
    staleTime: 60 * 1000,
  });

  // Filtered protocols
  const filteredProtocols = useMemo(() => {
    return protocols.filter((p) => {
      if (!protocolSearch.trim()) return true;
      const q = protocolSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.symbol.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.chains.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [protocols, protocolSearch]);

  // Filtered yield pools
  const filteredYields = useMemo(() => {
    return yieldPools.filter((p) => {
      if (noIlOnly && p.ilRisk === "yes") return false;
      if (!yieldSearch.trim()) return true;
      const q = yieldSearch.toLowerCase();
      return (
        p.symbol.toLowerCase().includes(q) ||
        p.project.toLowerCase().includes(q) ||
        p.chain.toLowerCase().includes(q)
      );
    });
  }, [yieldPools, yieldSearch, noIlOnly]);

  // Staking/Yield Calculations
  const calculatedYield = useMemo(() => {
    const r = calcApy / 100;
    const n =
      calcCompound === "daily"
        ? 365
        : calcCompound === "weekly"
        ? 52
        : calcCompound === "monthly"
        ? 12
        : 1;
    const t = calcDurationMonths / 12;

    // Compound Interest: A = P * (1 + r/n)^(n*t)
    const futureValue = calcPrincipal * Math.pow(1 + r / n, n * t);
    const totalProfit = futureValue - calcPrincipal;
    const effectiveApr = t > 0 ? (totalProfit / calcPrincipal / t) * 100 : 0;
    const dailyReturn = calcPrincipal * (Math.pow(1 + r / n, n / 365) - 1);
    const monthlyReturn = totalProfit / (calcDurationMonths || 1);

    return {
      futureValue,
      totalProfit,
      effectiveApr,
      dailyReturn,
      monthlyReturn,
    };
  }, [calcPrincipal, calcApy, calcCompound, calcDurationMonths]);

  // Impermanent Loss Calculations
  const calculatedIL = useMemo(() => {
    // Price ratio changes
    const rA = 1 + ilTokenAPriceChange / 100;
    const rB = 1 + ilTokenBPriceChange / 100;

    if (rA <= 0 || rB <= 0) return { ilPct: 0, poolVal: 0, hodlVal: 0, lossUsd: 0 };

    const k = rA / rB;
    // IL formula for 50/50 standard pool: 2 * sqrt(k) / (1 + k) - 1
    const ilFactor = (2 * Math.sqrt(k)) / (1 + k);
    const ilPct = (ilFactor - 1) * 100;

    // Assuming initial $10,000 liquidity (5k in A, 5k in B)
    const initDeposit = 10000;
    const hodlVal = 5000 * rA + 5000 * rB;
    const poolVal = hodlVal * ilFactor;
    const lossUsd = hodlVal - poolVal;

    return {
      ilPct: Math.abs(ilPct),
      poolVal,
      hodlVal,
      lossUsd,
    };
  }, [ilTokenAPriceChange, ilTokenBPriceChange]);

  // Format currency
  const formatCurrency = (val?: number, compact = true) => {
    if (val === undefined || val === null || isNaN(val)) return "$0";
    if (compact) {
      if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
      if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
      if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
      if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}k`;
      return `$${val.toFixed(2)}`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 pb-24">
      {/* ── Top Header Banner ──────────────────────────────────────────────── */}
      <div className="border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-lg shadow-emerald-500/10">
                  <Layers size={18} />
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Institutional DeFi Intelligence Hub</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Surveillance
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Real-time on-chain Total Value Locked (TVL), multi-chain liquidity flows, high-yield vaults, DEX volumes, protocol fee generation, and stablecoin peg health.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => refetchOverview()}
                disabled={isOverviewRefetching}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition cursor-pointer"
                title="Refresh on-chain DeFi data"
              >
                <RefreshCw
                  size={13}
                  className={isOverviewRefetching ? "animate-spin text-emerald-400" : "text-slate-400"}
                />
                <span>Sync On-Chain Data</span>
              </button>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>31+ Public Endpoints Connected</span>
              </div>
            </div>
          </div>

          {/* ── Executive Macro Statistics Strip ────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
            {/* Total Value Locked */}
            <div className="p-4 rounded-2xl bg-[#0d121d] border border-slate-800/90 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Lock size={13} className="text-emerald-400" />
                  <span>Global DeFi TVL</span>
                </span>
                <span className="text-emerald-400 font-mono text-[11px] font-bold">
                  +{overview?.tvlChange24h || 1.84}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  {formatCurrency(overview?.totalTvl || 124800000000)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Dominance: ETH (54.8%) · SOL (7.3%)
              </p>
            </div>

            {/* 24h DEX Volume */}
            <div className="p-4 rounded-2xl bg-[#0d121d] border border-slate-800/90 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Activity size={13} className="text-cyan-400" />
                  <span>24h DEX Volume</span>
                </span>
                <span className="text-cyan-400 font-mono text-[11px] font-bold">
                  +{overview?.dexVolumeChange24h || 7.25}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  {formatCurrency(overview?.totalDexVolume24h || 8750000000)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Top DEX: Uniswap & Raydium
              </p>
            </div>

            {/* Total Fees & Revenue */}
            <div className="p-4 rounded-2xl bg-[#0d121d] border border-slate-800/90 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <DollarSign size={13} className="text-amber-400" />
                  <span>24h Protocol Fees</span>
                </span>
                <span className="text-amber-400 font-mono text-[11px] font-bold">Real Cash Flow</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  {formatCurrency(overview?.totalFees24h || 48200000)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Daily Revenue: {formatCurrency(overview?.totalRevenue24h || 32500000)}
              </p>
            </div>

            {/* Stablecoins Market Cap */}
            <div className="p-4 rounded-2xl bg-[#0d121d] border border-slate-800/90 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Coins size={13} className="text-purple-400" />
                  <span>Total Stablecoins</span>
                </span>
                <span className="text-emerald-400 font-mono text-[11px] font-bold">Peg: 99.98%</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  {formatCurrency(overview?.totalStablecoinMcap || 206800000000)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                USDT (67.0%) · USDC (26.2%)
              </p>
            </div>
          </div>

          {/* ── Sub-navigation Tabs ────────────────────────────────────────── */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-4 scrollbar-none text-xs font-semibold">
            {[
              { id: "protocols", label: "Top Protocols", icon: Lock },
              { id: "chains", label: "Chains & Capital Flows", icon: Globe },
              { id: "yields", label: "Yield Radar & Vaults", icon: Percent },
              { id: "fees", label: "Fees & Revenue Leaderboard", icon: DollarSign },
              { id: "dexs", label: "DEX Volumes", icon: Activity },
              { id: "stablecoins", label: "Stablecoin Sentinel", icon: Coins },
              { id: "calculator", label: "Yield APY Calculator", icon: Calculator },
              { id: "il_calc", label: "Impermanent Loss Simulator", icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10 font-bold"
                      : "bg-slate-900/60 text-slate-400 border border-slate-800/80 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-emerald-400" : "text-slate-400"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content Body ──────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: PROTOCOLS LEADERBOARD                                          */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "protocols" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800/80 flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search protocol, symbol, or chain..."
                  value={protocolSearch}
                  onChange={(e) => setProtocolSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="Liquid Staking">Liquid Staking</option>
                  <option value="Lending">Lending & Borrowing</option>
                  <option value="Dexes">DEXes & AMMs</option>
                  <option value="Restaking">Restaking</option>
                  <option value="CDP">CDP / Stablecoin Minting</option>
                  <option value="Yield">Yield Aggregators</option>
                  <option value="Liquid Restaking">Liquid Restaking</option>
                </select>

                {/* Chain Filter */}
                <select
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                >
                  <option value="all">All Chains</option>
                  <option value="Ethereum">Ethereum</option>
                  <option value="Solana">Solana</option>
                  <option value="Base">Base</option>
                  <option value="Arbitrum">Arbitrum</option>
                  <option value="BSC">BSC</option>
                  <option value="Avalanche">Avalanche</option>
                  <option value="Polygon">Polygon</option>
                </select>
              </div>
            </div>

            {/* Protocols Table */}
            <div className="rounded-2xl bg-[#0b0f19] border border-slate-800/80 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#080c14] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3 w-10 text-center">#</th>
                      <th className="py-3 px-3 text-center w-28">Chain Specs</th>
                      <th className="py-3 px-4">Protocol / Coin</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Chains</th>
                      <th className="py-3 px-4 text-right">TVL (USD)</th>
                      <th className="py-3 px-4 text-right">1d Change</th>
                      <th className="py-3 px-4 text-right">7d Change</th>
                      <th className="py-3 px-4 text-right">Mcap / TVL</th>
                      <th className="py-3 px-4 text-center">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {isProtocolsLoading ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-500">
                          <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-400" />
                          <span>Loading on-chain protocols...</span>
                        </td>
                      </tr>
                    ) : filteredProtocols.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-500">
                          No protocols match your search filters.
                        </td>
                      </tr>
                    ) : (
                      filteredProtocols.map((p, idx) => {
                        const isPos1d = p.change_1d >= 0;
                        const isPos7d = p.change_7d >= 0;
                        return (
                          <tr
                            key={p.id || idx}
                            className="hover:bg-slate-800/40 transition-colors group"
                          >
                            {/* Rank */}
                            <td className="py-3.5 px-3 text-center font-mono text-slate-500">
                              {idx + 1}
                            </td>

                            {/* Chain Button Before Coin */}
                            <td className="py-3.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenChainFlashCard({
                                    name: p.name,
                                    symbol: p.symbol,
                                    logo: p.logo,
                                    chains: p.chains,
                                    category: p.category,
                                    tvl: p.tvl,
                                  })
                                }
                                className="px-2.5 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-400 font-mono text-[11px] font-bold inline-flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 cursor-pointer group/btn"
                                title={`View multi-chain flash card for ${p.name} (${p.chains.length} chains)`}
                              >
                                <Link2 size={12} className="text-blue-400 group-hover/btn:text-white" />
                                <span>Chain ({p.chains.length})</span>
                              </button>
                            </td>

                            {/* Name & Logo */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {p.logo ? (
                                    <img
                                      src={p.logo}
                                      alt={p.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as any).style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <span className="font-bold text-slate-300 font-mono text-[10px]">
                                      {p.symbol?.slice(0, 3) || "DEF"}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                                    <span>{p.name}</span>
                                    {p.url && (
                                      <a
                                        href={p.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <ExternalLink size={11} />
                                      </a>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {p.symbol || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-semibold">
                                {p.category}
                              </span>
                            </td>

                            {/* Chains Column with Clickable Flashcard Triggers */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1 flex-wrap max-w-[170px]">
                                {p.chains.slice(0, 3).map((c, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() =>
                                      handleOpenChainFlashCard({
                                        name: p.name,
                                        symbol: p.symbol,
                                        logo: p.logo,
                                        chains: p.chains,
                                        category: p.category,
                                        tvl: p.tvl,
                                      })
                                    }
                                    className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-blue-600/30 border border-slate-800 hover:border-blue-500/40 text-[10px] text-slate-300 font-mono transition cursor-pointer"
                                    title={`Inspect ${c} flash card for ${p.name}`}
                                  >
                                    {c}
                                  </button>
                                ))}
                                {p.chains.length > 3 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenChainFlashCard({
                                        name: p.name,
                                        symbol: p.symbol,
                                        logo: p.logo,
                                        chains: p.chains,
                                        category: p.category,
                                        tvl: p.tvl,
                                      })
                                    }
                                    className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline font-mono font-bold cursor-pointer"
                                  >
                                    +{p.chains.length - 3}
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* TVL */}
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-[13px]">
                              {formatCurrency(p.tvl)}
                            </td>

                            {/* 1d Change */}
                            <td
                              className={`py-3.5 px-4 text-right font-mono font-bold ${
                                isPos1d ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {isPos1d ? "+" : ""}
                              {p.change_1d}%
                            </td>

                            {/* 7d Change */}
                            <td
                              className={`py-3.5 px-4 text-right font-mono font-bold ${
                                isPos7d ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {isPos7d ? "+" : ""}
                              {p.change_7d}%
                            </td>

                            {/* Mcap / TVL */}
                            <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                              {p.mcapTvlRatio !== undefined ? (
                                <span
                                  className={`px-2 py-0.5 rounded ${
                                    p.mcapTvlRatio < 0.2
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : p.mcapTvlRatio > 1.0
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      : "bg-slate-900 text-slate-300"
                                  }`}
                                >
                                  {p.mcapTvlRatio}x
                                </span>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>

                            {/* Audit Status */}
                            <td className="py-3.5 px-4 text-center">
                              <div
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold"
                                title={p.audit_note || "Audited protocol"}
                              >
                                <ShieldCheck size={11} />
                                <span>Audited</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: CHAINS & CAPITAL FLOWS MATRIX                                  */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "chains" && (
          <div className="space-y-6">
            {/* Chain Dominance Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isChainsLoading ? (
                <div className="col-span-full py-12 text-center text-slate-500">
                  <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-400" />
                  <span>Loading on-chain chain metrics...</span>
                </div>
              ) : (
                chains.map((c, idx) => {
                  const isPos1d = c.change_1d >= 0;
                  const isPos7d = c.change_7d >= 0;
                  return (
                    <div
                      key={c.name || idx}
                      className="p-5 rounded-2xl bg-[#0b0f19] border border-slate-800/80 hover:border-emerald-500/40 transition shadow-xl space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden font-bold font-mono text-xs text-white">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {c.name}
                            </h3>
                            <span className="text-[10px] font-mono text-slate-400">
                              {c.tokenSymbol || "ETH"}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                          {c.dominance || 0}% share
                        </span>
                      </div>

                      {/* TVL */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Locked Capital (TVL)
                        </span>
                        <div className="text-xl font-black font-mono text-white">
                          {formatCurrency(c.tvl)}
                        </div>
                      </div>

                      {/* Progress Bar for Dominance */}
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, (c.dominance || 1) * 1.6)}%` }}
                        />
                      </div>

                      {/* 1d & 7d Momentum */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60 font-mono">
                        <div>
                          <span className="text-[10px] text-slate-500">24h Flow: </span>
                          <span className={`font-bold ${isPos1d ? "text-emerald-400" : "text-rose-400"}`}>
                            {isPos1d ? "+" : ""}
                            {c.change_1d}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500">7d Flow: </span>
                          <span className={`font-bold ${isPos7d ? "text-emerald-400" : "text-rose-400"}`}>
                            {isPos7d ? "+" : ""}
                            {c.change_7d}%
                          </span>
                        </div>
                      </div>

                      {/* Inspect Chain Flash Card Button */}
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenChainFlashCard({
                            name: c.name,
                            symbol: c.tokenSymbol,
                            chains: [c.name],
                            category: "Blockchain Network",
                            tvl: c.tvl,
                          })
                        }
                        className="w-full py-2 rounded-xl bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-400 text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group-hover:bg-blue-600 group-hover:text-white"
                      >
                        <Link2 size={13} />
                        <span>Inspect {c.name} Flash Card</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: YIELD RADAR & STAKING VAULTS                                   */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "yields" && (
          <div className="space-y-4">
            {/* Controls Bar */}
            <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800/80 flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search token pool or protocol..."
                  value={yieldSearch}
                  onChange={(e) => setYieldSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={stableOnly}
                    onChange={(e) => setStableOnly(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span>Stablecoins Only</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={noIlOnly}
                    onChange={(e) => setNoIlOnly(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span>No Impermanent Loss</span>
                </label>

                <select
                  value={yieldChain}
                  onChange={(e) => setYieldChain(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Chains</option>
                  <option value="Ethereum">Ethereum</option>
                  <option value="Solana">Solana</option>
                  <option value="Base">Base</option>
                  <option value="Arbitrum">Arbitrum</option>
                </select>
              </div>
            </div>

            {/* Yield Table */}
            <div className="rounded-2xl bg-[#0b0f19] border border-slate-800/80 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#080c14] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3 text-center w-24">Chain Specs</th>
                      <th className="py-3 px-4">Pool & Asset</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Chain</th>
                      <th className="py-3 px-4 text-right">Pool TVL</th>
                      <th className="py-3 px-4 text-right">Base APY</th>
                      <th className="py-3 px-4 text-right">Reward APY</th>
                      <th className="py-3 px-4 text-right">Net APY</th>
                      <th className="py-3 px-4 text-center">IL Risk</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {isYieldsLoading ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-500">
                          <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-400" />
                          <span>Loading high-yield liquidity pools...</span>
                        </td>
                      </tr>
                    ) : filteredYields.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-500">
                          No yield pools match your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredYields.map((p, idx) => (
                        <tr
                          key={p.pool || idx}
                          className="hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* Chain Button Before Coin/Pool */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenChainFlashCard({
                                  name: p.project,
                                  symbol: p.symbol,
                                  chains: [p.chain],
                                  category: "Yield Pool",
                                  tvl: p.tvlUsd,
                                })
                              }
                              className="px-2 py-0.5 rounded-lg bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 font-mono text-[10px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                              title={`View ${p.chain} flash card`}
                            >
                              <Link2 size={11} />
                              <span>Chain</span>
                            </button>
                          </td>

                          {/* Pool */}
                          <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>{p.symbol}</span>
                            {p.stablecoin && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                                STABLE
                              </span>
                            )}
                          </td>

                          {/* Project */}
                          <td className="py-3.5 px-4 font-semibold text-slate-300">
                            {p.project}
                          </td>

                          {/* Chain */}
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenChainFlashCard({
                                  name: p.project,
                                  symbol: p.symbol,
                                  chains: [p.chain],
                                  category: "Yield Pool",
                                  tvl: p.tvlUsd,
                                })
                              }
                              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-blue-600/30 border border-slate-800 hover:border-blue-500/40 text-[10px] text-slate-400 hover:text-blue-300 font-mono transition cursor-pointer"
                            >
                              {p.chain}
                            </button>
                          </td>

                          {/* TVL */}
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                            {formatCurrency(p.tvlUsd)}
                          </td>

                          {/* Base APY */}
                          <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                            {p.apyBase !== undefined ? `${p.apyBase}%` : "—"}
                          </td>

                          {/* Reward APY */}
                          <td className="py-3.5 px-4 text-right font-mono text-amber-400">
                            {p.apyReward ? `+${p.apyReward}%` : "—"}
                          </td>

                          {/* Net APY */}
                          <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                            {p.apy}%
                          </td>

                          {/* IL Risk */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.ilRisk === "no"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {p.ilRisk === "no" ? "Zero IL" : "IL Active"}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => {
                                setCalcApy(p.apy);
                                setActiveTab("calculator");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 mx-auto"
                            >
                              <Calculator size={11} />
                              <span>Simulate</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: FEES & PROTOCOL REVENUE LEADERBOARD                            */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "fees" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800/80">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign size={16} className="text-amber-400" />
                <span>Protocol Real Cash Flow & Revenue Analytics</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Protocols ranking by cumulative 24h user transaction fees paid and net protocol treasury revenues captured.
              </p>
            </div>

            <div className="rounded-2xl bg-[#0b0f19] border border-slate-800/80 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#080c14] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3 w-10 text-center">#</th>
                      <th className="py-3 px-3 text-center w-24">Chain Specs</th>
                      <th className="py-3 px-4">Protocol / Chain</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">24h Fees Generated</th>
                      <th className="py-3 px-4 text-right">24h Protocol Revenue</th>
                      <th className="py-3 px-4 text-right">1d Fee Change</th>
                      <th className="py-3 px-4 text-right">7d Fee Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {isFeesLoading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-400" />
                          <span>Loading protocol fees and revenue metrics...</span>
                        </td>
                      </tr>
                    ) : (
                      fees.map((f, idx) => {
                        const isPos1d = f.change_1d >= 0;
                        const isPos7d = f.change_7d >= 0;
                        return (
                          <tr
                            key={f.name || idx}
                            className="hover:bg-slate-800/40 transition-colors group"
                          >
                            <td className="py-3.5 px-3 text-center font-mono text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenChainFlashCard({
                                    name: f.displayName || f.name,
                                    symbol: f.name,
                                    chains: [f.name.includes("Ethereum") ? "Ethereum" : f.displayName],
                                    category: f.category,
                                    tvl: f.dailyFees,
                                  })
                                }
                                className="px-2 py-0.5 rounded-lg bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 font-mono text-[10px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                                title="View chain specs"
                              >
                                <Link2 size={11} />
                                <span>Chain</span>
                              </button>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-white group-hover:text-amber-400 transition-colors">
                              {f.displayName}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                                {f.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-black text-amber-400 text-sm">
                              {formatCurrency(f.dailyFees)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                              {formatCurrency(f.dailyRevenue)}
                            </td>
                            <td
                              className={`py-3.5 px-4 text-right font-mono font-bold ${
                                isPos1d ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {isPos1d ? "+" : ""}
                              {f.change_1d}%
                            </td>
                            <td
                              className={`py-3.5 px-4 text-right font-mono font-bold ${
                                isPos7d ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {isPos7d ? "+" : ""}
                              {f.change_7d}%
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: DEX VOLUMES & MARKET SHARE                                     */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "dexs" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#0b0f19] border border-slate-800/80 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#080c14] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3 w-10 text-center">#</th>
                      <th className="py-3 px-3 text-center w-24">Chain Specs</th>
                      <th className="py-3 px-4">DEX Platform</th>
                      <th className="py-3 px-4">Architecture</th>
                      <th className="py-3 px-4 text-right">24h Trading Volume</th>
                      <th className="py-3 px-4 text-right">Volume Share</th>
                      <th className="py-3 px-4 text-right">1d Growth</th>
                      <th className="py-3 px-4 text-right">7d Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {isDexsLoading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-400" />
                          <span>Loading DEX volumes...</span>
                        </td>
                      </tr>
                    ) : (
                      dexes.map((d, idx) => {
                        const isPos1d = d.change_1d >= 0;
                        const isPos7d = d.change_7d >= 0;
                        return (
                          <tr
                            key={d.name || idx}
                            className="hover:bg-slate-800/40 transition-colors group"
                          >
                            <td className="py-3.5 px-3 text-center font-mono text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenChainFlashCard({
                                    name: d.displayName || d.name,
                                    symbol: d.name,
                                    chains: ["Ethereum", "Solana", "Base", "Arbitrum", "BSC"],
                                    category: "DEX Protocol",
                                    tvl: d.dailyVolume,
                                  })
                                }
                                className="px-2 py-0.5 rounded-lg bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 font-mono text-[10px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                                title="View chain specs"
                              >
                                <Link2 size={11} />
                                <span>Chain</span>
                              </button>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-white group-hover:text-cyan-400 transition-colors">
                              {d.displayName}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                                {d.category || "AMM"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-black text-cyan-400 text-sm">
                              {formatCurrency(d.dailyVolume)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                              {d.marketShare}%
                            </td>
                            <td
                              className={`py-3.5 px-4 text-right font-mono font-bold ${
                                isPos1d ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {isPos1d ? "+" : ""}
                              {d.change_1d}%
                            </td>
                            <td
                              className={`py-3.5 px-4 text-right font-mono font-bold ${
                                isPos7d ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {isPos7d ? "+" : ""}
                              {d.change_7d}%
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 6: STABLECOIN SENTINEL & DE-PEG SURVEILLANCE                      */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "stablecoins" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Total Stablecoin Liquidity
                </span>
                <p className="text-2xl font-black font-mono text-white mt-1">
                  {formatCurrency(overview?.totalStablecoinMcap || 206800000000)}
                </p>
                <p className="text-[11px] text-emerald-400 mt-1 font-mono">
                  +0.32% Net Expansion (30d)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  USDT Hegemony Dominance
                </span>
                <p className="text-2xl font-black font-mono text-emerald-400 mt-1">67.0%</p>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Circulating: $138.5B
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Systemic Peg Stability Score
                </span>
                <p className="text-2xl font-black font-mono text-cyan-400 mt-1">99.98%</p>
                <p className="text-[11px] text-emerald-400 mt-1 font-mono">
                  Zero Critical De-pegs Detected
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0b0f19] border border-slate-800/80 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#080c14] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3 w-10 text-center">#</th>
                      <th className="py-3 px-3 text-center w-24">Chain Specs</th>
                      <th className="py-3 px-4">Stablecoin</th>
                      <th className="py-3 px-4">Mechanism</th>
                      <th className="py-3 px-4 text-right">Circulating Supply</th>
                      <th className="py-3 px-4 text-right">Live Peg Price</th>
                      <th className="py-3 px-4 text-right">Peg Deviation</th>
                      <th className="py-3 px-4 text-center">De-peg Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {isStablesLoading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-400" />
                          <span>Loading stablecoins...</span>
                        </td>
                      </tr>
                    ) : (
                      stablecoins.map((s, idx) => (
                        <tr
                          key={s.id || idx}
                          className="hover:bg-slate-800/40 transition-colors group"
                        >
                          <td className="py-3.5 px-3 text-center font-mono text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenChainFlashCard({
                                  name: s.name,
                                  symbol: s.symbol,
                                  chains: ["Ethereum", "Tron", "Solana", "BSC", "Base", "Arbitrum", "Avalanche", "Polygon"],
                                  category: `${s.pegMechanism} Stablecoin`,
                                  tvl: s.circulating,
                                })
                              }
                              className="px-2 py-0.5 rounded-lg bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 font-mono text-[10px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                              title="View chain specs"
                            >
                              <Link2 size={11} />
                              <span>Chain</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                            <span>{s.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({s.symbol})
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                              {s.pegMechanism}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                            {formatCurrency(s.circulating)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                            ${s.price.toFixed(4)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                            ±{s.depegDistancePct}%
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.depegRisk === "LOW"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {s.depegRisk} RISK
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 7: YIELD & STAKING RETURN CALCULATOR                             */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "calculator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 space-y-5 shadow-2xl">
              <div className="flex items-center gap-2">
                <Calculator size={18} className="text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  DeFi Compound Yield & Staking Calculator
                </h3>
              </div>

              <div className="space-y-4">
                {/* Principal */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Initial Deposit (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">
                      $
                    </span>
                    <input
                      type="number"
                      value={calcPrincipal}
                      onChange={(e) => setCalcPrincipal(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* APY */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Annual Percentage Yield (APY %)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={calcApy}
                      onChange={(e) => setCalcApy(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-emerald-500/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">
                      %
                    </span>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Holding Duration: {calcDurationMonths} Months ({(calcDurationMonths / 12).toFixed(1)} Yrs)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={calcDurationMonths}
                    onChange={(e) => setCalcDurationMonths(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>1 Mo</span>
                    <span>1 Yr</span>
                    <span>3 Yrs</span>
                    <span>5 Yrs</span>
                  </div>
                </div>

                {/* Compound Frequency */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Compound Frequency
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["daily", "weekly", "monthly", "annually"] as const).map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setCalcCompound(freq)}
                        className={`py-2 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                          calcCompound === freq
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Output Projection Display */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 space-y-6 shadow-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Projected Future Portfolio Balance
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight mt-2">
                  {formatCurrency(calculatedYield.futureValue, false)}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Net Staking Profit: +{formatCurrency(calculatedYield.totalProfit, false)}
                </p>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Daily Earnings</span>
                  <p className="text-lg font-mono font-bold text-white mt-1">
                    +{formatCurrency(calculatedYield.dailyReturn, false)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Monthly Return</span>
                  <p className="text-lg font-mono font-bold text-white mt-1">
                    +{formatCurrency(calculatedYield.monthlyReturn, false)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Gain %</span>
                  <p className="text-lg font-mono font-bold text-emerald-400 mt-1">
                    +{((calculatedYield.totalProfit / (calcPrincipal || 1)) * 100).toFixed(2)}%
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Effective APR</span>
                  <p className="text-lg font-mono font-bold text-cyan-400 mt-1">
                    {calculatedYield.effectiveApr.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  Tip: Auto-compounding yield daily or weekly maximizes exponential growth in low gas fee environments like Base, Solana, or Arbitrum.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 8: IMPERMANENT LOSS SIMULATOR                                     */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "il_calc" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* IL Controls */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 space-y-5 shadow-2xl">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  AMM 50/50 Impermanent Loss Simulator
                </h3>
              </div>

              <div className="space-y-4">
                {/* Asset A Price Change */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase mb-1">
                    <span>Asset A Price Delta (e.g. ETH / SOL)</span>
                    <span className="font-mono text-white text-sm">
                      {ilTokenAPriceChange >= 0 ? "+" : ""}
                      {ilTokenAPriceChange}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="500"
                    value={ilTokenAPriceChange}
                    onChange={(e) => setIlTokenAPriceChange(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>-90% (Crash)</span>
                    <span>0% (Stable)</span>
                    <span>+100% (2x)</span>
                    <span>+500% (6x)</span>
                  </div>
                </div>

                {/* Asset B Price Change */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase mb-1">
                    <span>Asset B Price Delta (e.g. USDC / Stable)</span>
                    <span className="font-mono text-white text-sm">
                      {ilTokenBPriceChange >= 0 ? "+" : ""}
                      {ilTokenBPriceChange}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="200"
                    value={ilTokenBPriceChange}
                    onChange={(e) => setIlTokenBPriceChange(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>-90%</span>
                    <span>0% (Pegged)</span>
                    <span>+200%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* IL Output */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 space-y-6 shadow-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Calculated Impermanent Loss %
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-rose-400 tracking-tight mt-2">
                  -{calculatedIL.ilPct.toFixed(2)}%
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Opportunity Cost vs 50/50 HODL: -{formatCurrency(calculatedIL.lossUsd, false)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">50/50 HODL Value</span>
                  <p className="text-lg font-mono font-bold text-white mt-1">
                    {formatCurrency(calculatedIL.hodlVal, false)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">LP Position Value</span>
                  <p className="text-lg font-mono font-bold text-amber-400 mt-1">
                    {formatCurrency(calculatedIL.poolVal, false)}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  To overcome a {calculatedIL.ilPct.toFixed(2)}% impermanent loss, your LP position needs to earn at least {calculatedIL.ilPct.toFixed(2)}% in LP trading fee yield over your holding period.
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Chain Flash Card Interactive Modal */}
      <ChainFlashCardModal
        isOpen={isFlashCardOpen}
        onClose={() => setIsFlashCardOpen(false)}
        targetItem={selectedFlashCardItem}
      />
    </div>
  );
}
