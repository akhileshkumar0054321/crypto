import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "7", 10);
  const { id } = await Promise.resolve(params);
  const ohlc = await cryptoStore.getOhlc(id, days);
  return NextResponse.json({
    coin_id: id,
    days,
    ohlc,
  });
}
