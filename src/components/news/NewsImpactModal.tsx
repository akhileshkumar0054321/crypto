"use client";

import React from "react";
import { NewsItem } from "@/types";
import {
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Clock,
  Layers,
  ShieldCheck,
  Compass,
} from "lucide-react";
import Link from "next/link";

interface NewsImpactModalProps {
  item: NewsItem | null;
  onClose: () => void;
}

export function NewsImpactModal({ item, onClose }: NewsImpactModalProps) {
  if (!item) return null;

  const sentColor =
    item.sentiment === "BULLISH"
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      : item.sentiment === "BEARISH"
      ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
      : "text-amber-400 bg-amber-500/10 border-amber-500/30";

  const impact = item.impact_breakdown;

  return (
    <div
      id="news-impact-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="news-impact-modal-container"
        className="bg-[#0e131d] border border-white/15 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image Cover */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-900 rounded-t-2xl">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-blue-900 via-slate-900 to-indigo-950 flex items-center justify-center">
              <Sparkles size={48} className="text-blue-400/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e131d] via-[#0e131d]/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-slate-300 hover:text-white transition z-10 border border-white/10"
          >
            <X size={18} />
          </button>

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap z-10">
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${sentColor}`}>
              {item.sentiment}
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-900/90 border border-white/15 text-slate-200">
              {item.category}
            </span>
          </div>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span className="font-bold text-blue-400">{item.source}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock size={11} /> {item.timestamp}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
              {item.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* ModernFinBERT NLP Assessment Card */}
          {item.finbert && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 border border-indigo-500/30 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded">
                    ModernFinBERT NLP Model
                  </span>
                  <span className="text-xs font-bold text-white uppercase">
                    Classification: {item.finbert.label}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-cyan-300">
                  Confidence: {(item.finbert.score * 100).toFixed(1)}% ({item.finbert.score.toFixed(3)})
                </div>
              </div>

              {/* Mini Probability Distribution Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="text-emerald-400">Pos: {Math.round((item.finbert.probabilities?.positive || 0) * 100)}%</span>
                  <span className="text-rose-400">Neg: {Math.round((item.finbert.probabilities?.negative || 0) * 100)}%</span>
                  <span className="text-amber-400">Neu: {Math.round((item.finbert.probabilities?.neutral || 0) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden flex">
                  <div style={{ width: `${Math.round((item.finbert.probabilities?.positive || 0) * 100)}%` }} className="bg-emerald-500 h-full" />
                  <div style={{ width: `${Math.round((item.finbert.probabilities?.negative || 0) * 100)}%` }} className="bg-rose-500 h-full" />
                  <div style={{ width: `${Math.round((item.finbert.probabilities?.neutral || 0) * 100)}%` }} className="bg-amber-500 h-full" />
                </div>
              </div>

              {item.finbert.explanation && (
                <p className="text-[11px] text-slate-300 leading-relaxed italic">
                  &ldquo;{item.finbert.explanation}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles size={13} className="text-blue-400" /> Executive Overview
            </h4>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {item.summary}
            </p>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline mt-2 font-semibold"
              >
                View full original wire on {item.source} <ExternalLink size={11} />
              </a>
            )}
          </div>

          {/* Impact Breakdown */}
          {impact && (
            <div className="space-y-5">
              {/* Affected Coins Strip */}
              {impact.affected_coins && impact.affected_coins.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                    <Compass size={13} className="text-cyan-400" /> Projected Asset Impact Corridors
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {impact.affected_coins.map((c, i) => {
                      const isUp = c.direction === "BULLISH";
                      const isDown = c.direction === "BEARISH";
                      return (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-100">{c.name}</span>
                              <span className="font-mono text-[10px] text-slate-500 font-bold uppercase">
                                {c.symbol}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{c.key_catalyst}</p>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Horizon: {c.timeframe}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span
                              className={`text-xs font-mono font-bold px-2 py-0.5 rounded border inline-flex items-center gap-0.5 ${
                                isUp
                                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
                                  : isDown
                                  ? "text-rose-400 bg-rose-500/10 border-rose-500/25"
                                  : "text-amber-400 bg-amber-500/10 border-amber-500/25"
                              }`}
                            >
                              {isUp ? <TrendingUp size={11} /> : isDown ? <TrendingDown size={11} /> : null}
                              {c.estimated_impact_pct}
                            </span>
                            <div className="mt-1">
                              <Link
                                href={`/coin/${c.coin_id}`}
                                className="text-[10px] text-blue-400 hover:underline font-semibold"
                              >
                                Audit Coin &rarr;
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Causal Transmission Chain */}
              {impact.causal_transmission_chain && impact.causal_transmission_chain.length > 0 && (
                <div className="p-4 rounded-xl bg-[#090d14] border border-blue-500/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2.5 flex items-center gap-1.5">
                    <Layers size={13} /> Causal Market Transmission Chain
                  </h4>
                  <div className="space-y-2">
                    {impact.causal_transmission_chain.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center font-mono font-bold flex-shrink-0 text-[10px] border border-blue-500/30">
                          {idx + 1}
                        </span>
                        <span className="text-slate-300 leading-relaxed pt-0.5">
                          {step.replace(/^\d+\.\s*/, "")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Horizon Outlooks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Short-Term (1-30d)
                  </span>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {impact.short_term_outlook}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Medium-Term (1-6m)
                  </span>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {impact.medium_term_outlook}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Long-Term (1-3y)
                  </span>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {impact.long_term_outlook}
                  </p>
                </div>
              </div>

              {/* Institutional Capital Playbook */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-950 border border-emerald-500/25">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Capital Shield & Strategic Playbook
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {impact.institutional_playbook}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
