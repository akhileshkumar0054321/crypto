"""
CoinGecko data collector — fetches live prices, market data, and coin metadata.
Uses the Demo API key (free tier).
"""
import asyncio
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import aiohttp
from loguru import logger

from app.core.config import settings


class CoinGeckoCollector:
    """
    Async CoinGecko API client.
    Handles rate limiting (30 req/min on free tier).
    """

    BASE_URL = settings.COINGECKO_BASE_URL
    HEADERS = {
        "accept": "application/json",
        "x-cg-demo-api-key": settings.COINGECKO_API_KEY or "",
    }

    def __init__(self):
        self._session: Optional[aiohttp.ClientSession] = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            timeout = aiohttp.ClientTimeout(total=30)
            self._session = aiohttp.ClientSession(
                headers=self.HEADERS, timeout=timeout
            )
        return self._session

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()

    async def _get(self, endpoint: str, params: dict = None) -> Any:
        """Make a GET request with retry logic."""
        session = await self._get_session()
        url = f"{self.BASE_URL}/{endpoint}"
        for attempt in range(3):
            try:
                async with session.get(url, params=params) as response:
                    if response.status == 429:
                        wait = 60
                        logger.warning(f"CoinGecko rate limited — waiting {wait}s")
                        await asyncio.sleep(wait)
                        continue
                    response.raise_for_status()
                    return await response.json()
            except aiohttp.ClientError as e:
                logger.error(f"CoinGecko request failed (attempt {attempt+1}): {e}")
                if attempt < 2:
                    await asyncio.sleep(2 ** attempt)
        return None

    # ── Public Methods ─────────────────────────────────────────────────────────

    async def ping(self) -> bool:
        """Test API connectivity."""
        data = await self._get("ping")
        return data is not None and "gecko_says" in data

    async def get_markets(
        self,
        coin_ids: List[str] = None,
        vs_currency: str = "usd",
        per_page: int = 50,
    ) -> List[Dict]:
        """
        Fetch live market data for multiple coins.
        Returns price, market cap, volume, 24h change, etc.
        """
        params = {
            "vs_currency": vs_currency,
            "order": "market_cap_desc",
            "per_page": per_page,
            "page": 1,
            "sparkline": False,
            "price_change_percentage": "1h,24h,7d",
        }
        if coin_ids:
            params["ids"] = ",".join(coin_ids)

        data = await self._get("coins/markets", params=params)
        if not data:
            return []

        logger.info(f"CoinGecko: fetched market data for {len(data)} coins")
        return data

    async def get_coin_detail(self, coin_id: str) -> Optional[Dict]:
        """Fetch full metadata for a single coin."""
        params = {
            "localization": False,
            "tickers": False,
            "market_data": True,
            "community_data": True,
            "developer_data": False,
        }
        return await self._get(f"coins/{coin_id}", params=params)

    async def get_ohlc(
        self,
        coin_id: str,
        vs_currency: str = "usd",
        days: int = 7,
    ) -> List[List[float]]:
        """
        Fetch OHLC candlestick data.
        Returns list of [timestamp_ms, open, high, low, close].
        """
        params = {"vs_currency": vs_currency, "days": days}
        data = await self._get(f"coins/{coin_id}/ohlc", params=params)
        return data or []

    async def get_market_chart(
        self,
        coin_id: str,
        vs_currency: str = "usd",
        days: int = 30,
    ) -> Optional[Dict]:
        """
        Fetch price/volume/market_cap history.
        Returns dict with 'prices', 'market_caps', 'total_volumes'.
        Each is a list of [timestamp_ms, value].
        """
        params = {"vs_currency": vs_currency, "days": days, "interval": "daily"}
        return await self._get(f"coins/{coin_id}/market_chart", params=params)

    async def get_coin_list(self) -> List[Dict]:
        """Get the full list of all coins supported by CoinGecko."""
        return await self._get("coins/list") or []

    async def get_trending(self) -> List[Dict]:
        """Get trending coins in the last 24 hours."""
        data = await self._get("search/trending")
        if data and "coins" in data:
            return [item["item"] for item in data["coins"]]
        return []

    async def get_global_data(self) -> Optional[Dict]:
        """Get global crypto market data (total market cap, BTC dominance, etc.)."""
        data = await self._get("global")
        return data.get("data") if data else None

    def parse_market_data(self, raw: Dict) -> Dict:
        """
        Normalize a CoinGecko markets entry into our internal format.
        """
        return {
            "coin_id": raw.get("id"),
            "symbol": raw.get("symbol", "").upper(),
            "name": raw.get("name"),
            "price_usd": raw.get("current_price", 0),
            "market_cap": raw.get("market_cap"),
            "volume_24h": raw.get("total_volume"),
            "price_change_1h": raw.get("price_change_percentage_1h_in_currency"),
            "price_change_24h": raw.get("price_change_percentage_24h_in_currency"),
            "price_change_7d": raw.get("price_change_percentage_7d_in_currency"),
            "market_cap_rank": raw.get("market_cap_rank"),
            "ath": raw.get("ath"),
            "ath_change_percentage": raw.get("ath_change_percentage"),
            "circulating_supply": raw.get("circulating_supply"),
            "image_url": raw.get("image"),
            "last_updated": raw.get("last_updated"),
        }


# ── Singleton ─────────────────────────────────────────────────────────────────
coingecko = CoinGeckoCollector()
