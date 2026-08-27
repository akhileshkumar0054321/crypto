import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = `jwt-mock-refreshed-${Date.now()}`;
  return NextResponse.json({
    access_token: token,
    token_type: "bearer",
  });
}
