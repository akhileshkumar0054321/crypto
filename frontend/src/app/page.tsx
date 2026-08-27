"use client";
import { useQuery } from "@tanstack/react-query";
import { coinApi, riskApi } from "@/lib/api";
import { RiskGauge } from "@/components/ui/RiskGauge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, ShieldAlert, Activity, AlertTriangle, BarChart2, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const riskBadge = (score: number) => {
  if (score >= 80) return { label: "CRITICAL", cls: "badge-critical" };
  if (score >= 60) return { label: "HIGH",     cls: "badge-high" };
  if (score >= 30) return { label: "MEDIUM",   cls: "badge-medium" };
  return           { label: "LOW",      cls: "badge-low" };
};

const recColor = (r?: string) =>
  r === "BUY" ? "#34d399" : r === "SELL" ? "#f87171" : "#fbbf24";

export default function DashboardPage() {
  const router = useRouter();

  const { data: coins = [], isLoading: coinsLoading } = useQuery({
    queryKey: ["coins"],
    queryFn: () => coinApi.getAll().then(r => r.data),
    refetchInterval: 30_000,
  });

  const { data: global } = useQuery({
    queryKey: ["global"],
    queryFn: () => coinApi.getGlobal().then(r => r.data).catch(() => null),
    refetchInterval: 60_000,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["risk-leaderboard"],
    queryFn: () => riskApi.getLeaderboard().then(r => r.data).catch(() => []),
    refetchInterval: 30_000,
  });

  const { data: trending = [] } = useQuery({
    queryKey: ["trending"],
    queryFn: () => coinApi.getTrending().then(r => r.data).catch(() => []),
  });

  const topRisk = leaderboard.slice(0, 5);
  const mcapChange = global?.market_cap_change_percentage_24h_usd ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Hero Stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Market Cap",
            value: global?.total_market_cap?.usd ? `$${(global.total_market_cap.usd/1e12).toFixed(2)}T` : "—",
            change: mcapChange,
            icon: Globe,
            color: "#3b82f6",
          },
          {
            label: "24h Volume",
            value: global?.total_volume?.usd ? `$${(global.total_volume.usd/1e9).toFixed(1)}B` : "—",
            change: null,
            icon: BarChart2,
            color: "#8b5cf6",
          },
          {
            label: "Coins Tracked",
            value: coins.length || "—",
            change: null,
            icon: Activity,
            color: "#06b6d4",
          },
          {
            label: "High Risk Alerts",
            value: leaderboard.filter((c: any) => (c.score ?? 0) >= 70).length || 0,
            change: null,
            icon: AlertTriangle,
            color: "#ef4444",
          },
        ].map(({ label, value, change, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
                <p style={{ color: "#f1f5f9", fontSize: "24px", fontWeight: 800, marginTop: "8px", fontFamily: "monospace", lineHeight: 1 }}>
                  {value}
                </p>
                {change !== null && (
                  <p className={change >= 0 ? "positive" : "negative"}
                    style={{ fontSize: "12px", marginTop: "6px", display: "flex", alignItems: "center", gap: "3px" }}>
                    {change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {Math.abs(change).toFixed(2)}% (24h)
                  </p>
                )}
              </div>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${color}25`,
              }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-5">

        {/* Coin Table — col 8 */}
        <div className="col-span-12 lg:col-span-8 card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p className="section-title">Live Market</p>
            <Link href="/risk-explorer" style={{ color: "#3b82f6", fontSize: "12px", fontWeight: 500, textDecoration: "none" }}>
              View All →
            </Link>
          </div>

          {coinsLoading ? (
            <div className="p-5 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: "44px" }} />)}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Asset</th><th>Price</th><th>24h</th><th>Market Cap</th><th>Risk</th><th>Signal</th>
                </tr>
              </thead>
              <tbody>
                {coins.slice(0, 12).map((coin: any, idx: number) => {
                  const risk = leaderboard.find((r: any) => r.coin_id === coin.coin_id);
                  const chg = coin.price_change_24h ?? 0;
                  const isUp = chg >= 0;
                  const badge = riskBadge(risk?.score ?? 50);
                  return (
                    <tr key={coin.coin_id} style={{ cursor: "pointer" }}
                      onClick={() => router.push(`/coin/${coin.coin_id}`)}>
                      <td style={{ color: "#2d3748", width: "40px" }}>{idx + 1}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {coin.image_url && <img src={coin.image_url} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%" }} />}
                          <div>
                            <p style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "13px" }}>{coin.name}</p>
                            <p style={{ color: "#475569", fontSize: "11px", textTransform: "uppercase" }}>{coin.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="num">
                        ${coin.price_usd >= 1 ? coin.price_usd.toLocaleString("en-US", { maximumFractionDigits: 2 }) : coin.price_usd?.toFixed(6)}
                      </td>
                      <td className={`num ${isUp ? "positive" : "negative"}`} style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {Math.abs(chg).toFixed(2)}%
                      </td>
                      <td className="num" style={{ color: "#94a3b8" }}>
                        {coin.market_cap ? `$${(coin.market_cap/1e9).toFixed(1)}B` : "—"}
                      </td>
                      <td><span className={badge.cls}>{badge.label}</span></td>
                      <td>
                        {risk?.recommendation ? (
                          <span style={{ fontWeight: 700, fontSize: "12px", color: recColor(risk.recommendation) }}>
                            {risk.recommendation}
                          </span>
                        ) : <span style={{ color: "#2d3748" }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column — col 4 */}
        <div className="col-span-12 lg:col-span-4 space-y-4">

          {/* Risk Leaderboard */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p className="section-title">Risk Radar</p>
              <ShieldAlert size={14} style={{ color: "#ef4444" }} />
            </div>
            <div style={{ padding: "8px 0" }}>
              {topRisk.length === 0 ? (
                <p style={{ color: "#475569", fontSize: "13px", textAlign: "center", padding: "20px" }}>
                  No risk data — trigger analysis
                </p>
              ) : topRisk.map((r: any, i: number) => {
                const badge = riskBadge(r.score ?? 0);
                return (
                  <div key={r.coin_id}
                    onClick={() => router.push(`/coin/${r.coin_id}`)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "10px 18px", cursor: "pointer", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ color: "#2d3748", fontSize: "11px", width: "14px", flexShrink: 0 }}>{i+1}</span>
                    <span style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 500, flex: 1, textTransform: "capitalize" }}>{r.coin_id}</span>
                    <div style={{ width: "60px", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px" }}>
                      <div style={{
                        width: `${r.score}%`, height: "100%", borderRadius: "2px",
                        background: r.score >= 80 ? "#ef4444" : r.score >= 60 ? "#f97316" : r.score >= 30 ? "#f59e0b" : "#10b981",
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                    <span className={badge.cls}>{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trending */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="section-title">Trending</p>
            </div>
            <div style={{ padding: "8px 0" }}>
              {(trending.slice ? trending.slice(0, 6) : []).map((t: any, i: number) => (
                <div key={t.id}
                  onClick={() => router.push(`/coin/${t.id}`)}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 18px", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ color: "#2d3748", fontSize: "11px", width: "14px" }}>{i+1}</span>
                  <span style={{ color: "#94a3b8", fontSize: "13px", flex: 1 }}>{t.name || t.id}</span>
                  <span style={{ color: "#2d3748", fontSize: "11px", fontFamily: "monospace" }}>
                    {t.score_change_percentage_24h !== undefined ? `${t.score_change_percentage_24h?.toFixed(1)}%` : ""}
                  </span>
                </div>
              ))}
              {trending.length === 0 && (
                <p style={{ color: "#475569", fontSize: "13px", textAlign: "center", padding: "20px" }}>Loading trending…</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
