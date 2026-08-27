import { NextRequest, NextResponse } from "next/server";
import { cryptoStore, PortfolioHolding } from "@/lib/server/cryptoService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { coin_id, quantity, avg_buy_price_usd, notes } = body || {};

    if (!coin_id || quantity === undefined || avg_buy_price_usd === undefined) {
      return NextResponse.json(
        { error: "coin_id, quantity, and avg_buy_price_usd are required" },
        { status: 400 }
      );
    }

    const id = `hld-${Date.now()}`;
    const newHolding: PortfolioHolding = {
      id,
      user_id: "usr-demo-1",
      coin_id,
      quantity: Number(quantity),
      avg_buy_price_usd: Number(avg_buy_price_usd),
      notes: notes || "",
      created_at: new Date().toISOString(),
    };

    cryptoStore.holdings.set(id, newHolding);
    return NextResponse.json(newHolding, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Holding creation error" }, { status: 500 });
  }
}
