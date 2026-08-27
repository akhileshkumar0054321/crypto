import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const url = new URL(req.url);
  const headline = url.searchParams.get("headline") || undefined;
  const { id } = await Promise.resolve(params);
  
  try {
    const analysis = await cryptoStore.analyzeCoinNewsImpact(id, headline);
    return NextResponse.json(analysis);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate news impact analysis" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(params);
  try {
    const body = await req.json().catch(() => ({}));
    const headline = body.headline || undefined;
    const analysis = await cryptoStore.analyzeCoinNewsImpact(id, headline);
    return NextResponse.json(analysis);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate news impact analysis" },
      { status: 500 }
    );
  }
}

