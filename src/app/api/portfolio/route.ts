import { NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET() {
  const coins = await cryptoStore.getCoins();
  const coinMap = new Map(coins.map((c) => [c.coin_id, c]));

  const rawHoldings = Array.from(cryptoStore.holdings.values());
  const holdings = rawHoldings.map((h) => {
    const coin = coinMap.get(h.coin_id);
    const price = coin?.price_usd || h.avg_buy_price_usd;
    const totalCost = h.quantity * h.avg_buy_price_usd;
    const currentValue = h.quantity * price;
    const pnl = currentValue - totalCost;
    const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
    const risk = coin ? (cryptoStore.riskScores.get(coin.coin_id) || cryptoStore.computeRisk(coin)) : null;

    return {
      id: h.id,
      coin_id: h.coin_id,
      coin_name: coin?.name || h.coin_id,
      symbol: coin?.symbol?.toUpperCase() || h.coin_id.toUpperCase(),
      image_url: coin?.image_url,
      quantity: h.quantity,
      avg_buy_price_usd: h.avg_buy_price_usd,
      current_price_usd: price,
      total_cost_usd: Math.round(totalCost * 100) / 100,
      current_value_usd: Math.round(currentValue * 100) / 100,
      pnl_usd: Math.round(pnl * 100) / 100,
      pnl_percentage: Math.round(pnlPercent * 100) / 100,
      risk_score: risk?.score || 50,
      risk_level: risk?.risk_level || "MEDIUM",
      recommendation: risk?.recommendation || "HOLD",
      notes: h.notes,
      created_at: h.created_at,
    };
  });

  return NextResponse.json(holdings);
}
