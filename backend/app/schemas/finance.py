from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


# ==================== 应收账款 Schema ====================
class AccountsReceivableBase(BaseModel):
    应收单号: str
    关联订单: Optional[str] = None
    客户名称: str
    应收金额: Decimal
    已收金额: Optional[Decimal] = 0
    应收余额: Decimal
    应收日期: date
    到期日期: Optional[date] = None
    账期类型: Optional[str] = '月结30天'
    收款状态: Optional[str] = '未收款'
    备注: Optional[str] = None


class AccountsReceivableCreate(AccountsReceivableBase):
    pass


class AccountsReceivableUpdate(BaseModel):
    应收单号: Optional[str] = None
    关联订单: Optional[str] = None
    客户名称: Optional[str] = None
    应收金额: Optional[Decimal] = None
    已收金额: Optional[Decimal] = None
    应收余额: Optional[Decimal] = None
    应收日期: Optional[date] = None
    到期日期: Optional[date] = None
    账期类型: Optional[str] = None
    收款状态: Optional[str] = None
    备注: Optional[str] = None


class AccountsReceivableResponse(AccountsReceivableBase):
    id: int
    create_at: Optional[datetime] = None
    update_at: Optional[datetime] = None
    create_by: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== 收款记录 Schema ====================
class CollectionRecordBase(BaseModel):
    收款单号: str
    关联应收: Optional[str] = None
    收款金额: Decimal
    收款方式: str
    收款日期: date
    核销状态: Optional[str] = '未核销'
    操作人: Optional[str] = None
    备注: Optional[str] = None


class CollectionRecordCreate(CollectionRecordBase):
    pass


class CollectionRecordUpdate(BaseModel):
    收款单号: Optional[str] = None
    关联应收: Optional[str] = None
    收款金额: Optional[Decimal] = None
    收款方式: Optional[str] = None
    收款日期: Optional[date] = None
    核销状态: Optional[str] = None
    操作人: Optional[str] = None
    备注: Optional[str] = None


class CollectionRecordResponse(CollectionRecordBase):
    id: int
    create_at: Optional[datetime] = None
    create_by: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== 应收账款核销 Schema ====================
class ARWriteOffBase(BaseModel):
    核销编号: str
    应收单号: str
    收款单号: str
    核销金额: Decimal
    核销日期: date
    核销人: Optional[str] = None
    备注: Optional[str] = None


class ARWriteOffCreate(ARWriteOffBase):
    pass


class ARWriteOffResponse(ARWriteOffBase):
    id: int
    create_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== 应付账款 Schema ====================
class AccountsPayableBase(BaseModel):
    应付单号: str
    关联订单: Optional[str] = None
    供应商名称: str
    应付金额: Decimal
    已付金额: Optional[Decimal] = 0
    应付余额: Decimal
    应付日期: date
    到期日期: Optional[date] = None
    账期类型: Optional[str] = '月结30天'
    付款状态: Optional[str] = '未付款'
    备注: Optional[str] = None


class AccountsPayableCreate(AccountsPayableBase):
    pass


class AccountsPayableUpdate(BaseModel):
    应付单号: Optional[str] = None
    关联订单: Optional[str] = None
    供应商名称: Optional[str] = None
    应付金额: Optional[Decimal] = None
    已付金额: Optional[Decimal] = None
    应付余额: Optional[Decimal] = None
    应付日期: Optional[date] = None
    到期日期: Optional[date] = None
    账期类型: Optional[str] = None
    付款状态: Optional[str] = None
    备注: Optional[str] = None


class AccountsPayableResponse(AccountsPayableBase):
    id: int
    create_at: Optional[datetime] = None
    update_at: Optional[datetime] = None
    create_by: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== 付款记录 Schema ====================
class PaymentRecordBase(BaseModel):
    付款单号: str
    关联应付: Optional[str] = None
    付款金额: Decimal
    付款方式: str
    付款日期: date
    核销状态: Optional[str] = '未核销'
    操作人: Optional[str] = None
    备注: Optional[str] = None


class PaymentRecordCreate(PaymentRecordBase):
    pass


class PaymentRecordUpdate(BaseModel):
    付款单号: Optional[str] = None
    关联应付: Optional[str] = None
    付款金额: Optional[Decimal] = None
    付款方式: Optional[str] = None
    付款日期: Optional[date] = None
    核销状态: Optional[str] = None
    操作人: Optional[str] = None
    备注: Optional[str] = None


class PaymentRecordResponse(PaymentRecordBase):
    id: int
    create_at: Optional[datetime] = None
    create_by: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== 付款核销 Schema ====================
class APWriteOffBase(BaseModel):
    核销编号: str
    应付单号: str
    付款单号: str
    核销金额: Decimal
    核销日期: date
    核销人: Optional[str] = None
    备注: Optional[str] = None


class APWriteOffCreate(APWriteOffBase):
    pass


class APWriteOffResponse(APWriteOffBase):
    id: int
    create_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== 凭证 Schema ====================
class VoucherBase(BaseModel):
    凭证编号: str
    凭证日期: date
    凭证类型: Optional[str] = '记账凭证'
    摘要: str
    科目: str
    借方金额: Optional[Decimal] = 0
    贷方金额: Optional[Decimal] = 0
    审核状态: Optional[str] = '待审核'
    审核人: Optional[str] = None
    附件数量: Optional[int] = 0
    备注: Optional[str] = None


class VoucherCreate(VoucherBase):
    pass


class VoucherUpdate(BaseModel):
    凭证编号: Optional[str] = None
    凭证日期: Optional[date] = None
    凭证类型: Optional[str] = None
    摘要: Optional[str] = None
    科目: Optional[str] = None
    借方金额: Optional[Decimal] = None
    贷方金额: Optional[Decimal] = None
    审核状态: Optional[str] = None
    审核人: Optional[str] = None
    附件数量: Optional[int] = None
    备注: Optional[str] = None


class VoucherResponse(VoucherBase):
    id: int
    create_at: Optional[datetime] = None
    update_at: Optional[datetime] = None
    create_by: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== 统计 Schema ====================
class FinanceStatsResponse(BaseModel):
    年份: Optional[int] = None
    月份: Optional[int] = None
    应收金额: Optional[Decimal] = None
    已收金额: Optional[Decimal] = None
    应收余额: Optional[Decimal] = None


class AgingResponse(BaseModel):
    应收单号: Optional[str] = None
    客户名称: Optional[str] = None
    应收金额: Optional[Decimal] = None
    已收金额: Optional[Decimal] = None
    应收余额: Optional[Decimal] = None
    应收日期: Optional[date] = None
    到期日期: Optional[date] = None
    账龄天数: Optional[int] = None
    账龄区间: Optional[str] = None