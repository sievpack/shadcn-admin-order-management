import logging
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.services.notification_poller import NotificationPoller, poller_manager
from app.services.notification_service import notification_service, manager
from app.models.ship import Ship
from app.models.order import Order, OrderList

logger = logging.getLogger(__name__)


class ShipmentPoller(NotificationPoller):
    """发货记录轮询服务 - 检测新发货并推送通知"""
    
    def __init__(self, interval: int = 10):
        super().__init__(interval)
    
    async def check_and_broadcast(self):
        """检查新发货记录并广播"""
        from app.db.database import get_db_jns
        
        db_gen = get_db_jns()
        db = next(db_gen)
        
        try:
            last_time = self._get_last_check_time()
            
            # 查询自上次检查以来的新发货记录
            new_shipments = db.query(Ship).filter(
                Ship.created_at > last_time
            ).order_by(desc(Ship.created_at)).all()
            
            if not new_shipments:
                return
            
            logger.info(f"检测到 {len(new_shipments)} 条新发货记录")
            
            for ship in new_shipments:
                await self._notify_shipment(db, ship)
                
        except Exception as e:
            logger.error(f"检查发货记录失败: {e}", exc_info=True)
        finally:
            db.close()
    
    async def _notify_shipment(self, db: Session, ship: Ship):
        """为单个发货记录发送通知"""
        # 获取关联的订单分项
        order_items = db.query(Order).filter(
            Order.ship_id == ship.id
        ).all()
        
        if not order_items:
            return
        
        # 构建订单编号列表
        order_nums = [item.订单编号 for item in order_items if item.订单编号]
        
        # 计算总金额
        total_amount = sum(
            float(item.金额 or 0) for item in order_items if item.金额
        )
        
        # 构建订单项目详情
        order_projects = []
        for item in order_items:
            order_projects.append({
                "订单编号": item.订单编号,
                "合同编号": item.合同编号,
                "产品类型": item.产品类型,
                "型号": item.型号,
                "规格": item.规格,
                "数量": item.数量,
                "单位": item.单位,
                "销售单价": float(item.销售单价) if item.销售单价 else 0,
                "金额": float(item.金额) if item.金额 else 0
            })
        
        # 构建通知消息
        ship_time = ship.created_at.strftime('%Y-%m-%d %H:%M') if ship.created_at else datetime.now().strftime('%Y-%m-%d %H:%M')
        notification = {
            "type": "notification",
            "payload": {
                "id": f"ship_{ship.id}_{int(datetime.now().timestamp())}",
                "type": "order_shipped",
                "title": "发货订单",
                "content": f"{ship.发货单号} 于 {ship_time} 创建，共计发送了 ￥{total_amount:.2f}",
                "timestamp": int(datetime.now().timestamp()),
                "detail_id": ship.id,
                "detail_type": "ship",
                "detail": {
                    "发货单号": ship.发货单号,
                    "快递单号": ship.快递单号,
                    "发货日期": ship.发货日期.strftime('%Y-%m-%d %H:%M:%S') if ship.发货日期 else None,
                    "客户名称": ship.客户名称,
                    "发货总金额": total_amount,
                    "订单项目": order_projects
                }
            }
        }
        
        # 推送给所有连接的用户（实际生产中应该只推送给相关用户）
        await manager.broadcast(notification)
        
        logger.info(f"已发送发货通知: {ship.发货单号}")


# 创建并注册轮询服务
shipment_poller = ShipmentPoller(interval=60)
poller_manager.register(shipment_poller)


async def start_pollers():
    """启动所有轮询服务（从 main.py 调用）"""
    await poller_manager.start_all()


async def stop_pollers():
    """停止所有轮询服务"""
    await poller_manager.stop_all()
