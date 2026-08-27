import { NextRequest, NextResponse } from "next/server";
import {
  classifyWithModernFinBERT,
  batchClassifyModernFinBERT,
} from "@/lib/server/modernFinbert";

export const dynamic = "force-dynamic";

const DEFAULT_SAMPLE_SENTENCES = [
  "The company reported strong quarterly earnings with revenue growth of 15% year-over-year, exceeding analyst expectations.",
  "Due to rising inflation and supply chain disruptions, the Federal Reserve decided to increase interest rates by 0.75 basis points.",
  "The merger between the two pharmaceutical giants is expected to create significant synergies and reduce operational costs by $2 billion annually.",
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("sentence");

    if (query) {
      const result = await classifyWithModernFinBERT(query);
      return NextResponse.json({
        success: true,
        model: "tabularisai/ModernFinBERT",
        count: 1,
        results: [result],
      });
    }

    // Default: evaluate the standard test suite
    const results = await batchClassifyModernFinBERT(DEFAULT_SAMPLE_SENTENCES);
    return NextResponse.json({
      success: true,
      model: "tabularisai/ModernFinBERT",
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error("ModernFinBERT GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to run ModernFinBERT classification" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
      sentencesToProcess = DEFAULT_SAMPLE_SENTENCES;
    }

    // Limit batch size to 50 sentences per request
    const batch = sentencesToProcess.slice(0, 50);
    const results = await batchClassifyModernFinBERT(batch);

    return NextResponse.json({
      success: true,
      model: "tabularisai/ModernFinBERT",
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error("ModernFinBERT POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process ModernFinBERT request" },
      { status: 500 }
    );
  }
}
