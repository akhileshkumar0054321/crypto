"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Layers,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Search,
  Globe,
  Lock,
  Cpu,
  ArrowUpRight,
  Copy,
  Check,
  Sliders,
  Sparkles,
  Link2,
  Radio,
  Share2,
} from "lucide-react";
import Link from "next/link";

export interface ChainMetadata {
  name: string;
  symbol: string;
  category: "Layer 1" | "Layer 2 Rollup" | "Sidechain" | "AppChain";
  type: string;
  nativeGasToken: string;
  consensus: string;
  avgBlockTime: string;
  finality: string;
  tpsCapacity: string;
  evmCompatible: boolean;
  explorerUrl: string;
  explorerName: string;
  securityLevel: "Institutional L1" | "Ethereum L1 Settlement" | "Decentralized PoS" | "High-Throughput SVM";
  color: string;
  bgGradient: string;
  borderAccent: string;
  description: string;
  tvlShareEstimate?: string;
}

// Chain Database
export const CHAIN_REGISTRY: Record<string, ChainMetadata> = {
  Ethereum: {
    name: "Ethereum",
    symbol: "ETH",
    category: "Layer 1",
    type: "Decentralized Smart Contract L1",
    nativeGasToken: "ETH (Gwei)",
    consensus: "Proof of Stake (Casper FFG + LMD GHOST)",
    avgBlockTime: "12.0 seconds",
    finality: "~12.8 minutes (2 epochs)",
    tpsCapacity: "15 - 30 TPS",
    evmCompatible: true,
    explorerUrl: "https://etherscan.io",
    explorerName: "Etherscan",
    securityLevel: "Institutional L1",
    color: "text-blue-400",
    bgGradient: "from-blue-600/20 via-indigo-900/30 to-[#0c101d]",
    borderAccent: "border-blue-500/40",
    description: "The primary settlement and liquidity layer for decentralized finance with the deepest economic security.",
    tvlShareEstimate: "60-70% Dominant Pool",
  },
  Solana: {
    name: "Solana",
    symbol: "SOL",
    category: "Layer 1",
    type: "High-Throughput Monolithic L1",
    nativeGasToken: "SOL (Lamports)",
    consensus: "Proof of History (PoH) + Tower BFT",
    avgBlockTime: "400 milliseconds",
    finality: "~400ms - 1.2s",
    tpsCapacity: "2,500 - 65,000 TPS",
    evmCompatible: false,
    explorerUrl: "https://solscan.io",
    explorerName: "Solscan",
    securityLevel: "High-Throughput SVM",
    color: "text-purple-400",
    bgGradient: "from-purple-600/20 via-fuchsia-900/30 to-[#0c101d]",
    borderAccent: "border-purple-500/40",
    description: "Ultra-fast execution layer utilizing Sealevel parallel smart contract runtime and low sub-cent fees.",
    tvlShareEstimate: "High Velocity Volume",
  },
  Base: {
    name: "Base",
    symbol: "BASE",
    category: "Layer 2 Rollup",
    type: "Optimistic Rollup (OP Stack)",
    nativeGasToken: "ETH",
    consensus: "Optimistic Fraud Proofs + L1 Ethereum Settlement",
    avgBlockTime: "2.0 seconds",
    finality: "~2.0s soft / 7d L1 challenge",
    tpsCapacity: "100 - 250 TPS",
    evmCompatible: true,
    explorerUrl: "https://basescan.org",
    explorerName: "BaseScan",
    securityLevel: "Ethereum L1 Settlement",
    color: "text-cyan-400",
    bgGradient: "from-cyan-600/20 via-blue-900/30 to-[#0c101d]",
    borderAccent: "border-cyan-500/40",
    description: "Coinbase-incubated Ethereum Layer 2 designed for mass-consumer onboarding and seamless on-ramp liquidity.",
    tvlShareEstimate: "Rapid Retail Growth",
  },
  Arbitrum: {
    name: "Arbitrum One",
    symbol: "ARB",
    category: "Layer 2 Rollup",
    type: "Optimistic Rollup (Nitro)",
    nativeGasToken: "ETH",
    consensus: "Multi-round Interactive Fraud Proofs + L1 Settlement",
    avgBlockTime: "250 milliseconds",
    finality: "Instant soft / 7d L1 challenge",
    tpsCapacity: "400 - 1,000 TPS",
    evmCompatible: true,
    explorerUrl: "https://arbiscan.io",
    explorerName: "Arbiscan",
    securityLevel: "Ethereum L1 Settlement",
    color: "text-sky-400",
    bgGradient: "from-sky-600/20 via-blue-950/30 to-[#0c101d]",
    borderAccent: "border-sky-500/40",
    description: "The leading Ethereum Layer 2 by TVL with deep perpetual futures and decentralized liquidity markets.",
    tvlShareEstimate: "Top L2 Liquidity",
  },
  BSC: {
    name: "BNB Smart Chain",
    symbol: "BNB",
    category: "Layer 1",
    type: "EVM-Compatible High Capacity L1",
    nativeGasToken: "BNB",
    consensus: "Proof of Staked Authority (PoSA)",
    avgBlockTime: "3.0 seconds",
    finality: "~3.0s Fast",
    tpsCapacity: "150 - 300 TPS",
    evmCompatible: true,
    explorerUrl: "https://bscscan.com",
    explorerName: "BscScan",
    securityLevel: "Decentralized PoS",
    color: "text-amber-400",
    bgGradient: "from-amber-600/20 via-yellow-900/30 to-[#0c101d]",
    borderAccent: "border-amber-500/40",
    description: "High-volume smart contract chain with massive retail user base and low gas transaction barriers.",
    tvlShareEstimate: "Heavy Retail Flow",
  },
  Avalanche: {
    name: "Avalanche C-Chain",
    symbol: "AVAX",
    category: "Layer 1",
    type: "Multi-Subnet Snow Consensus L1",
    nativeGasToken: "AVAX",
    consensus: "Avalanche Snow Consensus (Sub-sampled Voting)",
    avgBlockTime: "1.0 second",
    finality: "< 1.0s Sub-Second Finality",
    tpsCapacity: "4,500 TPS",
    evmCompatible: true,
    explorerUrl: "https://snowtrace.io",
    explorerName: "Snowtrace",
    securityLevel: "Decentralized PoS",
    color: "text-rose-400",
    bgGradient: "from-rose-600/20 via-red-950/30 to-[#0c101d]",
    borderAccent: "border-rose-500/40",
    description: "Instant-finality blockchain platform designed for scalable enterprise subnets and custom DeFi appchains.",
    tvlShareEstimate: "Enterprise & Subnets",
  },
  Polygon: {
    name: "Polygon POS",
    symbol: "POL",
    category: "Sidechain",
    type: "EVM Proof of Stake Sidechain / AggLayer",
    nativeGasToken: "POL (formerly MATIC)",
    consensus: "Bor Block Producer + Heimdall PoS Checkpointing",
    avgBlockTime: "2.1 seconds",
    finality: "~2.1s soft / L1 State Sync",
    tpsCapacity: "1,000 TPS",
    evmCompatible: true,
    explorerUrl: "https://polygonscan.com",
    explorerName: "PolygonScan",
    securityLevel: "Decentralized PoS",
    color: "text-violet-400",
    bgGradient: "from-violet-600/20 via-purple-950/30 to-[#0c101d]",
    borderAccent: "border-violet-500/40",
    description: "Established scaling platform transitioning into a unified zero-knowledge aggregated multi-chain network.",
    tvlShareEstimate: "High Micro-Tx Count",
  },
  Tron: {
    name: "TRON",
    symbol: "TRX",
    category: "Layer 1",
    type: "Delegated PoS Global Payment L1",
    nativeGasToken: "TRX (Sun / Energy)",
    consensus: "Delegated Proof of Stake (DPoS 27 Super Representatives)",
    avgBlockTime: "3.0 seconds",
    finality: "~3.0s",
    tpsCapacity: "2,000 TPS",
    evmCompatible: true,
    explorerUrl: "https://tronscan.org",
    explorerName: "Tronscan",
    securityLevel: "Decentralized PoS",
    color: "text-red-400",
    bgGradient: "from-red-600/20 via-orange-950/30 to-[#0c101d]",
    borderAccent: "border-red-500/40",
    description: "The world's highest-volume settlement network for USDT stablecoin transfers and global remittances.",
    tvlShareEstimate: "USDT Settlement Hub",
  },
  Optimism: {
    name: "OP Mainnet",
    symbol: "OP",
    category: "Layer 2 Rollup",
    type: "Optimistic Rollup (Superchain)",
    nativeGasToken: "ETH",
    consensus: "Optimistic Fault Proofs + L1 Settlement",
    avgBlockTime: "2.0 seconds",
    finality: "2.0s soft / 7d L1 challenge",
    tpsCapacity: "150 TPS",
    evmCompatible: true,
    explorerUrl: "https://optimistic.etherscan.io",
    explorerName: "OP Etherscan",
    securityLevel: "Ethereum L1 Settlement",
    color: "text-red-400",
    bgGradient: "from-red-600/20 via-rose-950/30 to-[#0c101d]",
    borderAccent: "border-red-500/40",
    description: "Core Superchain rollup powering interconnected Layer 2 ecosystems with shared governance and messaging.",
    tvlShareEstimate: "Superchain Hub",
  },
  Sui: {
    name: "Sui Network",
    symbol: "SUI",
    category: "Layer 1",
    type: "Object-Centric Move VM L1",
    nativeGasToken: "SUI (MIST)",
    consensus: "Mysticeti + Narwhal Consensus (Parallel Execution)",
    avgBlockTime: "400 milliseconds",
    finality: "~390ms Sub-Second Finality",
    tpsCapacity: "297,000 TPS Peak",
    evmCompatible: false,
    explorerUrl: "https://suiscan.xyz",
    explorerName: "Suiscan",
    securityLevel: "High-Throughput SVM",
    color: "text-blue-400",
    bgGradient: "from-blue-600/20 via-cyan-950/30 to-[#0c101d]",
    borderAccent: "border-blue-500/40",
    description: "Next-gen Move-based smart contract platform enabling asset composability and instant parallel execution.",
    tvlShareEstimate: "Fast Move Liquidity",
  },
  Aptos: {
    name: "Aptos",
    symbol: "APT",
    category: "Layer 1",
    type: "Parallel Move VM L1",
    nativeGasToken: "APT",
    consensus: "AptosBFT (DiemBFT v4) + Block-STM",
    avgBlockTime: "500 milliseconds",
    finality: "< 1.0s",
    tpsCapacity: "160,000 TPS",
    evmCompatible: false,
    explorerUrl: "https://aptoscan.com",
    explorerName: "Aptoscan",
    securityLevel: "High-Throughput SVM",
    color: "text-teal-400",
    bgGradient: "from-teal-600/20 via-emerald-950/30 to-[#0c101d]",
    borderAccent: "border-teal-500/40",
    description: "Safe, production-grade Move blockchain built for high concurrency and sub-second deterministic settlement.",
    tvlShareEstimate: "Move Ecosystem",
  },
  Near: {
    name: "NEAR Protocol",
    symbol: "NEAR",
    category: "Layer 1",
    type: "Sharded Dynamic Proof of Stake",
    nativeGasToken: "NEAR",
    consensus: "Nightshade Dynamic Sharding + Doomslug",
    avgBlockTime: "1.2 seconds",
    finality: "1-2 seconds",
    tpsCapacity: "100,000+ TPS (Sharded)",
    evmCompatible: false,
    explorerUrl: "https://nearblocks.io",
    explorerName: "Nearblocks",
    securityLevel: "Decentralized PoS",
    color: "text-emerald-400",
    bgGradient: "from-emerald-600/20 via-teal-950/30 to-[#0c101d]",
    borderAccent: "border-emerald-500/40",
    description: "User-friendly sharded blockchain with chain abstraction and account abstraction primitives.",
    tvlShareEstimate: "Chain Abstraction",
  },
  Blast: {
    name: "Blast",
    symbol: "BLAST",
    category: "Layer 2 Rollup",
    type: "Native Yield Optimistic Rollup",
    nativeGasToken: "ETH",
    consensus: "Optimistic Fraud Proofs + L1 Yield Staking",
    avgBlockTime: "2.0 seconds",
    finality: "2.0s soft / 7d L1 challenge",
    tpsCapacity: "100 TPS",
    evmCompatible: true,
    explorerUrl: "https://blastscan.io",
    explorerName: "BlastScan",
    securityLevel: "Ethereum L1 Settlement",
    color: "text-yellow-400",
    bgGradient: "from-yellow-600/20 via-amber-950/30 to-[#0c101d]",
    borderAccent: "border-yellow-500/40",
    description: "Ethereum Layer 2 with native yield for ETH and stablecoins built directly into the protocol bridge.",
    tvlShareEstimate: "Native Yield",
  },
  Fantom: {
    name: "Sonic / Fantom",
    symbol: "S / FTM",
    category: "Layer 1",
    type: "Lachesis aBFT High-Speed L1",
    nativeGasToken: "S (Sonic)",
    consensus: "Lachesis Asynchronous BFT",
    avgBlockTime: "700 milliseconds",
    finality: "~700ms True Finality",
    tpsCapacity: "10,000 TPS",
    evmCompatible: true,
    explorerUrl: "https://sonicscan.org",
    explorerName: "SonicScan",
    securityLevel: "Decentralized PoS",
    color: "text-cyan-400",
    bgGradient: "from-cyan-600/20 via-blue-950/30 to-[#0c101d]",
    borderAccent: "border-cyan-500/40",
    description: "Next-generation ultra-fast EVM chain delivering sub-second finality and high-frequency trading performance.",
    tvlShareEstimate: "High Speed EVM",
  },
  Cronos: {
    name: "Cronos",
    symbol: "CRO",
    category: "Layer 1",
    type: "Cosmos SDK + Ethermint EVM",
    nativeGasToken: "CRO",
    consensus: "Tendermint Proof of Authority (PoA / PoS)",
    avgBlockTime: "5.5 seconds",
    finality: "Instant Tendermint Finality",
    tpsCapacity: "100 TPS",
    evmCompatible: true,
    explorerUrl: "https://cronoscan.com",
    explorerName: "Cronoscan",
    securityLevel: "Decentralized PoS",
    color: "text-blue-400",
    bgGradient: "from-blue-600/20 via-indigo-950/30 to-[#0c101d]",
    borderAccent: "border-blue-500/40",
    description: "Crypto.com ecosystem chain bridging EVM dApps with Cosmos Inter-Blockchain Communication (IBC).",
    tvlShareEstimate: "Cosmos-EVM Bridge",
  },
};

// Fallback helper for any unrecognized chain
export function getChainInfo(chainName: string): ChainMetadata {
  const clean = chainName.trim();
  if (CHAIN_REGISTRY[clean]) return CHAIN_REGISTRY[clean];

  // Fuzzy match
  const found = Object.keys(CHAIN_REGISTRY).find(
    (k) => k.toLowerCase() === clean.toLowerCase() || clean.toLowerCase().includes(k.toLowerCase())
  );
  if (found) return CHAIN_REGISTRY[found];

  // Default generic chain
  return {
    name: clean || "Blockchain Network",
    symbol: clean.slice(0, 4).toUpperCase(),
    category: "Layer 1",
    type: "Decentralized Blockchain Network",
    nativeGasToken: `${clean.toUpperCase()} Gas`,
    consensus: "Proof of Stake (PoS)",
    avgBlockTime: "2.0 - 5.0 seconds",
    finality: "~3.0 seconds",
    tpsCapacity: "500+ TPS",
    evmCompatible: true,
    explorerUrl: `https://www.google.com/search?q=${encodeURIComponent(clean + " block explorer")}`,
    explorerName: `${clean} Explorer`,
    securityLevel: "Decentralized PoS",
    color: "text-emerald-400",
    bgGradient: "from-emerald-600/20 via-slate-900 to-[#0c101d]",
    borderAccent: "border-emerald-500/40",
    description: `Decentralized smart contract blockchain hosting native liquidity and decentralized asset deployments.`,
    tvlShareEstimate: "Ecosystem Deployment",
  };
}

interface ChainFlashCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: {
    name: string;
    symbol?: string;
    logo?: string;
    chains: string[];
    category?: string;
    tvl?: number | string;
    typeLabel?: string;
  } | null;
}

export function ChainFlashCardModal({
  isOpen,
  onClose,
  targetItem,
}: ChainFlashCardModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "grid">("card");
  const [searchFilter, setSearchFilter] = useState("");
  const [copiedChain, setCopiedChain] = useState<string | null>(null);

  // Normalize chains list
  const chains = useMemo(() => {
    if (!targetItem || !targetItem.chains || targetItem.chains.length === 0) {
      return ["Ethereum"];
    }
    return targetItem.chains;
  }, [targetItem]);

  // Filtered chains
  const filteredChains = useMemo(() => {
    if (!searchFilter.trim()) return chains;
    const q = searchFilter.toLowerCase();
    return chains.filter((c) => c.toLowerCase().includes(q));
  }, [chains, searchFilter]);

  // Reset index when opening or changing target
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsFlipped(false);
      setSearchFilter("");
    }
  }, [isOpen, targetItem]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" && viewMode === "card") {
        setCurrentIndex((prev) => (prev + 1) % filteredChains.length);
        setIsFlipped(false);
      } else if (e.key === "ArrowLeft" && viewMode === "card") {
        setCurrentIndex((prev) => (prev - 1 + filteredChains.length) % filteredChains.length);
        setIsFlipped(false);
      } else if (e.key === " " && viewMode === "card") {
        e.preventDefault();
        setIsFlipped((f) => !f);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, viewMode, filteredChains.length, onClose]);

  if (!isOpen || !targetItem) return null;

  const currentChainName = filteredChains[currentIndex] || chains[0] || "Ethereum";
  const currentChain = getChainInfo(currentChainName);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChain(id);
    setTimeout(() => setCopiedChain(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#090d16] border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header ──────────────────────────────────────────────────────── */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 bg-gradient-to-r from-[#0d1424] via-[#090d18] to-[#0d1424] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 p-0.5 overflow-hidden flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/20">
              {targetItem.logo ? (
                <img
                  src={targetItem.logo}
                  alt={targetItem.name}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as any).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-xs font-mono font-black text-emerald-400">
                  {targetItem.symbol?.slice(0, 3) || targetItem.name.slice(0, 3)}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 flex items-center gap-1">
                  <Link2 size={11} />
                  <span>MULTI-CHAIN DEPLOYMENT FLASH CARD</span>
                </span>
                {targetItem.category && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {targetItem.category}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mt-1">
                <span>{targetItem.name}</span>
                {targetItem.symbol && (
                  <span className="text-sm font-mono text-slate-400 font-normal">
                    ({targetItem.symbol})
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "card"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers size={13} />
                <span>Card Deck</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sliders size={13} />
                <span>Grid View ({chains.length})</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
              title="Close Flash Card"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Subheader Banner (Total Chains & Filter) ────────────────────────── */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#070a12] border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-300">
              Active Deployments:
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono font-bold border border-emerald-500/30">
              {chains.length} Blockchain Networks
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Click &apos;Flip Card&apos; or press Spacebar for security telemetry
            </span>
          </div>

          <div className="relative w-full sm:w-56">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search chain..."
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setCurrentIndex(0);
              }}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* ── Modal Body Content ──────────────────────────────────────────────── */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {viewMode === "card" ? (
            /* ═════════════════════════════════════════════════════════════════ */
            /* FLASH CARD INTERACTIVE DECK MODE                                  */
            /* ═════════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              {/* Chain Selector Pill Track */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {filteredChains.map((cName, idx) => {
                  const meta = getChainInfo(cName);
                  const isSelected = idx === currentIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsFlipped(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-2 border ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30 scale-105"
                          : "bg-[#0b0f19] text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : meta.color}`} />
                      <span>{cName}</span>
                      <span className="text-[10px] opacity-70">
                        {meta.category.includes("Rollup") ? "L2" : "L1"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Main Flash Card Viewport */}
              <div className="relative perspective-1000">
                <div
                  className={`w-full min-h-[360px] rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${currentChain.bgGradient} border ${currentChain.borderAccent} shadow-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group`}
                >
                  {/* Decorative Watermark Background */}
                  <div className="absolute right-4 -bottom-6 text-slate-700/10 font-mono font-black text-8xl pointer-events-none select-none">
                    {currentChain.symbol}
                  </div>

                  {!isFlipped ? (
                    /* ── CARD FRONT: SPECS & NETWORK ARCHITECTURE ───────────── */
                    <div className="space-y-6 relative z-10">
                      {/* Top Bar */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-white font-mono text-[11px] font-bold border border-white/20">
                              {currentChain.category}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
                              {currentChain.evmCompatible ? "EVM COMPATIBLE" : "NON-EVM / CUSTOM VM"}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold">
                              {currentChain.securityLevel}
                            </span>
                          </div>
                          <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3 mt-2">
                            <span>{currentChain.name}</span>
                            <span className="text-base font-mono text-slate-400 font-bold">
                              ({currentChain.symbol})
                            </span>
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsFlipped(true)}
                          className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
                        >
                          <RotateCw size={14} className="text-blue-400" />
                          <span>Flip to Security Specs</span>
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-200 leading-relaxed font-medium max-w-2xl">
                        {currentChain.description}
                      </p>

                      {/* Metric Telemetry Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                            Native Gas Token
                          </span>
                          <span className="text-sm font-black font-mono text-white block">
                            {currentChain.nativeGasToken}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Fee Currency</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                            Block Time
                          </span>
                          <span className="text-sm font-black font-mono text-emerald-400 block">
                            {currentChain.avgBlockTime}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Cadence</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                            Deterministic Finality
                          </span>
                          <span className="text-sm font-black font-mono text-cyan-400 block">
                            {currentChain.finality}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Settlement speed</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                            Capacity Bandwidth
                          </span>
                          <span className="text-sm font-black font-mono text-purple-400 block">
                            {currentChain.tpsCapacity}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Throughput</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── CARD BACK: SECURITY, EXPLORER & VERIFICATION ──────── */
                    <div className="space-y-6 relative z-10">
                      {/* Top Bar */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[11px] font-bold border border-purple-500/30 flex items-center gap-1">
                              <ShieldCheck size={12} />
                              <span>SECURITY & VERIFICATION DECK</span>
                            </span>
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                            {currentChain.name} Technical Architecture
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsFlipped(false)}
                          className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
                        >
                          <RotateCw size={14} className="text-emerald-400" />
                          <span>Flip to Network Specs</span>
                        </button>
                      </div>

                      {/* Technical Breakdown List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-white">
                            <Radio size={14} className="text-blue-400" />
                            <span>Consensus Mechanism</span>
                          </div>
                          <p className="text-xs text-slate-300 font-mono">
                            {currentChain.consensus}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-white">
                            <Lock size={14} className="text-emerald-400" />
                            <span>Security Settlement Class</span>
                          </div>
                          <p className="text-xs text-slate-300 font-mono">
                            {currentChain.securityLevel}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-white">
                            <Cpu size={14} className="text-purple-400" />
                            <span>Smart Contract Standard</span>
                          </div>
                          <p className="text-xs text-slate-300 font-mono">
                            {currentChain.evmCompatible
                              ? "EVM Bytecode / Solidity (ERC-20, ERC-4626)"
                              : `${currentChain.name} Native Bytecode (Rust / Move / SVM)`}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-white">
                            <Activity size={14} className="text-cyan-400" />
                            <span>Ecosystem Role</span>
                          </div>
                          <p className="text-xs text-slate-300 font-mono">
                            {currentChain.tvlShareEstimate || "High Activity Deployment"}
                          </p>
                        </div>
                      </div>

                      {/* Action Links */}
                      <div className="flex items-center gap-3 pt-2 flex-wrap">
                        <a
                          href={currentChain.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow cursor-pointer"
                        >
                          <ExternalLink size={13} />
                          <span>Open {currentChain.explorerName}</span>
                        </a>

                        <Link
                          href="/risk-explorer"
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck size={13} className="text-emerald-400" />
                          <span>Audit Contract in Risk Explorer</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleCopy(currentChain.name, currentChain.name)}
                          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedChain === currentChain.name ? (
                            <>
                              <Check size={13} className="text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Copy Network Name</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card Navigation Footer */}
                  <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between gap-4 relative z-10">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentIndex(
                          (prev) => (prev - 1 + filteredChains.length) % filteredChains.length
                        );
                        setIsFlipped(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-black/50 hover:bg-black/80 text-white text-xs font-bold border border-white/10 transition flex items-center gap-2 cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                      <span>Previous Chain</span>
                    </button>

                    <div className="flex items-center gap-2 font-mono text-xs text-slate-300 font-bold">
                      <span>Card</span>
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white">
                        {currentIndex + 1}
                      </span>
                      <span>of</span>
                      <span>{filteredChains.length}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentIndex((prev) => (prev + 1) % filteredChains.length);
                        setIsFlipped(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-black/50 hover:bg-black/80 text-white text-xs font-bold border border-white/10 transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>Next Chain</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ═════════════════════════════════════════════════════════════════ */
            /* GRID VIEW MODE: ALL FLASH CARDS AT A GLANCE                       */
            /* ═════════════════════════════════════════════════════════════════ */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredChains.map((cName, idx) => {
                const meta = getChainInfo(cName);
                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl bg-gradient-to-br ${meta.bgGradient} border ${meta.borderAccent} space-y-4 shadow-xl flex flex-col justify-between hover:scale-[1.01] transition-transform`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-white">
                              {meta.category}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                              {meta.evmCompatible ? "EVM" : "NON-EVM"}
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-white mt-1.5 flex items-center gap-2">
                            <span>{meta.name}</span>
                            <span className="text-xs font-mono text-slate-400">({meta.symbol})</span>
                          </h4>
                        </div>

                        <a
                          href={meta.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-black/40 hover:bg-black/70 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
                          title={`Open ${meta.explorerName}`}
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {meta.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                        <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">
                            Gas Token
                          </span>
                          <span className="font-bold text-white text-[11px] truncate block">
                            {meta.nativeGasToken}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">
                            Finality
                          </span>
                          <span className="font-bold text-emerald-400 text-[11px] truncate block">
                            {meta.finality}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] text-slate-400">
                        {meta.consensus}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentIndex(idx);
                          setViewMode("card");
                          setIsFlipped(false);
                        }}
                        className="text-xs font-bold text-white hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Inspect Flash Card</span>
                        <ArrowUpRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Modal Footer ────────────────────────────────────────────────────── */}
        <div className="p-4 bg-[#070a12] border-t border-slate-800 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="font-mono text-[11px]">
              Forensic multi-chain telemetry verified by CryptoVision Engine
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Close Flash Card
          </button>
        </div>
      </div>
    </div>
  );
}
