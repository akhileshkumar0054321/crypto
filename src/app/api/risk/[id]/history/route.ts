import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(params);
  const coin = await cryptoStore.getCoin(id);
  const risk = coin ? (cryptoStore.riskScores.get(coin.coin_id) || cryptoStore.computeRisk(coin)) : null;
  const currentScore = risk?.score || 50;

  const now = Date.now();
  const history: any[] = [];
  for (let i = 14; i >= 0; i--) {
    const ts = new Date(now - i * 86400000).toISOString();
    const noise = (Math.sin(i * 0.9) * 6) + (Math.cos(i * 1.4) * 4);
    const score = Math.min(100, Math.max(5, Math.round(currentScore + noise)));
    history.push({
      timestamp: ts,
      score,
      risk_level: score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW",
    });
  }

  return NextResponse.json({
    coin_id: id,
    history,
  });
}
