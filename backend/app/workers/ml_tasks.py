"""
Celery ML tasks — risk scoring and model updates.
"""
import asyncio
import json
from datetime import datetime, timezone

from loguru import logger

from app.core.config import settings
from app.core.redis import get_sync_redis
from app.ml.features import feature_engineer
from app.ml.risk_engine import risk_engine
from app.workers.celery_app import celery_app


@celery_app.task(name="app.workers.ml_tasks.update_risk_scores", queue="ml")
def update_risk_scores():
    """
    Compute risk scores for all tracked coins using cached data.
    Reads from Redis, scores with ML engine, writes back to Redis.
    """
    redis = get_sync_redis()
    updated = 0

    for coin_id in settings.TRACKED_COINS:
        try:
            # Load all cached data
            price_raw = redis.get(f"price:{coin_id}")
            onchain_raw = redis.get(f"onchain:{coin_id}")
            sentiment_raw = redis.get(f"sentiment:{coin_id}")

            if not price_raw:
                logger.debug(f"No price data for {coin_id} — skipping risk score")
                continue

            market_data = json.loads(price_raw)
            onchain = json.loads(onchain_raw) if onchain_raw else {}
            sentiment = json.loads(sentiment_raw) if sentiment_raw else {}

            # Get price history from Redis (stored by data tasks)
            history_raw = redis.get(f"history:{coin_id}")
            price_history = json.loads(history_raw) if history_raw else []

            # Build feature vector
            features = feature_engineer.build_features(
                market_data=market_data,
                price_history=price_history,
                onchain=onchain,
                sentiment=sentiment,
            )

            # Score
            risk_result = risk_engine.score(features)
            risk_result["coin_id"] = coin_id
            risk_result["symbol"] = market_data.get("symbol", coin_id.upper())

            # Cache risk score
            redis.setex(
                f"risk:{coin_id}",
                settings.CACHE_RISK_SCORE_TTL,
                json.dumps(risk_result, default=str),
            )

            # Also update a sorted set for leaderboard (score = risk score)
            redis.zadd("risk:leaderboard", {coin_id: risk_result["score"]})

            updated += 1
            logger.debug(f"Risk score for {coin_id}: {risk_result['score']:.1f} ({risk_result['risk_level']})")

        except Exception as e:
            logger.error(f"Risk scoring failed for {coin_id}: {e}")

    logger.info(f"Risk scores updated for {updated}/{len(settings.TRACKED_COINS)} coins")
    return updated


@celery_app.task(name="app.workers.ml_tasks.score_single_coin", queue="ml")
def score_single_coin(coin_id: str) -> dict:
    """Score a single coin on demand (used by /api/risk/analyze endpoint)."""
    redis = get_sync_redis()

    price_raw = redis.get(f"price:{coin_id}")
    onchain_raw = redis.get(f"onchain:{coin_id}")
    sentiment_raw = redis.get(f"sentiment:{coin_id}")
    history_raw = redis.get(f"history:{coin_id}")

    market_data = json.loads(price_raw) if price_raw else {}
    onchain = json.loads(onchain_raw) if onchain_raw else {}
    sentiment = json.loads(sentiment_raw) if sentiment_raw else {}
    price_history = json.loads(history_raw) if history_raw else []

    features = feature_engineer.build_features(
        market_data=market_data,
        price_history=price_history,
        onchain=onchain,
        sentiment=sentiment,
    )

    result = risk_engine.score(features)
    result["coin_id"] = coin_id
    result["symbol"] = market_data.get("symbol", "")

    redis.setex(f"risk:{coin_id}", settings.CACHE_RISK_SCORE_TTL, json.dumps(result, default=str))
    return result
