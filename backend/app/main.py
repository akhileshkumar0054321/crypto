"""
FastAPI main application entry point.

Initializes:
- CORS middleware
- Database connection
- Redis connection
- Celery app
- WebSocket manager
- All API routers
"""
from contextlib import asynccontextmanager

try:
    import sentry_sdk
    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse as ORJSONResponse

from app.core.config import settings
from app.core.logging import logger, setup_logging
from app.core.redis import close_async_redis, get_async_redis
from app.db.session import close_db, init_db

# Setup logging first
setup_logging()


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle — runs setup before yield, teardown after."""
    logger.info("🚀 Starting Crypto Risk Platform...")

    # 1. Initialize database
    await init_db()
    logger.info("✅ Database initialized")

    # 2. Test Redis connection
    redis = await get_async_redis()
    await redis.ping()
    logger.info("✅ Redis connected")

    # 3. Initialize Sentry (production only)
    if settings.SENTRY_DSN and settings.APP_ENV == "production":
        sentry_sdk.init(dsn=settings.SENTRY_DSN, environment=settings.APP_ENV)
        logger.info("✅ Sentry initialized")

    logger.info(f"🌐 Server running at http://{settings.APP_HOST}:{settings.APP_PORT}")
    logger.info(f"📚 API docs at http://{settings.APP_HOST}:{settings.APP_PORT}/docs")

    yield  # ← Application runs here

    # Shutdown
    logger.info("⏳ Shutting down...")
    await close_async_redis()
    await close_db()
    logger.info("👋 Shutdown complete")


# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered cryptocurrency risk analysis platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)


# ── Routers ───────────────────────────────────────────────────────────────────
from app.api.routes import auth, coins, risk, alerts, portfolio, reports, websocket

app.include_router(auth.router,      prefix="/api/auth",      tags=["Authentication"])
app.include_router(coins.router,     prefix="/api/coins",     tags=["Coins"])
app.include_router(risk.router,      prefix="/api/risk",      tags=["Risk Analysis"])
app.include_router(alerts.router,    prefix="/api/alerts",    tags=["Alerts"])
app.include_router(reports.router,   prefix="/api/reports",   tags=["Reports"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])
app.include_router(websocket.router, prefix="/ws",            tags=["WebSocket"])


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    """Platform health check — returns service statuses."""
    redis = await get_async_redis()
    redis_ok = False
    try:
        await redis.ping()
        redis_ok = True
    except Exception:
        pass

    return {
        "status": "healthy" if redis_ok else "degraded",
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "environment": settings.APP_ENV,
        "services": {
            "api": "up",
            "redis": "up" if redis_ok else "down",
        },
    }


@app.get("/", tags=["Root"])
async def root():
    """API root — redirect hint to docs."""
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/docs",
        "health": "/health",
    }
