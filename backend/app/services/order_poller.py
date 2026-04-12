import logging
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.services.notification_poller import NotificationPoller, poller_manager
from app.services.notification_service import notification_service, manager
from app.models.order import Order, OrderList

logger = logging.getLogger(__name__)


class OrderPoller(NotificationPoller):
    """订单轮询服务 - 检测新订单并推送通知"""
    
    def __init__(self, interval: int = 10):
        super().__init__(interval)
    
    async def check_and_broadcast(self):
        """检查新订单记录并广播"""
        from app.db.database import get_db_jns
        
        db_gen = get_db_jns()
        db = next(db_gen)
        
        try:
            last_time = self._get_last_check_time()
            
            # 查询自上次检查以来的新订单列表
            new_order_lists = db.query(OrderList).filter(
                OrderList.created_at > last_time
            ).order_by(desc(OrderList.created_at)).all()
            
            if not new_order_lists:
                return
            
            logger.info(f"检测到 {len(new_order_lists)} 条新订单")
            
            for order_list in new_order_lists:
                await self._notify_order(db, order_list)
                
        except Exception as e:
            logger.error(f"检查订单记录失败: {e}", exc_info=True)
        finally:
            db.close()
    
    async def _notify_order(self, db: Session, order_list: OrderList):
        """为单个订单发送通知"""
        # 获取该订单列表下的所有分项
        order_items = db.query(Order).filter(
            Order.oid == order_list.id
        ).all()
        
        if not order_items:
            return
        
        # 计算订单总金额
        total_amount = sum(float(item.金额) for item in order_items if item.金额)
        
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
                "金额": float(item.金额) if item.金额 else 0,
                "客户名称": item.客户名称,
            })
        
        # 构建通知消息
        order_time = order_list.created_at.strftime('%Y-%m-%d %H:%M') if order_list.created_at else datetime.now().strftime('%Y-%m-%d %H:%M')
        notification = {
            "type": "notification",
            "payload": {
                "id": f"order_{order_list.id}_{int(datetime.now().timestamp())}",
                "type": "order_created",
                "title": "新增订单",
                "content": f"{order_list.订单编号} 于 {order_time} 创建，共计 ￥{total_amount:.2f}",
                "timestamp": int(datetime.now().timestamp()),
                "detail_id": order_list.id,
                "detail_type": "order",
                "detail": {
                    "订单编号": order_list.订单编号,
                    "客户名称": order_list.客户名称,
                    "订单总金额": total_amount,
                    "订单日期": order_list.订单日期.strftime('%Y-%m-%d') if order_list.订单日期 else None,
                    "交货日期": order_list.交货日期.strftime('%Y-%m-%d') if order_list.交货日期 else None,
                    "订单项目": order_projects
                }
            }
        }
        
        # 推送给所有连接的用户
        await manager.broadcast(notification)
        
        logger.info(f"已发送订单通知: {order_list.订单编号}")


# 创建并注册轮询服务
order_poller = OrderPoller(interval=60)
poller_manager.register(order_poller)
