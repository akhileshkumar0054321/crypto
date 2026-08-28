import { NextRequest, NextResponse } from "next/server";
import { dexScreenerService } from "@/lib/server/dexScreenerService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const forceRefresh = url.searchParams.get("refresh") === "true";
    const trendingCoins = await dexScreenerService.getTrendingSmallCoins(forceRefresh);

    return NextResponse.json({
      success: true,
      total: trendingCoins.length,
      coins: trendingCoins,
      source: "https://api.dexscreener.com/token-profiles/latest/v1 + token-boosts",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in /api/dexscreener/trending:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch DexScreener trending small coins" },
      { status: 500 }
    );
  }
}
