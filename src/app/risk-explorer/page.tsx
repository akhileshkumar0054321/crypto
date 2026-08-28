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
  TrendingUp,
  TrendingDown,
  Activity,
  Radio,
  Eye,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function MarketIntelligencePage() {
  const [activeTab, setActiveTab] = useState<"signals" | "whales" | "narratives" | "anomalies">("narratives");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeToolModal, setActiveToolModal] = useState<string | null>(null);

  const currentTime = "Updated 9:20:52 AM";

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-600/25 border border-blue-500/40 text-blue-400">
              <Activity size={24} />
            </span>
            <span>Market Intelligence</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            AI-powered signals, whale tracking, narrative analysis & anomaly detection
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800 self-start md:self-auto">
          <Clock size={13} className="text-blue-400" />
          <span>{currentTime}</span>
        </div>
      </div>

      {/* ── Top 4 Stat Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sentiment Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-blue-400" />
            <span>Sentiment</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">68</span>
          </div>
          <p className="text-emerald-400 text-xs font-bold font-mono">Bullish</p>
        </div>

        {/* Bullish Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <TrendingUp size={14} className="text-emerald-400" />
            <span>Bullish</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">3</span>
          </div>
          <p className="text-slate-400 text-xs font-mono">Avg strength 69%</p>
        </div>

        {/* Bearish Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <TrendingDown size={14} className="text-rose-400" />
            <span>Bearish</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">2</span>
          </div>
          <p className="text-slate-400 text-xs font-mono">of 6 total</p>
        </div>

        {/* Whale Activity Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <Eye size={14} className="text-cyan-400" />
            <span>Whale Activity</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-cyan-400">$941.0M</span>
          </div>
          <p className="text-slate-400 text-xs font-mono">5 movements</p>
        </div>
      </div>

      {/* ── Filter Tabs & Main Content Grid ──────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: "signals", label: "AI Signals (6)", icon: Zap },
          { id: "whales", label: "Whale Alerts (5)", icon: Eye },
          { id: "narratives", label: "Narratives (6)", icon: Layers },
          { id: "anomalies", label: "Anomalies (4)", icon: AlertTriangle },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap border ${
                isActive
                  ? "bg-blue-600/20 text-white border-blue-500/50 shadow-md shadow-blue-500/10"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/80"
              }`}
            >
              <IconComponent size={14} className={isActive ? "text-blue-400" : "text-slate-500"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Dynamic Tab Content */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === "narratives" && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers size={18} className="text-blue-400" />
                  <span>Trending Narratives</span>
                </h2>
                <span className="text-xs font-mono text-slate-400">6 Active Sectors</span>
              </div>

              {/* Narrative 1 */}
              <div className="space-y-3 pb-5 border-b border-slate-800/80">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">AI & Compute</h3>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    +18%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  AI infrastructure tokens surging on new GPU compute demand and decentralized model training volume.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {["RNDR", "TAO", "FET", "NEAR"].map((t) => (
                    <span key={t} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Narrative 2 */}
              <div className="space-y-3 pb-5 border-b border-slate-800/80">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Real-World Assets</h3>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    +12%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  RWA tokenization accelerating with institutional adoption, private credit syndication, and on-chain treasury yields.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {["ONDO", "MKR", "COMP", "MAPLE"].map((t) => (
                    <span key={t} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Narrative 3 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Layer 2 Scaling</h3>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    +3%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  L2 ecosystem maturing with growing TVL and transaction counts across optimistic and zero-knowledge rollups.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {["ARB", "OP", "STRK"].map((t) => (
                    <span key={t} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "signals" && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap size={18} className="text-cyan-400" />
                <span>Active AI Intelligence Signals</span>
              </h2>
              <div className="space-y-3">
                {[
                  { title: "Whale Accumulation Surge on Solana", asset: "SOL", confidence: "94%", impact: "Bullish", time: "12m ago" },
                  { title: "DeFi TVL Breakout in Liquid Staking", asset: "ETH", confidence: "89%", impact: "Bullish", time: "34m ago" },
                  { title: "Unusual Options Open Interest Spike", asset: "BTC", confidence: "82%", impact: "Neutral", time: "1h ago" },
                  { title: "Cross-Chain Bridge Outflow Anomaly Detected", asset: "AVAX", confidence: "91%", impact: "Cautious", time: "2h ago" },
                ].map((s, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">{s.asset}</span>
                        <h3 className="text-xs font-bold text-white">{s.title}</h3>
                      </div>
                      <p className="text-[11px] text-slate-400">Confidence: <span className="text-emerald-400 font-mono font-bold">{s.confidence}</span> • {s.time}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      {s.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "whales" && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Eye size={18} className="text-cyan-400" />
                <span>Whale Capital Flow Tracking</span>
              </h2>
              <div className="space-y-3">
                {[
                  { whale: "Binance Cold Storage -> Unknown Wallet", amount: "$340.5M", asset: "BTC", type: "Outflow" },
                  { whale: "Whale 0x71C... transferred to Coinbase", amount: "$185.2M", asset: "ETH", type: "Exchange Deposit" },
                  { whale: "Institutional Treasury Allocation", amount: "$210.0M", asset: "SOL", type: "Accumulation" },
                  { whale: "MakerDAO Foundation Treasury Move", amount: "$125.8M", asset: "MKR", type: "Staking" },
                  { whale: "Unknown Whale Wallet minted stablecoins", amount: "$80.0M", asset: "USDT", type: "Mint" },
                ].map((w, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-white">{w.whale}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{w.type} • {w.asset}</p>
                    </div>
                    <span className="font-mono text-xs font-extrabold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                      {w.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "anomalies" && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-400" />
                <span>Security & On-Chain Anomalies</span>
              </h2>
              <div className="space-y-3">
                {[
                  { title: "Sudden Liquidity Drain on DEX Pair", risk: "Critical", asset: "MEME-COIN", description: "92% liquidity removed within 3 minutes of creation." },
                  { title: "High Gas Fee Spike on Arbitrage Bot", risk: "Medium", asset: "ETH-GAS", description: "Arbitrage bots competing for mempool priority." },
                  { title: "Contract Upgrade Function Triggered", risk: "High", asset: "DEFI-PROT", description: "Proxy contract pointing to new implementation bytecode." },
                  { title: "Unusual Slippage Parameter in Smart Router", risk: "Medium", asset: "SOL-DEX", description: "High risk of front-running on pending DEX swaps." },
                ].map((a, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">{a.asset}</span>
                        <h3 className="text-xs font-bold text-white">{a.title}</h3>
                      </div>
                      <p className="text-[11px] text-slate-400">{a.description}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30 whitespace-nowrap">
                      {a.risk}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Sentiment Breakdown & Related Tools */}
        <div className="space-y-6">
          {/* Sentiment Breakdown Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-blue-400" />
              <span>Sentiment Breakdown</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">Social Media</span>
                  <span className="text-emerald-400 font-mono font-bold">72</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "72%" }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">News Sentiment</span>
                  <span className="text-emerald-400 font-mono font-bold">61</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "61%" }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">On-Chain</span>
                  <span className="text-emerald-400 font-mono font-bold">75</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "75%" }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">Technical</span>
                  <span className="text-emerald-400 font-mono font-bold">64</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "64%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Related Tools Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Related Tools</h3>
            {[
              { id: "fear_greed", label: "Fear & Greed Index", icon: Sparkles, color: "text-amber-400" },
              { id: "heatmap", label: "Market Heatmap", icon: Activity, color: "text-blue-400" },
              { id: "unlocks", label: "Token Unlocks", icon: Clock, color: "text-purple-400" },
              { id: "defi", label: "DeFi Dashboard", icon: Layers, color: "text-emerald-400" },
              { id: "screener", label: "Price Screener", icon: Radio, color: "text-cyan-400" },
            ].map((tool) => {
              const IconComp = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveToolModal(tool.id)}
                  className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition text-xs text-slate-200 font-semibold group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp size={16} className={tool.color} />
                    <span>{tool.label}</span>
                  </div>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-white transition" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tool Modal Dialog */}
      {activeToolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-extrabold text-white capitalize flex items-center gap-2">
                <Sparkles className="text-blue-400" size={20} />
                <span>{activeToolModal.replace("_", " & ")} Analysis Suite</span>
              </h2>
              <button
                onClick={() => setActiveToolModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              {activeToolModal === "fear_greed" && (
                <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Top Header info */}
                  <div>
                    <h3 className="text-xl font-black text-white">Crypto Fear & Greed Index</h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Real-time market sentiment gauge — from extreme fear to extreme greed. Track how the crypto market is feeling today.
                    </p>
                  </div>

                  {/* Gauge & Context Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Gauge Card (2 cols) */}
                    <div className="md:col-span-2 p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden space-y-4">
                      {/* Semi-circular gauge visual */}
                      <div className="relative w-64 h-32 overflow-hidden flex items-end justify-center">
                        <div className="absolute w-64 h-64 rounded-full border-[20px] border-slate-800 box-border border-t-emerald-500 border-r-emerald-500 border-l-rose-500 border-b-transparent transform -rotate-45" />
                        <div className="absolute bottom-0 text-center pb-2">
                          <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight">73</span>
                          <p className="text-sm font-extrabold text-emerald-300 uppercase tracking-widest mt-1">Greed</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span>Caution: Market Approaching Extreme Greed Territory</span>
                      </div>
                    </div>

                    {/* Context & Trend Column */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Market Context</h4>
                        <p className="text-[11px] text-slate-400">Spot BTC ETF Inflows: +$412M</p>
                        <p className="text-[11px] text-slate-400">Derivatives Funding: +0.018%</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Trend</h4>
                        <div className="flex justify-between items-baseline">
                          <span className="text-slate-400 text-[11px]">7-day avg</span>
                          <span className="text-lg font-mono font-bold text-white">70</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-slate-400 text-[11px]">7d change</span>
                          <span className="text-emerald-400 font-mono font-bold">+2</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Index Breakdown & Meaning */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Breakdown */}
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                      <h4 className="text-sm font-bold text-white">Index Breakdown</h4>
                      <div className="space-y-3">
                        {[
                          { label: "Volatility", val: 53, weight: "25%" },
                          { label: "Market Momentum", val: 72, weight: "25%" },
                          { label: "Social Media", val: 43, weight: "15%" },
                          { label: "Surveys", val: 50, weight: "15%" },
                          { label: "BTC Dominance", val: 49, weight: "10%" },
                          { label: "Search Trends", val: 46, weight: "10%" },
                        ].map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-300">{item.label}</span>
                              <span className="font-mono text-slate-400">{item.val}/100 <span className="text-[10px] text-slate-500">({item.weight})</span></span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${item.val > 60 ? "bg-emerald-400" : item.val > 45 ? "bg-amber-400" : "bg-rose-400"}`}
                                style={{ width: `${item.val}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* What It Means */}
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="text-sm font-bold text-white">What It Means</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        The Crypto Fear & Greed Index measures market sentiment on a scale from 0 (Extreme Fear) to 100 (Extreme Greed).
                      </p>
                      <div className="space-y-2 text-[11px]">
                        <div className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                          <p><strong className="text-white">0–25 Extreme Fear:</strong> Investors are very worried. Potential buying opportunity.</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                          <p><strong className="text-white">25–45 Fear:</strong> Market uncertainty is high.</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-400 mt-1 shrink-0" />
                          <p><strong className="text-white">45–55 Neutral:</strong> Market sentiment is balanced.</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                          <p><strong className="text-white">55–75 Greed:</strong> Investors are becoming greedy. Caution advised.</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0" />
                          <p><strong className="text-white">75–100 Extreme Greed:</strong> Market may be due for a correction.</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 italic pt-1">
                        The index is updated daily. It should not be used as financial advice — always do your own research.
                      </p>
                    </div>
                  </div>

                  {/* Last 30 Days Greed Index Bar Graph */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">Last 30 Days Greed Index History</h4>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">Daily Average</span>
                    </div>

                    <div className="h-32 flex items-end gap-1 pt-4 pb-2 px-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
                      {Array.from({ length: 30 }).map((_, i) => {
                        // Generate realistic sentiment history
                        const val = Math.min(90, Math.max(30, 60 + Math.sin(i * 0.4) * 20 + (Math.random() * 10 - 5)));
                        const isHigh = val >= 55;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                            <div
                              className={`w-full rounded-t transition-all group-hover:brightness-125 ${
                                isHigh ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                              style={{ height: `${val}%` }}
                            />
                            {/* Tooltip */}
                            <div className="absolute -top-8 bg-slate-900 text-white text-[9px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10 border border-slate-700">
                              Day {i + 1}: {val.toFixed(0)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
                      <span>30 Days Ago</span>
                      <span>15 Days Ago</span>
                      <span>Today (73)</span>
                    </div>
                  </div>
                </div>
              )}

              {activeToolModal === "heatmap" && (
                <div className="space-y-3">
                  <p className="text-slate-400">Sector Performance Heatmap (24h Change):</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "Layer 1", chg: "+5.4%", col: "bg-emerald-600/30 border-emerald-500/50 text-emerald-300" },
                      { name: "AI & Data", chg: "+14.8%", col: "bg-emerald-500/40 border-emerald-400 text-white font-bold" },
                      { name: "DeFi", chg: "+2.1%", col: "bg-emerald-600/20 border-emerald-500/30 text-emerald-300" },
                      { name: "Memes", chg: "-3.2%", col: "bg-rose-600/30 border-rose-500/50 text-rose-300" },
                      { name: "Gaming", chg: "+1.9%", col: "bg-emerald-600/20 border-emerald-500/30 text-emerald-300" },
                      { name: "Stablecoins", chg: "0.0%", col: "bg-slate-800 border-slate-700 text-slate-300" },
                    ].map((s, i) => (
                      <div key={i} className={`p-3 rounded-xl border text-center space-y-1 ${s.col}`}>
                        <p className="font-bold">{s.name}</p>
                        <p className="font-mono text-sm">{s.chg}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeToolModal === "unlocks" && (
                <div className="space-y-3">
                  <p className="text-slate-400">Upcoming Major Token Cliffs & Vesting Unlocks:</p>
                  <div className="space-y-2">
                    {[
                      { token: "SUI", date: "Aug 30, 2026", amount: "$84.5M", pct: "2.8% of Circ." },
                      { token: "APT", date: "Sep 04, 2026", amount: "$42.1M", pct: "1.9% of Circ." },
                      { token: "ARB", date: "Sep 12, 2026", amount: "$68.2M", pct: "3.2% of Circ." },
                    ].map((u, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">{u.token} Unlock</p>
                          <p className="text-[10px] text-slate-400">{u.date} • {u.pct}</p>
                        </div>
                        <span className="font-mono font-bold text-amber-400">{u.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeToolModal === "defi" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <p className="text-slate-400 text-[10px]">Total DeFi TVL</p>
                      <p className="text-lg font-mono font-bold text-white">$142.8B</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <p className="text-slate-400 text-[10px]">24h Volume</p>
                      <p className="text-lg font-mono font-bold text-white">$8.4B</p>
                    </div>
                  </div>
                  <p className="text-slate-400">Top Protocols: Lido ($32.4B TVL), Aave ($18.9B TVL), EigenLayer ($14.2B TVL).</p>
                </div>
              )}

              {activeToolModal === "screener" && (
                <div className="space-y-3">
                  <p className="text-slate-400">Advanced Price & Liquidity Screener filters active across 12,400+ assets.</p>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span>Active Filters: Market Cap &lt; $50M, Liquidity &gt; $200k, Audit Passed</span>
                    <Link
                      href="/trending-small-caps"
                      onClick={() => setActiveToolModal(null)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition"
                    >
                      Open Screener &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveToolModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

