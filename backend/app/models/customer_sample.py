import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.db.database import Base


class CustomerSample(Base):
    """客户样品表"""
    __bind_key__ = 'DB_JNS'
    __tablename__ = '样品表'
    id = Column(Integer, primary_key=True, autoincrement=True)
    客户名称 = Column(String(255), nullable=False)
    样品单号 = Column(String(100), nullable=False)
    下单日期 = Column(String(50))
    需求日期 = Column(String(50))
    规格 = Column(String(100))
    产品类型 = Column(String(50))
    型号 = Column(String(100))
    单位 = Column(String(20))
    数量 = Column(Integer, default=0)
    齿形 = Column(String(100))
    材料 = Column(String(100))
    喷码要求 = Column(String(255))
    备注 = Column(String(500))
    钢丝 = Column(String(100))
    create_at = Column(DateTime, default=datetime.datetime.now)
