from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


# ==================== 生产计划 Schema ====================
class ProductionPlanBase(BaseModel):
    """生产计划基础模型"""
    计划编号: str
    计划名称: str
    关联订单: Optional[str] = None
    产品类型: str
    产品型号: str
    规格: Optional[str] = None
    计划数量: int
    已排数量: Optional[int] = 0
    单位: str
    计划开始日期: date
    计划完成日期: date
    实际开始日期: Optional[date] = None
    实际完成日期: Optional[date] = None
    优先级: Optional[str] = '普通'
    计划状态: Optional[str] = '待审核'
    负责人: Optional[str] = None
    备注: Optional[str] = None


class ProductionPlanCreate(ProductionPlanBase):
    """创建生产计划"""
    pass


class ProductionPlanUpdate(BaseModel):
    """更新生产计划"""
    计划编号: Optional[str] = None
    计划名称: Optional[str] = None
    关联订单: Optional[str] = None
    产品类型: Optional[str] = None
    产品型号: Optional[str] = None
    规格: Optional[str] = None
    计划数量: Optional[int] = None
    已排数量: Optional[int] = None
    单位: Optional[str] = None
    计划开始日期: Optional[date] = None
    计划完成日期: Optional[date] = None
    实际开始日期: Optional[date] = None
    实际完成日期: Optional[date] = None
    优先级: Optional[str] = None
    计划状态: Optional[str] = None
    负责人: Optional[str] = None
    备注: Optional[str] = None


class ProductionPlanResponse(ProductionPlanBase):
    """生产计划响应"""
    id: int
    create_at: Optional[datetime] = None
    update_at: Optional[datetime] = None
    create_by: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== 生产工单 Schema ====================
class ProductionOrderBase(BaseModel):
    """生产工单基础模型"""
    工单编号: str
    计划编号: Optional[str] = None
    产品类型: str
    产品型号: str
    规格: Optional[str] = None
    工单数量: int
    已完成数量: Optional[int] = 0
    单位: str
    产线: Optional[str] = None
    工单状态: Optional[str] = '待生产'
    计划开始: date
    计划结束: date
    实际开始: Optional[datetime] = None
    实际结束: Optional[datetime] = None
    工序: Optional[str] = '1'
    总工序: Optional[str] = '1'
    报工备注: Optional[str] = None


class ProductionOrderCreate(ProductionOrderBase):
    """创建生产工单"""
    pass


class ProductionOrderUpdate(BaseModel):
    """更新生产工单"""
    工单编号: Optional[str] = None
    计划编号: Optional[str] = None
    产品类型: Optional[str] = None
    产品型号: Optional[str] = None
    规格: Optional[str] = None
    工单数量: Optional[int] = None
    已完成数量: Optional[int] = None
    单位: Optional[str] = None
    产线: Optional[str] = None
    工单状态: Optional[str] = None
    计划开始: Optional[date] = None
    计划结束: Optional[date] = None
    实际开始: Optional[datetime] = None
    实际结束: Optional[datetime] = None
    工序: Optional[str] = None
    总工序: Optional[str] = None
    报工备注: Optional[str] = None


class ProductionOrderResponse(ProductionOrderBase):
    """生产工单响应"""
    id: int
    create_at: Optional[datetime] = None
    update_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== 报工记录 Schema ====================
class ProductionReportBase(BaseModel):
    """报工记录基础模型"""
    工单编号: str
    报工编号: str
    报工日期: Optional[datetime] = None
    报工数量: int
    合格数量: int
    不良数量: Optional[int] = 0
    不良原因: Optional[str] = None
    工序: Optional[str] = None
    报工人: str
    检验员: Optional[str] = None
    备注: Optional[str] = None


class ProductionReportCreate(ProductionReportBase):
    """创建报工记录"""
    pass


class ProductionReportUpdate(BaseModel):
    """更新报工记录"""
    报工数量: Optional[int] = None
    合格数量: Optional[int] = None
    不良数量: Optional[int] = None
    不良原因: Optional[str] = None
    工序: Optional[str] = None
    报工人: Optional[str] = None
    检验员: Optional[str] = None
    备注: Optional[str] = None


class ProductionReportResponse(ProductionReportBase):
    """报工记录响应"""
    id: int
    create_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== 物料消耗 Schema ====================
class MaterialConsumptionBase(BaseModel):
    """物料消耗基础模型"""
    工单编号: str
    物料编码: str
    物料名称: str
    规格型号: Optional[str] = None
    消耗数量: float
    单位: Optional[str] = None
    领料人: Optional[str] = None
    领料日期: Optional[datetime] = None
    备注: Optional[str] = None


class MaterialConsumptionCreate(MaterialConsumptionBase):
    """创建物料消耗"""
    pass


class MaterialConsumptionUpdate(BaseModel):
    """更新物料消耗"""
    物料编码: Optional[str] = None
    物料名称: Optional[str] = None
    规格型号: Optional[str] = None
    消耗数量: Optional[float] = None
    单位: Optional[str] = None
    领料人: Optional[str] = None
    领料日期: Optional[datetime] = None
    备注: Optional[str] = None


class MaterialConsumptionResponse(MaterialConsumptionBase):
    """物料消耗响应"""
    id: int
    create_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== 质检记录 Schema ====================
class QualityInspectionBase(BaseModel):
    """质检记录基础模型"""
    质检单号: str
    关联报工: Optional[str] = None
    工单编号: str
    产品类型: str
    产品型号: str
    批次号: Optional[str] = None
    送检数量: int
    合格数量: int
    不良数量: Optional[int] = 0
    质检结果: str
    不良分类: Optional[str] = None
    不良描述: Optional[str] = None
    质检员: str
    质检日期: Optional[datetime] = None
    备注: Optional[str] = None


class QualityInspectionCreate(QualityInspectionBase):
    """创建质检记录"""
    pass


class QualityInspectionUpdate(BaseModel):
    """更新质检记录"""
    送检数量: Optional[int] = None
    合格数量: Optional[int] = None
    不良数量: Optional[int] = None
    质检结果: Optional[str] = None
    不良分类: Optional[str] = None
    不良描述: Optional[str] = None
    质检员: Optional[str] = None
    备注: Optional[str] = None


class QualityInspectionResponse(QualityInspectionBase):
    """质检记录响应"""
    id: int
    create_at: Optional[datetime] = None
    update_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== 成品入库 Schema ====================
class ProductInboundBase(BaseModel):
    """成品入库基础模型"""
    入库单号: str
    质检单号: Optional[str] = None
    工单编号: str
    产品类型: str
    产品型号: str
    规格: Optional[str] = None
    入库数量: int
    单位: str
    批次号: Optional[str] = None
    仓库: Optional[str] = '成品仓'
    库位: Optional[str] = None
    入库类型: Optional[str] = '生产入库'
    入库状态: Optional[str] = '已入库'
    入库日期: Optional[datetime] = None
    入库员: str
    收货人: Optional[str] = None
    关联订单: Optional[str] = None
    备注: Optional[str] = None


class ProductInboundCreate(ProductInboundBase):
    """创建成品入库"""
    pass


class ProductInboundUpdate(BaseModel):
    """更新成品入库"""
    质检单号: Optional[str] = None
    工单编号: Optional[str] = None
    产品类型: Optional[str] = None
    产品型号: Optional[str] = None
    规格: Optional[str] = None
    入库数量: Optional[int] = None
    单位: Optional[str] = None
    批次号: Optional[str] = None
    仓库: Optional[str] = None
    库位: Optional[str] = None
    入库类型: Optional[str] = None
    入库状态: Optional[str] = None
    入库日期: Optional[datetime] = None
    入库员: Optional[str] = None
    收货人: Optional[str] = None
    关联订单: Optional[str] = None
    备注: Optional[str] = None


class ProductInboundResponse(ProductInboundBase):
    """成品入库响应"""
    id: int
    create_at: Optional[datetime] = None
    update_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== 统计 Schema ====================
class ProductionStatsResponse(BaseModel):
    """生产统计响应"""
    产品类型: Optional[str] = None
    产品型号: Optional[str] = None
    月份: Optional[str] = None
    计划数量: Optional[int] = 0
    完成数量: Optional[int] = 0
    完成率: Optional[float] = 0.0


class LineStatsResponse(BaseModel):
    """产线统计响应"""
    产线: Optional[str] = None
    工单数量: Optional[int] = 0
    完成数量: Optional[int] = 0
    完成率: Optional[float] = 0.0


class QcStatsResponse(BaseModel):
    """质检统计响应"""
    月份: Optional[str] = None
    送检数量: Optional[int] = 0
    合格数量: Optional[int] = 0
    不良数量: Optional[int] = 0
    合格率: Optional[float] = 0.0
