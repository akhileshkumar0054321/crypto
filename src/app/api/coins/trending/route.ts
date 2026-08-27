import { NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET() {
  const trending = cryptoStore.getTrendingCoins();
  return NextResponse.json(trending);
}
