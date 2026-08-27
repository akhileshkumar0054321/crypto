import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const coin = await cryptoStore.getCoin(params.id);
  if (!coin) {
    return NextResponse.json({ error: `Coin '${params.id}' not found` }, { status: 404 });
  }
  const risk = cryptoStore.riskScores.get(coin.coin_id) || cryptoStore.computeRisk(coin);
  return NextResponse.json(risk);
}
