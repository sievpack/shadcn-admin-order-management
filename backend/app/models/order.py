import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Numeric, Computed
from app.db.database import Base


class Order(Base):
    """订单详情表"""
    __tablename__ = '订单表'
    __bind_key__ = 'DB_JNS'
    
    id = Column(Integer, primary_key=True, comment="订单分项ID")
    oid = Column(Integer, ForeignKey('订单列表.id'), nullable=False, comment='Order ID')
    订单编号 = Column(String(50), nullable=False)
    合同编号 = Column(String(50), nullable=False)
    订单日期 = Column(Date, nullable=False)
    交货日期 = Column(Date, nullable=False)
    规格 = Column(String(50), nullable=False)
    产品类型 = Column(String(50), nullable=False)
    型号 = Column(String(50), nullable=False)
    数量 = Column(Integer, nullable=False)
    单位 = Column(String(10), nullable=False)
    销售单价 = Column(Numeric(10, 2), nullable=False)
    金额 = Column(Numeric(10, 2), Computed('数量 * 销售单价'))
    备注 = Column(String(255))
    客户名称 = Column(String(50), nullable=False)
    结算方式 = Column(String(50))
    发货单号 = Column(String(50))
    快递单号 = Column(String(50))
    客户物料编号 = Column(String(50))
    外购 = Column(Boolean, nullable=False, default=False)
    采购单号 = Column(String(50))
    ship_id = Column(Integer, ForeignKey('发货表.id'), comment='发货表ID')
    # 发货日期 = Column(DateTime, comment='发货日期')
    # 付款状态 = Column(Integer, default=0, comment='付款状态: 0=未付款, 1=已付款')


class OrderList(Base):
    """订单列表"""
    __tablename__ = '订单列表'
    __bind_key__ = 'DB_JNS'

    id = Column(Integer, primary_key=True, comment="订单项目ID")
    订单编号 = Column(String(255), nullable=False, comment='订单编号')
    订单日期 = Column(Date, nullable=False, default=datetime.datetime.now, comment='订单时间')
    交货日期 = Column(Date, nullable=False, comment='交货时间')
    客户名称 = Column(String(50), nullable=False)
    status =Column(Integer, default=0, comment='订单状态: 0=未发货, 1=部分发货, 2=已发货')
    created_at = Column(DateTime, nullable=False, default=datetime.datetime.now, comment='创建时间')
