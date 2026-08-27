"""
Feature engineering pipeline.
Converts raw price, on-chain, and sentiment data into ML-ready features.
"""
from datetime import datetime, timezone
from typing import Dict, List, Optional

import numpy as np
import pandas as pd
from loguru import logger


class FeatureEngineer:
    """
    Builds the feature vector used by XGBoost, Random Forest, and Isolation Forest.
    All features are normalized to [0, 1] or [-1, 1] ranges.
    """

    FEATURE_NAMES = [
        # Price features
        "price_change_1h",
        "price_change_24h",
        "price_change_7d",
        "price_volatility_7d",
        "volume_change_24h",
        "volume_price_ratio",
        # Technical indicators
        "rsi_14",
        "rsi_overbought",        # RSI > 70
        "rsi_oversold",          # RSI < 30
        "bb_position",           # Where price sits in Bollinger Bands
        "macd_signal",
        # Market structure
        "market_cap_rank_norm",
        "ath_distance_pct",
        # On-chain features
        "tx_count_24h_norm",
        "active_addresses_norm",
        "whale_accumulation_norm",
        "exchange_netflow_norm",
        "large_tx_ratio",
        "honeypot_flag",
        # Liquidity features
        "bid_ask_spread",
        "order_book_imbalance",
        # Sentiment features
        "sentiment_score",       # -1 to 1
        "mention_velocity",      # Mentions per hour
        "engagement_ratio",
        # DeFi features
        "tvl_change_24h",
    ]

    def build_features(
        self,
        market_data: Dict,
        price_history: List[Dict],
        onchain: Dict,
        sentiment: Dict,
        order_book: Optional[Dict] = None,
        defillama: Optional[Dict] = None,
    ) -> Dict[str, float]:
        """
        Build the full feature vector for ML scoring.

        Returns:
            Dict mapping feature name → float value
        """
        features = {}

        # ── Price Features ─────────────────────────────────────────────────────
        features["price_change_1h"] = self._clip(
            market_data.get("price_change_1h", 0) / 100, -1, 1
        )
        features["price_change_24h"] = self._clip(
            market_data.get("price_change_24h", 0) / 100, -1, 1
        )
        features["price_change_7d"] = self._clip(
            market_data.get("price_change_7d", 0) / 100, -1, 1
        )

        # Volatility = std of daily returns over last 7 days
        if price_history and len(price_history) >= 2:
            closes = [p["close"] for p in price_history[-7:]]
            returns = np.diff(np.log(np.array(closes) + 1e-8))
            features["price_volatility_7d"] = float(np.std(returns)) * 10  # Scale up
        else:
            features["price_volatility_7d"] = 0.0

        volume = market_data.get("volume_24h", 0) or 0
        prev_volume = market_data.get("volume_24h", 0) or 1  # Simplified
        features["volume_change_24h"] = self._clip((volume - prev_volume) / (prev_volume + 1), -1, 1)

        price = market_data.get("price_usd", 1) or 1
        features["volume_price_ratio"] = self._clip(volume / (price * 1e6 + 1), 0, 1)

        # ── Technical Indicators ───────────────────────────────────────────────
        if price_history and len(price_history) >= 14:
            closes = [p["close"] for p in price_history]
            rsi = self._compute_rsi(closes, period=14)
            features["rsi_14"] = rsi / 100.0
            features["rsi_overbought"] = 1.0 if rsi > 70 else 0.0
            features["rsi_oversold"] = 1.0 if rsi < 30 else 0.0
            features["bb_position"] = self._compute_bb_position(closes)
            features["macd_signal"] = self._compute_macd_signal(closes)
        else:
            features["rsi_14"] = 0.5
            features["rsi_overbought"] = 0.0
            features["rsi_oversold"] = 0.0
            features["bb_position"] = 0.5
            features["macd_signal"] = 0.0

        # ── Market Structure ───────────────────────────────────────────────────
        rank = market_data.get("market_cap_rank") or 500
        features["market_cap_rank_norm"] = 1.0 - min(rank / 500, 1.0)  # Higher rank = lower risk

        ath_change = market_data.get("ath_change_percentage", 0) or 0
        features["ath_distance_pct"] = self._clip(abs(ath_change) / 100, 0, 1)

        # ── On-Chain Features ──────────────────────────────────────────────────
        tx_count = onchain.get("tx_count_24h", 0) or 0
        features["tx_count_24h_norm"] = self._clip(tx_count / 10000, 0, 1)

        active_addr = onchain.get("active_addresses_24h", 0) or 0
        features["active_addresses_norm"] = self._clip(active_addr / 50000, 0, 1)

        whale_acc = onchain.get("whale_accumulation", 0) or 0
        features["whale_accumulation_norm"] = self._clip(whale_acc / 1e7, -1, 1)

        exchange_netflow = onchain.get("exchange_netflow", 0) or 0
        features["exchange_netflow_norm"] = self._clip(exchange_netflow / 1e6, -1, 1)

        large_tx = onchain.get("large_tx_count_24h", 0) or 0
        features["large_tx_ratio"] = self._clip(large_tx / max(tx_count, 1), 0, 1)

        features["honeypot_flag"] = 1.0 if onchain.get("honeypot_risk", False) else 0.0

        # ── Liquidity Features ─────────────────────────────────────────────────
        if order_book:
            features["bid_ask_spread"] = self._clip(
                order_book.get("spread", 0) / (price + 1e-8), 0, 1
            )
            features["order_book_imbalance"] = self._clip(
                order_book.get("depth_imbalance", 0), -1, 1
            )
        else:
            features["bid_ask_spread"] = 0.01
            features["order_book_imbalance"] = 0.0

        # ── Sentiment Features ─────────────────────────────────────────────────
        combined = sentiment.get("combined_score", 0) or 0
        features["sentiment_score"] = self._clip(combined, -1, 1)

        mention_count = sentiment.get("reddit", {}).get("mention_count", 0) or 0
        features["mention_velocity"] = self._clip(mention_count / 100, 0, 1)

        engagement = sentiment.get("reddit", {}).get("engagement_count", 0) or 0
        features["engagement_ratio"] = self._clip(engagement / (mention_count + 1) / 100, 0, 1)

        # ── DeFi Features ──────────────────────────────────────────────────────
        if defillama:
            tvl_change = defillama.get("tvl_change_24h", 0) or 0
            features["tvl_change_24h"] = self._clip(tvl_change / 100, -1, 1)
        else:
            features["tvl_change_24h"] = 0.0

        return features

    def features_to_array(self, features: Dict[str, float]) -> np.ndarray:
        """Convert feature dict to ordered numpy array for ML models."""
        return np.array([features.get(name, 0.0) for name in self.FEATURE_NAMES])

    def compute_fraud_signals(self, features: Dict, market_data: Dict) -> Dict:
        """
        Rule-based fraud signal detection to complement ML models.
        Returns flags for pump & dump, wash trading, and honeypot.
        """
        signals = {
            "pump_dump_risk": False,
            "wash_trading_risk": False,
            "honeypot_risk": features.get("honeypot_flag", 0) > 0.5,
        }

        # Pump & dump: sudden price spike + high volume + small market cap
        price_change_1h = abs(features.get("price_change_1h", 0))
        volume_ratio = features.get("volume_price_ratio", 0)
        rank_norm = features.get("market_cap_rank_norm", 1)

        if price_change_1h > 0.15 and volume_ratio > 0.5 and rank_norm < 0.3:
            signals["pump_dump_risk"] = True

        # Wash trading: high volume with low active address count
        tx_norm = features.get("tx_count_24h_norm", 0)
        addr_norm = features.get("active_addresses_norm", 0)
        if tx_norm > 0.3 and addr_norm < 0.05 and volume_ratio > 0.3:
            signals["wash_trading_risk"] = True

        return signals

    # ── Math Helpers ───────────────────────────────────────────────────────────

    @staticmethod
    def _clip(value: float, lo: float, hi: float) -> float:
        """Clip a float to [lo, hi]."""
        try:
            v = float(value)
            return max(lo, min(hi, v))
        except (TypeError, ValueError):
            return 0.0

    @staticmethod
    def _compute_rsi(closes: List[float], period: int = 14) -> float:
        """Compute RSI (0–100) from a list of close prices."""
        if len(closes) < period + 1:
            return 50.0
        deltas = np.diff(closes)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)
        avg_gain = np.mean(gains[-period:])
        avg_loss = np.mean(losses[-period:])
        if avg_loss == 0:
            return 100.0
        rs = avg_gain / avg_loss
        return float(100 - (100 / (1 + rs)))

    @staticmethod
    def _compute_bb_position(closes: List[float], period: int = 20) -> float:
        """
        Bollinger Band position: 0 = at lower band, 1 = at upper band.
        """
        if len(closes) < period:
            return 0.5
        arr = np.array(closes[-period:])
        mean = np.mean(arr)
        std = np.std(arr)
        if std == 0:
            return 0.5
        upper = mean + 2 * std
        lower = mean - 2 * std
        pos = (closes[-1] - lower) / (upper - lower + 1e-8)
        return float(np.clip(pos, 0, 1))

    @staticmethod
    def _compute_macd_signal(closes: List[float]) -> float:
        """
        Compute MACD - Signal line (normalized).
        Positive = bullish, Negative = bearish.
        """
        if len(closes) < 26:
            return 0.0
        arr = pd.Series(closes)
        ema12 = arr.ewm(span=12, adjust=False).mean().iloc[-1]
        ema26 = arr.ewm(span=26, adjust=False).mean().iloc[-1]
        macd = ema12 - ema26
        signal = pd.Series([macd]).ewm(span=9, adjust=False).mean().iloc[-1]
        diff = macd - signal
        price = closes[-1] if closes[-1] != 0 else 1
        return float(np.clip(diff / price, -1, 1))


# ── Singleton ─────────────────────────────────────────────────────────────────
feature_engineer = FeatureEngineer()
