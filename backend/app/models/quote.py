import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import column_property
from app.db.database import Base


class Quote(Base):
    __tablename__ = '报价表'
    __bind_key__ = 'DB_JNS'
    id = Column(Integer, primary_key=True, comment="订单分项ID")
    客户名称 = Column(String(255), nullable=False)
    报价项目 = Column(String(255), nullable=False)
    报价单号 = Column(String(50), nullable=False)
    报价日期 = Column(DateTime, default=datetime.datetime.now, nullable=False)
    客户物料编码 = Column(String(50))
    客户物料名称 = Column(String(50))
    客户规格型号 = Column(String(255))
    嘉尼索规格 = Column(String(255), nullable=False)
    嘉尼索型号 = Column(String(255), nullable=False)
    单位 = Column(String(50))
    数量 = Column(Integer)
    未税单价 = Column(Float)
    含税单价 = Column(Float, nullable=False)
    含税总价 = column_property(数量 * 含税单价)
    备注 = Column(String(255))
