"use client";

import React from "react";
import { NewsItem } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  ExternalLink,
  Zap,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface InteractiveNewsCardProps {
  item: NewsItem;
  onSelect: (item: NewsItem) => void;
}

export function InteractiveNewsCard({ item, onSelect }: InteractiveNewsCardProps) {
  const sentColor =
    item.sentiment === "BULLISH"
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      : item.sentiment === "BEARISH"
      ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
      : "text-amber-400 bg-amber-500/10 border-amber-500/30";

  const isUp = item.sentiment === "BULLISH";
  const isDown = item.sentiment === "BEARISH";

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative flex flex-col rounded-2xl bg-[#0e131d] border border-white/[0.08] hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Image Thumbnail Container */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-blue-950 flex items-center justify-center">
            <Sparkles size={32} className="text-blue-400/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e131d] via-[#0e131d]/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border backdrop-blur-md ${sentColor}`}
            >
              {item.sentiment}
            </span>

            {item.cryptobert ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40 backdrop-blur-md" title={`CryptoBERT (${item.cryptobert.model}) Confidence: ${(item.cryptobert.score * 100).toFixed(0)}%`}>
                CryptoBERT {(item.cryptobert.score * 100).toFixed(0)}%
              </span>
            ) : item.finbert ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 backdrop-blur-md" title={`ModernFinBERT score: ${item.finbert.score}`}>
                FinBERT {item.finbert.score.toFixed(2)}
              </span>
            ) : null}
          </div>

          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-md text-slate-300 border border-white/10">
            {item.category}
          </span>
        </div>

        {/* Affected coins teaser pills */}
        {item.impact_breakdown?.affected_coins && item.impact_breakdown.affected_coins.length > 0 && (
          <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 flex-wrap">
            {item.impact_breakdown.affected_coins.slice(0, 3).map((c, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-slate-200 text-[10px] font-mono font-bold border border-white/10"
              >
                {c.symbol} {c.estimated_impact_pct}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Source and Timestamp */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
            <span className="font-bold text-blue-400">{item.source}</span>
            <span className="flex items-center gap-1 font-mono">
              <Clock size={10} /> {item.timestamp}
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
            {item.title}
          </h3>

          {/* Summary snippet */}
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {item.summary}
          </p>
        </div>

        {/* Bottom Action Footer */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-blue-400 group-hover:text-blue-300 font-semibold inline-flex items-center gap-1">
            <Sparkles size={12} /> View Future Impact & Causal Chain
          </span>
          <ArrowRight
            size={13}
            className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
