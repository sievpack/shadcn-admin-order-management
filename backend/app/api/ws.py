from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.services.notification_service import get_notification_manager
from app.core.config import settings
from app.models.user import User
from app.db.database import get_db_jns
from jose import jwt, JWTError
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


def get_user_id_from_username(username: str) -> int:
    """根据用户名获取 user_id"""
    db_gen = get_db_jns()
    db = next(db_gen)
    try:
        user = db.query(User).filter(User.username == username).first()
        return user.id if user else 0
    finally:
        db.close()


@router.websocket("/notifications")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    """WebSocket 通知端点"""
    manager = get_notification_manager()
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if not username:
            await websocket.close(code=4001)
            return
        
        # 根据用户名获取 user_id
        user_id = get_user_id_from_username(username)
        logger.debug(f"WS DEBUG 2: user_id={user_id}, username={username}")
        if not user_id:
            logger.warning("WS DEBUG: user_id is 0, closing")
            await websocket.close(code=4001)
            return
    except JWTError as e:
        logger.error(f"JWT error: {e}")
        await websocket.close(code=4001)
        return
    
    logger.debug(f"WS DEBUG: user_id={user_id}, username={username}")
    await manager.connect(websocket, str(user_id))
    logger.debug(f"WS DEBUG: connect done, active={manager.active_connections}")
    
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected user_id: {user_id}")
        manager.disconnect(websocket, str(user_id))
