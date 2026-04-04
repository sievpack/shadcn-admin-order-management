from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class Quote(Base):
    __tablename__ = '报价表'
    id = Column(Integer, primary_key=True, comment="订单分项ID")
    客户名称 = Column(String(255), nullable=False)
    报价项目 = Column(String(255), nullable=False)
    报价单号 = Column(String(50), nullable=False)
    报价日期 = Column(DateTime, default=func.now, nullable=False)
    客户物料编码 = Column(String(50))
    客户物料名称 = Column(String(50))
    客户规格型号 = Column(String(255))
    嘉尼索规格 = Column(String(255), nullable=False)
    嘉尼索型号 = Column(String(255), nullable=False)
    单位 = Column(String(50))
    数量 = Column(Integer)
    未税单价 = Column(Float)
    含税单价 = Column(Float, nullable=False)
    含税总价 = Column(Float, nullable=False)
    备注 = Column(String(255))
