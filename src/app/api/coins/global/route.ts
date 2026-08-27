import { NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET() {
  const globalStats = cryptoStore.getGlobalStats();
  return NextResponse.json(globalStats);
}
