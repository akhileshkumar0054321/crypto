import { NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET() {
  const coins = await cryptoStore.getCoins();
  const coinMap = new Map(coins.map((c) => [c.coin_id, c]));

  const rawHoldings = Array.from(cryptoStore.holdings.values());
  let totalValue = 0;
  let weightedRiskSum = 0;
  let highestRisk = { coin_id: "", name: "", score: 0 };

  const holdingDetails = rawHoldings.map((h) => {
    const coin = coinMap.get(h.coin_id);
    const price = coin?.price_usd || h.avg_buy_price_usd;
    const value = h.quantity * price;
    const risk = coin ? (cryptoStore.riskScores.get(coin.coin_id) || cryptoStore.computeRisk(coin)) : { score: 50, risk_level: "MEDIUM" };

    totalValue += value;
    weightedRiskSum += value * risk.score;

    if (risk.score > highestRisk.score) {
      highestRisk = {
        coin_id: h.coin_id,
        name: coin?.name || h.coin_id,
        score: risk.score,
      };
    }

    return {
      coin_id: h.coin_id,
      value,
      risk_score: risk.score,
    };
  });

  const portfolioRiskScore = totalValue > 0 ? weightedRiskSum / totalValue : 0;
  const roundedRisk = Math.round(portfolioRiskScore * 10) / 10;

  // Diversification score based on Herfindahl-Hirschman Index
  let hhi = 0;
  if (totalValue > 0) {
    for (const h of holdingDetails) {
      const share = h.value / totalValue;
      hhi += share * share;
    }
  }
  // 1/HHI normalized to 100
  const diversification = Math.min(100, Math.round((1 - Math.min(1, hhi)) * 100));

  return NextResponse.json({
    total_portfolio_value_usd: Math.round(totalValue * 100) / 100,
    weighted_risk_score: roundedRisk,
    portfolio_risk_level: roundedRisk >= 80 ? "CRITICAL" : roundedRisk >= 60 ? "HIGH" : roundedRisk >= 30 ? "MEDIUM" : "LOW",
    diversification_score: diversification,
    holdings_count: rawHoldings.length,
    highest_risk_asset: highestRisk.coin_id ? highestRisk : null,
    recommendation: roundedRisk < 35 ? "WELL_BALANCED" : roundedRisk < 60 ? "MODERATE_EXPOSURE" : "DE-RISK_RECOMMENDED",
  });
}
