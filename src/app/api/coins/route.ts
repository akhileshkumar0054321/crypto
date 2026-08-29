import { NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const coins = await cryptoStore.getCoins();
    return NextResponse.json(coins);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
