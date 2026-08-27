"use client";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface Coin {
  coin_id: string;
  name: string;
  symbol: string;
  image_url?: string;
  price_usd?: number;
  price_change_24h?: number;
  market_cap?: number;
  volume_24h?: number;
  score?: number;
  recommendation?: string;
  pump_dump_detected?: boolean;
  wash_trading_detected?: boolean;
}

const riskColor = (s: number) =>
  s >= 80 ? "#f87171" : s >= 60 ? "#fb923c" : s >= 30 ? "#fbbf24" : "#34d399";

const riskLabel = (s: number) =>
  s >= 80 ? "CRITICAL" : s >= 60 ? "HIGH" : s >= 30 ? "MEDIUM" : "LOW";

const recColor = (r?: string) =>
  r === "BUY" ? "#34d399" : r === "SELL" ? "#f87171" : "#fbbf24";

export function CoinCard({ coin }: { coin: Coin }) {
  const router = useRouter();
  const score  = coin.score ?? 50;
  const chg    = coin.price_change_24h ?? 0;
  const isUp   = chg >= 0;
  const hasFraud = coin.pump_dump_detected || coin.wash_trading_detected;

  return (
    <div
      onClick={() => router.push(`/coin/${coin.coin_id}`)}
      style={{
        background: "#131929",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px",
        padding: "16px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(59,130,246,0.35)";
        el.style.transform    = "translateY(-2px)";
        el.style.boxShadow    = "0 8px 30px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(255,255,255,0.06)";
        el.style.transform    = "translateY(0)";
        el.style.boxShadow    = "none";
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: `linear-gradient(90deg, ${riskColor(score)}, transparent)`,
        opacity: 0.7,
      }} />

      {/* Fraud badge */}
      {hasFraud && (
        <div style={{
          position: "absolute", top: "10px", right: "10px",
          display: "flex", alignItems: "center", gap: "3px",
          padding: "2px 6px", borderRadius: "20px",
          background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
        }}>
          <AlertTriangle size={9} style={{ color: "#f87171" }} />
          <span style={{ color: "#f87171", fontSize: "9px", fontWeight: 700 }}>FRAUD</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
        {coin.image_url
          ? <img src={coin.image_url} alt={coin.symbol} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)" }} />
          : <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#60a5fa" }}>
              {coin.symbol?.slice(0,2).toUpperCase()}
            </div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {coin.name}
          </p>
          <p style={{ color: "#2d3748", fontSize: "10px", textTransform: "uppercase", fontWeight: 600 }}>
            {coin.symbol}
          </p>
        </div>
      </div>

      {/* Price */}
      <p style={{ color: "#f1f5f9", fontSize: "18px", fontWeight: 800, fontFamily: "monospace", lineHeight: 1 }}>
        ${coin.price_usd
          ? coin.price_usd >= 1
            ? coin.price_usd.toLocaleString("en-US", { maximumFractionDigits: 2 })
            : coin.price_usd.toFixed(6)
          : "—"}
      </p>

      {/* Change */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "3px",
          color: isUp ? "#34d399" : "#f87171",
          fontSize: "12px", fontWeight: 600, fontFamily: "monospace",
        }}>
          {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {isUp ? "+" : ""}{chg.toFixed(2)}%
        </div>
        <span style={{ color: "#2d3748", fontSize: "11px" }}>24h</span>
      </div>

      {/* Risk bar */}
      <div style={{ marginTop: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
          <span style={{ color: "#2d3748", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Risk</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: riskColor(score), fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em" }}>{riskLabel(score)}</span>
            <span style={{ color: "#475569", fontSize: "10px", fontFamily: "monospace" }}>{score.toFixed(0)}</span>
          </div>
        </div>
        <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px" }}>
          <div style={{
            width: `${score}%`, height: "100%", borderRadius: "2px",
            background: riskColor(score),
            boxShadow: `0 0 6px ${riskColor(score)}80`,
            transition: "width 0.6s ease",
          }} />
        </div>
      </div>

      {/* Signal */}
      {coin.recommendation && (
        <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
          <span style={{
            padding: "2px 8px", borderRadius: "20px",
            fontSize: "10px", fontWeight: 800, letterSpacing: "0.05em",
            color: recColor(coin.recommendation),
            background: `${recColor(coin.recommendation)}18`,
            border: `1px solid ${recColor(coin.recommendation)}30`,
          }}>
            {coin.recommendation}
          </span>
        </div>
      )}
    </div>
  );
}
