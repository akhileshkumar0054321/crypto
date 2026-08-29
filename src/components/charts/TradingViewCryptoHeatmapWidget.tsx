"use client";

import React, { useEffect, useRef, memo } from "react";

export interface TradingViewCryptoHeatmapWidgetProps {
  dataSource?: "Crypto" | "CryptoDeFi" | "CryptoAll";
  blockSize?: "market_cap_calc" | "volume_24h_usd" | "total_volume";
  blockColor?: "change" | "change_abs" | "volume";
  colorTheme?: "dark" | "light";
  hasTopBar?: boolean;
  isDatasetSelectable?: boolean;
  isZoomable?: boolean;
  hasSymbolTooltip?: boolean;
  isFullSize?: boolean;
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
  gridColor?: string;
  borderColor?: string;
  scalePercentColor?: string;
  blockquoteColor?: string;
  className?: string;
}

function TradingViewCryptoHeatmapComponent({
  dataSource = "Crypto",
  blockSize = "market_cap_calc",
  blockColor = "change",
  colorTheme = "dark",
  hasTopBar = true,
  isDatasetSelectable = true,
  isZoomable = true,
  hasSymbolTooltip = true,
  isFullSize = true,
  width = "100%",
  height = "100%",
  backgroundColor = "rgba(11, 15, 25, 1)",
  gridColor = "rgba(30, 41, 59, 1)",
  borderColor = "rgba(30, 41, 59, 1)",
  scalePercentColor = "rgba(15, 23, 42, 1)",
  blockquoteColor = "rgba(15, 23, 42, 1)",
  className = "",
}: TradingViewCryptoHeatmapWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget elements to avoid duplicate embeds
    container.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "calc(100% - 28px)";
    widgetDiv.style.width = "100%";
    container.appendChild(widgetDiv);

    const copyrightDiv = document.createElement("div");
    copyrightDiv.className = "tradingview-widget-copyright";
    copyrightDiv.style.height = "28px";
    copyrightDiv.style.display = "flex";
    copyrightDiv.style.alignItems = "center";
    copyrightDiv.style.justifyContent = "space-between";
    copyrightDiv.style.padding = "0 10px";
    copyrightDiv.innerHTML = `
      <a href="https://www.tradingview.com/markets/cryptocurrencies/prices-all/" rel="noopener nofollow" target="_blank" style="text-decoration: none;">
        <span class="blue-text" style="color: #60a5fa; font-size: 11px; font-weight: 600;">Track all crypto markets on TradingView</span>
      </a>
      <span class="trademark" style="color: #64748b; font-size: 11px;">Interactive Heatmap</span>
    `;
    container.appendChild(copyrightDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js";
    script.type = "text/javascript";
    script.async = true;

    const widgetConfig = {
      dataSource,
      blockSize,
      blockColor,
      locale: "en",
      symbolUrl: "",
      colorTheme,
      hasTopBar,
      isDatasetSelectable,
      gridColor,
      scalePercentColor,
      borderColor,
      backgroundColor,
      blockquoteColor,
      isZoomable,
      hasSymbolTooltip,
      isFullSize,
      width: "100%",
      height: "100%",
    };

    script.innerHTML = JSON.stringify(widgetConfig);
    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [
    dataSource,
    blockSize,
    blockColor,
    colorTheme,
    hasTopBar,
    isDatasetSelectable,
    isZoomable,
    hasSymbolTooltip,
    isFullSize,
    backgroundColor,
    gridColor,
    borderColor,
    scalePercentColor,
    blockquoteColor,
  ]);

  return (
    <div
      className={`tradingview-widget-container h-full w-full rounded-2xl overflow-hidden ${className}`}
      ref={containerRef}
      style={{ height, width }}
    />
  );
}

export const TradingViewCryptoHeatmapWidget = memo(TradingViewCryptoHeatmapComponent);
export default TradingViewCryptoHeatmapWidget;
