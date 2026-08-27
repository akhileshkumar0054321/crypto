import { NextRequest, NextResponse } from "next/server";
import { cryptoStore, AlertItem } from "@/lib/server/cryptoService";

export async function GET() {
  const alerts = Array.from(cryptoStore.alerts.values());
  return NextResponse.json(alerts);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { coin_id, alert_type, threshold } = body || {};

    if (!coin_id || !alert_type || threshold === undefined) {
      return NextResponse.json(
        { error: "coin_id, alert_type, and threshold are required" },
        { status: 400 }
      );
    }

    const id = `alt-${Date.now()}`;
    const newAlert: AlertItem = {
      id,
      user_id: "usr-demo-1",
      coin_id,
      alert_type,
      threshold: Number(threshold),
      is_active: true,
      triggered_count: 0,
      created_at: new Date().toISOString(),
    };

    cryptoStore.alerts.set(id, newAlert);
    return NextResponse.json(newAlert, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Alert creation error" }, { status: 500 });
  }
}
