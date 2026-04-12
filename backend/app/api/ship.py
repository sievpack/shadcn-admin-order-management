import logging
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.core.response import success_response, error_response
from app.services.ship_service import ship_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.delete("/shipping/delete")
async def delete_shipping(
    发货单号: str = Query(..., description="发货单号"),
    快递单号: str = Query(..., description="快递单号"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除发货单号"""
    try:
        updated, error = ship_service.delete_shipping(db, 发货单号, 快递单号)
        if error:
            return error_response(msg=error)
        return success_response(data={"updated": updated})
    except Exception as e:
        db.rollback()
        return error_response(msg=f"删除失败: {str(e)}")


@router.delete("/shipping/delete-item")
async def delete_shipping_item(
    order_id: int = Query(..., description="订单ID"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除单个发货项目"""
    try:
        updated, error = ship_service.delete_shipping_item(db, order_id)
        if error:
            return error_response(msg=error)
        if updated == 0:
            return error_response(msg="未找到该订单记录")
        return success_response(data={"updated": updated})
    except Exception as e:
        db.rollback()
        return error_response(msg=f"删除失败: {str(e)}")


@router.get("/shipping/detail")
async def get_shipping_detail(
    发货单号: str = Query(..., description="发货单号"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取发货单详情"""
    try:
        shipping_info, error = ship_service.get_shipping_detail(db, 发货单号)
        if error:
            return error_response(msg=error)
        return success_response(data=shipping_info)
    except Exception as e:
        return error_response(msg=f"获取失败: {str(e)}")


@router.get("/shipping/list")
async def get_shipping_list(
    query: Optional[str] = Query(None, description="通用搜索"),
    发货单号: Optional[str] = None,
    客户名称: Optional[str] = None,
    快递单号: Optional[str] = None,
    快递公司: Optional[str] = None,
    开始日期: Optional[str] = None,
    结束日期: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    all: bool = Query(False, description="是否返回所有数据"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取发货列表"""
    try:
        if all:
            items, total = ship_service.search(
                db, query=query, 发货单号=发货单号, 客户名称=客户名称,
                快递单号=快递单号, 快递公司=快递公司,
                开始日期=开始日期, 结束日期=结束日期,
                page=1, page_size=100000
            )
        else:
            items, total = ship_service.search(
                db, query=query, 发货单号=发货单号, 客户名称=客户名称,
                快递单号=快递单号, 快递公司=快递公司,
                开始日期=开始日期, 结束日期=结束日期,
                page=page, page_size=limit
            )

        shipping_list = [{
            'id': item.id,
            '发货单号': item.发货单号,
            '快递单号': item.快递单号,
            '快递公司': item.快递公司,
            '客户名称': item.客户名称,
            '发货日期': item.发货日期.strftime('%Y-%m-%d') if item.发货日期 else None
        } for item in items]

        return success_response(data=shipping_list, count=total)
    except Exception as e:
        return error_response(msg=f"获取失败: {str(e)}")


@router.post("/shipping/create")
async def create_shipping(
    request: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """创建发货单"""
    try:
        ship, error = ship_service.create_shipping(
            db,
            发货单号=request.get("发货单号"),
            快递单号=request.get("快递单号"),
            订单项目=request.get("订单项目", []),
            快递公司=request.get("快递公司"),
            客户名称=request.get("客户名称"),
            发货日期=request.get("发货日期"),
            快递费用=request.get("快递费用", 0),
            备注=request.get("备注")
        )
        if error:
            return error_response(msg=error)
        return success_response(data={"ship_id": ship.id})
    except Exception as e:
        db.rollback()
        return error_response(msg=f"创建失败: {str(e)}")


@router.post("/shipping/add-items")
async def add_shipping_items(
    request: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """为已存在的发货单添加分项"""
    try:
        发货单号 = request.get("发货单号")
        快递单号 = request.get("快递单号")
        订单项目 = request.get("订单项目", [])

        if not 发货单号 or not 快递单号:
            return error_response(msg="缺少发货单号或快递单号")

        updated, error = ship_service.add_shipping_items(
            db,
            发货单号=发货单号,
            快递单号=快递单号,
            订单项目=订单项目
        )

        if error:
            return error_response(msg=error)

        return success_response(data={"updated": updated}, msg=f"成功添加 {updated} 个分项")
    except Exception as e:
        db.rollback()
        return error_response(msg=f"添加失败: {str(e)}")


@router.put("/shipping/update-date")
async def update_shipping_date(
    request: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """更新发货日期"""
    try:
        发货单号 = request.get("发货单号")
        发货日期 = request.get("发货日期")

        if not 发货单号 or not 发货日期:
            return error_response(msg="缺少发货单号或发货日期")

        success, error = ship_service.update_shipping_date(db, 发货单号, 发货日期)

        if not success:
            return error_response(msg=error)

        return success_response(msg="更新成功")
    except Exception as e:
        db.rollback()
        return error_response(msg=f"更新失败: {str(e)}")


@router.put("/shipping/update")
async def update_shipping(
    request: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """更新发货单"""
    try:
        发货单号 = request.get("发货单号")
        快递单号 = request.get("快递单号")
        快递公司 = request.get("快递公司")
        发货日期 = request.get("发货日期")
        快递费用 = request.get("快递费用", 0)
        备注 = request.get("备注")

        if not 发货单号 or not 快递单号:
            return error_response(msg="缺少发货单号或快递单号")

        success, error = ship_service.update_shipping(
            db, 发货单号, 快递单号, 快递公司, 发货日期, 快递费用, 备注
        )

        if not success:
            return error_response(msg=error)

        return success_response(msg="更新成功")
    except Exception as e:
        db.rollback()
        return error_response(msg=f"更新失败: {str(e)}")