"""
Sentiment collector using Reddit (free, no strict limits).
Falls back to CryptoCompare news if Reddit is unavailable.
"""
import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

import aiohttp
from loguru import logger

from app.core.config import settings

# Subreddits to monitor per coin
COIN_SUBREDDITS: Dict[str, List[str]] = {
    "bitcoin":      ["Bitcoin", "CryptoCurrency"],
    "ethereum":     ["ethereum", "CryptoCurrency"],
    "solana":       ["solana", "CryptoCurrency"],
    "binancecoin":  ["binance", "CryptoCurrency"],
    "cardano":      ["cardano", "CryptoCurrency"],
    "ripple":       ["Ripple", "CryptoCurrency"],
    "dogecoin":     ["dogecoin", "CryptoCurrency"],
    "chainlink":    ["Chainlink", "CryptoCurrency"],
    "uniswap":      ["UniSwap", "CryptoCurrency"],
    "avalanche-2":  ["Avax", "CryptoCurrency"],
    "matic-network":["0xPolygon", "CryptoCurrency"],
    "polkadot":     ["dot", "CryptoCurrency"],
}

# Positive/negative keyword lists for simple sentiment scoring
POSITIVE_WORDS = {
    "bullish", "moon", "pump", "surge", "rally", "gain", "buy",
    "breakout", "support", "strong", "adoption", "partnership",
    "upgrade", "launch", "growth", "positive", "profit", "hold",
    "accumulate", "undervalued", "potential", "promising", "explode",
}
NEGATIVE_WORDS = {
    "bearish", "dump", "crash", "fall", "drop", "sell", "scam",
    "rug", "hack", "exploit", "fraud", "fear", "panic", "loss",
    "exit", "overvalued", "bubble", "risky", "warning", "ban",
    "regulation", "fud", "dead", "worthless", "collapse", "plunge",
}


class SentimentCollector:
    """
    Multi-source sentiment collector.
    Primary: Reddit (PRAW via REST — no auth needed for public data)
    Fallback: CryptoCompare news API
    """

    REDDIT_URL = "https://www.reddit.com"
    CC_URL = "https://min-api.cryptocompare.com/data/v2/news"

    def __init__(self):
        self._session: Optional[aiohttp.ClientSession] = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                headers={"User-Agent": settings.REDDIT_USER_AGENT},
                timeout=aiohttp.ClientTimeout(total=20),
            )
        return self._session

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()

    # ── Reddit ─────────────────────────────────────────────────────────────────

    async def get_reddit_posts(
        self, subreddit: str, limit: int = 25, sort: str = "hot"
    ) -> List[Dict]:
        """Fetch posts from a subreddit using Reddit's public JSON API."""
        session = await self._get_session()
        url = f"{self.REDDIT_URL}/r/{subreddit}/{sort}.json"
        try:
            async with session.get(url, params={"limit": limit}) as resp:
                if resp.status == 429:
                    logger.warning(f"Reddit rate limited for r/{subreddit}")
                    return []
                resp.raise_for_status()
                data = await resp.json()
                posts = data.get("data", {}).get("children", [])
                return [p["data"] for p in posts]
        except Exception as e:
            logger.error(f"Reddit fetch error r/{subreddit}: {e}")
            return []

    def _score_text(self, text: str) -> Tuple[float, str]:
        """
        Simple keyword-based sentiment scorer.
        Returns (score [-1.0, 1.0], label).
        """
        if not text:
            return 0.0, "neutral"

        words = set(text.lower().split())
        pos_hits = len(words & POSITIVE_WORDS)
        neg_hits = len(words & NEGATIVE_WORDS)
        total = pos_hits + neg_hits

        if total == 0:
            return 0.0, "neutral"

        score = (pos_hits - neg_hits) / total
        label = "positive" if score > 0.1 else "negative" if score < -0.1 else "neutral"
        return score, label

    async def analyze_reddit_sentiment(self, coin_id: str) -> Dict:
        """
        Aggregate Reddit sentiment across all subreddits for a coin.
        Returns structured sentiment metrics.
        """
        subreddits = COIN_SUBREDDITS.get(coin_id, ["CryptoCurrency"])
        all_posts: List[Dict] = []

        for sub in subreddits:
            posts = await get_reddit_posts_safe(self, sub)
            all_posts.extend(posts)
            await asyncio.sleep(0.5)  # Gentle rate limiting

        if not all_posts:
            return self._empty_sentiment(coin_id, "reddit")

        scores = []
        pos_count = neg_count = neu_count = 0
        total_engagement = 0
        samples = []

        for post in all_posts:
            title = post.get("title", "")
            body = post.get("selftext", "")
            text = f"{title} {body}"
            score, label = self._score_text(text)

            # Weight by upvotes + comment count
            upvotes = max(post.get("ups", 0), 0)
            comments = max(post.get("num_comments", 0), 0)
            weight = 1 + (upvotes + comments) * 0.01

            scores.append(score * weight)
            total_engagement += upvotes + comments

            if label == "positive":
                pos_count += 1
            elif label == "negative":
                neg_count += 1
            else:
                neu_count += 1

            if len(samples) < 5:
                samples.append({"title": title[:100], "score": score})

        total = len(all_posts)
        avg_score = sum(scores) / len(scores) if scores else 0.0

        return {
            "coin_id": coin_id,
            "source": "reddit",
            "overall_sentiment": round(avg_score, 4),
            "positive_ratio": round(pos_count / total, 4),
            "negative_ratio": round(neg_count / total, 4),
            "neutral_ratio": round(neu_count / total, 4),
            "mention_count": total,
            "engagement_count": total_engagement,
            "timestamp": datetime.now(tz=timezone.utc),
            "raw_samples": {"posts": samples},
        }

    # ── CryptoCompare News ─────────────────────────────────────────────────────

    async def get_crypto_news(self, coin_symbol: str, limit: int = 20) -> List[Dict]:
        """Fetch latest crypto news from CryptoCompare (no key needed for basic)."""
        session = await self._get_session()
        params = {"categories": coin_symbol, "lTs": 0, "lang": "EN"}
        if settings.CRYPTOCOMPARE_API_KEY:
            params["api_key"] = settings.CRYPTOCOMPARE_API_KEY
        try:
            async with session.get(self.CC_URL, params=params) as resp:
                resp.raise_for_status()
                data = await resp.json()
                return data.get("Data", [])[:limit]
        except Exception as e:
            logger.error(f"CryptoCompare news error for {coin_symbol}: {e}")
            return []

    async def analyze_news_sentiment(self, coin_id: str, symbol: str) -> Dict:
        """Score sentiment from CryptoCompare news headlines."""
        articles = await self.get_crypto_news(symbol)
        if not articles:
            return self._empty_sentiment(coin_id, "news")

        scores = []
        pos_count = neg_count = neu_count = 0
        samples = []

        for article in articles:
            text = f"{article.get('title', '')} {article.get('body', '')[:200]}"
            score, label = self._score_text(text)
            scores.append(score)

            if label == "positive":
                pos_count += 1
            elif label == "negative":
                neg_count += 1
            else:
                neu_count += 1

            if len(samples) < 3:
                samples.append({"title": article.get("title", "")[:100], "score": score})

        total = len(articles)
        avg_score = sum(scores) / len(scores) if scores else 0.0

        return {
            "coin_id": coin_id,
            "source": "news",
            "overall_sentiment": round(avg_score, 4),
            "positive_ratio": round(pos_count / total, 4),
            "negative_ratio": round(neg_count / total, 4),
            "neutral_ratio": round(neu_count / total, 4),
            "mention_count": total,
            "engagement_count": 0,
            "timestamp": datetime.now(tz=timezone.utc),
            "raw_samples": {"articles": samples},
        }

    def _empty_sentiment(self, coin_id: str, source: str) -> Dict:
        return {
            "coin_id": coin_id,
            "source": source,
            "overall_sentiment": 0.0,
            "positive_ratio": 0.33,
            "negative_ratio": 0.33,
            "neutral_ratio": 0.34,
            "mention_count": 0,
            "engagement_count": 0,
            "timestamp": datetime.now(tz=timezone.utc),
            "raw_samples": {},
        }

    async def get_combined_sentiment(self, coin_id: str, symbol: str) -> Dict:
        """
        Combine Reddit + News sentiment into a single weighted score.
        Reddit gets 60% weight, news gets 40%.
        """
        reddit_data, news_data = await asyncio.gather(
            self.analyze_reddit_sentiment(coin_id),
            self.analyze_news_sentiment(coin_id, symbol),
        )

        # Weighted average
        r_score = reddit_data["overall_sentiment"]
        n_score = news_data["overall_sentiment"]
        combined = r_score * 0.6 + n_score * 0.4

        # Convert -1..1 to 0..100 risk scale (negative sentiment = higher risk)
        sentiment_risk_score = 50 - (combined * 50)

        return {
            "coin_id": coin_id,
            "reddit": reddit_data,
            "news": news_data,
            "combined_score": round(combined, 4),       # -1.0 to 1.0
            "sentiment_risk_score": round(sentiment_risk_score, 2),  # 0 to 100
            "timestamp": datetime.now(tz=timezone.utc),
        }


async def get_reddit_posts_safe(collector: SentimentCollector, sub: str) -> List[Dict]:
    """Wrapper that never throws."""
    try:
        return await collector.get_reddit_posts(sub)
    except Exception:
        return []


# ── Singleton ─────────────────────────────────────────────────────────────────
sentiment_collector = SentimentCollector()
