from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import datetime
from fpdf import FPDF
import os
import platform

from app.db.database import get_db_jns
from app.models.order import Order, OrderList
from app.models.user import User
from app.api.auth import get_current_active_user


router = APIRouter()


@router.get("/industry", response_model=dict)
async def get_industry_report(
    industry: str = Query(None, description="行业"),
    year: int = Query(None, description="年份，默认当前年份"),
    month: int = Query(None, description="月份，默认当前月份"),
    page: int = Query(1, description="页码"),
    limit: int = Query(10, description="每页数量"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取行业统计报表数据"""
    try:
        print(f"API调用参数: industry={industry}, year={year}, month={month}, page={page}, limit={limit}")
        
        if not year:
            year = datetime.datetime.now().year
        if not month:
            month = datetime.datetime.now().month
        
        months = []
        for i in range(11, -1, -1):
            current_month = month - i
            current_year = year
            while current_month < 1:
                current_month += 12
                current_year -= 1
            while current_month > 12:
                current_month -= 12
                current_year += 1
            month_date = datetime.datetime(current_year, current_month, 1)
            months.append(month_date)
        
        month_list = []
        for month_date in months:
            month_list.append({
                "month": f"{month_date.year}-{str(month_date.month).zfill(2)}",
                "month_name": f"{month_date.year}年{month_date.month}月"
            })
        
        from app.models.customer import Customer
        
        customers = db.query(Customer.客户名称, Customer.简称, Customer.备注, Customer.业务负责人).all()
        customer_industry_map = {}
        customer_manager_map = {}
        customer_shortname_map = {}
        for customer_name, shortname, remark, manager in customers:
            industry_from_remark = "其它"
            if remark:
                remark_lower = remark.lower()
                if "3c" in remark_lower:
                    industry_from_remark = "3C"
                elif "光伏" in remark_lower:
                    industry_from_remark = "光伏"
                elif "机械手" in remark_lower:
                    industry_from_remark = "机械手"
                elif "模组" in remark_lower:
                    industry_from_remark = "模组"
                elif "贸易" in remark_lower:
                    industry_from_remark = "贸易"
                elif "平台" in remark_lower:
                    industry_from_remark = "平台"
            
            customer_industry_map[customer_name] = industry_from_remark
            customer_manager_map[customer_name] = manager or ""
            customer_shortname_map[customer_name] = shortname or customer_name
        
        month_ranges = []
        for month_date in months:
            month_str = f"{month_date.year}-{str(month_date.month).zfill(2)}"
            month_start = month_date
            if month_date.month == 12:
                month_end = datetime.datetime(month_date.year + 1, 1, 1)
            else:
                month_end = datetime.datetime(month_date.year, month_date.month + 1, 1)
            month_ranges.append((month_str, month_start, month_end))
        
        customer_stats = []
        industry_stats_map = {}
        total_amount = 0
        
        is_all_industry = not industry or not industry.strip()
        
        if is_all_industry:
            print("执行全部行业统计")
            
            industries = ["3C", "光伏", "机械手", "模组", "贸易", "平台", "其它"]
            
            for target_industry in industries:
                industry_stat = {
                    "industry": target_industry,
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                industry_customers = [name for name, ind in customer_industry_map.items() if ind == target_industry]
                
                for month_str, month_start, month_end in month_ranges:
                    if industry_customers:
                        month_amount = db.query(func.sum(Order.金额)).outerjoin(
                            OrderList, Order.oid == OrderList.id
                        ).filter(
                            OrderList.订单日期 >= month_start,
                            OrderList.订单日期 < month_end,
                            OrderList.客户名称.in_(industry_customers)
                        ).scalar() or 0
                    else:
                        month_amount = 0
                    
                    month_amount = round(month_amount, 2)
                    industry_stat["monthly_amounts"][month_str] = month_amount
                    industry_stat["amount"] += month_amount
                
                industry_stat["amount"] = round(industry_stat["amount"], 2)
                industry_stats_map[target_industry] = industry_stat
                total_amount += industry_stat["amount"]
            
            print("计算客户统计数据")
            
            if months:
                start_date = months[0]
                end_date = months[-1]
                if end_date.month == 12:
                    end_date = datetime.datetime(end_date.year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(end_date.year, end_date.month + 1, 1)
            else:
                start_date = datetime.datetime(year, month, 1)
                if month == 12:
                    end_date = datetime.datetime(year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(year, month + 1, 1)
            
            all_orders = db.query(
                OrderList.客户名称,
                OrderList.订单日期,
                Order.金额
            ).outerjoin(
                Order, Order.oid == OrderList.id
            ).filter(
                OrderList.订单日期 >= start_date,
                OrderList.订单日期 < end_date
            ).all()
            
            customer_monthly_map = {}
            for customer_name, order_date, amount in all_orders:
                if customer_name not in customer_monthly_map:
                    customer_monthly_map[customer_name] = {}
                month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
                if month_str not in customer_monthly_map[customer_name]:
                    customer_monthly_map[customer_name][month_str] = 0
                if amount is not None:
                    customer_monthly_map[customer_name][month_str] += amount
            
            for customer_name, monthly_amounts in customer_monthly_map.items():
                customer_manager = customer_manager_map.get(customer_name, "")
                customer_shortname = customer_shortname_map.get(customer_name, customer_name)
                
                customer_stat = {
                    "customer_name": customer_shortname,
                    "manager": customer_manager,
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                for month_str, month_start, month_end in month_ranges:
                    month_amount = round(monthly_amounts.get(month_str, 0), 2)
                    customer_stat["monthly_amounts"][month_str] = month_amount
                    customer_stat["amount"] += month_amount
                
                customer_stat["amount"] = round(customer_stat["amount"], 2)
                if customer_stat["amount"] > 0:
                    customer_stats.append(customer_stat)
        
        else:
            print(f"执行单个行业统计: {industry}")
            
            if months:
                start_date = months[0]
                end_date = months[-1]
                if end_date.month == 12:
                    end_date = datetime.datetime(end_date.year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(end_date.year, end_date.month + 1, 1)
            else:
                start_date = datetime.datetime(year, month, 1)
                if month == 12:
                    end_date = datetime.datetime(year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(year, month + 1, 1)
            
            industry_customers = [name for name, ind in customer_industry_map.items() if ind == industry]
            
            all_orders = []
            if industry_customers:
                all_orders = db.query(
                    OrderList.客户名称,
                    OrderList.订单日期,
                    Order.金额
                ).outerjoin(
                    Order, Order.oid == OrderList.id
                ).filter(
                    OrderList.订单日期 >= start_date,
                    OrderList.订单日期 < end_date,
                    OrderList.客户名称.in_(industry_customers)
                ).all()
            
            customer_monthly_map = {}
            for customer_name, order_date, amount in all_orders:
                if customer_name not in customer_monthly_map:
                    customer_monthly_map[customer_name] = {}
                month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
                if month_str not in customer_monthly_map[customer_name]:
                    customer_monthly_map[customer_name][month_str] = 0
                if amount is not None:
                    customer_monthly_map[customer_name][month_str] += amount
            
            for customer_name, monthly_amounts in customer_monthly_map.items():
                customer_manager = customer_manager_map.get(customer_name, "")
                customer_shortname = customer_shortname_map.get(customer_name, customer_name)
                
                customer_stat = {
                    "customer_name": customer_shortname,
                    "manager": customer_manager,
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                for month_str, month_start, month_end in month_ranges:
                    month_amount = round(monthly_amounts.get(month_str, 0), 2)
                    customer_stat["monthly_amounts"][month_str] = month_amount
                    customer_stat["amount"] += month_amount
                
                customer_stat["amount"] = round(customer_stat["amount"], 2)
                customer_stats.append(customer_stat)
                total_amount += customer_stat["amount"]
        
        industry_stats = []
        for industry_stat in industry_stats_map.values():
            industry_stat["amount"] = round(industry_stat["amount"], 2)
            for month_str, amount in industry_stat["monthly_amounts"].items():
                industry_stat["monthly_amounts"][month_str] = round(amount, 2)
            industry_stats.append(industry_stat)
        
        total_amount = round(total_amount, 2)
        
        customer_stats.sort(key=lambda x: x["amount"], reverse=True)
        
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_customers = customer_stats[start_idx:end_idx]
        
        print("返回实际数据")
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "customers": paginated_customers,
                "totalAmount": total_amount,
                "industryStats": industry_stats,
                "months": month_list
            },
            "count": len(customer_stats)
        }
    except Exception as e:
        print(f"获取行业统计报表数据失败: {e}")
        import traceback
        traceback.print_exc()
        return {
            "code": 1,
            "msg": f"获取行业统计报表数据失败: {str(e)}",
            "data": {
                "customers": [],
                "totalAmount": 0,
                "industryStats": [],
                "months": []
            },
            "count": 0
        }


@router.get("/industry/export-data", response_model=dict)
async def get_industry_export_data(
    industry: str = Query(None, description="行业"),
    year: int = Query(None, description="年份，默认当前年份"),
    month: int = Query(None, description="月份，默认当前月份"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取行业统计报表导出数据（不分页，返回全部数据）"""
    try:
        if not year:
            year = datetime.datetime.now().year
        if not month:
            month = datetime.datetime.now().month
        
        months = []
        for i in range(11, -1, -1):
            current_month = month - i
            current_year = year
            while current_month < 1:
                current_month += 12
                current_year -= 1
            while current_month > 12:
                current_month -= 12
                current_year += 1
            month_date = datetime.datetime(current_year, current_month, 1)
            months.append(month_date)
        
        month_list = []
        for month_date in months:
            month_list.append({
                "month": f"{month_date.year}-{str(month_date.month).zfill(2)}",
                "month_name": f"{month_date.year}年{month_date.month}月"
            })
        
        from app.models.customer import Customer
        
        customers = db.query(Customer.客户名称, Customer.简称, Customer.备注, Customer.业务负责人).all()
        customer_industry_map = {}
        customer_manager_map = {}
        customer_shortname_map = {}
        for customer_name, shortname, remark, manager in customers:
            industry_from_remark = "其它"
            if remark:
                remark_lower = remark.lower()
                if "3c" in remark_lower:
                    industry_from_remark = "3C"
                elif "光伏" in remark_lower:
                    industry_from_remark = "光伏"
                elif "机械手" in remark_lower:
                    industry_from_remark = "机械手"
                elif "模组" in remark_lower:
                    industry_from_remark = "模组"
                elif "贸易" in remark_lower:
                    industry_from_remark = "贸易"
                elif "平台" in remark_lower:
                    industry_from_remark = "平台"
            
            customer_industry_map[customer_name] = industry_from_remark
            customer_manager_map[customer_name] = manager or ""
            customer_shortname_map[customer_name] = shortname or customer_name
        
        month_ranges = []
        for month_date in months:
            month_str = f"{month_date.year}-{str(month_date.month).zfill(2)}"
            month_start = month_date
            if month_date.month == 12:
                month_end = datetime.datetime(month_date.year + 1, 1, 1)
            else:
                month_end = datetime.datetime(month_date.year, month_date.month + 1, 1)
            month_ranges.append((month_str, month_start, month_end))
        
        customer_stats = []
        industry_stats_map = {}
        total_amount = 0
        
        is_all_industry = not industry or not industry.strip()
        
        if is_all_industry:
            industries = ["3C", "光伏", "机械手", "模组", "贸易", "平台", "其它"]
            
            for target_industry in industries:
                industry_stat = {
                    "industry": target_industry,
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                industry_customers = [name for name, ind in customer_industry_map.items() if ind == target_industry]
                
                for month_str, month_start, month_end in month_ranges:
                    if industry_customers:
                        month_amount = db.query(func.sum(Order.金额)).outerjoin(
                            OrderList, Order.oid == OrderList.id
                        ).filter(
                            OrderList.订单日期 >= month_start,
                            OrderList.订单日期 < month_end,
                            OrderList.客户名称.in_(industry_customers)
                        ).scalar() or 0
                    else:
                        month_amount = 0
                    
                    month_amount = round(month_amount, 2)
                    industry_stat["monthly_amounts"][month_str] = month_amount
                    industry_stat["amount"] += month_amount
                
                industry_stat["amount"] = round(industry_stat["amount"], 2)
                industry_stats_map[target_industry] = industry_stat
                total_amount += industry_stat["amount"]
            
            if months:
                start_date = months[0]
                end_date = months[-1]
                if end_date.month == 12:
                    end_date = datetime.datetime(end_date.year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(end_date.year, end_date.month + 1, 1)
            else:
                start_date = datetime.datetime(year, month, 1)
                if month == 12:
                    end_date = datetime.datetime(year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(year, month + 1, 1)
            
            all_orders = db.query(
                OrderList.客户名称,
                OrderList.订单日期,
                Order.金额
            ).outerjoin(
                Order, Order.oid == OrderList.id
            ).filter(
                OrderList.订单日期 >= start_date,
                OrderList.订单日期 < end_date
            ).all()
            
            customer_monthly_map = {}
            for customer_name, order_date, amount in all_orders:
                if customer_name not in customer_monthly_map:
                    customer_monthly_map[customer_name] = {}
                month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
                if month_str not in customer_monthly_map[customer_name]:
                    customer_monthly_map[customer_name][month_str] = 0
                if amount is not None:
                    customer_monthly_map[customer_name][month_str] += amount
            
            for customer_name, monthly_amounts in customer_monthly_map.items():
                customer_manager = customer_manager_map.get(customer_name, "")
                customer_shortname = customer_shortname_map.get(customer_name, customer_name)
                
                customer_stat = {
                    "customer_name": customer_shortname,
                    "manager": customer_manager,
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                for month_str, month_start, month_end in month_ranges:
                    month_amount = round(monthly_amounts.get(month_str, 0), 2)
                    customer_stat["monthly_amounts"][month_str] = month_amount
                    customer_stat["amount"] += month_amount
                
                customer_stat["amount"] = round(customer_stat["amount"], 2)
                if customer_stat["amount"] > 0:
                    customer_stats.append(customer_stat)
        
        else:
            if months:
                start_date = months[0]
                end_date = months[-1]
                if end_date.month == 12:
                    end_date = datetime.datetime(end_date.year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(end_date.year, end_date.month + 1, 1)
            else:
                start_date = datetime.datetime(year, month, 1)
                if month == 12:
                    end_date = datetime.datetime(year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(year, month + 1, 1)
            
            industry_customers = [name for name, ind in customer_industry_map.items() if ind == industry]
            
            all_orders = []
            if industry_customers:
                all_orders = db.query(
                    OrderList.客户名称,
                    OrderList.订单日期,
                    Order.金额
                ).outerjoin(
                    Order, Order.oid == OrderList.id
                ).filter(
                    OrderList.订单日期 >= start_date,
                    OrderList.订单日期 < end_date,
                    OrderList.客户名称.in_(industry_customers)
                ).all()
            
            customer_monthly_map = {}
            for customer_name, order_date, amount in all_orders:
                if customer_name not in customer_monthly_map:
                    customer_monthly_map[customer_name] = {}
                month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
                if month_str not in customer_monthly_map[customer_name]:
                    customer_monthly_map[customer_name][month_str] = 0
                if amount is not None:
                    customer_monthly_map[customer_name][month_str] += amount
            
            for customer_name, monthly_amounts in customer_monthly_map.items():
                customer_manager = customer_manager_map.get(customer_name, "")
                customer_shortname = customer_shortname_map.get(customer_name, customer_name)
                
                customer_stat = {
                    "customer_name": customer_shortname,
                    "manager": customer_manager,
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                for month_str, month_start, month_end in month_ranges:
                    month_amount = round(monthly_amounts.get(month_str, 0), 2)
                    customer_stat["monthly_amounts"][month_str] = month_amount
                    customer_stat["amount"] += month_amount
                
                customer_stat["amount"] = round(customer_stat["amount"], 2)
                customer_stats.append(customer_stat)
                total_amount += customer_stat["amount"]
        
        industry_stats = []
        for industry_stat in industry_stats_map.values():
            industry_stat["amount"] = round(industry_stat["amount"], 2)
            for month_str, amount in industry_stat["monthly_amounts"].items():
                industry_stat["monthly_amounts"][month_str] = round(amount, 2)
            industry_stats.append(industry_stat)
        
        total_amount = round(total_amount, 2)
        
        customer_stats.sort(key=lambda x: x["amount"], reverse=True)
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "customers": customer_stats,
                "totalAmount": total_amount,
                "industryStats": industry_stats,
                "months": month_list
            },
            "count": len(customer_stats)
        }
    except Exception as e:
        print(f"获取行业统计导出数据失败: {e}")
        import traceback
        traceback.print_exc()
        return {
            "code": 1,
            "msg": f"获取行业统计导出数据失败: {str(e)}",
            "data": {
                "customers": [],
                "totalAmount": 0,
                "industryStats": [],
                "months": []
            },
            "count": 0
        }


@router.get("/industry/export")
async def export_industry_report(
    industry: Optional[str] = Query(None, description="行业"),
    year: int = Query(None, description="年份，默认当前年份"),
    month: int = Query(None, description="月份，默认当前月份"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """导出行业统计报表"""
    try:
        if isinstance(year, dict):
            year = year.get('year', datetime.datetime.now().year)
        elif not year:
            year = datetime.datetime.now().year
        
        if isinstance(month, dict):
            month = month.get('month', datetime.datetime.now().month)
        elif not month:
            month = datetime.datetime.now().month
        
        months = []
        for i in range(11, -1, -1):
            current_month = month - i
            current_year = year
            while current_month < 1:
                current_month += 12
                current_year -= 1
            while current_month > 12:
                current_month -= 12
                current_year += 1
            month_date = datetime.datetime(current_year, current_month, 1)
            months.append(month_date)
        
        month_list = []
        for month_date in months:
            month_list.append({
                "month": f"{month_date.year}-{str(month_date.month).zfill(2)}",
                "month_name": f"{month_date.year}年{month_date.month}月"
            })
        
        from app.models.customer import Customer
        
        customers = db.query(Customer.客户名称, Customer.简称, Customer.备注, Customer.业务负责人).all()
        customer_industry_map = {}
        customer_manager_map = {}
        customer_shortname_map = {}
        for customer_name, shortname, remark, manager in customers:
            industry_from_remark = "其它"
            if remark:
                remark_lower = remark.lower()
                if "3c" in remark_lower:
                    industry_from_remark = "3C"
                elif "光伏" in remark_lower:
                    industry_from_remark = "光伏"
                elif "机械手" in remark_lower:
                    industry_from_remark = "机械手"
                elif "模组" in remark_lower:
                    industry_from_remark = "模组"
                elif "贸易" in remark_lower:
                    industry_from_remark = "贸易"
                elif "平台" in remark_lower:
                    industry_from_remark = "平台"
            
            customer_industry_map[customer_name] = industry_from_remark
            customer_manager_map[customer_name] = manager or ""
            customer_shortname_map[customer_name] = shortname or customer_name
        
        month_ranges = []
        for month_date in months:
            month_str = f"{month_date.year}-{str(month_date.month).zfill(2)}"
            month_start = month_date
            if month_date.month == 12:
                month_end = datetime.datetime(month_date.year + 1, 1, 1)
            else:
                month_end = datetime.datetime(month_date.year, month_date.month + 1, 1)
            month_ranges.append((month_str, month_start, month_end))
        
        customer_stats = []
        industry_stats_map = {}
        total_amount = 0
        
        is_all_industry = not industry or not industry.strip()
        
        if is_all_industry:
            industries = ["3C", "光伏", "机械手", "模组", "贸易", "平台", "其它"]
            
            for target_industry in industries:
                industry_stat = {
                    "industry": target_industry,
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                industry_customers = [name for name, ind in customer_industry_map.items() if ind == target_industry]
                
                for month_str, month_start, month_end in month_ranges:
                    if industry_customers:
                        month_amount = db.query(func.sum(Order.金额)).outerjoin(
                            OrderList, Order.oid == OrderList.id
                        ).filter(
                            OrderList.订单日期 >= month_start,
                            OrderList.订单日期 < month_end,
                            OrderList.客户名称.in_(industry_customers)
                        ).scalar() or 0
                    else:
                        month_amount = 0
                    
                    month_amount = round(month_amount, 2)
                    industry_stat["monthly_amounts"][month_str] = month_amount
                    industry_stat["amount"] += month_amount
                
                industry_stat["amount"] = round(industry_stat["amount"], 2)
                industry_stats_map[target_industry] = industry_stat
                total_amount += industry_stat["amount"]
            
            if months:
                start_date = months[0]
                end_date = months[-1]
                if end_date.month == 12:
                    end_date = datetime.datetime(end_date.year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(end_date.year, end_date.month + 1, 1)
            else:
                start_date = datetime.datetime(year, month, 1)
                if month == 12:
                    end_date = datetime.datetime(year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(year, month + 1, 1)
            
            all_orders = db.query(
                OrderList.客户名称,
                OrderList.订单日期,
                Order.金额
            ).outerjoin(
                Order, Order.oid == OrderList.id
            ).filter(
                OrderList.订单日期 >= start_date,
                OrderList.订单日期 < end_date
            ).all()
            
            customer_monthly_map = {}
            for customer_name, order_date, amount in all_orders:
                if customer_name not in customer_monthly_map:
                    customer_monthly_map[customer_name] = {}
                month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
                if month_str not in customer_monthly_map[customer_name]:
                    customer_monthly_map[customer_name][month_str] = 0
                if amount is not None:
                    customer_monthly_map[customer_name][month_str] += amount
            
            for customer_name, monthly_amounts in customer_monthly_map.items():
                customer_manager = customer_manager_map.get(customer_name, "")
                customer_shortname = customer_shortname_map.get(customer_name, customer_name)
                
                customer_stat = {
                    "customer_name": customer_shortname,
                    "manager": customer_manager,
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                for month_str, month_start, month_end in month_ranges:
                    month_amount = round(monthly_amounts.get(month_str, 0), 2)
                    customer_stat["monthly_amounts"][month_str] = month_amount
                    customer_stat["amount"] += month_amount
                
                customer_stat["amount"] = round(customer_stat["amount"], 2)
                if customer_stat["amount"] > 0:
                    customer_stats.append(customer_stat)
        else:
            if months:
                start_date = months[0]
                end_date = months[-1]
                if end_date.month == 12:
                    end_date = datetime.datetime(end_date.year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(end_date.year, end_date.month + 1, 1)
            else:
                start_date = datetime.datetime(year, month, 1)
                if month == 12:
                    end_date = datetime.datetime(year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(year, month + 1, 1)
            
            industry_customers = [name for name, ind in customer_industry_map.items() if ind == industry]
            
            all_orders = []
            if industry_customers:
                all_orders = db.query(
                    OrderList.客户名称,
                    OrderList.订单日期,
                    Order.金额
                ).outerjoin(
                    Order, Order.oid == OrderList.id
                ).filter(
                    OrderList.订单日期 >= start_date,
                    OrderList.订单日期 < end_date,
                    OrderList.客户名称.in_(industry_customers)
                ).all()
            
            customer_monthly_map = {}
            for customer_name, order_date, amount in all_orders:
                if customer_name not in customer_monthly_map:
                    customer_monthly_map[customer_name] = {}
                month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
                if month_str not in customer_monthly_map[customer_name]:
                    customer_monthly_map[customer_name][month_str] = 0
                if amount is not None:
                    customer_monthly_map[customer_name][month_str] += amount
            
            for customer_name, monthly_amounts in customer_monthly_map.items():
                customer_manager = customer_manager_map.get(customer_name, "")
                customer_shortname = customer_shortname_map.get(customer_name, customer_name)
                
                customer_stat = {
                    "customer_name": customer_shortname,
                    "manager": customer_manager,
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                for month_str, month_start, month_end in month_ranges:
                    month_amount = round(monthly_amounts.get(month_str, 0), 2)
                    customer_stat["monthly_amounts"][month_str] = month_amount
                    customer_stat["amount"] += month_amount
                
                customer_stat["amount"] = round(customer_stat["amount"], 2)
                customer_stats.append(customer_stat)
                total_amount += customer_stat["amount"]
        
        industry_stats = []
        for industry_stat in industry_stats_map.values():
            industry_stat["amount"] = round(industry_stat["amount"], 2)
            for month_str, amount in industry_stat["monthly_amounts"].items():
                industry_stat["monthly_amounts"][month_str] = round(amount, 2)
            industry_stats.append(industry_stat)
        
        total_amount = round(total_amount, 2)
        
        customer_stats.sort(key=lambda x: x["amount"], reverse=True)
        
        pdf = FPDF(orientation='L')
        pdf.add_page()
        pdf.set_margins(10, 10, 10)
        
        font_loaded = False
        font_name = "helvetica"
        if platform.system() == "Windows":
            font_path = "C:\\Windows\\Fonts\\simhei.ttf"
            if os.path.exists(font_path):
                try:
                    pdf.add_font("simhei", "", font_path, uni=True)
                    font_loaded = True
                    font_name = "simhei"
                except Exception as e:
                    print(f"Failed to load SimHei font: {e}")
        
        pdf.set_font(font_name, "", 16)
        pdf.cell(0, 15, "行业统计分析报表", 0, 1, "C")
        pdf.ln(10)
        
        pdf.set_font(font_name, "", 12)
        pdf.cell(0, 10, f"行业: {industry if industry else '全部行业'}", 0, 1, "L")
        pdf.cell(0, 10, f"日期: {year}-{month:02d}", 0, 1, "L")
        pdf.cell(0, 10, f"总计: {total_amount}", 0, 1, "L")
        pdf.ln(10)
        
        customer_col_width = 30
        manager_col_width = 25
        total_col_width = 25
        remaining_width = 277 - customer_col_width - manager_col_width - total_col_width
        month_col_width = remaining_width / len(month_list) if len(month_list) > 0 else 28
        
        col_widths = [customer_col_width, manager_col_width]
        for _ in month_list:
            col_widths.append(month_col_width)
        col_widths.append(total_col_width)
        
        pdf.set_font(font_name, "", 10)
        pdf.cell(customer_col_width, 10, "客户简称", 1, 0, "C")
        pdf.cell(manager_col_width, 10, "业务负责人", 1, 0, "C")
        for month_info in month_list:
            pdf.cell(month_col_width, 10, month_info["month"], 1, 0, "C")
        pdf.cell(total_col_width, 10, "合计", 1, 1, "C")
        
        pdf.set_font(font_name, "", 10)
        for customer in customer_stats:
            pdf.cell(customer_col_width, 10, customer["customer_name"], 1, 0, "L")
            pdf.cell(manager_col_width, 10, customer["manager"], 1, 0, "L")
            for month_info in month_list:
                month_str = month_info["month"]
                month_amount = customer["monthly_amounts"].get(month_str, 0)
                pdf.cell(month_col_width, 10, str(month_amount), 1, 0, "R")
            pdf.cell(total_col_width, 10, str(customer["amount"]), 1, 1, "R")
        
        if industry_stats and len(industry_stats) > 0:
            pdf.ln(10)
            pdf.set_font(font_name, "", 12)
            pdf.cell(0, 10, "行业统计", 0, 1, "L")
            pdf.ln(5)
            
            industry_col_width = 25
            remaining_width = 277 - industry_col_width - total_col_width
            month_col_width = remaining_width / len(month_list) if len(month_list) > 0 else 28
            
            pdf.set_font(font_name, "", 10)
            pdf.cell(industry_col_width, 10, "行业", 1, 0, "C")
            for month_info in month_list:
                pdf.cell(month_col_width, 10, month_info["month"], 1, 0, "C")
            pdf.cell(total_col_width, 10, "合计", 1, 1, "C")
            
            pdf.set_font(font_name, "", 10)
            for industry_stat in industry_stats:
                pdf.cell(industry_col_width, 10, industry_stat["industry"], 1, 0, "L")
                for month_info in month_list:
                    month_str = month_info["month"]
                    month_amount = industry_stat["monthly_amounts"].get(month_str, 0)
                    pdf.cell(month_col_width, 10, str(month_amount), 1, 0, "R")
                pdf.cell(total_col_width, 10, str(industry_stat["amount"]), 1, 1, "R")
        
        pdf.ln(15)
        pdf.set_font(font_name, "", 10)
        pdf.cell(0, 10, f"生成时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 0, 1, "R")
        
        from io import BytesIO
        buffer = BytesIO()
        pdf.output(buffer)
        buffer.seek(0)
        
        from fastapi.responses import StreamingResponse
        import urllib.parse
        
        filename = f"行业统计分析_{industry if industry else '全部行业'}_{year}{month:02d}.pdf"
        encoded_filename = urllib.parse.quote(filename)
        
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={encoded_filename}; filename*=UTF-8''{encoded_filename}"
            }
        )
    except Exception as e:
        print(f"导出行业统计报表失败: {e}")
        import traceback
        traceback.print_exc()
        return {
            "code": 1,
            "msg": f"导出行业统计报表失败: {str(e)}",
            "data": {}
        }
