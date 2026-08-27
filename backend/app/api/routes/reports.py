"""
Reports API routes — generate and retrieve AI analysis reports.
"""
import uuid
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.api.schemas import ReportGenerateRequest, ReportResponse
from app.core.redis import CacheManager, get_cache_manager
from app.db.models import Report, User
from app.db.session import get_db

router = APIRouter()


async def _generate_report_bg(
    report_id: uuid.UUID,
    coin_id: str,
    user_id: uuid.UUID,
    cache: CacheManager,
):
    """Background task: runs agents + LLM and saves report to DB."""
    from app.agents.crew import orchestrator
    from app.agents.report_gen import report_generator
    from app.rag.rag_system import rag_system
    from app.db.session import AsyncSessionLocal
    import json

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Report).where(Report.id == report_id))
        report = result.scalar_one_or_none()
        if not report:
            return

        try:
            report.status = "generating"
            await db.commit()

            # Load data from cache
            market_raw = await cache.get(f"price:{coin_id}") or {}
            risk_raw = await cache.get(f"risk:{coin_id}") or {}
            onchain_raw = await cache.get(f"onchain:{coin_id}") or {}
            sentiment_raw = await cache.get(f"sentiment:{coin_id}") or {}

            symbol = market_raw.get("symbol", coin_id.upper())

            # RAG context
            fraud_flags = {
                "pump_dump_detected": risk_raw.get("pump_dump_detected", False),
                "wash_trading_detected": risk_raw.get("wash_trading_detected", False),
                "honeypot_detected": risk_raw.get("honeypot_detected", False),
            }
            rag_context = rag_system.get_risk_context(
                coin_id, risk_raw.get("score", 50), fraud_flags
            )

            # Agent analysis
            agent_outputs = await orchestrator.analyze(
                coin_id=coin_id, symbol=symbol,
                market_data=market_raw, risk_result=risk_raw,
                onchain=onchain_raw, sentiment=sentiment_raw,
                rag_context=rag_context,
            )

            # LLM report
            report_data = await report_generator.generate_report(
                coin_id=coin_id, symbol=symbol,
                market_data=market_raw, risk_result=risk_raw,
                agent_outputs=agent_outputs, rag_context=rag_context,
            )

            # Save to DB
            report.status = "completed"
            report.title = report_data["title"]
            report.executive_summary = report_data["executive_summary"]
            report.market_analysis = report_data["market_analysis"]
            report.risk_analysis = report_data["risk_analysis"]
            report.onchain_analysis = report_data["onchain_analysis"]
            report.sentiment_analysis = report_data["sentiment_analysis"]
            report.recommendation = report_data["recommendation"]
            report.recommendation_confidence = report_data["recommendation_confidence"]
            report.risk_score_at_generation = report_data["risk_score_at_generation"]
            report.agent_outputs = agent_outputs
            report.rag_context_chunks = report_data["rag_context_chunks"]
            report.model_used = report_data["model_used"]
            report.generation_time_seconds = report_data["generation_time_seconds"]
            await db.commit()

        except Exception as e:
            report.status = "failed"
            await db.commit()
            from loguru import logger
            logger.error(f"Report generation failed for {coin_id}: {e}")


@router.get("", response_model=List[ReportResponse])
async def list_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all reports for the authenticated user."""
    result = await db.execute(
        select(Report)
        .where(Report.user_id == current_user.id)
        .order_by(Report.created_at.desc())
        .limit(50)
    )
    return result.scalars().all()


@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_202_ACCEPTED)
async def generate_report(
    payload: ReportGenerateRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    cache: CacheManager = Depends(get_cache_manager),
):
    """
    Trigger AI report generation for a coin.
    Returns immediately with status=pending; report fills in the background.
    """
    market_data = await cache.get(f"price:{payload.coin_id}") or {}
    symbol = market_data.get("symbol", payload.coin_id.upper())

    report = Report(
        user_id=current_user.id,
        coin_id=payload.coin_id,
        title=f"{symbol} Risk Analysis — Generating...",
        status="pending",
    )
    db.add(report)
    await db.flush()

    background_tasks.add_task(
        _generate_report_bg,
        report.id, payload.coin_id, current_user.id, cache,
    )
    return report


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch a specific report by ID."""
    result = await db.execute(
        select(Report).where(
            Report.id == report_id,
            Report.user_id == current_user.id,
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
