"""
Etherscan V2 on-chain data collector.
Fetches transactions, wallet balances, token transfers, and whale activity.
"""
import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Optional

import aiohttp
from loguru import logger

from app.core.config import settings

# Ethereum contract addresses for tracked tokens
TOKEN_CONTRACTS: Dict[str, str] = {
    "ethereum": "native",
    "uniswap": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    "chainlink": "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    "matic-network": "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    "binancecoin": "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
}

# Whale transaction threshold (USD value)
WHALE_THRESHOLD_USD = 100_000


class EtherscanCollector:
    """
    Async Etherscan V2 API client for on-chain data collection.
    Supports Ethereum mainnet (chain_id=1).
    """

    BASE_URL = settings.ETHERSCAN_BASE_URL  # https://api.etherscan.io/v2/api
    CHAIN_ID = 1  # Ethereum mainnet

    def __init__(self):
        self._session: Optional[aiohttp.ClientSession] = None
        self.api_key = settings.ETHERSCAN_API_KEY

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30)
            )
        return self._session

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()

    async def _get(self, params: dict) -> Optional[Dict]:
        """Execute an Etherscan V2 API call."""
        session = await self._get_session()
        params.update({
            "chainid": self.CHAIN_ID,
            "apikey": self.api_key,
        })
        for attempt in range(3):
            try:
                async with session.get(self.BASE_URL, params=params) as resp:
                    resp.raise_for_status()
                    data = await resp.json()
                    if data.get("status") == "1":
                        return data.get("result")
                    # Rate limit
                    if "rate limit" in str(data.get("result", "")).lower():
                        logger.warning("Etherscan rate limited — waiting 5s")
                        await asyncio.sleep(5)
                        continue
                    # No transactions is OK (returns "0")
                    if data.get("message") in ("No transactions found", "No records found"):
                        return []
                    logger.warning(f"Etherscan response: {data.get('message')} — {data.get('result')}")
                    return None
            except Exception as e:
                logger.error(f"Etherscan request failed (attempt {attempt+1}): {e}")
                if attempt < 2:
                    await asyncio.sleep(2 ** attempt)
        return None

    # ── Public Methods ─────────────────────────────────────────────────────────

    async def get_eth_price(self) -> Optional[Dict]:
        """Get current ETH price in USD and BTC."""
        result = await self._get({"module": "stats", "action": "ethprice"})
        if result:
            return {
                "eth_usd": float(result.get("ethusd", 0)),
                "eth_btc": float(result.get("ethbtc", 0)),
            }
        return None

    async def get_account_balance(self, address: str) -> Optional[float]:
        """Get ETH balance for a wallet address (in ETH)."""
        result = await self._get({
            "module": "account",
            "action": "balance",
            "address": address,
            "tag": "latest",
        })
        if result is not None:
            return int(result) / 1e18  # Convert Wei to ETH
        return None

    async def get_token_transactions(
        self,
        contract_address: str,
        start_block: int = 0,
        end_block: int = 99999999,
        limit: int = 100,
    ) -> List[Dict]:
        """Fetch ERC-20 token transfer events."""
        result = await self._get({
            "module": "account",
            "action": "tokentx",
            "contractaddress": contract_address,
            "startblock": start_block,
            "endblock": end_block,
            "page": 1,
            "offset": limit,
            "sort": "desc",
        })
        return result or []

    async def get_normal_transactions(
        self,
        address: str,
        limit: int = 100,
    ) -> List[Dict]:
        """Fetch normal ETH transactions for an address."""
        result = await self._get({
            "module": "account",
            "action": "txlist",
            "address": address,
            "startblock": 0,
            "endblock": 99999999,
            "page": 1,
            "offset": limit,
            "sort": "desc",
        })
        return result or []

    async def get_token_holders_count(self, contract_address: str) -> Optional[int]:
        """Get approximate number of token holders."""
        result = await self._get({
            "module": "token",
            "action": "tokeninfo",
            "contractaddress": contract_address,
        })
        if result and isinstance(result, list) and result:
            return int(result[0].get("holdersCount", 0))
        return None

    async def get_gas_oracle(self) -> Optional[Dict]:
        """Get current gas price oracle data."""
        result = await self._get({"module": "gastracker", "action": "gasoracle"})
        if result:
            return {
                "safe_gas_gwei": float(result.get("SafeGasPrice", 0)),
                "propose_gas_gwei": float(result.get("ProposeGasPrice", 0)),
                "fast_gas_gwei": float(result.get("FastGasPrice", 0)),
                "base_fee": float(result.get("suggestBaseFee", 0)),
            }
        return None

    async def get_contract_abi(self, address: str) -> Optional[str]:
        """Check if a contract is verified (honeypot detection signal)."""
        result = await self._get({
            "module": "contract",
            "action": "getabi",
            "address": address,
        })
        return result  # Returns ABI string or "Contract source code not verified"

    async def analyze_token_onchain(self, coin_id: str, eth_price_usd: float = 2500) -> Dict:
        """
        Main method — collect all relevant on-chain metrics for a coin.
        Returns a structured dict ready for ML feature engineering.
        """
        contract = TOKEN_CONTRACTS.get(coin_id)
        metrics = {
            "coin_id": coin_id,
            "timestamp": datetime.now(tz=timezone.utc),
            "tx_count_24h": 0,
            "active_addresses_24h": 0,
            "large_tx_count_24h": 0,
            "unique_senders_24h": 0,
            "top_10_holders_pct": None,
            "whale_accumulation": 0.0,
            "exchange_inflow": 0.0,
            "exchange_outflow": 0.0,
            "avg_gas_price_gwei": None,
            "is_verified_contract": None,
            "honeypot_risk": False,
        }

        if not contract or contract == "native":
            # For ETH itself — just get gas data
            gas = await self.get_gas_oracle()
            if gas:
                metrics["avg_gas_price_gwei"] = gas["safe_gas_gwei"]
            return metrics

        # ERC-20 token analysis
        txns = await self.get_token_transactions(contract, limit=200)
        if txns:
            # Count unique senders and large transactions
            senders = set()
            receivers = set()
            whale_txns = 0
            whale_net = 0.0

            for tx in txns:
                value_tokens = int(tx.get("value", 0)) / (10 ** int(tx.get("tokenDecimal", 18)))
                # Approximate USD value using ETH price as proxy (rough estimate)
                value_usd = value_tokens * eth_price_usd * 0.01  # 1% proxy ratio

                senders.add(tx.get("from", ""))
                receivers.add(tx.get("to", ""))

                if value_usd > WHALE_THRESHOLD_USD:
                    whale_txns += 1
                    whale_net += value_usd

            metrics["tx_count_24h"] = len(txns)
            metrics["active_addresses_24h"] = len(senders | receivers)
            metrics["unique_senders_24h"] = len(senders)
            metrics["large_tx_count_24h"] = whale_txns
            metrics["whale_accumulation"] = whale_net

        # Check contract verification (unverified = honeypot risk signal)
        abi = await self.get_contract_abi(contract)
        if abi:
            is_verified = "Contract source code not verified" not in str(abi)
            metrics["is_verified_contract"] = is_verified
            metrics["honeypot_risk"] = not is_verified

        # Gas data
        gas = await self.get_gas_oracle()
        if gas:
            metrics["avg_gas_price_gwei"] = gas["safe_gas_gwei"]

        logger.info(f"On-chain metrics collected for {coin_id}: {metrics['tx_count_24h']} txns")
        return metrics


# ── Singleton ─────────────────────────────────────────────────────────────────
etherscan = EtherscanCollector()
