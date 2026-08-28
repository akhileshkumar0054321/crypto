import { NextRequest, NextResponse } from "next/server";
import { classifyWithCryptoBERT, batchClassifyCryptoBERT } from "@/lib/server/cryptoBert";

export const dynamic = "force-dynamic";

const DEFAULT_SAMPLE_CRYPTO_SENTENCES = [
  "Institutional Spot Bitcoin ETFs Register $420M Net Inflow as sovereign funds accumulate.",
  "Major decentralized bridge exploit drains $15M from liquidity pool causing panic selling.",
  "Ethereum network staking participation holds steady at 28.5% with calm gas fee burn.",
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("sentence") || searchParams.get("text");

    if (query) {
      const result = await classifyWithCryptoBERT(query);
      return NextResponse.json({
        success: true,
        model: "ElKulako/cryptobert",
        provider: result.provider,
        count: 1,
        results: [result],
      });
    }

    const results = await batchClassifyCryptoBERT(DEFAULT_SAMPLE_CRYPTO_SENTENCES);
    return NextResponse.json({
      success: true,
      model: "ElKulako/cryptobert",
      provider: results[0]?.provider || "crypto-nlp-engine",
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error("CryptoBERT GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to run CryptoBERT classification" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let sentencesToProcess: string[] = [];

    if (Array.isArray(body.sentences) && body.sentences.length > 0) {
      sentencesToProcess = body.sentences.filter(
        (s: any) => typeof s === "string" && s.trim().length > 0
      );
    } else if (typeof body.sentence === "string" && body.sentence.trim().length > 0) {
      sentencesToProcess = [body.sentence.trim()];
    } else if (typeof body.text === "string" && body.text.trim().length > 0) {
      sentencesToProcess = [body.text.trim()];
    }

    if (sentencesToProcess.length === 0) {
      sentencesToProcess = DEFAULT_SAMPLE_CRYPTO_SENTENCES;
    }

    // Limit batch size to 50 sentences per request
    const batch = sentencesToProcess.slice(0, 50);
    const results = await batchClassifyCryptoBERT(batch);

    return NextResponse.json({
      success: true,
      model: "ElKulako/cryptobert",
      provider: results[0]?.provider || "crypto-nlp-engine",
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error("CryptoBERT POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process CryptoBERT request" },
      { status: 500 }
    );
  }
}
