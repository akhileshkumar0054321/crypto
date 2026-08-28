import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(params);
  const holding = cryptoStore.holdings.get(id);
  if (!holding) {
    return NextResponse.json({ error: "Holding not found" }, { status: 404 });
  }
  return NextResponse.json(holding);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(params);
  if (cryptoStore.holdings.has(id)) {
    cryptoStore.holdings.delete(id);
    return NextResponse.json({ status: "deleted", id });
  }
  return NextResponse.json({ error: "Holding not found" }, { status: 404 });
}
