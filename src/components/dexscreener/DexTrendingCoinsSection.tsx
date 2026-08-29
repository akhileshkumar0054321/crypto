"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dexScreenerApi } from "@/lib/api";
import { DexTrendingCoin } from "@/types";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Search,
  Zap,
  Activity,
  Flame,
  Copy,
  Check,
  BarChart2,
  LineChart,
  FileText,
  DollarSign,
  Layers,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { RealtimeCoinAnalysisReportModal } from "@/components/analysis/RealtimeCoinAnalysisReportModal";
import { RealtimeCoinChartModal } from "@/components/charts/RealtimeCoinChartModal";
import { CryptoAvatar } from "@/components/ui/CryptoAvatar";

interface DexTrendingCoinsSectionProps {
  initialChain?: string;
  onSelectCoinForReport?: (coin: any) => void;
  showSearchHeader?: boolean;
}

export function DexTrendingCoinsSection({
  initialChain = "all",
  onSelectCoinForReport,
  showSearchHeader = true,
}: DexTrendingCoinsSectionProps) {
  const [selectedChain, setSelectedChain] = useState<string>(initialChain);
  const [searchQuery, setSearchQuery] = useState("");
  const [customScanInput, setCustomScanInput] = useState("");
  const [isScanningCustom, setIsScanningCustom] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Modal states for direct report & chart inspection
  const [activeReportCoin, setActiveReportCoin] = useState<any | null>(null);
  const [activeChartCoin, setActiveChartCoin] = useState<any | null>(null);

  const {
    data: trendingData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["dexscreener-trending"],
    queryFn: async () => {
      const res = await dexScreenerApi.getTrending();
      return res.data;
    },
    refetchInterval: 30_000, // Refresh every 30s
  });

  const coins: DexTrendingCoin[] = trendingData?.coins || [];

  // Filter coins by chain & query
  const filteredCoins = coins.filter((coin) => {
    const matchesChain =
      selectedChain === "all" ||
      coin.chainId.toLowerCase() === selectedChain.toLowerCase();

    const matchesQuery =
      !searchQuery.trim() ||
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.tokenAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (coin.dexId && coin.dexId.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesChain && matchesQuery;
  });

  const handleCopy = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success("Contract address copied to clipboard!");
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleScanCustomToken = async () => {
    if (!customScanInput.trim()) {
      toast.error("Please enter a token contract address, symbol, or DexScreener link");
      return;
    }

    setIsScanningCustom(true);
    try {
      const res = await dexScreenerApi.scanToken(customScanInput.trim());
      if (res.data?.coin) {
        toast.success(`Successfully analyzed ${res.data.coin.name}!`);
        const coinForReport = {
          coin_id: res.data.coin.coin_id,
          name: res.data.coin.name,
          symbol: res.data.coin.symbol,
          price_usd: res.data.coin.price_usd,
          price_change_24h: res.data.coin.price_change_24h,
          image_url: res.data.coin.image_url,
          market_cap: res.data.coin.market_cap,
          volume_24h: res.data.coin.volume_24h,
        };

        if (onSelectCoinForReport) {
          onSelectCoinForReport(coinForReport);
        } else {
          setActiveReportCoin(coinForReport);
        }
      } else {
        toast.error("Token could not be found on DexScreener. Try another address.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to scan token. Check the address.");
    } finally {
      setIsScanningCustom(false);
    }
  };

  const openReport = (coin: DexTrendingCoin) => {
    const coinForReport = {
      coin_id: coin.tokenAddress.toLowerCase(),
      name: coin.name,
      symbol: coin.symbol,
      price_usd: coin.priceUsd,
      price_change_24h: coin.priceChange24h,
      image_url: coin.icon,
      market_cap: coin.marketCap || coin.fdv,
      volume_24h: coin.volume24h,
    };

    if (onSelectCoinForReport) {
      onSelectCoinForReport(coinForReport);
    } else {
      setActiveReportCoin(coinForReport);
    }
  };

  const openChart = (coin: DexTrendingCoin) => {
    setActiveChartCoin({
      coin_id: coin.tokenAddress.toLowerCase(),
      name: coin.name,
      symbol: coin.symbol,
      price_usd: coin.priceUsd,
      price_change_24h: coin.priceChange24h,
      image_url: coin.icon,
      market_cap: coin.marketCap || coin.fdv,
      volume_24h: coin.volume24h,
    });
  };

  const formatMicroPrice = (price: number) => {
    if (!price || isNaN(price)) return "$0.00";
    if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    if (price >= 0.0001) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(8)}`;
  };

  const formatNumber = (num: number) => {
    if (!num || isNaN(num)) return "$0";
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}k`;
    return `$${num.toFixed(0)}`;
  };

  const chains = [
    { id: "all", label: "All Networks" },
    { id: "solana", label: "Solana", color: "text-purple-400 border-purple-500/30" },
    { id: "base", label: "Base", color: "text-blue-400 border-blue-500/30" },
    { id: "ethereum", label: "Ethereum", color: "text-indigo-400 border-indigo-500/30" },
    { id: "bsc", label: "BSC", color: "text-amber-400 border-amber-500/30" },
    { id: "arbitrum", label: "Arbitrum", color: "text-cyan-400 border-cyan-500/30" },
  ];

  return (
    <div className="space-y-6" id="dexscreener-trending-section">
      {/* Search and DexScreener Live Header */}
      {showSearchHeader && (
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>DexScreener Token Profiles API v1</span>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold flex items-center gap-1">
                  <Flame size={12} className="text-amber-400" />
                  <span>Trending Small-Caps</span>
                </div>
              </div>
              <h2 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Trending Microcap & Meme Coins Analysis Engine</span>
              </h2>
              <p className="text-xs text-slate-400">
                Live on-chain analysis reports, liquidity audits, buy/sell pressure gauges, and 6-section forensic breakdowns for trending DEX tokens.
              </p>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition self-start md:self-auto"
            >
              <RefreshCw size={13} className={isRefetching ? "animate-spin text-cyan-400" : "text-slate-400"} />
              <span>{isRefetching ? "Refreshing Feed..." : "Refresh DEX Feed"}</span>
            </button>
          </div>

          {/* Quick Scanner Bar for any custom address / DexScreener Link */}
          <div className="pt-2 border-t border-slate-800/60">
            <p className="text-[11px] font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Zap size={13} className="text-amber-400" />
              <span>Analyze Any Custom Token Address or DexScreener URL:</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Paste Solana Mint / 0x Contract / DexScreener URL (e.g. ByxqbVr9... or https://dexscreener.com/solana/...)"
                  value={customScanInput}
                  onChange={(e) => setCustomScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScanCustomToken()}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
              <button
                onClick={handleScanCustomToken}
                disabled={isScanningCustom}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition whitespace-nowrap"
              >
                <Sparkles size={14} />
                <span>{isScanningCustom ? "Scanning On-Chain..." : "Generate 6-Section Report"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Network Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Chain Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {chains.map((chain) => {
            const isActive = selectedChain === chain.id;
            return (
              <button
                key={chain.id}
                onClick={() => setSelectedChain(chain.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800"
                }`}
              >
                <span>{chain.label}</span>
                {chain.id === "all" && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    {coins.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* In-feed filter input */}
        <div className="relative w-full md:w-64">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by name, symbol, or DEX..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Token Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800" />
                <div className="space-y-1 flex-1">
                  <div className="w-24 h-4 rounded bg-slate-800" />
                  <div className="w-16 h-3 rounded bg-slate-800/60" />
                </div>
              </div>
              <div className="h-20 rounded-xl bg-slate-800/40" />
              <div className="h-8 rounded-xl bg-slate-800/60" />
            </div>
          ))}
        </div>
      ) : filteredCoins.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
            <Search size={22} />
          </div>
          <p className="text-sm font-bold text-white">No trending DEX tokens match your filter</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try choosing &quot;All Networks&quot; or scan any token contract address directly using the top search bar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoins.map((coin) => {
            const isUp24h = coin.priceChange24h >= 0;
            const isUp5m = coin.priceChange5m >= 0;
            const isUp1h = coin.priceChange1h >= 0;

            const buys24 = coin.txns24h?.buys || 0;
            const sells24 = coin.txns24h?.sells || 0;
            const totalTxns = buys24 + sells24;
            const buyPct = totalTxns > 0 ? Math.round((buys24 / totalTxns) * 100) : 50;

            const riskBorder =
              coin.riskLevel === "CRITICAL"
                ? "border-rose-500/30 hover:border-rose-500/60 bg-rose-950/10"
                : coin.riskLevel === "HIGH"
                ? "border-amber-500/30 hover:border-amber-500/60 bg-amber-950/10"
                : "border-slate-800 hover:border-blue-500/40 bg-slate-900/80";

            return (
              <div
                key={coin.id + coin.tokenAddress}
                className={`rounded-2xl border ${riskBorder} p-4 flex flex-col justify-between space-y-4 hover:shadow-xl transition group`}
              >
                {/* Top Info Header */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <CryptoAvatar
                        coinId={coin.id}
                        symbol={coin.symbol}
                        name={coin.name}
                        imageUrl={coin.icon}
                        size="md"
                        className="w-10 h-10 flex-shrink-0"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-sm text-white truncate max-w-[130px]">
                            {coin.name}
                          </h3>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            ${coin.symbol}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300 font-semibold uppercase">
                            {coin.chainId}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {coin.dexId}
                          </span>
                          {coin.cto && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                              CTO
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Risk Badge */}
                    <div className="flex flex-col items-end">
                      <div
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1 ${
                          coin.riskLevel === "CRITICAL"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : coin.riskLevel === "HIGH"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        }`}
                      >
                        {coin.riskLevel === "CRITICAL" ? (
                          <ShieldAlert size={11} />
                        ) : coin.riskLevel === "HIGH" ? (
                          <AlertTriangle size={11} />
                        ) : (
                          <ShieldCheck size={11} />
                        )}
                        <span>Risk {coin.riskScore}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Multi-Timeframe Velocity */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Price USD</span>
                      <span className="text-sm font-black text-white">
                        {formatMicroPrice(coin.priceUsd)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block">5m</span>
                        <span className={isUp5m ? "text-emerald-400" : "text-rose-400"}>
                          {isUp5m ? "+" : ""}
                          {coin.priceChange5m.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block">1h</span>
                        <span className={isUp1h ? "text-emerald-400" : "text-rose-400"}>
                          {isUp1h ? "+" : ""}
                          {coin.priceChange1h.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block">24h</span>
                        <span className={isUp24h ? "text-emerald-400" : "text-rose-400"}>
                          {isUp24h ? "+" : ""}
                          {coin.priceChange24h.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Liquidity, Volume & FDV Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block">24h Volume</span>
                      <span className="font-bold text-slate-200">
                        {formatNumber(coin.volume24h)}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block">Liquidity</span>
                      <span className="font-bold text-slate-200">
                        {formatNumber(coin.liquidityUsd)}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block">FDV / MC</span>
                      <span className="font-bold text-slate-200">
                        {formatNumber(coin.fdv || coin.marketCap)}
                      </span>
                    </div>
                  </div>

                  {/* Buy vs Sell Pressure Bar */}
                  {totalTxns > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="text-emerald-400 font-semibold">{buys24} Buys ({buyPct}%)</span>
                        <span className="text-rose-400 font-semibold">{sells24} Sells ({100 - buyPct}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-rose-950 overflow-hidden flex">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${buyPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Token Description / Narrative Preview */}
                  {coin.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 italic leading-relaxed">
                      &quot;{coin.description}&quot;
                    </p>
                  )}

                  {/* Contract Address & DexScreener Link */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/40">
                    <button
                      onClick={(e) => handleCopy(coin.tokenAddress, e)}
                      className="flex items-center gap-1 hover:text-slate-200 font-mono text-[10px] bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800"
                      title="Click to copy token address"
                    >
                      {copiedAddress === coin.tokenAddress ? (
                        <Check size={11} className="text-emerald-400" />
                      ) : (
                        <Copy size={11} />
                      )}
                      <span>
                        {coin.tokenAddress.slice(0, 6)}...{coin.tokenAddress.slice(-4)}
                      </span>
                    </button>

                    <a
                      href={coin.dexScreenerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <span>DexScreener</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>

                {/* Bottom Action Triggers */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => openReport(coin)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition transform active:scale-[0.98]"
                  >
                    <Sparkles size={14} className="text-cyan-200" />
                    <span>Generate 6-Section Deep Report</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openChart(coin)}
                      className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <LineChart size={12} className="text-cyan-400" />
                      <span>Live Candles</span>
                    </button>
                    <button
                      onClick={() => openReport(coin)}
                      className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <FileText size={12} className="text-indigo-400" />
                      <span>Audit Breakdown</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6-Section Deep Audit Modal for Small Coins */}
      {activeReportCoin && (
        <RealtimeCoinAnalysisReportModal
          coin={activeReportCoin}
          onClose={() => setActiveReportCoin(null)}
          availableCoins={filteredCoins.map((c) => ({
            coin_id: c.tokenAddress.toLowerCase(),
            name: c.name,
            symbol: c.symbol,
            price_usd: c.priceUsd,
            price_change_24h: c.priceChange24h,
            image_url: c.icon,
            market_cap: c.marketCap || c.fdv,
            volume_24h: c.volume24h,
          }))}
        />
      )}

      {/* Live Candlestick Graph Modal for Small Coins */}
      {activeChartCoin && (
        <RealtimeCoinChartModal
          coin={activeChartCoin}
          onClose={() => setActiveChartCoin(null)}
        />
      )}
    </div>
  );
}
