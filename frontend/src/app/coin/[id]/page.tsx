"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { coinApi, riskApi, reportApi } from "@/lib/api";
import { RiskGauge } from "@/components/ui/RiskGauge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, FileText, Zap, AlertTriangle, CheckCircle, ArrowLeft, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

const recColor = (r?: string) =>
  r === "BUY" ? "#34d399" : r === "SELL" ? "#f87171" : "#fbbf24";

export default function CoinDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [generating, setGenerating] = useState(false);

  const { data: coin } = useQuery({
    queryKey: ["coin", id],
    queryFn: () => coinApi.getOne(id).then(r => r.data).catch(() => null),
    refetchInterval: 30_000,
  });

  const { data: history } = useQuery({
    queryKey: ["coin-history", id],
    queryFn: () => coinApi.getHistory(id, 30).then(r => r.data).catch(() => null),
  });

  const { data: risk, refetch: refetchRisk } = useQuery({
    queryKey: ["risk", id],
    queryFn: () => riskApi.getScore(id).then(r => r.data).catch(() => null),
    refetchInterval: 60_000,
  });

  const { data: factors } = useQuery({
    queryKey: ["risk-factors", id],
    queryFn: () => riskApi.getFactors(id).then(r => r.data).catch(() => null),
  });

  const chartData = history?.prices?.map(([ts, price]: [number, number]) => ({
    date: new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    price,
  })) || [];

  const handleAnalyze = async () => {
    try { await riskApi.analyze(id); toast.success("Analysis triggered!"); setTimeout(() => refetchRisk(), 3000); }
    catch { toast.error("Analysis failed."); }
  };

  const handleReport = async () => {
    setGenerating(true);
    try { await reportApi.generate(id); toast.success("Report generation started!"); }
    catch { toast.error("Report failed — login required."); }
    finally { setGenerating(false); }
  };

  if (!coin) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "12px" }} />)}
    </div>
  );

  const chg = coin.price_change_24h ?? 0;
  const isUp = chg >= 0;
  const score = risk?.score ?? 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back + Header */}
      <div>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#475569", fontSize: "13px", textDecoration: "none", marginBottom: "16px" }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {coin.image_url && <img src={coin.image_url} alt={coin.symbol} style={{ width: "52px", height: "52px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.08)" }} />}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{ color: "#f1f5f9", fontSize: "22px", fontWeight: 800 }}>{coin.name}</h1>
                <span style={{ color: "#475569", fontSize: "13px", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "6px" }}>
                  {coin.symbol?.toUpperCase()}
                </span>
              </div>
              <p style={{ color: "#475569", fontSize: "12px", marginTop: "2px" }}>Rank #{coin.market_cap_rank}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-secondary" onClick={handleAnalyze} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Zap size={13} /> Analyze Risk
            </button>
            <button className="btn-primary" onClick={handleReport} disabled={generating} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FileText size={13} /> {generating ? "Generating…" : "AI Report"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p style={{ color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Price</p>
          <p style={{ color: "#f1f5f9", fontSize: "22px", fontWeight: 800, fontFamily: "monospace", marginTop: "6px" }}>
            ${coin.price_usd >= 1 ? coin.price_usd.toLocaleString("en-US", { maximumFractionDigits: 2 }) : coin.price_usd?.toFixed(6)}
          </p>
          <p className={isUp ? "positive" : "negative"} style={{ fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "3px" }}>
            {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(chg).toFixed(2)}% (24h)
          </p>
        </div>
        <div className="stat-card">
          <p style={{ color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Market Cap</p>
          <p style={{ color: "#f1f5f9", fontSize: "22px", fontWeight: 800, fontFamily: "monospace", marginTop: "6px" }}>
            {coin.market_cap ? `$${(coin.market_cap/1e9).toFixed(2)}B` : "—"}
          </p>
        </div>
        <div className="stat-card">
          <p style={{ color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>24h Volume</p>
          <p style={{ color: "#f1f5f9", fontSize: "22px", fontWeight: 800, fontFamily: "monospace", marginTop: "6px" }}>
            {coin.volume_24h ? `$${(coin.volume_24h/1e6).toFixed(1)}M` : "—"}
          </p>
        </div>
        {risk && (
          <div className="stat-card" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <RiskGauge score={score} size={80} showLabel showLevel={false} />
            <div>
              <p style={{ color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Signal</p>
              <p style={{ color: recColor(risk.recommendation), fontSize: "20px", fontWeight: 800, marginTop: "4px" }}>
                {risk.recommendation}
              </p>
              <p style={{ color: "#475569", fontSize: "11px" }}>
                {((risk.recommendation_confidence ?? 0) * 100).toFixed(0)}% confidence
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card">
          <p className="section-title" style={{ marginBottom: "16px" }}>30-Day Price</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: "#2d3748", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#2d3748", fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(1)+"k" : v.toFixed(2)}`} />
              <Tooltip contentStyle={{ background: "#161b27", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#94a3b8" }} itemStyle={{ color: "#60a5fa" }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, "Price"]} />
              <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} fill="url(#pg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Risk factors + Fraud */}
      {factors && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <p className="section-title" style={{ marginBottom: "16px" }}>Risk Breakdown</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Object.entries(factors.factors || {}).map(([key, fac]: any) => (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "#94a3b8", fontSize: "12px" }}>{fac.label}</span>
                    <span style={{ color: "#f1f5f9", fontSize: "12px", fontFamily: "monospace" }}>{fac.score?.toFixed(1)}</span>
                  </div>
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px" }}>
                    <div style={{
                      width: `${fac.score}%`, height: "100%", borderRadius: "2px",
                      background: fac.score >= 70 ? "#ef4444" : fac.score >= 40 ? "#f59e0b" : "#10b981",
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <p className="section-title" style={{ marginBottom: "16px" }}>Fraud Detection</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { key: "pump_dump",    label: "Pump & Dump"       },
                { key: "wash_trading", label: "Wash Trading"      },
                { key: "honeypot",     label: "Honeypot Contract" },
              ].map(({ key, label }) => {
                const detected = factors.fraud_signals?.[key];
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", background: detected ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.04)", border: `1px solid ${detected ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.15)"}` }}>
                    {detected ? <AlertTriangle size={14} style={{ color: "#f87171", flexShrink: 0 }} /> : <CheckCircle size={14} style={{ color: "#34d399", flexShrink: 0 }} />}
                    <span style={{ color: "#94a3b8", fontSize: "12px", flex: 1 }}>{label}</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: detected ? "#f87171" : "#34d399" }}>
                      {detected ? "DETECTED" : "CLEAR"}
                    </span>
                  </div>
                );
              })}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontSize: "12px" }}>Fraud Probability</span>
                  <span style={{ color: "#f1f5f9", fontSize: "12px", fontFamily: "monospace" }}>
                    {((factors.fraud_signals?.fraud_probability ?? 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
