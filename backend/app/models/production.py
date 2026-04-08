import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Numeric
from app.db.database import Base


class ProductionPlan(Base):
    """生产计划表"""
    __tablename__ = '生产计划表'
    __bind_key__ = 'DB_JNS'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    计划编号 = Column(String(50), unique=True, nullable=False)
    计划名称 = Column(String(100), nullable=False)
    关联订单 = Column(String(50))
    产品类型 = Column(String(50), nullable=False)
    产品型号 = Column(String(50), nullable=False)
    规格 = Column(String(50))
    计划数量 = Column(Integer, nullable=False)
    已排数量 = Column(Integer, default=0)
    单位 = Column(String(10), nullable=False)
    计划开始日期 = Column(Date, nullable=False)
    计划完成日期 = Column(Date, nullable=False)
    实际开始日期 = Column(Date)
    实际完成日期 = Column(Date)
    优先级 = Column(String(20), default='普通')
    计划状态 = Column(String(20), default='待审核')
    负责人 = Column(String(50))
    备注 = Column(String(255))
    create_at = Column(DateTime, default=datetime.datetime.now)
    update_at = Column(DateTime, default=datetime.datetime.now)
    create_by = Column(String(50))


class ProductionOrder(Base):
    """生产工单表"""
    __tablename__ = '生产工单表'
    __bind_key__ = 'DB_JNS'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    工单编号 = Column(String(50), unique=True, nullable=False)
    计划编号 = Column(String(50), ForeignKey('生产计划表.计划编号'))
    产品类型 = Column(String(50), nullable=False)
    产品型号 = Column(String(50), nullable=False)
    规格 = Column(String(50))
    工单数量 = Column(Integer, nullable=False)
    已完成数量 = Column(Integer, default=0)
    单位 = Column(String(10), nullable=False)
    产线 = Column(String(50))
    工单状态 = Column(String(20), default='待生产')
    计划开始 = Column(Date, nullable=False)
    计划结束 = Column(Date, nullable=False)
    实际开始 = Column(DateTime)
    实际结束 = Column(DateTime)
    工序 = Column(String(20), default='1')
    总工序 = Column(String(20), default='1')
    报工备注 = Column(String(255))
    create_at = Column(DateTime, default=datetime.datetime.now)
    update_at = Column(DateTime, default=datetime.datetime.now)


class ProductionReport(Base):
    """生产报工记录表"""
    __tablename__ = '生产报工记录表'
    __bind_key__ = 'DB_JNS'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    工单编号 = Column(String(50), ForeignKey('生产工单表.工单编号'))
    报工编号 = Column(String(50), unique=True, nullable=False)
    报工日期 = Column(DateTime, nullable=False, default=datetime.datetime.now)
    报工数量 = Column(Integer, nullable=False)
    合格数量 = Column(Integer, nullable=False)
    不良数量 = Column(Integer, default=0)
    不良原因 = Column(String(255))
    工序 = Column(String(20))
    报工人 = Column(String(50), nullable=False)
    检验员 = Column(String(50))
    备注 = Column(String(255))
    create_at = Column(DateTime, default=datetime.datetime.now)


class MaterialConsumption(Base):
    """物料消耗表"""
    __tablename__ = '物料消耗表'
    __bind_key__ = 'DB_JNS'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    工单编号 = Column(String(50), ForeignKey('生产工单表.工单编号'))
    物料编码 = Column(String(50), nullable=False)
    物料名称 = Column(String(100), nullable=False)
    规格型号 = Column(String(100))
    消耗数量 = Column(Numeric(10, 2), nullable=False)
    单位 = Column(String(10))
    领料人 = Column(String(50))
    领料日期 = Column(DateTime)
    备注 = Column(String(255))
    create_at = Column(DateTime, default=datetime.datetime.now)


class QualityInspection(Base):
    """质检记录表"""
    __tablename__ = '质检记录表'
    __bind_key__ = 'DB_JNS'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    质检单号 = Column(String(50), unique=True, nullable=False)
    关联报工 = Column(String(50), ForeignKey('生产报工记录表.报工编号'))
    工单编号 = Column(String(50), ForeignKey('生产工单表.工单编号'))
    产品类型 = Column(String(50), nullable=False)
    产品型号 = Column(String(50), nullable=False)
    批次号 = Column(String(50))
    送检数量 = Column(Integer, nullable=False)
    合格数量 = Column(Integer, nullable=False)
    不良数量 = Column(Integer, default=0)
    质检结果 = Column(String(20), nullable=False)
    不良分类 = Column(String(50))
    不良描述 = Column(String(255))
    质检员 = Column(String(50), nullable=False)
    质检日期 = Column(DateTime, nullable=False, default=datetime.datetime.now)
    备注 = Column(String(255))
    create_at = Column(DateTime, default=datetime.datetime.now)
    update_at = Column(DateTime, default=datetime.datetime.now)


class ProductInbound(Base):
    """成品入库表"""
    __tablename__ = '成品入库表'
    __bind_key__ = 'DB_JNS'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    入库单号 = Column(String(50), unique=True, nullable=False)
    质检单号 = Column(String(50), ForeignKey('质检记录表.质检单号'))
    工单编号 = Column(String(50), ForeignKey('生产工单表.工单编号'))
    产品类型 = Column(String(50), nullable=False)
    产品型号 = Column(String(50), nullable=False)
    规格 = Column(String(50))
    入库数量 = Column(Integer, nullable=False)
    单位 = Column(String(10), nullable=False)
    批次号 = Column(String(50))
    仓库 = Column(String(50), default='成品仓')
    库位 = Column(String(50))
    入库类型 = Column(String(20), default='生产入库')
    入库状态 = Column(String(20), default='已入库')
    入库日期 = Column(DateTime, nullable=False, default=datetime.datetime.now)
    入库员 = Column(String(50), nullable=False)
    收货人 = Column(String(50))
    关联订单 = Column(String(50))
    备注 = Column(String(255))
    create_at = Column(DateTime, default=datetime.datetime.now)
    update_at = Column(DateTime, default=datetime.datetime.now)
