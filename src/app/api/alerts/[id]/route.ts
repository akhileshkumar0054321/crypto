import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = cryptoStore.alerts.get(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }
  return NextResponse.json(existing);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = cryptoStore.alerts.get(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const updated = {
      ...existing,
      ...body,
      id: existing.id,
      threshold: body?.threshold !== undefined ? Number(body.threshold) : existing.threshold,
    };

    cryptoStore.alerts.set(params.id, updated);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Alert update error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (cryptoStore.alerts.has(params.id)) {
    cryptoStore.alerts.delete(params.id);
    return NextResponse.json({ status: "deleted", id: params.id });
  }
  return NextResponse.json({ error: "Alert not found" }, { status: 404 });
}
