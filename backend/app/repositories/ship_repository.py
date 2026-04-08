from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.ship import Ship
from app.repositories.base_repository import BaseRepository


class ShipRepository(BaseRepository[Ship]):
    """发货 Repository"""

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
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Ship], int]:
        """搜索发货记录"""
        q = db.query(Ship)

        if query:
            q = q.filter(
                or_(
                    Ship.发货单号.contains(query),
                    Ship.客户名称.contains(query),
                    Ship.快递单号.contains(query),
                    Ship.快递公司.contains(query)
                )
            )

        if 发货单号:
            q = q.filter(Ship.发货单号.contains(发货单号))
        if 客户名称:
            q = q.filter(Ship.客户名称.contains(客户名称))
        if 快递单号:
            q = q.filter(Ship.快递单号.contains(快递单号))
        if 快递公司:
            q = q.filter(Ship.快递公司.contains(快递公司))
        if 开始日期:
            q = q.filter(Ship.发货日期 >= 开始日期)
        if 结束日期:
            q = q.filter(Ship.发货日期 <= 结束日期)

        total = q.count()
        items = q.order_by(Ship.id.desc()).offset(skip).limit(limit).all()
        return items, total

    def get_by_express_number(self, db: Session, 快递单号: str) -> Optional[Ship]:
        """根据快递单号获取发货记录"""
        return db.query(Ship).filter(Ship.快递单号 == 快递单号).first()

    def get_by_ship_number(self, db: Session, 发货单号: str) -> List[Ship]:
        """根据发货单号获取发货记录"""
        return db.query(Ship).filter(Ship.发货单号 == 发货单号).all()


ship_repository = ShipRepository(Ship)