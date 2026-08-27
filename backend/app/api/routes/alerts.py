"""
Alerts API routes — create, list, update, delete user alerts.
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import AlertCreateRequest, AlertResponse, MessageResponse
from app.db.models import Alert, User
from app.db.session import get_db

router = APIRouter()


@router.get("", response_model=List[AlertResponse])
async def list_alerts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all alerts for the authenticated user."""
    result = await db.execute(
        select(Alert).where(Alert.user_id == current_user.id).order_by(Alert.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(
    payload: AlertCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new price or risk alert."""
    alert = Alert(
        user_id=current_user.id,
        coin_id=payload.coin_id,
        alert_type=payload.alert_type,
        threshold=payload.threshold,
        notify_email=payload.notify_email,
        notify_telegram=payload.notify_telegram,
        notify_browser=payload.notify_browser,
        cooldown_minutes=payload.cooldown_minutes,
    )
    db.add(alert)
    await db.flush()
    return alert


@router.put("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: uuid.UUID,
    payload: AlertCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing alert."""
    result = await db.execute(
        select(Alert).where(Alert.id == alert_id, Alert.user_id == current_user.id)
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.threshold = payload.threshold
    alert.alert_type = payload.alert_type
    alert.notify_email = payload.notify_email
    alert.notify_telegram = payload.notify_telegram
    alert.notify_browser = payload.notify_browser
    alert.cooldown_minutes = payload.cooldown_minutes
    return alert


@router.delete("/{alert_id}", response_model=MessageResponse)
async def delete_alert(
    alert_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an alert."""
    result = await db.execute(
        select(Alert).where(Alert.id == alert_id, Alert.user_id == current_user.id)
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    await db.delete(alert)
    return {"message": "Alert deleted"}


@router.patch("/{alert_id}/toggle", response_model=AlertResponse)
async def toggle_alert(
    alert_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Enable or disable an alert."""
    result = await db.execute(
        select(Alert).where(Alert.id == alert_id, Alert.user_id == current_user.id)
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_active = not alert.is_active
    return alert
