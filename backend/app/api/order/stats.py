from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
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
        return {"code": 0, "msg": "success", "data": data}
    except Exception as e:
        print(f"获取销售统计数据失败: {e}")
        import traceback
        traceback.print_exc()
        return {"code": 1, "msg": f"获取销售统计数据失败: {str(e)}", "data": {
            "today_order_amount": 0,
            "yesterday_order_amount": 0,
            "today_shipped_amount": 0,
            "yesterday_shipped_amount": 0,
            "this_month_order_amount": 0,
            "last_month_order_amount": 0,
            "this_month_shipped_amount": 0,
            "last_month_shipped_amount": 0,
            "this_month_outsource_order_amount": 0,
            "last_month_outsource_order_amount": 0,
            "this_month_outsource_shipped_amount": 0,
            "last_month_outsource_shipped_amount": 0,
            "year_order_amount": 0,
            "year_shipped_amount": 0,
            "unshipped_amount": 0
        }}


@router.get("/recent-orders")
async def get_recent_orders(
    limit: int = Query(5, description="获取最近订单数量"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取最新的订单信息"""
    try:
        orders = order_stats_service.get_recent_orders(db, limit)
        return {"code": 0, "msg": "success", "data": orders}
    except Exception as e:
        print(f"获取最新订单失败: {e}")
        import traceback
        traceback.print_exc()
        return {"code": 1, "msg": f"获取最新订单失败: {str(e)}", "data": []}


@router.get("/sales-trend")
async def get_sales_trend(
    period: str = Query("week", description="时间范围: year/month/week"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取销售趋势数据"""
    try:
        data = order_stats_service.get_sales_trend(db, period)
        return {"code": 0, "msg": "success", "data": data}
    except Exception as e:
        print(f"获取销售趋势数据失败: {e}")
        import traceback
        traceback.print_exc()
        return {"code": 1, "msg": f"获取销售趋势数据失败: {str(e)}", "data": []}