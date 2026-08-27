import { NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET() {
  const reports = Array.from(cryptoStore.reports.values());
  reports.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return NextResponse.json(reports);
}
