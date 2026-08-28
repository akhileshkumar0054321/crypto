import { NextResponse } from "next/server";
import { defiLlamaService } from "@/lib/server/defiLlamaService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await defiLlamaService.getOverview();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch DeFi overview", message: err?.message },
      { status: 500 }
    );
  }
}
