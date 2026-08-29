"use client";

import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import { useLiveMarket } from "@/lib/context/LiveMarketContext";
import { CryptoAvatar } from "@/components/ui/CryptoAvatar";

interface Coin {
  coin_id: string;
  name: string;
  symbol: string;
  image_url?: string;
  price_usd?: number;
  price_change_24h?: number;
  market_cap?: number;
  volume_24h?: number;
  score?: number;
  recommendation?: string;
  pump_dump_detected?: boolean;
  wash_trading_detected?: boolean;
}

const riskColor = (s: number) =>
  s >= 80 ? "#f87171" : s >= 60 ? "#fb923c" : s >= 30 ? "#fbbf24" : "#34d399";

const riskLabel = (s: number) =>
  s >= 80 ? "CRITICAL" : s >= 60 ? "HIGH" : s >= 30 ? "MEDIUM" : "LOW";

const recBadge = (r?: string) => {
  if (r === "BUY") return { label: "ACCUMULATE", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
  if (r === "SELL") return { label: "CRITICAL RISK", cls: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
  return { label: "NEUTRAL / HOLD", cls: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
};

export function CoinCard({ coin }: { coin: Coin }) {
  const router = useRouter();
  const { getLiveCoin } = useLiveMarket();

  // Retrieve live ticking state
  const liveTick = getLiveCoin(coin.coin_id, coin.price_usd || 100, coin.price_change_24h || 0);

  const displayPrice = liveTick.price || coin.price_usd || 0;
  const displayChg = liveTick.change24h ?? (coin.price_change_24h || 0);
  const isUp = displayChg >= 0;
  const score = coin.score ?? 50;
  const hasFraud = coin.pump_dump_detected || coin.wash_trading_detected;
  const badge = recBadge(coin.recommendation);

  const tickBg =
    liveTick.direction === "up"
      ? "bg-emerald-500/10 border-emerald-500/40"
      : liveTick.direction === "down"
      ? "bg-rose-500/10 border-rose-500/40"
      : "bg-[#131929] border-white/[0.06]";

  return (
    <div
      onClick={() => router.push(`/coin/${coin.coin_id}`)}
      className={`rounded-xl p-4 cursor-pointer transition-all duration-300 relative overflow-hidden border hover:border-blue-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 ${tickBg}`}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, ${riskColor(score)}, transparent)`,
        }}
      />

      {/* Fraud badge */}
      {hasFraud && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[9px] font-black">
          <AlertTriangle size={9} />
          <span>FRAUD RISK</span>
        </div>
      )}

      {/* Coin Title & Icon */}
      <div className="flex items-center gap-2.5 mb-3">
        <CryptoAvatar
          coinId={coin.coin_id}
          symbol={coin.symbol}
          name={coin.name}
          imageUrl={coin.image_url}
          size="md"
          className="w-8 h-8"
        />
        <div className="min-w-0 flex-1">
          <p className="text-slate-100 font-bold text-sm truncate">{coin.name}</p>
          <p className="text-slate-500 text-[10px] uppercase font-mono font-bold">{coin.symbol}</p>
        </div>
      </div>

      {/* Real-Time Price with Tick Animation */}
      <div className="flex items-baseline justify-between">
        <p
          className={`text-lg font-extrabold font-mono transition-colors duration-300 ${
            liveTick.direction === "up"
              ? "text-emerald-400"
              : liveTick.direction === "down"
              ? "text-rose-400"
              : "text-slate-100"
          }`}
        >
          ${displayPrice >= 1 ? displayPrice.toLocaleString("en-US", { maximumFractionDigits: 2 }) : displayPrice.toFixed(6)}
        </p>

        {/* Change badge */}
        <div
          className={`flex items-center gap-0.5 text-xs font-mono font-bold ${
            isUp ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {isUp ? "+" : ""}{displayChg.toFixed(2)}%
        </div>
      </div>

      {/* Risk Indicator Bar */}
      <div className="mt-3.5 pt-2.5 border-t border-white/[0.04]">
        <div className="flex justify-between items-center mb-1 text-[10px]">
          <span className="text-slate-500 font-bold uppercase tracking-wider">Risk Level</span>
          <span className="font-mono font-bold" style={{ color: riskColor(score) }}>
            {riskLabel(score)} ({score.toFixed(0)})
          </span>
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${score}%`,
              background: riskColor(score),
            }}
          />
        </div>
      </div>

      {/* Signal / Recommendation */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-medium">Verdict:</span>
        <span
          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${badge.cls}`}
        >
          {badge.label}
        </span>
      </div>
    </div>
  );
}
