import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(params);
  const alert = cryptoStore.alerts.get(id);
  if (!alert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  alert.is_active = !alert.is_active;
  cryptoStore.alerts.set(id, alert);

  return NextResponse.json(alert);
}
