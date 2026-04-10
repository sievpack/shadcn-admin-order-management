from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import date, datetime
from decimal import Decimal
from app.models.finance import AccountsReceivable, CollectionRecord, ARWriteOff, AccountsPayable, PaymentRecord, APWriteOff, Voucher
from app.repositories.base_repository import BaseRepository


def generate_code(prefix: str) -> str:
    today = datetime.now().strftime('%Y%m%d')
    return f"{prefix}-{today}-001"


class AccountsReceivableRepository(BaseRepository):
    def __init__(self):
        super().__init__(AccountsReceivable)

    def get_by_id(self, db: Session, id: int) -> Optional[AccountsReceivable]:
        return db.query(AccountsReceivable).filter(AccountsReceivable.id == id).first()

    def search(
        self,
        db: Session,
        应收单号: Optional[str] = None,
        客户名称: Optional[str] = None,
        收款状态: Optional[str] = None,
        query: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[AccountsReceivable], int]:
        query_obj = db.query(AccountsReceivable)

        if query:
            query_obj = query_obj.filter(
                AccountsReceivable.应收单号.contains(query) |
                AccountsReceivable.客户名称.contains(query)
            )
        if 应收单号:
            query_obj = query_obj.filter(AccountsReceivable.应收单号.contains(应收单号))
        if 客户名称:
            query_obj = query_obj.filter(AccountsReceivable.客户名称.contains(客户名称))
        if 收款状态:
            # 支持多个状态，逗号分隔
            status_list = 收款状态.split(',') if isinstance(收款状态, str) else [收款状态]
            if len(status_list) == 1:
                query_obj = query_obj.filter(AccountsReceivable.收款状态 == status_list[0])
            else:
                query_obj = query_obj.filter(AccountsReceivable.收款状态.in_(status_list))

        total = query_obj.count()
        items = query_obj.order_by(desc(AccountsReceivable.id)).offset((page - 1) * page_size).limit(page_size).all()

        return items, total

    def create(self, db: Session, **kwargs) -> AccountsReceivable:
        ar = AccountsReceivable(**kwargs)
        db.add(ar)
        db.commit()
        db.refresh(ar)
        return ar

    def update(self, db: Session, ar: AccountsReceivable, **kwargs) -> AccountsReceivable:
        for key, value in kwargs.items():
            if value is not None:
                if key in ["应收金额", "已收金额", "应收余额"]:
                    setattr(ar, key, Decimal(str(value)))
                else:
                    setattr(ar, key, value)
        ar.update_at = datetime.now()
        db.commit()
        db.refresh(ar)
        return ar

    def delete(self, db: Session, id: int) -> bool:
        ar = self.get_by_id(db, id)
        if not ar:
            return False
        db.delete(ar)
        db.commit()
        return True

    def to_dict(self, ar: AccountsReceivable) -> dict:
        return {
            'id': ar.id,
            '应收单号': ar.应收单号,
            '关联订单': ar.关联订单,
            '客户名称': ar.客户名称,
            '应收金额': float(ar.应收金额) if ar.应收金额 else 0,
            '已收金额': float(ar.已收金额) if ar.已收金额 else 0,
            '应收余额': float(ar.应收余额) if ar.应收余额 else 0,
            '应收日期': ar.应收日期.strftime('%Y-%m-%d') if ar.应收日期 else None,
            '到期日期': ar.到期日期.strftime('%Y-%m-%d') if ar.到期日期 else None,
            '账期类型': ar.账期类型,
            '收款状态': ar.收款状态,
            '备注': ar.备注,
            'create_at': ar.create_at.strftime('%Y-%m-%d %H:%M:%S') if ar.create_at else None,
            'update_at': ar.update_at.strftime('%Y-%m-%d %H:%M:%S') if ar.update_at else None,
            'create_by': ar.create_by,
        }


class AccountsPayableRepository(BaseRepository):
    def __init__(self):
        super().__init__(AccountsPayable)

    def get_by_id(self, db: Session, id: int) -> Optional[AccountsPayable]:
        return db.query(AccountsPayable).filter(AccountsPayable.id == id).first()

    def search(
        self,
        db: Session,
        应付单号: Optional[str] = None,
        供应商名称: Optional[str] = None,
        付款状态: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[AccountsPayable], int]:
        query = db.query(AccountsPayable)

        if 应付单号:
            query = query.filter(AccountsPayable.应付单号.contains(应付单号))
        if 供应商名称:
            query = query.filter(AccountsPayable.供应商名称.contains(供应商名称))
        if 付款状态:
            # 支持多个状态，逗号分隔
            status_list = 付款状态.split(',') if isinstance(付款状态, str) else [付款状态]
            if len(status_list) == 1:
                query = query.filter(AccountsPayable.付款状态 == status_list[0])
            else:
                query = query.filter(AccountsPayable.付款状态.in_(status_list))

        total = query.count()
        items = query.order_by(desc(AccountsPayable.id)).offset((page - 1) * page_size).limit(page_size).all()

        return items, total

    def create(self, db: Session, **kwargs) -> AccountsPayable:
        ap = AccountsPayable(**kwargs)
        db.add(ap)
        db.commit()
        db.refresh(ap)
        return ap

    def delete(self, db: Session, id: int) -> bool:
        ap = self.get_by_id(db, id)
        if not ap:
            return False
        db.delete(ap)
        db.commit()
        return True

    def to_dict(self, ap: AccountsPayable) -> dict:
        return {
            'id': ap.id,
            '应付单号': ap.应付单号,
            '关联订单': ap.关联订单,
            '供应商名称': ap.供应商名称,
            '应付金额': float(ap.应付金额) if ap.应付金额 else 0,
            '已付金额': float(ap.已付金额) if ap.已付金额 else 0,
            '应付余额': float(ap.应付余额) if ap.应付余额 else 0,
            '应付日期': ap.应付日期.strftime('%Y-%m-%d') if ap.应付日期 else None,
            '到期日期': ap.到期日期.strftime('%Y-%m-%d') if ap.到期日期 else None,
            '账期类型': ap.账期类型,
            '付款状态': ap.付款状态,
            '备注': ap.备注,
            'create_at': ap.create_at.strftime('%Y-%m-%d %H:%M:%S') if ap.create_at else None,
            'update_at': ap.update_at.strftime('%Y-%m-%d %H:%M:%S') if ap.update_at else None,
            'create_by': ap.create_by,
        }


accounts_receivable_repository = AccountsReceivableRepository()
accounts_payable_repository = AccountsPayableRepository()
