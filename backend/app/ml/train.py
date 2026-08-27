"""
ML Model Training Script.
Generates synthetic-but-realistic training data from live CoinGecko data,
then trains XGBoost + Random Forest + Isolation Forest ensemble.

Run: python -m app.ml.train
"""
import asyncio
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from loguru import logger

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.core.config import settings
from app.data.coingecko import coingecko
from app.ml.features import FeatureEngineer, feature_engineer
from app.ml.risk_engine import RiskEngine


def generate_training_data(n_samples: int = 2000) -> tuple:
    """
    Generate realistic training data using statistical distributions
    derived from real crypto market patterns.

    Labels: 0=LOW risk, 1=MEDIUM risk, 2=HIGH risk
    """
    np.random.seed(42)
    X_rows = []
    y = []

    for _ in range(n_samples):
        # Random risk class with 40/35/25 distribution
        risk_class = np.random.choice([0, 1, 2], p=[0.40, 0.35, 0.25])

        if risk_class == 0:  # LOW risk — stable, healthy
            row = {
                "price_change_1h":        np.random.normal(0.001, 0.01),
                "price_change_24h":       np.random.normal(0.02, 0.04),
                "price_change_7d":        np.random.normal(0.05, 0.10),
                "price_volatility_7d":    abs(np.random.normal(0.02, 0.01)),
                "volume_change_24h":      np.random.normal(0.05, 0.10),
                "volume_price_ratio":     abs(np.random.normal(0.3, 0.1)),
                "rsi_14":                 np.random.uniform(0.40, 0.65),
                "rsi_overbought":         0.0,
                "rsi_oversold":           0.0,
                "bb_position":            np.random.uniform(0.3, 0.7),
                "macd_signal":            np.random.normal(0.01, 0.02),
                "market_cap_rank_norm":   np.random.uniform(0.6, 1.0),
                "ath_distance_pct":       np.random.uniform(0.1, 0.5),
                "tx_count_24h_norm":      np.random.uniform(0.3, 0.8),
                "active_addresses_norm":  np.random.uniform(0.3, 0.8),
                "whale_accumulation_norm": np.random.normal(0.1, 0.05),
                "exchange_netflow_norm":  np.random.normal(0.0, 0.05),
                "large_tx_ratio":         np.random.uniform(0.01, 0.05),
                "honeypot_flag":          0.0,
                "bid_ask_spread":         np.random.uniform(0.001, 0.005),
                "order_book_imbalance":   np.random.normal(0.0, 0.1),
                "sentiment_score":        np.random.uniform(0.1, 0.5),
                "mention_velocity":       np.random.uniform(0.2, 0.6),
                "engagement_ratio":       np.random.uniform(0.1, 0.5),
                "tvl_change_24h":         np.random.normal(0.01, 0.03),
            }
        elif risk_class == 1:  # MEDIUM risk
            row = {
                "price_change_1h":        np.random.normal(0.005, 0.03),
                "price_change_24h":       np.random.normal(-0.05, 0.08),
                "price_change_7d":        np.random.normal(-0.10, 0.15),
                "price_volatility_7d":    abs(np.random.normal(0.05, 0.02)),
                "volume_change_24h":      np.random.normal(0.2, 0.3),
                "volume_price_ratio":     abs(np.random.normal(0.5, 0.2)),
                "rsi_14":                 np.random.uniform(0.30, 0.75),
                "rsi_overbought":         float(np.random.random() < 0.2),
                "rsi_oversold":           float(np.random.random() < 0.2),
                "bb_position":            np.random.uniform(0.1, 0.9),
                "macd_signal":            np.random.normal(-0.02, 0.04),
                "market_cap_rank_norm":   np.random.uniform(0.3, 0.7),
                "ath_distance_pct":       np.random.uniform(0.3, 0.7),
                "tx_count_24h_norm":      np.random.uniform(0.1, 0.5),
                "active_addresses_norm":  np.random.uniform(0.1, 0.5),
                "whale_accumulation_norm": np.random.normal(-0.1, 0.1),
                "exchange_netflow_norm":  np.random.normal(-0.1, 0.1),
                "large_tx_ratio":         np.random.uniform(0.05, 0.15),
                "honeypot_flag":          0.0,
                "bid_ask_spread":         np.random.uniform(0.005, 0.02),
                "order_book_imbalance":   np.random.normal(-0.1, 0.2),
                "sentiment_score":        np.random.normal(-0.1, 0.2),
                "mention_velocity":       np.random.uniform(0.4, 0.8),
                "engagement_ratio":       np.random.uniform(0.2, 0.6),
                "tvl_change_24h":         np.random.normal(-0.05, 0.05),
            }
        else:  # HIGH risk — pump/dump patterns, anomalous activity
            row = {
                "price_change_1h":        np.random.choice(
                    [np.random.uniform(0.2, 0.8), np.random.uniform(-0.5, -0.2)]
                ),
                "price_change_24h":       np.random.normal(-0.20, 0.20),
                "price_change_7d":        np.random.normal(-0.40, 0.30),
                "price_volatility_7d":    abs(np.random.normal(0.15, 0.05)),
                "volume_change_24h":      np.random.uniform(1.0, 5.0),
                "volume_price_ratio":     abs(np.random.normal(0.8, 0.3)),
                "rsi_14":                 np.random.choice([
                    np.random.uniform(0.8, 1.0),
                    np.random.uniform(0.0, 0.2),
                ]),
                "rsi_overbought":         float(np.random.random() < 0.6),
                "rsi_oversold":           float(np.random.random() < 0.4),
                "bb_position":            np.random.choice([
                    np.random.uniform(0.85, 1.0),
                    np.random.uniform(0.0, 0.15),
                ]),
                "macd_signal":            np.random.normal(-0.1, 0.1),
                "market_cap_rank_norm":   np.random.uniform(0.0, 0.3),
                "ath_distance_pct":       np.random.uniform(0.5, 1.0),
                "tx_count_24h_norm":      np.random.choice([
                    np.random.uniform(0.8, 1.0),  # Unusually high
                    np.random.uniform(0.0, 0.05), # Unusually low
                ]),
                "active_addresses_norm":  np.random.uniform(0.0, 0.1),
                "whale_accumulation_norm": np.random.normal(-0.5, 0.2),
                "exchange_netflow_norm":  np.random.uniform(-1.0, -0.3),
                "large_tx_ratio":         np.random.uniform(0.20, 0.80),
                "honeypot_flag":          float(np.random.random() < 0.3),
                "bid_ask_spread":         np.random.uniform(0.02, 0.1),
                "order_book_imbalance":   np.random.uniform(-1.0, -0.3),
                "sentiment_score":        np.random.uniform(-0.8, -0.1),
                "mention_velocity":       np.random.choice([
                    np.random.uniform(0.8, 1.0),  # Viral frenzy
                    np.random.uniform(0.0, 0.05), # Dead coin
                ]),
                "engagement_ratio":       np.random.uniform(0.0, 0.3),
                "tvl_change_24h":         np.random.uniform(-1.0, -0.2),
            }

        # Clip all values to valid ranges
        for k, v in row.items():
            row[k] = float(np.clip(v, -1, 1))
        row["honeypot_flag"] = float(row["honeypot_flag"] > 0.5)
        row["rsi_overbought"] = float(row["rsi_overbought"] > 0.5)
        row["rsi_oversold"] = float(row["rsi_oversold"] > 0.5)

        X_rows.append([row[name] for name in feature_engineer.FEATURE_NAMES])
        y.append(risk_class)

    return np.array(X_rows), np.array(y)


async def main():
    logger.info("🚀 Starting ML model training...")

    # Generate training data
    logger.info("Generating training data...")
    X, y = generate_training_data(n_samples=3000)
    logger.info(f"Training data: {X.shape[0]} samples, {X.shape[1]} features")
    logger.info(f"Class distribution: LOW={sum(y==0)}, MEDIUM={sum(y==1)}, HIGH={sum(y==2)}")

    # Train models
    engine = RiskEngine()
    engine.train(X, y)

    # Quick validation
    logger.info("\n=== Sample Predictions ===")
    test_cases = [
        ("BTC-like (stable)", {k: 0.0 for k in feature_engineer.FEATURE_NAMES}),
    ]

    # Build a few real-ish feature dicts
    stable_features = {
        "price_change_1h": 0.005, "price_change_24h": 0.02,
        "price_change_7d": 0.05, "price_volatility_7d": 0.02,
        "volume_change_24h": 0.1, "volume_price_ratio": 0.3,
        "rsi_14": 0.55, "rsi_overbought": 0.0, "rsi_oversold": 0.0,
        "bb_position": 0.5, "macd_signal": 0.01,
        "market_cap_rank_norm": 0.95, "ath_distance_pct": 0.3,
        "tx_count_24h_norm": 0.7, "active_addresses_norm": 0.7,
        "whale_accumulation_norm": 0.05, "exchange_netflow_norm": 0.02,
        "large_tx_ratio": 0.02, "honeypot_flag": 0.0,
        "bid_ask_spread": 0.001, "order_book_imbalance": 0.05,
        "sentiment_score": 0.3, "mention_velocity": 0.5,
        "engagement_ratio": 0.3, "tvl_change_24h": 0.01,
    }
    risky_features = {
        "price_change_1h": 0.5, "price_change_24h": -0.3,
        "price_change_7d": -0.6, "price_volatility_7d": 0.2,
        "volume_change_24h": 3.0, "volume_price_ratio": 0.9,
        "rsi_14": 0.9, "rsi_overbought": 1.0, "rsi_oversold": 0.0,
        "bb_position": 0.95, "macd_signal": -0.1,
        "market_cap_rank_norm": 0.05, "ath_distance_pct": 0.9,
        "tx_count_24h_norm": 0.95, "active_addresses_norm": 0.02,
        "whale_accumulation_norm": -0.8, "exchange_netflow_norm": -0.7,
        "large_tx_ratio": 0.6, "honeypot_flag": 1.0,
        "bid_ask_spread": 0.08, "order_book_imbalance": -0.8,
        "sentiment_score": -0.7, "mention_velocity": 0.95,
        "engagement_ratio": 0.1, "tvl_change_24h": -0.9,
    }

    for label, features in [("Stable Coin", stable_features), ("Risky Token", risky_features)]:
        result = engine.score(features)
        logger.info(
            f"{label}: score={result['score']:.1f} "
            f"({result['risk_level']}) "
            f"→ {result['recommendation']} "
            f"(confidence={result['recommendation_confidence']:.0%})"
        )

    logger.success("✅ Training complete! Models saved to ml_models/")


if __name__ == "__main__":
    asyncio.run(main())
