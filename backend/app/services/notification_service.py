import json
import logging
import os
import redis
from datetime import datetime
from typing import List
from fastapi import WebSocket

logger = logging.getLogger(__name__)

REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_DB = int(os.getenv('REDIS_DB', 0))
NOTIFICATION_TTL = 30 * 24 * 60 * 60

MARK_READ_SCRIPT = """
local key = KEYS[1]
local target_id = ARGV[1]
local items = redis.call('ZRANGE', key, 0, -1)
for i, r in ipairs(items) do
    local notification = cjson.decode(r)
    if notification.id == target_id then
        notification.read = true
        local score = redis.call('ZSCORE', key, r)
        redis.call('ZREM', key, r)
        redis.call('ZADD', key, score, cjson.encode(notification))
        return 1
    end
end
return 0
"""

MARK_ALL_READ_SCRIPT = """
local key = KEYS[1]
local items = redis.call('ZRANGE', key, 0, -1)
local count = 0
for i, r in ipairs(items) do
    local notification = cjson.decode(r)
    if notification.read ~= true then
        notification.read = true
        local score = redis.call('ZSCORE', key, r)
        redis.call('ZREM', key, r)
        redis.call('ZADD', key, score, cjson.encode(notification))
        count = count + 1
    end
end
return count
"""

COUNT_UNREAD_SCRIPT = """
local key = KEYS[1]
local items = redis.call('ZRANGE', key, 0, -1)
local count = 0
for i, r in ipairs(items) do
    local notification = cjson.decode(r)
    if notification.read ~= true then
        count = count + 1
    end
end
return count
"""


class NotificationService:
    """Redis 通知服务"""

    def __init__(self):
        self.redis_client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            db=REDIS_DB,
            decode_responses=True
        )
        self._mark_read_script = self.redis_client.register_script(MARK_READ_SCRIPT)
        self._mark_all_read_script = self.redis_client.register_script(MARK_ALL_READ_SCRIPT)
        self._count_unread_script = self.redis_client.register_script(COUNT_UNREAD_SCRIPT)

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
        """标记单条已读（原子操作）"""
        key = self._get_key(user_id)
        result = self._mark_read_script(keys=[key], args=[notification_id])
        return result == 1

    def mark_all_read(self, user_id: int) -> int:
        """标记全部已读（原子操作）"""
        key = self._get_key(user_id)
        result = self._mark_all_read_script(keys=[key])
        return result

    def get_unread_count(self, user_id: int) -> int:
        """获取未读数量（高效）"""
        key = self._get_key(user_id)
        result = self._count_unread_script(keys=[key])
        return result


notification_service = NotificationService()


class ConnectionManager:
    """WebSocket 连接管理器"""

    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            try:
                self.active_connections[user_id].remove(websocket)
            except ValueError:
                pass

    async def broadcast(self, message: dict):
        """广播消息给所有用户"""
        payload = message.get('payload', {})
        user_id = payload.get('user_id')
        msg_type = payload.get('type')

        if user_id and msg_type:
            try:
                notification_service.save(int(user_id), payload)
            except (ValueError, TypeError) as e:
                logger.warning(f"Invalid user_id for notification: {user_id}, error: {e}")

        for uid, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.warning(f"Failed to send WebSocket message: {e}")


manager = ConnectionManager()
get_notification_manager = lambda: manager
