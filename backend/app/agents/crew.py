"""
Multi-Agent System using CrewAI.
6 specialized agents collaborate to produce comprehensive crypto risk reports.
"""
from typing import Dict, Optional

from loguru import logger


def create_agent_system():
    """
    Create and return the full CrewAI agent crew.
    Lazy import to avoid startup cost if crewai isn't installed.
    """
    try:
        from crewai import Agent, Crew, Process, Task
        from crewai.tools import BaseTool
        return _build_crew(Agent, Crew, Process, Task)
    except ImportError:
        logger.warning("CrewAI not installed — using simplified agent pipeline")
        return None


def _build_crew(Agent, Crew, Process, Task):
    """Build the 6-agent CrewAI crew for crypto analysis."""

    # ── Agent Definitions ──────────────────────────────────────────────────────

    market_analyst = Agent(
        role="Senior Crypto Market Analyst",
        goal=(
            "Analyze technical indicators, price action, and trading patterns "
            "to identify market trends and momentum for {coin_id}."
        ),
        backstory=(
            "You are a veteran crypto trader with 10 years of experience in technical analysis. "
            "You excel at reading charts, identifying support/resistance levels, "
            "and spotting momentum shifts before they happen. "
            "You use RSI, MACD, Bollinger Bands, and volume analysis."
        ),
        verbose=False,
        allow_delegation=False,
    )

    risk_assessor = Agent(
        role="Quantitative Risk Manager",
        goal=(
            "Compute and explain the composite risk score for {coin_id} "
            "using ML model outputs and statistical risk factors."
        ),
        backstory=(
            "You are a quantitative analyst from a top hedge fund, specializing in "
            "crypto risk modeling. You understand XGBoost, Random Forest, and "
            "Isolation Forest anomaly detection. You translate complex model outputs "
            "into clear, actionable risk assessments."
        ),
        verbose=False,
        allow_delegation=False,
    )

    onchain_analyst = Agent(
        role="Blockchain Forensics Expert",
        goal=(
            "Investigate on-chain activity for {coin_id}: whale movements, "
            "exchange flows, smart contract security, and transaction patterns."
        ),
        backstory=(
            "You are a blockchain forensics specialist who has worked with "
            "Chainalysis and CipherTrace. You can detect wash trading, "
            "money laundering patterns, and smart contract exploits "
            "by analyzing raw on-chain data from Etherscan and Alchemy."
        ),
        verbose=False,
        allow_delegation=False,
    )

    sentiment_agent = Agent(
        role="Crypto Social Intelligence Analyst",
        goal=(
            "Analyze social media sentiment, community health, and news flow "
            "for {coin_id} to gauge market psychology."
        ),
        backstory=(
            "You are a social intelligence specialist with expertise in NLP "
            "and crypto community dynamics. You monitor Reddit, Twitter, Telegram, "
            "and news to identify sentiment shifts, FUD campaigns, and viral narratives "
            "that drive crypto price movements."
        ),
        verbose=False,
        allow_delegation=False,
    )

    coordinator = Agent(
        role="Chief Risk Officer",
        goal=(
            "Synthesize all analyst reports for {coin_id} into a coherent, "
            "balanced risk assessment and final recommendation."
        ),
        backstory=(
            "You are a seasoned Chief Risk Officer at a crypto investment firm. "
            "You take reports from multiple analysts and combine them into "
            "clear, actionable investment guidance. You are objective, "
            "data-driven, and always consider both upside potential and downside risks."
        ),
        verbose=False,
        allow_delegation=True,
    )

    report_generator = Agent(
        role="Financial Report Writer",
        goal=(
            "Generate a professional, comprehensive risk report for {coin_id} "
            "with clear sections, data-driven insights, and actionable recommendations."
        ),
        backstory=(
            "You are a financial writer with expertise in creating institutional-grade "
            "research reports. You translate complex technical analysis into clear, "
            "professional prose that is both informative and actionable for traders."
        ),
        verbose=False,
        allow_delegation=False,
    )

    return {
        "market_analyst": market_analyst,
        "risk_assessor": risk_assessor,
        "onchain_analyst": onchain_analyst,
        "sentiment_agent": sentiment_agent,
        "coordinator": coordinator,
        "report_generator": report_generator,
        "Agent": Agent,
        "Crew": Crew,
        "Process": Process,
        "Task": Task,
    }


class AgentOrchestrator:
    """
    Orchestrates the multi-agent analysis pipeline.
    Uses CrewAI if available, falls back to sequential pipeline.
    """

    def __init__(self):
        self._crew_components = None

    def _get_crew(self):
        if self._crew_components is None:
            self._crew_components = create_agent_system()
        return self._crew_components

    async def analyze(
        self,
        coin_id: str,
        symbol: str,
        market_data: Dict,
        risk_result: Dict,
        onchain: Dict,
        sentiment: Dict,
        rag_context: str = "",
    ) -> Dict:
        """
        Run full multi-agent analysis. Returns structured report sections.
        """
        agents = self._get_crew()

        if agents:
            return await self._crewai_analysis(
                agents, coin_id, symbol, market_data, risk_result, onchain, sentiment, rag_context
            )
        else:
            return self._fallback_analysis(
                coin_id, symbol, market_data, risk_result, onchain, sentiment
            )

    async def _crewai_analysis(self, agents, coin_id, symbol, market_data, risk_result, onchain, sentiment, rag_context) -> Dict:
        """Run CrewAI crew asynchronously."""
        import asyncio
        Agent = agents["Agent"]
        Crew = agents["Crew"]
        Process = agents["Process"]
        Task = agents["Task"]

        context_str = self._build_context_string(coin_id, symbol, market_data, risk_result, onchain, sentiment)

        tasks = [
            Task(
                description=f"""Analyze technical indicators for {symbol}. Data:\n{context_str}
                Provide: trend direction, key support/resistance, RSI interpretation, volume analysis.""",
                agent=agents["market_analyst"],
                expected_output="Technical analysis summary (3-4 sentences)",
            ),
            Task(
                description=f"""Assess risk for {symbol}. Data:\n{context_str}
                Risk Score: {risk_result.get('score', 0):.1f}/100. 
                Explain each component score and fraud detection results.""",
                agent=agents["risk_assessor"],
                expected_output="Risk assessment with component breakdown (3-4 sentences)",
            ),
            Task(
                description=f"""Investigate on-chain activity for {symbol}. Data:\n{context_str}
                Look for: whale activity, exchange flows, contract safety.""",
                agent=agents["onchain_analyst"],
                expected_output="On-chain analysis (3-4 sentences)",
            ),
            Task(
                description=f"""Analyze social sentiment for {symbol}. Data:\n{context_str}
                Evaluate Reddit sentiment and news coverage.""",
                agent=agents["sentiment_agent"],
                expected_output="Sentiment analysis (2-3 sentences)",
            ),
        ]

        crew = Crew(
            agents=[
                agents["market_analyst"], agents["risk_assessor"],
                agents["onchain_analyst"], agents["sentiment_agent"],
            ],
            tasks=tasks,
            process=Process.sequential,
            verbose=False,
        )

        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, crew.kickoff)
            task_outputs = [str(t.output) if hasattr(t, 'output') else "" for t in tasks]
        except Exception as e:
            logger.error(f"CrewAI analysis failed: {e}")
            return self._fallback_analysis(coin_id, symbol, market_data, risk_result, onchain, sentiment)

        return {
            "market_analysis": task_outputs[0] if len(task_outputs) > 0 else "",
            "risk_analysis": task_outputs[1] if len(task_outputs) > 1 else "",
            "onchain_analysis": task_outputs[2] if len(task_outputs) > 2 else "",
            "sentiment_analysis": task_outputs[3] if len(task_outputs) > 3 else "",
        }

    def _fallback_analysis(self, coin_id, symbol, market_data, risk_result, onchain, sentiment) -> Dict:
        """Template-based analysis when CrewAI is unavailable."""
        price = market_data.get("price_usd", 0)
        change_24h = market_data.get("price_change_24h", 0) or 0
        score = risk_result.get("score", 50)
        risk_level = risk_result.get("risk_level", "MEDIUM")
        recommendation = risk_result.get("recommendation", "HOLD")
        rsi = risk_result.get("feature_snapshot", {}).get("rsi_14", 0.5) * 100

        market_analysis = (
            f"{symbol} is currently trading at ${price:,.4f}, "
            f"with a 24-hour change of {change_24h:+.2f}%. "
            f"RSI at {rsi:.1f} indicates {'overbought conditions' if rsi > 70 else 'oversold conditions' if rsi < 30 else 'neutral momentum'}. "
            f"{'Strong buying pressure with above-average volume suggests momentum continuation.' if change_24h > 5 else 'Selling pressure is dominant with elevated volume on down moves.'}"
        )

        risk_analysis = (
            f"The composite risk score for {symbol} is {score:.1f}/100 ({risk_level} risk). "
            f"Volatility contributes {risk_result.get('volatility_score', 0):.1f} points, "
            f"liquidity {risk_result.get('liquidity_score', 0):.1f} points, "
            f"and on-chain activity {risk_result.get('onchain_score', 0):.1f} points. "
            f"{'⚠️ Fraud signals detected: ' + ', '.join(filter(None, ['Pump & Dump' if risk_result.get('pump_dump_detected') else None, 'Wash Trading' if risk_result.get('wash_trading_detected') else None, 'Honeypot' if risk_result.get('honeypot_detected') else None])) if any([risk_result.get('pump_dump_detected'), risk_result.get('wash_trading_detected'), risk_result.get('honeypot_detected')]) else 'No fraud signals detected.'}"
        )

        tx_count = onchain.get("tx_count_24h", 0)
        whale_acc = onchain.get("whale_accumulation", 0)
        onchain_analysis = (
            f"{tx_count:,} transactions recorded in the last 24 hours. "
            f"Whale accumulation shows {'net buying' if whale_acc > 0 else 'net selling'} of ${abs(whale_acc):,.0f} USD equivalent. "
            f"Exchange flows indicate {'accumulation (coins leaving exchanges)' if onchain.get('exchange_outflow', 0) > onchain.get('exchange_inflow', 0) else 'distribution (coins entering exchanges)'}. "
            f"{'Contract is verified on Etherscan.' if not onchain.get('honeypot_risk') else '⚠️ Contract is unverified — honeypot risk elevated.'}"
        )

        sent_score = sentiment.get("combined_score", 0)
        mention_count = sentiment.get("reddit", {}).get("mention_count", 0)
        sentiment_analysis = (
            f"Social sentiment for {symbol} is {'positive' if sent_score > 0.1 else 'negative' if sent_score < -0.1 else 'neutral'} "
            f"with a combined score of {sent_score:+.2f}. "
            f"{mention_count} mentions analyzed across Reddit and news sources. "
            f"{'Growing community engagement supports bullish narrative.' if sent_score > 0 else 'Negative sentiment and declining engagement raise caution flags.'}"
        )

        return {
            "market_analysis": market_analysis,
            "risk_analysis": risk_analysis,
            "onchain_analysis": onchain_analysis,
            "sentiment_analysis": sentiment_analysis,
        }

    def _build_context_string(self, coin_id, symbol, market_data, risk_result, onchain, sentiment) -> str:
        return f"""
Coin: {symbol} ({coin_id})
Price: ${market_data.get('price_usd', 0):,.4f}
24h Change: {market_data.get('price_change_24h', 0):+.2f}%
7d Change: {market_data.get('price_change_7d', 0):+.2f}%
Market Cap Rank: #{market_data.get('market_cap_rank', 'N/A')}
Volume 24h: ${market_data.get('volume_24h', 0):,.0f}
Risk Score: {risk_result.get('score', 0):.1f}/100 ({risk_result.get('risk_level', 'UNKNOWN')})
Recommendation: {risk_result.get('recommendation', 'HOLD')} ({risk_result.get('recommendation_confidence', 0):.0%} confidence)
Fraud Flags: pump_dump={risk_result.get('pump_dump_detected', False)}, wash_trading={risk_result.get('wash_trading_detected', False)}, honeypot={risk_result.get('honeypot_detected', False)}
Transactions 24h: {onchain.get('tx_count_24h', 0):,}
Whale Activity: ${onchain.get('whale_accumulation', 0):,.0f}
Sentiment: {sentiment.get('combined_score', 0):+.2f} (Reddit mentions: {sentiment.get('reddit', {}).get('mention_count', 0)})
"""


# ── Singleton ─────────────────────────────────────────────────────────────────
orchestrator = AgentOrchestrator()
