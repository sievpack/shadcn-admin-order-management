from typing import Optional, Tuple, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.quote import Quote
from app.repositories.base_repository import BaseRepository


class QuoteRepository(BaseRepository):
    def __init__(self):
        super().__init__(Quote)

    def get_by_id(self, db: Session, id: int) -> Optional[Quote]:
        return db.query(Quote).filter(Quote.id == id).first()

    def get_by_报价单号(self, db: Session, 报价单号: str) -> Optional[Quote]:
        return db.query(Quote).filter(Quote.报价单号 == 报价单号).first()

    def search(
        self,
        db: Session,
        客户名称: Optional[str] = None,
        报价单号: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Quote], int]:
        query = db.query(Quote)

        if 客户名称:
            query = query.filter(Quote.客户名称.contains(客户名称))
        if 报价单号:
            query = query.filter(Quote.报价单号.contains(报价单号))

        total = query.count()
        items = query.order_by(desc(Quote.id)).offset((page - 1) * page_size).limit(page_size).all()

        return items, total

    def create(self, db: Session, **kwargs) -> Quote:
        quote = Quote(**kwargs)
        db.add(quote)
        db.commit()
        db.refresh(quote)
        return quote

    def update(self, db: Session, quote: Quote, **kwargs) -> Quote:
        for key, value in kwargs.items():
            if value is not None:
                setattr(quote, key, value)
        db.commit()
        db.refresh(quote)
        return quote

    def delete(self, db: Session, id: int) -> bool:
        quote = self.get_by_id(db, id)
        if not quote:
            return False
        db.delete(quote)
        db.commit()
        return True


quote_repository = QuoteRepository()
