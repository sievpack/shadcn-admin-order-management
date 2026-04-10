import asyncio
import logging
import time
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date

logger = logging.getLogger(__name__)

from app.models.order import Order, OrderList
from app.repositories.order_repository import order_repository, order_list_repository
from app.services.base_service import BaseService


class Snowflake:
    """雪花算法实现"""
    def __init__(self, worker_id=0, datacenter_id=0):
        self.worker_id = worker_id
        self.datacenter_id = datacenter_id
        self.sequence = 0
        self.timestamp = 0
        self.epoch = 1577808000000
        self.worker_id_bits = 5
        self.datacenter_id_bits = 5
        self.sequence_bits = 12
        self.max_worker_id = -1 ^ (-1 << self.worker_id_bits)
        self.max_datacenter_id = -1 ^ (-1 << self.datacenter_id_bits)
        self.max_sequence = -1 ^ (-1 << self.sequence_bits)
        self.worker_id_shift = self.sequence_bits
        self.datacenter_id_shift = self.sequence_bits + self.worker_id_bits
        self.timestamp_shift = self.sequence_bits + self.worker_id_bits + self.datacenter_id_bits
    
    def generate(self):
        """生成雪花ID"""
        current_timestamp = int(time.time() * 1000)
        if current_timestamp < self.timestamp:
            raise Exception("Clock moved backwards")
        if current_timestamp == self.timestamp:
            self.sequence = (self.sequence + 1) & self.max_sequence
            if self.sequence == 0:
                while int(time.time() * 1000) <= current_timestamp:
                    pass
                current_timestamp = int(time.time() * 1000)
        else:
            self.sequence = 0
        self.timestamp = current_timestamp
        snowflake_id = ((current_timestamp - self.epoch) << self.timestamp_shift) | \
                      (self.datacenter_id << self.datacenter_id_shift) | \
                      (self.worker_id << self.worker_id_shift) | \
                      self.sequence
        return snowflake_id


snowflake = Snowflake()


def generate_order_number() -> str:
    """生成订单编号"""
    date_str = datetime.now().strftime('%Y%m%d')
    snowflake_id = snowflake.generate()
    random_part = str(snowflake_id)[-6:].zfill(6)
    return f"DH-{date_str}-{random_part}"


class OrderService(BaseService[Order]):
    """订单分项 Service"""

    def __init__(self):
        super().__init__(order_repository)

    def get_by_oid(self, db: Session, oid: int) -> List[Order]:
        """获取订单的所有分项"""
        return self.repository.get_by_oid(db, oid)

    def search(
        self,
        db: Session,
        query: str = None,
        规格: str = None,
        型号: str = None,
        产品类型: str = None,
        发货状态: int = 2,
        start_date: date = None,
        end_date: date = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Order], int]:
        """搜索订单分项"""
        skip = (page - 1) * page_size
        return self.repository.search(
            db, query, 规格, 型号, 产品类型, 发货状态,
            start_date, end_date, skip, page_size
        )

    def get_all_no_pagination(
        self,
        db: Session,
        query: str = None,
        规格: str = None,
        型号: str = None,
        产品类型: str = None,
        客户名称: str = None
    ) -> List[Order]:
        """获取所有订单分项（不分页）"""
        return self.repository.get_all_no_pagination(db, query, 规格, 型号, 产品类型, 客户名称)

    def create_order_item(self, db: Session, data: dict) -> Tuple[Optional[Order], Optional[str]]:
        """创建订单分项"""
        required_fields = ['oid', '订单编号', '合同编号', '订单日期', '交货日期', 
                          '规格', '产品类型', '型号', '数量', '单位', '销售单价', 
                          '客户名称', '外购']
        missing_fields = [f for f in required_fields 
                         if not data.get(f) and data.get(f) != 0]
        
        if missing_fields:
            return None, f"缺少必填字段: {', '.join(missing_fields)}"

        order_date = data.get('订单日期')
        delivery_date = data.get('交货日期')
        
        if isinstance(order_date, str):
            order_date = datetime.strptime(order_date, '%Y-%m-%d').date()
        if isinstance(delivery_date, str):
            delivery_date = datetime.strptime(delivery_date, '%Y-%m-%d').date()

        insert_data = {
            "oid": data.get("oid"),
            "订单编号": data.get("订单编号"),
            "合同编号": data.get("合同编号"),
            "订单日期": order_date or datetime.now().date(),
            "交货日期": delivery_date or datetime.now().date(),
            "规格": data.get("规格"),
            "产品类型": data.get("产品类型"),
            "型号": data.get("型号"),
            "数量": int(data.get("数量")) if data.get("数量") else 0,
            "单位": data.get("单位"),
            "销售单价": float(data.get("销售单价")) if data.get("销售单价") else 0.0,
            "备注": data.get("备注"),
            "客户名称": data.get("客户名称"),
            "结算方式": data.get("结算方式"),
            "发货单号": data.get("发货单号"),
            "快递单号": data.get("快递单号"),
            "客户物料编号": data.get("客户物料编号"),
            "外购": bool(data.get("外购", False))
        }

        order = self.repository.create(db, insert_data)
        return order, None


class OrderListService(BaseService[OrderList]):
    """订单列表 Service"""

    def __init__(self):
        super().__init__(order_list_repository)

    def search(
        self,
        db: Session,
        query: str = None,
        发货状态: str = None,
        start_date: date = None,
        end_date: date = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[OrderList], int]:
        """搜索订单列表"""
        skip = (page - 1) * page_size
        return self.repository.search(db, query, 发货状态, start_date, end_date, skip, page_size)

    def get_all(self, db: Session) -> List[OrderList]:
        """获取所有订单列表"""
        return self.repository.get_all(db)

    def get_shipping_status_map(self, db: Session, order_ids: List[int]) -> dict:
        """批量获取订单的发货状态"""
        return self.repository.get_shipping_status_map(db, order_ids)

    def get_with_items(
        self,
        db: Session,
        query: str = None,
        发货状态: int = 2,
        start_date: date = None,
        end_date: date = None,
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[Tuple[Order, OrderList]], int]:
        """获取订单及分项"""
        skip = (page - 1) * limit
        return self.repository.get_with_items(
            db, query, 发货状态, start_date, end_date, skip, limit
        )

    def create(self, db: Session, data: dict) -> Tuple[Optional[OrderList], Optional[str]]:
        """创建订单"""
        order_date = data.get('order_date') or data.get('订单日期')
        delivery_date = data.get('delivery_date') or data.get('交货日期')
        order_number = data.get('order_number') or data.get('订单编号')

        if order_date and isinstance(order_date, str):
            order_date = datetime.strptime(order_date, '%Y-%m-%d')
        else:
            order_date = datetime.now()

        if delivery_date and isinstance(delivery_date, str):
            delivery_date = datetime.strptime(delivery_date, '%Y-%m-%d')
        else:
            delivery_date = datetime.now()

        order_list = self.repository.create(db, {
            "订单编号": order_number or generate_order_number(),
            "客户名称": data.get('customer_name') or data.get('客户名称'),
            "订单日期": order_date,
            "交货日期": delivery_date,
            "status": data.get('status', False)
        })
        return order_list, None

    def update_order(self, db: Session, order_id: int, data: dict) -> Tuple[Optional[OrderList], Optional[str]]:
        """更新订单"""
        order = self.get(db, order_id)
        if not order:
            return None, "订单不存在"

        update_data = {}
        if 'order_number' in data:
            update_data['订单编号'] = data['order_number']
        if 'customer_name' in data:
            update_data['客户名称'] = data['customer_name']
        if 'order_date' in data:
            update_data['订单日期'] = datetime.strptime(data['order_date'], '%Y-%m-%d')
        if 'delivery_date' in data:
            update_data['交货日期'] = datetime.strptime(data['delivery_date'], '%Y-%m-%d')
        if 'status' in data:
            update_data['status'] = data['status']

        if update_data:
            self.repository.update(db, order, update_data)
        return order, None

    def mark_shipped(
        self, 
        db: Session, 
        order_ids: List[int], 
        发货单号: str, 
        快递单号: str, 
        快递公司: str = ''
    ) -> Tuple[int, Optional[str], Optional[dict]]:
        """标记发货"""
        from app.models.ship import Ship

        if not order_ids:
            return 0, "请指定要标记发货的订单ID", None
        if not 发货单号 or not 快递单号:
            return 0, "发货单号和快递单号不能为空", None

        orders = db.query(Order).filter(Order.id.in_(order_ids)).all()
        if not orders:
            return 0, "未找到要标记发货的订单", None
        
        客户名称 = orders[0].客户名称 if orders else ''

        ship_record = Ship(
            发货日期=datetime.now(),
            发货单号=发货单号,
            快递单号=快递单号,
            快递公司=快递公司,
            客户名称=客户名称
        )
        db.add(ship_record)
        db.flush()

        update_data = {
            'ship_id': ship_record.id,
            '发货单号': 发货单号,
            '快递单号': 快递单号
        }
        
        updated = db.query(Order).filter(Order.id.in_(order_ids)).update(
            update_data, 
            synchronize_session=False
        )

        notification_msg = None
        if updated > 0:
            order_nums = [o.订单编号 for o in orders if o.订单编号]
            if order_nums:
                notification_msg = {
                    "type": "notification",
                    "payload": {
                        "type": "order",
                        "title": "订单已发货",
                        "content": f"订单 {', '.join(order_nums)} 已发货，快递: {快递单号}",
                        "timestamp": int(datetime.now().timestamp())
                    }
                }

        return updated, None, notification_msg


class OrderStatsService:
    """订单统计 Service"""

    @staticmethod
    def get_sales_stats(db: Session) -> dict:
        """获取销售统计数据"""
        today = datetime.now().date()
        yesterday = today - __import__('datetime').timedelta(days=1)
        target_month = today.month
        target_year = today.year

        if target_month == 1:
            last_month = 12
            last_month_year = target_year - 1
        else:
            last_month = target_month - 1
            last_month_year = target_year

        last_month_days = __import__('calendar').monthrange(last_month_year, last_month)[1]
        last_month_end_day = min(today.day, last_month_days)
        last_month_start = date(last_month_year, last_month, 1)
        last_month_end = date(last_month_year, last_month, last_month_end_day)

        this_month_start = date(target_year, target_month, 1)
        year_start = date(target_year, 1, 1)

        def get_shipped_amount(start: date, end: date, 外购: int = 0) -> float:
            from app.models.ship import Ship
            result = db.query(func.sum(Order.金额)).join(
                Ship, Order.ship_id == Ship.id
            ).filter(
                Ship.发货日期 >= start,
                Ship.发货日期 <= end,
                Order.外购 == 外购
            ).scalar() or 0
            return round(float(result), 2)

        def get_order_amount(start: date, end: date, 外购: int = 0) -> float:
            result = db.query(func.sum(Order.金额)).join(
                OrderList, Order.oid == OrderList.id
            ).filter(
                OrderList.订单日期 >= start,
                OrderList.订单日期 <= end,
                Order.外购 == 外购
            ).scalar() or 0
            return round(float(result), 2)

        return {
            "today_order_amount": get_order_amount(today, today),
            "yesterday_order_amount": get_order_amount(yesterday, yesterday),
            "today_shipped_amount": get_shipped_amount(today, today),
            "yesterday_shipped_amount": get_shipped_amount(yesterday, yesterday),
            "this_month_order_amount": get_order_amount(this_month_start, today),
            "last_month_order_amount": get_order_amount(last_month_start, last_month_end),
            "this_month_shipped_amount": get_shipped_amount(this_month_start, today),
            "last_month_shipped_amount": get_shipped_amount(last_month_start, last_month_end),
            "this_month_outsource_order_amount": get_order_amount(this_month_start, today, 外购=1),
            "last_month_outsource_order_amount": get_order_amount(last_month_start, last_month_end, 外购=1),
            "this_month_outsource_shipped_amount": get_shipped_amount(this_month_start, today, 外购=1),
            "last_month_outsource_shipped_amount": get_shipped_amount(last_month_start, last_month_end, 外购=1),
            "year_order_amount": get_order_amount(year_start, today),
            "year_shipped_amount": get_shipped_amount(year_start, today),
            "unshipped_amount": round(float(
                db.query(func.sum(Order.金额)).filter(
                    Order.ship_id == None,
                    Order.外购 == 0
                ).scalar() or 0
            ), 2)
        }

    @staticmethod
    def get_recent_orders(db: Session, limit: int = 5) -> List[dict]:
        """获取最近的订单"""
        recent_orders = db.query(
            OrderList.id,
            OrderList.客户名称,
            OrderList.订单日期,
            func.sum(Order.金额).label('total_amount')
        ).join(
            Order, Order.oid == OrderList.id
        ).group_by(
            OrderList.id,
            OrderList.客户名称,
            OrderList.订单日期
        ).order_by(
            __import__('sqlalchemy').desc(OrderList.id)
        ).limit(limit).all()

        orders_data = []
        for order in recent_orders:
            latest_order_item = db.query(Order.合同编号).filter(
                Order.oid == order.id
            ).order_by(
                __import__('sqlalchemy').desc(Order.id)
            ).first()

            orders_data.append({
                "客户名称": order.客户名称,
                "合同编号": latest_order_item.合同编号 if latest_order_item else "",
                "订单金额": round(float(order.total_amount), 2) if order.total_amount else 0
            })

        return orders_data

    @staticmethod
    def get_sales_trend(db: Session, period: str = "week") -> List[dict]:
        """获取销售趋势"""
        from app.models.ship import Ship
        
        sales_trend = []
        now = datetime.now()

        if period == "year":
            for i in range(11, -1, -1):
                year = now.year
                month_num = now.month - i
                while month_num <= 0:
                    month_num += 12
                    year -= 1
                while month_num > 12:
                    month_num -= 12
                    year += 1

                month_start = datetime(year, month_num, 1)
                if month_num == 12:
                    month_end = datetime(year + 1, 1, 1)
                else:
                    month_end = datetime(year, month_num + 1, 1)

                if month_start.year == now.year and month_start.month == now.month:
                    month_end = now

                month_order = db.query(func.sum(Order.金额)).join(
                    OrderList, Order.oid == OrderList.id
                ).filter(
                    OrderList.订单日期 >= month_start,
                    OrderList.订单日期 < month_end,
                    Order.外购 == 0
                ).scalar() or 0

                month_ship = db.query(func.sum(Order.金额)).join(
                    Ship, Order.ship_id == Ship.id
                ).filter(
                    Ship.发货日期 >= month_start,
                    Ship.发货日期 < month_end,
                    Order.外购 == 0
                ).scalar() or 0

                sales_trend.append({
                    "date": month_start.strftime('%Y-%m'),
                    "order_value": round(float(month_order), 2),
                    "ship_value": round(float(month_ship), 2)
                })
        elif period == "month":
            for i in range(29, -1, -1):
                day = now - __import__('datetime').timedelta(days=i)
                day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
                day_end = day_start + __import__('datetime').timedelta(days=1)

                day_order = db.query(func.sum(Order.金额)).join(
                    OrderList, Order.oid == OrderList.id
                ).filter(
                    OrderList.订单日期 >= day_start,
                    OrderList.订单日期 < day_end,
                    Order.外购 == 0
                ).scalar() or 0

                day_ship = db.query(func.sum(Order.金额)).join(
                    Ship, Order.ship_id == Ship.id
                ).filter(
                    Ship.发货日期 >= day_start,
                    Ship.发货日期 < day_end,
                    Order.外购 == 0
                ).scalar() or 0

                sales_trend.append({
                    "date": day.strftime('%m-%d'),
                    "order_value": round(float(day_order), 2),
                    "ship_value": round(float(day_ship), 2)
                })
        else:
            for i in range(6, -1, -1):
                day = now - __import__('datetime').timedelta(days=i)
                day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
                day_end = day_start + __import__('datetime').timedelta(days=1)

                day_order = db.query(func.sum(Order.金额)).join(
                    OrderList, Order.oid == OrderList.id
                ).filter(
                    OrderList.订单日期 >= day_start,
                    OrderList.订单日期 < day_end,
                    Order.外购 == 0
                ).scalar() or 0

                day_ship = db.query(func.sum(Order.金额)).join(
                    Ship, Order.ship_id == Ship.id
                ).filter(
                    Ship.发货日期 >= day_start,
                    Ship.发货日期 < day_end,
                    Order.外购 == 0
                ).scalar() or 0

                sales_trend.append({
                    "date": day.strftime('%m-%d'),
                    "order_value": round(float(day_order), 2),
                    "ship_value": round(float(day_ship), 2)
                })

        return sales_trend


order_service = OrderService()
order_list_service = OrderListService()
order_stats_service = OrderStatsService()