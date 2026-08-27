"""
ML Risk Engine — XGBoost + Random Forest + Isolation Forest ensemble.
Produces a 0–100 risk score and fraud detection flags.
"""
import os
import pickle
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Optional, Tuple

import numpy as np
from loguru import logger
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import MinMaxScaler

try:
    import xgboost as xgb
    # Test that it actually loads (Windows DLL check)
    _ = xgb.XGBClassifier
    XGBOOST_AVAILABLE = True
except Exception:
    XGBOOST_AVAILABLE = False
    xgb = None
    logger.warning("XGBoost unavailable (missing OpenMP DLL on Windows) — using RandomForest + IsoForest only")

from app.core.config import settings
from app.ml.features import FeatureEngineer, feature_engineer

MODEL_DIR = Path(settings.ML_MODEL_PATH)
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Risk level thresholds
RISK_LEVELS = {
    (0, 30):   "LOW",
    (30, 60):  "MEDIUM",
    (60, 80):  "HIGH",
    (80, 101): "CRITICAL",
}

# Recommendation thresholds
HOLD_ZONE = (30, 60)


def score_to_risk_level(score: float) -> str:
    for (lo, hi), level in RISK_LEVELS.items():
        if lo <= score < hi:
            return level
    return "CRITICAL"


def score_to_recommendation(score: float, sentiment: float = 0.0) -> Tuple[str, float]:
    """Convert risk score to BUY/SELL/HOLD + confidence."""
    if score < 25 and sentiment > 0.1:
        return "BUY", round(min(0.9, 1 - score / 100), 2)
    elif score > 70:
        return "SELL", round(min(0.9, score / 100), 2)
    else:
        confidence = round(0.5 + abs(score - 45) / 90, 2)
        return "HOLD", min(0.8, confidence)


class RiskEngine:
    """
    Ensemble ML risk scoring engine.

    Models:
    - XGBoost: Primary risk classifier (LOW/MEDIUM/HIGH)
    - Random Forest: Secondary classifier for ensemble voting
    - Isolation Forest: Anomaly/fraud detection
    - Rule Engine: Explicit fraud signal checks
    """

    def __init__(self):
        self.xgb_model = None
        self.rf_model: Optional[RandomForestClassifier] = None
        self.iso_model: Optional[IsolationForest] = None
        self.scaler: Optional[MinMaxScaler] = None
        self.is_trained = False
        self._load_models()

    # ── Model Persistence ─────────────────────────────────────────────────────

    def _load_models(self):
        """Load pre-trained models from disk if they exist."""
        try:
            if XGBOOST_AVAILABLE and (MODEL_DIR / "xgb_risk.json").exists():
                self.xgb_model = xgb.XGBClassifier()
                self.xgb_model.load_model(str(MODEL_DIR / "xgb_risk.json"))
                logger.info("XGBoost model loaded from disk")

            if (MODEL_DIR / "rf_risk.pkl").exists():
                with open(MODEL_DIR / "rf_risk.pkl", "rb") as f:
                    self.rf_model = pickle.load(f)
                logger.info("Random Forest model loaded from disk")

            if (MODEL_DIR / "iso_forest.pkl").exists():
                with open(MODEL_DIR / "iso_forest.pkl", "rb") as f:
                    self.iso_model = pickle.load(f)
                logger.info("Isolation Forest model loaded from disk")

            if (MODEL_DIR / "scaler.pkl").exists():
                with open(MODEL_DIR / "scaler.pkl", "rb") as f:
                    self.scaler = pickle.load(f)

            self.is_trained = self.rf_model is not None
        except Exception as e:
            logger.warning(f"Could not load models: {e} — using heuristic scoring")

    def _save_models(self):
        """Persist trained models to disk."""
        if self.xgb_model and XGBOOST_AVAILABLE:
            self.xgb_model.save_model(str(MODEL_DIR / "xgb_risk.json"))
        if self.rf_model:
            with open(MODEL_DIR / "rf_risk.pkl", "wb") as f:
                pickle.dump(self.rf_model, f)
        if self.iso_model:
            with open(MODEL_DIR / "iso_forest.pkl", "wb") as f:
                pickle.dump(self.iso_model, f)
        if self.scaler:
            with open(MODEL_DIR / "scaler.pkl", "wb") as f:
                pickle.dump(self.scaler, f)
        logger.info("Models saved to disk")

    # ── Training ──────────────────────────────────────────────────────────────

    def train(self, X: np.ndarray, y: np.ndarray):
        """
        Train the ensemble on labeled data.
        y: 0=LOW, 1=MEDIUM, 2=HIGH risk classes
        """
        from sklearn.model_selection import train_test_split

        logger.info(f"Training on {len(X)} samples...")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Scale features
        self.scaler = MinMaxScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Random Forest
        self.rf_model = RandomForestClassifier(
            n_estimators=200, max_depth=10, min_samples_leaf=5,
            class_weight="balanced", random_state=42, n_jobs=-1
        )
        self.rf_model.fit(X_train_scaled, y_train)
        rf_score = self.rf_model.score(X_test_scaled, y_test)
        logger.info(f"Random Forest accuracy: {rf_score:.3f}")

        # XGBoost
        if XGBOOST_AVAILABLE:
            self.xgb_model = xgb.XGBClassifier(
                n_estimators=300, max_depth=6, learning_rate=0.05,
                subsample=0.8, colsample_bytree=0.8,
                use_label_encoder=False, eval_metric="mlogloss",
                random_state=42,
            )
            self.xgb_model.fit(
                X_train_scaled, y_train,
                eval_set=[(X_test_scaled, y_test)],
                verbose=False,
            )
            xgb_score = self.xgb_model.score(X_test_scaled, y_test)
            logger.info(f"XGBoost accuracy: {xgb_score:.3f}")

        # Isolation Forest (unsupervised anomaly detection)
        self.iso_model = IsolationForest(
            n_estimators=200, contamination=0.05,
            random_state=42, n_jobs=-1,
        )
        self.iso_model.fit(X_train_scaled)

        self.is_trained = True
        self._save_models()
        logger.success("Model training complete ✅")

    # ── Inference ─────────────────────────────────────────────────────────────

    def score(self, features: Dict[str, float]) -> Dict:
        """
        Compute the complete risk score for a coin.

        Returns a dict with:
        - score (0–100)
        - risk_level
        - component scores
        - fraud flags
        - recommendation
        """
        feature_array = feature_engineer.features_to_array(features)

        if self.is_trained and self.scaler:
            return self._ml_score(feature_array, features)
        else:
            return self._heuristic_score(features)

    def _ml_score(self, X: np.ndarray, features: Dict) -> Dict:
        """Score using trained ML ensemble."""
        X_scaled = self.scaler.transform(X.reshape(1, -1))

        # RF prediction
        rf_proba = self.rf_model.predict_proba(X_scaled)[0]
        # Classes: 0=LOW, 1=MEDIUM, 2=HIGH
        rf_score = float(rf_proba[0] * 15 + rf_proba[1] * 50 + rf_proba[2] * 85)

        # XGBoost prediction
        if self.xgb_model and XGBOOST_AVAILABLE:
            xgb_proba = self.xgb_model.predict_proba(X_scaled)[0]
            xgb_score = float(xgb_proba[0] * 15 + xgb_proba[1] * 50 + xgb_proba[2] * 85)
            ensemble_score = rf_score * 0.4 + xgb_score * 0.6
        else:
            ensemble_score = rf_score

        # Anomaly detection
        anomaly_score = self.iso_model.decision_function(X_scaled)[0]
        is_anomaly = self.iso_model.predict(X_scaled)[0] == -1
        anomaly_boost = 20.0 if is_anomaly else 0.0

        final_score = min(100, ensemble_score + anomaly_boost)
        return self._build_result(final_score, features, is_anomaly)

    def _heuristic_score(self, features: Dict) -> Dict:
        """
        Fallback heuristic scoring when models aren't trained yet.
        Weighted sum of key risk indicators.
        """
        weights = {
            "price_volatility_7d": 20,
            "rsi_overbought": 15,
            "honeypot_flag": 25,
            "exchange_netflow_norm": 10,  # Negative = coins flowing to exchanges (sell pressure)
            "large_tx_ratio": 10,
            "whale_accumulation_norm": 5,
            "sentiment_score": 10,        # Negative sentiment → higher risk
            "bb_position": 5,
        }

        score = 0.0
        for feat, weight in weights.items():
            val = features.get(feat, 0.0)
            if feat == "sentiment_score":
                val = (-val + 1) / 2  # Invert: negative sentiment = high risk
            elif feat == "exchange_netflow_norm":
                val = max(0, -val)    # Inflow to exchanges = risk
            elif feat == "whale_accumulation_norm":
                val = max(0, -val)    # Whale selling = risk
            score += abs(val) * weight

        # Clamp to 0-100
        score = min(100, max(0, score))
        return self._build_result(score, features, False)

    def _build_result(self, score: float, features: Dict, is_anomaly: bool) -> Dict:
        """Build the final result dict."""
        fraud_signals = feature_engineer.compute_fraud_signals(features, {})
        sentiment = features.get("sentiment_score", 0.0)
        recommendation, confidence = score_to_recommendation(score, sentiment)

        # Component scores (0–100)
        volatility = min(100, features.get("price_volatility_7d", 0) * 100)
        liquidity = max(0, 100 - features.get("order_book_imbalance", 0) * 50)
        sent_risk = (1 - features.get("sentiment_score", 0)) * 50
        onchain = features.get("large_tx_ratio", 0) * 100

        return {
            "score": round(score, 2),
            "risk_level": score_to_risk_level(score),
            "volatility_score": round(volatility, 2),
            "liquidity_score": round(liquidity, 2),
            "sentiment_score": round(sent_risk, 2),
            "onchain_score": round(onchain, 2),
            "fraud_probability": round(min(1.0, score / 100), 4),
            "pump_dump_detected": fraud_signals["pump_dump_risk"] or is_anomaly,
            "wash_trading_detected": fraud_signals["wash_trading_risk"],
            "honeypot_detected": fraud_signals["honeypot_risk"],
            "recommendation": recommendation,
            "recommendation_confidence": confidence,
            "model_version": "v1-heuristic" if not self.is_trained else "v1-ml",
            "timestamp": datetime.now(tz=timezone.utc),
            "feature_snapshot": features,
        }


# ── Singleton ─────────────────────────────────────────────────────────────────
risk_engine = RiskEngine()
