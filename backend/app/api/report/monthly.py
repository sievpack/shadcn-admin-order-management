from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import datetime

from app.db.database import get_db_jns
from app.models.order import Order, OrderList
from app.models.ship import Ship
from app.models.user import User
from app.api.auth import get_current_active_user


router = APIRouter()


@router.get("/monthly", response_model=dict)
async def get_monthly_report(
    year: int = Query(None, description="年份，默认当前年份"),
    month: int = Query(None, description="月份，默认当前月份"),
    customer: Optional[str] = Query(None, description="客户名称，默认全部客户"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取月度统计报表数据"""
    try:
        now = datetime.datetime.now()
        if not year:
            year = now.year
        if not month:
            month = now.month
        
        month_start = datetime.datetime(year, month, 1, 0, 0, 0, 0)
        if month == 12:
            month_end = datetime.datetime(year + 1, 1, 1, 0, 0, 0, 0)
        else:
            month_end = datetime.datetime(year, month + 1, 1, 0, 0, 0, 0)
        
        order_filters = []
        ship_filters = []
        
        if customer and customer != "all":
            order_filters.append(OrderList.客户名称 == customer)
            ship_filters.append(OrderList.客户名称 == customer)
        
        daily_order_stats = []
        
        current_day = month_start
        while current_day < month_end:
            day_start = current_day
            day_end = day_start + datetime.timedelta(days=1)
            
            day_order_count = db.query(func.count(func.distinct(Order.oid))).outerjoin(
                OrderList, Order.oid == OrderList.id
            ).filter(
                OrderList.订单日期 >= day_start,
                OrderList.订单日期 < day_end,
                *order_filters
            ).scalar() or 0
            
            day_order_amount = db.query(func.sum(Order.金额)).outerjoin(
                OrderList, Order.oid == OrderList.id
            ).filter(
                OrderList.订单日期 >= day_start,
                OrderList.订单日期 < day_end,
                *order_filters
            ).scalar() or 0
            
            daily_order_stats.append({
                "date": current_day.strftime("%Y-%m-%d"),
                "order_count": day_order_count,
                "order_amount": round(day_order_amount, 2)
            })
            
            current_day += datetime.timedelta(days=1)
        
        total_order_count = db.query(func.count(func.distinct(Order.oid))).outerjoin(
            OrderList, Order.oid == OrderList.id
        ).filter(
            OrderList.订单日期 >= month_start,
            OrderList.订单日期 < month_end,
            *order_filters
        ).scalar() or 0
        
        total_order_amount = db.query(func.sum(Order.金额)).outerjoin(
            OrderList, Order.oid == OrderList.id
        ).filter(
            OrderList.订单日期 >= month_start,
            OrderList.订单日期 < month_end,
            *order_filters
        ).scalar() or 0
        
        total_ship_amount = db.query(func.sum(Order.金额)).outerjoin(
            Ship, Order.ship_id == Ship.id
        ).outerjoin(
            OrderList, Order.oid == OrderList.id
        ).filter(
            Ship.发货日期 >= month_start,
            Ship.发货日期 < month_end,
            *ship_filters
        ).scalar() or 0
        
        total_spec_count = db.query(func.count(Order.id)).outerjoin(
            OrderList, Order.oid == OrderList.id
        ).filter(
            OrderList.订单日期 >= month_start,
            OrderList.订单日期 < month_end,
            *order_filters
        ).scalar() or 0
        
        jiebodai_count = db.query(func.count(Order.id)).outerjoin(
            OrderList, Order.oid == OrderList.id
        ).filter(
            OrderList.订单日期 >= month_start,
            OrderList.订单日期 < month_end,
            Order.规格.like('%接驳%'),
            *order_filters
        ).scalar() or 0
        
        kaikoudai_count = db.query(func.count(Order.id)).outerjoin(
            OrderList, Order.oid == OrderList.id
        ).filter(
            OrderList.订单日期 >= month_start,
            OrderList.订单日期 < month_end,
            Order.规格.like('%开口%'),
            *order_filters
        ).scalar() or 0
        
        jiebodai_percentage = round((jiebodai_count / total_spec_count * 100), 2) if total_spec_count > 0 else 0
        kaikoudai_percentage = round((kaikoudai_count / total_spec_count * 100), 2) if total_spec_count > 0 else 0
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "daily_stats": daily_order_stats,
                "summary": {
                    "total_order_count": total_order_count,
                    "total_order_amount": round(total_order_amount, 2),
                    "total_ship_amount": round(total_ship_amount, 2),
                    "jiebodai_percentage": jiebodai_percentage,
                    "kaikoudai_percentage": kaikoudai_percentage
                },
                "year": year,
                "month": month
            }
        }
    except Exception as e:
        print(f"获取月度统计报表数据失败: {e}")
        return {
            "code": 1,
            "msg": f"获取月度统计报表数据失败: {str(e)}",
            "data": {
                "daily_stats": [],
                "summary": {
                    "total_order_count": 0,
                    "total_order_amount": 0,
                    "total_ship_amount": 0,
                    "jiebodai_percentage": 0,
                    "kaikoudai_percentage": 0
                },
                "year": year or datetime.datetime.now().year,
                "month": month or datetime.datetime.now().month
            }
        }
