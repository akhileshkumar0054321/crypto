"""
DefiLlama collector — TVL, protocol data. No API key required.
"""
from datetime import datetime, timezone
from typing import Dict, List, Optional

import aiohttp
from loguru import logger

BASE_URL = "https://api.llama.fi"

# Mapping of coin_id to DefiLlama protocol slugs
DEFI_PROTOCOLS: Dict[str, str] = {
    "uniswap": "uniswap",
    "chainlink": "chainlink",
    "avalanche-2": "trader-joe",
    "solana": "marinade",
    "matic-network": "aave-v3",
}


class DefiLlamaCollector:
    """
    Async DefiLlama API client — free, no key required.
    """

    def __init__(self):
        self._session: Optional[aiohttp.ClientSession] = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=20))
        return self._session

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()

    async def _get(self, path: str) -> Optional[Dict]:
        session = await self._get_session()
        try:
            async with session.get(f"{BASE_URL}/{path}") as resp:
                resp.raise_for_status()
                return await resp.json()
        except Exception as e:
            logger.error(f"DefiLlama error [{path}]: {e}")
            return None

    async def get_global_tvl(self) -> Optional[float]:
        """Total crypto TVL in USD."""
        data = await self._get("v2/historicalChainTvl")
        if data and isinstance(data, list):
            return data[-1].get("tvl") if data else None
        return None

    async def get_protocol_tvl(self, protocol_slug: str) -> Optional[Dict]:
        """Get TVL and TVL history for a specific protocol."""
        data = await self._get(f"protocol/{protocol_slug}")
        if not data:
            return None
        tvl_data = data.get("tvl", [])
        current_tvl = tvl_data[-1]["totalLiquidityUSD"] if tvl_data else 0
        prev_tvl = tvl_data[-2]["totalLiquidityUSD"] if len(tvl_data) > 1 else current_tvl
        return {
            "protocol": protocol_slug,
            "tvl": current_tvl,
            "tvl_change_24h": ((current_tvl - prev_tvl) / (prev_tvl + 1e-8)) * 100,
            "category": data.get("category"),
            "chain": data.get("chain"),
        }

    async def get_all_protocols(self) -> List[Dict]:
        """List all DeFi protocols with current TVL."""
        data = await self._get("protocols")
        return data or []

    async def get_chain_tvl(self, chain: str = "Ethereum") -> Optional[float]:
        """Get total TVL locked on a specific blockchain."""
        data = await self._get(f"v2/historicalChainTvl/{chain}")
        if data and isinstance(data, list):
            return data[-1].get("tvl") if data else None
        return None

    async def get_coin_tvl_metrics(self, coin_id: str) -> Dict:
        """Aggregate TVL metrics for a coin."""
        protocol_slug = DEFI_PROTOCOLS.get(coin_id)
        metrics = {
            "coin_id": coin_id,
            "tvl": None,
            "tvl_change_24h": None,
            "timestamp": datetime.now(tz=timezone.utc),
        }
        if protocol_slug:
            data = await self.get_protocol_tvl(protocol_slug)
            if data:
                metrics["tvl"] = data["tvl"]
                metrics["tvl_change_24h"] = data["tvl_change_24h"]
        return metrics


# ── Singleton ─────────────────────────────────────────────────────────────────
defillama = DefiLlamaCollector()
