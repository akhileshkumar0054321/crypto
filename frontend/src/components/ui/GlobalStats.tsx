"use client";
import { useQuery } from "@tanstack/react-query";
import { coinApi } from "@/lib/api";
import { TrendingUp, TrendingDown, Globe, BarChart2 } from "lucide-react";

export function GlobalStats() {
  const { data: global } = useQuery({
    queryKey: ["global"],
    queryFn: () => coinApi.getGlobal().then(r => r.data).catch(() => null),
    refetchInterval: 60_000,
  });

  if (!global) return null;

  const mcap    = global.total_market_cap?.usd ?? 0;
  const vol     = global.total_volume?.usd ?? 0;
  const btcDom  = global.market_cap_percentage?.btc ?? 0;
  const ethDom  = global.market_cap_percentage?.eth ?? 0;
  const mcapChg = global.market_cap_change_percentage_24h_usd ?? 0;
  const isUp    = mcapChg >= 0;

  const stats = [
    {
      label: "Market Cap",
      value: `$${(mcap / 1e12).toFixed(2)}T`,
      sub: `${isUp ? "+" : ""}${mcapChg.toFixed(2)}%`,
      subUp: isUp,
      icon: Globe,
      color: "#3b82f6",
    },
    {
      label: "24h Volume",
      value: `$${(vol / 1e9).toFixed(1)}B`,
      sub: null,
      icon: BarChart2,
      color: "#8b5cf6",
    },
    {
      label: "BTC Dominance",
      value: `${btcDom.toFixed(1)}%`,
      sub: null,
      icon: null,
      color: "#f59e0b",
      barPct: btcDom,
      barColor: "#f59e0b",
    },
    {
      label: "ETH Dominance",
      value: `${ethDom.toFixed(1)}%`,
      sub: null,
      icon: null,
      color: "#6366f1",
      barPct: ethDom,
      barColor: "#6366f1",
    },
  ];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0",
      background: "#0f1117",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      padding: "0 24px",
      height: "36px",
      overflow: "hidden",
    }}>
      {stats.map(({ label, value, sub, subUp, icon: Icon, color, barPct, barColor }, i) => (
        <div key={label} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "0 16px",
          borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
        }}>
          {Icon && <Icon size={11} style={{ color, flexShrink: 0 }} />}
          <span style={{ color: "#2d3748", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
            {label}
          </span>
          <span style={{ color: "#94a3b8", fontSize: "11px", fontFamily: "monospace", fontWeight: 600 }}>
            {value}
          </span>
          {sub && (
            <span style={{ fontSize: "10px", fontWeight: 600, color: subUp ? "#34d399" : "#f87171", display: "flex", alignItems: "center", gap: "2px" }}>
              {subUp ? <TrendingUp size={8} /> : <TrendingDown size={8} />}{sub}
            </span>
          )}
          {barPct !== undefined && (
            <div style={{ width: "40px", height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px" }}>
              <div style={{ width: `${barPct}%`, height: "100%", borderRadius: "2px", background: barColor ?? color }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
