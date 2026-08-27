import { NextRequest, NextResponse } from "next/server";
import { dexScreenerService } from "@/lib/server/dexScreenerService";

export async function GET(req: NextRequest) {
  try {
    const profiles = await dexScreenerService.fetchLatestProfiles();
    return NextResponse.json({
      success: true,
      total: profiles.length,
      profiles,
      source: "https://api.dexscreener.com/token-profiles/latest/v1",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch DexScreener profiles" },
      { status: 500 }
    );
  }
}
