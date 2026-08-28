import { NextResponse } from "next/server";
import { defiLlamaService } from "@/lib/server/defiLlamaService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const chains = await defiLlamaService.getChains();
    return NextResponse.json(chains);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch DeFi chains", message: err?.message },
      { status: 500 }
    );
  }
}
