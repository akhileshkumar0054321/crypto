"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Zap,
  Activity,
  Layers,
  Search,
  Lock,
  Cpu,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  FileText,
  DollarSign,
  PieChart,
  LineChart,
  Sliders,
  Terminal,
  Calculator,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Target,
  Compass,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  ArrowUpRight,
  Database,
  Globe,
  Radio,
  Eye,
  Key,
} from "lucide-react";

export default function LearnAndAboutPage() {
  const [activeSection, setActiveSection] = useState<string>("mission");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [simScore, setSimScore] = useState<number>(35);

  // Features list
  const features = [
    {
      id: "forensic-engine",
      title: "Real-Time Forensic Risk Engine & Contract Sandbox",
      category: "Security & Auditing",
      icon: ShieldCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      summary:
        "Deep automated smart contract decompilation, honeypot execution simulation, liquidity lock verification, and ownership privilege analysis.",
      details: [
        "Bytecode Sandboxing: Simulates buy, transfer, and sell operations in isolated virtual EVM environments to catch hidden 100% sell taxes.",
        "Liquidity Auditing: Verifies whether liquidity pool LP tokens are permanently burned, locked in recognized lockers (UNCX, Team Finance, PinkLock), or held by creator wallets.",
        "Privileged Access Detection: Flags active proxy contracts, unrenounced admin rights, hidden mint functions, arbitrary blacklists, and balance modification functions.",
        "Dynamic Slippage & Tax Delta: Monitors on-chain transaction logs for variable transfer taxes that increase post-launch.",
      ],
      link: "/risk-explorer",
      linkLabel: "Open Risk Explorer",
    },
    {
      id: "defi-hub",
      title: "Institutional DeFi Intelligence & Liquidity Radar",
      category: "Capital Surveillance",
      icon: Layers,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/30",
      summary:
        "Comprehensive surveillance of Total Value Locked (TVL), multi-chain liquidity flows, high-yield staking vaults, DEX volumes, and protocol cash flow.",
      details: [
        "30+ Multi-Chain Metrics: Live TVL breakdown across Ethereum, Solana, Base, Arbitrum, BSC, Avalanche, Tron, Polygon, and Sui.",
        "Protocol Real Cash Flow: Leaderboard of 24h user transaction fees generated vs. net protocol treasury revenues captured.",
        "Yield & Staking Radar: Scans thousands of LP vaults with Impermanent Loss risk filters and base vs. reward APY breakdown.",
        "Stablecoin Peg Sentinel: Tracks circulating supplies, backing mechanisms (fiat, crypto, algorithmic), and depeg risk boundaries.",
      ],
      link: "/defi",
      linkLabel: "Open DeFi Intelligence Hub",
    },
    {
      id: "live-exchange",
      title: "Multi-Timeframe Live Exchange Graph & Tick Engine",
      category: "Market Execution",
      icon: LineChart,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      summary:
        "Institutional-grade candlestick charting engine with sub-second WebSocket price streaming, depth books, and technical analysis overlays.",
      details: [
        "Multi-Timeframe Candlesticks: 1m, 5m, 15m, 1h, 4h, 1D, and 1W granular OHLCV candle aggregations.",
        "Technical Indicator Suite: Real-time calculation of RSI (Relative Strength Index), MACD, 20/50/200 Exponential Moving Averages (EMA), and Bollinger Bands.",
        "Sub-Second Tick Streaming: Direct simulated and live exchange ticker feeds updating high, low, close, and live trade history.",
        "Depth Order Book & Trade Forensics: Visualizes buy vs. sell volume pressure and large block transactions in real time.",
      ],
      link: "/coin/bitcoin",
      linkLabel: "Launch Live Exchange Graph",
    },
    {
      id: "ai-copilot",
      title: "AI-Powered Crypto Forensics & Copilot (Puter AI)",
      category: "Artificial Intelligence",
      icon: Sparkles,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      summary:
        "Server-side AI models providing contextual audit summaries, tokenomics evaluations, threat scenario modeling, and conversational intelligence.",
      details: [
        "Automated Executive Audit Reports: 6-tier institutional security reports generated instantly for any scanned token.",
        "Tokenomics & Inflation Risk: Evaluates vesting schedules, unlock cliffs, holder concentration, and team allocation fairness.",
        "Scenario Stress-Testing: Generates deterministic bull, base, and catastrophic bear cases based on market liquidity and sentiment.",
        "Interactive AI Risk Terminal: Ask freeform technical or security questions about any token, protocol, or market anomaly.",
      ],
      link: "/reports",
      linkLabel: "Explore AI Intelligence Reports",
    },
    {
      id: "small-caps",
      title: "Small-Cap & DEX Trending Momentum Scanner",
      category: "Alpha Discovery",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      summary:
        "Surveillance engine tracking early DEX pair creation, token boost activity, micro-cap liquidity additions, and holder entropy.",
      details: [
        "DEX Token Velocity: Scans trending decentralized pairs across Uniswap, Raydium, PancakeSwap, Aerodrome, and Orca.",
        "Token Boost & Profile Verification: Tracks verified social links, marketing campaign velocity, and holder accumulation clusters.",
        "Pair Age & Liquidity Depth: Instant warning badges for pairs launched less than 24 hours ago or holding thin initial liquidity.",
        "Holder Distribution Entropy: Quantifies whether the top 10 holders control an unsafe proportion of the circulating supply.",
      ],
      link: "/trending-small-caps",
      linkLabel: "Open Small-Cap Scanner",
    },
    {
      id: "news-sentiment",
      title: "Real-Time NLP News & Market Sentiment Intelligence",
      category: "Sentiment & News",
      icon: FileText,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      summary:
        "Cryptographic news aggregator with NLP sentiment score classification (-100 to +100) and regulatory catalyst tagging.",
      details: [
        "Multi-Feed Ingestion: Aggregates real-time dispatches from premier crypto newsdesks, governance forums, and regulatory filings.",
        "Sentiment Delta Modeling: Quantifies whether market narratives are bullish, neutral, or fear-dominated with numeric scoring.",
        "Catalyst Impact Badges: Categorizes breaking events by regulatory risk, technical vulnerabilities, exchange listings, and macro shocks.",
        "Interactive Impact Analysis: Drill down into individual news events to evaluate projected price volatility and token sensitivity.",
      ],
      link: "/news",
      linkLabel: "View News Sentiment Intelligence",
    },
    {
      id: "portfolio-sim",
      title: "Portfolio Risk & PnL Stress-Test Simulator",
      category: "Portfolio Analytics",
      icon: PieChart,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      summary:
        "Simulate asset allocations, calculate composite weighted risk scores, and model severe market drawdown scenarios.",
      details: [
        "Weighted Risk Index: Aggregates individual asset risk scores into a unified composite portfolio health metric.",
        "Historical Drawdown Stress-Testing: Simulate how your holdings would perform during historic market selloffs (-30% to -80%).",
        "Risk-Adjusted Rebalancing: Actionable suggestions to replace high-risk assets with safer liquidity-backed alternatives.",
        "Zero-KYC Simulation: Private, client-side simulation engine without connecting external private keys or revealing identity.",
      ],
      link: "/portfolio",
      linkLabel: "Open Portfolio Simulator",
    },
    {
      id: "calculators",
      title: "DeFi Financial Simulators (APY & Impermanent Loss)",
      category: "Yield Engineering",
      icon: Calculator,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      summary:
        "Interactive mathematical models for compound staking interest, reward projections, and AMM 50/50 Impermanent Loss calculations.",
      details: [
        "Compound Frequency Modeling: Test daily, weekly, monthly, and annual compounding schedules with real APY inputs.",
        "Impermanent Loss Matrix: Calculate exact dollar loss compared to holding (HODL) across asymmetric price ratio movements.",
        "Fee Offset Threshold: Determines the minimum trading fee APY required to overcome projected impermanent loss.",
        "One-Click Yield Import: Directly load live pool APYs from the DeFi hub into the simulator for instant projections.",
      ],
      link: "/defi",
      linkLabel: "Use Yield & IL Simulators",
    },
  ];

  // Filtered features
  const filteredFeatures = features.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.title.toLowerCase().includes(q) ||
      f.summary.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.details.some((d) => d.toLowerCase().includes(q))
    );
  });

  // FAQs
  const faqs = [
    {
      q: "What is the primary goal and mission of CryptoVision?",
      a: "CryptoVision was engineered to solve the acute information asymmetry in decentralized markets. Retail and institutional investors are frequently exposed to unverified smart contracts, hidden minting backdoors, liquidity draining rug pulls, and fake trading volume. Our mission is to provide an institutional-grade, zero-latency risk forensics and liquidity surveillance platform that gives every market participant transparent, quantified security data before committing capital.",
    },
    {
      q: "How is the 0 to 100 Forensic Risk Score calculated?",
      a: "The Forensic Risk Score is a quantitative composite derived from 7 core dimensions: (1) Smart Contract Integrity & Permissions (25%), (2) Liquidity Pool Depth & Lock Status (20%), (3) Holder Concentration & Top-10 Distribution (15%), (4) Honeypot & Sell Simulation Tests (15%), (5) Trading Volume Quality & Wash-Trading Entropy (10%), (6) Social Momentum & Verified Footprint (10%), and (7) NLP News Sentiment Delta (5%). Scores from 0-25 represent Low Risk, 26-50 Moderate, 51-75 Elevated, and 76-100 Critical Threat.",
    },
    {
      q: "Are the candlestick charts and order books real-time?",
      a: "Yes. Our charting and exchange interface utilizes sub-second ticker streaming with multi-timeframe candle aggregations (1m to 1W), depth order books, and real-time computation of technical indicators including RSI, MACD, 20/50/200 EMA, and Bollinger Bands.",
    },
    {
      q: "How does the platform detect honeypots and malicious contracts?",
      a: "Our engine inspects smart contract bytecode and executes simulated buy, approval, and sell transactions in a sandboxed EVM environment. If the contract blocks the sell transaction, charges an extortionate fee (>10%), or modifies balances dynamically, it is immediately flagged as a critical honeypot threat.",
    },
    {
      q: "Do I need to connect a Web3 wallet to use CryptoVision?",
      a: "No. CryptoVision is designed with privacy and accessibility as core tenets. All intelligence tools, risk screeners, DeFi analytics, chart modules, news sentiment trackers, and portfolio simulators can be utilized freely without connecting a wallet, providing sensitive personal data, or exposing private keys.",
    },
    {
      q: "How often is the on-chain DeFi data updated?",
      a: "Our decentralized liquidity, TVL, yield vault, DEX volume, and protocol fee telemetry connects directly to real-time blockchain nodes and decentralized indexers. Yield pools, fee rankings, and stablecoin metrics sync continuously with low latency.",
    },
  ];

  // Glossary terms
  const glossary = [
    {
      term: "Honeypot",
      definition:
        "A malicious smart contract structured to allow investors to purchase tokens but programmatically preventing them from selling, trapping 100% of user capital.",
    },
    {
      term: "Total Value Locked (TVL)",
      definition:
        "The cumulative dollar value of all cryptocurrency assets currently deposited, staked, or locked in a decentralized protocol's smart contracts.",
    },
    {
      term: "Impermanent Loss (IL)",
      definition:
        "The difference in dollar value between holding two assets in a wallet versus depositing them into an Automated Market Maker (AMM) liquidity pool when prices diverge.",
    },
    {
      term: "Ownership Renouncement",
      definition:
        "The permanent transfer of a smart contract's administrative owner address to the zero address (0x00...00), preventing the creator from modifying functions or draining funds.",
    },
    {
      term: "LP Token Burning",
      definition:
        "Sending Liquidity Provider (LP) tokens to an unrecoverable dead address, ensuring that the liquidity pool can never be removed or rugged by developers.",
    },
    {
      term: "MEV & Sandwich Attack",
      definition:
        "Maximal Extractable Value exploits where automated bots front-run and back-run pending decentralized exchange trades, extracting profit via forced price slippage.",
    },
    {
      term: "Proxy Admin Pattern",
      definition:
        "An upgradable smart contract architecture where the underlying logic can be changed at any time by the admin key, presenting a centralization and exploit vulnerability.",
    },
    {
      term: "Depeg Distance",
      definition:
        "The percentage variance between a stablecoin's target peg (e.g. $1.00 USD) and its current active secondary market trading price.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 pb-32">
      {/* ── Top Hero & Vision Section ────────────────────────────────────────── */}
      <div className="relative border-b border-slate-800/80 bg-gradient-to-b from-[#0e1424] via-[#090d18] to-[#07090e] overflow-hidden pt-12 pb-16">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-6">
            <ShieldCheck size={14} />
            <span>Platform Vision & Architecture Specifications</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Institutional-Grade Crypto <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
              Risk Forensics & Surveillance
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            CryptoVision is a real-time decentralized intelligence platform built to eliminate informational asymmetry in cryptocurrency markets. We empower investors, traders, and DeFi practitioners with deep on-chain contract decompilation, automated honeypot detection, multi-chain liquidity tracking, and AI-powered risk modeling.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            <div className="p-4 rounded-2xl bg-[#0b101d]/90 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Security Checks</span>
              <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">42+ Vectors</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Sandboxed EVM analysis</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#0b101d]/90 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Chains Monitored</span>
              <span className="text-2xl font-black font-mono text-blue-400 mt-1 block">30+ Networks</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">L1s, L2s & Sidechains</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#0b101d]/90 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Exchange Charts</span>
              <span className="text-2xl font-black font-mono text-cyan-400 mt-1 block">Sub-Second</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Live WebSocket feeds</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#0b101d]/90 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Data Privacy</span>
              <span className="text-2xl font-black font-mono text-purple-400 mt-1 block">100% Non-Custodial</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Zero wallet linkage needed</span>
            </div>
          </div>

          {/* Quick Section Jump Navigation */}
          <div className="flex items-center gap-2 mt-8 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 mr-1">Quick Jump:</span>
            {[
              { id: "mission", label: "App Mission & Goals" },
              { id: "features", label: "Core Features Suite" },
              { id: "scoring", label: "Risk Scoring Matrix" },
              { id: "architecture", label: "System Architecture" },
              { id: "glossary", label: "Risk Glossary" },
              { id: "faq", label: "Frequently Asked Questions" },
            ].map((nav) => (
              <a
                key={nav.id}
                href={`#${nav.id}`}
                onClick={() => setActiveSection(nav.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                  activeSection === nav.id
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {nav.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content Container ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-20">
        
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 1: GOAL OF THE APP & MISSION STATEMENT                         */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <section id="mission" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Target size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider font-mono">Foundational Objective</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">The Goal & Mission of CryptoVision</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ShieldAlert size={16} />
              </div>
              <h3 className="font-bold text-white text-base">Eliminating Capital Loss</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Over $2.8B is lost annually to honeypots, rug pulls, and unverified smart contract backdoors. CryptoVision provides automatic execution sandboxing to detect malicious bytecode before users transact.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Radio size={16} />
              </div>
              <h3 className="font-bold text-white text-base">Democratizing Alpha</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Institutional trading firms utilize proprietary mempool listeners and private RPC nodes. We bring that exact level of high-frequency liquidity tracking, TVL telemetry, and DEX flows to everyday traders.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Cpu size={16} />
              </div>
              <h3 className="font-bold text-white text-base">Synthesizing Complexity</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Raw blockchain data is noisy and opaque. Our AI forensic engine translates complex bytecode, proxy ownership graphs, and financial ratios into clear, actionable risk ratings and plain-English reports.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/30 via-slate-900 to-indigo-950/30 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Our Core Operating Principle: Strict Non-Custodial Integrity</span>
              </h4>
              <p className="text-xs text-slate-400 max-w-2xl">
                We never store private keys, require seed phrases, or solicit custody of your assets. CryptoVision is purely a surveillance, risk quantification, and analytical intelligence tool.
              </p>
            </div>
            <Link
              href="/risk-explorer"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Explore Live Radar</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 2: COMPREHENSIVE FEATURES BREAKDOWN                            */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <section id="features" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Zap size={20} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Platform Capabilities</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Complete Features & Technical Modules</h2>
              </div>
            </div>

            {/* Feature Search Box */}
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter capabilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFeatures.map((feat) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={feat.id}
                  id={feat.id}
                  className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 hover:border-slate-700 transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl ${feat.bg} border ${feat.border} flex items-center justify-center ${feat.color}`}>
                          <IconComp size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                            {feat.category}
                          </span>
                          <h3 className="font-bold text-white text-base">{feat.title}</h3>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {feat.summary}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-800/60">
                      {feat.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2 text-xs text-slate-400">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                    <Link
                      href={feat.link}
                      className={`text-xs font-bold ${feat.color} hover:underline flex items-center gap-1`}
                    >
                      <span>{feat.linkLabel}</span>
                      <ArrowUpRight size={13} />
                    </Link>
                    <span className="text-[10px] font-mono text-slate-500">Active Module</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 3: RISK SCORING METHODOLOGY & SIMULATOR                        */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <section id="scoring" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sliders size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider font-mono">Mathematical Framework</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Forensic Risk Score Matrix (0–100)</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Explanatory Breakdown */}
            <div className="lg:col-span-2 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                CryptoVision calculates risk through a normalized, multi-factor weighting algorithm. Every scanned token receives a composite score between 0 (Lowest Risk / Pristine Integrity) and 100 (Critical Malicious Threat).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 text-xs">0 – 25 : LOW RISK</span>
                    <ShieldCheck size={14} className="text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Institutional-grade security. Contract ownership renounced or multi-sig governed, 95%+ liquidity locked, deep order books, zero privileged minting logic.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-400 text-xs">26 – 50 : MODERATE RISK</span>
                    <Activity size={14} className="text-blue-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Standard verified utility asset. Audited code, healthy liquidity pools, minor centralization risks (e.g., standard upgradable proxy with timelock).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 text-xs">51 – 75 : ELEVATED RISK</span>
                    <AlertTriangle size={14} className="text-amber-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Caution advised. Top 10 holders control &gt;45% of supply, unlocked DEX liquidity, high volatility, unverified social profiles, or dynamic buy/sell taxes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400 text-xs">76 – 100 : CRITICAL THREAT</span>
                    <ShieldAlert size={14} className="text-rose-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Extreme danger. Confirmed honeypot, blacklist backdoors, 100% sell tax, developer wallet draining history, or completely unlocked liquidity.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Risk Score Tester */}
            <div className="p-5 rounded-2xl bg-[#0b0f19] border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders size={15} className="text-purple-400" />
                  <span>Interactive Score Visualizer</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust the slider to inspect how different threat thresholds trigger system warning levels:
                </p>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-xs text-slate-400">Simulated Score:</span>
                    <span
                      className={`text-2xl font-black ${
                        simScore <= 25
                          ? "text-emerald-400"
                          : simScore <= 50
                          ? "text-blue-400"
                          : simScore <= 75
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {simScore} / 100
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={simScore}
                    onChange={(e) => setSimScore(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-slate-200">
                      Classification:{" "}
                      <span
                        className={
                          simScore <= 25
                            ? "text-emerald-400"
                            : simScore <= 50
                            ? "text-blue-400"
                            : simScore <= 75
                            ? "text-amber-400"
                            : "text-rose-400"
                        }
                      >
                        {simScore <= 25
                          ? "Low Risk (Grade A+)"
                          : simScore <= 50
                          ? "Moderate Risk (Grade B)"
                          : simScore <= 75
                          ? "Elevated Risk (Grade C)"
                          : "Critical Hazard (Grade F - Avoid)"}
                      </span>
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {simScore <= 25
                        ? "Suitable for standard investment allocations. Immutable contracts and secure locked pools."
                        : simScore <= 50
                        ? "Acceptable for speculative allocation. Active monitoring recommended for proxy updates."
                        : simScore <= 75
                        ? "High risk of sudden liquidity pull or slippage loss. Keep position size constrained."
                        : "High probability of total capital loss. Honeypot or drainage vulnerability detected."}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/risk-explorer"
                className="w-full py-2 text-center rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Scan A Live Token Contract
              </Link>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 4: SYSTEM ARCHITECTURE & DATA PIPELINE                         */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <section id="architecture" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider font-mono">Data Pipeline & Infrastructure</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">How CryptoVision Aggregates & Analyzes Data</h2>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">STAGE 01</span>
                  <Radio size={14} className="text-blue-400" />
                </div>
                <h4 className="font-bold text-white text-xs">Mempool & Node Ingestion</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Real-time blockchain RPC listeners capture new contract deployments, pending swap transactions, and LP additions across EVM and Solana nodes.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">STAGE 02</span>
                  <Cpu size={14} className="text-purple-400" />
                </div>
                <h4 className="font-bold text-white text-xs">EVM Sandboxing</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Bytecode is executed in virtual fork environments to simulate buy/sell transactions, test tax rates, and detect honeypot logic.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold">STAGE 03</span>
                  <BarChart3 size={14} className="text-teal-400" />
                </div>
                <h4 className="font-bold text-white text-xs">Liquidity & DeFi Aggregation</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Multi-chain liquidity matrices calculate net TVL, protocol fee yields, DEX volume momentum, and stablecoin peg variances.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">STAGE 04</span>
                  <Sparkles size={14} className="text-emerald-400" />
                </div>
                <h4 className="font-bold text-white text-xs">AI Synthesis & Delivery</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Server-side AI models generate structured reports, real-time alerts, and interactive candlestick visualization for instantaneous user consumption.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 5: GLOSSARY OF CRYPTO RISK & DEFI TERMS                        */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <section id="glossary" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono">Knowledge Base</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Cryptocurrency Risk & DeFi Glossary</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {glossary.map((g, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800/80 space-y-2 hover:border-amber-500/30 transition"
              >
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{g.term}</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {g.definition}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 6: FREQUENTLY ASKED QUESTIONS (FAQ)                           */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <section id="faq" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <HelpCircle size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider font-mono">User Clarifications</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Frequently Asked Questions</h2>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0b0f19] border border-slate-800 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-900/50 transition cursor-pointer"
                  >
                    <span className="font-bold text-sm text-white">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp size={16} className="text-blue-400 shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Bottom Call To Action Banner ────────────────────────────────────── */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-950/60 via-[#0d1424] to-emerald-950/60 border border-blue-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-300 mx-auto">
            <Zap size={24} />
          </div>
          <h3 className="text-2xl font-black text-white">Ready to Audit & Track On-Chain Markets?</h3>
          <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
            Scan any smart contract token address, inspect multi-chain DeFi yields, or model portfolio stress tests right now without any account setup.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <Link
              href="/risk-explorer"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              Launch Risk Explorer
            </Link>
            <Link
              href="/defi"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              Explore DeFi Hub
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
