from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.orm import Session
from datetime import date, datetime
from decimal import Decimal
from app.repositories.finance_repository import (
    accounts_receivable_repository,
    accounts_payable_repository,
    generate_code
)
from app.models.finance import AccountsReceivable, CollectionRecord, ARWriteOff, AccountsPayable


class AccountsReceivableService:
    def __init__(self):
        self.repo = accounts_receivable_repository

    def get_by_id(self, db: Session, id: int) -> Optional[AccountsReceivable]:
        return self.repo.get_by_id(db, id)

    def search(
        self,
        db: Session,
        应收单号: Optional[str] = None,
        客户名称: Optional[str] = None,
        收款状态: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[AccountsReceivable], int]:
        return self.repo.search(db, 应收单号=应收单号, 客户名称=客户名称, 收款状态=收款状态, page=page, page_size=page_size)

    def search_dict(self, db: Session, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        items, total = self.search(db, **kwargs)
        return [self.to_dict(item) for item in items], total

    def create(self, db: Session, **kwargs) -> Tuple[Optional[AccountsReceivable], Optional[str]]:
        try:
            if '应收金额' in kwargs and kwargs['应收金额'] is not None:
                kwargs['应收金额'] = Decimal(str(kwargs['应收金额']))
            if '已收金额' in kwargs and kwargs['已收金额'] is not None:
                kwargs['已收金额'] = Decimal(str(kwargs['已收金额']))
            if '应收余额' in kwargs and kwargs['应收余额'] is not None:
                kwargs['应收余额'] = Decimal(str(kwargs['应收余额']))
            if not kwargs.get('应收单号'):
                kwargs['应收单号'] = generate_code("AR")
            ar = self.repo.create(db, **kwargs)
            return ar, None
        except Exception as e:
            return None, str(e)

    def update(self, db: Session, id: int, **kwargs) -> Tuple[Optional[AccountsReceivable], Optional[str]]:
        ar = self.repo.get_by_id(db, id)
        if not ar:
            return None, "应收账款不存在"
        try:
            if '应收金额' in kwargs and kwargs['应收金额'] is not None:
                kwargs['应收金额'] = Decimal(str(kwargs['应收金额']))
            if '已收金额' in kwargs and kwargs['已收金额'] is not None:
                kwargs['已收金额'] = Decimal(str(kwargs['已收金额']))
            if '应收余额' in kwargs and kwargs['应收余额'] is not None:
                kwargs['应收余额'] = Decimal(str(kwargs['应收余额']))
            updated = self.repo.update(db, ar, **kwargs)
            return updated, None
        except Exception as e:
            return None, str(e)

    def delete(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        success = self.repo.delete(db, id)
        if not success:
            return False, "应收账款不存在"
        return True, None

    def get_aging(self, db: Session) -> List[Dict[str, Any]]:
        items = db.query(AccountsReceivable).filter(
            AccountsReceivable.收款状态.in_(["未收款", "部分收款"])
        ).all()

        result = []
        today = date.today()
        for item in items:
            days = (today - item.应收日期).days if item.应收日期 else 0
            if days <= 30:
                区间 = "30天内"
            elif days <= 60:
                区间 = "31-60天"
            elif days <= 90:
                区间 = "61-90天"
            else:
                区间 = "90天以上"
            result.append({
                '应收单号': item.应收单号,
                '客户名称': item.客户名称,
                '应收金额': float(item.应收金额),
                '已收金额': float(item.已收金额),
                '应收余额': float(item.应收余额),
                '应收日期': item.应收日期.strftime('%Y-%m-%d') if item.应收日期 else None,
                '到期日期': item.到期日期.strftime('%Y-%m-%d') if item.到期日期 else None,
                '账龄天数': days,
                '账龄区间': 区间
            })
        return result

    def to_dict(self, ar: AccountsReceivable) -> Dict[str, Any]:
        return self.repo.to_dict(ar)


class AccountsPayableService:
    def __init__(self):
        self.repo = accounts_payable_repository

    def get_by_id(self, db: Session, id: int) -> Optional[AccountsPayable]:
        return self.repo.get_by_id(db, id)

    def search(
        self,
        db: Session,
        应付单号: Optional[str] = None,
        供应商名称: Optional[str] = None,
        付款状态: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[AccountsPayable], int]:
        return self.repo.search(db, 应付单号=应付单号, 供应商名称=供应商名称, 付款状态=付款状态, page=page, page_size=page_size)

    def search_dict(self, db: Session, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        items, total = self.search(db, **kwargs)
        return [self.to_dict(item) for item in items], total

    def create(self, db: Session, **kwargs) -> Tuple[Optional[AccountsPayable], Optional[str]]:
        try:
            if '应付金额' in kwargs and kwargs['应付金额'] is not None:
                kwargs['应付金额'] = Decimal(str(kwargs['应付金额']))
            if '已付金额' in kwargs and kwargs['已付金额'] is not None:
                kwargs['已付金额'] = Decimal(str(kwargs['已付金额']))
            if '应付余额' in kwargs and kwargs['应付余额'] is not None:
                kwargs['应付余额'] = Decimal(str(kwargs['应付余额']))
            if not kwargs.get('应付单号'):
                kwargs['应付单号'] = generate_code("AP")
            ap = self.repo.create(db, **kwargs)
            return ap, None
        except Exception as e:
            return None, str(e)

    def delete(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        success = self.repo.delete(db, id)
        if not success:
            return False, "应付账款不存在"
        return True, None

    def get_aging(self, db: Session) -> List[Dict[str, Any]]:
        items = db.query(AccountsPayable).filter(
            AccountsPayable.付款状态.in_(["未付款", "部分付款"])
        ).all()

        result = []
        today = date.today()
        for item in items:
            days = (today - item.应付日期).days if item.应付日期 else 0
            if days <= 30:
                区间 = "30天内"
            elif days <= 60:
                区间 = "31-60天"
            elif days <= 90:
                区间 = "61-90天"
            else:
                区间 = "90天以上"
            result.append({
                '应付单号': item.应付单号,
                '供应商名称': item.供应商名称,
                '应付金额': float(item.应付金额),
                '已付金额': float(item.已付金额),
                '应付余额': float(item.应付余额),
                '应付日期': item.应付日期.strftime('%Y-%m-%d') if item.应付日期 else None,
                '到期日期': item.到期日期.strftime('%Y-%m-%d') if item.到期日期 else None,
                '账龄天数': days,
                '账龄区间': 区间
            })
        return result

    def to_dict(self, ap: AccountsPayable) -> Dict[str, Any]:
        return self.repo.to_dict(ap)


accounts_receivable_service = AccountsReceivableService()
accounts_payable_service = AccountsPayableService()
