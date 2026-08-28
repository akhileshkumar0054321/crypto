import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(params);
  const report = cryptoStore.reports.get(id);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
  return NextResponse.json(report);
}
