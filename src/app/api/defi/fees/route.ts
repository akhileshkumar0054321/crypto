import { NextResponse } from "next/server";
import { defiLlamaService } from "@/lib/server/defiLlamaService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const fees = await defiLlamaService.getFeesAndRevenue();
    return NextResponse.json(fees);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch DeFi fees and revenue", message: err?.message },
      { status: 500 }
    );
  }
}
