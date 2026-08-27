import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = body?.query || body?.coin_id || body?.contract_address || "";
    if (!query.trim()) {
      return NextResponse.json({ error: "Search query or contract address required" }, { status: 400 });
    }

    const coin = await cryptoStore.scanCustomCoin(query.trim());
    return NextResponse.json(coin);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to scan coin" }, { status: 500 });
  }
}
