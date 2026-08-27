"""
Alchemy Web3 collector — real-time Ethereum data using Alchemy's enhanced APIs.
Provides richer on-chain data than Etherscan alone.
"""
from datetime import datetime, timezone
from typing import Dict, List, Optional

import aiohttp
from loguru import logger

from app.core.config import settings


class AlchemyCollector:
    """
    Async Alchemy API client for enhanced Ethereum on-chain data.
    Uses Alchemy's REST and JSON-RPC endpoints.
    """

    ETH_URL = settings.ALCHEMY_ETH_URL
    NFT_URL = f"https://eth-mainnet.g.alchemy.com/nft/v3/{settings.ALCHEMY_API_KEY}"
    TOKEN_URL = f"https://eth-mainnet.g.alchemy.com/v2/{settings.ALCHEMY_API_KEY}"

    def __init__(self):
        self._session: Optional[aiohttp.ClientSession] = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=20))
        return self._session

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()

    async def _rpc(self, method: str, params: list = None) -> Optional[Dict]:
        """Call Ethereum JSON-RPC via Alchemy."""
        session = await self._get_session()
        payload = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params or []}
        try:
            async with session.post(self.ETH_URL, json=payload) as resp:
                resp.raise_for_status()
                data = await resp.json()
                if "error" in data:
                    logger.error(f"Alchemy RPC error: {data['error']}")
                    return None
                return data.get("result")
        except Exception as e:
            logger.error(f"Alchemy RPC failed [{method}]: {e}")
            return None

    async def _get(self, url: str, params: dict = None) -> Optional[Dict]:
        session = await self._get_session()
        try:
            async with session.get(url, params=params) as resp:
                resp.raise_for_status()
                return await resp.json()
        except Exception as e:
            logger.error(f"Alchemy GET failed: {e}")
            return None

    # ── Block & Chain Data ─────────────────────────────────────────────────────

    async def get_latest_block_number(self) -> Optional[int]:
        """Get the current Ethereum block number."""
        result = await self._rpc("eth_blockNumber")
        return int(result, 16) if result else None

    async def get_block(self, block_number: int = None) -> Optional[Dict]:
        """Get block data including transaction count."""
        param = hex(block_number) if block_number else "latest"
        return await self._rpc("eth_getBlockByNumber", [param, False])

    async def get_gas_price(self) -> Optional[float]:
        """Get current gas price in Gwei."""
        result = await self._rpc("eth_gasPrice")
        if result:
            return int(result, 16) / 1e9  # Wei to Gwei
        return None

    # ── Token Data ─────────────────────────────────────────────────────────────

    async def get_token_balances(self, address: str) -> Optional[List[Dict]]:
        """Get all ERC-20 token balances for an address."""
        result = await self._rpc("alchemy_getTokenBalances", [address, "erc20"])
        if result:
            return result.get("tokenBalances", [])
        return None

    async def get_token_metadata(self, contract_address: str) -> Optional[Dict]:
        """Get token metadata (name, symbol, decimals, total supply)."""
        result = await self._rpc("alchemy_getTokenMetadata", [contract_address])
        return result

    async def get_asset_transfers(
        self,
        contract_address: str,
        from_block: str = "0x0",
        max_count: int = 100,
    ) -> List[Dict]:
        """
        Get asset transfer history for a token.
        Much richer than Etherscan — includes internal transfers.
        """
        params = {
            "fromBlock": from_block,
            "toBlock": "latest",
            "contractAddresses": [contract_address],
            "category": ["erc20"],
            "maxCount": hex(max_count),
            "order": "desc",
            "withMetadata": True,
        }
        result = await self._rpc("alchemy_getAssetTransfers", [params])
        if result:
            return result.get("transfers", [])
        return []

    # ── Whale & Flow Analysis ─────────────────────────────────────────────────

    async def analyze_token_flows(
        self,
        contract_address: str,
        eth_price_usd: float = 2500,
    ) -> Dict:
        """
        Analyze token transfer flows to detect whale activity,
        exchange inflows/outflows, and accumulation patterns.
        """
        transfers = await self.get_asset_transfers(contract_address, max_count=200)

        # Known exchange addresses (simplified list)
        exchange_addrs = {
            "0x28c6c06298d514db089934071355e5743bf21d60",  # Binance Hot Wallet
            "0x21a31ee1afc51d94c2efccaa2092ad1028285549",  # Binance Cold
            "0xdfd5293d8e347dfe59e90efd55b2956a1343963d",  # Coinbase
            "0x3cd751e6b0078be393132286c442345e5dc49699",  # Coinbase 2
            "0x1522900b6dafac587d499a862861c0869be6e428",  # Kraken
        }

        whale_threshold_usd = 100_000
        metrics = {
            "tx_count": len(transfers),
            "unique_senders": set(),
            "unique_receivers": set(),
            "whale_tx_count": 0,
            "exchange_inflow_usd": 0.0,
            "exchange_outflow_usd": 0.0,
            "whale_accumulation_usd": 0.0,
        }

        for tx in transfers:
            value = float(tx.get("value") or 0)
            from_addr = (tx.get("from") or "").lower()
            to_addr = (tx.get("to") or "").lower()

            # Rough USD value estimate
            asset_usd = value * eth_price_usd * 0.01

            metrics["unique_senders"].add(from_addr)
            metrics["unique_receivers"].add(to_addr)

            if asset_usd > whale_threshold_usd:
                metrics["whale_tx_count"] += 1
                metrics["whale_accumulation_usd"] += asset_usd

            if to_addr in exchange_addrs:
                metrics["exchange_inflow_usd"] += asset_usd
            if from_addr in exchange_addrs:
                metrics["exchange_outflow_usd"] += asset_usd

        return {
            "tx_count_24h": metrics["tx_count"],
            "active_addresses_24h": len(metrics["unique_senders"] | metrics["unique_receivers"]),
            "unique_senders_24h": len(metrics["unique_senders"]),
            "large_tx_count_24h": metrics["whale_tx_count"],
            "whale_accumulation": metrics["whale_accumulation_usd"],
            "exchange_inflow": metrics["exchange_inflow_usd"],
            "exchange_outflow": metrics["exchange_outflow_usd"],
            "exchange_net_flow": metrics["exchange_outflow_usd"] - metrics["exchange_inflow_usd"],
            "timestamp": datetime.now(tz=timezone.utc),
        }


# ── Singleton ─────────────────────────────────────────────────────────────────
alchemy = AlchemyCollector()
