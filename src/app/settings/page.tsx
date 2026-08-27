"use client";

import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api";
import { useLiveMarket } from "@/lib/context/LiveMarketContext";
import {
  ShieldCheck,
  Cpu,
  Activity,
  Lock,
  Radio,
  Sliders,
  Sparkles,
  Zap,
  CheckCircle2,
  EyeOff,
  Database,
  Layers,
  Server,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { isLive, setIsLive, speed, setSpeed, globalStats } = useLiveMarket();
  const [whaleAlertThreshold, setWhaleAlertThreshold] = useState("100000");
  const [anomalySensitivity, setAnomalySensitivity] = useState("high");
  const [honeypotMode, setHoneypotMode] = useState("strict");
  const [privacyMasking, setPrivacyMasking] = useState(true);

  const { data: enclaveData, isLoading } = useQuery({
    queryKey: ["settings-enclaves"],
    queryFn: () => settingsApi.getKeys().then((r) => r.data).catch(() => null),
  });

  const enclaves = enclaveData?.enclaves || [];

  const handleSaveParams = () => {
    toast.success("Security & surveillance parameters updated successfully.");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12" id="settings-page-container">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1e293b] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <ShieldCheck size={20} />
            </span>
            Institutional Security & Platform Configuration
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Real-time telemetry, cryptographic surveillance parameters, low-latency stream controls, and privacy enclaves.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ENCLAVES SECURE & OPERATIONAL
          </span>
        </div>
      </div>

      {/* Real-Time Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="telemetry-metrics-grid">
        <div className="stat-card">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Feed Stream Status</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <p className="text-lg font-bold text-slate-100">{isLive ? "LIVE STREAMING" : "PAUSED"}</p>
          </div>
          <p className="text-xs text-slate-400 mt-1">Real-time micro-ticks: {speed === "fast" ? "1.8s" : speed === "normal" ? "3.5s" : "6.0s"}</p>
        </div>

        <div className="stat-card">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Node Cluster Latency</p>
          <p className="text-lg font-bold font-mono text-slate-100 mt-2">{globalStats.latencyMs} ms</p>
          <p className="text-xs text-emerald-400 mt-1">Ultra-low latency execution</p>
        </div>

        <div className="stat-card">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Surveillance Nodes</p>
          <p className="text-lg font-bold font-mono text-slate-100 mt-2">{globalStats.activeNodes} Cluster Nodes</p>
          <p className="text-xs text-slate-400 mt-1">Distributed consensus verifiers</p>
        </div>

        <div className="stat-card">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Privacy Protocol</p>
          <p className="text-lg font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
            <Lock size={16} /> Zero-Knowledge
          </p>
          <p className="text-xs text-slate-400 mt-1">Client telemetry anonymized</p>
        </div>
      </div>

      {/* Real-Time Live Feed & Streaming Control Card */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Radio size={18} />
            </div>
            <div>
              <h3 className="text-slate-100 font-bold text-base">Real-Time Market Tick Streaming Controls</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Configure live price fluctuation rate, order book tick frequencies, and visual pulse animations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                isLive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
              {isLive ? "Real-Time Streaming: ACTIVE" : "Streaming: PAUSED"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Tick Frequency Mode</label>
            <div className="flex rounded-lg bg-slate-900/80 p-1 border border-slate-800">
              {[
                { id: "fast", label: "Ultra (1.8s)" },
                { id: "normal", label: "Standard (3.5s)" },
                { id: "slow", label: "Smooth (6s)" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSpeed(m.id as any)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                    speed === m.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Whale Transaction Filter</label>
            <select
              value={whaleAlertThreshold}
              onChange={(e) => setWhaleAlertThreshold(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="50000">Orders &gt; $50,000 USD</option>
              <option value="100000">Orders &gt; $100,000 USD (Institutional)</option>
              <option value="500000">Orders &gt; $500,000 USD (Mega Whale)</option>
              <option value="1000000">Orders &gt; $1,000,000 USD (Tier 1 Entity)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Honeypot Sandbox Depth</label>
            <select
              value={honeypotMode}
              onChange={(e) => setHoneypotMode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="strict">Strict (Simulate Buy + Sell + Max Gas)</option>
              <option value="deep">Deep Bytecode Decompilation & Assembly Audit</option>
              <option value="fast">Rapid Static Signature Match</option>
            </select>
          </div>
        </div>
      </div>

      {/* Institutional Surveillance & Enclave Cluster Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server size={16} className="text-blue-400" />
            <h2 className="text-slate-100 font-bold text-sm">Active Forensic Enclaves & Intelligence Nodes</h2>
          </div>
          <span className="text-xs text-slate-400">
            Cluster Status: <strong className="text-emerald-400">100% HEALTHY</strong>
          </span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {enclaves.map((enclave: any) => (
            <div key={enclave.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-100 font-bold text-sm">{enclave.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {enclave.category}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {enclave.latency_ms} latency
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-6">{enclave.description}</p>
                <div className="flex flex-wrap gap-1.5 pl-6 pt-1">
                  {enclave.capabilities?.map((cap: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pl-6 md:pl-0 flex-shrink-0">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {enclave.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Client Privacy Guarantee */}
      <div className="card bg-slate-900/50 border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex-shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="text-slate-100 font-bold text-sm">Enterprise Confidentiality & Zero-Knowledge Architecture</h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              All portfolio balances, scanned addresses, and custom alert rules are encrypted at rest with zero client IP correlation. 
              The platform executes simulated transactions in isolated sandboxes to protect investor anonymity and prevent front-running by predatory MEV bots.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
