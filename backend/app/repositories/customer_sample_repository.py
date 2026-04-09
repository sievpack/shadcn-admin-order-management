from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from typing import List, Optional, Tuple
from app.repositories.base_repository import BaseRepository


class CustomerSampleRepository(BaseRepository):
    def __init__(self):
        super().__init__(None)

    def search(
        self,
        db: Session,
        search: str = None,
        客户名称: str = None,
        产品类型: str = None,
        start_date: str = None,
        end_date: str = None,
        page: int = 1,
        page_size: int = 10
    ) -> Tuple[List, int]:
        from app.models.customer_sample import CustomerSample
        q = db.query(CustomerSample)

        if search:
            search_pattern = f"%{search}%"
            q = q.filter(
                or_(
                    CustomerSample.样品单号.like(search_pattern),
                    CustomerSample.客户名称.like(search_pattern),
                )
            )

        if 客户名称:
            q = q.filter(CustomerSample.客户名称.like(f"%{客户名称}%"))

        if 产品类型:
            q = q.filter(CustomerSample.产品类型.like(f"%{产品类型}%"))

        if start_date:
            q = q.filter(CustomerSample.下单日期 >= start_date)

        if end_date:
            q = q.filter(CustomerSample.下单日期 <= end_date)

        total = q.count()
        items = q.order_by(desc(CustomerSample.id)).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    def get_by_id(self, db: Session, id: int):
        from app.models.customer_sample import CustomerSample
        return db.query(CustomerSample).filter(CustomerSample.id == id).first()

    def create(self, db: Session, data: dict):
        from app.models.customer_sample import CustomerSample
        obj = CustomerSample(**data)
        db.add(obj)
        db.flush()
        return obj

    def update(self, db: Session, obj, data: dict):
        for key, value in data.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        db.flush()
        return obj

    def delete(self, db: Session, id: int):
        from app.models.customer_sample import CustomerSample
        obj = db.query(CustomerSample).filter(CustomerSample.id == id).first()
        if obj:
            db.delete(obj)
        db.flush()


customer_sample_repository = CustomerSampleRepository()
