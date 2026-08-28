"use client";

import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api";
import { useLiveMarket } from "@/lib/context/LiveMarketContext";
import { useUserPlan, PlanTierData } from "@/lib/context/UserPlanContext";
import Link from "next/link";
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
  Check,
  CreditCard,
  Building,
  Server,
  Key,
  User,
  ArrowRight,
  Download,
  AlertCircle,
  ExternalLink,
  Coins,
  Receipt,
  Clock,
  Layers,
  ChevronRight,
  Shield,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { isLive, setIsLive, speed, setSpeed, globalStats } = useLiveMarket();
  const { subscription, currentPlan, allPlans, purchasePlan, cancelSubscription, setUserEmail } = useUserPlan();

  const [activeTab, setActiveTab] = useState<"account" | "plans" | "telemetry" | "billing" | "apikeys">("account");
  const [isAnnualBilling, setIsAnnualBilling] = useState(subscription.billingCycle === "annual");
  const [whaleAlertThreshold, setWhaleAlertThreshold] = useState("100000");
  const [anomalySensitivity, setAnomalySensitivity] = useState("high");
  const [honeypotMode, setHoneypotMode] = useState("strict");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(subscription.userEmail);

  // Upgrade / Switch Plan Modal
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [targetPlanForSwitch, setTargetPlanForSwitch] = useState<PlanTierData>(currentPlan);
  const [paymentMethodType, setPaymentMethodType] = useState<"card" | "crypto" | "invoice">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cryptoCurrency, setCryptoCurrency] = useState("USDC");

  const { data: enclaveData } = useQuery({
    queryKey: ["settings-enclaves"],
    queryFn: () => settingsApi.getKeys().then((r) => r.data).catch(() => null),
  });

  const enclaves = enclaveData?.enclaves || [];

  const handleOpenSwitchModal = (plan: PlanTierData) => {
    setTargetPlanForSwitch(plan);
    setShowSwitchModal(true);
  };

  const handleConfirmPlanSwitch = async () => {
    setIsProcessing(true);
    try {
      const billing = isAnnualBilling ? "annual" : "monthly";
      let paymentLabel = "Credit Card (•••• 4242)";
      if (paymentMethodType === "crypto") {
        paymentLabel = `${cryptoCurrency} On-Chain Settlement`;
      } else if (paymentMethodType === "invoice") {
        paymentLabel = "Corporate Invoicing (Net 30)";
      }

      await purchasePlan(targetPlanForSwitch.id, billing, {
        type: paymentMethodType,
        label: paymentLabel,
        last4: paymentMethodType === "card" ? "4242" : undefined,
      });

      setShowSwitchModal(false);
    } catch {
      toast.error("Failed to switch plan. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEmail = () => {
    if (!emailInput || !emailInput.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setUserEmail(emailInput);
    setIsEditingEmail(false);
    toast.success("Account email updated successfully.");
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16" id="settings-page-container">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <User size={22} />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              Account, Subscription & Enclave Settings
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1.5 pl-1">
            Manage your active plan tier, view all available subscription plans, configure low-latency streaming telemetry, and inspect security enclaves.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#0f1422] border border-slate-800 flex items-center gap-2">
            <span className="text-xs text-slate-400">Current Plan:</span>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              {currentPlan.name}
            </span>
          </div>
          <Link
            href="/pricing"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
          >
            <span>View All Plans & Buy</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── Section Navigation Tabs ─────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => setActiveTab("account")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "account"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <CreditCard size={14} />
          <span>Account & Current Plan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "plans"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Layers size={14} />
          <span>All Available Plans ({allPlans.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("telemetry")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "telemetry"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Radio size={14} />
          <span>Enclaves & Node Telemetry</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "billing"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Receipt size={14} />
          <span>Invoices & Billing</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("apikeys")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "apikeys"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Key size={14} />
          <span>API Access & Quota</span>
        </button>
      </div>

      {/* ── TAB 1: ACCOUNT & CURRENT PLAN ────────────────────────────── */}
      {activeTab === "account" && (
        <div className="space-y-8 animate-fade-in">
          {/* User Profile Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d121f] via-[#111728] to-[#0d121f] border border-slate-800/80 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/20 flex-shrink-0">
                  {subscription.userEmail.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg font-bold text-white">Institutional Trader Profile</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      VERIFIED ENTITY
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono text-slate-300">ID: {subscription.userId}</span>
                    <span>&bull;</span>
                    <span>Org: {subscription.organization}</span>
                  </div>

                  {isEditingEmail ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="px-3 py-1 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleSaveEmail}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailInput(subscription.userEmail);
                          setIsEditingEmail(false);
                        }}
                        className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-0.5">
                      <p className="text-xs text-slate-300 font-mono">{subscription.userEmail}</p>
                      <button
                        type="button"
                        onClick={() => setIsEditingEmail(true)}
                        className="text-[11px] text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1 min-w-[170px]">
                  <p className="text-slate-400 text-[11px] font-semibold">Active Since</p>
                  <p className="font-bold text-white font-mono">{subscription.subscribedSince}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1 min-w-[170px]">
                  <p className="text-slate-400 text-[11px] font-semibold">Next Renewal Date</p>
                  <p className="font-bold text-emerald-400 font-mono">{subscription.renewalDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Active Plan Detail Banner */}
          <div className="p-6 rounded-2xl bg-[#0e1424] border-2 border-blue-500/40 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-0 pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-md shadow-blue-600/30 flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    CURRENT ACTIVE PLAN
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold uppercase">
                    {subscription.billingCycle === "annual" ? "Annual Billing (20% Off)" : "Monthly Billing"}
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {currentPlan.name}
                  </h3>
                  <span className="text-xl font-bold font-mono text-blue-400">
                    ${subscription.billingCycle === "annual" ? currentPlan.priceAnnual : currentPlan.priceMonthly}
                    <span className="text-xs text-slate-400 font-normal">/month</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {currentPlan.description}
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("plans")}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>Change / Upgrade Plan</span>
                  <ArrowRight size={13} />
                </button>
                <Link
                  href="/pricing"
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
                >
                  Buy Another Plan
                </Link>
              </div>
            </div>

            {/* Active Plan Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 mt-6 border-t border-slate-800/80 relative z-10">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400">Telemetry Feed</p>
                <p className="text-xs font-bold text-slate-200 mt-1">{currentPlan.specs.telemetryRate}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400">AI Dossier Quota</p>
                <p className="text-xs font-bold text-emerald-400 mt-1">{currentPlan.specs.aiReportsQuota}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400">Enclave Latency</p>
                <p className="text-xs font-bold text-blue-400 font-mono mt-1">{currentPlan.specs.enclaveLatency}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400">API Requests</p>
                <p className="text-xs font-bold text-slate-200 mt-1">{currentPlan.specs.apiRequests}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400">Contract Sandboxing</p>
                <p className="text-xs font-bold text-slate-200 mt-1">{currentPlan.specs.sandboxing}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400">Support Desk</p>
                <p className="text-xs font-bold text-slate-200 mt-1">{currentPlan.specs.support}</p>
              </div>
            </div>

            {/* Included Capabilities Checklist */}
            <div className="pt-5 mt-5 border-t border-slate-800/60">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Included Capabilities in your {currentPlan.name} Plan:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                {currentPlan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Available Plans Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">All Platform Subscription Tiers</h3>
                <p className="text-xs text-slate-400">Instantly switch or upgrade your account to any tier.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("plans")}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Compare Full Features</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {allPlans.map((plan) => {
                const isCurrent = plan.id === subscription.currentPlanId;
                const price = subscription.billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly;

                return (
                  <div
                    key={plan.id}
                    className={`p-5 rounded-xl border flex flex-col justify-between transition ${
                      isCurrent
                        ? "bg-blue-950/30 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30"
                        : "bg-[#0f1422] border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded bg-blue-600 text-[10px] font-bold text-white">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">{plan.description}</p>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-2xl font-extrabold font-mono text-white">${price}</span>
                        <span className="text-[10px] text-slate-400">/mo</span>
                      </div>
                    </div>

                    <div>
                      {isCurrent ? (
                        <button
                          disabled
                          className="w-full py-2 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold cursor-default flex items-center justify-center gap-1"
                        >
                          <Check size={12} />
                          <span>Current Plan</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenSwitchModal(plan)}
                          className="w-full py-2 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500 text-xs font-bold transition cursor-pointer"
                        >
                          Switch to {plan.name}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ALL AVAILABLE PLANS COMPARISON ─────────────────────── */}
      {activeTab === "plans" && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-xl font-extrabold text-white">Available Plans & Forensic Capabilities</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review complete capability specifications and switch or upgrade your active plan in one click.
              </p>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="flex items-center gap-3 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setIsAnnualBilling(false)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  !isAnnualBilling ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsAnnualBilling(true)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isAnnualBilling ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Annually</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold uppercase">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Full Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {allPlans.map((plan) => {
              const isCurrent = plan.id === subscription.currentPlanId;
              const price = isAnnualBilling ? plan.priceAnnual : plan.priceMonthly;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all border ${
                    isCurrent
                      ? "bg-gradient-to-b from-[#131a2e] to-[#0a0e19] border-blue-500 shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500/40"
                      : plan.popular
                      ? "bg-gradient-to-b from-[#101626] to-[#090d17] border-blue-500/40 shadow-xl"
                      : "bg-[#0d121f] border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  {/* Top Badge */}
                  {isCurrent ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white shadow-md flex items-center gap-1">
                        <Check size={11} /> CURRENT PLAN
                      </span>
                    </div>
                  ) : plan.badge ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 shadow-md">
                        {plan.badge}
                      </span>
                    </div>
                  ) : null}

                  <div>
                    <div className="flex items-center justify-between mb-2 mt-1">
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      {plan.id === "institutional" && <Building size={16} className="text-emerald-400" />}
                      {plan.id === "enterprise" && <Cpu size={16} className="text-purple-400" />}
                    </div>

                    <p className="text-slate-400 text-xs mb-4 min-h-[36px]">{plan.description}</p>

                    {/* Price Display */}
                    <div className="mb-4 pb-4 border-b border-slate-800/80">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-white font-mono">${price}</span>
                        <span className="text-slate-500 text-xs font-semibold">
                          {plan.priceMonthly === 0 ? "forever" : isAnnualBilling ? "/mo (billed annually)" : "/month"}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1">
                        Target: <span className="text-slate-300 font-medium">{plan.targetAudience}</span>
                      </p>
                    </div>

                    {/* Specs Table */}
                    <div className="space-y-2 mb-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Stream Rate:</span>
                        <span className="font-semibold text-slate-200">{plan.specs.telemetryRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">AI Quota:</span>
                        <span className="font-semibold text-emerald-400">{plan.specs.aiReportsQuota}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Latency:</span>
                        <span className="font-mono text-blue-400">{plan.specs.enclaveLatency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">API Calls:</span>
                        <span className="font-semibold text-slate-200">{plan.specs.apiRequests}</span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Included Features:
                      </p>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {isCurrent ? (
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
                        <p className="text-xs font-bold text-blue-300 flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={14} className="text-blue-400" />
                          <span>Currently Active Plan</span>
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenSwitchModal(plan)}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                          plan.popular || plan.id === "institutional"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white"
                        }`}
                      >
                        <Zap size={13} />
                        <span>Select & Activate {plan.name}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Looking for dedicated checkout or custom sales invoicing?</p>
                <p className="text-[11px] text-slate-400">All plans can also be purchased and managed from the dedicated Pricing Hub.</p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1 flex-shrink-0"
            >
              <span>Go to Pricing Hub</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* ── TAB 3: ENCLAVES & TELEMETRY ──────────────────────────────── */}
      {activeTab === "telemetry" && (
        <div className="space-y-6 animate-fade-in">
          {/* Real-Time Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="telemetry-metrics-grid">
            <div className="stat-card">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Feed Stream Status</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <p className="text-lg font-bold text-slate-100">{isLive ? "LIVE STREAMING" : "PAUSED"}</p>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time micro-ticks: {speed === "fast" ? "1.8s" : speed === "normal" ? "3.5s" : "6.0s"}
              </p>
            </div>

            <div className="stat-card">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Node Cluster Latency</p>
              <p className="text-lg font-bold font-mono text-slate-100 mt-2">{globalStats.latencyMs} ms</p>
              <p className="text-xs text-emerald-400 mt-1">Ultra-low latency execution</p>
            </div>

            <div className="stat-card">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Enclave Nodes</p>
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
                  <h3 className="text-slate-100 font-bold text-base">Market Tick Streaming Controls</h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Configure live price fluctuation rate, order book tick frequencies, and visual pulse animations.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsLive(!isLive)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
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
                      type="button"
                      onClick={() => setSpeed(m.id as any)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
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

          {/* Enclave Cluster Table */}
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
        </div>
      )}

      {/* ── TAB 4: BILLING & INVOICES ────────────────────────────────── */}
      {activeTab === "billing" && (
        <div className="space-y-6 animate-fade-in">
          {/* Payment Method Card */}
          <div className="p-6 rounded-2xl bg-[#0f1422] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <CreditCard size={24} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Primary Payment Method</p>
                <p className="text-sm font-bold text-white mt-0.5">{subscription.paymentMethod.label}</p>
                <p className="text-xs text-slate-400">Renews automatically on {subscription.renewalDate}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setTargetPlanForSwitch(currentPlan);
                setShowSwitchModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer"
            >
              Update Payment Method
            </button>
          </div>

          {/* Invoices History Table */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-blue-400" />
                <h3 className="text-sm font-bold text-white">Billing History & Invoices</h3>
              </div>
              <span className="text-xs text-slate-400">All transactions encrypted & verified</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5 px-4">Invoice #</th>
                    <th className="p-3.5 px-4">Date</th>
                    <th className="p-3.5 px-4">Plan Tier</th>
                    <th className="p-3.5 px-4">Amount</th>
                    <th className="p-3.5 px-4">Payment Method</th>
                    <th className="p-3.5 px-4">Status</th>
                    <th className="p-3.5 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {subscription.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5 px-4 font-mono font-bold text-slate-200">{inv.id}</td>
                      <td className="p-3.5 px-4 text-slate-400">{inv.date}</td>
                      <td className="p-3.5 px-4 font-bold text-white">{inv.planName}</td>
                      <td className="p-3.5 px-4 font-mono font-bold text-emerald-400">{inv.amount}</td>
                      <td className="p-3.5 px-4 text-slate-300">{inv.paymentMethod}</td>
                      <td className="p-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => toast.success(`Receipt for ${inv.id} downloaded successfully.`)}
                          className="text-blue-400 hover:text-blue-300 text-xs inline-flex items-center gap-1 font-bold cursor-pointer"
                        >
                          <Download size={12} />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: API ACCESS & QUOTA ────────────────────────────────── */}
      {activeTab === "apikeys" && (
        <div className="space-y-6 animate-fade-in">
          <div className="card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Key size={18} className="text-blue-400" />
                <h3 className="text-sm font-bold text-white">Programmatic API Key & Quota</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold font-mono">
                {currentPlan.specs.apiRequests}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Use this private key to query real-time market risk factor scores, liquidity depth metrics, and automated smart contract sandboxing.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Enclave Secret Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  readOnly
                  value="cr_live_sec_89598955_e128d62b62cf4c09"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("cr_live_sec_89598955_e128d62b62cf4c09");
                    toast.success("API key copied to clipboard.");
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  Copy Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PLAN SWITCH / UPGRADE MODAL ──────────────────────────────── */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1422] border border-blue-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Zap size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {targetPlanForSwitch.id === subscription.currentPlanId
                      ? "Update Payment Method"
                      : `Switch to ${targetPlanForSwitch.name}`}
                  </h3>
                  <p className="text-[11px] text-slate-400">Institutional Plan Activation & Enclave Sync</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSwitchModal(false)}
                className="text-slate-400 hover:text-white p-1 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{targetPlanForSwitch.name} Tier</p>
                  <p className="text-[11px] text-slate-400">
                    {isAnnualBilling ? "Annual Subscription (Save 20%)" : "Monthly Billing Cycle"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold font-mono text-blue-400">
                    ${isAnnualBilling ? targetPlanForSwitch.priceAnnual : targetPlanForSwitch.priceMonthly}
                    <span className="text-xs text-slate-400 font-normal">/mo</span>
                  </p>
                  {isAnnualBilling && targetPlanForSwitch.priceAnnual > 0 && (
                    <p className="text-[10px] text-emerald-400 font-bold">2 Months Free Included</p>
                  )}
                </div>
              </div>

              {/* Payment Method Selector */}
              {targetPlanForSwitch.priceMonthly > 0 && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Select Payment Method:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethodType("card")}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                        paymentMethodType === "card"
                          ? "bg-blue-600/20 border-blue-500 text-white"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <CreditCard size={16} />
                      <span>Credit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethodType("crypto")}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                        paymentMethodType === "crypto"
                          ? "bg-blue-600/20 border-blue-500 text-white"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Coins size={16} />
                      <span>Crypto (USDC)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethodType("invoice")}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                        paymentMethodType === "invoice"
                          ? "bg-blue-600/20 border-blue-500 text-white"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Building size={16} />
                      <span>Wire / Invoicing</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="font-bold text-slate-200">Enclave Provisioning Details:</p>
                <div className="flex items-center gap-2 text-slate-400">
                  <Check size={13} className="text-emerald-400" />
                  <span>Real-time upgrade to {targetPlanForSwitch.specs.telemetryRate}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Check size={13} className="text-emerald-400" />
                  <span>Enclave Latency: {targetPlanForSwitch.specs.enclaveLatency}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Check size={13} className="text-emerald-400" />
                  <span>Quota: {targetPlanForSwitch.specs.aiReportsQuota}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck size={15} className="flex-shrink-0" />
                <span>14-Day money-back guarantee. Instant activation across all enclaves.</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSwitchModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmPlanSwitch}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition cursor-pointer"
              >
                {isProcessing ? (
                  <span>Activating Enclaves...</span>
                ) : (
                  <>
                    <Lock size={13} />
                    <span>Confirm & Activate {targetPlanForSwitch.name}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
