import { NextRequest, NextResponse } from "next/server";
import { dexScreenerService } from "@/lib/server/dexScreenerService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = body?.query || body?.tokenAddress || body?.url || "";

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Token address, DexScreener URL, or token name is required" },
        { status: 400 }
      );
    }

    const result = await dexScreenerService.scanDexToken(query.trim());
    return NextResponse.json({
      success: true,
      coin: result.coin,
      dexData: result.dexData,
      source: "DexScreener API",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to scan DexScreener token" },
      { status: 500 }
    );
  }
}
