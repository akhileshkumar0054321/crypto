"""
WebSocket connection manager.
Handles real-time broadcasting of price, risk, and alert updates.
"""
import json
from datetime import datetime, timezone
from typing import Dict, List, Set

from fastapi import WebSocket, WebSocketDisconnect
from loguru import logger


class ConnectionManager:
    """
    Manages active WebSocket connections.
    Supports topic-based broadcasting (prices, risks, alerts).
    """

    def __init__(self):
        # Map: topic → set of active WebSocket connections
        self._connections: Dict[str, Set[WebSocket]] = {
            "prices": set(),
            "risks": set(),
            "alerts": set(),
            "all": set(),
        }

    async def connect(self, websocket: WebSocket, topic: str = "all"):
        await websocket.accept()
        self._connections.setdefault(topic, set()).add(websocket)
        self._connections["all"].add(websocket)
        logger.info(f"WS client connected → topic={topic} | total={self.total_connections}")

    def disconnect(self, websocket: WebSocket, topic: str = "all"):
        self._connections.get(topic, set()).discard(websocket)
        self._connections["all"].discard(websocket)
        logger.info(f"WS client disconnected | total={self.total_connections}")

    @property
    def total_connections(self) -> int:
        return len(self._connections["all"])

    async def broadcast(self, message: dict, topic: str = "all"):
        """Broadcast a message to all clients subscribed to a topic."""
        clients = list(self._connections.get(topic, set()))
        if not clients:
            return

        payload = json.dumps(message, default=str)
        dead_clients = set()

        for ws in clients:
            try:
                await ws.send_text(payload)
            except Exception:
                dead_clients.add(ws)

        # Clean up dead connections
        for ws in dead_clients:
            self.disconnect(ws, topic)

    async def broadcast_price(self, coin_id: str, price_data: dict):
        """Broadcast a price update to subscribed clients."""
        await self.broadcast(
            {
                "type": "price_update",
                "coin_id": coin_id,
                "symbol": price_data.get("symbol", "").replace("USDT", ""),
                "price": price_data.get("price", 0),
                "open": price_data.get("open", 0),
                "high": price_data.get("high", 0),
                "low": price_data.get("low", 0),
                "volume": price_data.get("volume", 0),
                "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            },
            topic="prices",
        )

    async def broadcast_risk(self, coin_id: str, symbol: str, risk_data: dict):
        """Broadcast a risk score update."""
        await self.broadcast(
            {
                "type": "risk_update",
                "coin_id": coin_id,
                "symbol": symbol,
                "score": risk_data.get("score", 0),
                "risk_level": risk_data.get("risk_level", "UNKNOWN"),
                "recommendation": risk_data.get("recommendation"),
                "fraud_detected": (
                    risk_data.get("pump_dump_detected", False)
                    or risk_data.get("wash_trading_detected", False)
                    or risk_data.get("honeypot_detected", False)
                ),
                "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            },
            topic="risks",
        )

    async def broadcast_alert(self, alert_data: dict):
        """Broadcast a triggered alert."""
        await self.broadcast(
            {
                "type": "alert_fired",
                **alert_data,
                "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            },
            topic="alerts",
        )


# ── Singleton ─────────────────────────────────────────────────────────────────
ws_manager = ConnectionManager()
