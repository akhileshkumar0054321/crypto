"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  Bell,
  Briefcase,
  FileText,
  Sliders,
  Zap,
  ChevronRight,
  Activity,
  ShieldCheck,
  Newspaper,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { useLiveMarket } from "@/lib/context/LiveMarketContext";

const NAV = [
  { href: "/",              icon: LayoutDashboard, label: "Market Risk Radar",        section: "main" },
  { href: "/news",          icon: Newspaper,       label: "News & AI Impacts",        section: "main" },
  { href: "/risk-explorer", icon: ShieldAlert,     label: "Token Forensics & Moats",  section: "main" },
  { href: "/portfolio",     icon: Briefcase,       label: "Portfolio Risk Exposure",  section: "main" },
  { href: "/alerts",        icon: Bell,            label: "Threat Wire & Alerts",     section: "main" },
  { href: "/reports",       icon: FileText,        label: "Institutional Reports",    section: "tools" },
  { href: "/settings",      icon: Sliders,         label: "Security & Parameters",    section: "tools" },
  { href: "/pricing",       icon: CreditCard,      label: "Pricing & Enclave Plans",  section: "tools", badge: "PRO" },
];

export function Sidebar() {
  const path = usePathname();
  const { isLive, globalStats } = useLiveMarket();

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col h-full select-none"
      style={{
        background: "linear-gradient(180deg, #0d1117 0%, #0a0b0f 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
            boxShadow: "0 0 16px rgba(59,130,246,0.4)",
          }}
        >
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <p className="text-white font-extrabold text-sm leading-none tracking-tight">CryptoRisk AI</p>
          <p className="text-slate-500 text-[10px] font-semibold mt-1 uppercase tracking-wider">
            Institutional Forensics
          </p>
        </div>
      </div>

      {/* Live Indicator Bar */}
      <div className="px-4 mb-4">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
            isLive
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-slate-800/60 border-slate-700/60 text-slate-400"
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`} />
          <span className="text-[11px] font-bold tracking-wider">
            {isLive ? "REAL-TIME STREAMING" : "STREAM PAUSED"}
          </span>
          <Activity size={12} className="ml-auto" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="px-2 mb-1.5 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
          CORE SURVEILLANCE
        </p>
        {NAV.filter((n) => n.section === "main").map(({ href, icon: Icon, label }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                active
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/25 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              }`}
            >
              <Icon size={15} className="flex-shrink-0" />
              <span>{label}</span>
              {active && <ChevronRight size={12} className="ml-auto opacity-60" />}
            </Link>
          );
        })}

        <div className="my-3 border-t border-white/5" />

        <p className="px-2 mb-1.5 text-slate-500 text-[10px] font-bold tracking-wider uppercase">
          QUANTITATIVE ENGINES
        </p>
        {NAV.filter((n) => n.section === "tools").map((item) => {
          const { href, icon: Icon, label, badge } = item as any;
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                active
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/25 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              }`}
            >
              <Icon size={15} className="flex-shrink-0" />
              <span>{label}</span>
              {badge && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-extrabold shadow-sm">
                  {badge}
                </span>
              )}
              {active && <ChevronRight size={12} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Info Node */}
      <div className="px-4 pb-5">
        <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300">Forensic Node Health</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">{globalStats.latencyMs}ms</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-blue-500" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            <span>Enclave v2.4</span>
            <span className="text-slate-400">{globalStats.activeNodes} Nodes Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
