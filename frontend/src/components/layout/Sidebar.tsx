"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShieldAlert, TrendingUp, Bell,
  Briefcase, FileText, Settings, Zap, ChevronRight,
  Activity
} from "lucide-react";

const NAV = [
  { href: "/",              icon: LayoutDashboard, label: "Dashboard",     section: "main" },
  { href: "/risk-explorer", icon: ShieldAlert,     label: "Risk Explorer", section: "main" },
  { href: "/portfolio",     icon: Briefcase,       label: "Portfolio",     section: "main" },
  { href: "/alerts",        icon: Bell,            label: "Alerts",        section: "main" },
  { href: "/reports",       icon: FileText,        label: "AI Reports",    section: "tools" },
  { href: "/settings",      icon: Settings,        label: "Settings",      section: "tools" },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col h-full"
      style={{
        background: "linear-gradient(180deg, #0d1117 0%, #0a0b0f 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", boxShadow: "0 0 16px rgba(59,130,246,0.4)" }}
        >
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">CryptoRisk</p>
          <p style={{ color: "#475569", fontSize: "10px", marginTop: "2px" }}>AI Platform</p>
        </div>
      </div>

      {/* Live indicator */}
      <div className="px-4 mb-4">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}
        >
          <div className="live-dot" />
          <span style={{ color: "#34d399", fontSize: "11px", fontWeight: 600 }}>LIVE DATA</span>
          <Activity size={11} style={{ color: "#34d399", marginLeft: "auto" }} />
        </div>
      </div>

      {/* Nav — Main */}
      <nav className="flex-1 px-3 space-y-0.5">
        <p className="px-2 mb-2" style={{ color: "#2d3748", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          MAIN MENU
        </p>
        {NAV.filter(n => n.section === "main").map(({ href, icon: Icon, label }) => {
          const active = path === href;
          return (
            <Link key={href} href={href} className="nav-item" data-active={active}
              style={active ? {
                background: "rgba(59,130,246,0.12)",
                color: "#60a5fa",
                border: "1px solid rgba(59,130,246,0.2)",
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", borderRadius: "8px", textDecoration: "none",
                fontSize: "13px", fontWeight: 500
              } : {
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", borderRadius: "8px", textDecoration: "none",
                fontSize: "13px", fontWeight: 500, color: "#475569",
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span>{label}</span>
              {active && <ChevronRight size={12} style={{ marginLeft: "auto", opacity: 0.6 }} />}
            </Link>
          );
        })}

        <div className="divider my-3" />

        <p className="px-2 mb-2" style={{ color: "#2d3748", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          TOOLS
        </p>
        {NAV.filter(n => n.section === "tools").map(({ href, icon: Icon, label }) => {
          const active = path === href;
          return (
            <Link key={href} href={href} className="nav-item"
              style={active ? {
                background: "rgba(59,130,246,0.12)", color: "#60a5fa",
                border: "1px solid rgba(59,130,246,0.2)",
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", borderRadius: "8px", textDecoration: "none",
                fontSize: "13px", fontWeight: 500
              } : {
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", borderRadius: "8px", textDecoration: "none",
                fontSize: "13px", fontWeight: 500, color: "#475569",
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom info */}
      <div className="px-4 pb-5">
        <div className="divider mb-3" />
        <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ color: "#475569", fontSize: "11px" }}>ML Engine</p>
          <div className="flex items-center gap-2 mt-1">
            <div style={{ flex: 1, height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px" }}>
              <div style={{ width: "72%", height: "100%", background: "linear-gradient(90deg,#3b82f6,#06b6d4)", borderRadius: "2px" }} />
            </div>
            <span style={{ color: "#94a3b8", fontSize: "10px", fontFamily: "monospace" }}>72%</span>
          </div>
          <p style={{ color: "#2d3748", fontSize: "10px", marginTop: "4px" }}>v1.0 · RF + IsoForest</p>
        </div>
      </div>
    </aside>
  );
}
