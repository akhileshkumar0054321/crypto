import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "7", 10);
  const ohlc = await cryptoStore.getOhlc(params.id, days);
  return NextResponse.json({
    coin_id: params.id,
    days,
    ohlc,
  });
}
