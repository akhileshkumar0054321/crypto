"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { Zap, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login"|"register">("login");
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      if (tab === "login") {
        const { data } = await authApi.login(form.email, form.password);
        localStorage.setItem("access_token", data.access_token);
        toast.success("Welcome back!");
        router.push("/");
      } else {
        await authApi.register(form.email, form.username, form.password);
        toast.success("Account created! Please sign in.");
        setTab("login");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "380px", padding: "0 20px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 0 24px rgba(59,130,246,0.4)" }}>
            <Zap size={22} className="text-white" />
          </div>
          <h1 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "22px" }}>CryptoRisk</h1>
          <p style={{ color: "#475569", fontSize: "13px", marginTop: "4px" }}>AI-Powered Risk Intelligence</p>
        </div>

        {/* Card */}
        <div style={{ background: "#131929", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "3px", marginBottom: "24px" }}>
            {(["login","register"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "7px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, transition: "all 0.15s",
                background: tab === t ? "#1e293b" : "transparent",
                color: tab === t ? "#f1f5f9" : "#475569",
                boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
              }}>
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>

            {tab === "register" && (
              <div>
                <label style={{ display: "block", color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>Username</label>
                <input className="input" placeholder="johndoe" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
              </div>
            )}

            <div>
              <label style={{ display: "block", color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input className="input" type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  style={{ paddingRight: "36px" }} />
                <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#475569" }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button className="btn-primary" onClick={submit} disabled={loading}
              style={{ width: "100%", marginTop: "4px", justifyContent: "center", height: "40px", fontSize: "14px" }}>
              {loading ? "Please wait…" : tab === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#2d3748", fontSize: "12px", marginTop: "16px" }}>
          Crypto data provided by CoinGecko · Alchemy · DefiLlama
        </p>
      </div>
    </div>
  );
}
