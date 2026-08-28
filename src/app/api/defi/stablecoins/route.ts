import { NextResponse } from "next/server";
import { defiLlamaService } from "@/lib/server/defiLlamaService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stablecoins = await defiLlamaService.getStablecoins();
    return NextResponse.json(stablecoins);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch stablecoins data", message: err?.message },
      { status: 500 }
    );
  }
}
