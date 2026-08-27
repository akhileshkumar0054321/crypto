import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const coinId = body?.coin_id;
    if (!coinId) {
      return NextResponse.json({ error: "coin_id is required" }, { status: 400 });
    }

    const coin = await cryptoStore.getCoin(coinId);
    if (!coin) {
      return NextResponse.json({ error: `Coin '${coinId}' not found` }, { status: 404 });
    }

    const updatedRisk = cryptoStore.computeRisk(coin);
    cryptoStore.riskScores.set(coin.coin_id, updatedRisk);

    return NextResponse.json({
      status: "completed",
      coin_id: coin.coin_id,
      risk_score: updatedRisk,
      message: `On-demand ensemble risk analysis completed for ${coin.name}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Analysis error" }, { status: 500 });
  }
}
