import { NextRequest, NextResponse } from "next/server";
import { defiLlamaService } from "@/lib/server/defiLlamaService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const chain = searchParams.get("chain") || undefined;
    const protocols = await defiLlamaService.getProtocols(category, chain);
    return NextResponse.json(protocols);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch DeFi protocols", message: err?.message },
      { status: 500 }
    );
  }
}
