import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id: coinId } = await Promise.resolve(params);
    const url = new URL(req.url);
    const customHeadline = url.searchParams.get("headline") || undefined;

    const coin = (await cryptoStore.getCoin(coinId)) || {
      coin_id: coinId,
      name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
      symbol: coinId.slice(0, 4).toUpperCase(),
      price_usd: 100,
      price_change_24h: 0,
      market_cap: 1000000000,
      volume_24h: 50000000,
    };

    const risk = cryptoStore.riskScores.get(coin.coin_id) || cryptoStore.computeRisk(coin as any);

    const [report, newsImpact, viability, tokenomics, codeAudit, scenarios, news] = await Promise.all([
      cryptoStore.generateAIReport(coinId),
      cryptoStore.analyzeCoinNewsImpact(coinId, customHeadline),
      cryptoStore.getFutureViability(coin as any),
      cryptoStore.getTokenomicsAudit(coin as any),
      cryptoStore.getCodeAndTeamAudit(coin as any),
      cryptoStore.getPriceScenarios(coin as any),
      cryptoStore.getNews(coin as any),
    ]);

    const detailedReport = await cryptoStore.getDetailedCoinAudit(coinId, customHeadline, newsImpact);

    return NextResponse.json({
      coin,
      report,
      newsImpact,
      risk,
      viability,
      tokenomics,
      codeAudit,
      scenarios,
      news,
      detailedReport,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate full coin and news report" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id: coinId } = await Promise.resolve(params);
    const body = await req.json().catch(() => ({}));
    const customHeadline = body.headline || undefined;

    const coin = (await cryptoStore.getCoin(coinId)) || {
      coin_id: coinId,
      name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
      symbol: coinId.slice(0, 4).toUpperCase(),
      price_usd: 100,
      price_change_24h: 0,
      market_cap: 1000000000,
      volume_24h: 50000000,
    };

    const risk = cryptoStore.riskScores.get(coin.coin_id) || cryptoStore.computeRisk(coin as any);

    const [report, newsImpact, viability, tokenomics, codeAudit, scenarios, news] = await Promise.all([
      cryptoStore.generateAIReport(coinId),
      cryptoStore.analyzeCoinNewsImpact(coinId, customHeadline),
      cryptoStore.getFutureViability(coin as any),
      cryptoStore.getTokenomicsAudit(coin as any),
      cryptoStore.getCodeAndTeamAudit(coin as any),
      cryptoStore.getPriceScenarios(coin as any),
      cryptoStore.getNews(coin as any),
    ]);

    const detailedReport = await cryptoStore.getDetailedCoinAudit(coinId, customHeadline, newsImpact);

    return NextResponse.json({
      coin,
      report,
      newsImpact,
      risk,
      viability,
      tokenomics,
      codeAudit,
      scenarios,
      news,
      detailedReport,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate full coin and news report" },
      { status: 500 }
    );
  }
}
