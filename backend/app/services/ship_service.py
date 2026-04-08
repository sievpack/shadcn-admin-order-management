from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.ship import Ship
from app.models.order import Order
from app.repositories.ship_repository import ship_repository
from app.services.base_service import BaseService


class ShipService(BaseService[Ship]):
    """发货 Service"""

    def __init__(self):
        super().__init__(ship_repository)

    def search(
        self,
        db: Session,
        query: str = None,
        发货单号: str = None,
        客户名称: str = None,
        快递单号: str = None,
        快递公司: str = None,
        开始日期: str = None,
        结束日期: str = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Ship], int]:
        """搜索发货记录"""
        skip = (page - 1) * page_size
        return self.repository.search(
            db, query, 发货单号, 客户名称, 快递单号, 快递公司,
            开始日期, 结束日期, skip, page_size
        )

    def get_by_express_number(self, db: Session, 快递单号: str) -> Optional[Ship]:
        """根据快递单号获取发货记录"""
        return self.repository.get_by_express_number(db, 快递单号)

    def create_shipping(
        self,
        db: Session,
        发货单号: str,
        快递单号: str,
        订单项目: List[dict],
        快递公司: str = None,
        客户名称: str = None,
        发货日期: datetime = None,
        快递费用: float = 0,
        备注: str = None
    ) -> Tuple[Optional[Ship], Optional[str]]:
        """创建发货单"""
        if not 发货单号 or not 快递单号 or not 订单项目:
            return None, "缺少必填字段"

        ship = self.repository.create(db, {
            "发货单号": 发货单号,
            "快递单号": 快递单号,
            "快递公司": 快递公司,
            "客户名称": 客户名称,
            "发货日期": 发货日期 or datetime.now(),
            "快递费用": 快递费用,
            "备注": 备注
        })

        for item in 订单项目:
            order_id = item.get("id")
            if order_id:
                db.query(Order).filter(Order.id == order_id).update({
                    '发货单号': 发货单号,
                    '快递单号': 快递单号,
                    'ship_id': ship.id
                })

        return ship, None

    def delete_shipping(self, db: Session, 发货单号: str, 快递单号: str) -> Tuple[int, Optional[str]]:
        """删除发货单"""
        updated = db.query(Order).filter(Order.发货单号 == 发货单号).update({
            '发货单号': None,
            '快递单号': None,
            'ship_id': None
        })

        express_exists = db.query(Order).filter(Order.快递单号 == 快递单号).first()
        if not express_exists:
            self.repository.delete_by(db, {"快递单号": 快递单号})

        return updated, None

    def delete_shipping_item(self, db: Session, order_id: int) -> Tuple[int, Optional[str]]:
        """删除单个发货项目"""
        updated = db.query(Order).filter(Order.id == order_id).update({
            '发货单号': None,
            '快递单号': None,
            'ship_id': None
        })
        return updated, None

    def get_shipping_detail(self, db: Session, 发货单号: str) -> Tuple[Optional[dict], Optional[str]]:
        """获取发货单详情"""
        from app.models.order import OrderList

        results = db.query(Order, OrderList, Ship).outerjoin(
            OrderList, Order.oid == OrderList.id
        ).outerjoin(
            Ship, Order.ship_id == Ship.id
        ).filter(
            Order.发货单号 == 发货单号
        ).order_by(Order.id).all()

        if not results:
            return None, "未找到该发货单号的记录"

        first_order, first_order_list, first_ship = results[0]
        shipping_info = {
            "发货单号": 发货单号,
            "快递单号": first_order.快递单号,
            "快递公司": first_ship.快递公司 if first_ship else None,
            "客户名称": first_order_list.客户名称 if first_order_list else None,
            "发货日期": first_ship.发货日期.strftime('%Y-%m-%d') if first_ship and first_ship.发货日期 else None,
            "快递费用": first_ship.快递费用 if first_ship else None,
            "备注": first_ship.备注 if first_ship else None
        }

        order_items = []
        total_amount = 0
        for order, order_list, _ in results:
            item_amount = float(order.金额) if order.金额 else 0
            total_amount += item_amount
            order_items.append({
                "id": order.id,
                "订单编号": order_list.订单编号 if order_list else None,
                "规格": order.规格,
                "产品类型": order.产品类型,
                "型号": order.型号,
                "数量": order.数量,
                "单位": order.单位,
                "销售单价": float(order.销售单价) if order.销售单价 else 0,
                "金额": item_amount,
                "合同编号": order.合同编号,
                "备注": order.备注
            })

        shipping_info["总金额"] = total_amount
        shipping_info["订单项目"] = order_items
        return shipping_info, None


ship_service = ShipService()