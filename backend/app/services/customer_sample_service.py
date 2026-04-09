from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.orm import Session
from app.repositories.customer_sample_repository import customer_sample_repository


class CustomerSampleService:
    def __init__(self):
        self.repo = customer_sample_repository

    def search(
        self,
        db: Session,
        search: str = None,
        客户名称: str = None,
        产品类型: str = None,
        start_date: str = None,
        end_date: str = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List, int]:
        return self.repo.search(
            db, search=search, 客户名称=客户名称, 产品类型=产品类型,
            start_date=start_date, end_date=end_date,
            page=page, page_size=page_size
        )

    def get(self, db: Session, id: int):
        return self.repo.get_by_id(db, id)

    def create(self, db: Session, **kwargs) -> Tuple[Optional[Any], Optional[str]]:
        try:
            obj = self.repo.create(db, kwargs)
            db.commit()
            return obj, None
        except Exception as e:
            db.rollback()
            return None, str(e)

    def update(self, db: Session, id: int, **kwargs) -> Tuple[Optional[Any], Optional[str]]:
        obj = self.repo.get_by_id(db, id)
        if not obj:
            return None, "记录不存在"
        try:
            self.repo.update(db, obj, kwargs)
            db.commit()
            return obj, None
        except Exception as e:
            db.rollback()
            return None, str(e)

    def delete(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        obj = self.repo.get_by_id(db, id)
        if not obj:
            return False, "记录不存在"
        try:
            self.repo.delete(db, id)
            db.commit()
            return True, None
        except Exception as e:
            db.rollback()
            return False, str(e)

    def to_dict(self, obj) -> Dict[str, Any]:
        return {
            'id': obj.id,
            '客户名称': obj.客户名称,
            '样品单号': obj.样品单号,
            '下单日期': obj.下单日期.strftime('%Y-%m-%d') if obj.下单日期 else None,
            '需求日期': obj.需求日期.strftime('%Y-%m-%d') if obj.需求日期 else None,
            '规格': obj.规格,
            '产品类型': obj.产品类型,
            '型号': obj.型号,
            '单位': obj.单位,
            '数量': float(obj.数量) if obj.数量 else 0,
            '齿形': obj.齿形,
            '材料': obj.材料,
            '喷码要求': obj.喷码要求,
            '备注': obj.备注,
            '钢丝': obj.钢丝,
        }


customer_sample_service = CustomerSampleService()
