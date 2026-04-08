from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.customer import Customer
from app.repositories.base_repository import BaseRepository


class CustomerRepository(BaseRepository[Customer]):
    """客户 Repository"""

    def search(
        self,
        db: Session,
        search: str = None,
        status: str = None,
        settlement: str = None,
        客户名称: str = None,
        联系人: str = None,
        手机: str = None,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Customer], int]:
        """搜索客户"""
        query = db.query(Customer)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Customer.客户名称.contains(search),
                    Customer.联系人.contains(search),
                    Customer.手机.contains(search)
                )
            )

        if status:
            status_list = status.split(',')
            query = query.filter(Customer.状态.in_(status_list))

        if settlement:
            settlement_list = settlement.split(',')
            query = query.filter(Customer.结算方式.in_(settlement_list))

        if 客户名称:
            query = query.filter(Customer.客户名称.contains(客户名称))

        if 联系人:
            query = query.filter(Customer.联系人.contains(联系人))

        if 手机:
            query = query.filter(Customer.手机.contains(手机))

        total = query.count()
        items = query.order_by(Customer.id.desc()).offset(skip).limit(limit).all()
        return items, total

    def get_all_names(self, db: Session) -> List[str]:
        """获取所有客户名称"""
        results = db.query(Customer.客户名称).filter(
            Customer.客户名称.isnot(None)
        ).distinct().all()
        return [name[0] for name in results if name[0]]

    def get_by_name(self, db: Session, name: str) -> Optional[Customer]:
        """根据客户名称获取客户"""
        return db.query(Customer).filter(Customer.客户名称 == name).first()


customer_repository = CustomerRepository(Customer)