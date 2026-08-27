import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "CryptoRisk Platform",
    timestamp: new Date().toISOString(),
  });
}
