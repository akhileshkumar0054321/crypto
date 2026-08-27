"""
WebSocket route — real-time streaming of prices, risks, and alerts.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from loguru import logger

from app.core.websocket import ws_manager

router = APIRouter()


@router.websocket("/prices")
async def websocket_prices(websocket: WebSocket):
    """
    WebSocket endpoint for real-time price updates.
    Clients receive: { type, coin_id, symbol, price, volume, timestamp }
    """
    await ws_manager.connect(websocket, topic="prices")
    try:
        while True:
            # Keep connection alive — data is pushed via Binance WS callback
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, topic="prices")
    except Exception as e:
        logger.error(f"Price WS error: {e}")
        ws_manager.disconnect(websocket, topic="prices")


@router.websocket("/risks")
async def websocket_risks(websocket: WebSocket):
    """
    WebSocket endpoint for real-time risk score updates.
    Clients receive: { type, coin_id, symbol, score, risk_level, timestamp }
    """
    await ws_manager.connect(websocket, topic="risks")
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, topic="risks")
    except Exception as e:
        logger.error(f"Risk WS error: {e}")
        ws_manager.disconnect(websocket, topic="risks")


@router.websocket("/alerts")
async def websocket_alerts(websocket: WebSocket):
    """
    WebSocket endpoint for real-time alert notifications.
    Clients receive: { type, alert_id, coin_id, message, timestamp }
    """
    await ws_manager.connect(websocket, topic="alerts")
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, topic="alerts")
    except Exception as e:
        logger.error(f"Alert WS error: {e}")
        ws_manager.disconnect(websocket, topic="alerts")
