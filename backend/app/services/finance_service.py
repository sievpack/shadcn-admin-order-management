import logging
from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.orm import Session
from datetime import date, datetime
from decimal import Decimal
from app.repositories.finance_repository import (
    accounts_receivable_repository,
    accounts_payable_repository,
    generate_code
)
from app.models.finance import AccountsReceivable, CollectionRecord, ARWriteOff, AccountsPayable, PaymentRecord, Voucher

logger = logging.getLogger(__name__)


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
        query: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[AccountsReceivable], int]:
        return self.repo.search(db, 应收单号=应收单号, 客户名称=客户名称, 收款状态=收款状态, query=query, page=page, page_size=page_size)

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


class CollectionRecordService:
    def __init__(self):
        self.model = CollectionRecord

    def search(
        self,
        db: Session,
        收款单号: Optional[str] = None,
        关联应收: Optional[str] = None,
        核销状态: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[CollectionRecord], int]:
        from sqlalchemy import desc
        query_obj = db.query(CollectionRecord)
        if 收款单号:
            query_obj = query_obj.filter(CollectionRecord.收款单号.contains(收款单号))
        if 关联应收:
            query_obj = query_obj.filter(CollectionRecord.关联应收.contains(关联应收))
        if 核销状态:
            query_obj = query_obj.filter(CollectionRecord.核销状态 == 核销状态)
        total = query_obj.count()
        items = query_obj.order_by(desc(CollectionRecord.id)).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    def create(self, db: Session, **kwargs) -> Tuple[Optional[CollectionRecord], Optional[str]]:
        try:
            if '收款金额' in kwargs and kwargs['收款金额'] is not None:
                kwargs['收款金额'] = Decimal(str(kwargs['收款金额']))
            if not kwargs.get('收款单号'):
                kwargs['收款单号'] = generate_code("CR")
            item = CollectionRecord(**kwargs)
            db.add(item)
            db.commit()
            db.refresh(item)
            return item, None
        except Exception as e:
            db.rollback()
            logger.error(f"创建收款记录失败: {e}")
            return None, str(e)

    def to_dict(self, item: CollectionRecord) -> dict:
        return {
            'id': item.id,
            '收款单号': item.收款单号,
            '关联应收': item.关联应收,
            '收款金额': float(item.收款金额) if item.收款金额 else 0,
            '收款方式': item.收款方式,
            '收款日期': item.收款日期.strftime('%Y-%m-%d') if item.收款日期 else None,
            '核销状态': item.核销状态,
            '操作人': item.操作人,
            '备注': item.备注,
            'create_at': item.create_at.strftime('%Y-%m-%d %H:%M:%S') if item.create_at else None,
            'create_by': item.create_by,
        }


class PaymentRecordService:
    def __init__(self):
        self.model = PaymentRecord

    def search(
        self,
        db: Session,
        付款单号: Optional[str] = None,
        关联应付: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[PaymentRecord], int]:
        from sqlalchemy import desc
        query_obj = db.query(PaymentRecord)
        if 付款单号:
            query_obj = query_obj.filter(PaymentRecord.付款单号.contains(付款单号))
        if 关联应付:
            query_obj = query_obj.filter(PaymentRecord.关联应付.contains(关联应付))
        total = query_obj.count()
        items = query_obj.order_by(desc(PaymentRecord.id)).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    def create(self, db: Session, **kwargs) -> Tuple[Optional[PaymentRecord], Optional[str]]:
        try:
            if '付款金额' in kwargs and kwargs['付款金额'] is not None:
                kwargs['付款金额'] = Decimal(str(kwargs['付款金额']))
            if not kwargs.get('付款单号'):
                kwargs['付款单号'] = generate_code("PY")
            item = PaymentRecord(**kwargs)
            db.add(item)
            db.commit()
            db.refresh(item)
            return item, None
        except Exception as e:
            db.rollback()
            logger.error(f"创建付款记录失败: {e}")
            return None, str(e)

    def to_dict(self, item: PaymentRecord) -> dict:
        return {
            'id': item.id,
            '付款单号': item.付款单号,
            '关联应付': item.关联应付,
            '付款金额': float(item.付款金额) if item.付款金额 else 0,
            '付款方式': item.付款方式,
            '付款日期': item.付款日期.strftime('%Y-%m-%d') if item.付款日期 else None,
            '核销状态': item.核销状态,
            '操作人': item.操作人,
            '备注': item.备注,
            'create_at': item.create_at.strftime('%Y-%m-%d %H:%M:%S') if item.create_at else None,
            'create_by': item.create_by,
        }


class VoucherService:
    def __init__(self):
        self.model = Voucher

    def search(
        self,
        db: Session,
        凭证编号: Optional[str] = None,
        审核状态: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Voucher], int]:
        from sqlalchemy import desc
        query_obj = db.query(Voucher)
        if 凭证编号:
            query_obj = query_obj.filter(Voucher.凭证编号.contains(凭证编号))
        if 审核状态:
            query_obj = query_obj.filter(Voucher.审核状态 == 审核状态)
        total = query_obj.count()
        items = query_obj.order_by(desc(Voucher.id)).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    def create(self, db: Session, **kwargs) -> Tuple[Optional[Voucher], Optional[str]]:
        try:
            if '借方金额' in kwargs and kwargs['借方金额'] is not None:
                kwargs['借方金额'] = Decimal(str(kwargs['借方金额']))
            if '贷方金额' in kwargs and kwargs['贷方金额'] is not None:
                kwargs['贷方金额'] = Decimal(str(kwargs['贷方金额']))
            if not kwargs.get('凭证编号'):
                kwargs['凭证编号'] = generate_code("VCH")
            item = Voucher(**kwargs)
            db.add(item)
            db.commit()
            db.refresh(item)
            return item, None
        except Exception as e:
            db.rollback()
            logger.error(f"创建凭证失败: {e}")
            return None, str(e)

    def approve(self, db: Session, voucher_id: int) -> Tuple[bool, Optional[str]]:
        item = db.query(Voucher).filter(Voucher.id == voucher_id).first()
        if not item:
            return False, "凭证不存在"
        try:
            item.审核状态 = "已审核"
            item.update_at = datetime.now()
            db.commit()
            return True, None
        except Exception as e:
            db.rollback()
            logger.error(f"审核凭证失败: {e}")
            return False, str(e)

    def to_dict(self, item: Voucher) -> dict:
        return {
            'id': item.id,
            '凭证编号': item.凭证编号,
            '凭证日期': item.凭证日期.strftime('%Y-%m-%d') if item.凭证日期 else None,
            '凭证类型': item.凭证类型,
            '摘要': item.摘要,
            '科目': item.科目,
            '借方金额': float(item.借方金额) if item.借方金额 else 0,
            '贷方金额': float(item.贷方金额) if item.贷方金额 else 0,
            '审核状态': item.审核状态,
            '审核人': item.审核人,
            '附件数量': item.附件数量,
            '备注': item.备注,
            'create_at': item.create_at.strftime('%Y-%m-%d %H:%M:%S') if item.create_at else None,
            'update_at': item.update_at.strftime('%Y-%m-%d %H:%M:%S') if item.update_at else None,
            'create_by': item.create_by,
        }


collection_record_service = CollectionRecordService()
payment_record_service = PaymentRecordService()
voucher_service = VoucherService()


class AccountsReceivableBatchService:
    def __init__(self):
        self.model = AccountsReceivable

    def batch_create_from_shipment(
        self,
        db: Session,
        year: int,
        month: int,
        receivable_date: str,
        customer_name: Optional[str] = None
    ) -> Tuple[List[Dict], List[Dict]]:
        from app.models.ship import Ship
        from app.models.order import Order
        from app.models.customer import Customer
        from sqlalchemy import extract

        target_year_start = datetime(year, month, 1, 0, 0, 0, 0)
        if month == 12:
            target_year_end = datetime(year + 1, 1, 1, 0, 0, 0, 0)
        else:
            target_year_end = datetime(year, month + 1, 1, 0, 0, 0, 0)

        query_obj = db.query(
            Ship.客户名称,
            Order.金额
        ).outerjoin(
            Order, Order.发货单号 == Ship.发货单号
        ).join(
            Customer, Ship.客户名称 == Customer.客户名称
        ).filter(
            Customer.状态 != '停用',
            Ship.发货日期 >= target_year_start,
            Ship.发货日期 < target_year_end
        )

        if customer_name:
            query_obj = query_obj.filter(Ship.客户名称 == customer_name)

        customer_shipments = query_obj.all()

        customer_amount_map = {}
        for cust_name, amount in customer_shipments:
            if cust_name not in customer_amount_map:
                customer_amount_map[cust_name] = 0
            if amount is not None:
                customer_amount_map[cust_name] += amount

        created_records = []
        skipped_records = []

        try:
            for cust_name, total_amount in customer_amount_map.items():
                if total_amount <= 0:
                    continue

                existing_ar = db.query(AccountsReceivable).filter(
                    AccountsReceivable.客户名称 == cust_name,
                    extract('year', AccountsReceivable.应收日期) == year,
                    extract('month', AccountsReceivable.应收日期) == month
                ).first()

                if existing_ar:
                    skipped_records.append({
                        "customer_name": cust_name,
                        "reason": "已存在该月份应收单",
                        "existing_ar_id": existing_ar.id,
                        "应收单号": existing_ar.应收单号
                    })
                    continue

                new_ar = AccountsReceivable(
                    应收单号=generate_code("YS"),
                    客户名称=cust_name,
                    应收金额=Decimal(str(round(total_amount, 2))),
                    已收金额=Decimal("0"),
                    应收余额=Decimal(str(round(total_amount, 2))),
                    应收日期=datetime.strptime(receivable_date, '%Y-%m-%d').date(),
                    到期日期=None,
                    账期类型="月结30天",
                    收款状态="未收款",
                    备注=f"由{year}年{month}月发货数据自动生成",
                    create_by="system"
                )
                db.add(new_ar)
                created_records.append({
                    "customer_name": cust_name,
                    "应收单号": new_ar.应收单号,
                    "应收金额": float(new_ar.应收金额),
                    "ar_id": new_ar.id
                })

            db.commit()
            for record in created_records:
                db.refresh(db.query(AccountsReceivable).filter(AccountsReceivable.id == record["ar_id"]).first())

        except Exception as e:
            db.rollback()
            logger.error(f"批量创建应收单失败: {e}")
            for record in created_records:
                skipped_records.append({
                    "customer_name": record["customer_name"],
                    "reason": f"创建失败: {str(e)}"
                })
            created_records = []

        return created_records, skipped_records


accounts_receivable_batch_service = AccountsReceivableBatchService()


class FinanceStatsService:
    def get_income_stats(self, db: Session, year: Optional[int] = None) -> List[Dict[str, Any]]:
        from sqlalchemy import extract
        if year is None:
            year = datetime.now().year

        months = []
        for month in range(1, 13):
            ar_items = db.query(AccountsReceivable).filter(
                extract('month', AccountsReceivable.应收日期) == month,
                extract('year', AccountsReceivable.应收日期) == year
            ).all()

            total_ar = sum(float(item.应收金额 or 0) for item in ar_items)
            total_received = sum(float(item.已收金额 or 0) for item in ar_items)

            collection_items = db.query(CollectionRecord).filter(
                extract('month', CollectionRecord.收款日期) == month,
                extract('year', CollectionRecord.收款日期) == year
            ).all()
            total_collection = sum(float(item.收款金额 or 0) for item in collection_items)

            months.append({
                'month': f"{year}-{month:02d}",
                '应收金额': total_ar,
                '已收金额': total_received,
                '收款金额': total_collection,
            })

        return months


finance_stats_service = FinanceStatsService()
