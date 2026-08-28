"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUserPlan, PlanTierData } from "@/lib/context/UserPlanContext";
import {
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Cpu,
  Lock,
  ChevronDown,
  Building,
  Globe,
  Code2,
  Rss,
  Key,
  Search,
  Clock,
  BarChart3,
  Layers,
  Shield,
  Headphones,
  Minus,
  CreditCard,
  Coins,
  Receipt,
  CheckCircle2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

const FAQS = [
  {
    q: "How does the real-time AI forensic scoring work?",
    a: "CryptoRisk AI runs real-time heuristics across 7 distinct risk vectors: on-chain liquidity depth, smart contract bytecode integrity, top holder cluster concentration, developer commit velocity, live news sentiment causality, and orderbook slippage. These are processed through our low-latency enclave nodes powered by Gemini 3.7.",
  },
  {
    q: "Can I upgrade, downgrade, or cancel at any time?",
    a: "Yes. All plans are non-binding. If you choose annual billing, you receive an upfront 20% discount and 2 months complimentary. Downgrades take effect at the end of the current billing cycle.",
  },
  {
    q: "What is a Dedicated Enclave Node?",
    a: "Institutional and Sovereign tiers run on isolated confidential computing hardware (Intel SGX / AMD SEV) with private memory encryption, guaranteeing that your queried contracts, portfolio watchlists, and algorithmic triggers remain 100% confidential and leak-proof.",
  },
  {
    q: "How does the News Impact & Catalyst Causality model calculate projections?",
    a: "Our engine maps raw geopolitical, regulatory, and protocol news against historical crypto shock vectors. It calculates immediate liquidity shifts, validator response times, and sentiment velocity to generate realistic 30-day, 6-month, and 3-year scenario bounds.",
  },
  {
    q: "Do you offer custom API integrations for prop trading firms?",
    a: "Yes. Our Institutional and Sovereign tiers provide full high-frequency WebSocket streams, REST endpoints, and custom Webhook relays ready to plug directly into your risk-management bots and algorithmic execution engines.",
  },
  {
    q: "What payment methods are supported?",
    a: "We support major credit/debit cards (Visa, Mastercard, AMEX), corporate wire transfers, as well as decentralized crypto payments in USDC, USDT, and Bitcoin for annual subscriptions.",
  },
];

const COMPARISON_ROWS = [
  {
    icon: Globe,
    feature: "News sources",
    free: "300+",
    pro: "300+",
    enterprise: "Custom",
  },
  {
    icon: Code2,
    feature: "API access",
    free: true,
    pro: true,
    enterprise: true,
  },
  {
    icon: Rss,
    feature: "RSS/Atom feeds",
    free: true,
    pro: true,
    enterprise: true,
  },
  {
    icon: Shield,
    feature: "API key required",
    free: "No",
    pro: "Yes",
    enterprise: "Yes",
  },
  {
    icon: Search,
    feature: "Search & filtering",
    free: true,
    pro: true,
    enterprise: true,
  },
  {
    icon: Sparkles,
    feature: "AI analysis",
    free: false,
    pro: true,
    enterprise: true,
  },
  {
    icon: Clock,
    feature: "Historical archive",
    free: false,
    pro: "90 days",
    enterprise: "Unlimited",
  },
  {
    icon: BarChart3,
    feature: "Analytics dashboard",
    free: false,
    pro: true,
    enterprise: true,
  },
  {
    icon: Layers,
    feature: "Custom integrations",
    free: false,
    pro: false,
    enterprise: true,
  },
  {
    icon: ShieldCheck,
    feature: "SLA guarantee",
    free: false,
    pro: false,
    enterprise: "99.9%",
  },
  {
    icon: Headphones,
    feature: "Support",
    free: "Community",
    pro: "Priority",
    enterprise: "Dedicated",
  },
];

export default function PricingPage() {
  const { subscription, currentPlan, allPlans, purchasePlan } = useUserPlan();

  const [isAnnual, setIsAnnual] = useState(subscription.billingCycle === "annual");
  const [activeTier, setActiveTier] = useState<string>("pro");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanTierData>(allPlans[1]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Checkout State
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto" | "invoice">("card");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [cryptoToken, setCryptoToken] = useState<"USDC" | "USDT" | "ETH" | "SOL">("USDC");
  const [cryptoNetwork, setCryptoNetwork] = useState<"Arbitrum" | "Base" | "Ethereum" | "Solana">("Arbitrum");
  const [companyName, setCompanyName] = useState(subscription.organization || "Quantitative Research Desk");
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [generatedTxHash, setGeneratedTxHash] = useState("");

  const handleOpenCheckout = (plan: PlanTierData) => {
    setSelectedPlanForCheckout(plan);
    setPurchaseSuccess(false);
    setShowCheckoutModal(true);
  };

  const handleExecutePurchase = async () => {
    setIsProcessing(true);
    try {
      // Simulate live network step
      await new Promise((r) => setTimeout(r, 1200));

      const billing = isAnnual ? "annual" : "monthly";
      let paymentLabel = "Visa ending in 4242";
      if (paymentMethod === "crypto") {
        paymentLabel = `${cryptoToken} (${cryptoNetwork} Network)`;
      } else if (paymentMethod === "invoice") {
        paymentLabel = `${companyName} Corporate PO (Net 30)`;
      }

      await purchasePlan(selectedPlanForCheckout.id, billing, {
        type: paymentMethod,
        label: paymentLabel,
        last4: paymentMethod === "card" ? "4242" : undefined,
      });

      const randomTx = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setGeneratedTxHash(randomTx);
      setPurchaseSuccess(true);
    } catch {
      toast.error("Failed to complete transaction. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="pricing-page-container" className="space-y-12 pb-16">
      {/* ── Top Header Banner ────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Zap size={13} className="text-blue-400 animate-pulse" />
          <span>Institutional Forensic Surveillance</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Transparent Pricing for <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Every Scale</span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          From individual token researchers to high-frequency hedge funds: select the forensic throughput and enclave security grade designed for your trading capital.
        </p>

        {/* Current Plan Indicator Banner */}
        <div className="inline-flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-[#0f1422] border border-slate-800 text-xs shadow-lg">
          <span className="text-slate-400">Your Current Active Plan:</span>
          <span className="font-bold text-blue-400 font-mono uppercase bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
            {currentPlan.name}
          </span>
          <span className="text-slate-600">&bull;</span>
          <Link
            href="/settings"
            className="text-blue-400 hover:text-blue-300 font-semibold underline flex items-center gap-1"
          >
            <span>Manage in Account</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className={`text-xs font-bold transition ${!isAnnual ? "text-white" : "text-slate-400"}`}>
            Monthly
          </span>
          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 rounded-full bg-slate-800 p-1 relative border border-slate-700 transition focus:outline-none cursor-pointer"
          >
            <div
              className={`w-4 h-4 rounded-full bg-blue-500 transition-transform duration-200 ${
                isAnnual ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold transition ${isAnnual ? "text-white" : "text-slate-400"}`}>
              Annually
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
              Save 20% + 2 Mo Free
            </span>
          </div>
        </div>
      </div>

      {/* ── Pricing Cards Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {allPlans.map((plan) => {
          const isCurrent = plan.id === subscription.currentPlanId;
          const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              onClick={() => setActiveTier(plan.id)}
              className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 border cursor-pointer ${
                isCurrent
                  ? "bg-gradient-to-b from-[#141d33] to-[#0c111e] border-blue-500 shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500/40"
                  : plan.popular
                  ? "bg-gradient-to-b from-[#141b2d] to-[#0c101c] border-blue-500/50 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/30"
                  : "bg-[#0f141f]/90 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              {/* Top Badge */}
              {isCurrent ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white shadow-md flex items-center gap-1">
                    <Check size={11} /> CURRENT ACTIVE PLAN
                  </span>
                </div>
              ) : plan.badge ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
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

                <p className="text-slate-400 text-xs mb-4 min-h-[34px]">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mb-4 pb-4 border-b border-slate-800/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                      ${price}
                    </span>
                    <span className="text-slate-500 text-xs font-semibold">
                      {plan.priceMonthly === 0 ? "forever" : isAnnual ? "/mo (billed annually)" : "/month"}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Target: <span className="text-slate-300 font-medium">{plan.targetAudience}</span>
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Included Capabilities:
                  </p>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isCurrent ? (
                  <div className="space-y-2">
                    <div className="w-full py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={13} className="text-blue-400" />
                      <span>Current Plan (Active)</span>
                    </div>
                    <Link
                      href="/settings"
                      className="block text-center text-[11px] text-slate-400 hover:text-white transition"
                    >
                      Manage Plan in Account →
                    </Link>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCheckout(plan);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      plan.popular || plan.id === "institutional"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white"
                    }`}
                  >
                    <span>{plan.id === "explorer" ? "Select Free Plan" : `Buy ${plan.name} Plan`}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Feature Comparison Matrix ─────────────────────────────────── */}
      <div className="space-y-6 pt-4">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Compare Plan Specifications</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Granular breakdown of data limits, API access, and confidential enclave security</p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-[#0f141f]/70 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800">
                  <th className="p-4 px-6 text-slate-300 font-bold uppercase tracking-wider text-[11px] w-1/3">Feature</th>
                  <th className="p-4 px-6 text-slate-300 font-bold uppercase tracking-wider text-[11px] text-center">Explorer (Free)</th>
                  <th className="p-4 px-6 text-blue-400 font-bold uppercase tracking-wider text-[11px] text-center bg-blue-950/20">Pro Analyst</th>
                  <th className="p-4 px-6 text-purple-400 font-bold uppercase tracking-wider text-[11px] text-center">Institutional Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {COMPARISON_ROWS.map((row, idx) => {
                  const Icon = row.icon;
                  return (
                    <tr key={idx} className="hover:bg-slate-800/20 transition">
                      <td className="p-4 px-6 text-slate-200 flex items-center gap-3">
                        <span className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                          <Icon size={14} />
                        </span>
                        <span className="font-semibold">{row.feature}</span>
                      </td>

                      <td className="p-4 px-6 text-center text-slate-400">
                        {typeof row.free === "boolean" ? (
                          row.free ? (
                            <Check size={16} className="text-emerald-400 mx-auto" />
                          ) : (
                            <Minus size={16} className="text-slate-600 mx-auto" />
                          )
                        ) : (
                          row.free
                        )}
                      </td>

                      <td className="p-4 px-6 text-center text-slate-200 bg-blue-950/10 font-semibold">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? (
                            <Check size={16} className="text-emerald-400 mx-auto" />
                          ) : (
                            <Minus size={16} className="text-slate-600 mx-auto" />
                          )
                        ) : (
                          row.pro
                        )}
                      </td>

                      <td className="p-4 px-6 text-center text-slate-200">
                        {typeof row.enterprise === "boolean" ? (
                          row.enterprise ? (
                            <Check size={16} className="text-emerald-400 mx-auto" />
                          ) : (
                            <Minus size={16} className="text-slate-600 mx-auto" />
                          )
                        ) : (
                          row.enterprise
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Frequently Asked Questions ─────────────────────────────────── */}
      <div className="max-w-3xl mx-auto space-y-6 pt-4">
        <div className="text-center space-y-1 mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Direct answers regarding platform infrastructure, data guarantees & deployment</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200 hover:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-400" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BUY / CHECKOUT MODAL ───────────────────────────────────────── */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0e1424] border border-blue-500/40 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl space-y-0">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-blue-900/50 via-indigo-900/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
                  <Zap size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {purchaseSuccess ? "Purchase Confirmed & Activated" : `Subscribe to ${selectedPlanForCheckout.name}`}
                  </h3>
                  <p className="text-[11px] text-slate-400">Institutional Plan Gateway & Secure Enclave Node</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="text-slate-400 hover:text-white p-1 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {purchaseSuccess ? (
                /* Success State Screen */
                <div className="space-y-5 animate-fade-in text-center py-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                    <CheckCircle2 size={32} />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xl font-bold text-white">
                      Welcome to {selectedPlanForCheckout.name}!
                    </h4>
                    <p className="text-xs text-slate-300">
                      Your subscription is active. Your account enclaves and sub-second feeds are fully synchronized.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transaction ID:</span>
                      <span className="font-mono text-slate-200 font-bold">TX-2026-{(Math.random() * 10000).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Settlement Protocol:</span>
                      <span className="text-emerald-400 font-semibold">{paymentMethod.toUpperCase()} Instant Finality</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Node Quota:</span>
                      <span className="font-mono text-blue-400">{selectedPlanForCheckout.specs.aiReportsQuota}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <Link
                      href="/settings"
                      onClick={() => setShowCheckoutModal(false)}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center gap-1.5"
                    >
                      <span>View Account & Subscription</span>
                      <ArrowRight size={13} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowCheckoutModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 cursor-pointer"
                    >
                      Close Gateway
                    </button>
                  </div>
                </div>
              ) : (
                /* Interactive Purchase Form */
                <>
                  {/* Plan & Pricing Summary Box */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{selectedPlanForCheckout.name} Tier</p>
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                          {isAnnual ? "Annual (-20%)" : "Monthly"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{selectedPlanForCheckout.targetAudience}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-extrabold font-mono text-blue-400">
                        ${isAnnual ? selectedPlanForCheckout.priceAnnual : selectedPlanForCheckout.priceMonthly}
                        <span className="text-xs text-slate-400 font-normal">/mo</span>
                      </p>
                      {isAnnual && selectedPlanForCheckout.priceAnnual > 0 && (
                        <p className="text-[10px] text-emerald-400 font-bold">Total: ${(selectedPlanForCheckout.priceAnnual * 12).toFixed(2)}/yr</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  {selectedPlanForCheckout.priceMonthly > 0 && (
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Select Payment Method:
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("card")}
                          className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                            paymentMethod === "card"
                              ? "bg-blue-600/20 border-blue-500 text-white shadow-md"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <CreditCard size={18} />
                          <span>Credit Card</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("crypto")}
                          className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                            paymentMethod === "crypto"
                              ? "bg-blue-600/20 border-blue-500 text-white shadow-md"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Coins size={18} />
                          <span>Web3 Crypto</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("invoice")}
                          className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                            paymentMethod === "invoice"
                              ? "bg-blue-600/20 border-blue-500 text-white shadow-md"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Building size={18} />
                          <span>Corporate Wire</span>
                        </button>
                      </div>

                      {/* Payment Sub-form */}
                      {paymentMethod === "card" && (
                        <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 animate-fade-in">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Card Number</label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Expiration</label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase">CVC / CVV</label>
                              <input
                                type="text"
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value)}
                                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod === "crypto" && (
                        <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 animate-fade-in text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-semibold">Select Token & Network:</span>
                            <div className="flex gap-1.5">
                              {(["USDC", "USDT", "ETH"] as const).map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setCryptoToken(t)}
                                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                                    cryptoToken === t ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-[10px] text-slate-500 uppercase font-bold">Enclave Escrow Address (Arbitrum L2)</p>
                              <p className="font-mono text-slate-300 text-[11px]">0x71C...489F9c</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText("0x71C489F9c89598955e128d62b62cf4c09");
                                toast.success("Escrow address copied to clipboard.");
                              }}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        </div>
                      )}

                      {paymentMethod === "invoice" && (
                        <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 animate-fade-in text-xs">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Legal Entity Name</label>
                            <input
                              type="text"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Net-30 corporate invoicing generated with automatic tax deduction & VAT identification.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Guarantee & Privacy */}
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-[11px] flex items-center gap-2.5">
                    <ShieldCheck size={16} className="flex-shrink-0" />
                    <span>Instant provisioning with 14-day money-back guarantee. No lock-in contracts.</span>
                  </div>

                  {/* Footer Buttons */}
                  <div className="p-5 bg-slate-900/80 -mx-6 -mb-6 border-t border-slate-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCheckoutModal(false)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleExecutePurchase}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition cursor-pointer"
                    >
                      {isProcessing ? (
                        <span>Processing & Provisioning...</span>
                      ) : (
                        <>
                          <Lock size={13} />
                          <span>
                            {selectedPlanForCheckout.priceMonthly === 0
                              ? "Confirm Free Tier"
                              : `Complete Purchase ($${
                                  isAnnual
                                    ? (selectedPlanForCheckout.priceAnnual * 12).toFixed(2)
                                    : selectedPlanForCheckout.priceMonthly.toFixed(2)
                                })`}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
