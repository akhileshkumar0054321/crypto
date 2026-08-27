"""
Pydantic schemas for request/response validation.
Separate from ORM models — these are the API contracts.
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ══════════════════════════════════════════════════════════════════════════════
# AUTH
# ══════════════════════════════════════════════════════════════════════════════
class UserRegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════════════════════
# COIN
# ══════════════════════════════════════════════════════════════════════════════
class CoinResponse(BaseModel):
    id: str
    symbol: str
    name: str
    image_url: Optional[str] = None
    market_cap_rank: Optional[int] = None
    contract_address: Optional[str] = None
    blockchain: Optional[str] = None

    model_config = {"from_attributes": True}


class CoinMarketData(BaseModel):
    """Live market data — combined from CoinGecko + Binance."""
    coin_id: str
    symbol: str
    name: str
    price_usd: float
    price_change_1h: Optional[float] = None
    price_change_24h: Optional[float] = None
    price_change_7d: Optional[float] = None
    market_cap: Optional[float] = None
    volume_24h: Optional[float] = None
    market_cap_rank: Optional[int] = None
    ath: Optional[float] = None
    ath_change_percentage: Optional[float] = None
    circulating_supply: Optional[float] = None
    image_url: Optional[str] = None
    last_updated: Optional[datetime] = None


# ══════════════════════════════════════════════════════════════════════════════
# RISK SCORE
# ══════════════════════════════════════════════════════════════════════════════
class RiskScoreResponse(BaseModel):
    coin_id: str
    symbol: str
    score: float = Field(..., ge=0, le=100)
    risk_level: str                          # LOW | MEDIUM | HIGH | CRITICAL
    volatility_score: Optional[float] = None
    liquidity_score: Optional[float] = None
    sentiment_score: Optional[float] = None
    onchain_score: Optional[float] = None
    fraud_probability: Optional[float] = None
    pump_dump_detected: bool = False
    wash_trading_detected: bool = False
    honeypot_detected: bool = False
    recommendation: Optional[str] = None    # BUY | SELL | HOLD
    recommendation_confidence: Optional[float] = None
    timestamp: datetime
    model_version: str = "v1"

    model_config = {"from_attributes": True}


class RiskAnalyzeRequest(BaseModel):
    coin_id: str
    force_refresh: bool = False


# ══════════════════════════════════════════════════════════════════════════════
# PRICE HISTORY
# ══════════════════════════════════════════════════════════════════════════════
class PricePoint(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float

    model_config = {"from_attributes": True}


class PriceHistoryResponse(BaseModel):
    coin_id: str
    interval: str
    data: List[PricePoint]


# ══════════════════════════════════════════════════════════════════════════════
# ALERT
# ══════════════════════════════════════════════════════════════════════════════
class AlertCreateRequest(BaseModel):
    coin_id: str
    alert_type: str = Field(..., pattern="^(price_above|price_below|risk_above|risk_below|fraud_detected)$")
    threshold: float
    notify_email: bool = True
    notify_telegram: bool = False
    notify_browser: bool = True
    cooldown_minutes: int = Field(default=60, ge=5, le=1440)


class AlertResponse(BaseModel):
    id: uuid.UUID
    coin_id: str
    alert_type: str
    threshold: float
    is_active: bool
    triggered_count: int
    last_triggered_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════════════════════
# REPORT
# ══════════════════════════════════════════════════════════════════════════════
class ReportGenerateRequest(BaseModel):
    coin_id: str


class ReportResponse(BaseModel):
    id: uuid.UUID
    coin_id: str
    title: str
    status: str
    executive_summary: Optional[str] = None
    market_analysis: Optional[str] = None
    risk_analysis: Optional[str] = None
    onchain_analysis: Optional[str] = None
    sentiment_analysis: Optional[str] = None
    recommendation: Optional[str] = None
    recommendation_confidence: Optional[float] = None
    risk_score_at_generation: Optional[float] = None
    model_used: Optional[str] = None
    generation_time_seconds: Optional[float] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════════════════════
# PORTFOLIO
# ══════════════════════════════════════════════════════════════════════════════
class PortfolioAddRequest(BaseModel):
    coin_id: str
    quantity: float = Field(..., gt=0)
    avg_buy_price_usd: float = Field(..., gt=0)
    notes: Optional[str] = None


class PortfolioCoinResponse(BaseModel):
    id: uuid.UUID
    coin_id: str
    quantity: float
    avg_buy_price_usd: float
    current_price_usd: Optional[float] = None
    current_value_usd: Optional[float] = None
    pnl_usd: Optional[float] = None
    pnl_pct: Optional[float] = None
    risk_score: Optional[float] = None
    notes: Optional[str] = None

    model_config = {"from_attributes": True}


class PortfolioRiskResponse(BaseModel):
    total_value_usd: float
    weighted_risk_score: float
    risk_level: str
    highest_risk_coin: Optional[str] = None
    diversification_score: float
    coins: List[PortfolioCoinResponse]


# ══════════════════════════════════════════════════════════════════════════════
# WEBSOCKET MESSAGES
# ══════════════════════════════════════════════════════════════════════════════
class WSPriceMessage(BaseModel):
    type: str = "price_update"
    coin_id: str
    symbol: str
    price: float
    change_24h: Optional[float] = None
    volume_24h: Optional[float] = None
    timestamp: datetime


class WSRiskMessage(BaseModel):
    type: str = "risk_update"
    coin_id: str
    symbol: str
    score: float
    risk_level: str
    fraud_detected: bool = False
    timestamp: datetime


class WSAlertMessage(BaseModel):
    type: str = "alert_fired"
    alert_id: str
    coin_id: str
    symbol: str
    alert_type: str
    current_value: float
    threshold: float
    message: str
    timestamp: datetime


# ══════════════════════════════════════════════════════════════════════════════
# GENERIC
# ══════════════════════════════════════════════════════════════════════════════
class MessageResponse(BaseModel):
    message: str


class PaginatedResponse(BaseModel):
    total: int
    page: int
    per_page: int
    data: list
