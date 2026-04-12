import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class NotificationPoller:
    """后台轮询服务 - 检测数据库变化并推送通知"""
    
    def __init__(self, interval: int = 10):
        """
        Args:
            interval: 轮询间隔（秒）
        """
        self.interval = interval
        self._last_check_time: Optional[datetime] = None
        self._running = False
        self._task: Optional[asyncio.Task] = None
    
    def _get_last_check_time(self) -> datetime:
        """获取上次检查时间，如果未设置则返回当前时间前1小时"""
        if self._last_check_time is None:
            from datetime import timedelta
            return datetime.now() - timedelta(hours=1)
        return self._last_check_time
    
    def _update_last_check_time(self):
        """更新检查时间"""
        self._last_check_time = datetime.now()
    
    async def check_and_broadcast(self):
        """执行一次检查并广播通知（子类实现）"""
        raise NotImplementedError("子类必须实现此方法")
    
    async def _poll_loop(self):
        """轮询循环"""
        while self._running:
            try:
                await self.check_and_broadcast()
                self._update_last_check_time()
            except Exception as e:
                logger.error(f"轮询检查出错: {e}", exc_info=True)
            
            await asyncio.sleep(self.interval)
    
    async def start(self):
        """启动轮询服务"""
        if self._running:
            logger.warning("轮询服务已在运行")
            return
        
        self._running = True
        self._task = asyncio.create_task(self._poll_loop())
        logger.info(f"轮询服务已启动，间隔 {self.interval} 秒")
    
    async def stop(self):
        """停止轮询服务"""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("轮询服务已停止")


class PollerManager:
    """轮询服务管理器 - 管理多个轮询服务"""
    
    def __init__(self):
        self._pollers: List[NotificationPoller] = []
        self._running = False
    
    def register(self, poller: NotificationPoller):
        """注册轮询服务"""
        self._pollers.append(poller)
    
    async def start_all(self):
        """启动所有轮询服务"""
        if self._running:
            logger.warning("轮询服务管理器已在运行")
            return
        
        self._running = True
        tasks = [poller.start() for poller in self._pollers]
        await asyncio.gather(*tasks)
        logger.info(f"已启动 {len(self._pollers)} 个轮询服务")
    
    async def stop_all(self):
        """停止所有轮询服务"""
        self._running = False
        tasks = [poller.stop() for poller in self._pollers]
        await asyncio.gather(*tasks)
        logger.info("已停止所有轮询服务")


# 全局轮询管理器
poller_manager = PollerManager()
