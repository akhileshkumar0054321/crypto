import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const coin_id = body?.coin_id;
    if (!coin_id) {
      return NextResponse.json({ error: "coin_id is required" }, { status: 400 });
    }

    const report = await cryptoStore.generateAIReport(coin_id);
    return NextResponse.json(report, { status: 202 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Report generation failed" }, { status: 500 });
  }
}
