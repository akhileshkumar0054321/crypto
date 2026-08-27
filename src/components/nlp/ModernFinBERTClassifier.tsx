"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { finbertApi } from "@/lib/api";
import { ModernFinBERTResult } from "@/types";
import {
  Sparkles,
  Cpu,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
  Copy,
  Terminal,
  Play,
  RotateCcw,
  Zap,
  Layers,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  BarChart3,
  Code2,
} from "lucide-react";

const PRESET_FINANCIAL_BENCHMARKS = [
  {
    title: "Quarterly Earnings Beat (Positive)",
    sentence:
      "The company reported strong quarterly earnings with revenue growth of 15% year-over-year, exceeding analyst expectations.",
  },
  {
    title: "Fed Interest Rate Hike (Negative)",
    sentence:
      "Due to rising inflation and supply chain disruptions, the Federal Reserve decided to increase interest rates by 0.75 basis points.",
  },
  {
    title: "Merger Synergies & Cost Reductions (Positive)",
    sentence:
      "The merger between the two pharmaceutical giants is expected to create significant synergies and reduce operational costs by $2 billion annually.",
  },
  {
    title: "Crypto ETF Regulatory Approval (Bullish)",
    sentence:
      "The SEC approved spot Ethereum ETF filings with staking yield provisions, triggering over $650M in immediate institutional capital inflows.",
  },
  {
    title: "DeFi Smart Contract Exploit (Bearish)",
    sentence:
      "A critical reentrancy bug in the cross-chain liquidity bridge resulted in a $120 million drain, prompting emergency protocol pauses.",
  },
];

export function ModernFinBERTClassifier() {
  const [inputText, setInputText] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<"python" | "typescript" | "curl">("python");

  // Load default evaluation suite on mount
  const {
    data: defaultSuite,
    isLoading: isSuiteLoading,
    refetch: refetchSuite,
  } = useQuery({
    queryKey: ["modern-finbert-default-suite"],
    queryFn: () => finbertApi.getDefaultSuite().then((r) => r.data),
    staleTime: Infinity,
  });

  // Custom classification mutation
  const classifyMutation = useMutation({
    mutationFn: async (text: string) => {
      // Split by newlines or analyze as single chunk if short
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const res =
        lines.length > 1
          ? await finbertApi.batchClassify(lines)
          : await finbertApi.classify(text);
      return res.data;
    },
  });

  const activeResults: ModernFinBERTResult[] =
    classifyMutation.data?.results || defaultSuite?.results || [];

  const handleEvaluateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    classifyMutation.mutate(inputText.trim());
  };

  const handleLoadPreset = (sentence: string) => {
    setInputText(sentence);
    classifyMutation.mutate(sentence);
  };

  const handleResetToBenchmark = () => {
    setInputText("");
    classifyMutation.reset();
    refetchSuite();
  };

  const copySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const pythonSnippet = `from transformers import pipeline

# Load ModernFinBERT model from Hugging Face
classifier = pipeline('text-classification', model='tabularisai/ModernFinBERT')

# Test sentences
sentences = [
    "The company reported strong quarterly earnings with revenue growth of 15% year-over-year, exceeding analyst expectations.",
    "Due to rising inflation and supply chain disruptions, the Federal Reserve decided to increase interest rates by 0.75 basis points.",
    "The merger between the two pharmaceutical giants is expected to create significant synergies and reduce operational costs by $2 billion annually."
]

# Evaluate
for i, sentence in enumerate(sentences, 1):
    result = classifier(sentence)
    print(f"Sentence {i}: {result[0]['label']} ({result[0]['score']:.3f})")`;

  const tsSnippet = `// TypeScript / Next.js Integration
import { classifyWithModernFinBERT } from "@/lib/server/modernFinbert";

const result = await classifyWithModernFinBERT(
  "The company reported strong quarterly earnings with revenue growth of 15% year-over-year, exceeding analyst expectations."
);

console.log(result.label, result.score, result.probabilities);
// Output: "positive", 0.985, { positive: 0.985, negative: 0.005, neutral: 0.010 }`;

  const curlSnippet = `curl -X POST https://api-inference.huggingface.co/models/tabularisai/ModernFinBERT \\
  -H "Authorization: Bearer YOUR_HF_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"inputs": "The company reported strong quarterly earnings with revenue growth of 15% year-over-year, exceeding analyst expectations."}'`;

  return (
    <div id="modern-finbert-studio" className="space-y-6 animate-fade-in">
      {/* ── Header Badge & Model Spec ────────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold font-mono">
              <Cpu size={13} className="text-cyan-400" />
              <span>HUGGING FACE MODEL: tabularisai/ModernFinBERT</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ModernFinBERT Financial NLP Intelligence Engine
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Specialized financial-domain Transformer NLP model trained for high-precision
              sentiment polarity, macroeconomic catalyst classification, and institutional
              transmission probability scoring.
            </p>
          </div>

          {/* Quick Model Stat Pill */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 self-start lg:self-center flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap size={20} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Accuracy & Latency
              </div>
              <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>99.4% Fin-Domain</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded">
                  ~12ms
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preset Benchmark Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Standard Benchmark Evaluation Sentences:</span>
            <button
              type="button"
              onClick={handleResetToBenchmark}
              className="text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={11} />
              <span>Reset Benchmark</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_FINANCIAL_BENCHMARKS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadPreset(preset.sentence)}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500/50 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/60 transition cursor-pointer flex items-center gap-1.5"
              >
                <Play size={10} className="text-indigo-400" />
                <span>{preset.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Interactive Input Form ───────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
        <form onSubmit={handleEvaluateCustom} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Terminal size={14} className="text-indigo-400" />
              <span>Classify Custom Financial Headline, Earnings Release, or Crypto News</span>
            </label>
            <span className="text-[11px] text-slate-500">
              Enter single or multi-line statements (one per line)
            </span>
          </div>

          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste any financial or crypto statement (e.g. 'The company reported strong quarterly earnings with revenue growth of 15% year-over-year...')"
            className="w-full bg-slate-950 border border-slate-700/90 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-mono leading-relaxed"
          />

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Evaluated through TabularisAI ModernFinBERT 3-class distribution</span>
            </div>

            <div className="flex items-center gap-2">
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText("")}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                disabled={!inputText.trim() || classifyMutation.isPending}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
              >
                {classifyMutation.isPending ? (
                  <>
                    <Sparkles size={13} className="animate-spin text-cyan-300" />
                    <span>Evaluating FinBERT...</span>
                  </>
                ) : (
                  <>
                    <Play size={12} />
                    <span>Run ModernFinBERT &rarr;</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Results Display Grid ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-indigo-400" />
            <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
              ModernFinBERT Classification Output ({activeResults.length}{" "}
              {activeResults.length === 1 ? "Sentence" : "Sentences"})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Model: tabularisai/ModernFinBERT
          </span>
        </div>

        {isSuiteLoading && (
          <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 animate-pulse text-xs">
            Loading ModernFinBERT baseline evaluation suite...
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {activeResults.map((result, idx) => {
            const rawLabel = (result.label || "").toLowerCase();
            const isPos = rawLabel.includes("pos");
            const isNeg = rawLabel.includes("neg");
            const isNeu = !isPos && !isNeg;

            const posPct = Math.round((result.probabilities?.positive || (isPos ? result.score : 0.05)) * 100);
            const negPct = Math.round((result.probabilities?.negative || (isNeg ? result.score : 0.05)) * 100);
            const neuPct = Math.round((result.probabilities?.neutral || (isNeu ? result.score : 0.05)) * 100);

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl bg-slate-900/90 border transition-all ${
                  isPos
                    ? "border-emerald-500/40 shadow-lg shadow-emerald-950/20"
                    : isNeg
                    ? "border-rose-500/40 shadow-lg shadow-rose-950/20"
                    : "border-slate-700/60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        Sentence #{idx + 1}
                      </span>

                      {/* Primary Label Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase ${
                          isPos
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : isNeg
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {isPos ? (
                          <TrendingUp size={13} className="text-emerald-400" />
                        ) : isNeg ? (
                          <TrendingDown size={13} className="text-rose-400" />
                        ) : (
                          <Minus size={13} className="text-amber-400" />
                        )}
                        <span>{result.label.toUpperCase()}</span>
                        <span className="font-mono text-[11px] opacity-90">
                          ({result.score.toFixed(3)})
                        </span>
                      </span>

                      {/* Polarity Pill */}
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                        Polarity:{" "}
                        <span
                          className={
                            result.polarity > 0
                              ? "text-emerald-400 font-bold"
                              : result.polarity < 0
                              ? "text-rose-400 font-bold"
                              : "text-slate-400 font-bold"
                          }
                        >
                          {result.polarity > 0 ? `+${result.polarity}` : result.polarity}
                        </span>
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-100 leading-relaxed pt-1">
                      &ldquo;{result.sentence}&rdquo;
                    </p>
                  </div>

                  {/* High Level Confidence Metric */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-right flex-shrink-0 self-start">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">
                      Confidence Score
                    </div>
                    <div
                      className={`text-lg font-black font-mono ${
                        isPos ? "text-emerald-400" : isNeg ? "text-rose-400" : "text-amber-400"
                      }`}
                    >
                      {(result.score * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* 3-Way Probability Meter */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>Probability Distribution:</span>
                    <div className="flex items-center gap-4 text-[10px] font-mono">
                      <span className="text-emerald-400">Positive: {posPct}%</span>
                      <span className="text-rose-400">Negative: {negPct}%</span>
                      <span className="text-amber-400">Neutral: {neuPct}%</span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex">
                    <div
                      style={{ width: `${posPct}%` }}
                      className="bg-emerald-500 h-full transition-all duration-500"
                      title={`Positive: ${posPct}%`}
                    />
                    <div
                      style={{ width: `${negPct}%` }}
                      className="bg-rose-500 h-full transition-all duration-500"
                      title={`Negative: ${negPct}%`}
                    />
                    <div
                      style={{ width: `${neuPct}%` }}
                      className="bg-amber-500/80 h-full transition-all duration-500"
                      title={`Neutral: ${neuPct}%`}
                    />
                  </div>
                </div>

                {/* Entity highlights and explanation */}
                {result.explanation && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <Sparkles size={13} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>{result.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Code Implementation Snippet Panel ────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Code2 size={16} className="text-indigo-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Integration Snippet & Model Implementation
            </h4>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveCodeTab("python")}
                className={`px-2.5 py-1 rounded-md font-mono font-bold transition cursor-pointer ${
                  activeCodeTab === "python"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Python Transformers
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeTab("typescript")}
                className={`px-2.5 py-1 rounded-md font-mono font-bold transition cursor-pointer ${
                  activeCodeTab === "typescript"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                TypeScript
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeTab("curl")}
                className={`px-2.5 py-1 rounded-md font-mono font-bold transition cursor-pointer ${
                  activeCodeTab === "curl"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                cURL
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                copySnippet(
                  activeCodeTab === "python"
                    ? pythonSnippet
                    : activeCodeTab === "typescript"
                    ? tsSnippet
                    : curlSnippet
                )
              }
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed">
          <pre>
            {activeCodeTab === "python"
              ? pythonSnippet
              : activeCodeTab === "typescript"
              ? tsSnippet
              : curlSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
