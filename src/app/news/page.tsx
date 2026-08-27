"use client";

import React, { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { newsApi } from "@/lib/api";
import { NewsItem } from "@/types";
import { InteractiveNewsCard } from "@/components/news/InteractiveNewsCard";
import { NewsImpactModal } from "@/components/news/NewsImpactModal";
import { ModernFinBERTClassifier } from "@/components/nlp/ModernFinBERTClassifier";
import {
  Search,
  Sparkles,
  Radio,
  Filter,
  Flame,
  ShieldAlert,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Cpu,
  Newspaper,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = [
  { id: "ALL", label: "All News & Intelligence" },
  { id: "Macro & ETFs", label: "Macro & ETFs" },
  { id: "DeFi & Layer 1", label: "DeFi & Layer 1" },
  { id: "Security & Exploit", label: "Security & Exploits" },
  { id: "Regulation", label: "Regulation & Policy" },
  { id: "Whales", label: "Whale Capital Flows" },
  { id: "Social Hype & Memes", label: "Social & Memes" },
];

function NewsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "finbert" ? "finbert" : "news";

  const [activeTab, setActiveTab] = useState<"news" | "finbert">(initialTab);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [customHeadline, setCustomHeadline] = useState("");

  const {
    data: newsData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["market-news", selectedCategory, searchQuery],
    queryFn: () =>
      newsApi
        .getMarketNews(
          selectedCategory === "ALL" ? undefined : selectedCategory,
          searchQuery || undefined
        )
        .then((r) => r.data),
    refetchInterval: 60_000,
  });

  const newsList: NewsItem[] = newsData?.news || [];
  const liveSource = newsData?.live_source || "Cryptocurrency.cv Verified Intelligence Engine";

  const handleCustomAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHeadline.trim()) return;
    router.push(`/coin/bitcoin?headline=${encodeURIComponent(customHeadline.trim())}`);
  };

  return (
    <div id="market-news-page" className="space-y-6 animate-fade-in pb-16">
      {/* ── View Tab Bar: Live News vs ModernFinBERT NLP Studio ───────────── */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("news")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === "news"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Newspaper size={14} />
            <span>Live Market Intelligence Wire</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("finbert")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === "finbert"
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu size={14} className="text-cyan-400" />
            <span>ModernFinBERT NLP Studio</span>
            <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold">
              HF Model
            </span>
          </button>
        </div>

        {activeTab === "finbert" && (
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Model: tabularisai/ModernFinBERT</span>
          </div>
        )}
      </div>

      {activeTab === "finbert" ? (
        /* ── ModernFinBERT Studio Section ────────────────────────────────── */
        <ModernFinBERTClassifier />
      ) : (
        /* ── Standard News Wire Section ──────────────────────────────────── */
        <>
          {/* ── Top Hero Header ──────────────────────────────────────────────── */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-bold mb-3 tracking-wide">
                <Radio size={13} className="animate-pulse text-emerald-400" />
                REAL-TIME INTELLIGENCE & CAUSAL IMPACT MODELING
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-snug">
                Interactive Crypto Market News & Future Impact Analysis
              </h1>

              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Every market event is analyzed through ModernFinBERT financial NLP and propagated through liquidity pools, validator staking, and order books. Click any intelligence item to inspect the causal transmission chain, affected cryptocurrencies, and multi-year projection modeling.
              </p>

              {/* Custom Catalyst Simulator Input */}
              <form onSubmit={handleCustomAnalyze} className="mt-5 flex gap-2.5 flex-wrap">
                <div className="flex-1 min-w-[260px] relative">
                  <Sparkles size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
                  <input
                    className="input w-full pl-10 h-11 text-xs sm:text-sm bg-slate-950/90 border-slate-700/80 text-slate-100 placeholder:text-slate-500"
                    placeholder="Simulate impact of any custom breaking headline (e.g. 'SEC Approves Solana Staking ETF')..."
                    value={customHeadline}
                    onChange={(e) => setCustomHeadline(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary h-11 px-5 text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-lg shadow-blue-600/25"
                >
                  Analyze Catalyst &rarr;
                </button>
              </form>
            </div>
          </div>

          {/* ── Filters and Search Strip ───────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20"
                      : "bg-slate-900/80 text-slate-400 border-white/5 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Bar & Refresh */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search news or coin tags..."
                  className="input w-full pl-9 h-9 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button
                onClick={() => refetch()}
                className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                title="Refresh Intelligence Wire"
              >
                <RefreshCw size={14} className={isFetching ? "animate-spin text-blue-400" : ""} />
              </button>
            </div>
          </div>

          {/* ── Intelligence Grid ─────────────────────────────────────────────── */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-72 rounded-2xl bg-slate-900/60 border border-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : newsList.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
              <Layers size={32} className="mx-auto text-slate-600" />
              <p className="text-slate-300 font-bold text-sm">No intelligence items match your criteria</p>
              <p className="text-slate-500 text-xs">Try selecting a different category or clearing search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {newsList.map((item) => (
                <InteractiveNewsCard
                  key={item.id}
                  item={item}
                  onSelect={(n) => setSelectedNews(n)}
                />
              ))}
            </div>
          )}

          {/* ── Active Modal for Detailed Analysis ─────────────────────────────── */}
          <NewsImpactModal
            item={selectedNews}
            onClose={() => setSelectedNews(null)}
          />
        </>
      )}
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400 animate-pulse text-xs">
          Loading Market Intelligence Wire & NLP Studio...
        </div>
      }
    >
      <NewsContent />
    </Suspense>
  );
}
