"""
Generative AI report generator.
Uses HuggingFace Phi-2 (CPU) or Mistral 7B (GPU) to generate
professional investment reports with BUY/SELL/HOLD recommendations.
"""
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Optional

from loguru import logger

from app.core.config import settings


class ReportGenerator:
    """
    LLM-powered report generator.
    Loads a local HuggingFace model for offline generation.
    Falls back to template generation if model loading fails.
    """

    REPORT_PROMPT = """<|system|>
You are a professional cryptocurrency analyst at a top investment firm.
Generate a concise, data-driven risk analysis report.
Be factual, objective, and actionable. Use professional financial language.
<|user|>
Generate an executive summary for this cryptocurrency risk report:

Coin: {symbol}
Current Price: ${price}
24h Change: {change_24h}%
Risk Score: {risk_score}/100 ({risk_level})
Recommendation: {recommendation} (Confidence: {confidence}%)

Market Analysis: {market_analysis}
Risk Analysis: {risk_analysis}
On-Chain Analysis: {onchain_analysis}
Sentiment Analysis: {sentiment_analysis}

RAG Context:
{rag_context}

Write a 3-4 sentence executive summary that:
1. States the current market position
2. Explains the primary risk factors
3. Gives the recommendation with justification
<|assistant|>"""

    def __init__(self):
        self._model = None
        self._tokenizer = None
        self._loaded = False
        self._use_fallback = False

    def _load_model(self):
        """Lazy-load the LLM model on first report generation."""
        if self._loaded:
            return

        try:
            from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
            import torch

            model_name = settings.LLM_MODEL
            device = settings.LLM_DEVICE

            logger.info(f"Loading LLM: {model_name} on {device}...")

            self._tokenizer = AutoTokenizer.from_pretrained(
                model_name,
                token=settings.HUGGINGFACE_API_TOKEN,
                trust_remote_code=True,
            )

            self._model = AutoModelForCausalLM.from_pretrained(
                model_name,
                token=settings.HUGGINGFACE_API_TOKEN,
                trust_remote_code=True,
                torch_dtype=torch.float32 if device == "cpu" else torch.float16,
                device_map=device,
                low_cpu_mem_usage=True,
            )

            self._pipe = pipeline(
                "text-generation",
                model=self._model,
                tokenizer=self._tokenizer,
                max_new_tokens=300,
                temperature=0.7,
                do_sample=True,
                pad_token_id=self._tokenizer.eos_token_id,
            )

            self._loaded = True
            logger.success(f"LLM loaded: {model_name} ✅")

        except Exception as e:
            logger.warning(f"LLM loading failed ({e}) — using template generation")
            self._use_fallback = True
            self._loaded = True

    async def generate_report(
        self,
        coin_id: str,
        symbol: str,
        market_data: Dict,
        risk_result: Dict,
        agent_outputs: Dict,
        rag_context: str = "",
    ) -> Dict:
        """
        Generate a complete investment report for a coin.

        Returns:
            Dict with all report sections and metadata
        """
        start_time = time.time()
        self._load_model()

        price = market_data.get("price_usd", 0)
        change_24h = market_data.get("price_change_24h", 0) or 0
        risk_score = risk_result.get("score", 50)
        risk_level = risk_result.get("risk_level", "MEDIUM")
        recommendation = risk_result.get("recommendation", "HOLD")
        confidence = int((risk_result.get("recommendation_confidence", 0.5) or 0.5) * 100)

        # Generate executive summary
        if self._use_fallback:
            executive_summary = self._template_summary(
                symbol, price, change_24h, risk_score, risk_level, recommendation, confidence, agent_outputs
            )
        else:
            executive_summary = self._llm_summary(
                symbol, price, change_24h, risk_score, risk_level,
                recommendation, confidence, agent_outputs, rag_context
            )

        generation_time = time.time() - start_time

        return {
            "title": f"{symbol} Risk Analysis Report — {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
            "executive_summary": executive_summary,
            "market_analysis": agent_outputs.get("market_analysis", ""),
            "risk_analysis": agent_outputs.get("risk_analysis", ""),
            "onchain_analysis": agent_outputs.get("onchain_analysis", ""),
            "sentiment_analysis": agent_outputs.get("sentiment_analysis", ""),
            "recommendation": recommendation,
            "recommendation_confidence": risk_result.get("recommendation_confidence", 0.5),
            "risk_score_at_generation": risk_score,
            "model_used": settings.LLM_MODEL if not self._use_fallback else "template",
            "generation_time_seconds": round(generation_time, 2),
            "rag_context_chunks": {"context": rag_context[:500] if rag_context else ""},
        }

    def _llm_summary(
        self, symbol, price, change_24h, risk_score, risk_level,
        recommendation, confidence, agent_outputs, rag_context
    ) -> str:
        """Generate executive summary using local LLM."""
        prompt = self.REPORT_PROMPT.format(
            symbol=symbol,
            price=f"{price:,.4f}",
            change_24h=f"{change_24h:+.2f}",
            risk_score=f"{risk_score:.1f}",
            risk_level=risk_level,
            recommendation=recommendation,
            confidence=confidence,
            market_analysis=agent_outputs.get("market_analysis", "")[:300],
            risk_analysis=agent_outputs.get("risk_analysis", "")[:300],
            onchain_analysis=agent_outputs.get("onchain_analysis", "")[:200],
            sentiment_analysis=agent_outputs.get("sentiment_analysis", "")[:200],
            rag_context=rag_context[:400] if rag_context else "No additional context.",
        )

        try:
            output = self._pipe(prompt)[0]["generated_text"]
            # Extract only the assistant response
            if "<|assistant|>" in output:
                summary = output.split("<|assistant|>")[-1].strip()
            else:
                summary = output[len(prompt):].strip()
            return summary[:800]  # Cap at 800 chars
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            return self._template_summary(
                symbol, price, change_24h, risk_score, risk_level, recommendation, confidence, agent_outputs
            )

    def _template_summary(
        self, symbol, price, change_24h, risk_score, risk_level,
        recommendation, confidence, agent_outputs
    ) -> str:
        """Deterministic template-based executive summary."""
        trend = "upward" if change_24h > 0 else "downward"
        risk_desc = {
            "LOW": "presents a relatively stable risk profile suitable for conservative positions",
            "MEDIUM": "exhibits moderate risk factors that warrant careful position sizing",
            "HIGH": "carries significant risk factors that require heightened caution",
            "CRITICAL": "displays critical risk signals suggesting extreme caution or avoidance",
        }.get(risk_level, "shows mixed signals")

        rec_rationale = {
            "BUY": f"favorable risk/reward dynamics with a risk score of {risk_score:.1f}/100 support a cautious entry",
            "SELL": f"elevated risk score of {risk_score:.1f}/100 and deteriorating fundamentals suggest reducing exposure",
            "HOLD": f"current risk score of {risk_score:.1f}/100 indicates maintaining existing positions while monitoring developments",
        }.get(recommendation, "current market conditions suggest a neutral stance")

        return (
            f"{symbol} is currently trading at ${price:,.4f}, showing a {trend} move of {change_24h:+.2f}% "
            f"over the past 24 hours. The asset {risk_desc}, with a composite risk score of {risk_score:.1f}/100 ({risk_level}). "
            f"Our multi-agent analysis indicates that {rec_rationale}, "
            f"yielding a {recommendation} recommendation with {confidence}% confidence. "
            f"{'Key risks include: ' + agent_outputs.get('risk_analysis', '')[:150] + '...' if agent_outputs.get('risk_analysis') else ''}"
        )


# ── Singleton ─────────────────────────────────────────────────────────────────
report_generator = ReportGenerator()
