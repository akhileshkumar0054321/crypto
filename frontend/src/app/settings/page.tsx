"use client";
import { Key, CheckCircle, XCircle, Globe, Database, Cpu, Server, Info } from "lucide-react";

const API_KEYS = [
  { label: "CoinGecko",   status: true,  key: "CG-j3bw…PL7",  desc: "Market data, prices, metadata" },
  { label: "Etherscan",   status: true,  key: "JX1V…QYQ7",    desc: "On-chain transactions (V2)" },
  { label: "Alchemy",     status: true,  key: "alch_Js1n…oELo",desc: "ETH RPC, whale flow analysis" },
  { label: "Binance",     status: true,  key: "GfmlQ…pd4K",   desc: "Price feeds, order books" },
  { label: "HuggingFace", status: true,  key: "hf_lmYI…dXX",  desc: "Phi-2 LLM, embeddings" },
  { label: "DefiLlama",   status: true,  key: "Public API",    desc: "TVL, DeFi protocol data" },
];

const SERVICES = [
  { label: "FastAPI Backend",     status: true,  info: "http://localhost:8000" },
  { label: "PostgreSQL",          status: true,  info: "Docker · Port 5432" },
  { label: "Redis Cache",         status: true,  info: "Docker · Port 6379" },
  { label: "ML Models",           status: true,  info: "RandomForest + IsoForest · v1.0" },
  { label: "Celery Worker",       status: false, info: "Run: celery -A app.workers.celery_app worker" },
  { label: "RAG System",          status: false, info: "pip install chromadb sentence-transformers" },
  { label: "CrewAI Agents",       status: false, info: "pip install crewai (template fallback active)" },
  { label: "LLM (Phi-2)",         status: false, info: "pip install transformers torch (optional)" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 style={{ color: "#f1f5f9", fontSize: "20px", fontWeight: 800 }}>Settings</h1>
        <p style={{ color: "#475569", fontSize: "13px", marginTop: "4px" }}>API configuration and system status</p>
      </div>

      {/* API Keys */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "8px" }}>
          <Key size={14} style={{ color: "#3b82f6" }} />
          <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "14px" }}>API Keys</p>
        </div>
        <div style={{ padding: "8px 0" }}>
          {API_KEYS.map(({ label, status, key, desc }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              {status
                ? <CheckCircle size={15} style={{ color: "#34d399", flexShrink: 0 }} />
                : <XCircle    size={15} style={{ color: "#f87171", flexShrink: 0 }} />
              }
              <div style={{ width: "120px", flexShrink: 0 }}>
                <p style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: 600 }}>{label}</p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#475569", fontSize: "12px" }}>{desc}</p>
              </div>
              <code style={{
                fontFamily: "monospace", fontSize: "11px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                padding: "2px 8px", borderRadius: "5px", color: "#94a3b8", whiteSpace: "nowrap",
              }}>{key}</code>
              <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 700,
                background: status ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                color: status ? "#34d399" : "#f87171",
                border: `1px solid ${status ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                {status ? "ACTIVE" : "MISSING"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Service Status */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "8px" }}>
          <Server size={14} style={{ color: "#06b6d4" }} />
          <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "14px" }}>Service Status</p>
        </div>
        <div style={{ padding: "8px 0" }}>
          {SERVICES.map(({ label, status, info }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                background: status ? "#10b981" : "#2d3748",
                boxShadow: status ? "0 0 6px rgba(16,185,129,0.6)" : "none" }} />
              <p style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: 600, width: "180px", flexShrink: 0 }}>{label}</p>
              <p style={{ color: "#475569", fontSize: "12px", fontFamily: "monospace", flex: 1 }}>{info}</p>
              <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 700,
                background: status ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
                color: status ? "#34d399" : "#475569",
                border: `1px solid ${status ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)"}` }}>
                {status ? "RUNNING" : "OFFLINE"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ML Info */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "ML Model",     value: "RandomForest + IsoForest", icon: Cpu,      color: "#8b5cf6" },
          { label: "DB Engine",    value: "PostgreSQL 16",             icon: Database, color: "#06b6d4" },
          { label: "API Version",  value: "v1.0.0",                   icon: Globe,    color: "#3b82f6" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${color}25` }}>
                <Icon size={13} style={{ color }} />
              </div>
              <p style={{ color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
            </div>
            <p style={{ color: "#f1f5f9", fontSize: "14px", fontWeight: 700 }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
