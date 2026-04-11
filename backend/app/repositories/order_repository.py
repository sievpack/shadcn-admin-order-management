from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, func, and_
from datetime import datetime, date

from app.models.order import Order, OrderList
from app.repositories.base_repository import BaseRepository


class OrderRepository(BaseRepository[Order]):
    """订单分项 Repository"""

    def get_by_oid(self, db: Session, oid: int) -> List[Order]:
        """根据订单ID获取所有分项"""
        return db.query(Order).filter(Order.oid == oid).order_by(desc(Order.id)).all()

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
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Order], int]:
        """搜索订单分项"""
        q = db.query(Order)

        if query:
            search_pattern = f"%{query}%"
            q = q.filter(
                or_(
                    Order.订单编号.like(search_pattern),
                    Order.合同编号.like(search_pattern),
                    Order.客户名称.like(search_pattern),
                    Order.规格.like(search_pattern),
                    Order.型号.like(search_pattern)
                )
            )

        if 规格:
            spec_values = [s.strip() for s in 规格.split(',') if s.strip()]
            if spec_values:
                and_conditions = []
                for spec_val in spec_values:
                    part_conditions = [
                        Order.规格 == spec_val,
                        Order.规格.like(f"%/{spec_val}"),
                        Order.规格.like(f"{spec_val}/%"),
                        Order.规格.like(f"%/{spec_val}/%"),
                    ]
                    and_conditions.append(or_(*part_conditions))
                q = q.filter(and_(*and_conditions))

        if 型号:
            q = q.filter(Order.型号.like(f"%{型号}%"))

        if 产品类型:
            type_values = [t.strip() for t in 产品类型.split(',') if t.strip()]
            filters = [Order.产品类型.like(f"{type_val}%") for type_val in type_values]
            if len(filters) == 1:
                q = q.filter(filters[0])
            elif len(filters) > 1:
                q = q.filter(or_(*filters))

        if 发货状态 == 0:
            q = q.filter(Order.ship_id == None)
        elif 发货状态 == 1:
            q = q.filter(Order.ship_id.isnot(None))

        if start_date:
            q = q.join(OrderList, Order.oid == OrderList.id).filter(OrderList.订单日期 >= start_date)
        if end_date:
            q = q.join(OrderList, Order.oid == OrderList.id).filter(OrderList.订单日期 <= end_date)

        total = q.count()
        items = q.order_by(desc(Order.id)).offset(skip).limit(limit).all()
        return items, total


class OrderListRepository(BaseRepository[OrderList]):

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
        q = db.query(Order)

        if query:
            search_pattern = f"%{query}%"
            q = q.filter(
                or_(
                    Order.订单编号.like(search_pattern),
                    Order.合同编号.like(search_pattern),
                    Order.客户名称.like(search_pattern),
                    Order.规格.like(search_pattern),
                    Order.型号.like(search_pattern)
                )
            )

        if 规格:
            spec_values = [s.strip() for s in 规格.split(',') if s.strip()]
            if spec_values:
                and_conditions = []
                for spec_val in spec_values:
                    part_conditions = [
                        Order.规格 == spec_val,
                        Order.规格.like(f"%/{spec_val}"),
                        Order.规格.like(f"{spec_val}/%"),
                        Order.规格.like(f"%/{spec_val}/%"),
                    ]
                    and_conditions.append(or_(*part_conditions))
                q = q.filter(and_(*and_conditions))

        if 型号:
            q = q.filter(Order.型号.like(f"%{型号}%"))

        if 产品类型:
            type_values = [t.strip() for t in 产品类型.split(',') if t.strip()]
            filters = [Order.产品类型.like(f"{type_val}%") for type_val in type_values]
            if len(filters) == 1:
                q = q.filter(filters[0])
            elif len(filters) > 1:
                q = q.filter(or_(*filters))

        if 客户名称:
            q = q.filter(Order.客户名称.like(f"%{客户名称}%"))

        q = q.filter(Order.ship_id == None)

        return q.order_by(desc(Order.id)).all()
    """订单列表 Repository"""

    def search(
        self,
        db: Session,
        query: str = None,
        发货状态: str = None,
        start_date: date = None,
        end_date: date = None,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[OrderList], int]:
        """搜索订单列表"""
        q = db.query(OrderList)

        if query:
            search_pattern = f"%{query}%"
            q = q.filter(
                or_(
                    OrderList.订单编号.like(search_pattern),
                    OrderList.客户名称.like(search_pattern)
                )
            )

        if start_date:
            q = q.filter(OrderList.订单日期 >= start_date)
        if end_date:
            q = q.filter(OrderList.订单日期 <= end_date)

        if 发货状态:
            status_map = {'pending': 0, 'partial': 1, 'shipped': 2}
            status_list = []
            for s in 发货状态.split(','):
                s = s.strip()
                if s in status_map:
                    status_list.append(status_map[s])
            if status_list:
                q = q.filter(OrderList.status.in_(status_list))

        total = q.count()
        items = q.order_by(desc(OrderList.id)).offset(skip).limit(limit).all()
        return items, total

    def get_all(self, db: Session) -> List[OrderList]:
        """获取所有订单列表"""
        return db.query(OrderList).order_by(desc(OrderList.id)).all()

    def update_status_by_oid(self, db: Session, oid: int) -> int:
        """根据订单ID更新订单状态
        
        逻辑：
        - 当 TotalItems = ShippedItems 时，status = 2（全部发货）
        - 当 ShippedItems = 0 时，status = 0（未发货）
        - 否则 status = 1（部分发货）
        """
        total_count = db.query(Order).filter(Order.oid == oid).count()
        shipped_count = db.query(Order).filter(
            Order.oid == oid,
            Order.ship_id.isnot(None)
        ).count()
        
        if total_count == 0:
            new_status = 0
        elif shipped_count == total_count:
            new_status = 2
        elif shipped_count == 0:
            new_status = 0
        else:
            new_status = 1
        
        db.query(OrderList).filter(OrderList.id == oid).update(
            {'status': new_status},
            synchronize_session=False
        )
        return new_status

    def get_with_items(
        self,
        db: Session,
        query: str = None,
        发货状态: int = None,
        start_date: date = None,
        end_date: date = None,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Tuple[Order, OrderList]], int]:
        """获取订单及分项（联合查询）"""
        q = db.query(Order, OrderList).outerjoin(
            OrderList, Order.oid == OrderList.id
        )

        # 发货状态判断：通过发货单号是否为 NULL
        # 0=未发货（发货单号为NULL），1/2=已发货（发货单号不为NULL）
        if 发货状态 == 0:
            q = q.filter(Order.发货单号 == None)
        elif 发货状态 in (1, 2):
            q = q.filter(Order.发货单号.isnot(None))
        # 如果发货状态为 None，不做筛选

        if query:
            search_pattern = f"%{query}%"
            q = q.filter(
                or_(
                    Order.合同编号.like(search_pattern),
                    Order.规格.like(search_pattern),
                    Order.产品类型.like(search_pattern),
                    Order.型号.like(search_pattern),
                    OrderList.客户名称.like(search_pattern)
                )
            )

        if start_date:
            q = q.filter(OrderList.订单日期 >= start_date)
        if end_date:
            q = q.filter(OrderList.订单日期 <= end_date)

        total = q.count()
        results = q.order_by(desc(Order.id)).offset(skip).limit(limit).all()
        return results, total

    def get_shipping_status_map(
        self,
        db: Session,
        order_ids: List[int]
    ) -> dict:
        """批量获取订单的发货状态
        
        用 count 统计总分项数和已发货项数，相减得出未发货数
        Returns:
            dict: {order_id: 'shipped'|'partial'|'pending'}
        """
        if not order_ids:
            return {}
        
        status_map = {}
        
        for order_id in order_ids:
            # count 总分项数
            total_count = db.query(Order).filter(Order.oid == order_id).count()
            # count 已发货分项数 (ship_id 不为 NULL)
            shipped_count = db.query(Order).filter(
                Order.oid == order_id,
                Order.ship_id.isnot(None)
            ).count()
            # 未发货数 = 总分项数 - 已发货分项数
            pending_count = total_count - shipped_count
            
            print(f"[DEBUG] order_id={order_id}, total={total_count}, shipped={shipped_count}, pending={pending_count}")
            
            if total_count == 0:
                status_map[order_id] = 'pending'
            elif pending_count == total_count:
                status_map[order_id] = 'pending'
            elif pending_count == 0:
                status_map[order_id] = 'shipped'
            else:
                status_map[order_id] = 'partial'
        
        return status_map


order_repository = OrderRepository(Order)
order_list_repository = OrderListRepository(OrderList)