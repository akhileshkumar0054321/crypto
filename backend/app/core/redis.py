"""
Redis connection and caching utilities.
Provides both sync (for Celery) and async (for FastAPI) clients.
"""
import json
from typing import Any, Optional

import redis.asyncio as aioredis
from redis import Redis

from app.core.config import settings
from app.core.logging import logger

# ── Async Redis (FastAPI) ─────────────────────────────────────────────────────
_async_redis: Optional[aioredis.Redis] = None


async def get_async_redis() -> aioredis.Redis:
    """Return the async Redis client (singleton)."""
    global _async_redis
    if _async_redis is None:
        _async_redis = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )
    return _async_redis


async def close_async_redis() -> None:
    """Close the async Redis connection pool."""
    global _async_redis
    if _async_redis:
        await _async_redis.aclose()
        _async_redis = None
        logger.info("Async Redis connection closed.")


# ── Sync Redis (Celery workers) ───────────────────────────────────────────────
def get_sync_redis() -> Redis:
    """Return a synchronous Redis client (for Celery tasks)."""
    return Redis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
    )


# ── Cache Helpers ─────────────────────────────────────────────────────────────
class CacheManager:
    """High-level cache operations wrapping the async Redis client."""

    def __init__(self, redis: aioredis.Redis):
        self.redis = redis

    async def get(self, key: str) -> Optional[Any]:
        """Retrieve and deserialize a cached value."""
        value = await self.redis.get(key)
        if value is None:
            return None
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value

    async def set(self, key: str, value: Any, ttl: int = 60) -> None:
        """Serialize and cache a value with TTL (seconds)."""
        serialized = json.dumps(value, default=str)
        await self.redis.setex(key, ttl, serialized)

    async def delete(self, key: str) -> None:
        """Remove a cached value."""
        await self.redis.delete(key)

    async def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching a pattern. Returns count deleted."""
        keys = await self.redis.keys(pattern)
        if keys:
            return await self.redis.delete(*keys)
        return 0

    async def exists(self, key: str) -> bool:
        """Check if a key exists."""
        return bool(await self.redis.exists(key))

    async def ttl(self, key: str) -> int:
        """Return remaining TTL for a key in seconds."""
        return await self.redis.ttl(key)

    # ── Crypto-specific cache keys ─────────────────────────────────────────
    @staticmethod
    def price_key(coin_id: str) -> str:
        return f"price:{coin_id}"

    @staticmethod
    def risk_score_key(coin_id: str) -> str:
        return f"risk:{coin_id}"

    @staticmethod
    def market_data_key(coin_id: str) -> str:
        return f"market:{coin_id}"

    @staticmethod
    def sentiment_key(coin_id: str, source: str) -> str:
        return f"sentiment:{coin_id}:{source}"

    @staticmethod
    def top_coins_key() -> str:
        return "coins:top"


async def get_cache_manager() -> CacheManager:
    """FastAPI dependency — returns a CacheManager backed by async Redis."""
    redis = await get_async_redis()
    return CacheManager(redis)
