import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(params);
  const coin = await cryptoStore.getCoin(id);
  if (!coin) {
    return NextResponse.json({ error: `Coin '${id}' not found` }, { status: 404 });
  }
  return NextResponse.json(coin);
}
