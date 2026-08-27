"use client";
import { useQuery } from "@tanstack/react-query";
import { coinApi } from "@/lib/api";
import { Search, Bell, User, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [search, setSearch] = useState("");

  const { data: global } = useQuery({
    queryKey: ["global"],
    queryFn: () => coinApi.getGlobal().then(r => r.data).catch(() => null),
    refetchInterval: 60_000,
  });

  const mcapChange = global?.market_cap_change_percentage_24h_usd ?? 0;
  const isUp = mcapChange >= 0;

  return (
    <header style={{
      height: "56px", flexShrink: 0,
      display: "flex", alignItems: "center",
      padding: "0 24px", gap: "16px",
      background: "#0d1117",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      {/* Global market cap */}
      {global && (
        <div className="hidden md:flex items-center gap-3 mr-2">
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>MCap</span>
            <span style={{ color: "#94a3b8", fontSize: "12px", fontFamily: "monospace" }}>
              ${((global.total_market_cap?.usd || 0) / 1e12).toFixed(2)}T
            </span>
            <span className={isUp ? "positive" : "negative"} style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "2px" }}>
              {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(mcapChange).toFixed(2)}%
            </span>
          </div>
          <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>BTC Dom</span>
            <span style={{ color: "#94a3b8", fontSize: "12px", fontFamily: "monospace" }}>
              {(global.market_cap_percentage?.btc || 0).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ flex: 1, maxWidth: "400px", position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
        <input
          className="input"
          placeholder="Search coins…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: "32px", height: "34px", fontSize: "13px" }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button className="btn-ghost" style={{ position: "relative", padding: "7px" }}>
          <Bell size={16} />
          <span style={{
            position: "absolute", top: "5px", right: "5px",
            width: "6px", height: "6px", borderRadius: "50%",
            background: "#ef4444", boxShadow: "0 0 6px rgba(239,68,68,0.6)"
          }} />
        </button>

        <Link href="/login">
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "5px 12px 5px 8px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px", cursor: "pointer",
            transition: "all 0.15s ease",
          }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "6px",
              background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <User size={12} className="text-white" />
            </div>
            <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 500 }}>Sign In</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
