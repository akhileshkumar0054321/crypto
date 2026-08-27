"""
RAG System — Document ingestion, embedding, and retrieval.
Uses ChromaDB as vector store + sentence-transformers for embeddings.
"""
import hashlib
import os
from pathlib import Path
from typing import Dict, List, Optional

from loguru import logger

from app.core.config import settings

VECTOR_STORE_PATH = Path(settings.VECTOR_STORE_PATH)
VECTOR_STORE_PATH.mkdir(parents=True, exist_ok=True)

# Knowledge base: curated crypto risk knowledge
CRYPTO_KNOWLEDGE_BASE = [
    {
        "id": "pump_dump_001",
        "topic": "fraud",
        "title": "Pump and Dump Detection",
        "content": """
        Pump and dump schemes are market manipulation tactics where coordinated buying artificially 
        inflates a cryptocurrency's price (the pump), followed by a rapid sell-off (the dump), 
        leaving other investors with losses. Key indicators include:
        - Sudden price increase of 20%+ within 1 hour on low market cap coins
        - Trading volume spike of 500-1000% above 7-day average
        - Social media coordinated messaging across Telegram/Discord
        - Very few unique wallet addresses responsible for volume (wash trading)
        - No fundamental news catalyst justifying the price move
        Risk score contribution: +25 to +40 points when detected.
        """,
    },
    {
        "id": "wash_trading_001",
        "topic": "fraud",
        "title": "Wash Trading Detection",
        "content": """
        Wash trading involves simultaneously buying and selling the same asset to generate 
        artificial activity. Common patterns:
        - High reported volume but very few unique active addresses
        - Trades occurring between the same wallet clusters
        - Volume/price ratio far exceeding market norms
        - Exchange inflow and outflow matching almost exactly
        - Transaction fees being recirculated to original sender
        Detection threshold: transaction volume > 5x average with active addresses < 10% of normal.
        """,
    },
    {
        "id": "honeypot_001",
        "topic": "fraud",
        "title": "Honeypot Contract Detection",
        "content": """
        Honeypot contracts are malicious smart contracts that allow users to buy tokens but 
        prevent them from selling. Warning signs:
        - Unverified smart contract source code on Etherscan
        - Hidden ownership functions (onlyOwner modifiers)
        - Tax rates exceeding 10% on sells but not buys
        - Only the deployer wallet has made successful sell transactions
        - Contract includes blacklist or whitelist functionality
        - Token liquidity locked to a single deployer-controlled pool
        Always verify: contract source code, liquidity lock status, team wallet holdings.
        """,
    },
    {
        "id": "volatility_001",
        "topic": "risk",
        "title": "Cryptocurrency Volatility Risk",
        "content": """
        Crypto assets exhibit significantly higher volatility than traditional assets.
        Bitcoin's annualized volatility typically ranges from 50-80%, compared to S&P 500's 15-20%.
        Altcoins can experience 200-500% annualized volatility.
        
        Risk scoring framework:
        - Daily price change < 5%: Low volatility (score: 0-20)
        - Daily price change 5-15%: Medium volatility (score: 20-50)  
        - Daily price change > 15%: High volatility (score: 50-100)
        
        Volatility amplifiers: thin liquidity, concentrated ownership, low market cap.
        RSI > 70 = overbought (sell pressure likely), RSI < 30 = oversold (bounce likely).
        Bollinger Band breakouts with high volume confirm directional momentum.
        """,
    },
    {
        "id": "liquidity_001",
        "topic": "risk",
        "title": "Liquidity Risk in Crypto Markets",
        "content": """
        Liquidity risk is the danger of being unable to exit a position without significant 
        price impact. Key metrics:
        - Bid-ask spread: < 0.1% healthy, > 1% concerning, > 5% dangerous
        - Order book depth: total buy/sell orders within 2% of mid price
        - Market depth imbalance: heavy sell walls indicate distribution phase
        - Exchange listings: more reputable exchanges = better liquidity
        
        Low liquidity red flags:
        - 24h volume < 1% of market cap
        - Listed only on DEX without centralized exchange presence
        - Single liquidity provider controlling pool
        - Large bid-ask spread during normal market hours
        """,
    },
    {
        "id": "onchain_001",
        "topic": "onchain",
        "title": "On-Chain Analytics for Risk Assessment",
        "content": """
        On-chain data provides transparency into actual network usage vs. speculative trading:
        
        Healthy signals:
        - Growing unique active addresses month-over-month
        - Increasing transaction count with stable or growing values
        - Exchange outflows exceeding inflows (accumulation by holders)
        - Whale addresses increasing holdings over 30 days
        - TVL growth in associated DeFi protocols
        
        Risk signals:
        - Exchange inflows spiking (whales moving to sell)
        - Decreasing active addresses despite price pumps
        - Top 10 wallets controlling > 60% of supply
        - Smart money exits via OTC or dark pool transactions
        - Miner/validator selling pressure increasing
        """,
    },
    {
        "id": "sentiment_001",
        "topic": "sentiment",
        "title": "Social Sentiment Analysis for Crypto",
        "content": """
        Social sentiment is a leading indicator that often precedes price movements by 24-72 hours.
        
        Positive signals:
        - Sustained positive sentiment with growing mention velocity
        - Organic growth in Reddit subscribers and Discord members
        - Mainstream media coverage with factual reporting
        - Developer activity increasing on GitHub
        
        Negative signals:
        - FUD (Fear, Uncertainty, Doubt) campaigns coordinated across platforms
        - Rapid sentiment reversal from positive to negative
        - Celebrity or influencer pump followed by dump
        - Regulatory news causing broad market fear
        
        Sentiment scoring: FinBERT model outputs positive/negative/neutral probabilities.
        Combined score range: -1.0 (max negative) to +1.0 (max positive).
        """,
    },
    {
        "id": "defi_001",
        "topic": "defi",
        "title": "DeFi Protocol Risk Assessment",
        "content": """
        DeFi protocols carry unique smart contract and economic risks:
        
        Smart contract risks:
        - Unaudited code: 10x higher exploit probability
        - Upgrade mechanisms: proxy contracts can be maliciously upgraded
        - Oracle manipulation: flash loan attacks on price oracles
        - Reentrancy vulnerabilities: the most common DeFi exploit vector
        
        Economic risks:
        - Impermanent loss in liquidity pools during high volatility
        - Liquidation cascades in lending protocols during price crashes
        - TVL concentration: top 3 protocols controlling > 60% = systemic risk
        - Ponzi tokenomics: unsustainable APY funded by new capital inflows
        
        Major historical hacks: Poly Network ($611M), Ronin Bridge ($625M), 
        Wormhole ($320M), Euler Finance ($197M).
        """,
    },
    {
        "id": "risk_scoring_001",
        "topic": "methodology",
        "title": "Risk Score Methodology (0-100)",
        "content": """
        Our composite risk score aggregates 5 dimensions:
        
        1. Volatility Score (25% weight): Measures price stability
           - RSI extremes, Bollinger Band position, 7-day std deviation
        
        2. Liquidity Score (20% weight): Market depth and spread
           - Bid-ask spread, order book imbalance, exchange coverage
        
        3. On-Chain Score (25% weight): Blockchain fundamentals
           - Active addresses, whale movements, exchange flows
        
        4. Sentiment Score (15% weight): Social signals
           - Reddit sentiment, news tone, mention velocity
        
        5. Fraud Score (15% weight): Manipulation detection
           - Pump/dump patterns, wash trading, honeypot flags
        
        Score interpretation:
        - 0-30: LOW risk — suitable for conservative allocation
        - 30-60: MEDIUM risk — standard due diligence recommended
        - 60-80: HIGH risk — position sizing caution advised
        - 80-100: CRITICAL — extreme caution or avoid
        """,
    },
    {
        "id": "bitcoin_001",
        "topic": "asset",
        "title": "Bitcoin (BTC) Risk Profile",
        "content": """
        Bitcoin is the most liquid and widely-held cryptocurrency.
        Risk characteristics:
        - Highest market cap: reduces manipulation risk
        - Most regulated: ETF approvals reduce regulatory risk
        - Halving cycles: supply reduction every ~4 years drives bull cycles
        - Mining concentration: top 3 pools control ~60% hash rate
        - Lightning Network: second-layer scaling reduces congestion risk
        - Typical risk score range: 15-40 (LOW to MEDIUM)
        - Major risk events: exchange hacks, regulatory bans, miner capitulation
        """,
    },
    {
        "id": "ethereum_001",
        "topic": "asset",
        "title": "Ethereum (ETH) Risk Profile",
        "content": """
        Ethereum is the leading smart contract platform.
        Risk characteristics:
        - Transition to Proof of Stake reduced energy risk and improved security
        - EIP-1559: fee burning creates deflationary pressure
        - Staking concentration: top liquid staking protocols control large share
        - DeFi dependency: ETH price correlates with DeFi TVL
        - Layer 2 ecosystem: Arbitrum, Optimism, Base reducing congestion
        - Typical risk score range: 20-45 (LOW to MEDIUM)
        - Key risks: smart contract bugs in core infrastructure, regulatory treatment as security
        """,
    },
]


class RAGSystem:
    """
    Retrieval-Augmented Generation system for crypto knowledge.
    Embeds documents into ChromaDB and retrieves relevant context for AI reports.
    """

    def __init__(self):
        self.collection = None
        self.embedder = None
        self._initialized = False

    def initialize(self):
        """Initialize ChromaDB and load the embedding model."""
        if self._initialized:
            return

        try:
            import chromadb
            from chromadb.config import Settings as ChromaSettings
            from sentence_transformers import SentenceTransformer

            # ChromaDB persistent client
            self.chroma_client = chromadb.PersistentClient(
                path=str(VECTOR_STORE_PATH),
                settings=ChromaSettings(anonymized_telemetry=False),
            )

            # Get or create collection
            self.collection = self.chroma_client.get_or_create_collection(
                name="crypto_knowledge",
                metadata={"hnsw:space": "cosine"},
            )

            # Load embedding model
            logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
            self.embedder = SentenceTransformer(settings.EMBEDDING_MODEL)

            self._initialized = True
            logger.info("RAG system initialized ✅")

            # Ingest knowledge base if collection is empty
            if self.collection.count() == 0:
                self._ingest_knowledge_base()

        except ImportError as e:
            logger.warning(f"RAG dependencies not installed: {e}")
        except Exception as e:
            logger.error(f"RAG initialization failed: {e}")

    def _ingest_knowledge_base(self):
        """Ingest the built-in crypto knowledge base into ChromaDB."""
        if not self._initialized:
            return

        docs = CRYPTO_KNOWLEDGE_BASE
        ids = [d["id"] for d in docs]
        texts = [d["title"] + "\n\n" + d["content"] for d in docs]
        metadatas = [{"topic": d["topic"], "title": d["title"]} for d in docs]

        # Batch embed
        embeddings = self.embedder.encode(texts, show_progress_bar=False).tolist()

        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
        )
        logger.info(f"Ingested {len(docs)} documents into ChromaDB")

    def add_document(self, doc_id: str, title: str, content: str, topic: str = "general"):
        """Add a custom document (whitepaper, audit, news) to the knowledge base."""
        if not self._initialized:
            self.initialize()
        if not self._initialized:
            return False

        text = f"{title}\n\n{content}"
        embedding = self.embedder.encode([text])[0].tolist()

        # Use hash of content as ID if not provided
        if not doc_id:
            doc_id = hashlib.md5(text.encode()).hexdigest()[:12]

        self.collection.add(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[text],
            metadatas=[{"topic": topic, "title": title}],
        )
        logger.info(f"Document added to RAG: {title[:50]}")
        return True

    def query(
        self,
        query_text: str,
        n_results: int = 3,
        topic_filter: Optional[str] = None,
    ) -> List[Dict]:
        """
        Retrieve the most relevant documents for a query.

        Returns:
            List of dicts with 'content', 'title', 'topic', 'distance'
        """
        if not self._initialized:
            self.initialize()
        if not self._initialized or self.collection is None:
            return []

        try:
            where = {"topic": topic_filter} if topic_filter else None
            query_embedding = self.embedder.encode([query_text])[0].tolist()

            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=min(n_results, self.collection.count()),
                where=where,
                include=["documents", "metadatas", "distances"],
            )

            output = []
            for i in range(len(results["ids"][0])):
                output.append({
                    "content": results["documents"][0][i],
                    "title": results["metadatas"][0][i].get("title"),
                    "topic": results["metadatas"][0][i].get("topic"),
                    "relevance": round(1 - results["distances"][0][i], 4),
                })
            return output

        except Exception as e:
            logger.error(f"RAG query failed: {e}")
            return []

    def get_risk_context(self, coin_id: str, risk_score: float, fraud_flags: Dict) -> str:
        """
        Build a rich context string for AI report generation.
        Retrieves relevant knowledge based on the coin's risk profile.
        """
        queries = [f"risk assessment for {coin_id} cryptocurrency"]

        if risk_score > 60:
            queries.append("high risk cryptocurrency warning signals")
        if fraud_flags.get("pump_dump_detected"):
            queries.append("pump and dump detection crypto")
        if fraud_flags.get("honeypot_detected"):
            queries.append("honeypot contract scam detection")
        if fraud_flags.get("wash_trading_detected"):
            queries.append("wash trading market manipulation")

        all_docs = []
        seen = set()
        for query in queries:
            docs = self.query(query, n_results=2)
            for doc in docs:
                if doc["title"] not in seen:
                    seen.add(doc["title"])
                    all_docs.append(doc)

        if not all_docs:
            return "No specific risk context retrieved."

        context_parts = []
        for doc in all_docs[:4]:
            context_parts.append(f"### {doc['title']}\n{doc['content'][:500]}")

        return "\n\n".join(context_parts)

    def get_document_count(self) -> int:
        if self.collection:
            return self.collection.count()
        return 0


# ── Singleton ─────────────────────────────────────────────────────────────────
rag_system = RAGSystem()
