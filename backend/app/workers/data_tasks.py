"""
Celery background tasks — data collection pipeline.
Runs on schedule to keep the database fresh with live data.
"""
from datetime import datetime, timezone

from celery import shared_task
from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
from app.data.coingecko import coingecko
from app.data.binance import binance
from app.data.etherscan import etherscan
from app.data.alchemy import alchemy
from app.data.sentiment import sentiment_collector
from app.data.defillama import defillama
from app.ml.features import feature_engineer
from app.ml.risk_engine import risk_engine
from app.workers.celery_app import celery_app


def get_sync_db():
    """Get synchronous DB session for Celery workers."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.core.config import settings

    engine = create_engine(settings.sync_database_url)
    Session = sessionmaker(bind=engine)
    return Session()


# ══════════════════════════════════════════════════════════════════════════════
# PRICE DATA COLLECTION
# ══════════════════════════════════════════════════════════════════════════════

@celery_app.task(name="app.workers.data_tasks.collect_price_data", queue="data")
def collect_price_data():
    """
    Collect live price data from CoinGecko for all tracked coins.
    Stores results in Redis cache and PostgreSQL.
    """
    import asyncio
    import json
    from app.core.redis import get_sync_redis

    async def _run():
        coin_ids = settings.TRACKED_COINS
        market_data = await coingecko.get_markets(coin_ids=coin_ids)
        if not market_data:
            logger.warning("CoinGecko returned no data")
            return 0

        redis = get_sync_redis()
        stored = 0
        for raw in market_data:
            parsed = coingecko.parse_market_data(raw)
            coin_id = parsed["coin_id"]

            # Cache in Redis
            redis.setex(
                f"price:{coin_id}",
                settings.CACHE_PRICE_TTL,
                json.dumps(parsed, default=str),
            )
            stored += 1

        logger.info(f"Price data updated for {stored} coins")
        return stored

    return asyncio.run(_run())


# ══════════════════════════════════════════════════════════════════════════════
# ON-CHAIN DATA COLLECTION
# ══════════════════════════════════════════════════════════════════════════════

@celery_app.task(name="app.workers.data_tasks.collect_onchain_data", queue="data")
def collect_onchain_data():
    """Collect on-chain metrics via Etherscan + Alchemy for all tracked coins."""
    import asyncio
    import json
    from app.core.redis import get_sync_redis

    async def _run():
        # Get current ETH price for USD value calculations
        eth_data = await etherscan.get_eth_price()
        eth_price = eth_data["eth_usd"] if eth_data else 2500.0

        redis = get_sync_redis()
        count = 0

        for coin_id in settings.TRACKED_COINS:
            try:
                # Etherscan basic metrics
                metrics = await etherscan.analyze_token_onchain(coin_id, eth_price)

                # Alchemy enhanced metrics (for ERC-20 tokens)
                from app.data.binance import COINGECKO_TO_BINANCE
                from app.data.etherscan import TOKEN_CONTRACTS
                contract = TOKEN_CONTRACTS.get(coin_id)
                if contract and contract != "native":
                    alchemy_data = await alchemy.analyze_token_flows(contract, eth_price)
                    # Merge — Alchemy data takes priority for flow metrics
                    metrics.update({
                        "whale_accumulation": alchemy_data.get("whale_accumulation", metrics.get("whale_accumulation")),
                        "exchange_inflow": alchemy_data.get("exchange_inflow"),
                        "exchange_outflow": alchemy_data.get("exchange_outflow"),
                        "tx_count_24h": max(
                            metrics.get("tx_count_24h", 0),
                            alchemy_data.get("tx_count_24h", 0),
                        ),
                    })

                # Cache in Redis
                redis.setex(
                    f"onchain:{coin_id}",
                    settings.ONCHAIN_UPDATE_INTERVAL_SECONDS,
                    json.dumps(metrics, default=str),
                )
                count += 1
                await asyncio.sleep(0.5)  # Avoid hammering APIs
            except Exception as e:
                logger.error(f"On-chain collection failed for {coin_id}: {e}")

        logger.info(f"On-chain data collected for {count} coins")
        return count

    return asyncio.run(_run())


# ══════════════════════════════════════════════════════════════════════════════
# SENTIMENT DATA COLLECTION
# ══════════════════════════════════════════════════════════════════════════════

@celery_app.task(name="app.workers.data_tasks.collect_sentiment_data", queue="data")
def collect_sentiment_data():
    """Collect Reddit + news sentiment for all tracked coins."""
    import asyncio
    import json
    from app.core.redis import get_sync_redis

    async def _run():
        # Get coin symbols for news API
        markets = await coingecko.get_markets(coin_ids=settings.TRACKED_COINS[:12])
        symbol_map = {m["id"]: m["symbol"].upper() for m in markets} if markets else {}

        redis = get_sync_redis()
        count = 0

        for coin_id in settings.TRACKED_COINS:
            try:
                symbol = symbol_map.get(coin_id, coin_id.upper()[:6])
                sentiment_data = await sentiment_collector.get_combined_sentiment(coin_id, symbol)

                redis.setex(
                    f"sentiment:{coin_id}",
                    settings.CACHE_SENTIMENT_TTL,
                    json.dumps(sentiment_data, default=str),
                )
                count += 1
                await asyncio.sleep(1)  # Reddit rate limit
            except Exception as e:
                logger.error(f"Sentiment collection failed for {coin_id}: {e}")

        logger.info(f"Sentiment collected for {count} coins")
        return count

    return asyncio.run(_run())


# ══════════════════════════════════════════════════════════════════════════════
# CLEANUP
# ══════════════════════════════════════════════════════════════════════════════

@celery_app.task(name="app.workers.data_tasks.cleanup_old_data", queue="maintenance")
def cleanup_old_data():
    """Remove price history older than 90 days to keep DB lean."""
    from sqlalchemy import text
    db = get_sync_db()
    try:
        result = db.execute(
            text("DELETE FROM price_history WHERE timestamp < NOW() - INTERVAL '90 days'")
        )
        db.commit()
        deleted = result.rowcount
        logger.info(f"Cleaned up {deleted} old price records")
        return deleted
    except Exception as e:
        db.rollback()
        logger.error(f"Cleanup failed: {e}")
        return 0
    finally:
        db.close()
