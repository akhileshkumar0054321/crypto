"""
Core application settings using Pydantic Settings.
Loads from environment variables and .env file.
"""
from functools import lru_cache
from typing import List, Optional

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ───────────────────────────────────────────────────────────
    APP_NAME: str = "Crypto Risk Platform"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    SECRET_KEY: str = "changeme-in-production-at-least-32-chars"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # ── JWT ───────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "jwt-secret-key-min-32-chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Database ──────────────────────────────────────────────────────────────
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "crypto_risk_db"
    POSTGRES_USER: str = "crypto_user"
    POSTGRES_PASSWORD: str = "crypto_secret_pass"
    DATABASE_URL: str = (
        "postgresql+asyncpg://crypto_user:crypto_secret_pass@localhost:5432/crypto_risk_db"
    )

    @property
    def sync_database_url(self) -> str:
        """Synchronous DB URL for Alembic migrations."""
        return self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

    # ── Redis ─────────────────────────────────────────────────────────────────
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = "redis_secret_pass"
    REDIS_DB: int = 0
    REDIS_URL: str = "redis://:redis_secret_pass@localhost:6379/0"

    # ── Celery ────────────────────────────────────────────────────────────────
    CELERY_BROKER_URL: str = "redis://:redis_secret_pass@localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://:redis_secret_pass@localhost:6379/2"

    # ── External APIs ─────────────────────────────────────────────────────────
    COINGECKO_API_KEY: Optional[str] = None
    COINGECKO_BASE_URL: str = "https://api.coingecko.com/api/v3"

    BINANCE_API_KEY: Optional[str] = None
    BINANCE_API_SECRET: Optional[str] = None
    BINANCE_BASE_URL: str = "https://api.binance.com"
    BINANCE_WS_URL: str = "wss://stream.binance.com:9443"

    ETHERSCAN_API_KEY: Optional[str] = None
    ETHERSCAN_BASE_URL: str = "https://api.etherscan.io/api"

    ALCHEMY_API_KEY: Optional[str] = None
    ALCHEMY_ETH_URL: str = "https://eth-mainnet.g.alchemy.com/v2/alch_Js1nNw7odd1b-w_8odELo"

    ETHERSCAN_API_KEY: Optional[str] = None
    ETHERSCAN_BASE_URL: str = "https://api.etherscan.io/v2/api"

    TWITTER_API_KEY: Optional[str] = None
    TWITTER_API_SECRET: Optional[str] = None
    TWITTER_ACCESS_TOKEN: Optional[str] = None
    TWITTER_ACCESS_TOKEN_SECRET: Optional[str] = None

    REDDIT_CLIENT_ID: Optional[str] = None
    REDDIT_CLIENT_SECRET: Optional[str] = None
    REDDIT_USER_AGENT: str = "CryptoRiskBot/1.0"

    DEFILLAMA_BASE_URL: str = "https://api.llama.fi"
    CRYPTOCOMPARE_API_KEY: Optional[str] = None

    # ── HuggingFace & LLM ─────────────────────────────────────────────────────
    HUGGINGFACE_API_TOKEN: Optional[str] = None
    ML_MODEL_PATH: str = "../ml_models"
    VECTOR_STORE_PATH: str = "../vector_store"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    LLM_MODEL: str = "microsoft/phi-2"
    LLM_DEVICE: str = "cpu"  # cpu | cuda | mps

    # ── Telegram ──────────────────────────────────────────────────────────────
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_CHAT_ID: Optional[str] = None

    # ── Sentry ────────────────────────────────────────────────────────────────
    SENTRY_DSN: Optional[str] = None

    # ── Data Collection Intervals (seconds) ───────────────────────────────────
    DATA_COLLECTION_INTERVAL_SECONDS: int = 60
    PRICE_UPDATE_INTERVAL_SECONDS: int = 10
    SENTIMENT_UPDATE_INTERVAL_SECONDS: int = 300
    ONCHAIN_UPDATE_INTERVAL_SECONDS: int = 120

    # ── Risk Scoring Thresholds ───────────────────────────────────────────────
    RISK_LOW_THRESHOLD: int = 30
    RISK_MEDIUM_THRESHOLD: int = 60
    RISK_HIGH_THRESHOLD: int = 80
    ALERT_RISK_SPIKE_THRESHOLD: int = 15

    # ── Cache TTLs (seconds) ──────────────────────────────────────────────────
    CACHE_PRICE_TTL: int = 10
    CACHE_RISK_SCORE_TTL: int = 60
    CACHE_MARKET_DATA_TTL: int = 300
    CACHE_SENTIMENT_TTL: int = 600

    # ── Tracked Coins (default set) ───────────────────────────────────────────
    TRACKED_COINS: List[str] = [
        "bitcoin", "ethereum", "binancecoin", "solana", "cardano",
        "ripple", "avalanche-2", "polkadot", "chainlink", "uniswap",
        "matic-network", "dogecoin",
    ]


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — call this everywhere."""
    return Settings()


settings = get_settings()
