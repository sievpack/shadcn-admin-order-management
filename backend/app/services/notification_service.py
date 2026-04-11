import json
import logging
import os
import redis
from datetime import datetime
from typing import List

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
