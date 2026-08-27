"""
Binance WebSocket + REST collector for real-time price data.
No API key required for public market data.
"""
import asyncio
import json
from datetime import datetime, timezone
from typing import Callable, Dict, List, Optional

import aiohttp
import websockets
from loguru import logger

from app.core.config import settings


# Symbol mapping: CoinGecko ID → Binance trading pair
COINGECKO_TO_BINANCE: Dict[str, str] = {
    "bitcoin": "BTCUSDT",
    "ethereum": "ETHUSDT",
    "binancecoin": "BNBUSDT",
    "solana": "SOLUSDT",
    "cardano": "ADAUSDT",
    "ripple": "XRPUSDT",
    "avalanche-2": "AVAXUSDT",
    "polkadot": "DOTUSDT",
    "chainlink": "LINKUSDT",
    "uniswap": "UNIUSDT",
    "matic-network": "MATICUSDT",
    "dogecoin": "DOGEUSDT",
}

BINANCE_REST_URL = settings.BINANCE_BASE_URL
BINANCE_WS_URL = settings.BINANCE_WS_URL


class BinanceCollector:
    """
    Collects real-time price data from Binance.
    Uses WebSocket streams for live tick data and REST for snapshots.
    """

    def __init__(self):
        self._session: Optional[aiohttp.ClientSession] = None
        self._ws = None
        self._running = False
        self._price_callbacks: List[Callable] = []

    def on_price_update(self, callback: Callable):
        """Register a callback for price updates: callback(coin_id, price_data)"""
        self._price_callbacks.append(callback)

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=15)
            )
        return self._session

    async def close(self):
        self._running = False
        if self._session and not self._session.closed:
            await self._session.close()

    # ── REST Methods ───────────────────────────────────────────────────────────

    async def get_ticker_price(self, symbol: str) -> Optional[Dict]:
        """Get current price for a single symbol."""
        session = await self._get_session()
        url = f"{BINANCE_REST_URL}/api/v3/ticker/price"
        try:
            async with session.get(url, params={"symbol": symbol}) as resp:
                resp.raise_for_status()
                data = await resp.json()
                return {"symbol": data["symbol"], "price": float(data["price"])}
        except Exception as e:
            logger.error(f"Binance REST error for {symbol}: {e}")
            return None

    async def get_all_prices(self, symbols: List[str] = None) -> List[Dict]:
        """Get current prices for all tracked symbols."""
        session = await self._get_session()
        url = f"{BINANCE_REST_URL}/api/v3/ticker/24hr"
        target = symbols or list(COINGECKO_TO_BINANCE.values())

        results = []
        try:
            async with session.get(url) as resp:
                resp.raise_for_status()
                data = await resp.json()
                for item in data:
                    if item["symbol"] in target:
                        results.append(self._parse_ticker(item))
        except Exception as e:
            logger.error(f"Binance all prices error: {e}")
        return results

    async def get_klines(
        self,
        symbol: str,
        interval: str = "1h",
        limit: int = 100,
    ) -> List[Dict]:
        """
        Fetch OHLCV candlestick data.
        interval options: 1m, 5m, 15m, 1h, 4h, 1d
        """
        session = await self._get_session()
        url = f"{BINANCE_REST_URL}/api/v3/klines"
        params = {"symbol": symbol, "interval": interval, "limit": limit}
        try:
            async with session.get(url, params=params) as resp:
                resp.raise_for_status()
                raw = await resp.json()
                return [
                    {
                        "timestamp": datetime.fromtimestamp(k[0] / 1000, tz=timezone.utc),
                        "open": float(k[1]),
                        "high": float(k[2]),
                        "low": float(k[3]),
                        "close": float(k[4]),
                        "volume": float(k[5]),
                    }
                    for k in raw
                ]
        except Exception as e:
            logger.error(f"Binance klines error for {symbol}: {e}")
            return []

    async def get_order_book_depth(self, symbol: str, limit: int = 20) -> Optional[Dict]:
        """Get order book snapshot for liquidity analysis."""
        session = await self._get_session()
        url = f"{BINANCE_REST_URL}/api/v3/depth"
        try:
            async with session.get(url, params={"symbol": symbol, "limit": limit}) as resp:
                resp.raise_for_status()
                data = await resp.json()
                bids = [[float(p), float(q)] for p, q in data["bids"]]
                asks = [[float(p), float(q)] for p, q in data["asks"]]
                bid_volume = sum(p * q for p, q in bids)
                ask_volume = sum(p * q for p, q in asks)
                return {
                    "symbol": symbol,
                    "bid_volume": bid_volume,
                    "ask_volume": ask_volume,
                    "spread": asks[0][0] - bids[0][0] if asks and bids else 0,
                    "depth_imbalance": (bid_volume - ask_volume) / (bid_volume + ask_volume + 1e-8),
                }
        except Exception as e:
            logger.error(f"Binance order book error for {symbol}: {e}")
            return None

    # ── WebSocket Stream ───────────────────────────────────────────────────────

    async def start_price_stream(self, coin_ids: List[str] = None):
        """
        Start a combined WebSocket stream for real-time mini-ticker data.
        Fires registered callbacks on every price update.
        """
        tracked = coin_ids or list(COINGECKO_TO_BINANCE.keys())
        symbols = [
            COINGECKO_TO_BINANCE[cid].lower()
            for cid in tracked
            if cid in COINGECKO_TO_BINANCE
        ]

        if not symbols:
            logger.warning("No Binance symbols to stream")
            return

        stream_names = "/".join(f"{s}@miniTicker" for s in symbols)
        ws_url = f"{BINANCE_WS_URL}/stream?streams={stream_names}"

        self._running = True
        logger.info(f"Starting Binance WebSocket stream for {len(symbols)} symbols")

        while self._running:
            try:
                async with websockets.connect(ws_url, ping_interval=20) as ws:
                    logger.info("Binance WebSocket connected ✅")
                    async for raw_message in ws:
                        if not self._running:
                            break
                        await self._handle_ws_message(raw_message)
            except Exception as e:
                if self._running:
                    logger.warning(f"Binance WS disconnected: {e} — reconnecting in 5s")
                    await asyncio.sleep(5)

    async def stop_price_stream(self):
        self._running = False
        logger.info("Binance WebSocket stream stopped")

    async def _handle_ws_message(self, raw: str):
        """Parse and dispatch a WebSocket message to callbacks."""
        try:
            envelope = json.loads(raw)
            data = envelope.get("data", {})
            if data.get("e") != "24hrMiniTicker":
                return

            symbol = data.get("s", "")
            # Reverse-lookup CoinGecko ID from Binance symbol
            coin_id = next(
                (k for k, v in COINGECKO_TO_BINANCE.items() if v == symbol), None
            )
            if not coin_id:
                return

            price_data = {
                "coin_id": coin_id,
                "symbol": symbol,
                "price": float(data.get("c", 0)),  # close price
                "open": float(data.get("o", 0)),
                "high": float(data.get("h", 0)),
                "low": float(data.get("l", 0)),
                "volume": float(data.get("v", 0)),
                "quote_volume": float(data.get("q", 0)),
                "timestamp": datetime.now(tz=timezone.utc),
            }

            for callback in self._price_callbacks:
                try:
                    await callback(coin_id, price_data)
                except Exception as e:
                    logger.error(f"Price callback error: {e}")

        except json.JSONDecodeError as e:
            logger.error(f"Binance WS parse error: {e}")

    def _parse_ticker(self, raw: Dict) -> Dict:
        """Normalize a Binance 24hr ticker response."""
        return {
            "symbol": raw["symbol"],
            "price": float(raw["lastPrice"]),
            "open": float(raw["openPrice"]),
            "high": float(raw["highPrice"]),
            "low": float(raw["lowPrice"]),
            "volume": float(raw["volume"]),
            "quote_volume": float(raw["quoteVolume"]),
            "price_change": float(raw["priceChange"]),
            "price_change_pct": float(raw["priceChangePercent"]),
            "trades_count": int(raw["count"]),
        }


# ── Singleton ─────────────────────────────────────────────────────────────────
binance = BinanceCollector()
