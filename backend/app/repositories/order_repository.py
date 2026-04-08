from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, func
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
            q = q.filter(Order.规格.like(f"%{规格}%"))

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

    def get_all_no_pagination(
        self,
        db: Session,
        query: str = None,
        规格: str = None,
        型号: str = None,
        产品类型: str = None
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
            q = q.filter(Order.规格.like(f"%{规格}%"))

        if 型号:
            q = q.filter(Order.型号.like(f"%{型号}%"))

        if 产品类型:
            type_values = [t.strip() for t in 产品类型.split(',') if t.strip()]
            filters = [Order.产品类型.like(f"{type_val}%") for type_val in type_values]
            if len(filters) == 1:
                q = q.filter(filters[0])
            elif len(filters) > 1:
                q = q.filter(or_(*filters))

        return q.order_by(desc(Order.id)).all()


class OrderListRepository(BaseRepository[OrderList]):
    """订单列表 Repository"""

    def search(
        self,
        db: Session,
        query: str = None,
        status: bool = None,
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

        if status is not None:
            q = q.filter(OrderList.status == status)

        if start_date:
            q = q.filter(OrderList.订单日期 >= start_date)
        if end_date:
            q = q.filter(OrderList.订单日期 <= end_date)

        total = q.count()
        items = q.order_by(desc(OrderList.id)).offset(skip).limit(limit).all()
        return items, total

    def get_all(self, db: Session) -> List[OrderList]:
        """获取所有订单列表"""
        return db.query(OrderList).order_by(desc(OrderList.id)).all()

    def get_with_items(
        self,
        db: Session,
        query: str = None,
        发货状态: int = 2,
        start_date: date = None,
        end_date: date = None,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Tuple[Order, OrderList]], int]:
        """获取订单及分项（联合查询）"""
        q = db.query(Order, OrderList).outerjoin(
            OrderList, Order.oid == OrderList.id
        )

        if 发货状态 == 0:
            q = q.filter(Order.ship_id == None)
        elif 发货状态 == 1:
            q = q.filter(Order.ship_id.isnot(None))

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


order_repository = OrderRepository(Order)
order_list_repository = OrderListRepository(OrderList)