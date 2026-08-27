"""
Celery alert tasks — check user-defined alerts and fire notifications.
"""
import json
from datetime import datetime, timedelta, timezone

from loguru import logger

from app.workers.celery_app import celery_app


@celery_app.task(name="app.workers.alert_tasks.check_and_fire_alerts", queue="alerts")
def check_and_fire_alerts():
    """
    Check all active alerts against current prices/risk scores.
    Fires notifications if conditions are met and cooldown has elapsed.
    """
    from sqlalchemy import create_engine, select
    from sqlalchemy.orm import sessionmaker
    from app.core.config import settings
    from app.core.redis import get_sync_redis
    from app.db.models import Alert
    from app.core.websocket import ws_manager
    import asyncio

    engine = create_engine(settings.sync_database_url)
    Session = sessionmaker(bind=engine)
    db = Session()
    redis = get_sync_redis()
    fired = 0

    try:
        alerts = db.execute(select(Alert).where(Alert.is_active == True)).scalars().all()

        for alert in alerts:
            # Check cooldown
            if alert.last_triggered_at:
                cooldown_end = alert.last_triggered_at + timedelta(minutes=alert.cooldown_minutes)
                if datetime.now(timezone.utc) < cooldown_end.replace(tzinfo=timezone.utc):
                    continue

            # Get current value
            current_value = None
            if alert.alert_type in ("price_above", "price_below"):
                price_raw = redis.get(f"price:{alert.coin_id}")
                if price_raw:
                    current_value = json.loads(price_raw).get("price_usd")
            elif alert.alert_type in ("risk_above", "risk_below"):
                risk_raw = redis.get(f"risk:{alert.coin_id}")
                if risk_raw:
                    current_value = json.loads(risk_raw).get("score")
            elif alert.alert_type == "fraud_detected":
                risk_raw = redis.get(f"risk:{alert.coin_id}")
                if risk_raw:
                    risk_data = json.loads(risk_raw)
                    current_value = 1.0 if (
                        risk_data.get("pump_dump_detected") or
                        risk_data.get("wash_trading_detected") or
                        risk_data.get("honeypot_detected")
                    ) else 0.0

            if current_value is None:
                continue

            # Check condition
            triggered = False
            if alert.alert_type in ("price_above", "risk_above") and current_value >= alert.threshold:
                triggered = True
            elif alert.alert_type in ("price_below", "risk_below") and current_value <= alert.threshold:
                triggered = True
            elif alert.alert_type == "fraud_detected" and current_value >= 1.0:
                triggered = True

            if triggered:
                # Update alert tracking
                alert.triggered_count += 1
                alert.last_triggered_at = datetime.now(timezone.utc)
                db.commit()

                alert_payload = {
                    "alert_id": str(alert.id),
                    "coin_id": alert.coin_id,
                    "alert_type": alert.alert_type,
                    "current_value": current_value,
                    "threshold": alert.threshold,
                    "message": _build_alert_message(alert, current_value),
                }

                # Push to WebSocket (async bridge)
                redis.publish("alerts:broadcast", json.dumps(alert_payload, default=str))
                fired += 1
                logger.warning(f"🚨 Alert fired: {alert.coin_id} {alert.alert_type} ({current_value:.2f} vs {alert.threshold})")

    except Exception as e:
        logger.error(f"Alert check failed: {e}")
        db.rollback()
    finally:
        db.close()

    logger.info(f"Alert check complete: {fired} alerts fired from {len(alerts) if 'alerts' in dir() else 0} active")
    return fired


def _build_alert_message(alert, current_value: float) -> str:
    """Build a human-readable alert message."""
    type_map = {
        "price_above": f"Price crossed above ${alert.threshold:,.2f} (now ${current_value:,.2f})",
        "price_below": f"Price dropped below ${alert.threshold:,.2f} (now ${current_value:,.2f})",
        "risk_above":  f"Risk score exceeded {alert.threshold:.0f} (now {current_value:.1f}/100)",
        "risk_below":  f"Risk score dropped below {alert.threshold:.0f} (now {current_value:.1f}/100)",
        "fraud_detected": "⚠️ Fraud signal detected! Review immediately.",
    }
    return type_map.get(alert.alert_type, f"Alert condition met: {current_value}")
