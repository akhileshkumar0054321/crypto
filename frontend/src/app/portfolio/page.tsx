"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { portfolioApi } from "@/lib/api";
import { useState } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, Briefcase } from "lucide-react";
import { toast } from "sonner";

export default function PortfolioPage() {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ coin_id: "", quantity: "", avg_buy_price_usd: "" });

  const { data: holdings = [], isLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => portfolioApi.getAll().then(r => r.data).catch(() => []),
    refetchInterval: 30_000,
  });

  const { data: riskData } = useQuery({
    queryKey: ["portfolio-risk"],
    queryFn: () => portfolioApi.getRisk().then(r => r.data).catch(() => null),
  });

  const addCoin = useMutation({
    mutationFn: () => portfolioApi.addCoin({ ...form, quantity: parseFloat(form.quantity), avg_buy_price_usd: parseFloat(form.avg_buy_price_usd) }),
    onSuccess: () => { toast.success("Added!"); qc.invalidateQueries({ queryKey: ["portfolio"] }); setShow(false); setForm({ coin_id:"",quantity:"",avg_buy_price_usd:"" }); },
    onError: () => toast.error("Login required."),
  });

  const removeCoin = useMutation({
    mutationFn: (id: string) => portfolioApi.removeCoin(id),
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["portfolio"] }); },
  });

  const totalValue = holdings.reduce((s: number, h: any) => s + (h.current_value_usd ?? 0), 0);
  const totalPnl   = holdings.reduce((s: number, h: any) => s + (h.pnl_usd ?? 0), 0);
  const totalPnlPct = totalValue > 0 ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: "#f1f5f9", fontSize: "20px", fontWeight: 800 }}>Portfolio</h1>
          <p style={{ color: "#475569", fontSize: "13px", marginTop: "4px" }}>Track your holdings and risk exposure</p>
        </div>
        <button className="btn-primary" onClick={() => setShow(!show)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={14} /> Add Holding
        </button>
      </div>

      {/* Summary cards */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <p style={{ color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Total Value</p>
            <p style={{ color: "#f1f5f9", fontSize: "24px", fontWeight: 800, fontFamily: "monospace", marginTop: "8px" }}>
              ${totalValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="stat-card">
            <p style={{ color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Total P&L</p>
            <p className={totalPnl >= 0 ? "positive" : "negative"} style={{ fontSize: "24px", fontWeight: 800, fontFamily: "monospace", marginTop: "8px" }}>
              {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </p>
            <p className={totalPnlPct >= 0 ? "positive" : "negative"} style={{ fontSize: "12px", marginTop: "4px" }}>
              {totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(2)}%
            </p>
          </div>
          <div className="stat-card">
            <p style={{ color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Portfolio Risk</p>
            <p style={{ fontSize: "24px", fontWeight: 800, fontFamily: "monospace", marginTop: "8px",
              color: (riskData?.weighted_risk??0) >= 70 ? "#f87171" : (riskData?.weighted_risk??0) >= 40 ? "#fbbf24" : "#34d399" }}>
              {riskData?.weighted_risk?.toFixed(1) ?? "—"}
            </p>
            <p style={{ color: "#475569", fontSize: "12px", marginTop: "4px" }}>Weighted risk score</p>
          </div>
        </div>
      )}

      {/* Add form */}
      {show && (
        <div className="card animate-scale-in" style={{ borderColor: "rgba(59,130,246,0.3)" }}>
          <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "14px", marginBottom: "16px" }}>Add Holding</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "10px", alignItems: "end" }}>
            {[
              { label: "Coin ID",    key: "coin_id",          placeholder: "bitcoin",  type: "text" },
              { label: "Quantity",   key: "quantity",          placeholder: "0.5",      type: "number" },
              { label: "Avg Buy $",  key: "avg_buy_price_usd", placeholder: "45000",    type: "number" },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label style={{ display: "block", color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>{label}</label>
                <input className="input" type={type} placeholder={placeholder}
                  value={(form as any)[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
              </div>
            ))}
            <div style={{ display: "flex", gap: "6px" }}>
              <button className="btn-primary" onClick={() => addCoin.mutate()}>Add</button>
              <button className="btn-secondary" onClick={() => setShow(false)}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Holdings table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "48px" }} />)}</div>
        ) : holdings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Briefcase size={32} style={{ color: "#2d3748", margin: "0 auto 12px" }} />
            <p style={{ color: "#475569", fontWeight: 600 }}>Portfolio is empty</p>
            <p style={{ color: "#2d3748", fontSize: "13px", marginTop: "4px" }}>Login and add your first holding</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Asset</th><th>Quantity</th><th>Avg Buy</th><th>Current</th><th>Value</th><th>P&L</th><th>Risk</th><th></th></tr>
            </thead>
            <tbody>
              {holdings.map((h: any) => {
                const pnl = h.pnl_usd ?? 0;
                const pnlPct = h.pnl_pct ?? 0;
                return (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 600, color: "#f1f5f9", textTransform: "capitalize" }}>{h.coin_id}</td>
                    <td className="num">{h.quantity}</td>
                    <td className="num">${h.avg_buy_price_usd?.toFixed(2)}</td>
                    <td className="num">${h.current_price_usd?.toFixed(2) ?? "—"}</td>
                    <td className="num">${(h.current_value_usd ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                    <td>
                      <div className={pnl >= 0 ? "positive" : "negative"} style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "13px" }}>
                        {pnl >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        <span className="num">{pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "13px",
                        color: (h.risk_score??0) >= 70 ? "#f87171" : (h.risk_score??0) >= 40 ? "#fbbf24" : "#34d399" }}>
                        {h.risk_score?.toFixed(1) ?? "—"}
                      </span>
                    </td>
                    <td>
                      <button className="btn-ghost" onClick={() => removeCoin.mutate(h.id)} style={{ padding: "4px" }}>
                        <Trash2 size={13} style={{ color: "#ef4444" }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
