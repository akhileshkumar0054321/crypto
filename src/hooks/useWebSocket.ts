"use client";
import { useEffect, useRef, useCallback, useState } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "";

type Topic = "prices" | "risks" | "alerts";

export function useWebSocket<T = unknown>(
  topic: Topic,
  onMessage: (data: T) => void,
  enabled = true
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    if (!enabled || !WS_URL || typeof window === "undefined") {
      return;
    }
    try {
      const ws = new WebSocket(`${WS_URL}/ws/${topic}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        const ping = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send("ping");
        }, 30_000);
        ws.onclose = () => clearInterval(ping);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data !== "pong") onMessage(data as T);
        } catch {}
      };

      ws.onerror = () => {
        try { ws.close(); } catch {}
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectTimeout.current = setTimeout(connect, 15000);
      };
    } catch {
      setConnected(false);
    }
  }, [topic, onMessage, enabled]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { connected };
}

// ── Price stream hook ─────────────────────────────────────────────────────────
export function usePriceStream(
  onPrice: (coinId: string, price: number, change?: number) => void
) {
  return useWebSocket("prices", (data: any) => {
    if (data?.type === "price_update") {
      onPrice(data.coin_id, data.price, data.change_24h);
    }
  });
}

// ── Risk stream hook ──────────────────────────────────────────────────────────
export function useRiskStream(
  onRisk: (coinId: string, score: number, level: string) => void
) {
  return useWebSocket("risks", (data: any) => {
    if (data?.type === "risk_update") {
      onRisk(data.coin_id, data.score, data.risk_level);
    }
  });
}

// ── Alert stream hook ─────────────────────────────────────────────────────────
export function useAlertStream(onAlert: (alert: any) => void) {
  return useWebSocket("alerts", (data: any) => {
    if (data?.type === "alert_fired") onAlert(data);
  });
}
