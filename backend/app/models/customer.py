import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.db.database import Base


class Customer(Base):
    """客户信息表"""
    __bind_key__ = 'DB_JNS'
    __tablename__ = '客户信息表'
    id = Column(Integer, primary_key=True, comment="客户ID")
    客户名称 = Column(String(255), nullable=False)
    联系电话 = Column(String(255))
    收货地址 = Column(String(255))
    联系人 = Column(String(50))
    手机 = Column(String(50))
    结算方式 = Column(String(50))
    是否含税 = Column(Boolean)
    对账时间 = Column(String(50))
    开票时间 = Column(String(50))
    结算周期 = Column(String(50))
    业务负责人 = Column(String(50))
    送货单版本 = Column(String(50))
    备注 = Column(String(50))
    状态 = Column(String(50), default='活跃')
    简称 = Column(String(50))
    create_at = Column(DateTime, default=datetime.datetime.now, comment='创建时间')
    update_at = Column(DateTime, default=datetime.datetime.now, comment='更新时间')
