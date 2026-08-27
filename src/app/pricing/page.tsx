"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

interface PlanTier {
  id: string;
  name: string;
  badge?: string;
  popular?: boolean;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  targetAudience: string;
  features: string[];
  ctaText: string;
  ctaStyle: string;
}

const PLANS: PlanTier[] = [
  {
    id: "explorer",
    name: "Explorer",
    priceMonthly: 0,
    priceAnnual: 0,
    description: "Essential cryptocurrency risk surveillance for retail researchers and personal traders.",
    targetAudience: "Individual traders & Web3 researchers",
    features: [
      "Top 20 Market Risk Radar surveillance",
      "10 AI forensic coin analyses per day",
      "Daily aggregated news sentiment polarity",
      "Standard 15-minute delayed market feeds",
      "Community Threat Wire alerts (Discord/Web)",
      "Standard risk scoring metrics",
    ],
    ctaText: "Get Started Free",
    ctaStyle: "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700",
  },
  {
    id: "pro",
    name: "Pro Analyst",
    popular: true,
    badge: "MOST POPULAR",
    priceMonthly: 49,
    priceAnnual: 39,
    description: "Full real-time streaming intelligence, contract sandboxing & unlimited AI forensic dossiers.",
    targetAudience: "Active traders, quants & DeFi operators",
    features: [
      "Sub-second real-time streaming price & risk ticker",
      "Unlimited Gemini 3.7 AI Coin Reports & Deep Memorandums",
      "Breaking News Catalyst Causality & 30d/6m/3y Projections",
      "Smart Contract Sandboxing (Honeypot, Mint, Blacklist)",
      "Real-time instant Telegram & Webhook Threat Alerts",
      "Whale distribution & top holder concentration audits",
      "Interactive Technical Indicator Charts & Volatility Bands",
    ],
    ctaText: "Upgrade to Pro",
    ctaStyle: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25",
  },
  {
    id: "institutional",
    name: "Institutional Desk",
    badge: "DESK GRADE",
    priceMonthly: 299,
    priceAnnual: 239,
    description: "Dedicated low-latency enclave node, portfolio VaR simulation & programmatic API access.",
    targetAudience: "Crypto hedge funds, family offices & prop desks",
    features: [
      "Dedicated High-Throughput Enclave Node (<12ms latency)",
      "Multi-wallet Portfolio VaR (Value-at-Risk) Stress Testing",
      "Private REST & WebSocket API (500,000 requests/month)",
      "Customizable Multi-Factor Risk Weighting Engines",
      "Exit Liquidity Depth & Slippage Collapse Simulator",
      "Historical Backtesting & Token Moat Degradation Alerts",
      "Direct 24/7 Quantitative Risk Engineering Hotline",
    ],
    ctaText: "Deploy Desk Tier",
    ctaStyle: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20",
  },
  {
    id: "enterprise",
    name: "Sovereign Enclave",
    badge: "CUSTOM INFRASTRUCTURE",
    priceMonthly: 1199,
    priceAnnual: 999,
    description: "Self-hosted hardware security enclaves, tailored sentinel AI models & compliance audits.",
    targetAudience: "Exchanges, prime brokers, sovereign funds & custodians",
    features: [
      "Hardware Security Module (HSM / SGX) Private Enclave",
      "Unlimited API Throughput & Bespoke On-Chain Ingestion",
      "Custom Fine-Tuned Sentinel LLM for Regulatory Compliance",
      "MiCA, FATF Travel Rule & Institutional Audit Exports",
      "Multi-seat Enterprise SSO & Role-Based Access Control",
      "99.99% Node Uptime SLA with Dedicated Risk Officer",
      "Bespoke Smart Contract Fuzzing & Protocol Stress Tests",
    ],
    ctaText: "Contact Institutional Sales",
    ctaStyle: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/20",
  },
];

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
  const [isAnnual, setIsAnnual] = useState(true);
  const [activeTier, setActiveTier] = useState<string>("pro");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanTier>(PLANS[1]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleOpenCheckout = (plan: PlanTier) => {
    setSelectedPlanForCheckout(plan);
    setShowCheckoutModal(true);
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

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <span className={`text-xs font-bold transition ${!isAnnual ? "text-white" : "text-slate-400"}`}>
            Monthly
          </span>
          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 rounded-full bg-slate-800 p-1 relative border border-slate-700 transition focus:outline-none"
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
        {PLANS.map((plan) => {
          const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              onClick={() => setActiveTier(plan.id)}
              className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 border cursor-pointer ${
                plan.popular
                  ? "bg-gradient-to-b from-[#141b2d] to-[#0c101c] border-blue-500/50 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/30"
                  : "bg-[#0f141f]/90 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              {/* Optional Top Badge */}
              {plan.badge && (
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
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
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
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenCheckout(plan);
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${plan.ctaStyle}`}
              >
                <span>{plan.ctaText}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Feature Comparison Matrix (Matching Screenshot) ───────────── */}
      <div className="max-w-5xl mx-auto space-y-6 pt-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Feature Comparison
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            See exactly what&apos;s included in each plan.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#090d16]/90 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="py-4 pl-6 pr-4 text-xs font-semibold text-slate-400 w-2/5">
                    Feature
                  </th>
                  <th className="py-4 px-4 text-center w-1/5">
                    <span className="text-sm font-bold text-[#38bdf8] block">
                      Free
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      $0/forever
                    </span>
                  </th>
                  <th className="py-4 px-4 text-center w-1/5">
                    <span className="text-sm font-bold text-[#a855f7] block">
                      Pro
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {isAnnual ? "$39/mo" : "$49/mo"}
                    </span>
                  </th>
                  <th className="py-4 px-4 pr-6 text-center w-1/5">
                    <span className="text-sm font-bold text-[#f59e0b] block">
                      Enterprise
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Custom
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {COMPARISON_ROWS.map((row, idx) => {
                  const Icon = row.icon;
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Feature column */}
                      <td className="py-3.5 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <Icon
                            size={15}
                            className="text-slate-400 flex-shrink-0"
                          />
                          <span className="text-xs text-slate-200 font-medium">
                            {row.feature}
                          </span>
                        </div>
                      </td>

                      {/* Free Plan */}
                      <td className="py-3.5 px-4 text-center">
                        {typeof row.free === "boolean" ? (
                          row.free ? (
                            <Check
                              size={16}
                              className="text-emerald-400 mx-auto"
                            />
                          ) : (
                            <span className="text-slate-600 font-mono text-base select-none">
                              —
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-slate-300 font-medium">
                            {row.free}
                          </span>
                        )}
                      </td>

                      {/* Pro Plan */}
                      <td className="py-3.5 px-4 text-center">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? (
                            <Check
                              size={16}
                              className="text-emerald-400 mx-auto"
                            />
                          ) : (
                            <span className="text-slate-600 font-mono text-base select-none">
                              —
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-slate-300 font-medium">
                            {row.pro}
                          </span>
                        )}
                      </td>

                      {/* Enterprise Plan */}
                      <td className="py-3.5 px-4 pr-6 text-center">
                        {typeof row.enterprise === "boolean" ? (
                          row.enterprise ? (
                            <Check
                              size={16}
                              className="text-emerald-400 mx-auto"
                            />
                          ) : (
                            <span className="text-slate-600 font-mono text-base select-none">
                              —
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-slate-300 font-medium">
                            {row.enterprise}
                          </span>
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

      {/* ── Frequently Asked Questions (Only) ─────────────────────────── */}
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
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200 hover:text-white"
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

      {/* ── Checkout & Upgrade Simulator Modal ──────────────────────── */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1422] border border-blue-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Zap size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Institutional Plan Activation</h3>
                  <p className="text-[11px] text-slate-400">CryptoRisk AI Enclave Telemetry</p>
                </div>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-slate-400 hover:text-white p-1 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{selectedPlanForCheckout.name} Tier</p>
                  <p className="text-[11px] text-slate-400">{isAnnual ? "Annual Subscription (Billed Yearly)" : "Monthly Billing"}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold font-mono text-blue-400">
                    ${isAnnual ? selectedPlanForCheckout.priceAnnual : selectedPlanForCheckout.priceMonthly}
                    <span className="text-xs text-slate-400 font-normal">/mo</span>
                  </p>
                  {isAnnual && (
                    <p className="text-[10px] text-emerald-400 font-bold">2 Months Free Included</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p className="font-bold text-slate-200">Enclave Provisioning Details:</p>
                <div className="flex items-center gap-2 text-slate-400">
                  <Check size={13} className="text-emerald-400" />
                  <span>Instant access to Sub-Second Live Price & Volatility Tape</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Check size={13} className="text-emerald-400" />
                  <span>Full Gemini 3.7 Breaking News Causality Breakdown</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Check size={13} className="text-emerald-400" />
                  <span>Dedicated Sandbox Smart Contract Execution Slot</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck size={15} className="flex-shrink-0" />
                <span>14-Day Full Money-Back Guarantee & Cancel Anytime. No lock-in contracts.</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Plan "${selectedPlanForCheckout.name}" simulated checkout successfully activated!`);
                  setShowCheckoutModal(false);
                }}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition"
              >
                <Lock size={13} />
                <span>Confirm & Activate {selectedPlanForCheckout.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
