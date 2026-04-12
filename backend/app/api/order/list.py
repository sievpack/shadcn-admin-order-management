import logging
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.core.response import success_response, error_response
from app.services.order_service import order_list_service, order_service, generate_order_number
from app.schemas.common import APIResponse, PageResult

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/data")
async def get_orders(
    page: int = 1,
    page_size: int = 10,
    limit: int = 10,
    query: Optional[str] = None,
    items: bool = False,
    id: Optional[int] = None,
    发货状态: Optional[str] = Query(None, description="pending:未发货, partial:部分发货, shipped:已发货，多个用逗号分隔"),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取订单列表"""
    try:
        if items or query == "items":
            start = datetime.strptime(start_date, '%Y-%m-%d').date() if start_date else None
            end = datetime.strptime(end_date, '%Y-%m-%d').date() if end_date else None

            # 转换发货状态为整数
            ship_status = None
            if 发货状态 is not None:
                try:
                    ship_status = int(发货状态)
                except (ValueError, TypeError):
                    pass

            results, total = order_list_service.get_with_items(
                db, query=query, 发货状态=ship_status,
                start_date=start, end_date=end,
                page=page, limit=limit if limit > 0 else page_size
            )

            data = [{
                'id': order.id,
                '规格': order.规格,
                '产品类型': order.产品类型,
                '型号': order.型号,
                '数量': order.数量,
                '单位': order.单位,
                '销售单价': float(order.销售单价) if order.销售单价 else 0,
                '金额': float(order.金额) if order.金额 else 0,
                '发货单号': order.发货单号,
                '合同编号': order.合同编号,
                '备注': order.备注,
                '外购': order.外购,
                '快递单号': order.快递单号,
                '客户物料编号': order.客户物料编号,
                'ship_id': order.ship_id,
                '订单编号': order_list.订单编号 if order_list else None,
                '交货日期': order_list.交货日期.strftime('%Y-%m-%d') if order_list and order_list.交货日期 else None,
                '客户名称': order_list.客户名称 if order_list else None,
            } for order, order_list in results]

            return success_response(data=data, count=total)

        start = datetime.strptime(start_date, '%Y-%m-%d').date() if start_date else None
        end = datetime.strptime(end_date, '%Y-%m-%d').date() if end_date else None

        orders, total = order_list_service.search(
            db, query=query, 发货状态=发货状态,
            start_date=start, end_date=end,
            page=page, page_size=limit if limit > 0 else page_size
        )

        def map_status(s: int) -> str:
            if s == 2:
                return 'shipped'
            elif s == 1:
                return 'partial'
            return 'pending'

        return success_response(data=[
            {
                "id": item.id,
                "订单编号": item.订单编号,
                "客户名称": item.客户名称,
                "订单日期": item.订单日期.strftime('%Y-%m-%d') if item.订单日期 else None,
                "交货日期": item.交货日期.strftime('%Y-%m-%d') if item.交货日期 else None,
                "发货状态": map_status(item.status)
            }
            for item in orders
        ], count=total)
    except Exception as e:
        logger.error(f"获取订单列表失败: {e}")
        return error_response(msg=f"获取失败: {str(e)}")


@router.get("/all")
async def get_all_orders(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有订单"""
    try:
        orders = order_list_service.get_all(db)
        return success_response(data=[
            {
                "id": order.id,
                "订单编号": order.订单编号,
                "客户名称": order.客户名称,
                "订单日期": order.订单日期.strftime('%Y-%m-%d') if order.订单日期 else None,
                "交货日期": order.交货日期.strftime('%Y-%m-%d') if order.交货日期 else None,
                "status": order.status
            }
            for order in orders
        ])
    except Exception as e:
        logger.error(f"获取所有订单失败: {e}")
        return error_response(msg=f"获取失败: {str(e)}")


@router.post("/create")
async def create_order(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """创建订单"""
    order, error = order_list_service.create(db, data)
    if error:
        return error_response(msg=error)
    return success_response(data={"id": order.id}, msg="创建成功")


@router.put("/update")
async def update_order(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """更新订单"""
    order_id = data.get('id')
    if not order_id:
        return error_response(msg="缺少订单ID")

    order, error = order_list_service.update_order(db, order_id, data)
    if error:
        return error_response(msg=error)
    return success_response(data={
        "id": order.id,
        "订单编号": order.订单编号,
        "客户名称": order.客户名称,
        "订单日期": order.订单日期.strftime('%Y-%m-%d') if order.订单日期 else None,
        "交货日期": order.交货日期.strftime('%Y-%m-%d') if order.交货日期 else None,
        "status": order.status
    }, msg="更新成功")


@router.delete("/delete/{id}")
async def delete_order(
    id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除订单"""
    order = order_list_service.get(db, id)
    if not order:
        return error_response(msg="订单不存在")

    order_list_service.delete(db, id)
    return success_response(msg="删除成功")


@router.get("/generate-id")
async def generate_order_id(
    current_user: User = Depends(get_current_active_user)
):
    """生成订单编号"""
    return success_response(data={"order_number": generate_order_number()})


@router.post("/mark-shipped")
async def mark_as_shipped(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """标记发货（单个或批量）"""
    order_ids = data.get('ids', [])
    if not isinstance(order_ids, list):
        order_ids = [order_ids] if order_ids else []

    updated, error, notification_msg = order_list_service.mark_shipped(
        db,
        order_ids=order_ids,
        发货单号=data.get('发货单号'),
        快递单号=data.get('快递单号'),
        快递公司=data.get('快递公司', '')
    )

    if error:
        return error_response(msg=error)

    if notification_msg:
        from app.services.notification_service import get_notification_manager
        manager = get_notification_manager()
        notification_msg["payload"]["user_id"] = current_user.id
        await manager.broadcast(notification_msg)

    return success_response(data={"updated": updated}, msg=f"成功标记 {updated} 条订单为已发货")