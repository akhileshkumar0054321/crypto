import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const coin = await cryptoStore.getCoin(params.id);
  if (!coin) {
    return NextResponse.json({ error: `Coin '${params.id}' not found` }, { status: 404 });
  }
  const scenarios = cryptoStore.getPriceScenarios(coin);
  return NextResponse.json(scenarios);
}
