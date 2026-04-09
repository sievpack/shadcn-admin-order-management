from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.orm import Session
from app.repositories.quote_repository import quote_repository
from app.models.quote import Quote


class QuoteService:
    def __init__(self):
        self.repo = quote_repository

    def get_by_id(self, db: Session, id: int) -> Optional[Quote]:
        return self.repo.get_by_id(db, id)

    def search(
        self,
        db: Session,
        客户名称: Optional[str] = None,
        报价单号: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Quote], int]:
        return self.repo.search(db, 客户名称=客户名称, 报价单号=报价单号, page=page, page_size=page_size)

    def search_distinct(
        self,
        db: Session,
        客户名称: Optional[str] = None,
        报价单号: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Quote], int]:
        return self.repo.search_distinct(db, 客户名称=客户名称, 报价单号=报价单号, page=page, page_size=page_size)

    def search_dict(self, db: Session, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        items, total = self.search(db, **kwargs)
        return [self.to_dict(item) for item in items], total

    def create(self, db: Session, **kwargs) -> Tuple[Optional[Quote], Optional[str]]:
        try:
            if '含税总价' in kwargs:
                del kwargs['含税总价']
            quote = self.repo.create(db, **kwargs)
            return quote, None
        except Exception as e:
            return None, str(e)

    def update(self, db: Session, id: int, **kwargs) -> Tuple[Optional[Quote], Optional[str]]:
        quote = self.repo.get_by_id(db, id)
        if not quote:
            return None, "报价单不存在"
        try:
            if '含税总价' in kwargs:
                del kwargs['含税总价']
            updated = self.repo.update(db, quote, **kwargs)
            return updated, None
        except Exception as e:
            return None, str(e)

    def delete(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        success = self.repo.delete(db, id)
        if not success:
            return False, "报价单不存在"
        return True, None

    def to_dict(self, quote: Quote) -> Dict[str, Any]:
        return {
            'id': quote.id,
            '客户名称': quote.客户名称,
            '报价项目': quote.报价项目,
            '报价单号': quote.报价单号,
            '报价日期': quote.报价日期.strftime('%Y-%m-%d') if quote.报价日期 else None,
            '客户物料编码': quote.客户物料编码,
            '客户物料名称': quote.客户物料名称,
            '客户规格型号': quote.客户规格型号,
            '嘉尼索规格': quote.嘉尼索规格,
            '嘉尼索型号': quote.嘉尼索型号,
            '单位': quote.单位,
            '数量': quote.数量,
            '未税单价': quote.未税单价,
            '含税单价': quote.含税单价,
            '含税总价': quote.含税总价,
            '备注': quote.备注
        }

    def to_item_dict(self, quote: Quote) -> Dict[str, Any]:
        return {
            'id': quote.id,
            '客户物料编码': quote.客户物料编码,
            '客户物料名称': quote.客户物料名称,
            '客户规格型号': quote.客户规格型号,
            '嘉尼索规格': quote.嘉尼索规格,
            '嘉尼索型号': quote.嘉尼索型号,
            '单位': quote.单位,
            '数量': quote.数量,
            '未税单价': quote.未税单价,
            '含税单价': quote.含税单价,
            '含税总价': quote.含税总价,
            '备注': quote.备注
        }


quote_service = QuoteService()
