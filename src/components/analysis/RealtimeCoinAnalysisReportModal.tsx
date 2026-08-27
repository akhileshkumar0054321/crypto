"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  FileText,
  ExternalLink,
  Newspaper,
  Compass,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight,
  Activity,
  Flame,
  CheckCircle2,
  XCircle,
  BarChart3,
  Globe,
  Share2,
  Printer,
  ChevronDown,
  Info,
  Shield,
  HelpCircle,
  Zap,
  Target,
  Scale,
  Users,
  Lock,
  DollarSign,
  Search,
} from "lucide-react";
import { useLiveMarket } from "@/lib/context/LiveMarketContext";
import { toast } from "sonner";
import Link from "next/link";
import { RealisticLiveExchangeGraph } from "@/components/charts/RealisticLiveExchangeGraph";

interface RealtimeCoinAnalysisReportModalProps {
  coin: {
    coin_id: string;
    name: string;
    symbol: string;
    price_usd?: number;
    price_change_24h?: number;
    image_url?: string;
    market_cap?: number;
    market_cap_rank?: number;
    volume_24h?: number;
  } | null;
  onClose: () => void;
  onSelectOtherCoin?: (coin: any) => void;
  availableCoins?: any[];
}

export function RealtimeCoinAnalysisReportModal({
  coin,
  onClose,
  onSelectOtherCoin,
  availableCoins = [],
}: RealtimeCoinAnalysisReportModalProps) {
  const { getLiveCoin } = useLiveMarket();
  const [activeSection, setActiveSection] = useState<"all" | "history" | "performance" | "graph" | "news" | "strategy" | "risk">("all");
  const [customHeadline, setCustomHeadline] = useState("");
  const [activeHeadline, setActiveHeadline] = useState<string | undefined>(undefined);
  const [isCopied, setIsCopied] = useState(false);
  const [coinDropdownOpen, setCoinDropdownOpen] = useState(false);

  // Live coin tick
  const live = coin
    ? getLiveCoin(coin.coin_id, coin.price_usd || 100, coin.price_change_24h || 0)
    : { price: 100, change24h: 0, direction: null };

  const currentPrice = live.price || coin?.price_usd || 0;
  const currentChg = live.change24h ?? (coin?.price_change_24h || 0);
  const isUp = currentChg >= 0;

  // Fetch unified 6-section detailed analysis
  const {
    data: analysisData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["full-coin-analysis", coin?.coin_id, activeHeadline],
    queryFn: async () => {
      if (!coin?.coin_id) return null;
      const url = new URL(`/api/coins/${encodeURIComponent(coin.coin_id)}/full-analysis`, window.location.origin);
      if (activeHeadline) {
        url.searchParams.set("headline", activeHeadline);
      }
      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error("Failed to load coin and news analysis");
      }
      const text = await res.text();
      if (!text || text.trim() === "") return null;
      try {
        return JSON.parse(text);
      } catch (e) {
        console.warn("JSON parse error on full-analysis:", e);
        return null;
      }
    },
    enabled: !!coin?.coin_id,
    staleTime: 60_000,
  });

  // Reset custom headline when coin changes
  useEffect(() => {
    setActiveHeadline(undefined);
    setCustomHeadline("");
  }, [coin?.coin_id]);

  if (!coin) return null;

  const detailedReport = analysisData?.detailedReport;
  const history = detailedReport?.history;
  const pastPerformance = detailedReport?.pastPerformance;
  const pointByPointNews = detailedReport?.pointByPointNews || [];
  const investmentStrategy = detailedReport?.investmentStrategy;
  const riskMatrix = detailedReport?.riskMatrix;
  const report = analysisData?.report;
  const risk = analysisData?.risk;
  const viability = analysisData?.viability;
  const scenarios = analysisData?.scenarios;

  const handleHeadlineSelect = (title: string) => {
    setActiveHeadline(title);
    toast.info(`Evaluating news impact of: "${title.slice(0, 45)}..."`);
  };

  const handleCustomHeadlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHeadline.trim()) return;
    setActiveHeadline(customHeadline.trim());
    toast.info("Analyzing custom news catalyst with AI engine...");
  };

  const handleCopySummary = () => {
    const text = `
=== ${coin.name.toUpperCase()} (${coin.symbol.toUpperCase()}) 6-SECTION DETAILED AUDIT REPORT ===
Current Price: $${currentPrice >= 1 ? currentPrice.toLocaleString() : currentPrice.toFixed(6)} (${currentChg >= 0 ? "+" : ""}${currentChg.toFixed(2)}%)
Safety Rating: ${riskMatrix?.overall_safety_rating || "MODERATE"}
Risk Score: ${risk?.score || 50}/100

1. COIN HISTORY & FOUNDATION:
- Founders: ${history?.founders || "Core Foundation Team"} (${history?.founding_year || "Launch"})
- Purpose (Plain English): ${history?.core_purpose_plain_english || coin.name + " utility token"}
- Technology: ${history?.underlying_technology || "Decentralized consensus"}

2. PAST PERFORMANCE:
- All-Time High: $${pastPerformance?.ath_price_usd?.toLocaleString() || "N/A"} (${pastPerformance?.ath_drawdown_pct || 0}% from ATH)
- All-Time Low: $${pastPerformance?.atl_price_usd?.toLocaleString() || "N/A"} (${pastPerformance?.atl_gain_multiple || "N/A"} gain from bottom)
- Cycle Resilience: ${pastPerformance?.cycle_analysis || "Tracked broad market trends"}

3. LIVE GRAPH:
- Live realtime order feed active on 1m, 5m, 15m, 1h, 24h, 7d timeframes with SMA20 and EMA12 overlays.

4. NEWS POINT-BY-POINT ANALYSIS:
${pointByPointNews.map((n: any, i: number) => `${i + 1}. ${n.headline}\n   - What Happened: ${n.what_happened_simple}\n   - Why It Matters to Your Money: ${n.why_it_matters_for_your_money}\n   - Outlook: ${n.future_price_impact?.short_term_outlook}`).join("\n\n")}

5. INVESTMENT STRATEGY GUIDE:
- Short-Term Trading: Entry at ${investmentStrategy?.short_term_trading?.entry_tactics || "Key support"}, Stop-Loss: ${investmentStrategy?.short_term_trading?.recommended_stop_loss || "5-8%"}
- Long-Term Investing: DCA Strategy: ${investmentStrategy?.long_term_investing?.dca_strategy || "Automated weekly buying"}, Horizon: ${investmentStrategy?.long_term_investing?.time_horizon || "3-5 years"}

6. RISK MATRIX & PROS/CONS:
- Popularity: ${riskMatrix?.popularity_audit?.popularity_level || "Standard"} (${riskMatrix?.popularity_audit?.popularity_summary || ""})
- Verdict: ${riskMatrix?.bottom_line_risk_verdict || "Maintain disciplined risk management."}
    `.trim();

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Comprehensive 6-Section Report copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const safetyBadge = (rating?: string) => {
    if (rating === "SAFE_FOR_LONG_TERM") {
      return { text: "SAFE FOR LONG-TERM WEALTH", cls: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300" };
    }
    if (rating === "EXTREME_DANGER_AVOID") {
      return { text: "EXTREME SPECULATIVE DANGER", cls: "bg-rose-500/15 border-rose-500/40 text-rose-300" };
    }
    if (rating === "HIGH_SPECULATION") {
      return { text: "HIGH RISK / SHORT-TERM PLAY ONLY", cls: "bg-orange-500/15 border-orange-500/40 text-orange-300" };
    }
    return { text: "MODERATE RISK ALTCOIN", cls: "bg-amber-500/15 border-amber-500/40 text-amber-300" };
  };

  const currentSafety = safetyBadge(riskMatrix?.overall_safety_rating);

  return (
    <div
      id="realtime-coin-analysis-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0b101b] border border-slate-700/80 rounded-2xl w-full max-w-5xl my-auto shadow-2xl overflow-hidden text-slate-200 relative flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Accent Bar */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/90 bg-[#0f1626] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            {coin.image_url ? (
              <img
                src={coin.image_url}
                alt={coin.symbol}
                className="w-10 h-10 rounded-full border border-white/15 bg-slate-900 p-0.5"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400">
                {coin.symbol.slice(0, 3)}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                {/* Coin Switcher Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCoinDropdownOpen(!coinDropdownOpen)}
                    className="flex items-center gap-1.5 text-base sm:text-lg font-extrabold text-slate-100 hover:text-blue-300 transition"
                  >
                    <span>{coin.name}</span>
                    <span className="text-slate-400 font-mono text-xs uppercase font-bold">({coin.symbol})</span>
                    {availableCoins.length > 0 && <ChevronDown size={14} className="text-slate-400" />}
                  </button>

                  {coinDropdownOpen && availableCoins.length > 0 && (
                    <div className="absolute left-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 py-1 max-h-60 overflow-y-auto">
                      <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-800">
                        Switch Analyzed Coin
                      </div>
                      {availableCoins.map((c: any) => (
                        <button
                          key={c.coin_id}
                          type="button"
                          onClick={() => {
                            if (onSelectOtherCoin) onSelectOtherCoin(c);
                            setCoinDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-800 transition ${
                            c.coin_id === coin.coin_id ? "bg-blue-600/20 text-blue-300 font-bold" : "text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {c.image_url && <img src={c.image_url} alt="" className="w-4 h-4 rounded-full" />}
                            <span>{c.name}</span>
                            <span className="text-slate-500 uppercase font-mono text-[10px]">({c.symbol})</span>
                          </div>
                          <span className="font-mono text-slate-400">${c.price_usd?.toLocaleString() || "—"}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 flex items-center gap-1">
                  <Sparkles size={10} /> 6-Section Deep Audit
                </span>
              </div>

              {/* Price & Risk Header Summary */}
              <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
                <span className="text-xs sm:text-sm font-mono font-bold text-slate-100">
                  ${currentPrice >= 1 ? currentPrice.toLocaleString("en-US", { maximumFractionDigits: 2 }) : currentPrice.toFixed(6)}
                </span>
                <span
                  className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
                    isUp ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {isUp ? "+" : ""}{currentChg.toFixed(2)}% (24h)
                </span>
                <span className="text-slate-500 text-xs hidden sm:inline">•</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentSafety.cls}`}>
                  {currentSafety.text}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => refetch()}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition text-xs flex items-center gap-1 border border-white/5"
              title="Refresh Report Data"
            >
              <RefreshCw size={13} className={isFetching ? "animate-spin text-blue-400" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition text-xs flex items-center gap-1 border border-white/5"
              title="Copy Full Report"
            >
              {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span className="hidden sm:inline">{isCopied ? "Copied!" : "Copy"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition text-xs flex items-center gap-1 border border-white/5"
              title="Print / Save PDF"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Print</span>
            </button>

            <Link
              href={`/coin/${coin.coin_id}`}
              className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 transition text-xs flex items-center gap-1 border border-blue-500/30"
              title="Open Full Page View"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Full Page</span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 transition"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── 6-Section Quick Jump Navigation Tabs ───────────────────────────── */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSection("all")}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === "all"
                ? "bg-blue-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Layers size={13} />
            <span>Complete Dossier (All 6 Sections)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("history")}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === "history"
                ? "bg-blue-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Clock size={13} />
            <span>1. History</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("performance")}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === "performance"
                ? "bg-blue-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <TrendingUp size={13} />
            <span>2. Past Performance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("graph")}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === "graph"
                ? "bg-blue-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <BarChart3 size={13} />
            <span>3. Live Graph</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("news")}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === "news"
                ? "bg-blue-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Newspaper size={13} />
            <span>4. News Analysis (Simple English)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("strategy")}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === "strategy"
                ? "bg-blue-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Target size={13} />
            <span>5. Investment Strategy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("risk")}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === "risk"
                ? "bg-blue-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <ShieldAlert size={13} />
            <span>6. Risk & Pros/Cons</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#070b12]" id="report-scrollable-body">
          {isLoading && !detailedReport ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw size={28} className="animate-spin text-blue-500" />
              <p className="text-slate-300 font-semibold text-sm">
                Generating Comprehensive 6-Section Forensic Report for {coin.name}...
              </p>
              <p className="text-slate-500 text-xs max-w-md">
                Auditing historical cycle resilience, order book candles, point-by-point news catalysts, investment strategies, and downside failure traps.
              </p>
            </div>
          ) : (
            <>
              {/* ═══════════════════════════════════════════════════════════════════
                  SECTION 1: COIN HISTORY & FOUNDATION
              ═══════════════════════════════════════════════════════════════════ */}
              {(activeSection === "all" || activeSection === "history") && (
                <div id="section-1-coin-history" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                        1
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight">
                          Coin History & Core Foundation
                        </h2>
                        <p className="text-slate-400 text-xs">
                          Origins, founders, consensus design, and real-world utility explained in plain English.
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                      Launched: {history?.founding_year || "Established"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Origin & Creators */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                      <div className="flex items-center gap-2 text-blue-400 font-bold">
                        <Users size={14} />
                        <span>Founders & Launch Story</span>
                      </div>
                      <p className="text-slate-300 font-medium leading-relaxed">
                        <strong className="text-slate-100">Key Creators:</strong> {history?.founders || "Core Decentralized Engineering Foundation"}
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        {history?.origins_and_background || `${coin.name} was created to facilitate decentralized peer-to-peer digital transactions.`}
                      </p>
                    </div>

                    {/* Core Purpose In Plain English */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <HelpCircle size={14} />
                        <span>What Problem Does It Solve? (Plain English)</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {history?.core_purpose_plain_english || `${coin.name} provides cryptographic utility, decentralized settlement, and network validation.`}
                      </p>
                    </div>

                    {/* Underlying Technology */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                      <div className="flex items-center gap-2 text-purple-400 font-bold">
                        <Zap size={14} />
                        <span>Underlying Technology & Consensus</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        <strong className="text-slate-200">Consensus Model:</strong> {history?.consensus_type || "Proof-of-Stake / Cryptographic Validation"}
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        {history?.underlying_technology || "Built on an immutable decentralized blockchain ledger designed to prevent double-spending and ensure 24/7 uptime."}
                      </p>
                    </div>

                    {/* Real World Ecosystem & Adoption */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-bold">
                        <Globe size={14} />
                        <span>Ecosystem & Real-World Adoption</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        {history?.ecosystem_and_adoption || "Integrated across decentralized exchanges, merchant payment gateways, institutional custody providers, and web3 smart contract protocols."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════════
                  SECTION 2: PAST PERFORMANCE DETAIL & CYCLE RESILIENCE
              ═══════════════════════════════════════════════════════════════════ */}
              {(activeSection === "all" || activeSection === "performance") && (
                <div id="section-2-past-performance" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                        2
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight">
                          Past Performance Detail & Market Cycles
                        </h2>
                        <p className="text-slate-400 text-xs">
                          All-Time Highs/Lows, multi-cycle recovery resilience, and historical drawdown benchmarks.
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                      ATH: ${pastPerformance?.ath_price_usd?.toLocaleString() || "N/A"}
                    </span>
                  </div>

                  {/* Top Key Metrics Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">All-Time High (ATH)</p>
                      <p className="text-sm sm:text-base font-extrabold font-mono text-slate-100 mt-0.5">
                        ${pastPerformance?.ath_price_usd ? pastPerformance.ath_price_usd.toLocaleString() : "N/A"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{pastPerformance?.ath_date || "Peak cycle"}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Drawdown From Peak</p>
                      <p className="text-sm sm:text-base font-extrabold font-mono text-rose-400 mt-0.5">
                        {pastPerformance?.ath_drawdown_pct ? `${pastPerformance.ath_drawdown_pct}%` : "—"}
                      </p>
                      <p className="text-[10px] text-slate-400">From historical peak</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">All-Time Low (ATL)</p>
                      <p className="text-sm sm:text-base font-extrabold font-mono text-slate-100 mt-0.5">
                        ${pastPerformance?.atl_price_usd ? pastPerformance.atl_price_usd.toLocaleString() : "N/A"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{pastPerformance?.atl_date || "Launch base"}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Gain From Bottom</p>
                      <p className="text-sm sm:text-base font-extrabold font-mono text-emerald-400 mt-0.5">
                        {pastPerformance?.atl_gain_multiple || "+100x"}
                      </p>
                      <p className="text-[10px] text-slate-400">Total historical multiple</p>
                    </div>
                  </div>

                  {/* Multi-Period Benchmark Bar */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <BarChart3 size={13} className="text-blue-400" /> Multi-Timeframe Return on Investment (ROI)
                    </p>
                    <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">7-Day</span>
                        <strong className={pastPerformance?.benchmarks?.roi_7d?.startsWith("-") ? "text-rose-400" : "text-emerald-400"}>
                          {pastPerformance?.benchmarks?.roi_7d || "+3.2%"}
                        </strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">30-Day</span>
                        <strong className={pastPerformance?.benchmarks?.roi_30d?.startsWith("-") ? "text-rose-400" : "text-emerald-400"}>
                          {pastPerformance?.benchmarks?.roi_30d || "+8.4%"}
                        </strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">90-Day</span>
                        <strong className={pastPerformance?.benchmarks?.roi_90d?.startsWith("-") ? "text-rose-400" : "text-emerald-400"}>
                          {pastPerformance?.benchmarks?.roi_90d || "+18.0%"}
                        </strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">1-Year</span>
                        <strong className={pastPerformance?.benchmarks?.roi_1y?.startsWith("-") ? "text-rose-400" : "text-emerald-400"}>
                          {pastPerformance?.benchmarks?.roi_1y || "+92.0%"}
                        </strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">All-Time</span>
                        <strong className="text-emerald-400">
                          {pastPerformance?.benchmarks?.roi_all_time || "+1,200%"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Cycle Resilience & Volatility Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                      <div className="flex items-center gap-2 text-blue-400 font-bold">
                        <Activity size={14} />
                        <span>Bull vs. Bear Cycle Resilience</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {pastPerformance?.cycle_analysis || `${coin.name} has demonstrated varying levels of resilience across historical crypto bull and bear market cycles.`}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                      <div className="flex items-center gap-2 text-purple-400 font-bold">
                        <Scale size={14} />
                        <span>Volatility Footprint & Flash Crash Behavior</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {pastPerformance?.volatility_profile || "Exhibits typical altcoin volatility with rapid intraday price adjustments during high-volume trading sessions."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════════
                  SECTION 3: REALISTIC LIVE EXCHANGE GRAPH
              ═══════════════════════════════════════════════════════════════════ */}
              {(activeSection === "all" || activeSection === "graph") && (
                <div id="section-3-live-graph" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                        3
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight">
                          Live Interactive Exchange Graph
                        </h2>
                        <p className="text-slate-400 text-xs">
                          Realistic Candlestick bars, Volume histogram, Moving Averages (SMA 20, EMA 12), and scroll-safe interaction.
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Streaming Live
                    </span>
                  </div>

                  {/* Realistic Exchange Candlestick & Volume Graph Component */}
                  <RealisticLiveExchangeGraph
                    coinId={coin.coin_id}
                    coinName={coin.name}
                    coinSymbol={coin.symbol}
                    currentPrice={currentPrice}
                    priceChange24h={currentChg}
                  />
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════════
                  SECTION 4: POINT-BY-POINT NEWS ANALYSIS (SIMPLE ENGLISH)
              ═══════════════════════════════════════════════════════════════════ */}
              {(activeSection === "all" || activeSection === "news") && (
                <div id="section-4-news-analysis" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                        4
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight">
                          Point-by-Point Analysis of Relevant News on Coin
                        </h2>
                        <p className="text-slate-400 text-xs">
                          Written in everyday language for common people — zero cryptic jargon without explanation.
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded-full">
                      {pointByPointNews.length} News Catalysts Audited
                    </span>
                  </div>

                  {/* Point-by-point breakdown cards */}
                  <div className="space-y-3.5">
                    {pointByPointNews.length > 0 ? (
                      pointByPointNews.map((item: any, idx: number) => {
                        const isBull = item.sentiment === "BULLISH" || item.future_price_impact?.sentiment_tag === "BULLISH";
                        const isBear = item.sentiment === "BEARISH" || item.sentiment === "WARNING" || item.future_price_impact?.sentiment_tag === "BEARISH";

                        return (
                          <div
                            key={item.id || idx}
                            className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-3 hover:border-slate-700 transition"
                          >
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div className="flex-1 min-w-[240px]">
                                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mb-1">
                                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                                    Point #{idx + 1}
                                  </span>
                                  <span>{item.source}</span>
                                  <span>•</span>
                                  <span>{item.time_ago}</span>
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                                  {item.headline}
                                </h3>
                              </div>

                              <span
                                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                                  isBull
                                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                                    : isBear
                                    ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                                    : "bg-amber-500/15 border-amber-500/40 text-amber-300"
                                }`}
                              >
                                {isBull ? "🟢 Positive Catalyst" : isBear ? "🔴 Warning / Downside Risk" : "🟡 Neutral Sideways"}
                              </span>
                            </div>

                            {/* 3 Step Simple Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/60 text-xs">
                              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/60 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1">
                                  <Info size={11} /> What Happened (Plain English)
                                </span>
                                <p className="text-slate-300 leading-relaxed">
                                  {item.what_happened_simple}
                                </p>
                              </div>

                              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/60 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                                  <DollarSign size={11} /> Why It Matters For Your Money
                                </span>
                                <p className="text-slate-300 leading-relaxed">
                                  {item.why_it_matters_for_your_money}
                                </p>
                              </div>

                              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/60 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                                  <Clock size={11} /> Future Price Outlook
                                </span>
                                <p className="text-slate-300 leading-relaxed font-medium">
                                  <strong className="text-slate-100">Short-Term (1-30d):</strong> {item.future_price_impact?.short_term_outlook}
                                </p>
                                <p className="text-slate-400 text-[11px] leading-relaxed">
                                  <strong className="text-slate-300">Medium-Term:</strong> {item.future_price_impact?.medium_term_outlook}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-5 text-center text-xs text-slate-500">
                        No recent breaking news alerts flagged for this token.
                      </div>
                    )}
                  </div>

                  {/* Interactive News Catalyst Simulator */}
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-blue-500/20 space-y-2.5 mt-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                      <Sparkles size={14} className="text-blue-400" />
                      <span>Test a Breaking News Headline / Catalyst Simulation:</span>
                    </div>
                    <form onSubmit={handleCustomHeadlineSubmit} className="flex gap-2 flex-wrap">
                      <input
                        className="input flex-1 min-w-[220px] text-xs h-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500"
                        placeholder="e.g. US SEC approves sovereign crypto reserve, or Major exchange delists coin..."
                        value={customHeadline}
                        onChange={(e) => setCustomHeadline(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-sm whitespace-nowrap"
                      >
                        Simulate Impact
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════════
                  SECTION 5: INVESTMENT STRATEGY GUIDE (SHORT-TERM VS LONG-TERM)
              ═══════════════════════════════════════════════════════════════════ */}
              {(activeSection === "all" || activeSection === "strategy") && (
                <div id="section-5-investment-strategy" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                        5
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight">
                          Investment Strategy Guide (Short-Term vs. Long-Term)
                        </h2>
                        <p className="text-slate-400 text-xs">
                          Clear tactical entry levels, stop-loss rules, DCA buying plans, and exit triggers.
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
                      Risk Management Blueprint
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                    {/* Short-Term Trading Strategy */}
                    <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                          <Activity size={16} />
                          <span>Short-Term Trading Playbook (Days to Weeks)</span>
                        </div>
                        <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                          Active Trading
                        </span>
                      </div>

                      <div className="space-y-2 text-slate-300 leading-relaxed">
                        <p>
                          <strong className="text-slate-100">Who It Is For:</strong> {investmentStrategy?.short_term_trading?.suitable_for || "Active momentum traders with continuous chart access."}
                        </p>
                        <p>
                          <strong className="text-slate-100">Entry Tactics & Timing:</strong> {investmentStrategy?.short_term_trading?.entry_tactics || "Buy on confirmed support bounces with volume expansion."}
                        </p>
                        <p className="text-rose-300 font-semibold p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25">
                          🛡️ <strong>Strict Stop-Loss Setting:</strong> {investmentStrategy?.short_term_trading?.recommended_stop_loss || "Enforce hard stop-loss at -6% to -8% below entry."}
                        </p>
                        <p>
                          <strong className="text-slate-100">Target Risk-to-Reward:</strong> {investmentStrategy?.short_term_trading?.risk_reward_ratio || "Minimum 1 : 2.5"}
                        </p>
                        <p>
                          <strong className="text-slate-100">Position Sizing Rule:</strong> {investmentStrategy?.short_term_trading?.position_sizing_rule || "Never allocate more than 2% of total trading portfolio."}
                        </p>
                        <p>
                          <strong className="text-slate-100">Taking Profits:</strong> {investmentStrategy?.short_term_trading?.take_profit_strategy || "Scale out 50% at +15% gain and trail remaining with break-even stops."}
                        </p>
                        {investmentStrategy?.short_term_trading?.warning && (
                          <p className="text-[11px] text-amber-300 italic pt-1 border-t border-slate-800">
                            ⚠️ Warning: {investmentStrategy.short_term_trading.warning}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Long-Term Investment Strategy */}
                    <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                          <Clock size={16} />
                          <span>Long-Term Investment Strategy (1 to 5+ Years)</span>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
                          HODL & Accumulate
                        </span>
                      </div>

                      <div className="space-y-2 text-slate-300 leading-relaxed">
                        <p>
                          <strong className="text-slate-100">Who It Is For:</strong> {investmentStrategy?.long_term_investing?.suitable_for || "Disciplined investors building long-term wealth over multi-year cycles."}
                        </p>
                        <p className="text-emerald-300 font-semibold p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                          📈 <strong>Dollar-Cost Averaging (DCA):</strong> {investmentStrategy?.long_term_investing?.dca_strategy || "Automate disciplined weekly or monthly buys."}
                        </p>
                        <p>
                          <strong className="text-slate-100">Fundamental Thesis:</strong> {investmentStrategy?.long_term_investing?.fundamental_holding_thesis || "Strong developer adoption and cryptographic network utility."}
                        </p>
                        <p>
                          <strong className="text-slate-100">When To Cut Losses (Exit Triggers):</strong> {investmentStrategy?.long_term_investing?.exit_triggers || "Sell if developers abandon project or regulatory bans occur."}
                        </p>
                        <p>
                          <strong className="text-slate-100">Staking & Passive Yield:</strong> {investmentStrategy?.long_term_investing?.staking_and_yield || "Check native validator staking rewards (approx 3-6% APY)."}
                        </p>
                        <p>
                          <strong className="text-slate-100">Safe Storage:</strong> {investmentStrategy?.long_term_investing?.safe_storage_recommendation || "Store long-term funds in a Hardware Cold Storage Wallet (Ledger/Trezor)."}
                        </p>
                        <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                          ⏳ Recommended Horizon: <strong className="text-slate-200">{investmentStrategy?.long_term_investing?.time_horizon || "3 to 5 Years"}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════════
                  SECTION 6: RISK MATRIX, DOWNSIDE SCENARIOS, POPULARITY & PROS/CONS
              ═══════════════════════════════════════════════════════════════════ */}
              {(activeSection === "all" || activeSection === "risk") && (
                <div id="section-6-risk-matrix" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
                        6
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight">
                          Risk Matrix, Downside Scenarios, Popularity & Pros & Cons
                        </h2>
                        <p className="text-slate-400 text-xs">
                          Comprehensive analysis of popularity, all failure modes that can lose you money, and in-depth pros & cons.
                        </p>
                      </div>
                    </div>

                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${currentSafety.cls}`}>
                      {currentSafety.text}
                    </span>
                  </div>

                  {/* 1. Popularity & Social Health Audit */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-blue-400 font-bold text-xs sm:text-sm">
                        <Users size={15} />
                        <span>Popularity & Community Health Audit</span>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300">
                        Level: {riskMatrix?.popularity_audit?.popularity_level || "Standard Global"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {riskMatrix?.popularity_audit?.popularity_summary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-800/80">
                      <div className="space-y-1">
                        <strong className="text-slate-200">Community Authenticity:</strong>
                        <p className="text-slate-400 leading-relaxed">{riskMatrix?.popularity_audit?.community_health}</p>
                      </div>
                      <div className="space-y-1">
                        <strong className="text-slate-200">Exchange Liquidity Depth:</strong>
                        <p className="text-slate-400 leading-relaxed">{riskMatrix?.popularity_audit?.liquidity_depth}</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. All Possible Conditions That Can Make Your Money Go Down (Failure Modes) */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs sm:text-sm">
                      <AlertTriangle size={15} />
                      <span>All Possible Conditions That Can Make Your Money Go Down:</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {riskMatrix?.downside_failure_conditions?.map((cond: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h4 className="font-extrabold text-slate-100 text-xs sm:text-sm">{cond.title}</h4>
                            <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25">
                              Expected Drop: {cond.drawdown_impact}
                            </span>
                          </div>
                          <p className="text-slate-400 leading-relaxed">
                            <strong className="text-slate-300">Trigger:</strong> {cond.trigger_condition}
                          </p>
                          <p className="text-slate-300 leading-relaxed">
                            <strong className="text-amber-400">Impact on Your Money:</strong> {cond.how_it_affects_your_money}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Detailed Pros & Cons (No 1-liners — thorough 2-3 sentence explanations!) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    {/* Detailed Pros */}
                    <div className="p-4 sm:p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                        <CheckCircle2 size={16} />
                        <span>Key Advantages (Pros) — Detailed Explanation</span>
                      </div>

                      <div className="space-y-3 text-xs">
                        {riskMatrix?.detailed_pros?.map((pro: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <h5 className="font-bold text-slate-100 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              {pro.title}
                            </h5>
                            <p className="text-slate-300 leading-relaxed pl-3">
                              {pro.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Cons */}
                    <div className="p-4 sm:p-5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm">
                        <XCircle size={16} />
                        <span>Key Risks & Drawbacks (Cons) — Detailed Explanation</span>
                      </div>

                      <div className="space-y-3 text-xs">
                        {riskMatrix?.detailed_cons?.map((con: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <h5 className="font-bold text-slate-100 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                              {con.title}
                            </h5>
                            <p className="text-slate-300 leading-relaxed pl-3">
                              {con.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 4. Final Bottom-Line Risk Verdict for Ordinary People */}
                  <div className="p-5 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-blue-300 font-extrabold text-sm">
                      <Shield size={16} className="text-blue-400" />
                      <span>Final Actionable Risk Verdict for Everyday People:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                      {riskMatrix?.bottom_line_risk_verdict || "Maintain disciplined position sizing, enforce stop losses for short-term trades, and store long-term assets in cold wallets."}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-[#0f1626] flex items-center justify-between gap-3 text-xs text-slate-400 flex-wrap">
          <div className="flex items-center gap-2 text-[11px]">
            <Sparkles size={13} className="text-blue-400" />
            <span>Realtime Institutional Risk Engine active • Updated {new Date().toLocaleTimeString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-white/5"
            >
              {isCopied ? "Copied to Clipboard!" : "Copy Report Text"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-sm"
            >
              Done & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
