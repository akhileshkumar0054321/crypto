"""
SQLAlchemy 2.0 ORM models — using Mapped[] typed annotations.
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import (
    BigInteger, Boolean, Column, DateTime, Float,
    ForeignKey, Integer, JSON, String, Text, UniqueConstraint, func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base with automatic created_at / updated_at columns."""
    __allow_unmapped__ = True

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


# ══════════════════════════════════════════════════════════════════════════════
# USER
# ══════════════════════════════════════════════════════════════════════════════
class User(Base):
    __tablename__ = "users"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email          = Column(String(255), unique=True, nullable=False, index=True)
    username       = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password= Column(String(255), nullable=False)
    is_active      = Column(Boolean, default=True, nullable=False)
    is_superuser   = Column(Boolean, default=False, nullable=False)
    preferences    = Column(JSON, default=dict)

    alerts    = relationship("Alert",     back_populates="user", cascade="all, delete-orphan")
    reports   = relationship("Report",    back_populates="user", cascade="all, delete-orphan")
    portfolio = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")


# ══════════════════════════════════════════════════════════════════════════════
# COIN
# ══════════════════════════════════════════════════════════════════════════════
class Coin(Base):
    __tablename__ = "coins"

    id               = Column(String(100), primary_key=True)  # CoinGecko ID e.g. "bitcoin"
    symbol           = Column(String(20),  nullable=False, index=True)
    name             = Column(String(200), nullable=False)
    image_url        = Column(String(500))
    market_cap_rank  = Column(Integer)
    contract_address = Column(String(255), index=True)
    blockchain       = Column(String(50))
    is_active        = Column(Boolean, default=True)
    coingecko_data   = Column(JSON, default=dict)

    price_history   = relationship("PriceHistory",  back_populates="coin", cascade="all, delete-orphan")
    risk_scores     = relationship("RiskScore",      back_populates="coin", cascade="all, delete-orphan")
    onchain_metrics = relationship("OnChainMetrics", back_populates="coin", cascade="all, delete-orphan")
    sentiment_data  = relationship("SentimentData",  back_populates="coin", cascade="all, delete-orphan")


# ══════════════════════════════════════════════════════════════════════════════
# PRICE HISTORY
# ══════════════════════════════════════════════════════════════════════════════
class PriceHistory(Base):
    __tablename__ = "price_history"
    __table_args__ = (
        UniqueConstraint("coin_id", "timestamp", "interval", name="uq_price_coin_ts_interval"),
    )

    id       = Column(BigInteger, primary_key=True, autoincrement=True)
    coin_id  = Column(String(100), ForeignKey("coins.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp= Column(DateTime(timezone=True), nullable=False, index=True)
    interval = Column(String(10), nullable=False, default="1m")

    open     = Column(Float, nullable=False)
    high     = Column(Float, nullable=False)
    low      = Column(Float, nullable=False)
    close    = Column(Float, nullable=False)
    volume   = Column(Float, nullable=False)
    market_cap          = Column(Float)
    price_change_1h     = Column(Float)
    price_change_24h    = Column(Float)
    volume_change_24h   = Column(Float)
    rsi_14              = Column(Float)
    macd                = Column(Float)
    bb_upper            = Column(Float)
    bb_lower            = Column(Float)

    coin = relationship("Coin", back_populates="price_history")


# ══════════════════════════════════════════════════════════════════════════════
# RISK SCORE
# ══════════════════════════════════════════════════════════════════════════════
class RiskScore(Base):
    __tablename__ = "risk_scores"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coin_id     = Column(String(100), ForeignKey("coins.id", ondelete="CASCADE"), nullable=False, index=True)
    score       = Column(Float, nullable=False)             # 0-100
    risk_level  = Column(String(20), nullable=False)        # LOW / MEDIUM / HIGH / CRITICAL
    recommendation             = Column(String(10))         # BUY / SELL / HOLD
    recommendation_confidence  = Column(Float)

    # Component scores
    volatility_score = Column(Float)
    liquidity_score  = Column(Float)
    onchain_score    = Column(Float)
    sentiment_score  = Column(Float)
    fraud_score      = Column(Float)

    # Fraud flags
    pump_dump_detected    = Column(Boolean, default=False)
    wash_trading_detected = Column(Boolean, default=False)
    honeypot_detected     = Column(Boolean, default=False)
    fraud_probability     = Column(Float)

    # ML model metadata
    model_version    = Column(String(50))
    feature_snapshot = Column(JSON, default=dict)
    is_anomaly       = Column(Boolean, default=False)
    anomaly_score    = Column(Float)

    scored_at = Column(DateTime(timezone=True), server_default=func.now())

    coin = relationship("Coin", back_populates="risk_scores")


# ══════════════════════════════════════════════════════════════════════════════
# ON-CHAIN METRICS
# ══════════════════════════════════════════════════════════════════════════════
class OnChainMetrics(Base):
    __tablename__ = "onchain_metrics"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coin_id     = Column(String(100), ForeignKey("coins.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp   = Column(DateTime(timezone=True), nullable=False, index=True)

    tx_count_24h         = Column(BigInteger)
    active_addresses_24h = Column(BigInteger)
    whale_accumulation   = Column(Float)
    exchange_inflow      = Column(Float)
    exchange_outflow     = Column(Float)
    gas_used_avg         = Column(Float)
    large_tx_count       = Column(Integer)
    unique_senders_24h   = Column(Integer)
    honeypot_risk        = Column(Boolean, default=False)
    contract_verified    = Column(Boolean)
    top_holder_pct       = Column(Float)
    raw_data             = Column(JSON, default=dict)

    coin = relationship("Coin", back_populates="onchain_metrics")


# ══════════════════════════════════════════════════════════════════════════════
# SENTIMENT DATA
# ══════════════════════════════════════════════════════════════════════════════
class SentimentData(Base):
    __tablename__ = "sentiment_data"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coin_id     = Column(String(100), ForeignKey("coins.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp   = Column(DateTime(timezone=True), nullable=False, index=True)
    source      = Column(String(50))  # reddit / news / twitter

    combined_score   = Column(Float)   # -1 to +1
    positive_pct     = Column(Float)
    negative_pct     = Column(Float)
    neutral_pct      = Column(Float)
    mention_count    = Column(Integer)
    mention_velocity = Column(Float)
    engagement_score = Column(Float)
    raw_data         = Column(JSON, default=dict)

    coin = relationship("Coin", back_populates="sentiment_data")


# ══════════════════════════════════════════════════════════════════════════════
# ALERT
# ══════════════════════════════════════════════════════════════════════════════
class Alert(Base):
    __tablename__ = "alerts"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id     = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    coin_id     = Column(String(100), nullable=False)

    alert_type  = Column(String(50), nullable=False)  # price_above / price_below / risk_above / fraud_detected
    threshold   = Column(Float)
    is_active   = Column(Boolean, default=True)
    cooldown_minutes  = Column(Integer, default=60)
    last_triggered_at = Column(DateTime(timezone=True))
    triggered_count   = Column(Integer, default=0)
    notification_channels = Column(JSON, default=list)

    user = relationship("User", back_populates="alerts")


# ══════════════════════════════════════════════════════════════════════════════
# REPORT
# ══════════════════════════════════════════════════════════════════════════════
class Report(Base):
    __tablename__ = "reports"

    id      = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    coin_id = Column(String(100), nullable=False, index=True)
    status  = Column(String(20), nullable=False, default="pending")  # pending / generating / completed / failed
    title   = Column(String(500))

    executive_summary       = Column(Text)
    market_analysis         = Column(Text)
    risk_analysis           = Column(Text)
    onchain_analysis        = Column(Text)
    sentiment_analysis      = Column(Text)
    recommendation          = Column(String(10))
    recommendation_confidence = Column(Float)
    risk_score_at_generation  = Column(Float)

    agent_outputs       = Column(JSON, default=dict)
    rag_context_chunks  = Column(JSON, default=dict)
    model_used          = Column(String(100))
    generation_time_seconds = Column(Float)

    user = relationship("User", back_populates="reports")


# ══════════════════════════════════════════════════════════════════════════════
# PORTFOLIO
# ══════════════════════════════════════════════════════════════════════════════
class Portfolio(Base):
    __tablename__ = "portfolio"
    __table_args__ = (
        UniqueConstraint("user_id", "coin_id", name="uq_portfolio_user_coin"),
    )

    id                 = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id            = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    coin_id            = Column(String(100), nullable=False)
    quantity           = Column(Float, nullable=False)
    avg_buy_price_usd  = Column(Float)
    current_price_usd  = Column(Float)
    current_value_usd  = Column(Float)
    pnl_usd            = Column(Float)
    pnl_pct            = Column(Float)
    risk_score         = Column(Float)
    allocation_pct     = Column(Float)

    user = relationship("User", back_populates="portfolio")
