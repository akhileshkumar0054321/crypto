"use client";
import { useQuery } from "@tanstack/react-query";
import { riskApi, coinApi } from "@/lib/api";
import { RiskGauge } from "@/components/ui/RiskGauge";
import { useState } from "react";
import { Filter, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";

const FILTERS = ["ALL","LOW","MEDIUM","HIGH","CRITICAL"] as const;

const riskColor = (s: number) =>
  s >= 80 ? "#f87171" : s >= 60 ? "#fb923c" : s >= 30 ? "#fbbf24" : "#34d399";

export default function RiskExplorerPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState<"asc"|"desc">("desc");

  const { data: coins = [] } = useQuery({
    queryKey: ["coins"],
    queryFn: () => coinApi.getAll().then(r => r.data),
    refetchInterval: 60_000,
  });
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["risk-leaderboard"],
    queryFn: () => riskApi.getLeaderboard().then(r => r.data),
    refetchInterval: 30_000,
  });

  const enriched = coins.map((c: any) => ({
    ...c, ...(leaderboard.find((r: any) => r.coin_id === c.coin_id) || {}),
  }));

  const counts = {
    CRITICAL: enriched.filter((c: any) => (c.score??0) >= 80).length,
    HIGH:     enriched.filter((c: any) => (c.score??0) >= 60 && (c.score??0) < 80).length,
    MEDIUM:   enriched.filter((c: any) => (c.score??0) >= 30 && (c.score??0) < 60).length,
    LOW:      enriched.filter((c: any) => (c.score??0) < 30).length,
  };

  const filtered = enriched
    .filter((c: any) => {
      if (filter === "ALL") return true;
      const s = c.score ?? 50;
      if (filter === "CRITICAL") return s >= 80;
      if (filter === "HIGH")     return s >= 60 && s < 80;
      if (filter === "MEDIUM")   return s >= 30 && s < 60;
      if (filter === "LOW")      return s < 30;
    })
    .sort((a: any, b: any) => sort === "desc" ? (b.score??50) - (a.score??50) : (a.score??50) - (b.score??50));

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 style={{ color: "#f1f5f9", fontSize: "20px", fontWeight: 800 }}>Risk Explorer</h1>
        <p style={{ color: "#475569", fontSize: "13px", marginTop: "4px" }}>Click any coin for deep analysis</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {([
          { label: "CRITICAL", count: counts.CRITICAL, color: "#f87171", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
          { label: "HIGH",     count: counts.HIGH,     color: "#fb923c", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)" },
          { label: "MEDIUM",   count: counts.MEDIUM,   color: "#fbbf24", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
          { label: "LOW",      count: counts.LOW,      color: "#34d399", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
        ] as const).map(({ label, count, color, bg, border }) => (
          <div key={label} onClick={() => setFilter(filter === label ? "ALL" : label)}
            style={{ background: filter === label ? bg : "var(--bg-card)", border: `1px solid ${filter === label ? border : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "16px", cursor: "pointer", transition: "all 0.15s", textAlign: "center" }}>
            <p style={{ color: color, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</p>
            <p style={{ color: "#f1f5f9", fontSize: "28px", fontWeight: 800, marginTop: "6px", fontFamily: "monospace" }}>{count}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <Filter size={13} style={{ color: "#475569" }} />
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: "5px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
              border: "1px solid", cursor: "pointer", transition: "all 0.15s",
              background: filter === f ? "#3b82f6" : "transparent",
              borderColor: filter === f ? "#3b82f6" : "rgba(255,255,255,0.08)",
              color: filter === f ? "white" : "#475569",
            }}>
            {f}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <select className="input" value={sort} onChange={e => setSort(e.target.value as any)}
            style={{ height: "32px", fontSize: "12px", width: "150px" }}>
            <option value="desc">Highest Risk</option>
            <option value="asc">Lowest Risk</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px" }}>
        {filtered.map((coin: any) => {
          const score = coin.score ?? 50;
          const hasFraud = coin.pump_dump_detected || coin.wash_trading_detected;
          const chg = coin.price_change_24h ?? 0;
          return (
            <div key={coin.coin_id}
              onClick={() => router.push(`/coin/${coin.coin_id}`)}
              style={{
                background: "#131929", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "12px", padding: "16px",
                cursor: "pointer", transition: "all 0.2s", position: "relative",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.35)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {hasFraud && (
                <div style={{ position: "absolute", top: "8px", right: "8px" }}>
                  <AlertTriangle size={12} style={{ color: "#f87171" }} />
                </div>
              )}
              {coin.image_url && <img src={coin.image_url} alt="" style={{ width: "36px", height: "36px", borderRadius: "50%" }} />}
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "12px" }}>{coin.symbol?.toUpperCase()}</p>
                <p style={{ color: chg >= 0 ? "#34d399" : "#f87171", fontSize: "10px", marginTop: "2px", fontFamily: "monospace" }}>
                  {chg >= 0 ? "+" : ""}{chg.toFixed(2)}%
                </p>
              </div>
              <RiskGauge score={score} size={90} showLabel showLevel={false} />
              <p style={{ fontSize: "10px", fontWeight: 700, color: riskColor(score), letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
