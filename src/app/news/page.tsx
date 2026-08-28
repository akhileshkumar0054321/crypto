"use client";

import React, { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { newsApi } from "@/lib/api";
import { NewsItem } from "@/types";
import { InteractiveNewsCard } from "@/components/news/InteractiveNewsCard";
import { NewsImpactModal } from "@/components/news/NewsImpactModal";
import {
  Flame,
  Sparkles,
  Radio,
  Search,
  RefreshCw,
  Newspaper,
  Cpu,
} from "lucide-react";
import { useRouter } from "next/navigation";

function NewsContent() {
  const router = useRouter();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: newsData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["top-trending-news", searchQuery],
    queryFn: () => newsApi.getMarketNews(undefined, searchQuery || undefined).then((r) => r.data),
    refetchInterval: 60_000,
  });

  const newsList: NewsItem[] = newsData?.news || [];
  // Filter for top trending or high importance
  const trendingNews = newsList.filter(
    (item) => item.importance === "HIGH" || item.sentiment === "BULLISH"
  );
  const displayNews = trendingNews.length > 0 ? trendingNews : newsList;

  return (
    <div id="top-trending-news-page" className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/50 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-bold tracking-wide">
            <Flame size={14} className="text-amber-400 animate-pulse" />
            TOP TRENDING CRYPTO NEWS & DEEP AI ANALYSIS
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight leading-tight">
            Top Trending Crypto News & Detailed AI Impact Analysis
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Real-time verified crypto news paired with deep FinBERT sentiment scoring, causal transmission modeling, affected cryptocurrencies, and multi-year price projections. Click any breaking headline to inspect detailed AI forensic breakdowns.
          </p>
        </div>
      </div>

      {/* Search & Refresh Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search trending crypto news or coin tags..."
            className="input w-full pl-10 h-10 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-bold border border-blue-500/30 transition flex items-center gap-2 cursor-pointer self-stretch sm:self-auto justify-center"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin text-blue-400" : ""} />
          <span>Refresh Wire</span>
        </button>
      </div>

      {/* News Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-slate-900/60 border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : displayNews.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
          <Newspaper size={32} className="mx-auto text-slate-600" />
          <p className="text-slate-300 font-bold text-sm">No trending news items found</p>
          <p className="text-slate-500 text-xs">Try clearing your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayNews.map((item) => (
            <InteractiveNewsCard
              key={item.id}
              item={item}
              onSelect={(n) => setSelectedNews(n)}
            />
          ))}
        </div>
      )}

      {/* Detailed AI Analysis Modal */}
      <NewsImpactModal
        item={selectedNews}
        onClose={() => setSelectedNews(null)}
      />
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400 animate-pulse text-xs">
          Loading Top Trending Crypto News & AI Analysis...
        </div>
      }
    >
      <NewsContent />
    </Suspense>
  );
}

