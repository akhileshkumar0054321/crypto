"""
Celery application setup for background tasks.
Handles periodic data collection, ML inference, and agent jobs.
"""
from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

# ── Celery App ────────────────────────────────────────────────────────────────
celery_app = Celery(
    "crypto_risk",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.workers.data_tasks",
        "app.workers.ml_tasks",
        "app.workers.alert_tasks",
    ],
)

# ── Configuration ─────────────────────────────────────────────────────────────
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,                   # Acknowledge after task completes
    worker_prefetch_multiplier=1,          # Fair task distribution
    result_expires=3600,                   # Clean up results after 1 hour
    task_soft_time_limit=300,              # Warn after 5 minutes
    task_time_limit=600,                   # Kill after 10 minutes
    worker_max_tasks_per_child=100,        # Restart workers periodically
)

# ── Periodic Tasks (Celery Beat) ──────────────────────────────────────────────
celery_app.conf.beat_schedule = {
    # Collect price data every 60 seconds
    "collect-price-data": {
        "task": "app.workers.data_tasks.collect_price_data",
        "schedule": settings.DATA_COLLECTION_INTERVAL_SECONDS,
        "options": {"queue": "data"},
    },
    # Update risk scores every 2 minutes
    "update-risk-scores": {
        "task": "app.workers.ml_tasks.update_risk_scores",
        "schedule": 120,
        "options": {"queue": "ml"},
    },
    # Collect on-chain data every 2 minutes
    "collect-onchain-data": {
        "task": "app.workers.data_tasks.collect_onchain_data",
        "schedule": settings.ONCHAIN_UPDATE_INTERVAL_SECONDS,
        "options": {"queue": "data"},
    },
    # Collect sentiment data every 5 minutes
    "collect-sentiment-data": {
        "task": "app.workers.data_tasks.collect_sentiment_data",
        "schedule": settings.SENTIMENT_UPDATE_INTERVAL_SECONDS,
        "options": {"queue": "data"},
    },
    # Check and fire alerts every 30 seconds
    "check-alerts": {
        "task": "app.workers.alert_tasks.check_and_fire_alerts",
        "schedule": 30,
        "options": {"queue": "alerts"},
    },
    # Clean up old price history daily at 2 AM UTC
    "cleanup-old-data": {
        "task": "app.workers.data_tasks.cleanup_old_data",
        "schedule": crontab(hour=2, minute=0),
        "options": {"queue": "maintenance"},
    },
}

# ── Task Queues ───────────────────────────────────────────────────────────────
celery_app.conf.task_routes = {
    "app.workers.data_tasks.*": {"queue": "data"},
    "app.workers.ml_tasks.*": {"queue": "ml"},
    "app.workers.alert_tasks.*": {"queue": "alerts"},
}
