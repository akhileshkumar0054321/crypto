"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertApi, newsApi } from "@/lib/api";
import { useLiveMarket } from "@/lib/context/LiveMarketContext";
import { useState, useMemo } from "react";
import { InteractiveNewsCard } from "@/components/news/InteractiveNewsCard";
import { NewsImpactModal } from "@/components/news/NewsImpactModal";
import { NewsItem } from "@/types";
import {
  Bell,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Search,
  Radio,
  ShieldAlert,
  Flame,
  Globe,
  TrendingUp,
  TrendingDown,
  Scale,
  Cpu,
  CheckCircle2,
  Copy,
  SlidersHorizontal,
  Share2,
  ShieldCheck,
  Zap,
  Grid,
  List,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const ALERT_TYPES = [
  { value: "price_above", label: "Price Above Threshold ($)" },
  { value: "price_below", label: "Price Below Threshold ($)" },
  { value: "risk_above", label: "Composite Risk Score > (0-100)" },
  { value: "fraud_detected", label: "Fraud & Honeypot Detected" },
];

const CATEGORIES = [
  { id: "ALL", label: "All Intelligence", icon: Globe },
  { id: "Breaking Alert", label: "Breaking", icon: Radio },
  { id: "Regulation", label: "Regulatory & SEC", icon: Scale },
  { id: "Security & Exploit", label: "Security & Exploits", icon: ShieldAlert },
  { id: "Whales", label: "Whale Flows", icon: TrendingUp },
  { id: "DeFi & Layer 1", label: "DeFi & L1 Core", icon: Cpu },
  { id: "Macro & ETFs", label: "Macro & Institutional", icon: TrendingUp },
  { id: "Social Hype & Memes", label: "Social Virality Radar", icon: Flame },
];

const SENTIMENTS = ["ALL", "BULLISH", "BEARISH", "WARNING", "NEUTRAL"];

export default function AlertsPage() {
  const qc = useQueryClient();
  const { isLive } = useLiveMarket();
  const [activeTab, setActiveTab] = useState<"news" | "custom_alerts">("news");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedSentiment, setSelectedSentiment] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // Custom alert state
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [form, setForm] = useState({ coin_id: "", alert_type: "price_above", threshold: "" });

  // ── Queries ─────────────────────────────────────────────────────────────
  const {
    data: newsData,
    isLoading: isNewsLoading,
    refetch: refetchNews,
    isRefetching: isNewsRefetching,
  } = useQuery({
    queryKey: ["market-news", selectedCategory, searchQuery],
    queryFn: () =>
      newsApi
        .getMarketNews(
          selectedCategory !== "ALL" ? selectedCategory : undefined,
          searchQuery.trim() ? searchQuery : undefined
        )
        .then((r) => r.data)
        .catch(() => ({ news: [], total: 0, live_source: "Institutional Global Feeds" })),
    refetchInterval: 25000,
  });

  const { data: customAlerts = [], isLoading: isAlertsLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => alertApi.getAll().then((r) => r.data).catch(() => []),
  });

  // ── Mutations ───────────────────────────────────────────────────────────
  const createAlert = useMutation({
    mutationFn: () => alertApi.create({ ...form, threshold: parseFloat(form.threshold) }),
    onSuccess: () => {
      toast.success("Autonomous risk surveillance rule active.");
      qc.invalidateQueries({ queryKey: ["alerts"] });
      setShowCreateAlert(false);
      setForm({ coin_id: "", alert_type: "price_above", threshold: "" });
    },
    onError: () => toast.error("Could not activate alert rule."),
  });

  const deleteAlert = useMutation({
    mutationFn: (id: string) => alertApi.delete(id),
    onSuccess: () => {
      toast.success("Alert rule removed");
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const toggleAlert = useMutation({
    mutationFn: (id: string) => alertApi.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetchNews();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Real-time intelligence stream synchronized.");
    }, 400);
  };

  const copyLink = (url: string, title: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success(`Copied article link to clipboard`);
    }
  };

  const filteredNews = useMemo(() => {
    const list = newsData?.news || [];
    if (selectedSentiment === "ALL") return list;
    return list.filter((n: any) => n.sentiment === selectedSentiment);
  }, [newsData, selectedSentiment]);

  const criticalItems = useMemo(() => {
    const list = newsData?.news || [];
    return list.filter((n: any) => n.importance === "CRITICAL" || n.category === "Security & Exploit");
  }, [newsData]);

  return (
    <div id="alerts-news-container" className="space-y-6 animate-fade-in pb-12">
      {/* ── Top Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1e293b] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                <Radio size={20} className="animate-pulse" />
              </span>
              Real-Time Market Intelligence & Threat Surveillance
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE SURVEILLANCE ACTIVE
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1.5">
            Continuous real-time tracking of breaking crypto news, regulatory actions, smart contract vulnerability disclosures, and institutional whale capital flows.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="refresh-news-btn"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isNewsRefetching}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing || isNewsRefetching ? "animate-spin text-blue-400" : ""} />
            {isRefreshing || isNewsRefetching ? "Syncing Feed..." : "Refresh Intelligence Stream"}
          </button>

          <button
            id="create-alert-btn"
            onClick={() => {
              setActiveTab("custom_alerts");
              setShowCreateAlert(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition"
          >
            <Plus size={15} />
            Configure Autonomous Trigger
          </button>
        </div>
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-800/80">
        <button
          onClick={() => setActiveTab("news")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition border-b-2 ${
            activeTab === "news"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Radio size={16} />
          Market Intelligence Wire
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 font-mono">
            {newsData?.total ?? 15}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("custom_alerts")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition border-b-2 ${
            activeTab === "custom_alerts"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Bell size={16} />
          Autonomous Risk Triggers
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 font-mono">
            {customAlerts.length}
          </span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: LIVE MARKET NEWS & THREAT WIRE                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "news" && (
        <div className="space-y-6">
          {/* Critical Exploit / SEC Warning Banner */}
          {criticalItems.length > 0 && (
            <div 
              onClick={() => setSelectedNews(criticalItems[0])}
              className="p-4 rounded-xl bg-gradient-to-r from-red-950/50 via-red-900/30 to-slate-900/50 border border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-red-950/20 cursor-pointer hover:border-red-500/50 transition group"
            >
              <div className="flex items-start gap-4">
                {criticalItems[0].image_url ? (
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 border border-red-500/30 bg-slate-950">
                    <img
                      src={criticalItems[0].image_url}
                      alt={criticalItems[0].title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-red-950/30" />
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-red-500/20 text-red-400 shrink-0 mt-0.5">
                    <ShieldAlert size={24} />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                      CRITICAL RISK ADVISORY
                    </span>
                    <span className="text-xs text-slate-400">
                      {criticalItems[0].source} • {criticalItems[0].timestamp}
                    </span>
                    {criticalItems[0].predicted_direction && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                        {criticalItems[0].predicted_direction} ({criticalItems[0].estimated_impact_percent > 0 ? "+" : ""}{criticalItems[0].estimated_impact_percent}%)
                      </span>
                    )}
                  </div>
                  <h4 className="text-slate-100 font-bold text-sm sm:text-base mt-1 group-hover:text-red-300 transition">
                    {criticalItems[0].title}
                  </h4>
                  <p className="text-slate-300 text-xs mt-1 line-clamp-2">
                    {criticalItems[0].summary}
                  </p>
                  <p className="text-red-400 text-[11px] font-semibold mt-2 flex items-center gap-1">
                    <Sparkles size={12} />
                    Click to view AI Causal Transmission & Market Impact analysis →
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setSelectedNews(criticalItems[0])}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/40 transition shadow-sm"
                >
                  Deep Analysis <Sparkles size={13} />
                </button>
                <a
                  href={criticalItems[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition"
                >
                  Primary Source <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}

          {/* Search and Category Filters */}
          <div className="space-y-3.5 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                id="news-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter stream by keyword, token, protocol (e.g. Bitcoin, Solana, ETF, SEC, Exploits, Whales)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>

            {/* Sentiment & Layout Mode Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-800/60 text-xs gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 font-medium">Sentiment:</span>
                <div className="flex items-center gap-1">
                  {SENTIMENTS.map((sent) => (
                    <button
                      key={sent}
                      onClick={() => setSelectedSentiment(sent)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                        selectedSentiment === sent
                          ? "bg-slate-700 text-white"
                          : "text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {sent}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                      viewMode === "grid" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                    title="Visual Grid Cards with Article Images"
                  >
                    <Grid size={12} />
                    <span>Grid (Images)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                      viewMode === "list" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                    title="Detailed List Rows with Thumbnails"
                  >
                    <List size={12} />
                    <span>List</span>
                  </button>
                </div>

                <div className="text-slate-400 text-[11px] hidden sm:block">
                  Showing <strong>{filteredNews.length}</strong> items
                </div>
              </div>
            </div>
          </div>

          {/* News Feed Content */}
          {isNewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-xl bg-slate-900/60 border border-slate-800/80 animate-pulse" />
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800/80">
              <Radio size={32} className="mx-auto text-slate-600 mb-3" />
              <h3 className="text-slate-300 font-bold text-sm">No intelligence items match your filter</h3>
              <p className="text-slate-500 text-xs mt-1">Try selecting &quot;All Intelligence&quot; or clearing search.</p>
            </div>
          ) : viewMode === "grid" ? (
            /* Visual Grid Mode with Full Media Card Visuals */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNews.map((item: any) => (
                <InteractiveNewsCard
                  key={item.id}
                  item={item}
                  onSelect={(n) => setSelectedNews(n)}
                />
              ))}
            </div>
          ) : (
            /* Detailed List Mode with Rich Thumbnails and Direct Impact Modals */
            <div className="space-y-3">
              {filteredNews.map((item: any) => {
                const isBull = item.sentiment === "BULLISH";
                const isBear = item.sentiment === "BEARISH";
                const isWarn = item.sentiment === "WARNING";

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedNews(item)}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-blue-500/40 transition flex flex-col md:flex-row items-start justify-between gap-4 group cursor-pointer"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Image Thumbnail */}
                      {item.image_url ? (
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-slate-950 border border-white/5">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = "none";
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg shrink-0 bg-slate-800 flex items-center justify-center text-slate-500 border border-white/5">
                          <Globe size={24} />
                        </div>
                      )}

                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Meta badges */}
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="font-bold text-slate-300">{item.source}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400">{item.timestamp}</span>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              isBull
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : isBear
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : isWarn
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {item.sentiment}
                          </span>

                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                            {item.category}
                          </span>

                          {item.predicted_direction && (
                            <span className="text-[10px] font-bold text-blue-400 flex items-center gap-0.5">
                              <Sparkles size={11} />
                              {item.predicted_direction} ({item.estimated_impact_percent > 0 ? "+" : ""}{item.estimated_impact_percent}%)
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-slate-100 font-bold text-sm sm:text-base leading-snug group-hover:text-blue-400 transition">
                          {item.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                          {item.summary}
                        </p>

                        {/* Coin tags */}
                        {item.coin_tags && item.coin_tags.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1">
                            {item.coin_tags.map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono font-bold"
                              >
                                ${tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center gap-2 self-end md:self-center shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedNews(item)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-semibold border border-blue-500/20 transition whitespace-nowrap"
                        title="Analyze Causal Chain & Affected Coins"
                      >
                        <Sparkles size={12} />
                        <span>Impact</span>
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition whitespace-nowrap"
                        title="Read full article on original publisher"
                      >
                        <ExternalLink size={12} />
                        <span>Source</span>
                      </a>
                      <button
                        onClick={() => copyLink(item.url, item.title)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                        title="Copy article link"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: AUTONOMOUS RISK TRIGGERS                                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "custom_alerts" && (
        <div className="space-y-6">
          {/* Create Alert Modal / Inline Box */}
          {showCreateAlert && (
            <div className="p-5 rounded-xl bg-slate-900 border border-blue-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-100 font-bold text-sm flex items-center gap-2">
                  <Plus size={16} className="text-blue-400" />
                  New Autonomous Risk Rule
                </h3>
                <button
                  onClick={() => setShowCreateAlert(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Asset Symbol / ID</label>
                  <input
                    type="text"
                    placeholder="e.g. bitcoin, solana, pepe"
                    value={form.coin_id}
                    onChange={(e) => setForm({ ...form, coin_id: e.target.value.toLowerCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Trigger Condition</label>
                  <select
                    value={form.alert_type}
                    onChange={(e) => setForm({ ...form, alert_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {ALERT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Threshold Numerical Value</label>
                  <input
                    type="number"
                    placeholder="e.g. 68000 or 75"
                    value={form.threshold}
                    onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCreateAlert(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => createAlert.mutate()}
                  disabled={!form.coin_id || !form.threshold}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  Activate Surveillance Rule
                </button>
              </div>
            </div>
          )}

          {/* Trigger List */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-slate-100 font-bold text-sm">Active Autonomous Risk Surveillance Rules</h3>
              <button
                onClick={() => setShowCreateAlert(true)}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Plus size={13} /> Add Rule
              </button>
            </div>

            {isAlertsLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 rounded-lg bg-slate-900 animate-pulse" />
                ))}
              </div>
            ) : customAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell size={32} className="mx-auto text-slate-600 mb-2" />
                <p className="text-slate-300 text-sm font-semibold">No custom triggers active</p>
                <p className="text-slate-500 text-xs mt-1">Set up automated notifications for flash drops, risk score hikes, or whale dumping.</p>
                <button
                  onClick={() => setShowCreateAlert(true)}
                  className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition"
                >
                  Create Your First Trigger
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {customAlerts.map((alt: any) => (
                  <div key={alt.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm uppercase">{alt.coin_id}</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {alt.alert_type?.replace(/_/g, " ")} {alt.threshold}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Triggered {alt.triggered_count || 0} times • Created {new Date(alt.created_at || Date.now()).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAlert.mutate(alt.id)}
                        className={`text-xs px-2.5 py-1 rounded font-semibold transition ${
                          alt.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {alt.is_active ? "Active" : "Disabled"}
                      </button>
                      <button
                        onClick={() => deleteAlert.mutate(alt.id)}
                        className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Interactive News Impact & Causal Transmission Modal ─────────── */}
      <NewsImpactModal
        item={selectedNews}
        onClose={() => setSelectedNews(null)}
      />
    </div>
  );
}
