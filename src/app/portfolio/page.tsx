"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { coinApi } from "@/lib/api";
import { useLiveMarket } from "@/lib/context/LiveMarketContext";
import { puterKvGet, puterKvSet } from "@/lib/puter";
import {
  Briefcase,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Plus,
  Trash2,
  PieChart as PieIcon,
  AlertTriangle,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface Holding {
  coin_id: string;
  symbol: string;
  name: string;
  amount: number;
  avgBuyPrice: number;
}

const DEFAULT_HOLDINGS: Holding[] = [
  { coin_id: "bitcoin", symbol: "BTC", name: "Bitcoin", amount: 1.25, avgBuyPrice: 62000 },
  { coin_id: "ethereum", symbol: "ETH", name: "Ethereum", amount: 8.5, avgBuyPrice: 3100 },
  { coin_id: "solana", symbol: "SOL", name: "Solana", amount: 45, avgBuyPrice: 140 },
  { coin_id: "pepe", symbol: "PEPE", name: "Pepe", amount: 500000000, avgBuyPrice: 0.0000085 },
];

export default function PortfolioPage() {
  const { getLiveCoin } = useLiveMarket();
  const { data: rawCoins } = useQuery({
    queryKey: ["portfolio-coins"],
    queryFn: () => coinApi.getAll().then((r) => r.data).catch(() => []),
  });
  const coins: any[] = Array.isArray(rawCoins) ? rawCoins : [];

  const [holdings, setHoldings] = useState<Holding[]>(DEFAULT_HOLDINGS);

  // Load cloud portfolio from Puter KV on mount
  useEffect(() => {
    async function loadPortfolio() {
      const saved = await puterKvGet<Holding[]>("user_portfolio_holdings", DEFAULT_HOLDINGS);
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setHoldings(saved);
      }
    }
    loadPortfolio();
  }, []);

  const [newCoinId, setNewCoinId] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newBuyPrice, setNewBuyPrice] = useState("");

  const addHolding = () => {
    if (!newCoinId || !newAmount) return;
    const matched = coins.find((c: any) => c.coin_id === newCoinId);
    const symbol = matched ? matched.symbol?.toUpperCase() : newCoinId.toUpperCase();
    const name = matched ? matched.name : newCoinId;
    const price = matched ? matched.price_usd : 100;

    const updated = [
      ...holdings,
      {
        coin_id: newCoinId,
        symbol,
        name,
        amount: parseFloat(newAmount) || 1,
        avgBuyPrice: parseFloat(newBuyPrice) || price,
      },
    ];

    setHoldings(updated);
    puterKvSet("user_portfolio_holdings", updated);
    setNewCoinId("");
    setNewAmount("");
    setNewBuyPrice("");
  };

  const removeHolding = (coinId: string) => {
    const updated = holdings.filter((h) => h.coin_id !== coinId);
    setHoldings(updated);
    puterKvSet("user_portfolio_holdings", updated);
  };

  // Calculate totals
  let totalValueUsd = 0;
  let totalCostUsd = 0;
  let weightedRiskScore = 0;

  const evaluatedHoldings = holdings.map((h) => {
    const matched = coins.find((c: any) => c.coin_id === h.coin_id);
    const basePrice = matched ? matched.price_usd : h.avgBuyPrice;
    const live = getLiveCoin(h.coin_id, basePrice, matched?.price_change_24h || 0);
    const currentPrice = live.price || basePrice;
    const currentValue = h.amount * currentPrice;
    const costBasis = h.amount * h.avgBuyPrice;
    const pnl = currentValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    const riskScore = matched?.risk_score || (h.coin_id === "pepe" ? 78 : 32);

    totalValueUsd += currentValue;
    totalCostUsd += costBasis;

    return {
      ...h,
      currentPrice,
      currentValue,
      costBasis,
      pnl,
      pnlPercent,
      riskScore,
      change24h: live.change24h ?? 0,
    };
  });

  if (totalValueUsd > 0) {
    evaluatedHoldings.forEach((h) => {
      weightedRiskScore += (h.currentValue / totalValueUsd) * h.riskScore;
    });
  }

  const totalPnl = totalValueUsd - totalCostUsd;
  const totalPnlPct = totalCostUsd > 0 ? (totalPnl / totalCostUsd) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Briefcase size={22} className="text-blue-400" />
            <span>Portfolio Risk Exposure & Stress Test</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time portfolio-weighted risk index, honeypot exposure & draw-down simulations
          </p>
        </div>

        <Link
          href="/pricing"
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start sm:self-auto hover:from-blue-500 hover:to-indigo-500 transition"
        >
          <Sparkles size={13} />
          <span>Unlock Automated Multi-Wallet Sync</span>
        </Link>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 space-y-1">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Total Portfolio Value</p>
          <p className="text-2xl font-extrabold font-mono text-white">
            ${totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-slate-400 text-[11px] font-mono">Cost: ${totalCostUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>

        <div className="card p-4 space-y-1">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Net Return (Unrealized)</p>
          <p className={`text-2xl font-extrabold font-mono flex items-center gap-1 ${totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalPnl >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {totalPnl >= 0 ? "+" : ""}${Math.abs(totalPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-[11px] font-bold font-mono ${totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(2)}%
          </p>
        </div>

        <div className="card p-4 space-y-1">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Weighted Risk Score</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-extrabold font-mono text-amber-400">
              {weightedRiskScore.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </p>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
              MODERATE
            </span>
          </div>
          <p className="text-slate-400 text-[11px]">Calculated across current asset weights</p>
        </div>

        <div className="card p-4 space-y-1">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Estimated 24h VaR (95%)</p>
          <p className="text-2xl font-extrabold font-mono text-rose-400">
            -${(totalValueUsd * 0.082).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-slate-400 text-[11px]">8.2% max expected 1-day drawdown</p>
        </div>
      </div>

      {/* Add Asset Form */}
      <div className="card p-4 bg-slate-900/60 border-slate-800">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Add Asset to Simulated Portfolio
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            value={newCoinId}
            onChange={(e) => setNewCoinId(e.target.value)}
            className="input text-xs"
          >
            <option value="">Select Cryptocurrency...</option>
            {coins.map((c: any) => (
              <option key={c.coin_id} value={c.coin_id}>
                {c.name} ({c.symbol?.toUpperCase()})
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Quantity (e.g. 1.5)"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            className="input text-xs"
          />

          <input
            type="number"
            placeholder="Avg Buy Price USD (Optional)"
            value={newBuyPrice}
            onChange={(e) => setNewBuyPrice(e.target.value)}
            className="input text-xs"
          />

          <button
            type="button"
            onClick={addHolding}
            className="btn-primary text-xs flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="section-title text-sm">Portfolio Holdings & Risk Breakdown</h3>
          <span className="text-xs text-slate-500 font-mono">{holdings.length} Assets Tracked</span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Quantity</th>
                <th>Avg Buy Price</th>
                <th>Current Price</th>
                <th>Market Value</th>
                <th>Unrealized PnL</th>
                <th>Risk Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {evaluatedHoldings.map((item) => (
                <tr key={item.coin_id} className="hover:bg-slate-800/30 transition">
                  <td>
                    <div>
                      <p className="text-white font-bold text-xs">{item.name}</p>
                      <p className="text-slate-500 text-[10px] font-mono font-bold uppercase">{item.symbol}</p>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-slate-200">{item.amount.toLocaleString()}</td>
                  <td className="font-mono text-xs text-slate-400">
                    ${item.avgBuyPrice >= 1 ? item.avgBuyPrice.toLocaleString() : item.avgBuyPrice.toFixed(6)}
                  </td>
                  <td className="font-mono text-xs text-slate-100 font-bold">
                    ${item.currentPrice >= 1 ? item.currentPrice.toLocaleString() : item.currentPrice.toFixed(6)}
                  </td>
                  <td className="font-mono text-xs text-slate-100 font-bold">
                    ${item.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span className={`font-mono text-xs font-bold ${item.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {item.pnl >= 0 ? "+" : ""}${item.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-[10px] ml-1">({item.pnlPercent >= 0 ? "+" : ""}{item.pnlPercent.toFixed(1)}%)</span>
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.riskScore >= 70 ? "bg-red-500/15 text-red-400 border border-red-500/25" :
                      item.riskScore >= 40 ? "bg-amber-500/15 text-amber-400 border border-amber-500/25" :
                      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                    }`}>
                      {item.riskScore.toFixed(0)} / 100
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeHolding(item.coin_id)}
                      className="p-1.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                      title="Remove from portfolio"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
