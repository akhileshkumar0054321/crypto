import { NextRequest, NextResponse } from "next/server";
import { defiLlamaService } from "@/lib/server/defiLlamaService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stableOnly = searchParams.get("stableOnly") === "true";
    const chain = searchParams.get("chain") || undefined;
    const minTvl = searchParams.get("minTvl") ? parseInt(searchParams.get("minTvl")!, 10) : 500000;

    const pools = await defiLlamaService.getYieldPools(stableOnly, chain, minTvl);
    return NextResponse.json(pools);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch DeFi yield pools", message: err?.message },
      { status: 500 }
    );
  }
}
