from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class OrderBase(BaseModel):
    """订单基础模型"""
    合同编号: str
    规格: str
    产品类型: str
    型号: str
    数量: int
    单位: str
    销售单价: float
    备注: Optional[str] = None
    结算方式: Optional[str] = None
    发货单号: Optional[str] = None
    快递单号: Optional[str] = None
    客户物料编号: Optional[str] = None
    外购: Optional[bool] = None
    采购单号: Optional[str] = None
    ship_id: Optional[int] = None


class OrderCreate(OrderBase):
    """创建订单模型"""
    oid: int


class OrderUpdate(BaseModel):
    """更新订单模型"""
    合同编号: Optional[str] = None
    规格: Optional[str] = None
    产品类型: Optional[str] = None
    型号: Optional[str] = None
    数量: Optional[int] = None
    单位: Optional[str] = None
    销售单价: Optional[float] = None
    备注: Optional[str] = None
    结算方式: Optional[str] = None
    发货单号: Optional[str] = None
    快递单号: Optional[str] = None
    客户物料编号: Optional[str] = None
    外购: Optional[bool] = None
    采购单号: Optional[str] = None
    ship_id: Optional[int] = None


class OrderResponse(OrderBase):
    """订单响应模型"""
    id: int
    oid: int
    订单编号: Optional[str] = None
    订单日期: Optional[str] = None
    交货日期: Optional[str] = None
    客户名称: Optional[str] = None

    class Config:
        from_attributes = True


class OrderListBase(BaseModel):
    """订单列表基础模型"""
    订单编号: str
    订单日期: datetime
    交货日期: datetime
    客户名称: str
    status: Optional[bool] = False


class OrderListCreate(OrderListBase):
    """创建订单列表模型"""
    pass


class OrderListUpdate(BaseModel):
    """更新订单列表模型"""
    订单编号: Optional[str] = None
    订单日期: Optional[datetime] = None
    交货日期: Optional[datetime] = None
    客户名称: Optional[str] = None
    status: Optional[bool] = None


class OrderListResponse(OrderListBase):
    """订单列表响应模型"""
    id: int

    class Config:
        from_attributes = True


class OrderQuery(BaseModel):
    """订单查询参数"""
    客户名称: Optional[str] = None
    型号: Optional[str] = None
    规格: Optional[str] = None
    合同编号: Optional[str] = None
    发货状态: Optional[int] = 2  # 0:未发货, 1:已发货, 2:全部
    page: int = 1
    limit: int = 10