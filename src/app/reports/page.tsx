"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportApi, coinApi } from "@/lib/api";
import {
  FileText,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Sparkles,
  Flame,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { DexTrendingCoinsSection } from "@/components/dexscreener/DexTrendingCoinsSection";
import { RealtimeCoinAnalysisReportModal } from "@/components/analysis/RealtimeCoinAnalysisReportModal";

const statusIcon = (s: string) => {
  if (s === "completed") return <CheckCircle size={13} style={{ color: "#34d399" }} />;
  if (s === "failed") return <XCircle size={13} style={{ color: "#f87171" }} />;
  return <Clock size={13} style={{ color: "#fbbf24" }} />;
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"dex" | "standard">("dex");
  const [coinId, setCoinId] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [modalCoin, setModalCoin] = useState<any | null>(null);

  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportApi.getAll().then((r) => r.data).catch(() => []),
    refetchInterval: 10_000,
  });

  const generate = async () => {
    if (!coinId.trim()) return toast.error("Enter a coin ID first.");
    setGenerating(true);
    try {
      const res = await reportApi.generate(coinId.trim());
      toast.success("Report generated successfully!");
      if (res?.data) {
        setSelected(res.data);
      }
      refetch();
    } catch {
      toast.error("Failed to generate report.");
    } finally {
      setGenerating(false);
    }
  };

  const openDeepModal = (targetCoinId: string) => {
    setModalCoin({
      coin_id: targetCoinId.toLowerCase(),
      name: targetCoinId.charAt(0).toUpperCase() + targetCoinId.slice(1),
      symbol: targetCoinId.slice(0, 4).toUpperCase(),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText size={22} className="text-blue-400" />
            <span>AI Risk Intelligence & Forensic Reports</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Deep 6-section forensic audits for major cryptocurrencies and trending small-cap DEX tokens.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("dex")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "dex"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame size={13} className="text-amber-400" />
            <span>DexScreener Small-Caps (Live)</span>
          </button>

          <button
            onClick={() => setActiveTab("standard")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "standard"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap size={13} className="text-cyan-400" />
            <span>AI Multi-Agent Terminal</span>
          </button>
        </div>
      </div>

      {activeTab === "dex" ? (
        <DexTrendingCoinsSection
          showSearchHeader={true}
          onSelectCoinForReport={(c) => setModalCoin(c)}
        />
      ) : (
        <div className="space-y-5">
          {/* Generate Standard Report */}
          <div className="card" style={{ borderColor: "rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.04)" }}>
            <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
              Generate New Multi-Agent Report
            </p>
            <p style={{ color: "#475569", fontSize: "12px", marginBottom: "16px" }}>
              AI agents analyse market, on-chain data, tokenomics, and sentiment to produce a full risk report.
            </p>
            <div style={{ display: "flex", gap: "10px" }} className="flex-col sm:flex-row">
              <input
                className="input"
                placeholder="Enter coin ID or contract (e.g. bitcoin, solana, pepe, 0x...)"
                value={coinId}
                onChange={(e) => setCoinId(e.target.value)}
                style={{ flex: 1 }}
                onKeyDown={(e) => e.key === "Enter" && generate()}
              />
              <div className="flex gap-2">
                <button
                  className="btn-primary"
                  onClick={generate}
                  disabled={generating}
                  style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
                >
                  <Zap size={13} /> {generating ? "Generating…" : "Run Terminal Engine"}
                </button>
                <button
                  onClick={() => coinId.trim() && openDeepModal(coinId.trim())}
                  disabled={!coinId.trim()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Sparkles size={13} /> 6-Section Deep Audit
                </button>
              </div>
            </div>
          </div>

          {/* Report list + viewer */}
          <div style={{ display: "grid", gridTemplateColumns: selected ? "320px 1fr" : "1fr", gap: "16px" }}>
            {/* List */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="section-title">Archived Reports ({reports.length})</p>
              </div>
              {isLoading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton" style={{ height: "56px" }} />
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <FileText size={28} style={{ color: "#2d3748", margin: "0 auto 10px" }} />
                  <p style={{ color: "#475569", fontSize: "13px" }}>No reports archived yet</p>
                </div>
              ) : (
                <div>
                  {reports.map((r: any) => (
                    <div
                      key={r.id}
                      onClick={() => setSelected(r)}
                      style={{
                        padding: "12px 18px",
                        cursor: "pointer",
                        transition: "background 0.15s",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: selected?.id === r.id ? "rgba(59,130,246,0.06)" : "transparent",
                        borderLeft: selected?.id === r.id ? "2px solid #3b82f6" : "2px solid transparent",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                      onMouseEnter={(e) => {
                        if (selected?.id !== r.id)
                          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)";
                      }}
                      onMouseLeave={(e) => {
                        if (selected?.id !== r.id)
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      {statusIcon(r.status)}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            color: "#f1f5f9",
                            fontWeight: 600,
                            fontSize: "13px",
                            textTransform: "capitalize",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.coin_id}
                        </p>
                        <p style={{ color: "#475569", fontSize: "11px", marginTop: "2px" }}>
                          {new Date(r.created_at || Date.now()).toLocaleDateString()}
                          {r.risk_score_at_generation
                            ? ` · Risk ${r.risk_score_at_generation.toFixed(0)}`
                            : ""}
                        </p>
                      </div>
                      <ChevronRight size={12} style={{ color: "#2d3748", flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Viewer */}
            {selected && (
              <div className="card animate-fade-in" style={{ maxHeight: "70vh", overflow: "auto" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        color: "#f1f5f9",
                        fontWeight: 800,
                        fontSize: "16px",
                        textTransform: "capitalize",
                      }}
                    >
                      {selected.coin_id} — AI Report
                    </h2>
                    <p style={{ color: "#475569", fontSize: "12px", marginTop: "2px" }}>
                      {selected.model_used || "AI Analysis"} ·{" "}
                      {selected.generation_time_seconds?.toFixed(1) ?? "?"}s
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDeepModal(selected.coin_id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Sparkles size={12} />
                      <span>6-Section Audit</span>
                    </button>
                    <button className="btn-ghost" onClick={() => setSelected(null)} style={{ fontSize: "18px" }}>
                      ✕
                    </button>
                  </div>
                </div>

                {selected.recommendation && (
                  <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                    <div
                      style={{
                        padding: "12px 20px",
                        borderRadius: "10px",
                        background:
                          selected.recommendation === "BUY"
                            ? "rgba(16,185,129,0.1)"
                            : selected.recommendation === "SELL"
                            ? "rgba(239,68,68,0.1)"
                            : "rgba(245,158,11,0.1)",
                        border: `1px solid ${
                          selected.recommendation === "BUY"
                            ? "rgba(16,185,129,0.25)"
                            : selected.recommendation === "SELL"
                            ? "rgba(239,68,68,0.25)"
                            : "rgba(245,158,11,0.25)"
                        }`,
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#475569",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                        }}
                      >
                        Signal
                      </p>
                      <p
                        style={{
                          fontSize: "22px",
                          fontWeight: 800,
                          marginTop: "4px",
                          color:
                            selected.recommendation === "BUY"
                              ? "#34d399"
                              : selected.recommendation === "SELL"
                              ? "#f87171"
                              : "#fbbf24",
                        }}
                      >
                        {selected.recommendation}
                      </p>
                    </div>
                    {selected.risk_score_at_generation && (
                      <div
                        style={{
                          padding: "12px 20px",
                          borderRadius: "10px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          textAlign: "center",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "10px",
                            color: "#475569",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                          }}
                        >
                          Risk Score
                        </p>
                        <p
                          style={{
                            fontSize: "22px",
                            fontWeight: 800,
                            marginTop: "4px",
                            fontFamily: "monospace",
                            color:
                              selected.risk_score_at_generation >= 70
                                ? "#f87171"
                                : selected.risk_score_at_generation >= 40
                                ? "#fbbf24"
                                : "#34d399",
                          }}
                        >
                          {selected.risk_score_at_generation.toFixed(0)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {[
                  { key: "executive_summary", label: "Executive Summary" },
                  { key: "market_analysis", label: "Market Analysis" },
                  { key: "risk_analysis", label: "Risk Analysis" },
                  { key: "onchain_analysis", label: "On-Chain Analysis" },
                  { key: "sentiment_analysis", label: "Sentiment" },
                ]
                  .filter(({ key }) => selected[key])
                  .map(({ key, label }) => (
                    <div key={key} style={{ marginBottom: "20px" }}>
                      <p className="section-title" style={{ marginBottom: "10px" }}>
                        {label}
                      </p>
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "13px",
                          lineHeight: "1.7",
                          background: "rgba(255,255,255,0.02)",
                          padding: "14px 16px",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        {selected[key]}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6-Section Deep Audit Modal */}
      {modalCoin && (
        <RealtimeCoinAnalysisReportModal
          coin={modalCoin}
          onClose={() => setModalCoin(null)}
        />
      )}
    </div>
  );
}
