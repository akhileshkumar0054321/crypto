# 🚀 Crypto Risk Platform

An AI-powered cryptocurrency risk management platform featuring real-time risk scoring, fraud detection, multi-agent analysis, RAG knowledge retrieval, and a professional trading dashboard.

---

## Features

- **Real-time Risk Scoring** — 0–100 risk scores for 12+ cryptocurrencies, updated every 60s
- **Fraud Detection** — Pump & dump, wash trading, honeypot detection via Isolation Forest
- **Multi-Agent Analysis** — 6 specialized CrewAI agents (market, risk, on-chain, sentiment, coordinator, reporter)
- **RAG Knowledge System** — ChromaDB + LangChain for crypto whitepaper & audit retrieval
- **AI Reports** — BUY/SELL/HOLD recommendations via Phi-2 / Mistral 7B
- **Real-time Dashboard** — Next.js 14 trading terminal with live WebSocket data
- **Portfolio Risk** — Weighted portfolio risk assessment

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker Desktop
- VS Code (recommended)

### 1. Clone & Enter Project
```powershell
cd C:\Users\hp\.gemini\antigravity\scratch\crypto-risk-platform
```

### 2. Copy Environment File
```powershell
Copy-Item .env.example .env
# Edit .env with your API keys (see API Keys section below)
```

### 3. Start Docker Services (PostgreSQL + Redis)
```powershell
cd docker
docker compose up -d
cd ..
```

### 4. Set Up Python Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 5. Run Database Migrations
```powershell
alembic upgrade head
```

### 6. Start Backend Server
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 7. Set Up & Start Frontend (new terminal)
```powershell
cd frontend
npm install
npm run dev
```

### 8. Open in Browser
- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs
- **PgAdmin:** http://localhost:5050 (with `--profile dev` Docker flag)

---

## Project Structure

```
crypto-risk-platform/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # FastAPI route handlers
│   │   ├── core/            # Config, security, logging
│   │   ├── db/              # SQLAlchemy models & sessions
│   │   ├── services/        # Business logic layer
│   │   ├── ml/              # ML models & inference
│   │   ├── agents/          # CrewAI agent definitions
│   │   ├── rag/             # RAG system (ChromaDB + LangChain)
│   │   ├── data/            # Data collectors (CoinGecko, Binance, etc.)
│   │   └── workers/         # Celery background tasks
│   ├── tests/
│   ├── alembic/             # Database migrations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js 14 App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API client, utilities
│   │   ├── store/           # Zustand state management
│   │   └── types/           # TypeScript types
│   └── package.json
├── ml_models/               # Saved model artifacts (.pkl, .pt)
├── vector_store/            # ChromaDB persistent data
├── docker/
│   ├── docker-compose.yml
│   ├── postgres/init.sql
│   └── redis/redis.conf
├── .env.example
└── README.md
```

---

## API Keys Required

| Service | Purpose | Get Free Key |
|---------|---------|-------------|
| CoinGecko | Price & market data | [coingecko.com/api](https://www.coingecko.com/en/api) |
| Etherscan | On-chain data | [etherscan.io/register](https://etherscan.io/register) |
| Alchemy | Blockchain node | [alchemy.com](https://www.alchemy.com) |
| Twitter/X | Sentiment data | [developer.twitter.com](https://developer.twitter.com) |
| Reddit | Sentiment data | [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) |
| HuggingFace | LLM access | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |

> DefiLlama and Binance public market data require **no API key**.

---

## Architecture

```
Next.js Frontend  ←→  FastAPI Backend  ←→  PostgreSQL
      ↕                    ↕                   ↕
  WebSocket          Celery Workers         Redis
                          ↕
              ┌───────────┼───────────┐
          Data Pipeline  ML Engine  Agent System
              ↕              ↕           ↕
         APIs/WebSockets  XGBoost    CrewAI Agents
                          LSTM       RAG (ChromaDB)
                        Iso Forest   Phi-2 / Mistral
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS, Recharts, Zustand |
| Backend | FastAPI, Uvicorn, Celery, WebSockets |
| Database | PostgreSQL (asyncpg), Redis |
| ML | XGBoost, scikit-learn, PyTorch (LSTM) |
| NLP | Sentence Transformers, FinBERT |
| RAG | LangChain, ChromaDB, FAISS |
| Agents | CrewAI, LangGraph |
| LLM | Phi-2 (CPU) / Mistral 7B (GPU) |
| Blockchain | Web3.py, CCXT, Etherscan API |

---

## Development Commands

```powershell
# Start all services
docker compose -f docker/docker-compose.yml up -d

# Backend (from /backend with .venv activated)
uvicorn app.main:app --reload

# Celery worker
celery -A app.workers.celery_app worker --loglevel=info

# Celery beat (scheduler)
celery -A app.workers.celery_app beat --loglevel=info

# Frontend
cd frontend && npm run dev

# Run tests
cd backend && pytest tests/ -v --cov=app

# DB migration
alembic revision --autogenerate -m "description"
alembic upgrade head
```

---

## License

MIT License — see [LICENSE](LICENSE) for details.
