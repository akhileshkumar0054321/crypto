"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Sparkles, RefreshCw, Info, AlertTriangle, ShieldCheck, TrendingUp } from "lucide-react";

export interface CryptoFearAndGreedMeterProps {
  score?: number;
  label?: string;
  nextUpdate?: string;
  advice?: string;
  badgeLabel?: string;
  badgeType?: "caution" | "danger" | "opportunity" | "neutral";
  interactive?: boolean;
  className?: string;
  showControls?: boolean;
}

// Color palette mapping exactly to the institutional Fear & Greed dial
const ZONES = [
  {
    id: "extreme_fear",
    name: "Extreme Fear",
    min: 0,
    max: 25,
    color: "#F03D4E", // Vibrant coral red
    textColor: "#F87171",
    badge: "Opportunity",
    badgeDot: "from-emerald-400 to-teal-500",
    badgeDotGlow: "rgba(16, 185, 129, 0.6)",
    advice: "Extreme market fear often signals historic accumulation opportunities.",
  },
  {
    id: "fear",
    name: "Fear",
    min: 25,
    max: 45,
    color: "#F97316", // Vibrant orange
    textColor: "#FB923C",
    badge: "Accumulate",
    badgeDot: "from-amber-400 to-orange-500",
    badgeDotGlow: "rgba(249, 115, 22, 0.6)",
    advice: "Elevated market uncertainty; dollar-cost averaging recommended.",
  },
  {
    id: "neutral",
    name: "Neutral",
    min: 45,
    max: 55,
    color: "#FFC700", // Bright yellow
    textColor: "#FDE047",
    badge: "Balanced",
    badgeDot: "from-yellow-300 to-amber-400",
    badgeDotGlow: "rgba(250, 204, 21, 0.6)",
    advice: "Market sentiment is balanced; trend confirmation pending.",
  },
  {
    id: "greed",
    name: "Greed",
    min: 55,
    max: 75,
    color: "#16D790", // Vibrant mint / emerald green
    textColor: "#34D399",
    badge: "Caution",
    badgeDot: "from-orange-400 to-amber-500",
    badgeDotGlow: "rgba(249, 115, 22, 0.6)",
    advice: "Elevated greed can signal an overheated market",
  },
  {
    id: "extreme_greed",
    name: "Extreme Greed",
    min: 75,
    max: 100,
    color: "#0B2E24", // Dark forest green
    textColor: "#10B981",
    badge: "High Risk",
    badgeDot: "from-red-500 to-rose-600",
    badgeDotGlow: "rgba(239, 68, 68, 0.6)",
    advice: "Extreme euphoria detected; heightened probability of rapid mean reversion.",
  },
];

// Helper to construct donut arc SVG path
function createArcPath(
  startScore: number,
  endScore: number,
  rIn: number,
  rOut: number,
  cx: number,
  cy: number
): string {
  const aStartDeg = 180 - (startScore / 100) * 180;
  const aEndDeg = 180 - (endScore / 100) * 180;

  const radStart = (aStartDeg * Math.PI) / 180;
  const radEnd = (aEndDeg * Math.PI) / 180;

  const x1 = cx + rOut * Math.cos(radStart);
  const y1 = cy - rOut * Math.sin(radStart);
  const x2 = cx + rOut * Math.cos(radEnd);
  const y2 = cy - rOut * Math.sin(radEnd);

  const x3 = cx + rIn * Math.cos(radEnd);
  const y3 = cy - rIn * Math.sin(radEnd);
  const x4 = cx + rIn * Math.cos(radStart);
  const y4 = cy - rIn * Math.sin(radStart);

  const largeArc = Math.abs(aStartDeg - aEndDeg) > 180 ? 1 : 0;

  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${rIn} ${rIn} 0 ${largeArc} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`;
}

export function CryptoFearAndGreedMeter({
  score: initialScore = 73,
  label: customLabel,
  nextUpdate = "Next update: 14h 22m",
  advice: customAdvice,
  badgeLabel: customBadgeLabel,
  interactive = false,
  className = "",
  showControls = false,
}: CryptoFearAndGreedMeterProps) {
  const [currentScore, setCurrentScore] = useState<number>(initialScore);
  const [animatedScore, setAnimatedScore] = useState<number>(0);

  // Sync prop changes
  useEffect(() => {
    setCurrentScore(initialScore);
  }, [initialScore]);

  // Smooth entry animation
  useEffect(() => {
    let start = 0;
    const target = currentScore;
    const duration = 900;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedScore(target);
      }
    };

    requestAnimationFrame(animate);
  }, [currentScore]);

  const clampedScore = Math.max(0, Math.min(100, currentScore));
  const activeZone = useMemo(() => {
    return ZONES.find((z) => clampedScore >= z.min && clampedScore <= z.max) || ZONES[3];
  }, [clampedScore]);

  const displayLabel = customLabel || activeZone.name;
  const displayAdvice = customAdvice || activeZone.advice;
  const displayBadge = customBadgeLabel || activeZone.badge;

  // Geometry dimensions
  const cx = 200;
  const cy = 190;
  const rOut = 145;
  const rIn = 100;
  const needleLength = 120;

  // Needle calculation for animatedScore
  const needleAngleDeg = 180 - (animatedScore / 100) * 180;
  const needleRad = (needleAngleDeg * Math.PI) / 180;

  const tipX = cx + needleLength * Math.cos(needleRad);
  const tipY = cy - needleLength * Math.sin(needleRad);

  const perpRad = needleRad + Math.PI / 2;
  const baseWidth = 5.5;
  const b1X = cx + baseWidth * Math.cos(perpRad);
  const b1Y = cy - baseWidth * Math.sin(perpRad);
  const b2X = cx - baseWidth * Math.cos(perpRad);
  const b2Y = cy + baseWidth * Math.sin(perpRad);

  const needleColor = activeZone.id === "extreme_greed" ? "#16D790" : activeZone.color;

  return (
    <div
      id="crypto-fear-and-greed-meter"
      className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-[#090C12] border border-white/[0.08] shadow-2xl relative select-none ${className}`}
    >
      {/* ── Top Arc SVG Gauge ────────────────────────────────────────────── */}
      <div className="w-full max-w-[380px] sm:max-w-[420px] aspect-[400/260] relative flex items-center justify-center">
        <svg
          viewBox="0 0 400 240"
          className="w-full h-full overflow-visible"
          style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))" }}
        >
          <defs>
            {/* Dark background backing shadow track */}
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Semicircle background track */}
          <path
            d={createArcPath(0, 100, rIn - 2, rOut + 2, cx, cy)}
            fill="#06080E"
            opacity="0.9"
          />

          {/* 5 Color Segments */}
          {ZONES.map((zone) => (
            <path
              key={zone.id}
              d={createArcPath(zone.min, zone.max, rIn, rOut, cx, cy)}
              fill={zone.color}
              className="transition-opacity duration-300 hover:opacity-90 cursor-pointer"
              onClick={() => interactive && setCurrentScore(Math.round((zone.min + zone.max) / 2))}
            />
          ))}

          {/* Segment Boundary Separator Lines */}
          {[0, 25, 45, 50, 55, 75, 100].map((sVal) => {
            const aDeg = 180 - (sVal / 100) * 180;
            const r = (aDeg * Math.PI) / 180;
            const isCenterTick = sVal === 50;
            const tIn = isCenterTick ? rIn - 10 : rIn - 6;
            const tOut = rIn + 4;
            const x1 = cx + tIn * Math.cos(r);
            const y1 = cy - tIn * Math.sin(r);
            const x2 = cx + tOut * Math.cos(r);
            const y2 = cy - tOut * Math.sin(r);
            return (
              <line
                key={`tick-${sVal}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isCenterTick ? "#64748B" : "#475569"}
                strokeWidth={isCenterTick ? 2.5 : 1.8}
                strokeLinecap="round"
              />
            );
          })}

          {/* Dashed Inner Arc Sub-ticks */}
          <path
            d={`M ${cx - (rIn - 8)} ${cy} A ${rIn - 8} ${rIn - 8} 0 0 1 ${cx + (rIn - 8)} ${cy}`}
            fill="none"
            stroke="#1E293B"
            strokeWidth="1.5"
            strokeDasharray="2 6"
          />

          {/* ── Segment Label Texts around the arc ────────────────────────── */}
          {/* Extreme Fear (Left) */}
          <text
            x="64"
            y="124"
            fill="#94A3B8"
            fontSize="11.5"
            fontWeight="600"
            textAnchor="middle"
            className="select-none"
          >
            Extreme Fear
          </text>

          {/* Fear (Top Left) */}
          <text
            x="132"
            y="42"
            fill="#94A3B8"
            fontSize="12"
            fontWeight="600"
            textAnchor="middle"
            className="select-none"
          >
            Fear
          </text>

          {/* Neutral (Top Center) */}
          <text
            x="200"
            y="24"
            fill="#94A3B8"
            fontSize="12.5"
            fontWeight="600"
            textAnchor="middle"
            className="select-none"
          >
            Neutral
          </text>

          {/* 50 Mark at Top Center */}
          <text
            x="200"
            y="45"
            fill="#64748B"
            fontSize="13"
            fontWeight="800"
            fontFamily="monospace"
            textAnchor="middle"
            className="select-none"
          >
            50
          </text>

          {/* Greed (Top Right) */}
          <text
            x="268"
            y="42"
            fill="#94A3B8"
            fontSize="12"
            fontWeight="600"
            textAnchor="middle"
            className="select-none"
          >
            Greed
          </text>

          {/* Extreme Greed (Right) */}
          <text
            x="334"
            y="124"
            fill="#94A3B8"
            fontSize="11.5"
            fontWeight="600"
            textAnchor="middle"
            className="select-none"
          >
            Extreme Greed
          </text>

          {/* 0 and 100 Base Markers */}
          <text
            x="70"
            y="204"
            fill="#94A3B8"
            fontSize="15"
            fontWeight="800"
            fontFamily="monospace"
            textAnchor="middle"
            className="select-none"
          >
            0
          </text>
          <text
            x="330"
            y="204"
            fill="#94A3B8"
            fontSize="15"
            fontWeight="800"
            fontFamily="monospace"
            textAnchor="middle"
            className="select-none"
          >
            100
          </text>

          {/* ── Indicator Needle ────────────────────────────────────────── */}
          {/* Needle Arrow Polygon */}
          <polygon
            points={`${b1X.toFixed(2)},${b1Y.toFixed(2)} ${tipX.toFixed(2)},${tipY.toFixed(2)} ${b2X.toFixed(2)},${b2Y.toFixed(2)}`}
            fill={needleColor}
            style={{
              filter: `drop-shadow(0 0 6px ${needleColor}88)`,
            }}
          />

          {/* Pivot Ring (Hollow Green Ring) */}
          <circle
            cx={cx}
            cy={cy}
            r="12"
            fill="#090C12"
            stroke={needleColor}
            strokeWidth="4.5"
            style={{
              filter: `drop-shadow(0 0 8px ${needleColor}66)`,
            }}
          />
        </svg>
      </div>

      {/* ── Score & Sentiment Metrics Display ────────────────────────────── */}
      <div className="flex flex-col items-center justify-center text-center -mt-2 space-y-3 z-10">
        {/* Large Score Number */}
        <div
          className="text-6xl sm:text-7xl font-black font-mono tracking-tight leading-none transition-colors duration-300"
          style={{ color: needleColor }}
        >
          {animatedScore}
        </div>

        {/* Sentiment Title */}
        <div
          className="text-xl sm:text-2xl font-black tracking-wide transition-colors duration-300"
          style={{ color: needleColor }}
        >
          {displayLabel}
        </div>

        {/* Pill Badge with Glowing Radial Indicator */}
        <div className="inline-flex items-center gap-2.5 px-5 py-1.5 rounded-full bg-[#121722] border border-white/10 shadow-lg shadow-black/40">
          <span
            className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${activeZone.badgeDot} transition-all duration-300`}
            style={{
              boxShadow: `0 0 10px ${activeZone.badgeDotGlow}`,
            }}
          />
          <span className="text-sm font-bold text-slate-100 tracking-wide">
            {displayBadge}
          </span>
        </div>

        {/* Subtitle / Analytical Note */}
        <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed pt-1">
          {displayAdvice}
        </p>

        {/* Update Timestamp / Next Update */}
        <div className="text-slate-500 font-mono text-[11px] pt-1 flex items-center gap-1.5">
          <span>{nextUpdate}</span>
        </div>
      </div>

      {/* ── Interactive Test Slider (if interactive or controls enabled) ──── */}
      {(interactive || showControls) && (
        <div className="w-full max-w-xs mt-6 pt-4 border-t border-slate-800/80 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Simulate Sentiment:</span>
            <span className="font-mono font-bold text-white">{currentScore} / 100</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={currentScore}
            onChange={(e) => setCurrentScore(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0 Extreme Fear</span>
            <span>50 Neutral</span>
            <span>100 Extreme Greed</span>
          </div>
        </div>
      )}
    </div>
  );
}
export default CryptoFearAndGreedMeter;
