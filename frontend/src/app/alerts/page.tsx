"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertApi } from "@/lib/api";
import { useState } from "react";
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const ALERT_TYPES = [
  { value: "price_above",   label: "Price Above"    },
  { value: "price_below",   label: "Price Below"    },
  { value: "risk_above",    label: "Risk Score >"   },
  { value: "fraud_detected",label: "Fraud Detected" },
];

export default function AlertsPage() {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ coin_id: "", alert_type: "price_above", threshold: "" });

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => alertApi.getAll().then(r => r.data).catch(() => []),
  });

  const createAlert = useMutation({
    mutationFn: () => alertApi.create({ ...form, threshold: parseFloat(form.threshold) }),
    onSuccess: () => { toast.success("Alert created!"); qc.invalidateQueries({ queryKey: ["alerts"] }); setShow(false); setForm({ coin_id:"", alert_type:"price_above", threshold:"" }); },
    onError: () => toast.error("Login required to create alerts."),
  });

  const deleteAlert = useMutation({
    mutationFn: (id: string) => alertApi.delete(id),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["alerts"] }); },
  });

  const toggleAlert = useMutation({
    mutationFn: (id: string) => alertApi.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: "#f1f5f9", fontSize: "20px", fontWeight: 800 }}>Alert Manager</h1>
          <p style={{ color: "#475569", fontSize: "13px", marginTop: "4px" }}>Set price and risk threshold alerts</p>
        </div>
        <button className="btn-primary" onClick={() => setShow(!show)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={14} /> New Alert
        </button>
      </div>

      {/* Create form */}
      {show && (
        <div className="card animate-scale-in" style={{ borderColor: "rgba(59,130,246,0.3)" }}>
          <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "14px", marginBottom: "16px" }}>Create Alert</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "10px", alignItems: "end" }}>
            <div>
              <label style={{ display: "block", color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>Coin ID</label>
              <input className="input" placeholder="e.g. bitcoin" value={form.coin_id} onChange={e => setForm({...form, coin_id: e.target.value})} />
            </div>
            <div>
              <label style={{ display: "block", color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>Type</label>
              <select className="input" value={form.alert_type} onChange={e => setForm({...form, alert_type: e.target.value})}>
                {ALERT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>Threshold</label>
              <input className="input" type="number" placeholder="e.g. 50000" value={form.threshold} onChange={e => setForm({...form, threshold: e.target.value})} />
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className="btn-primary" onClick={() => createAlert.mutate()}>Create</button>
              <button className="btn-secondary" onClick={() => setShow(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "48px" }} />)}</div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Bell size={32} style={{ color: "#2d3748", margin: "0 auto 12px" }} />
            <p style={{ color: "#475569", fontWeight: 600 }}>No alerts yet</p>
            <p style={{ color: "#2d3748", fontSize: "13px", marginTop: "4px" }}>Login and create your first alert</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Asset</th><th>Type</th><th>Threshold</th><th>Status</th><th>Triggered</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {alerts.map((a: any) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600, color: "#f1f5f9", textTransform: "capitalize" }}>{a.coin_id}</td>
                  <td>{ALERT_TYPES.find(t => t.value === a.alert_type)?.label || a.alert_type}</td>
                  <td className="num">{a.threshold ?? "—"}</td>
                  <td>
                    <span style={{
                      padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
                      background: a.is_active ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)",
                      color: a.is_active ? "#34d399" : "#475569",
                      border: `1px solid ${a.is_active ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)"}`,
                    }}>
                      {a.is_active ? "ACTIVE" : "PAUSED"}
                    </span>
                  </td>
                  <td className="num">{a.triggered_count ?? 0}×</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="btn-ghost" title="Toggle" onClick={() => toggleAlert.mutate(a.id)} style={{ padding: "4px 6px" }}>
                        {a.is_active ? <ToggleRight size={16} style={{ color: "#34d399" }} /> : <ToggleLeft size={16} />}
                      </button>
                      <button className="btn-ghost" title="Delete" onClick={() => deleteAlert.mutate(a.id)} style={{ padding: "4px 6px" }}>
                        <Trash2 size={14} style={{ color: "#f87171" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
