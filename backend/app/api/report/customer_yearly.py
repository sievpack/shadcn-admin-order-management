from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import datetime

from app.db.database import get_db_jns
from app.models.order import Order, OrderList
from app.models.ship import Ship
from app.models.user import User
from app.api.auth import get_current_active_user


router = APIRouter()


@router.get("/customer-yearly", response_model=dict)
async def get_customer_yearly_report(
    year: int = Query(None, description="年份，默认当前年份"),
    page: int = Query(1, description="页码，默认第1页"),
    limit: int = Query(15, description="每页数量，默认15条"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取客户年度统计报表数据"""
    try:
        if not year:
            year = datetime.datetime.now().year
        
        year_start = datetime.datetime(year, 1, 1, 0, 0, 0, 0)
        year_end = datetime.datetime(year + 1, 1, 1, 0, 0, 0, 0)
        
        from app.models.customer import Customer
        
        customer_mapping = db.query(Customer.客户名称, Customer.简称).filter(
            Customer.状态 != '停用'
        ).all()
        customer_name_to_shortname = {c[0]: c[1] for c in customer_mapping}
        
        all_orders = db.query(
            OrderList.客户名称,
            OrderList.订单日期,
            Order.金额
        ).outerjoin(
            Order, Order.oid == OrderList.id
        ).filter(
            OrderList.订单日期 >= year_start,
            OrderList.订单日期 < year_end
        ).all()
        
        customer_monthly_map = {}
        for customer_name, order_date, amount in all_orders:
            if customer_name not in customer_monthly_map:
                customer_monthly_map[customer_name] = {}
            month_str = str(order_date.month)
            if month_str not in customer_monthly_map[customer_name]:
                customer_monthly_map[customer_name][month_str] = 0
            if amount is not None:
                customer_monthly_map[customer_name][month_str] += amount
        
        customer_stats = []
        for customer_name, monthly_amounts in customer_monthly_map.items():
            customer_shortname = customer_name_to_shortname.get(customer_name, customer_name)
            customer_data = {
                "customer_name": customer_shortname,
                "months": {}
            }
            
            total_amount = 0
            for month in range(1, 13):
                month_str = str(month)
                month_amount = monthly_amounts.get(month_str, 0)
                customer_data["months"][month_str] = round(month_amount, 2)
                total_amount += month_amount
            
            customer_data["total_amount"] = round(total_amount, 2)
            customer_stats.append(customer_data)
        
        customer_stats.sort(key=lambda x: x["total_amount"], reverse=True)
        
        total_customers = len(customer_stats)
        
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_customers = customer_stats[start_idx:end_idx]
        
        monthly_totals = {}
        for month in range(1, 13):
            month_str = str(month)
            month_total = sum(customer["months"][month_str] for customer in paginated_customers)
            monthly_totals[month_str] = round(month_total, 2)
        
        yearly_total = sum(customer["total_amount"] for customer in paginated_customers)
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "year": year,
                "customers": paginated_customers,
                "monthly_totals": monthly_totals,
                "yearly_total": round(yearly_total, 2),
                "total_customers": total_customers,
                "current_page": page,
                "total_pages": (total_customers + limit - 1) // limit,
                "limit": limit
            }
        }
    except Exception as e:
        print(f"获取客户年度统计报表数据失败: {e}")
        return {
            "code": 1,
            "msg": f"获取客户年度统计报表数据失败: {str(e)}",
            "data": {
                "year": year or datetime.datetime.now().year,
                "customers": [],
                "monthly_totals": {},
                "yearly_total": 0,
                "total_customers": 0,
                "current_page": page,
                "total_pages": 0,
                "limit": limit
            }
        }


@router.get("/customer-yearly/shipment", response_model=dict)
async def get_customer_yearly_shipment_report(
    year: int = Query(None, description="年份，默认当前年份"),
    page: int = Query(1, description="页码，默认第1页"),
    limit: int = Query(15, description="每页数量，默认15条"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取客户年度发货统计报表数据"""
    try:
        if not year:
            year = datetime.datetime.now().year
        
        year_start = datetime.datetime(year, 1, 1, 0, 0, 0, 0)
        year_end = datetime.datetime(year + 1, 1, 1, 0, 0, 0, 0)
        
        from app.models.customer import Customer
        
        customer_mapping = db.query(Customer.客户名称, Customer.简称).filter(
            Customer.状态 != '停用'
        ).all()
        customer_name_to_shortname = {c[0]: c[1] for c in customer_mapping}
        
        all_shipments = db.query(
            Ship.客户名称,
            Ship.发货日期,
            Order.金额
        ).outerjoin(
            Order, Order.发货单号 == Ship.发货单号
        ).join(
            Customer, Ship.客户名称 == Customer.客户名称
        ).filter(
            Customer.状态 != '停用',
            Ship.发货日期 >= year_start,
            Ship.发货日期 < year_end
        ).all()
        
        customer_monthly_map = {}
        for customer_name, ship_date, amount in all_shipments:
            if customer_name not in customer_monthly_map:
                customer_monthly_map[customer_name] = {}
            month_str = str(ship_date.month)
            if month_str not in customer_monthly_map[customer_name]:
                customer_monthly_map[customer_name][month_str] = 0
            if amount is not None:
                customer_monthly_map[customer_name][month_str] += amount
        
        customer_stats = []
        for customer_name, monthly_amounts in customer_monthly_map.items():
            customer_shortname = customer_name_to_shortname.get(customer_name, customer_name)
            customer_data = {
                "customer_name": customer_shortname,
                "months": {}
            }
            
            total_amount = 0
            for month in range(1, 13):
                month_str = str(month)
                month_amount = monthly_amounts.get(month_str, 0)
                customer_data["months"][month_str] = round(month_amount, 2)
                total_amount += month_amount
            
            customer_data["total_amount"] = round(total_amount, 2)
            customer_stats.append(customer_data)
        
        customer_stats.sort(key=lambda x: x["total_amount"], reverse=True)
        
        total_customers = len(customer_stats)
        
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_customers = customer_stats[start_idx:end_idx]
        
        monthly_totals = {}
        for month in range(1, 13):
            month_str = str(month)
            month_total = sum(customer["months"][month_str] for customer in paginated_customers)
            monthly_totals[month_str] = round(month_total, 2)
        
        yearly_total = sum(customer["total_amount"] for customer in paginated_customers)
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "year": year,
                "customers": paginated_customers,
                "monthly_totals": monthly_totals,
                "yearly_total": round(yearly_total, 2),
                "total_customers": total_customers,
                "current_page": page,
                "total_pages": (total_customers + limit - 1) // limit,
                "limit": limit
            }
        }
    except Exception as e:
        print(f"获取客户年度发货统计报表数据失败: {e}")
        import traceback
        traceback.print_exc()
        return {
            "code": 1,
            "msg": f"获取客户年度发货统计报表数据失败: {str(e)}",
            "data": {
                "year": year or datetime.datetime.now().year,
                "customers": [],
                "monthly_totals": {},
                "yearly_total": 0,
                "total_customers": 0,
                "current_page": page,
                "total_pages": 0,
                "limit": limit
            }
        }
