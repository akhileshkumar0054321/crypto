"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { reportApi } from "@/lib/api";
import { FileText, Zap, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const statusIcon = (s: string) => {
  if (s === "completed") return <CheckCircle size={13} style={{ color: "#34d399" }} />;
  if (s === "failed")    return <XCircle size={13} style={{ color: "#f87171" }} />;
  return <Clock size={13} style={{ color: "#fbbf24" }} />;
};

export default function ReportsPage() {
  const [coinId, setCoinId] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportApi.getAll().then(r => r.data).catch(() => []),
    refetchInterval: 10_000,
  });

  const generate = async () => {
    if (!coinId.trim()) return toast.error("Enter a coin ID first.");
    setGenerating(true);
    try { await reportApi.generate(coinId.trim()); toast.success("Report started! Refresh in 30s."); setTimeout(() => refetch(), 30_000); }
    catch { toast.error("Login required to generate reports."); }
    finally { setGenerating(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 style={{ color: "#f1f5f9", fontSize: "20px", fontWeight: 800 }}>AI Reports</h1>
        <p style={{ color: "#475569", fontSize: "13px", marginTop: "4px" }}>Multi-agent AI powered crypto analysis reports</p>
      </div>

      {/* Generate */}
      <div className="card" style={{ borderColor: "rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.04)" }}>
        <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>Generate New Report</p>
        <p style={{ color: "#475569", fontSize: "12px", marginBottom: "16px" }}>AI agents analyse market, on-chain data, and sentiment to produce a full risk report.</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <input className="input" placeholder="Enter coin ID (e.g. bitcoin, ethereum)" value={coinId} onChange={e => setCoinId(e.target.value)}
            style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && generate()} />
          <button className="btn-primary" onClick={generate} disabled={generating} style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
            <Zap size={13} /> {generating ? "Generating…" : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Report list + viewer */}
      <div style={{ display: "grid", gridTemplateColumns: selected ? "320px 1fr" : "1fr", gap: "16px" }}>
        {/* List */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="section-title">Reports ({reports.length})</p>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "56px" }} />)}</div>
          ) : reports.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <FileText size={28} style={{ color: "#2d3748", margin: "0 auto 10px" }} />
              <p style={{ color: "#475569", fontSize: "13px" }}>No reports yet</p>
            </div>
          ) : (
            <div>
              {reports.map((r: any) => (
                <div key={r.id} onClick={() => setSelected(r)}
                  style={{
                    padding: "12px 18px", cursor: "pointer", transition: "background 0.15s",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background: selected?.id === r.id ? "rgba(59,130,246,0.06)" : "transparent",
                    borderLeft: selected?.id === r.id ? "2px solid #3b82f6" : "2px solid transparent",
                    display: "flex", alignItems: "center", gap: "10px",
                  }}
                  onMouseEnter={e => { if (selected?.id !== r.id) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)"; }}
                  onMouseLeave={e => { if (selected?.id !== r.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  {statusIcon(r.status)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "13px", textTransform: "capitalize", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.coin_id}
                    </p>
                    <p style={{ color: "#475569", fontSize: "11px", marginTop: "2px" }}>
                      {new Date(r.created_at || Date.now()).toLocaleDateString()}
                      {r.risk_score_at_generation ? ` · Risk ${r.risk_score_at_generation.toFixed(0)}` : ""}
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "16px", textTransform: "capitalize" }}>{selected.coin_id} — AI Report</h2>
                <p style={{ color: "#475569", fontSize: "12px", marginTop: "2px" }}>
                  {selected.model_used || "AI Analysis"} · {selected.generation_time_seconds?.toFixed(1) ?? "?"}s
                </p>
              </div>
              <button className="btn-ghost" onClick={() => setSelected(null)} style={{ fontSize: "18px" }}>✕</button>
            </div>

            {selected.recommendation && (
              <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <div style={{ padding: "12px 20px", borderRadius: "10px", background: selected.recommendation === "BUY" ? "rgba(16,185,129,0.1)" : selected.recommendation === "SELL" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${selected.recommendation === "BUY" ? "rgba(16,185,129,0.25)" : selected.recommendation === "SELL" ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)"}`, textAlign: "center" }}>
                  <p style={{ fontSize: "10px", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Signal</p>
                  <p style={{ fontSize: "22px", fontWeight: 800, marginTop: "4px", color: selected.recommendation === "BUY" ? "#34d399" : selected.recommendation === "SELL" ? "#f87171" : "#fbbf24" }}>{selected.recommendation}</p>
                </div>
                {selected.risk_score_at_generation && (
                  <div style={{ padding: "12px 20px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                    <p style={{ fontSize: "10px", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Risk Score</p>
                    <p style={{ fontSize: "22px", fontWeight: 800, marginTop: "4px", fontFamily: "monospace", color: selected.risk_score_at_generation >= 70 ? "#f87171" : selected.risk_score_at_generation >= 40 ? "#fbbf24" : "#34d399" }}>
                      {selected.risk_score_at_generation.toFixed(0)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {[
              { key: "executive_summary",  label: "Executive Summary"  },
              { key: "market_analysis",    label: "Market Analysis"    },
              { key: "risk_analysis",      label: "Risk Analysis"      },
              { key: "onchain_analysis",   label: "On-Chain Analysis"  },
              { key: "sentiment_analysis", label: "Sentiment"          },
            ].filter(({ key }) => selected[key]).map(({ key, label }) => (
              <div key={key} style={{ marginBottom: "20px" }}>
                <p className="section-title" style={{ marginBottom: "10px" }}>{label}</p>
                <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.7", background: "rgba(255,255,255,0.02)", padding: "14px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  {selected[key]}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
