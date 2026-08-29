"use client";

import React, { useState, useEffect } from "react";

interface CryptoAvatarProps {
  coinId?: string;
  symbol?: string;
  name?: string;
  imageUrl?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  className?: string;
}

// Well-known token fallback colors based on symbol
const SYMBOL_GRADIENTS: Record<string, string> = {
  btc: "from-amber-500 to-orange-600 text-white",
  eth: "from-indigo-500 to-purple-600 text-white",
  sol: "from-purple-500 to-emerald-500 text-white",
  bnb: "from-yellow-400 to-amber-600 text-black",
  xrp: "from-slate-700 to-slate-900 text-white",
  ada: "from-blue-600 to-indigo-700 text-white",
  doge: "from-amber-400 to-yellow-600 text-black",
  link: "from-blue-500 to-cyan-600 text-white",
  pepe: "from-emerald-500 to-green-700 text-white",
  floki: "from-amber-500 to-yellow-500 text-black",
  avax: "from-rose-500 to-red-600 text-white",
  dot: "from-pink-500 to-rose-600 text-white",
  matic: "from-purple-600 to-indigo-700 text-white",
  pol: "from-purple-600 to-indigo-700 text-white",
  ton: "from-sky-500 to-blue-600 text-white",
  near: "from-emerald-600 to-teal-700 text-white",
  uni: "from-pink-500 to-purple-600 text-white",
  sui: "from-cyan-500 to-blue-600 text-white",
  arb: "from-blue-500 to-sky-600 text-white",
  shib: "from-orange-500 to-red-600 text-white",
  rndr: "from-rose-500 to-red-700 text-white",
  fet: "from-cyan-600 to-blue-700 text-white",
  tao: "from-slate-800 to-slate-950 text-white",
  wif: "from-amber-600 to-yellow-700 text-white",
  usdt: "from-emerald-500 to-teal-600 text-white",
  usdc: "from-blue-500 to-indigo-600 text-white",
};

export function CryptoAvatar({
  coinId = "",
  symbol = "",
  name = "",
  imageUrl = "",
  size = "md",
  className = "",
}: CryptoAvatarProps) {
  const [imgErrorStage, setImgErrorStage] = useState<number>(0);

  const cleanSym = (symbol || coinId || "CRYPTO").toLowerCase().replace(/[^a-z0-9]/g, "");
  const fallbackSym = (symbol || coinId || name || "C").slice(0, 3).toUpperCase();

  // Reset error stage if imageUrl changes
  useEffect(() => {
    setImgErrorStage(0);
  }, [imageUrl, coinId]);

  // Size mapping
  let sizeClasses = "w-8 h-8 text-xs";
  let pixelSize = 32;

  if (typeof size === "number") {
    sizeClasses = `w-[${size}px] h-[${size}px] text-xs`;
    pixelSize = size;
  } else {
    switch (size) {
      case "xs":
        sizeClasses = "w-4 h-4 text-[8px]";
        pixelSize = 16;
        break;
      case "sm":
        sizeClasses = "w-5 h-5 text-[10px]";
        pixelSize = 20;
        break;
      case "md":
        sizeClasses = "w-8 h-8 text-xs";
        pixelSize = 32;
        break;
      case "lg":
        sizeClasses = "w-11 h-11 text-sm";
        pixelSize = 44;
        break;
      case "xl":
        sizeClasses = "w-14 h-14 text-base";
        pixelSize = 56;
        break;
    }
  }

  // Multi-tier candidate URLs
  const candidateUrls = React.useMemo(() => {
    const list: string[] = [];
    if (imageUrl && imageUrl.trim()) {
      list.push(imageUrl.trim());
    }
    // SpotHQ Cryptocurrency icons CDN
    if (cleanSym) {
      list.push(
        `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${cleanSym}.png`
      );
    }
    return list;
  }, [imageUrl, cleanSym]);

  const activeSrc = candidateUrls[imgErrorStage];
  const gradientClass =
    SYMBOL_GRADIENTS[cleanSym] || "from-blue-600 to-indigo-700 text-white";

  // If all image attempts failed or no image source was provided
  if (!activeSrc || imgErrorStage >= candidateUrls.length) {
    return (
      <div
        className={`rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center font-black font-mono tracking-tighter uppercase shadow-sm flex-shrink-0 select-none ${sizeClasses} ${className}`}
        title={name || symbol || coinId}
      >
        <span>{fallbackSym.slice(0, pixelSize < 24 ? 2 : 3)}</span>
      </div>
    );
  }

  return (
    <img
      src={activeSrc}
      alt={name || symbol || "Crypto"}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={() => {
        setImgErrorStage((prev) => prev + 1);
      }}
      className={`rounded-full object-cover flex-shrink-0 bg-slate-900 border border-slate-700/60 ${sizeClasses} ${className}`}
      loading="lazy"
    />
  );
}
