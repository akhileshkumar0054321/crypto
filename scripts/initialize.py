#!/usr/bin/env python3
"""
One-shot startup script — trains ML models and initializes the RAG system.
Run once before starting the backend server.

Usage: python scripts/initialize.py
"""
import sys
import asyncio
from pathlib import Path

# Ensure backend root is on path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

print("=" * 60)
print("  Crypto Risk Platform — Initialization")
print("=" * 60)


def train_models():
    print("\n[1/3] Training ML models...")
    try:
        import numpy as np
        from app.ml.features import feature_engineer
        from app.ml.risk_engine import RiskEngine

        np.random.seed(42)
        n = 2000
        X_rows, y = [], []
        for _ in range(n):
            cls = np.random.choice([0, 1, 2], p=[0.40, 0.35, 0.25])
            row = np.random.randn(len(feature_engineer.FEATURE_NAMES))
            if cls == 0:
                row = np.clip(row * 0.1, -1, 1)
            elif cls == 1:
                row = np.clip(row * 0.3, -1, 1)
            else:
                row = np.clip(row * 0.6 + 0.2 * np.sign(row), -1, 1)
            X_rows.append(row.tolist())
            y.append(cls)

        X = np.array(X_rows)
        y = np.array(y)

        engine = RiskEngine()
        engine.train(X, y)
        print("    ✅ ML models trained and saved to ml_models/")
        return True
    except Exception as e:
        print(f"    ⚠️  ML training skipped: {e}")
        print("    (Install scikit-learn and xgboost first)")
        return False


def init_rag():
    print("\n[2/3] Initializing RAG knowledge base...")
    try:
        from app.rag.rag_system import rag_system
        rag_system.initialize()
        count = rag_system.get_document_count()
        print(f"    ✅ RAG ready — {count} documents in ChromaDB")
        return True
    except Exception as e:
        print(f"    ⚠️  RAG skipped: {e}")
        print("    (Install chromadb and sentence-transformers first)")
        return False


def verify_apis():
    print("\n[3/3] Verifying API connectivity...")
    import urllib.request, json, ssl
    ctx = ssl.create_default_context()

    apis = [
        ("CoinGecko", "https://api.coingecko.com/api/v3/ping",
         {"x-cg-demo-api-key": "CG-j3bwSG6VvmmLBS9qpQXF2PL7", "User-Agent": "CryptoRiskBot/1.0"}),
        ("Etherscan", "https://api.etherscan.io/v2/api?chainid=1&module=stats&action=ethprice&apikey=JX1VZSEA7EWC4FYB1388FT5PFT9U26QYQ7",
         {"User-Agent": "CryptoRiskBot/1.0"}),
    ]

    for name, url, headers in apis:
        try:
            req = urllib.request.Request(url, headers=headers)
            data = json.loads(urllib.request.urlopen(req, context=ctx, timeout=10).read())
            print(f"    ✅ {name}: OK")
        except Exception as e:
            print(f"    ⚠️  {name}: {e}")

    # Alchemy via POST
    try:
        body = json.dumps({"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}).encode()
        req = urllib.request.Request(
            "https://eth-mainnet.g.alchemy.com/v2/alch_Js1nNw7odd1b-w_8odELo",
            data=body, headers={"Content-Type": "application/json"}
        )
        data = json.loads(urllib.request.urlopen(req, context=ctx, timeout=10).read())
        block = int(data["result"], 16)
        print(f"    ✅ Alchemy: Block #{block:,}")
    except Exception as e:
        print(f"    ⚠️  Alchemy: {e}")


if __name__ == "__main__":
    import os
    os.chdir(Path(__file__).parent.parent / "backend")

    train_models()
    init_rag()
    verify_apis()

    print("\n" + "=" * 60)
    print("  Initialization complete!")
    print("  Next step: start the backend server")
    print("    cd backend")
    print("    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
    print("=" * 60)
