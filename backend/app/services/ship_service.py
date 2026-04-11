import logging
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.ship import Ship
from app.models.order import Order
from app.repositories.ship_repository import ship_repository
from app.services.base_service import BaseService

logger = logging.getLogger(__name__)


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
        if not 发货单号 or not 快递单号:
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

        db.commit()
        return ship, None

    def delete_shipping(self, db: Session, 发货单号: str, 快递单号: str) -> Tuple[int, Optional[str]]:
        """删除发货单"""
        updated = db.query(Order).filter(Order.发货单号 == 发货单号).update({
            '发货单号': None,
            '快递单号': None,
            'ship_id': None
        })

        db.query(Ship).filter(Ship.快递单号 == 快递单号).delete()
        db.commit()

        return updated, None

    def delete_shipping_item(self, db: Session, order_id: int) -> Tuple[int, Optional[str]]:
        """删除单个发货项目"""
        updated = db.query(Order).filter(Order.id == order_id).update({
            '发货单号': None,
            '快递单号': None,
            'ship_id': None
        })
        db.commit()
        return updated, None

    def add_shipping_items(
        self,
        db: Session,
        发货单号: str,
        快递单号: str,
        订单项目: List[dict]
    ) -> Tuple[int, Optional[str]]:
        """为已存在的发货单添加分项"""
        if not 订单项目:
            return 0, "没有要添加的分项"

        ship = db.query(Ship).filter(Ship.快递单号 == 快递单号).first()
        if not ship:
            return 0, "未找到发货单"

        updated_count = 0
        errors = []

        for item in 订单项目:
            order_id = item.get("id")
            发货数量 = item.get("数量")

            if not order_id:
                continue

            order = db.query(Order).filter(Order.id == order_id).first()
            if not order:
                errors.append(f"订单 {order_id} 不存在")
                continue

            if order.发货单号:
                errors.append(f"订单 {order_id} 已发货")
                continue

            if 发货数量 > order.数量:
                errors.append(f"订单 {order_id} 的发货数量 {发货数量} 大于订单数量 {order.数量}")
                continue

            if 发货数量 < order.数量:
                remaining = order.数量 - 发货数量
                new_order = Order(
                    oid=order.oid,
                    订单编号=order.订单编号,
                    合同编号=order.合同编号,
                    订单日期=order.订单日期,
                    交货日期=order.交货日期,
                    规格=order.规格,
                    产品类型=order.产品类型,
                    型号=order.型号,
                    数量=remaining,
                    单位=order.单位,
                    销售单价=order.销售单价,
                    客户名称=order.客户名称,
                    结算方式=order.结算方式,
                    客户物料编号=order.客户物料编号,
                    外购=order.外购,
                )
                db.add(new_order)

                order.数量 = 发货数量

            order.发货单号 = 发货单号
            order.快递单号 = 快递单号
            order.ship_id = ship.id
            updated_count += 1

        if errors:
            return updated_count, "; ".join(errors)

        db.commit()
        return updated_count, None

    def get_shipping_detail(self, db: Session, 发货单号: str) -> Tuple[Optional[dict], Optional[str]]:
        """获取发货单详情"""
        from app.models.order import OrderList
        from app.models.customer import Customer

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
        customer_name = first_order_list.客户名称 if first_order_list else None
        
        customer = None
        if customer_name:
            customer = db.query(Customer).filter(Customer.客户名称 == customer_name).first()
        
        shipping_info = {
            "发货单号": 发货单号,
            "快递单号": first_order.快递单号,
            "快递公司": first_ship.快递公司 if first_ship else None,
            "客户名称": customer_name,
            "送货地址": customer.收货地址 if customer else None,
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
                "客户物料编号": order.客户物料编号,
                "备注": order.备注
            })

        shipping_info["总金额"] = total_amount
        shipping_info["订单项目"] = order_items
        return shipping_info, None

    def update_shipping_date(
        self,
        db: Session,
        发货单号: str,
        发货日期: str
    ) -> Tuple[bool, Optional[str]]:
        """更新发货日期"""
        from datetime import datetime

        ship = db.query(Ship).filter(Ship.发货单号 == 发货单号).first()
        if not ship:
            return False, "未找到发货单"

        try:
            ship.发货日期 = datetime.strptime(发货日期, '%Y-%m-%d')
        except ValueError:
            return False, "日期格式错误"

        db.commit()
        return True, None

    def update_shipping(
        self,
        db: Session,
        发货单号: str,
        快递单号: str,
        快递公司: str = None,
        发货日期: str = None,
        快递费用: float = 0,
        备注: str = None
    ) -> Tuple[bool, Optional[str]]:
        """更新发货单"""
        from datetime import datetime

        ship = db.query(Ship).filter(Ship.发货单号 == 发货单号).first()
        if not ship:
            return False, "未找到发货单"

        if 快递单号:
            ship.快递单号 = 快递单号
        if 快递公司 is not None:
            ship.快递公司 = 快递公司
        if 发货日期:
            try:
                ship.发货日期 = datetime.strptime(发货日期, '%Y-%m-%d')
            except ValueError:
                return False, "日期格式错误"
        if 快递费用 is not None:
            ship.快递费用 = 快递费用
        if 备注 is not None:
            ship.备注 = 备注

        db.commit()
        return True, None


ship_service = ShipService()