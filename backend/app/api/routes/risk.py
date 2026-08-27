"""
Risk API routes — real-time risk scores, history, and on-demand analysis.
"""
import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from loguru import logger

from app.api.schemas import RiskAnalyzeRequest, RiskScoreResponse
from app.core.config import settings
from app.core.redis import CacheManager, get_cache_manager

router = APIRouter()


@router.get("/leaderboard")
async def get_risk_leaderboard(
    limit: int = Query(default=12, ge=1, le=50),
    cache: CacheManager = Depends(get_cache_manager),
):
    """Return all tracked coins sorted by risk score (highest risk first)."""
    # Get sorted set from Redis
    leaderboard_raw = await cache.redis.zrevrange("risk:leaderboard", 0, limit - 1, withscores=True)
    results = []
    for coin_id_bytes, score in leaderboard_raw:
        coin_id = coin_id_bytes if isinstance(coin_id_bytes, str) else coin_id_bytes.decode()
        risk_raw = await cache.get(f"risk:{coin_id}")
        if risk_raw:
            results.append(risk_raw)
        else:
            results.append({"coin_id": coin_id, "score": score, "risk_level": "UNKNOWN"})
    return results


@router.get("/{coin_id}", response_model=RiskScoreResponse)
async def get_risk_score(
    coin_id: str,
    cache: CacheManager = Depends(get_cache_manager),
):
    """Return the latest risk score for a coin."""
    cached = await cache.get(f"risk:{coin_id}")
    if cached:
        return cached
    raise HTTPException(
        status_code=404,
        detail=f"Risk score not yet computed for '{coin_id}'. Trigger /api/risk/analyze first.",
    )


@router.post("/analyze")
async def analyze_coin_risk(
    payload: RiskAnalyzeRequest,
    cache: CacheManager = Depends(get_cache_manager),
):
    """
    Trigger an on-demand risk analysis for a coin.
    Dispatches a Celery task and returns immediately with task ID.
    """
    from app.workers.ml_tasks import score_single_coin
    task = score_single_coin.apply_async(args=[payload.coin_id], queue="ml")
    return {
        "message": f"Risk analysis triggered for {payload.coin_id}",
        "task_id": task.id,
        "coin_id": payload.coin_id,
    }


@router.get("/factors/{coin_id}")
async def get_risk_factors(
    coin_id: str,
    cache: CacheManager = Depends(get_cache_manager),
):
    """Return detailed risk factor breakdown including feature values."""
    cached = await cache.get(f"risk:{coin_id}")
    if not cached:
        raise HTTPException(status_code=404, detail="Risk data not available")

    return {
        "coin_id": coin_id,
        "score": cached.get("score"),
        "risk_level": cached.get("risk_level"),
        "factors": {
            "volatility": {
                "score": cached.get("volatility_score"),
                "label": "Price Volatility",
                "description": "Measures price swings over 7 days",
            },
            "liquidity": {
                "score": cached.get("liquidity_score"),
                "label": "Market Liquidity",
                "description": "Order book depth and bid-ask spread",
            },
            "sentiment": {
                "score": cached.get("sentiment_score"),
                "label": "Social Sentiment",
                "description": "Reddit and news sentiment analysis",
            },
            "onchain": {
                "score": cached.get("onchain_score"),
                "label": "On-Chain Activity",
                "description": "Whale movements and exchange flows",
            },
        },
        "fraud_signals": {
            "pump_dump": cached.get("pump_dump_detected", False),
            "wash_trading": cached.get("wash_trading_detected", False),
            "honeypot": cached.get("honeypot_detected", False),
            "fraud_probability": cached.get("fraud_probability", 0),
        },
        "recommendation": {
            "action": cached.get("recommendation"),
            "confidence": cached.get("recommendation_confidence"),
        },
        "features": cached.get("feature_snapshot", {}),
    }


@router.get("/{coin_id}/history")
async def get_risk_history(
    coin_id: str,
    limit: int = Query(default=24, ge=1, le=168),
    cache: CacheManager = Depends(get_cache_manager),
):
    """Return historical risk scores (from Redis sorted set or DB)."""
    # In full implementation this reads from DB; returns cached score for now
    current = await cache.get(f"risk:{coin_id}")
    if not current:
        return {"coin_id": coin_id, "history": []}
    return {
        "coin_id": coin_id,
        "history": [current],
        "note": "Full history available after Phase 4 DB storage implementation",
    }
