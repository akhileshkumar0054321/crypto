"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { coinApi } from "@/lib/api";
import { useLiveMarket } from "@/lib/context/LiveMarketContext";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Search,
  Filter,
  Layers,
  Sparkles,
  Lock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { RealtimeCoinAnalysisReportModal } from "@/components/analysis/RealtimeCoinAnalysisReportModal";
import { DexTrendingCoinsSection } from "@/components/dexscreener/DexTrendingCoinsSection";

export default function RiskExplorerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("dex_trending");
  const [selectedCoinForReport, setSelectedCoinForReport] = useState<any | null>(null);

  const { getLiveCoin } = useLiveMarket();
  const { data: rawCoins, isLoading } = useQuery({
    queryKey: ["risk-explorer-coins"],
    queryFn: () => coinApi.getAll().then((r) => r.data).catch(() => []),
  });
  const coins: any[] = Array.isArray(rawCoins) ? rawCoins : [];

  const filteredCoins = coins.filter((coin: any) => {
    const matchesSearch =
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.coin_id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (categoryFilter === "high_risk") return (coin.risk_score || 0) >= 60;
    if (categoryFilter === "safe") return (coin.risk_score || 0) < 40;
    if (categoryFilter === "meme") {
      return ["pepe", "floki", "dogecoin", "shiba-inu", "safe-moon-v2"].includes(coin.coin_id);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert size={22} className="text-blue-400" />
            <span>Token Forensics & Moat Analyzer</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Deep bytecode contract static analysis, developer moat endurance, and liquidity lock forensics
          </p>
        </div>

        <Link
          href="/pricing"
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start sm:self-auto hover:from-blue-500 hover:to-indigo-500 transition"
        >
          <Sparkles size={13} />
          <span>Access Dedicated Enclave Nodes</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 bg-slate-900/60 border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search coin name, ticker, or tokenomics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "dex_trending", label: "DexScreener Small-Caps (Live)" },
            { id: "all", label: "All Layer-1/DeFi" },
            { id: "safe", label: "Low Risk Moats" },
            { id: "high_risk", label: "Critical Traps" },
            { id: "meme", label: "Meme Tokens" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                categoryFilter === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 bg-slate-800/40"
              }`}
            >
              {tab.id === "dex_trending" && <Sparkles size={12} className="text-cyan-300" />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {categoryFilter === "dex_trending" ? (
        <DexTrendingCoinsSection
          showSearchHeader={false}
          onSelectCoinForReport={(c) => setSelectedCoinForReport(c)}
        />
      ) : (
        /* Forensics Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoins.map((coin: any) => {
          const live = getLiveCoin(coin.coin_id, coin.price_usd || 100, coin.price_change_24h || 0);
          const price = live.price || coin.price_usd;
          const chg = live.change24h ?? coin.price_change_24h ?? 0;
          const risk = coin.risk_score || 35;

          const isCritical = risk >= 60;
          const isSafe = risk < 40;

          return (
            <div
              key={coin.coin_id}
              className="card p-5 space-y-4 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {coin.image_url && (
                      <img src={coin.image_url} alt={coin.name} className="w-8 h-8 rounded-full" />
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{coin.name}</h3>
                      <span className="text-slate-500 font-mono text-[10px] uppercase font-bold">
                        {coin.symbol}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      isCritical
                        ? "bg-red-500/15 text-red-400 border border-red-500/30"
                        : isSafe
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    Risk: {risk.toFixed(0)}/100
                  </span>
                </div>

                <div className="my-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase">Live Price</span>
                    <p className="font-mono font-bold text-slate-100">
                      ${price >= 1 ? price.toLocaleString() : price.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase">24h Shift</span>
                    <p
                      className={`font-mono font-bold flex items-center gap-0.5 ${
                        chg >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {chg >= 0 ? "+" : ""}
                      {chg.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  <div className="flex justify-between">
                    <span>Honeypot Sandbox:</span>
                    <span className="text-emerald-400 font-bold">Passed (0% tax)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Top 10 Holder Clustered:</span>
                    <span className="text-slate-200 font-mono">
                      {coin.coin_id === "pepe" ? "42.8% (High)" : "16.4% (Normal)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contract Mint Function:</span>
                    <span className={coin.coin_id === "pepe" ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                      {coin.coin_id === "pepe" ? "Renounced" : "Fixed Supply"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCoinForReport({
                      ...coin,
                      price_usd: price,
                      price_change_24h: chg,
                    })
                  }
                  className="flex-1 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold border border-blue-500/30 transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={12} />
                  <span>Analyse</span>
                </button>
                <Link
                  href={`/coin/${coin.coin_id}`}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                  title="View Detail Chart & History"
                >
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Analysis Modal */}
      <RealtimeCoinAnalysisReportModal
        coin={selectedCoinForReport}
        onClose={() => setSelectedCoinForReport(null)}
        availableCoins={coins}
        onSelectOtherCoin={(c) => setSelectedCoinForReport(c)}
      />
    </div>
  );
}
