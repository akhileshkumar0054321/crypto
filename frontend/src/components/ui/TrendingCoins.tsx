"use client";
import { useQuery } from "@tanstack/react-query";
import { coinApi } from "@/lib/api";
import { TrendingUp, Flame } from "lucide-react";
import { useRouter } from "next/navigation";

export function TrendingCoins() {
  const router = useRouter();
  const { data: trending = [] } = useQuery({
    queryKey: ["trending"],
    queryFn: () => coinApi.getTrending().then(r => r.data).catch(() => []),
    refetchInterval: 300_000,
  });

  const list = Array.isArray(trending) ? trending.slice(0, 7) : [];

  return (
    <div>
      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px", color: "#2d3748", fontSize: "13px" }}>
          Loading trending coins…
        </div>
      ) : list.map((coin: any, i: number) => {
        const name = coin.name || coin.id || coin.coin_id || "—";
        const change = coin.score_change_percentage_24h ?? coin.price_change_percentage_24h ?? null;
        const isUp = change === null ? null : change >= 0;
        return (
          <div key={coin.id || i}
            onClick={() => router.push(`/coin/${coin.id || coin.coin_id}`)}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 16px", cursor: "pointer", transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
          >
            <span style={{
              width: "18px", flexShrink: 0, fontSize: "11px", fontWeight: 700,
              color: i < 3 ? "#f59e0b" : "#2d3748", textAlign: "center",
            }}>
              {i + 1}
            </span>

            {i < 3 && <Flame size={10} style={{ color: "#f97316", flexShrink: 0 }} />}

            {coin.thumb && (
              <img src={coin.thumb} alt={name} style={{ width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0 }} />
            )}

            <span style={{ color: "#94a3b8", fontSize: "13px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {name}
            </span>

            {change !== null && isUp !== null && (
              <span style={{
                fontSize: "11px", fontWeight: 600, fontFamily: "monospace",
                color: isUp ? "#34d399" : "#f87171",
                display: "flex", alignItems: "center", gap: "2px",
              }}>
                {isUp ? <TrendingUp size={9} /> : null}
                {isUp ? "+" : ""}{change.toFixed(1)}%
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
