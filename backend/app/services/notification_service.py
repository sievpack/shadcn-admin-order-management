import json
import logging
import redis
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import WebSocket

logger = logging.getLogger(__name__)

REDIS_HOST = 'localhost'
REDIS_PORT = 6379
REDIS_DB = 0
NOTIFICATION_TTL = 30 * 24 * 60 * 60


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


class NotificationService:
    """Redis 通知服务"""
    
    def __init__(self):
        self.redis_client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=REDIS_DB,
            decode_responses=True
        )

    def _get_key(self, user_id: int) -> str:
        return f"notifications:{user_id}"

    def save(self, user_id: int, notification: dict) -> str:
        key = self._get_key(user_id)
        notification['created_at'] = datetime.now().isoformat()
        notification_id = notification.get('id', f"{user_id}:{datetime.now().timestamp()}")
        notification['id'] = notification_id
        
        self.redis_client.zadd(key, {json.dumps(notification): datetime.now().timestamp()})
        self.redis_client.expire(key, NOTIFICATION_TTL)
        return notification_id

    def get_list(self, user_id: int, page: int = 1, page_size: int = 20) -> tuple[List[dict], int]:
        key = self._get_key(user_id)
        start = (page - 1) * page_size
        end = start + page_size - 1
        
        results = self.redis_client.zrevrange(key, start, end)
        notifications = [json.loads(r) for r in results]
        total = self.redis_client.zcard(key)
        
        return notifications, total

    def mark_read(self, user_id: int, notification_id: str) -> bool:
        key = self._get_key(user_id)
        results = self.redis_client.zrange(key, 0, -1)
        for r in results:
            notification = json.loads(r)
            if notification.get('id') == notification_id:
                notification['read'] = True
                score = self.redis_client.zscore(key, r)
                self.redis_client.zrem(key, r)
                self.redis_client.zadd(key, {json.dumps(notification): score})
                return True
        return False

    def mark_all_read(self, user_id: int) -> int:
        key = self._get_key(user_id)
        results = self.redis_client.zrange(key, 0, -1)
        count = 0
        for r in results:
            notification = json.loads(r)
            if not notification.get('read', False):
                notification['read'] = True
                score = self.redis_client.zscore(key, r)
                self.redis_client.zrem(key, r)
                self.redis_client.zadd(key, {json.dumps(notification): score})
                count += 1
        return count

    def get_unread_count(self, user_id: int) -> int:
        key = self._get_key(user_id)
        results = self.redis_client.zrange(key, 0, -1)
        return sum(1 for r in results if not json.loads(r).get('read', False))


notification_service = NotificationService()
