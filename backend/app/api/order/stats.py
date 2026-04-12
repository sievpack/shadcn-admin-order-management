import logging
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.core.response import success_response, error_response

logger = logging.getLogger(__name__)
from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.order_service import order_stats_service

router = APIRouter()


@router.get("/sales-stats")
async def get_sales_stats(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取销售统计数据"""
    try:
        data = order_stats_service.get_sales_stats(db)
        return success_response(data=data)
    except Exception as e:
        logger.error(f"获取销售统计数据失败: {e}")
        import traceback
        traceback.print_exc()
        return error_response(msg=f"获取销售统计数据失败: {str(e)}")


@router.get("/recent-orders")
async def get_recent_orders(
    limit: int = Query(5, description="获取最近订单数量"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取最新的订单信息"""
    try:
        orders = order_stats_service.get_recent_orders(db, limit)
        return success_response(data=orders)
    except Exception as e:
        logger.error(f"获取最新订单失败: {e}")
        import traceback
        traceback.print_exc()
        return error_response(msg=f"获取最新订单失败: {str(e)}")


@router.get("/sales-trend")
async def get_sales_trend(
    period: str = Query("week", description="时间范围: year/month/week"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取销售趋势数据"""
    try:
        data = order_stats_service.get_sales_trend(db, period)
        return success_response(data=data)
    except Exception as e:
        logger.error(f"获取销售趋势数据失败: {e}")
        import traceback
        traceback.print_exc()
        return error_response(msg=f"获取销售趋势数据失败: {str(e)}")