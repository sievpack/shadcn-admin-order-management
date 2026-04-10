from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.services.notification_service import get_notification_manager
from app.core.config import settings
from jose import jwt, JWTError
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/notifications")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    """WebSocket 通知端点"""
    manager = get_notification_manager()
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001)
            return
    except JWTError:
        await websocket.close(code=4001)
        return
    
    conn_id = await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(conn_id)
