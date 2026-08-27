"use client";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown } from "lucide-react";

interface LeaderboardEntry {
  coin_id: string;
  score: number;
  recommendation?: string;
  risk_level?: string;
}

const riskColor = (s: number) =>
  s >= 80 ? "#f87171" : s >= 60 ? "#fb923c" : s >= 30 ? "#fbbf24" : "#34d399";

const riskBg = (s: number) =>
  s >= 80 ? "rgba(239,68,68,0.08)" : s >= 60 ? "rgba(249,115,22,0.08)" : s >= 30 ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)";

export function RiskLeaderboard({ entries = [] }: { entries: LeaderboardEntry[] }) {
  const router = useRouter();

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 20px", color: "#2d3748" }}>
        <p style={{ fontSize: "13px" }}>No risk data yet</p>
        <p style={{ fontSize: "12px", marginTop: "4px" }}>Trigger analysis to populate</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {entries.map((entry, idx) => {
        const score = entry.score ?? 0;
        return (
          <div
            key={entry.coin_id}
            onClick={() => router.push(`/coin/${entry.coin_id}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
          >
            {/* Rank */}
            <span style={{
              width: "20px", flexShrink: 0, textAlign: "center",
              fontSize: "11px", fontWeight: 700,
              color: idx === 0 ? "#f59e0b" : idx === 1 ? "#94a3b8" : idx === 2 ? "#b45309" : "#2d3748",
            }}>
              {idx + 1}
            </span>

            {/* Risk indicator dot */}
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
              background: riskColor(score),
              boxShadow: `0 0 6px ${riskColor(score)}80`,
            }} />

            {/* Coin name */}
            <span style={{
              flex: 1, color: "#94a3b8", fontSize: "13px", fontWeight: 500,
              textTransform: "capitalize", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {entry.coin_id}
            </span>

            {/* Progress bar */}
            <div style={{ width: "70px", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", flexShrink: 0 }}>
              <div style={{
                width: `${score}%`, height: "100%", borderRadius: "2px",
                background: riskColor(score), transition: "width 0.5s ease",
              }} />
            </div>

            {/* Score */}
            <span style={{
              fontSize: "12px", fontWeight: 700, fontFamily: "monospace",
              color: riskColor(score), width: "28px", textAlign: "right", flexShrink: 0,
            }}>
              {Math.round(score)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
