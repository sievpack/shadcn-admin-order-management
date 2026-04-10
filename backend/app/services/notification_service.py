import logging
import uuid
from typing import Optional
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """WebSocket 连接管理器"""
    
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """客户端连接"""
        conn_id = str(uuid.uuid4())
        await websocket.accept()
        self.active_connections[f"{user_id}:{conn_id}"] = websocket
        return conn_id
    
    def disconnect(self, conn_id: str):
        """客户端断开"""
        self.active_connections.pop(conn_id, None)
    
    async def send_message(self, conn_id: str, message: dict):
        """向指定连接发送消息"""
        if conn_id in self.active_connections:
            await self.active_connections[conn_id].send_json(message)
        else:
            logger.warning(f"连接 {conn_id} 不在线，消息未送达: {message}")
    
    async def broadcast(self, message: dict):
        """广播消息给所有连接"""
        for connection in self.active_connections.values():
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"发送消息失败: {e}")


notification_manager = ConnectionManager()


def get_notification_manager() -> ConnectionManager:
    return notification_manager
