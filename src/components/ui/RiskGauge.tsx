"use client";

import React from "react";

interface RiskGaugeProps {
  score: number;
  size?: number;
  label?: string;
  showLabel?: boolean;
  showLevel?: boolean;
  className?: string;
}

export function RiskGauge({
  score,
  size = 120,
  label = "Risk Score",
  showLabel = true,
  showLevel = true,
  className = "",
}: RiskGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let color = "#10b981"; // green
  let level = "LOW";
  if (clampedScore >= 80) {
    color = "#ef4444"; // red
    level = "CRITICAL";
  } else if (clampedScore >= 60) {
    color = "#f97316"; // orange
    level = "HIGH";
  } else if (clampedScore >= 35) {
    color = "#f59e0b"; // amber
    level = "MEDIUM";
  }

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-extrabold font-mono text-slate-100">{clampedScore}</span>
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>
          {level}
        </span>
      </div>
    </div>
  );
}
