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

  const factor_breakdown = [
    {
      factor: "Price Volatility (7d / 30d)",
      score: risk.volatility_score,
      weight: 0.35,
      impact: risk.volatility_score > 60 ? "HIGH" : risk.volatility_score > 30 ? "MODERATE" : "LOW",
      description: "Measures 24h & 7d price fluctuations, ATR, and standard deviation.",
    },
    {
      factor: "Liquidity & Order Book Imbalance",
      score: 100 - risk.liquidity_score,
      weight: 0.25,
      impact: risk.liquidity_score < 40 ? "HIGH" : "LOW",
      description: "Depth across major DEX/CEX venues, bid-ask spread, and 24h volume/mcap ratio.",
    },
    {
      factor: "On-Chain Activity & Whale Concentration",
      score: risk.onchain_score,
      weight: 0.25,
      impact: risk.onchain_score > 60 ? "HIGH" : "LOW",
      description: "Whale transaction volume, top 10 holder dominance, and contract security patterns.",
    },
    {
      factor: "Market Sentiment & Social Velocity",
      score: risk.sentiment_score,
      weight: 0.15,
      impact: risk.sentiment_score > 60 ? "HIGH" : "LOW",
      description: "Social media sentiment polarity, Google Trends velocity, and fear/greed correlation.",
    },
  ];

  return NextResponse.json({
    coin_id: coin.coin_id,
    composite_risk_score: risk.score,
    risk_level: risk.risk_level,
    factors: factor_breakdown,
    fraud_signals: {
      pump_and_dump: risk.pump_dump_detected,
      wash_trading: risk.wash_trading_detected,
      honeypot_contract: risk.honeypot_detected,
      anomaly_detected: risk.pump_dump_detected || risk.wash_trading_detected,
    },
    recommendation: risk.recommendation,
    confidence: risk.recommendation_confidence,
  });
}
