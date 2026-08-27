import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const alert = cryptoStore.alerts.get(params.id);
  if (!alert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  alert.is_active = !alert.is_active;
  cryptoStore.alerts.set(params.id, alert);

  return NextResponse.json(alert);
}
