"use client";

import React, { useState } from "react";
import { RealtimeCryptoRadar } from "@/components/analysis/RealtimeCryptoRadar";
import { RealtimeCoinAnalysisReportModal } from "@/components/analysis/RealtimeCoinAnalysisReportModal";
import { useQuery } from "@tanstack/react-query";
import { coinApi } from "@/lib/api";
import { Radio, Sparkles, Activity, ShieldCheck, TrendingUp, Zap, Clock } from "lucide-react";
import Link from "next/link";

export default function RadarPage() {
  const [activeAnalysisCoin, setActiveAnalysisCoin] = useState<any | null>(null);

  const { data: coins = [] } = useQuery({
    queryKey: ["radar-page-coins"],
    queryFn: () => coinApi.getAll().then((r) => r.data).catch(() => []),
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-blue-600/25 border border-blue-500/40 text-blue-400">
              <Radio size={24} className="animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Real-Time Crypto Radar
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                  LIVE STREAM
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Sub-second market intelligence, momentum sweeps, whale tape tracking, and 6-section forensic analysis.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition"
          >
            Dashboard Home
          </Link>
          <Link
            href="/news"
            className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Sparkles size={13} />
            <span>Breaking Threat Wire</span>
          </Link>
        </div>
      </div>

      {/* ── Real-Time Crypto Radar Component ─────────────────────────────── */}
      <RealtimeCryptoRadar
        onSelectCoinForAnalysis={(coin) => setActiveAnalysisCoin(coin)}
      />

      {/* Analysis Modal */}
      {activeAnalysisCoin && (
        <RealtimeCoinAnalysisReportModal
          coin={activeAnalysisCoin}
          onClose={() => setActiveAnalysisCoin(null)}
          availableCoins={coins}
          onSelectOtherCoin={(other) => setActiveAnalysisCoin(other)}
        />
      )}
    </div>
  );
}
