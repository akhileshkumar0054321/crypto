@echo off
echo ============================================================
echo   Crypto Risk Platform - Full Startup
echo ============================================================

:: ── Step 1: Check Docker ─────────────────────────────────────
echo.
echo [1/5] Starting PostgreSQL + Redis via Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo   WARNING: Docker not running. Skipping DB startup.
    echo   Install Docker Desktop from https://docker.com and run:
    echo   docker compose -f docker/docker-compose.yml up -d
) else (
    docker compose -f docker/docker-compose.yml up -d
    echo   PostgreSQL + Redis started!
    timeout /t 3 /nobreak >nul
)

:: ── Step 2: Backend packages ──────────────────────────────────
echo.
echo [2/5] Activating Python venv...
call backend\.venv\Scripts\activate.bat

echo [3/5] Running DB migrations...
cd backend
alembic upgrade head
cd ..

:: ── Step 3: Initialize ML + RAG ──────────────────────────────
echo.
echo [4/5] Initializing ML models and RAG...
call backend\.venv\Scripts\python.exe scripts/initialize.py

:: ── Step 4: Launch services ───────────────────────────────────
echo.
echo [5/5] Launching services...
echo   Opening 3 terminal windows...

:: FastAPI backend
start "FastAPI Backend" cmd /k "cd backend && .venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: Celery worker (all queues)
start "Celery Worker" cmd /k "cd backend && .venv\Scripts\activate && celery -A app.workers.celery_app worker --loglevel=info -Q data,ml,alerts,maintenance"

:: Celery beat scheduler
start "Celery Beat" cmd /k "cd backend && .venv\Scripts\activate && celery -A app.workers.celery_app beat --loglevel=info"

echo.
echo ============================================================
echo   Backend running at: http://localhost:8000
echo   API docs at:        http://localhost:8000/docs
echo ============================================================
echo.
echo   To start the frontend, run in a new terminal:
echo   cd frontend ^&^& npm run dev
echo   Frontend: http://localhost:3000
echo ============================================================
pause
