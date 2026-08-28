"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface PlanFeatureItem {
  name: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanTierData {
  id: "explorer" | "pro" | "institutional" | "enterprise";
  name: string;
  badge?: string;
  popular?: boolean;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  targetAudience: string;
  features: string[];
  specs: {
    telemetryRate: string;
    aiReportsQuota: string;
    enclaveLatency: string;
    apiRequests: string;
    sandboxing: string;
    support: string;
  };
  ctaText: string;
  ctaStyle: string;
}

export const ALL_PLANS: PlanTierData[] = [
  {
    id: "explorer",
    name: "Explorer",
    priceMonthly: 0,
    priceAnnual: 0,
    description: "Essential cryptocurrency risk surveillance for retail researchers and personal traders.",
    targetAudience: "Individual traders & Web3 researchers",
    specs: {
      telemetryRate: "15-minute polling updates",
      aiReportsQuota: "10 AI Forensic Scans / Day",
      enclaveLatency: "Standard Shared Queue (~120ms)",
      apiRequests: "Community Endpoints (Rate Limited)",
      sandboxing: "Basic Static Bytecode Check",
      support: "Community Discord & Web Support",
    },
    features: [
      "Top 20 Market Risk Radar surveillance",
      "10 AI forensic coin analyses per day",
      "Daily aggregated news sentiment polarity",
      "Standard 15-minute delayed market feeds",
      "Community Threat Wire alerts (Discord/Web)",
      "Standard risk scoring & volatility metrics",
    ],
    ctaText: "Get Started Free",
    ctaStyle: "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700",
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
    specs: {
      telemetryRate: "Sub-second Micro-Tick WebSockets",
      aiReportsQuota: "Unlimited Gemini 3.7 AI Reports",
      enclaveLatency: "Accelerated Enclave Node (<35ms)",
      apiRequests: "50,000 Private REST Requests/mo",
      sandboxing: "Full Honeypot, Mint & Blacklist Sandbox",
      support: "Priority 24/7 Desk Email & Telegram",
    },
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
    specs: {
      telemetryRate: "Direct Memory Node Stream (<1.8s)",
      aiReportsQuota: "Unlimited High-Concurrency AI Dossiers",
      enclaveLatency: "Dedicated Hardware Enclave (<12ms)",
      apiRequests: "500,000 API Requests/month",
      sandboxing: "Full Bytecode Decompilation & Assembly Fuzzing",
      support: "Dedicated Quantitative Risk Engineering Hotline",
    },
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
    specs: {
      telemetryRate: "Bespoke Raw Mempool & Private RPC",
      aiReportsQuota: "Custom Fine-Tuned Sentinel LLM",
      enclaveLatency: "Isolated Bare-Metal HSM Enclave (<5ms)",
      apiRequests: "Unlimited Programmatic Throughput",
      sandboxing: "Automated Protocol Fuzzing & Exploit Emulation",
      support: "Dedicated Principal Security Officer & 99.99% SLA",
    },
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

export interface InvoiceRecord {
  id: string;
  date: string;
  planName: string;
  amount: string;
  billing: "monthly" | "annual";
  status: "PAID" | "ACTIVE";
  paymentMethod: string;
  receiptUrl: string;
}

export interface UserSubscriptionState {
  currentPlanId: "explorer" | "pro" | "institutional" | "enterprise";
  billingCycle: "monthly" | "annual";
  status: "active" | "trial" | "past_due";
  userEmail: string;
  userId: string;
  organization: string;
  subscribedSince: string;
  renewalDate: string;
  paymentMethod: {
    type: "card" | "crypto" | "invoice";
    label: string;
    last4?: string;
  };
  invoices: InvoiceRecord[];
}

interface UserPlanContextType {
  subscription: UserSubscriptionState;
  currentPlan: PlanTierData;
  allPlans: PlanTierData[];
  purchasePlan: (
    planId: "explorer" | "pro" | "institutional" | "enterprise",
    billing: "monthly" | "annual",
    paymentDetails?: {
      type: "card" | "crypto" | "invoice";
      label: string;
      last4?: string;
    }
  ) => Promise<boolean>;
  cancelSubscription: () => void;
  setUserEmail: (email: string) => void;
}

const DEFAULT_SUBSCRIPTION: UserSubscriptionState = {
  currentPlanId: "pro",
  billingCycle: "annual",
  status: "active",
  userEmail: "akhilesh_2024bcse001@nitsri.ac.in",
  userId: "usr_inst_89598955",
  organization: "Quantitative Research Group",
  subscribedSince: "Jan 15, 2026",
  renewalDate: "Jan 15, 2027",
  paymentMethod: {
    type: "card",
    label: "Visa ending in 4242",
    last4: "4242",
  },
  invoices: [
    {
      id: "INV-2026-089",
      date: "Jan 15, 2026",
      planName: "Pro Analyst (Annual)",
      amount: "$468.00",
      billing: "annual",
      status: "PAID",
      paymentMethod: "Visa •••• 4242",
      receiptUrl: "#",
    },
  ],
};

const UserPlanContext = createContext<UserPlanContextType | undefined>(undefined);

const STORAGE_KEY = "cryptovision_user_plan_v2";

export function UserPlanProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<UserSubscriptionState>(DEFAULT_SUBSCRIPTION);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSubscription((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore parse error
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscription));
    } catch {
      // Ignore
    }
  }, [subscription, isInitialized]);

  const currentPlan =
    ALL_PLANS.find((p) => p.id === subscription.currentPlanId) || ALL_PLANS[1];

  const purchasePlan = useCallback(
    async (
      planId: "explorer" | "pro" | "institutional" | "enterprise",
      billing: "monthly" | "annual",
      paymentDetails?: {
        type: "card" | "crypto" | "invoice";
        label: string;
        last4?: string;
      }
    ): Promise<boolean> => {
      const targetPlan = ALL_PLANS.find((p) => p.id === planId);
      if (!targetPlan) return false;

      const price = billing === "annual" ? targetPlan.priceAnnual * 12 : targetPlan.priceMonthly;
      const priceFormatted = targetPlan.priceMonthly === 0 ? "$0.00" : `$${price.toFixed(2)}`;

      const newInvoice: InvoiceRecord = {
        id: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        planName: `${targetPlan.name} (${billing === "annual" ? "Annual" : "Monthly"})`,
        amount: priceFormatted,
        billing: billing,
        status: "PAID",
        paymentMethod: paymentDetails?.label || "Institutional Billing",
        receiptUrl: "#",
      };

      const now = new Date();
      const renewal = new Date();
      if (billing === "annual") {
        renewal.setFullYear(now.getFullYear() + 1);
      } else {
        renewal.setMonth(now.getMonth() + 1);
      }

      setSubscription((prev) => ({
        ...prev,
        currentPlanId: planId,
        billingCycle: billing,
        status: "active",
        renewalDate: renewal.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        paymentMethod: paymentDetails || prev.paymentMethod,
        invoices: [newInvoice, ...prev.invoices],
      }));

      toast.success(`Successfully activated the ${targetPlan.name} tier!`, {
        description: `Your account is now upgraded with all ${targetPlan.name} features and low-latency enclaves.`,
      });

      return true;
    },
    []
  );

  const cancelSubscription = useCallback(() => {
    setSubscription((prev) => ({
      ...prev,
      currentPlanId: "explorer",
      billingCycle: "monthly",
      status: "active",
    }));
    toast.info("Subscription downgraded to Explorer Free tier.");
  }, []);

  const setUserEmail = useCallback((email: string) => {
    setSubscription((prev) => ({ ...prev, userEmail: email }));
  }, []);

  return (
    <UserPlanContext.Provider
      value={{
        subscription,
        currentPlan,
        allPlans: ALL_PLANS,
        purchasePlan,
        cancelSubscription,
        setUserEmail,
      }}
    >
      {children}
    </UserPlanContext.Provider>
  );
}

export function useUserPlan() {
  const context = useContext(UserPlanContext);
  if (!context) {
    throw new Error("useUserPlan must be used within a UserPlanProvider");
  }
  return context;
}
