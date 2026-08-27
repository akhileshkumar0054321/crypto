"""
Coins API routes — market data, history, on-chain info.
"""
import json
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from loguru import logger

from app.api.schemas import CoinMarketData, CoinResponse, PriceHistoryResponse
from app.core.config import settings
from app.core.redis import CacheManager, get_cache_manager
from app.data.coingecko import coingecko

router = APIRouter()


@router.get("", response_model=List[CoinMarketData])
async def list_coins(
    cache: CacheManager = Depends(get_cache_manager),
):
    """Return live market data for all tracked coins."""
    # Try Redis cache first
    cached = await cache.get(cache.top_coins_key())
    if cached:
        return cached

    # Fetch from CoinGecko
    raw_markets = await coingecko.get_markets(coin_ids=settings.TRACKED_COINS)
    if not raw_markets:
        raise HTTPException(status_code=503, detail="CoinGecko API unavailable")

    result = [coingecko.parse_market_data(r) for r in raw_markets]
    await cache.set(cache.top_coins_key(), result, ttl=settings.CACHE_MARKET_DATA_TTL)
    return result


@router.get("/trending")
async def get_trending_coins():
    """Return trending coins from CoinGecko (last 24h)."""
    return await coingecko.get_trending() or []


@router.get("/global")
async def get_global_market():
    """Return global crypto market stats."""
    return await coingecko.get_global_data() or {}


@router.get("/{coin_id}", response_model=CoinMarketData)
async def get_coin(
    coin_id: str,
    cache: CacheManager = Depends(get_cache_manager),
):
    """Return live market data for a single coin."""
    cached = await cache.get(cache.market_data_key(coin_id))
    if cached:
        return cached

    markets = await coingecko.get_markets(coin_ids=[coin_id])
    if not markets:
        raise HTTPException(status_code=404, detail=f"Coin '{coin_id}' not found")

    result = coingecko.parse_market_data(markets[0])
    await cache.set(cache.market_data_key(coin_id), result, ttl=settings.CACHE_MARKET_DATA_TTL)
    return result


@router.get("/{coin_id}/history")
async def get_coin_history(
    coin_id: str,
    days: int = Query(default=30, ge=1, le=365),
    vs_currency: str = "usd",
    cache: CacheManager = Depends(get_cache_manager),
):
    """Return price/volume history for charting."""
    cache_key = f"history_chart:{coin_id}:{days}"
    cached = await cache.get(cache_key)
    if cached:
        return cached

    data = await coingecko.get_market_chart(coin_id, vs_currency=vs_currency, days=days)
    if not data:
        raise HTTPException(status_code=404, detail="History not available")

    result = {
        "coin_id": coin_id,
        "days": days,
        "prices": data.get("prices", []),
        "volumes": data.get("total_volumes", []),
        "market_caps": data.get("market_caps", []),
    }
    await cache.set(cache_key, result, ttl=3600)  # Cache 1 hour
    return result


@router.get("/{coin_id}/ohlc")
async def get_coin_ohlc(
    coin_id: str,
    days: int = Query(default=7, ge=1, le=90),
    cache: CacheManager = Depends(get_cache_manager),
):
    """Return OHLC candlestick data for TradingView-style charts."""
    cache_key = f"ohlc:{coin_id}:{days}"
    cached = await cache.get(cache_key)
    if cached:
        return cached

    ohlc = await coingecko.get_ohlc(coin_id, days=days)
    result = {
        "coin_id": coin_id,
        "days": days,
        "ohlc": [
            {
                "time": candle[0] / 1000,   # Convert ms to seconds for Lightweight Charts
                "open": candle[1],
                "high": candle[2],
                "low": candle[3],
                "close": candle[4],
            }
            for candle in ohlc
        ],
    }
    await cache.set(cache_key, result, ttl=600)
    return result


@router.get("/{coin_id}/onchain")
async def get_coin_onchain(
    coin_id: str,
    cache: CacheManager = Depends(get_cache_manager),
):
    """Return latest on-chain metrics for a coin."""
    cached = await cache.get(f"onchain:{coin_id}")
    if cached:
        return cached
    return {"coin_id": coin_id, "message": "On-chain data not yet collected. Run data pipeline first."}
