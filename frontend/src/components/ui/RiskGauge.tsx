"use client";
import React, { useEffect, useRef } from "react";

interface Props {
  score: number;       // 0-100
  size?: number;
  showLabel?: boolean;
  showLevel?: boolean;
}

const getColor = (score: number) => {
  if (score >= 80) return { stroke: "#ef4444", glow: "rgba(239,68,68,0.4)", text: "#f87171", label: "CRITICAL" };
  if (score >= 60) return { stroke: "#f97316", glow: "rgba(249,115,22,0.4)", text: "#fb923c", label: "HIGH" };
  if (score >= 30) return { stroke: "#f59e0b", glow: "rgba(245,158,11,0.4)", text: "#fbbf24", label: "MEDIUM" };
  return          { stroke: "#10b981", glow: "rgba(16,185,129,0.4)", text: "#34d399", label: "LOW" };
};

export function RiskGauge({ score = 0, size = 120, showLabel = true, showLevel = true }: Props) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const colors = getColor(clampedScore);

  const cx = size / 2;
  const cy = size / 2;
  const r  = (size - 20) / 2;
  const strokeW = size > 100 ? 8 : 6;

  // Arc from 210° to 330° (240° sweep)
  const startAngle = 210;
  const sweep = 240;
  const endAngle = startAngle + (sweep * clampedScore) / 100;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (start: number, end: number) => {
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(end));
    const y2 = cy + r * Math.sin(toRad(end));
    const large = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  // Tick marks
  const ticks = [0, 25, 50, 75, 100].map(val => {
    const angle = startAngle + (sweep * val) / 100;
    const inner = r - strokeW - 4;
    const outer = r - strokeW - 10;
    return {
      x1: cx + inner * Math.cos(toRad(angle)),
      y1: cy + inner * Math.sin(toRad(angle)),
      x2: cx + outer * Math.cos(toRad(angle)),
      y2: cy + outer * Math.sin(toRad(angle)),
    };
  });

  const gradId = `rg-${size}-${Math.round(clampedScore)}`;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={colors.stroke} stopOpacity="0.6" />
            <stop offset="100%" stopColor={colors.stroke} />
          </linearGradient>
          <filter id={`glow-${size}`}>
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <path
          d={arcPath(startAngle, startAngle + sweep)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
        ))}

        {/* Score arc */}
        {clampedScore > 0 && (
          <path
            d={arcPath(startAngle, endAngle)}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeW}
            strokeLinecap="round"
            filter={`url(#glow-${size})`}
            style={{ transition: "d 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        )}

        {/* Needle dot at end */}
        {clampedScore > 0 && (
          <circle
            cx={cx + r * Math.cos(toRad(endAngle))}
            cy={cy + r * Math.sin(toRad(endAngle))}
            r={strokeW / 2 + 1}
            fill={colors.stroke}
            filter={`url(#glow-${size})`}
          />
        )}

        {/* Score text */}
        {showLabel && (
          <>
            <text x={cx} y={cy + 6} textAnchor="middle"
              fill={colors.text} fontSize={size > 100 ? 26 : 18} fontWeight="700"
              fontFamily="'JetBrains Mono', monospace">
              {Math.round(clampedScore)}
            </text>
            {showLevel && (
              <text x={cx} y={cy + (size > 100 ? 24 : 18)} textAnchor="middle"
                fill="rgba(255,255,255,0.3)" fontSize={size > 100 ? 9 : 7}
                fontWeight="600" letterSpacing="1.5" fontFamily="Inter, sans-serif">
                {colors.label}
              </text>
            )}
          </>
        )}
      </svg>
    </div>
  );
}
