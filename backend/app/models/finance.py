import datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Numeric
from app.db.database import Base


class AccountsReceivable(Base):
    """应收账款表"""
    __tablename__ = '应收账款表'
    __bind_key__ = 'DB_JNS'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    应收单号 = Column(String(50), unique=True, nullable=False)
    关联订单 = Column(String(50))
    客户名称 = Column(String(100), nullable=False)
    应收金额 = Column(Numeric(18,2), nullable=False)
    已收金额 = Column(Numeric(18,2), default=0)
    应收余额 = Column(Numeric(18,2), nullable=False)
    应收日期 = Column(Date, nullable=False)
    到期日期 = Column(Date)
    账期类型 = Column(String(20), default='月结30天')
    收款状态 = Column(String(20), default='未收款')
    备注 = Column(String(255))
    create_at = Column(DateTime, default=datetime.datetime.now)
    update_at = Column(DateTime, default=datetime.datetime.now)
    create_by = Column(String(50))


class CollectionRecord(Base):
    """收款记录表"""
    __tablename__ = '收款记录表'
    __bind_key__ = 'DB_JNS'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    收款单号 = Column(String(50), unique=True, nullable=False)
    关联应收 = Column(String(50))
    收款金额 = Column(Numeric(18,2), nullable=False)
    收款方式 = Column(String(20), nullable=False)
    收款日期 = Column(Date, nullable=False)
    核销状态 = Column(String(20), default='未核销')
    操作人 = Column(String(50))
    备注 = Column(String(255))
    create_at = Column(DateTime, default=datetime.datetime.now)
    create_by = Column(String(50))


class ARWriteOff(Base):
    """应收账款核销表"""
    __tablename__ = '应收账款核销表'
    __bind_key__ = 'DB_JNS'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    核销编号 = Column(String(50), unique=True, nullable=False)
    应收单号 = Column(String(50), nullable=False)
    收款单号 = Column(String(50), nullable=False)
    核销金额 = Column(Numeric(18,2), nullable=False)
    核销日期 = Column(Date, nullable=False)
    核销人 = Column(String(50))
    备注 = Column(String(255))
    create_at = Column(DateTime, default=datetime.datetime.now)


class AccountsPayable(Base):
    """应付账款表"""
    __tablename__ = '应付账款表'
    __bind_key__ = 'DB_JNS'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    应付单号 = Column(String(50), unique=True, nullable=False)
    关联订单 = Column(String(50))
    供应商名称 = Column(String(100), nullable=False)
    应付金额 = Column(Numeric(18,2), nullable=False)
    已付金额 = Column(Numeric(18,2), default=0)
    应付余额 = Column(Numeric(18,2), nullable=False)
    应付日期 = Column(Date, nullable=False)
    到期日期 = Column(Date)
    账期类型 = Column(String(20), default='月结30天')
    付款状态 = Column(String(20), default='未付款')
    备注 = Column(String(255))
    create_at = Column(DateTime, default=datetime.datetime.now)
    update_at = Column(DateTime, default=datetime.datetime.now)
    create_by = Column(String(50))


class PaymentRecord(Base):
    """付款记录表"""
    __tablename__ = '付款记录表'
    __bind_key__ = 'DB_JNS'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    付款单号 = Column(String(50), unique=True, nullable=False)
    关联应付 = Column(String(50))
    付款金额 = Column(Numeric(18,2), nullable=False)
    付款方式 = Column(String(20), nullable=False)
    付款日期 = Column(Date, nullable=False)
    核销状态 = Column(String(20), default='未核销')
    操作人 = Column(String(50))
    备注 = Column(String(255))
    create_at = Column(DateTime, default=datetime.datetime.now)
    create_by = Column(String(50))


class APWriteOff(Base):
    """付款核销表"""
    __tablename__ = '付款核销表'
    __bind_key__ = 'DB_JNS'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    核销编号 = Column(String(50), unique=True, nullable=False)
    应付单号 = Column(String(50), nullable=False)
    付款单号 = Column(String(50), nullable=False)
    核销金额 = Column(Numeric(18,2), nullable=False)
    核销日期 = Column(Date, nullable=False)
    核销人 = Column(String(50))
    备注 = Column(String(255))
    create_at = Column(DateTime, default=datetime.datetime.now)


class Voucher(Base):
    """凭证表"""
    __tablename__ = '凭证表'
    __bind_key__ = 'DB_JNS'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    凭证编号 = Column(String(50), unique=True, nullable=False)
    凭证日期 = Column(Date, nullable=False)
    凭证类型 = Column(String(20), default='记账凭证')
    摘要 = Column(String(255), nullable=False)
    科目 = Column(String(100), nullable=False)
    借方金额 = Column(Numeric(18,2), default=0)
    贷方金额 = Column(Numeric(18,2), default=0)
    审核状态 = Column(String(20), default='待审核')
    审核人 = Column(String(50))
    附件数量 = Column(Integer, default=0)
    备注 = Column(String(255))
    create_at = Column(DateTime, default=datetime.datetime.now)
    update_at = Column(DateTime, default=datetime.datetime.now)
    create_by = Column(String(50))