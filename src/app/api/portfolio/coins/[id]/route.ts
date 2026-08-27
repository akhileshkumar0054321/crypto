import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const holding = cryptoStore.holdings.get(params.id);
  if (!holding) {
    return NextResponse.json({ error: "Holding not found" }, { status: 404 });
  }
  return NextResponse.json(holding);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (cryptoStore.holdings.has(params.id)) {
    cryptoStore.holdings.delete(params.id);
    return NextResponse.json({ status: "deleted", id: params.id });
  }
  return NextResponse.json({ error: "Holding not found" }, { status: 404 });
}
