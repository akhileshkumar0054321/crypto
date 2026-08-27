"""
Portfolio API routes — manage holdings and compute portfolio risk.
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import (
    MessageResponse, PortfolioAddRequest,
    PortfolioCoinResponse, PortfolioRiskResponse,
)
from app.core.redis import CacheManager, get_cache_manager
from app.db.models import Portfolio, User
from app.db.session import get_db

router = APIRouter()


@router.get("", response_model=List[PortfolioCoinResponse])
async def get_portfolio(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    cache: CacheManager = Depends(get_cache_manager),
):
    """Return the user's portfolio with current prices and P&L."""
    result = await db.execute(
        select(Portfolio).where(Portfolio.user_id == current_user.id)
    )
    holdings = result.scalars().all()

    enriched = []
    for h in holdings:
        price_data = await cache.get(f"price:{h.coin_id}") or {}
        current_price = price_data.get("price_usd", 0) or 0
        current_value = current_price * h.quantity
        cost_basis = h.avg_buy_price_usd * h.quantity
        pnl = current_value - cost_basis
        pnl_pct = (pnl / cost_basis * 100) if cost_basis > 0 else 0

        risk_data = await cache.get(f"risk:{h.coin_id}") or {}

        enriched.append({
            "id": h.id,
            "coin_id": h.coin_id,
            "quantity": h.quantity,
            "avg_buy_price_usd": h.avg_buy_price_usd,
            "current_price_usd": current_price,
            "current_value_usd": current_value,
            "pnl_usd": pnl,
            "pnl_pct": pnl_pct,
            "risk_score": risk_data.get("score"),
            "notes": h.notes,
        })
    return enriched


@router.get("/risk", response_model=PortfolioRiskResponse)
async def get_portfolio_risk(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    cache: CacheManager = Depends(get_cache_manager),
):
    """Compute weighted portfolio risk score."""
    result = await db.execute(
        select(Portfolio).where(Portfolio.user_id == current_user.id)
    )
    holdings = result.scalars().all()

    if not holdings:
        return PortfolioRiskResponse(
            total_value_usd=0, weighted_risk_score=0,
            risk_level="LOW", diversification_score=1.0, coins=[],
        )

    total_value = 0.0
    weighted_risk = 0.0
    coins = []
    highest_risk_score = 0.0
    highest_risk_coin = None

    for h in holdings:
        price_data = await cache.get(f"price:{h.coin_id}") or {}
        risk_data = await cache.get(f"risk:{h.coin_id}") or {}
        current_price = price_data.get("price_usd", 0) or 0
        value = current_price * h.quantity
        risk = risk_data.get("score", 50) or 50

        total_value += value
        weighted_risk += risk * value

        if risk > highest_risk_score:
            highest_risk_score = risk
            highest_risk_coin = h.coin_id

        coins.append({
            "id": h.id, "coin_id": h.coin_id, "quantity": h.quantity,
            "avg_buy_price_usd": h.avg_buy_price_usd,
            "current_price_usd": current_price,
            "current_value_usd": value,
            "pnl_usd": value - h.avg_buy_price_usd * h.quantity,
            "pnl_pct": ((value / (h.avg_buy_price_usd * h.quantity)) - 1) * 100,
            "risk_score": risk,
        })

    final_risk = weighted_risk / total_value if total_value > 0 else 50
    num_coins = len(holdings)
    diversification = min(1.0, num_coins / 10)  # Max diversity at 10 coins

    from app.ml.risk_engine import score_to_risk_level
    return PortfolioRiskResponse(
        total_value_usd=round(total_value, 2),
        weighted_risk_score=round(final_risk, 2),
        risk_level=score_to_risk_level(final_risk),
        highest_risk_coin=highest_risk_coin,
        diversification_score=round(diversification, 2),
        coins=coins,
    )


@router.post("/coins", response_model=PortfolioCoinResponse, status_code=status.HTTP_201_CREATED)
async def add_coin(
    payload: PortfolioAddRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a coin to the portfolio."""
    holding = Portfolio(
        user_id=current_user.id,
        coin_id=payload.coin_id,
        quantity=payload.quantity,
        avg_buy_price_usd=payload.avg_buy_price_usd,
        notes=payload.notes,
    )
    db.add(holding)
    await db.flush()
    return {
        "id": holding.id, "coin_id": holding.coin_id,
        "quantity": holding.quantity, "avg_buy_price_usd": holding.avg_buy_price_usd,
    }


@router.delete("/coins/{coin_id}", response_model=MessageResponse)
async def remove_coin(
    coin_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a coin from the portfolio."""
    result = await db.execute(
        select(Portfolio).where(
            Portfolio.user_id == current_user.id,
            Portfolio.coin_id == coin_id,
        )
    )
    holding = result.scalar_one_or_none()
    if not holding:
        raise HTTPException(status_code=404, detail="Coin not in portfolio")
    await db.delete(holding)
    return {"message": f"{coin_id} removed from portfolio"}
