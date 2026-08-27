"""
Structured logging configuration using Loguru.
Provides console + file logging with JSON support for production.
"""
import sys
import io
from pathlib import Path

from loguru import logger

from app.core.config import settings


def setup_logging() -> None:
    """Configure application-wide logging."""
    logger.remove()

    log_level = "DEBUG" if settings.APP_DEBUG else "INFO"
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )

    # UTF-8 wrapped stdout — prevents Windows cp1252 encoding errors
    safe_stdout = (
        io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        if hasattr(sys.stdout, "buffer")
        else sys.stdout
    )

    logger.add(
        safe_stdout,
        format=log_format,
        level=log_level,
        colorize=False,
        backtrace=True,
        diagnose=settings.APP_DEBUG,
    )

    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    logger.add(
        log_dir / "app.log",
        format=log_format,
        level="DEBUG",
        rotation="10 MB",
        retention="7 days",
        colorize=False,
        encoding="utf-8",
    )

    logger.info(f"Logging initialized env={settings.APP_ENV} level={log_level}")
