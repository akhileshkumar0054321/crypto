"use client";

import { useQuery } from "@tanstack/react-query";
import { coinApi } from "@/lib/api";
import { useLiveMarket } from "@/lib/context/LiveMarketContext";
import { useUserPlan } from "@/lib/context/UserPlanContext";
import {
  Search,
  ChevronDown,
  Star,
  Briefcase,
  Bell,
  User,
  Sparkles,
  LayoutDashboard,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Newspaper,
  ShieldCheck,
  CreditCard,
  Sliders,
  Menu,
  X,
  BookOpen,
  Mail,
  CheckCircle2,
  FileText,
  Flame,
  Calendar as CalendarIcon,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { CalendarModal } from "@/components/calendar/CalendarModal";
import { CryptoAvatar } from "@/components/ui/CryptoAvatar";

export function Navbar() {
  const router = useRouter();
  const path = usePathname();
  const [search, setSearch] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [learnModalOpen, setLearnModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [addPortfolioModalOpen, setAddPortfolioModalOpen] = useState(false);
  const [importType, setImportType] = useState<"api" | "wallet">("wallet");
  const [importCredential, setImportCredential] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const { isLive } = useLiveMarket();
  const { currentPlan } = useUserPlan();

  useEffect(() => {
    const handleOpenAddPortfolio = () => setAddPortfolioModalOpen(true);
    window.addEventListener("open-add-portfolio-modal", handleOpenAddPortfolio);
    return () => window.removeEventListener("open-add-portfolio-modal", handleOpenAddPortfolio);
  }, []);

  const { data: coins = [] } = useQuery({
    queryKey: ["all-coins-nav"],
    queryFn: () => coinApi.getAll().then((r) => r.data).catch(() => []),
  });

  const filteredCoins = (coins || [])
    .filter((c: any) => {
      if (!search.trim()) return false;
      const q = search.toLowerCase().trim();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.symbol?.toLowerCase().includes(q) ||
        c.coin_id?.toLowerCase().includes(q)
      );
    })
    .slice(0, 6);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    const target = search.trim().toLowerCase();
    setSearchModalOpen(false);
    setSearch("");
    router.push(`/coin/${target}`);
  };

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchModalOpen(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchModalOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchModalOpen]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header
        ref={navRef}
        id="main-navbar"
        className="h-14 w-full flex-shrink-0 flex items-center px-4 sm:px-6 lg:px-8 bg-[#080b11] border-b border-slate-800/80 relative z-40 justify-between select-none text-[13px]"
      >
        {/* Left Side: Brand Logo & Main Navigation Links */}
        <div className="flex items-center gap-5 lg:gap-6 xl:gap-7 flex-1 min-w-0">
          {/* cryptoVision Brand Logo matching screenshot */}
          <Link
            href="/"
            className="flex items-baseline group cursor-pointer flex-shrink-0 select-none mr-1"
            title="cryptoVision"
          >
            <span className="text-[17px] font-normal text-white tracking-tight">
              crypto
            </span>
            <span className="text-[19px] font-bold text-white font-serif tracking-normal ml-[1px] group-hover:text-blue-400 transition-colors">
              Vision
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-[13px] text-slate-300 font-normal whitespace-nowrap">
            {/* Home */}
            <Link
              href="/"
              className={`transition-colors hover:text-white ${
                path === "/" ? "text-white font-medium" : ""
              }`}
            >
              Home
            </Link>

            {/* Crypto Radar */}
            <Link
              href="/radar"
              className={`transition-colors hover:text-white flex items-center gap-1.5 ${
                path === "/radar" ? "text-white font-medium" : ""
              }`}
            >
              <Radio size={13} className="text-emerald-400 animate-pulse" />
              <span>Crypto Radar</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-mono px-1 py-0.2 rounded font-bold">LIVE</span>
            </Link>

            {/* Markets ˅ */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === "markets" ? null : "markets")
                }
                className={`flex items-center gap-1 transition-colors hover:text-white cursor-pointer ${
                  activeDropdown === "markets" ? "text-white font-medium" : ""
                }`}
              >
                <span>Markets</span>
                <ChevronDown size={12} className="text-slate-400 stroke-[2] translate-y-[0.5px]" />
              </button>

              {activeDropdown === "markets" && (
                <div className="absolute top-8 left-0 w-60 bg-[#0d121c] border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                  <Link
                    href="/trending-small-caps"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center justify-between p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 hover:bg-indigo-900/50 transition text-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-400" />
                      <span className="font-semibold">Small Cap Coins</span>
                    </div>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">HOT</span>
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 transition text-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <LayoutDashboard size={14} className="text-blue-400" />
                      <span>Market Risk Radar</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">LIVE</span>
                  </Link>
                  <Link
                    href="/?filter=gainers"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/80 transition text-slate-200 text-xs"
                  >
                    <TrendingUp size={14} className="text-emerald-400" />
                    <span>Top Gainers (24h)</span>
                  </Link>
                  <Link
                    href="/?filter=losers"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/80 transition text-slate-200 text-xs"
                  >
                    <TrendingDown size={14} className="text-rose-400" />
                    <span>Top Losers (24h)</span>
                  </Link>
                </div>
              )}
            </div>

            {/* News ˅ */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === "news" ? null : "news")
                }
                className={`flex items-center gap-1 transition-colors hover:text-white cursor-pointer ${
                  activeDropdown === "news" || path === "/news"
                    ? "text-white font-medium"
                    : ""
                }`}
              >
                <span>News</span>
                <ChevronDown size={12} className="text-slate-400 stroke-[2] translate-y-[0.5px]" />
              </button>

              {activeDropdown === "news" && (
                <div className="absolute top-8 left-0 w-64 bg-[#0d121c] border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                  <Link
                    href="/news"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 transition text-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Newspaper size={14} className="text-blue-400" />
                      <span>Breaking Threat Wire</span>
                    </div>
                    <span className="text-[10px] text-blue-400 font-mono font-bold">&lt;1s</span>
                  </Link>
                  <Link
                    href="/news"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/80 transition text-slate-200 text-xs"
                  >
                    <Sparkles size={14} className="text-indigo-400" />
                    <span>AI Sentiment & Catalysts</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Portfolio ˅ */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === "portfolio_nav" ? null : "portfolio_nav")
                }
                className={`flex items-center gap-1 transition-colors hover:text-white cursor-pointer ${
                  activeDropdown === "portfolio_nav" || path === "/portfolio"
                    ? "text-white font-medium"
                    : ""
                }`}
              >
                <span>Portfolio</span>
                <ChevronDown size={12} className="text-slate-400 stroke-[2] translate-y-[0.5px]" />
              </button>

              {activeDropdown === "portfolio_nav" && (
                <div className="absolute top-8 left-0 w-56 bg-[#0d121c] border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                  <Link
                    href="/portfolio"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/80 transition text-slate-200 text-xs"
                  >
                    <Briefcase size={14} className="text-blue-400" />
                    <span>View Portfolio Dashboard</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDropdown(null);
                      setAddPortfolioModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-300 hover:text-white transition text-xs cursor-pointer font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-blue-400" />
                      <span>Add Portfolio</span>
                    </div>
                    <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded font-mono">API / Link</span>
                  </button>
                </div>
              )}
            </div>

            {/* Intelligence */}
            <Link
              href="/risk-explorer"
              className={`transition-colors hover:text-white ${
                path === "/risk-explorer" ? "text-white font-medium" : ""
              }`}
            >
              Intelligence
            </Link>

            {/* DeFi */}
            <Link
              href="/defi"
              className={`transition-colors hover:text-white flex items-center gap-1 ${
                path === "/defi" ? "text-white font-medium" : ""
              }`}
            >
              <span>DeFi</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1 py-0.2 rounded font-bold">LIVE</span>
            </Link>

            {/* About */}
            <Link
              href="/learn"
              className={`transition-colors hover:text-white ${
                path === "/learn" || path === "/about" ? "text-white font-medium" : ""
              }`}
            >
              About
            </Link>

            {/* Tools ˅ */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === "tools" ? null : "tools")
                }
                className={`flex items-center gap-1 transition-colors hover:text-white cursor-pointer ${
                  activeDropdown === "tools" ? "text-white font-medium" : ""
                }`}
              >
                <span>Tools</span>
                <ChevronDown size={12} className="text-slate-400 stroke-[2] translate-y-[0.5px]" />
              </button>

              {activeDropdown === "tools" && (
                <div className="absolute top-8 left-0 w-64 bg-[#0d121c] border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                  <Link
                    href="/news?tab=finbert"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center justify-between p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 hover:bg-indigo-900/50 transition text-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-cyan-400" />
                      <span className="font-semibold">ModernFinBERT NLP Studio</span>
                    </div>
                    <span className="text-[9px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded font-mono font-bold">NEW</span>
                  </Link>
                  <Link
                    href="/alerts"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 transition text-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Bell size={14} className="text-amber-400" />
                      <span>Live Threat Wire Alerts</span>
                    </div>
                  </Link>
                  <Link
                    href="/portfolio"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/80 transition text-slate-200 text-xs"
                  >
                    <Briefcase size={14} className="text-cyan-400" />
                    <span>Portfolio VaR Simulator</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/80 transition text-slate-200 text-xs"
                  >
                    <Sliders size={14} className="text-slate-400" />
                    <span>Enclave Node Configuration</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDropdown(null);
                      const btn = document.getElementById("open-app-assistant-btn");
                      if (btn) btn.click();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-600/20 text-blue-300 hover:text-white transition text-xs cursor-pointer border-t border-slate-800/80 mt-1"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-cyan-400" />
                      <span>App Guide & AI Copilot</span>
                    </div>
                    <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">HELP</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pricing */}
            <Link
              href="/pricing"
              className={`transition-colors hover:text-white ${
                path === "/pricing" ? "text-white font-medium" : ""
              }`}
            >
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right Side Controls: Star, Briefcase, Bell, Dashboard Button, Separator, Search ⌘K */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {/* Watchlist Star Icon */}
          <Link
            href="/portfolio"
            title="Watchlist & Tracked Cryptos"
            className="p-1 text-slate-300 hover:text-amber-400 transition cursor-pointer"
          >
            <Star size={16} className="stroke-[1.75]" />
          </Link>

          {/* Portfolio Briefcase Icon */}
          <Link
            href="/portfolio"
            title="Portfolio & Value-at-Risk"
            className="p-1 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <Briefcase size={16} className="stroke-[1.75]" />
          </Link>

          {/* Threat Alerts Bell Icon */}
          <Link
            href="/alerts"
            title="Threat Wire & Security Notifications"
            className="p-1 text-slate-300 hover:text-white transition relative cursor-pointer"
          >
            <Bell size={16} className="stroke-[1.75]" />
          </Link>

          {/* Primary Blue Dashboard Button (exact match from screenshot) */}
          <Link
            href="/"
            id="header-dashboard-button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium text-[13px] shadow-sm transition whitespace-nowrap ml-0.5 cursor-pointer active:scale-95"
          >
            <User size={14} className="stroke-[2.2]" />
            <span>Dashboard</span>
          </Link>

          {/* Vertical subtle divider */}
          <div className="w-[1px] h-4 bg-slate-700/80 mx-0.5 hidden sm:block" />

          {/* Search Trigger Button with ⌘K (exact match from screenshot) */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2 p-1 text-slate-300 hover:text-white transition cursor-pointer"
            title="Search Cryptocurrencies & Contracts (⌘K)"
          >
            <Search size={15} className="text-slate-300 stroke-[1.75]" />
            <span className="hidden sm:inline font-mono text-[10px] text-slate-400 bg-[#161c28] px-1.5 py-0.5 rounded border border-slate-700/80">
              ⌘K
            </span>
          </button>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 ml-1 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* ── Mobile Navigation Drawer ────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0d14] border-b border-slate-800 p-4 space-y-3 z-50 animate-fade-in">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              {isLive ? "Live Surveillance" : "Offline"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-900/80 text-slate-200 font-semibold flex items-center gap-2 hover:bg-slate-800"
            >
              <LayoutDashboard size={14} className="text-blue-400" />
              <span>Home & Markets</span>
            </Link>

            <Link
              href="/radar"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-200 font-semibold flex items-center justify-between hover:bg-blue-900/50"
            >
              <div className="flex items-center gap-2">
                <Radio size={14} className="text-emerald-400 animate-pulse" />
                <span>Crypto Radar</span>
              </div>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">LIVE</span>
            </Link>

            <Link
              href="/news"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-900/80 text-slate-200 font-semibold flex items-center gap-2 hover:bg-slate-800"
            >
              <Newspaper size={14} className="text-indigo-400" />
              <span>Breaking News</span>
            </Link>

            <Link
              href="/trending-small-caps"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 font-semibold flex items-center gap-2 hover:bg-indigo-900/50"
            >
              <Flame size={14} className="text-amber-400" />
              <span>DEX Small-Caps</span>
            </Link>

            <Link
              href="/news?tab=finbert"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-900/80 text-slate-200 font-semibold flex items-center gap-2 hover:bg-slate-800"
            >
              <Sparkles size={14} className="text-cyan-400" />
              <span>FinBERT NLP</span>
            </Link>

            <Link
              href="/risk-explorer"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-900/80 text-slate-200 font-semibold flex items-center gap-2 hover:bg-slate-800"
            >
              <ShieldAlert size={14} className="text-rose-400" />
              <span>Intelligence</span>
            </Link>

            <Link
              href="/defi"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center justify-between hover:bg-emerald-900/50"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-emerald-400" />
                <span>DeFi Analytics Hub</span>
              </div>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">LIVE</span>
            </Link>

            <Link
              href="/learn"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-900/80 text-slate-200 font-semibold flex items-center gap-2 hover:bg-slate-800"
            >
              <BookOpen size={14} className="text-blue-400" />
              <span>About & Mission</span>
            </Link>

            <Link
              href="/portfolio"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-900/80 text-slate-200 font-semibold flex items-center gap-2 hover:bg-slate-800"
            >
              <Briefcase size={14} className="text-cyan-400" />
              <span>Portfolio & Simulator</span>
            </Link>

            <Link
              href="/reports"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-900/80 text-slate-200 font-semibold flex items-center gap-2 hover:bg-slate-800"
            >
              <FileText size={14} className="text-purple-400" />
              <span>Opinion</span>
            </Link>

            <Link
              href="/alerts"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-900/80 text-slate-200 font-semibold flex items-center gap-2 hover:bg-slate-800"
            >
              <Bell size={14} className="text-amber-400" />
              <span>Threat Alerts</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                const btn = document.getElementById("open-app-assistant-btn");
                if (btn) btn.click();
              }}
              className="p-2.5 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 font-bold flex items-center justify-center gap-2 col-span-2 hover:bg-indigo-600/40 cursor-pointer"
            >
              <Sparkles size={14} className="text-cyan-300" />
              <span>App Guide & AI Copilot</span>
            </button>

            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-blue-600 text-white font-bold flex items-center gap-2 col-span-2 justify-center"
            >
              <CreditCard size={14} />
              <span>Pricing & Plans</span>
            </Link>
          </div>
        </div>
      )}

      {/* ── Spotlight / ⌘K Search Modal ────────────────────────────────────── */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e131e] border border-blue-500/30 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="relative p-4 border-b border-slate-800">
              <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search coin name, ticker (e.g. BTC, ETH, SOL, PEPE) or contract..."
                className="w-full pl-10 pr-20 py-2.5 bg-slate-900 text-sm text-white rounded-xl border border-slate-700/80 focus:border-blue-500 focus:outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700 cursor-pointer"
              >
                ESC
              </button>
            </form>

            {/* Results list */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredCoins.length > 0 ? (
                filteredCoins.map((c: any) => (
                  <div
                    key={c.coin_id}
                    onClick={() => {
                      setSearchModalOpen(false);
                      setSearch("");
                      router.push(`/coin/${c.coin_id}`);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 cursor-pointer transition border border-transparent hover:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <CryptoAvatar
                        coinId={c.coin_id}
                        symbol={c.symbol}
                        name={c.name}
                        imageUrl={c.image_url}
                        size="md"
                        className="w-6 h-6"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white text-xs font-bold">{c.name}</span>
                          <span className="text-slate-400 text-[10px] font-mono uppercase bg-slate-800 px-1.5 py-0.2 rounded">
                            {c.symbol}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Rank #{c.market_cap_rank || "—"} · Risk Score: {c.risk_score || "Audit Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-white block">
                        ${c.price_usd >= 1 ? c.price_usd.toLocaleString() : c.price_usd?.toFixed(6)}
                      </span>
                      <span className={`text-[10px] font-bold font-mono ${(c.change_24h || 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {(c.change_24h || 0) >= 0 ? "+" : ""}{(c.change_24h || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : search.trim() ? (
                <div
                  onClick={() => {
                    const q = search.trim().toLowerCase();
                    setSearchModalOpen(false);
                    setSearch("");
                    router.push(`/coin/${q}`);
                  }}
                  className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center cursor-pointer hover:bg-blue-500/20 transition"
                >
                  <Sparkles size={16} className="text-blue-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-blue-300">
                    Run On-Demand AI Viability & Smart Contract Audit for &quot;{search}&quot;
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Querying on-chain liquidity, honeypot sandboxes & catalysts
                  </p>
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 text-xs">
                  Type any cryptocurrency name (e.g. Bitcoin, Solana, Pepe) or symbol...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Learn Modal ────────────────────────────────────────────────────── */}
      {learnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1422] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-blue-400" />
                <h3 className="text-base font-bold text-white">cryptoVision Intelligence Guide</h3>
              </div>
              <button
                type="button"
                onClick={() => setLearnModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              cryptoVision combines real-time mempool analysis, bytecode sandboxing, and institutional risk metrics across 7 core dimensions:
            </p>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-slate-200">1. Liquidity Health:</span> Detects sudden DEX LP pool unlocking, high slippage thresholds, and sandwich vulnerability.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-slate-200">2. Smart Contract Audit:</span> Flags unverified contracts, proxy upgrade backdoors, hidden mint functions, and blacklist logic.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-slate-200">3. News Catalyst Delta:</span> Measures sentiment delta and projects scenario boundaries.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLearnModalOpen(false)}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

      {/* ── Add Portfolio Import Modal ──────────────────────────────────────── */}
      {addPortfolioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1422] border border-blue-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Briefcase size={20} className="text-blue-400" />
                <h3 className="text-base font-bold text-white">Import User Portfolio</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAddPortfolioModalOpen(false);
                  setImportSuccess(false);
                  setImportCredential("");
                }}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {importSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
                <p className="text-base font-bold text-white">Portfolio Imported Successfully!</p>
                <p className="text-xs text-slate-300">
                  Successfully synced your assets and initialized real-time risk surveillance & VaR calculations.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAddPortfolioModalOpen(false);
                      setImportSuccess(false);
                      setImportCredential("");
                      router.push("/portfolio");
                    }}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    View Portfolio Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Connect your external exchange API key or paste your wallet address / block explorer link to instantly import your cryptocurrency portfolio.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setImportType("wallet")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      importType === "wallet"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                  >
                    Wallet Address / Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportType("api")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      importType === "api"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                  >
                    Exchange API Key
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    {importType === "wallet" ? "Wallet Address or Explorer Link" : "API Key & Secret (Read-Only)"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      importType === "wallet"
                        ? "e.g. 0x71C... or https://etherscan.io/address/0x..."
                        : "e.g. binance_api_key_... or okx_read_key..."
                    }
                    value={importCredential}
                    onChange={(e) => setImportCredential(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400">
                    {importType === "wallet"
                      ? "Supports Ethereum, Solana, Base, Polygon and EVM wallet addresses."
                      : "Only read-only API permissions are required for portfolio asset synchronization."}
                  </p>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAddPortfolioModalOpen(false);
                      setImportCredential("");
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!importCredential.trim()) {
                        alert("Please enter a valid wallet link or API key.");
                        return;
                      }
                      // Simulate successful import & store in localStorage / state
                      setImportSuccess(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer"
                  >
                    Import User Portfolio
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
