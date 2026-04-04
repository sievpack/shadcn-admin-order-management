import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean
from app.db.database import Base


class Ship(Base):
    """发货表"""
    __tablename__ = '发货表'
    __bind_key__ = 'DB_JNS'
    
    id = Column(Integer, primary_key=True, comment="订单分项ID")
    发货日期 = Column(DateTime, nullable=False, default=datetime.datetime.now, comment='发货日期')
    代收货款 = Column(Float, comment='代收货款')
    备注 = Column(String(255), comment='备注')
    快递单号 = Column(String(50), nullable=False, comment='快递单号')
    快递费用 = Column(Float, comment='快递费用')
    快递费用支付 = Column(String(50), comment='快递费用支付')
    快递公司 = Column(String(50), comment='快递公司')
    客户名称 = Column(String(50), nullable=False, comment='客户名称')
