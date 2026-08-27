import { NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET() {
  const coins = await cryptoStore.getCoins();
  const results = coins.map((c) => {
    return cryptoStore.riskScores.get(c.coin_id) || cryptoStore.computeRisk(c);
  });

  // Sort descending by risk score
  results.sort((a, b) => b.score - a.score);
  return NextResponse.json(results);
}
