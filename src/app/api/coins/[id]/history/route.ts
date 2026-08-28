import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30", 10);
  const { id } = await Promise.resolve(params);
  const history = await cryptoStore.getHistory(id, days);
  return NextResponse.json(history);
}
