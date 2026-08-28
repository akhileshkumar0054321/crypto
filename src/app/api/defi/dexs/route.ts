import { NextResponse } from "next/server";
import { defiLlamaService } from "@/lib/server/defiLlamaService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dexes = await defiLlamaService.getDexVolumes();
    return NextResponse.json(dexes);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch DEX volumes", message: err?.message },
      { status: 500 }
    );
  }
}
