from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func
import datetime
from fpdf import FPDF
import os
import platform

from app.db.database import get_db_jns
from app.models.order import Order, OrderList
from app.models.ship import Ship


router = APIRouter()


@router.get("/monthly", response_model=dict)
async def get_monthly_report(
    year: int = Query(None, description="年份，默认当前年份"),
    month: int = Query(None, description="月份，默认当前月份"),
    customer: Optional[str] = Query(None, description="客户名称，默认全部客户"),
    db: Session = Depends(get_db_jns)
):
    """获取月度统计报表数据"""
    try:
        # 如果没有指定年份和月份，使用当前日期
        now = datetime.datetime.now()
        if not year:
            year = now.year
        if not month:
            month = now.month
        
        # 计算月份的开始和结束时间
        month_start = datetime.datetime(year, month, 1, 0, 0, 0, 0)
        if month == 12:
            month_end = datetime.datetime(year + 1, 1, 1, 0, 0, 0, 0)
        else:
            month_end = datetime.datetime(year, month + 1, 1, 0, 0, 0, 0)
        
        # 构建查询条件
        order_filters = []
        ship_filters = []
        
        # 客户筛选
        if customer and customer != "all":
            order_filters.append(OrderList.客户名称 == customer)
            ship_filters.append(OrderList.客户名称 == customer)
        
        # 1. 按天统计订单数据
        daily_order_stats = []
        
        # 生成月份的所有日期
        current_day = month_start
        while current_day < month_end:
            day_start = current_day
            day_end = day_start + datetime.timedelta(days=1)
            
            # 查询当天的订单数量（对订单编号去重）和金额（包括外调）
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
        
        # 2. 统计本月订单总数（对订单编号去重）和金额（包括外调）
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
        
        # 3. 统计本月发货金额（包括外调）
        total_ship_amount = db.query(func.sum(Order.金额)).outerjoin(
            Ship, Order.ship_id == Ship.id
        ).outerjoin(
            OrderList, Order.oid == OrderList.id
        ).filter(
            Ship.发货日期 >= month_start,
            Ship.发货日期 < month_end,
            *ship_filters
        ).scalar() or 0
        
        # 4. 统计本月接驳带和开口带的百分比
        # 统计总数量
        total_spec_count = db.query(func.count(Order.id)).outerjoin(
            OrderList, Order.oid == OrderList.id
        ).filter(
            OrderList.订单日期 >= month_start,
            OrderList.订单日期 < month_end,
            *order_filters
        ).scalar() or 0
        
        # 统计接驳带数量
        jiebodai_count = db.query(func.count(Order.id)).outerjoin(
            OrderList, Order.oid == OrderList.id
        ).filter(
            OrderList.订单日期 >= month_start,
            OrderList.订单日期 < month_end,
            Order.规格.like('%接驳%'),
            *order_filters
        ).scalar() or 0
        
        # 统计开口带数量
        kaikoudai_count = db.query(func.count(Order.id)).outerjoin(
            OrderList, Order.oid == OrderList.id
        ).filter(
            OrderList.订单日期 >= month_start,
            OrderList.订单日期 < month_end,
            Order.规格.like('%开口%'),
            *order_filters
        ).scalar() or 0
        
        # 计算百分比
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


@router.get("/customer-yearly", response_model=dict)
async def get_customer_yearly_report(
    year: int = Query(None, description="年份，默认当前年份"),
    page: int = Query(1, description="页码，默认第1页"),
    limit: int = Query(15, description="每页数量，默认15条"),
    db: Session = Depends(get_db_jns)
):
    """获取客户年度统计报表数据"""
    try:
        # 如果没有指定年份，使用当前年份
        if not year:
            year = datetime.datetime.now().year
        
        # 计算年份的开始和结束时间
        year_start = datetime.datetime(year, 1, 1, 0, 0, 0, 0)
        year_end = datetime.datetime(year + 1, 1, 1, 0, 0, 0, 0)
        
        # 1. 按客户和月份统计订单金额
        # 先获取所有客户及其简称
        from app.models.customer import Customer
        
        # 获取所有客户名称和简称的映射
        customer_mapping = db.query(Customer.客户名称, Customer.简称).all()
        customer_name_to_shortname = {c[0]: c[1] for c in customer_mapping}
        
        # 2. 单次查询获取所有客户的所有订单金额
        # 然后在内存中按月份和客户分组
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
        
        # 3. 构建客户月度金额映射
        customer_monthly_map = {}
        for customer_name, order_date, amount in all_orders:
            if customer_name not in customer_monthly_map:
                customer_monthly_map[customer_name] = {}
            month_str = str(order_date.month)
            if month_str not in customer_monthly_map[customer_name]:
                customer_monthly_map[customer_name][month_str] = 0
            # 处理金额为None的情况
            if amount is not None:
                customer_monthly_map[customer_name][month_str] += amount
        
        # 4. 为每个客户计算月度金额和总金额
        customer_stats = []
        for customer_name, monthly_amounts in customer_monthly_map.items():
            # 使用客户简称，如果没有简称则使用客户名称
            customer_shortname = customer_name_to_shortname.get(customer_name, customer_name)
            customer_data = {
                "customer_name": customer_shortname,
                "months": {}
            }
            
            # 计算每个月的订单金额
            total_amount = 0
            for month in range(1, 13):
                month_str = str(month)
                month_amount = monthly_amounts.get(month_str, 0)
                customer_data["months"][month_str] = round(month_amount, 2)
                total_amount += month_amount
            
            customer_data["total_amount"] = round(total_amount, 2)
            customer_stats.append(customer_data)
        
        # 5. 按总金额降序排序
        customer_stats.sort(key=lambda x: x["total_amount"], reverse=True)
        
        # 6. 计算总客户数（用于分页）
        total_customers = len(customer_stats)
        
        # 7. 分页处理
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_customers = customer_stats[start_idx:end_idx]
        
        # 8. 计算当前页客户的月度合计金额
        monthly_totals = {}
        for month in range(1, 13):
            month_str = str(month)
            month_total = sum(customer["months"][month_str] for customer in paginated_customers)
            monthly_totals[month_str] = round(month_total, 2)
        
        # 计算当前页客户的年度合计
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


@router.get("/industry", response_model=dict)
async def get_industry_report(
    industry: str = Query(None, description="行业"),
    year: int = Query(None, description="年份，默认当前年份"),
    month: int = Query(None, description="月份，默认当前月份"),
    page: int = Query(1, description="页码"),
    limit: int = Query(10, description="每页数量"),
    db: Session = Depends(get_db_jns)
):
    """获取行业统计报表数据"""
    try:
        # 调试信息
        print(f"API调用参数: industry={industry}, year={year}, month={month}, page={page}, limit={limit}")
        
        # 如果没有指定年份和月份，使用当前年份和月份
        if not year:
            year = datetime.datetime.now().year
        if not month:
            month = datetime.datetime.now().month
        
        # 生成近12个月的日期列表
        # 从当前月份开始，往前推11个月，确保包含当前月份
        months = []
        for i in range(11, -1, -1):
            # 计算月份，确保正确处理月份边界
            current_month = month - i
            current_year = year
            
            # 处理月份小于1的情况
            while current_month < 1:
                current_month += 12
                current_year -= 1
            
            # 处理月份大于12的情况
            while current_month > 12:
                current_month -= 12
                current_year += 1
            
            month_date = datetime.datetime(current_year, current_month, 1)
            months.append(month_date)
        
        # 生成月份列表
        month_list = []
        for month_date in months:
            month_list.append({
                "month": f"{month_date.year}-{str(month_date.month).zfill(2)}",
                "month_name": f"{month_date.year}年{month_date.month}月"
            })
        
        # 从数据库中获取客户信息、行业数据和业务负责人数据
        from app.models.customer import Customer
        
        # 获取所有客户及其简称、备注（行业信息）和业务负责人
        customers = db.query(Customer.客户名称, Customer.简称, Customer.备注, Customer.业务负责人).all()
        customer_industry_map = {}
        customer_manager_map = {}
        customer_shortname_map = {}
        for customer_name, shortname, remark, manager in customers:
            # 从备注中提取行业信息
            industry_from_remark = "其它"
            if remark:
                # 简单的行业提取逻辑，实际应用中可能需要更复杂的处理
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
            # 使用业务负责人，如果没有则显示空字符串
            customer_manager_map[customer_name] = manager or ""
            customer_shortname_map[customer_name] = shortname or customer_name
        
        # 预处理月份范围，避免重复计算
        month_ranges = []
        for month_date in months:
            month_str = f"{month_date.year}-{str(month_date.month).zfill(2)}"
            month_start = month_date
            if month_date.month == 12:
                month_end = datetime.datetime(month_date.year + 1, 1, 1)
            else:
                month_end = datetime.datetime(month_date.year, month_date.month + 1, 1)
            month_ranges.append((month_str, month_start, month_end))
        
        # 初始化统计数据
        customer_stats = []
        industry_stats_map = {}
        total_amount = 0
        
        # 检查是否为"全部行业"查询
        is_all_industry = not industry or not industry.strip()
        
        if is_all_industry:
            # 优化：直接按行业维度统计数据
            print("执行全部行业统计")
            
            # 获取所有行业类型
            industries = ["3C", "光伏", "机械手", "模组", "贸易", "平台", "其它"]
            
            # 先计算行业统计数据
            for target_industry in industries:
                # 初始化行业统计数据
                industry_stat = {
                    "industry": target_industry,
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                # 构建客户名称列表，只包含属于当前行业的客户
                industry_customers = [name for name, ind in customer_industry_map.items() if ind == target_industry]
                
                # 计算每个月的订单金额
                for month_str, month_start, month_end in month_ranges:
                    if industry_customers:
                        # 查询该行业该月份的订单金额
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
            
            # 计算客户统计数据 - 优化：使用单次数据库查询
            print("计算客户统计数据")
            
            # 构建日期范围
            if months:
                start_date = months[0]  # 最早的月份
                end_date = months[-1]  # 最晚的月份
                # 结束日期需要加1个月，以包含整个月
                if end_date.month == 12:
                    end_date = datetime.datetime(end_date.year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(end_date.year, end_date.month + 1, 1)
            else:
                # 如果没有月份数据，使用当前月份
                start_date = datetime.datetime(year, month, 1)
                if month == 12:
                    end_date = datetime.datetime(year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(year, month + 1, 1)
            
            # 单次查询获取所有客户的所有订单金额
            # 然后在内存中按月份和客户分组
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
            
            # 构建客户月度金额映射
            customer_monthly_map = {}
            for customer_name, order_date, amount in all_orders:
                if customer_name not in customer_monthly_map:
                    customer_monthly_map[customer_name] = {}
                month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
                if month_str not in customer_monthly_map[customer_name]:
                    customer_monthly_map[customer_name][month_str] = 0
                # 处理金额为None的情况
                if amount is not None:
                    customer_monthly_map[customer_name][month_str] += amount
            
            # 构建客户统计数据
            for customer_name, monthly_amounts in customer_monthly_map.items():
                # 获取客户业务负责人和简称
                customer_manager = customer_manager_map.get(customer_name, "")
                customer_shortname = customer_shortname_map.get(customer_name, customer_name)
                
                # 初始化客户数据
                customer_stat = {
                    "customer_name": customer_shortname,
                    "manager": customer_manager,
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                # 计算每个月的订单金额
                for month_str, month_start, month_end in month_ranges:
                    month_amount = round(monthly_amounts.get(month_str, 0), 2)
                    customer_stat["monthly_amounts"][month_str] = month_amount
                    customer_stat["amount"] += month_amount
                
                customer_stat["amount"] = round(customer_stat["amount"], 2)
                if customer_stat["amount"] > 0:  # 只添加有订单金额的客户
                    customer_stats.append(customer_stat)
            

        else:
            # 按原逻辑处理单个行业的查询
            print(f"执行单个行业统计: {industry}")
            
            # 构建日期范围
            if months:
                start_date = months[0]  # 最早的月份
                end_date = months[-1]  # 最晚的月份
                # 结束日期需要加1个月，以包含整个月
                if end_date.month == 12:
                    end_date = datetime.datetime(end_date.year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(end_date.year, end_date.month + 1, 1)
            else:
                # 如果没有月份数据，使用当前月份
                start_date = datetime.datetime(year, month, 1)
                if month == 12:
                    end_date = datetime.datetime(year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(year, month + 1, 1)
            
            # 获取该行业的客户列表
            industry_customers = [name for name, ind in customer_industry_map.items() if ind == industry]
            
            # 单次查询获取该行业所有客户的所有订单金额
            # 然后在内存中按月份和客户分组
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
            
            # 构建客户月度金额映射
            customer_monthly_map = {}
            for customer_name, order_date, amount in all_orders:
                if customer_name not in customer_monthly_map:
                    customer_monthly_map[customer_name] = {}
                month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
                if month_str not in customer_monthly_map[customer_name]:
                    customer_monthly_map[customer_name][month_str] = 0
                # 处理金额为None的情况
                if amount is not None:
                    customer_monthly_map[customer_name][month_str] += amount
            
            # 构建客户统计数据
            for customer_name, monthly_amounts in customer_monthly_map.items():
                # 获取客户业务负责人和简称
                customer_manager = customer_manager_map.get(customer_name, "")
                customer_shortname = customer_shortname_map.get(customer_name, customer_name)
                
                # 初始化客户数据
                customer_stat = {
                    "customer_name": customer_shortname,
                    "manager": customer_manager,
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                # 计算每个月的订单金额
                for month_str, month_start, month_end in month_ranges:
                    month_amount = round(monthly_amounts.get(month_str, 0), 2)
                    customer_stat["monthly_amounts"][month_str] = month_amount
                    customer_stat["amount"] += month_amount
                
                customer_stat["amount"] = round(customer_stat["amount"], 2)
                customer_stats.append(customer_stat)
                total_amount += customer_stat["amount"]
        
        # 处理行业统计数据
        industry_stats = []
        for industry_stat in industry_stats_map.values():
            industry_stat["amount"] = round(industry_stat["amount"], 2)
            for month_str, amount in industry_stat["monthly_amounts"].items():
                industry_stat["monthly_amounts"][month_str] = round(amount, 2)
            industry_stats.append(industry_stat)
        
        # 计算总金额
        total_amount = round(total_amount, 2)
        
        # 按订单金额合计降序排序
        customer_stats.sort(key=lambda x: x["amount"], reverse=True)
        
        # 分页处理
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_customers = customer_stats[start_idx:end_idx]
        
        # 返回实际数据
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


@router.get("/industry/export")
async def export_industry_report(
    industry: Optional[str] = Query(None, description="行业"),
    year: int = Query(None, description="年份，默认当前年份"),
    month: int = Query(None, description="月份，默认当前月份"),
    db: Session = Depends(get_db_jns)
):
    """导出行业统计报表"""
    try:
        # 处理year和month参数
        if isinstance(year, dict):
            # 如果year是一个字典，尝试获取其值
            year = year.get('year', datetime.datetime.now().year)
        elif not year:
            # 如果year为None，使用当前年份
            year = datetime.datetime.now().year
        
        if isinstance(month, dict):
            # 如果month是一个字典，尝试获取其值
            month = month.get('month', datetime.datetime.now().month)
        elif not month:
            # 如果month为None，使用当前月份
            month = datetime.datetime.now().month
        
        # 生成近12个月的日期列表
        # 从当前月份开始，往前推11个月，确保包含当前月份
        months = []
        for i in range(11, -1, -1):
            # 计算月份，确保正确处理月份边界
            current_month = month - i
            current_year = year
            
            # 处理月份小于1的情况
            while current_month < 1:
                current_month += 12
                current_year -= 1
            
            # 处理月份大于12的情况
            while current_month > 12:
                current_month -= 12
                current_year += 1
            
            month_date = datetime.datetime(current_year, current_month, 1)
            months.append(month_date)
        
        # 生成月份列表
        month_list = []
        for month_date in months:
            month_list.append({
                "month": f"{month_date.year}-{str(month_date.month).zfill(2)}",
                "month_name": f"{month_date.year}年{month_date.month}月"
            })
        
        # 从数据库中获取客户信息、行业数据和业务负责人数据
        from app.models.customer import Customer
        
        # 获取所有客户及其简称、备注（行业信息）和业务负责人
        customers = db.query(Customer.客户名称, Customer.简称, Customer.备注, Customer.业务负责人).all()
        customer_industry_map = {}
        customer_manager_map = {}
        customer_shortname_map = {}
        for customer_name, shortname, remark, manager in customers:
            # 从备注中提取行业信息
            industry_from_remark = "其它"
            if remark:
                # 简单的行业提取逻辑，实际应用中可能需要更复杂的处理
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
            # 使用业务负责人，如果没有则显示空字符串
            customer_manager_map[customer_name] = manager or ""
            customer_shortname_map[customer_name] = shortname or customer_name
        
        # 预处理月份范围，避免重复计算
        month_ranges = []
        for month_date in months:
            month_str = f"{month_date.year}-{str(month_date.month).zfill(2)}"
            month_start = month_date
            if month_date.month == 12:
                month_end = datetime.datetime(month_date.year + 1, 1, 1)
            else:
                month_end = datetime.datetime(month_date.year, month_date.month + 1, 1)
            month_ranges.append((month_str, month_start, month_end))
        
        # 初始化统计数据
        customer_stats = []
        industry_stats_map = {}
        total_amount = 0
        
        # 检查是否为"全部行业"查询
        is_all_industry = not industry or not industry.strip()
        
        if is_all_industry:
            # 优化：直接按行业维度统计数据
            print("执行全部行业统计")
            
            # 获取所有行业类型
            industries = ["3C", "光伏", "机械手", "模组", "贸易", "平台", "其它"]
            
            # 先计算行业统计数据
            for target_industry in industries:
                # 初始化行业统计数据
                industry_stat = {
                    "industry": target_industry,
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                # 构建客户名称列表，只包含属于当前行业的客户
                industry_customers = [name for name, ind in customer_industry_map.items() if ind == target_industry]
                
                # 计算每个月的订单金额
                for month_str, month_start, month_end in month_ranges:
                    if industry_customers:
                        # 查询该行业该月份的订单金额
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
            
            # 计算客户统计数据 - 优化：使用单次数据库查询
            print("计算客户统计数据")
            
            # 构建日期范围
            if months:
                start_date = months[0]  # 最早的月份
                end_date = months[-1]  # 最晚的月份
                # 结束日期需要加1个月，以包含整个月
                if end_date.month == 12:
                    end_date = datetime.datetime(end_date.year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(end_date.year, end_date.month + 1, 1)
            else:
                # 如果没有月份数据，使用当前月份
                start_date = datetime.datetime(year, month, 1)
                if month == 12:
                    end_date = datetime.datetime(year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(year, month + 1, 1)
            
            # 单次查询获取所有客户的所有订单金额
            # 然后在内存中按月份和客户分组
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
            
            # 构建客户月度金额映射
            customer_monthly_map = {}
            for customer_name, order_date, amount in all_orders:
                if customer_name not in customer_monthly_map:
                    customer_monthly_map[customer_name] = {}
                month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
                if month_str not in customer_monthly_map[customer_name]:
                    customer_monthly_map[customer_name][month_str] = 0
                # 处理金额为None的情况
                if amount is not None:
                    customer_monthly_map[customer_name][month_str] += amount
            
            # 构建客户统计数据
            for customer_name, monthly_amounts in customer_monthly_map.items():
                # 获取客户业务负责人和简称
                customer_manager = customer_manager_map.get(customer_name, "")
                customer_shortname = customer_shortname_map.get(customer_name, customer_name)
                
                # 初始化客户数据
                customer_stat = {
                    "customer_name": customer_shortname,
                    "manager": customer_manager,
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                # 计算每个月的订单金额
                for month_str, month_start, month_end in month_ranges:
                    month_amount = round(monthly_amounts.get(month_str, 0), 2)
                    customer_stat["monthly_amounts"][month_str] = month_amount
                    customer_stat["amount"] += month_amount
                
                customer_stat["amount"] = round(customer_stat["amount"], 2)
                if customer_stat["amount"] > 0:  # 只添加有订单金额的客户
                    customer_stats.append(customer_stat)
        else:
            # 按原逻辑处理单个行业的查询
            print(f"执行单个行业统计: {industry}")
            
            # 构建日期范围
            if months:
                start_date = months[0]  # 最早的月份
                end_date = months[-1]  # 最晚的月份
                # 结束日期需要加1个月，以包含整个月
                if end_date.month == 12:
                    end_date = datetime.datetime(end_date.year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(end_date.year, end_date.month + 1, 1)
            else:
                # 如果没有月份数据，使用当前月份
                start_date = datetime.datetime(year, month, 1)
                if month == 12:
                    end_date = datetime.datetime(year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(year, month + 1, 1)
            
            # 获取该行业的客户列表
            industry_customers = [name for name, ind in customer_industry_map.items() if ind == industry]
            
            # 单次查询获取该行业所有客户的所有订单金额
            # 然后在内存中按月份和客户分组
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
            
            # 构建客户月度金额映射
            customer_monthly_map = {}
            for customer_name, order_date, amount in all_orders:
                if customer_name not in customer_monthly_map:
                    customer_monthly_map[customer_name] = {}
                month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
                if month_str not in customer_monthly_map[customer_name]:
                    customer_monthly_map[customer_name][month_str] = 0
                # 处理金额为None的情况
                if amount is not None:
                    customer_monthly_map[customer_name][month_str] += amount
            
            # 构建客户统计数据
            for customer_name, monthly_amounts in customer_monthly_map.items():
                # 获取客户业务负责人和简称
                customer_manager = customer_manager_map.get(customer_name, "")
                customer_shortname = customer_shortname_map.get(customer_name, customer_name)
                
                # 初始化客户数据
                customer_stat = {
                    "customer_name": customer_shortname,
                    "manager": customer_manager,
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                # 计算每个月的订单金额
                for month_str, month_start, month_end in month_ranges:
                    month_amount = round(monthly_amounts.get(month_str, 0), 2)
                    customer_stat["monthly_amounts"][month_str] = month_amount
                    customer_stat["amount"] += month_amount
                
                customer_stat["amount"] = round(customer_stat["amount"], 2)
                customer_stats.append(customer_stat)
                total_amount += customer_stat["amount"]
        
        # 处理行业统计数据
        industry_stats = []
        for industry_stat in industry_stats_map.values():
            industry_stat["amount"] = round(industry_stat["amount"], 2)
            for month_str, amount in industry_stat["monthly_amounts"].items():
                industry_stat["monthly_amounts"][month_str] = round(amount, 2)
            industry_stats.append(industry_stat)
        
        # 计算总金额
        total_amount = round(total_amount, 2)
        
        # 按订单金额合计降序排序
        customer_stats.sort(key=lambda x: x["amount"], reverse=True)
        
        # 生成PDF文件
        # 使用fpdf2库的默认设置，支持Unicode
        # 设置页面为横向
        pdf = FPDF(orientation='L')
        pdf.add_page()
        
        # 设置页边距
        pdf.set_margins(10, 10, 10)
        
        # 加载支持中文的字体
        font_loaded = False
        font_name = "helvetica"  # 默认字体
        if platform.system() == "Windows":
            # Windows系统下使用黑体字体
            font_path = "C:\\Windows\\Fonts\\simhei.ttf"
            print(f"Checking font path: {font_path}")
            print(f"Font file exists: {os.path.exists(font_path)}")
            if os.path.exists(font_path):
                try:
                    pdf.add_font("simhei", "", font_path, uni=True)
                    font_loaded = True
                    font_name = "simhei"
                    print("SimHei font loaded successfully")
                    print(f"Available fonts: {pdf.fonts}")
                except Exception as e:
                    print(f"Failed to load SimHei font: {e}")
        
        # 设置字体为支持中文的字体
        pdf.set_font(font_name, "", 16)
        print(f"Using font: {font_name}")
        
        # 添加标题（使用中文）
        pdf.cell(0, 15, "行业统计分析报表", 0, 1, "C")
        pdf.ln(10)
        
        # 添加筛选条件（使用中文）
        pdf.set_font(font_name, "", 12)
        pdf.cell(0, 10, f"行业: {industry if industry else '全部行业'}", 0, 1, "L")
        pdf.cell(0, 10, f"日期: {year}-{month:02d}", 0, 1, "L")
        pdf.cell(0, 10, f"总计: {total_amount}", 0, 1, "L")
        pdf.ln(10)
        
        # 计算表格列宽，确保表格内容在页面范围内完整呈现
        # 页面宽度约为277mm（A4纸横向宽度297mm减去左右边距20mm）
        # 客户简称列宽度
        customer_col_width = 30
        # 业务负责人列宽度
        manager_col_width = 25
        # 订单金额合计列宽度
        total_col_width = 25
        # 剩余宽度用于月份列
        remaining_width = 277 - customer_col_width - manager_col_width - total_col_width
        # 月份列宽度
        month_col_width = remaining_width / len(month_list) if len(month_list) > 0 else 28
        
        # 计算表格列宽
        col_widths = [customer_col_width, manager_col_width]  # 客户简称、业务负责人
        for _ in month_list:
            col_widths.append(month_col_width)
        col_widths.append(total_col_width)  # 订单金额合计
        
        # 添加表头
        pdf.set_font(font_name, "", 10)
        pdf.cell(customer_col_width, 10, "客户简称", 1, 0, "C")
        pdf.cell(manager_col_width, 10, "业务负责人", 1, 0, "C")
        for month_info in month_list:
            pdf.cell(month_col_width, 10, month_info["month"], 1, 0, "C")
        pdf.cell(total_col_width, 10, "合计", 1, 1, "C")
        
        # 添加客户数据行
        pdf.set_font(font_name, "", 10)
        for customer in customer_stats:
            pdf.cell(customer_col_width, 10, customer["customer_name"], 1, 0, "L")
            pdf.cell(manager_col_width, 10, customer["manager"], 1, 0, "L")
            for month_info in month_list:
                month_str = month_info["month"]
                month_amount = customer["monthly_amounts"].get(month_str, 0)
                pdf.cell(month_col_width, 10, str(month_amount), 1, 0, "R")
            pdf.cell(total_col_width, 10, str(customer["amount"]), 1, 1, "R")
        
        # 只在有行业统计数据时添加行业统计部分
        if industry_stats and len(industry_stats) > 0:
            # 添加行业统计数据
            pdf.ln(10)
            pdf.set_font(font_name, "", 12)
            pdf.cell(0, 10, "行业统计", 0, 1, "L")
            pdf.ln(5)
            
            # 重新计算行业统计表格列宽
            # 行业列宽度
            industry_col_width = 25
            # 剩余宽度用于月份列
            remaining_width = 277 - industry_col_width - total_col_width
            # 月份列宽度
            month_col_width = remaining_width / len(month_list) if len(month_list) > 0 else 28
            
            # 添加行业统计表头
            pdf.set_font(font_name, "", 10)
            pdf.cell(industry_col_width, 10, "行业", 1, 0, "C")
            for month_info in month_list:
                pdf.cell(month_col_width, 10, month_info["month"], 1, 0, "C")
            pdf.cell(total_col_width, 10, "合计", 1, 1, "C")
            
            # 添加行业数据行
            pdf.set_font(font_name, "", 10)
            for industry_stat in industry_stats:
                pdf.cell(industry_col_width, 10, industry_stat["industry"], 1, 0, "L")
                for month_info in month_list:
                    month_str = month_info["month"]
                    month_amount = industry_stat["monthly_amounts"].get(month_str, 0)
                    pdf.cell(month_col_width, 10, str(month_amount), 1, 0, "R")
                pdf.cell(total_col_width, 10, str(industry_stat["amount"]), 1, 1, "R")
        
        # 添加生成时间
        pdf.ln(15)
        pdf.set_font(font_name, "", 10)
        pdf.cell(0, 10, f"生成时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 0, 1, "R")
        
        # 输出PDF
        from io import BytesIO
        buffer = BytesIO()
        pdf.output(buffer)
        buffer.seek(0)
        
        # 返回PDF文件
        from fastapi.responses import StreamingResponse
        import urllib.parse
        
        # 对文件名进行URL编码，处理中文字符
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


@router.get("/product", response_model=dict)
async def get_product_report(
    product_type: Optional[str] = Query(None, description="产品类型"),
    year: int = Query(None, description="年份，默认当前年份"),
    month: int = Query(None, description="月份，默认当前月份"),
    page: int = Query(1, description="页码"),
    limit: int = Query(10, description="每页数量"),
    db: Session = Depends(get_db_jns)
):
    """获取产品统计报表数据"""
    try:
        # 如果没有指定年份和月份，使用当前年份和月份
        if not year:
            year = datetime.datetime.now().year
        if not month:
            month = datetime.datetime.now().month
        
        # 生成近12个月的日期列表
        months = []
        for i in range(11, -1, -1):
            # 计算月份，确保正确处理月份边界
            current_month = month - i
            current_year = year
            
            # 处理月份小于1的情况
            while current_month < 1:
                current_month += 12
                current_year -= 1
            
            # 处理月份大于12的情况
            while current_month > 12:
                current_month -= 12
                current_year += 1
            
            month_date = datetime.datetime(current_year, current_month, 1)
            months.append(month_date)
        
        # 生成月份列表
        month_list = []
        for month_date in months:
            month_list.append({
                "month": f"{month_date.year}-{str(month_date.month).zfill(2)}",
                "month_name": f"{month_date.year}年{month_date.month}月"
            })
        
        # 预处理月份范围，避免重复计算
        month_ranges = []
        for month_date in months:
            month_str = f"{month_date.year}-{str(month_date.month).zfill(2)}"
            month_start = month_date
            if month_date.month == 12:
                month_end = datetime.datetime(month_date.year + 1, 1, 1)
            else:
                month_end = datetime.datetime(month_date.year, month_date.month + 1, 1)
            month_ranges.append((month_str, month_start, month_end))
        
        # 构建日期范围
        if months:
            start_date = months[0]  # 最早的月份
            end_date = months[-1]  # 最晚的月份
            # 结束日期需要加1个月，以包含整个月
            if end_date.month == 12:
                end_date = datetime.datetime(end_date.year + 1, 1, 1)
            else:
                end_date = datetime.datetime(end_date.year, end_date.month + 1, 1)
        else:
            # 如果没有月份数据，使用当前月份
            start_date = datetime.datetime(year, month, 1)
            if month == 12:
                end_date = datetime.datetime(year + 1, 1, 1)
            else:
                end_date = datetime.datetime(year, month + 1, 1)
        
        # 构建查询
        query = db.query(
            Order.产品类型,
            Order.规格,
            OrderList.订单日期,
            Order.金额
        ).outerjoin(
            OrderList, Order.oid == OrderList.id
        ).filter(
            OrderList.订单日期 >= start_date,
            OrderList.订单日期 < end_date
        )
        
        # 如果指定了产品类型，添加筛选条件
        if product_type:
            query = query.filter(Order.产品类型 == product_type)
        
        # 执行查询
        all_orders = query.all()
        
        # 构建产品类型和规格的月度金额映射
        product_type_map = {}
        for product_type, spec, order_date, amount in all_orders:
            if product_type not in product_type_map:
                product_type_map[product_type] = {}
            if spec not in product_type_map[product_type]:
                product_type_map[product_type][spec] = {}
            month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
            if month_str not in product_type_map[product_type][spec]:
                product_type_map[product_type][spec][month_str] = 0
            # 处理金额为None的情况
            if amount is not None:
                product_type_map[product_type][spec][month_str] += amount
        
        # 构建产品统计数据
        product_stats = []
        total_amount = 0
        
        # 按产品类型和规格组织数据
        for product_type, specs in product_type_map.items():
            type_total = 0
            type_data = {
                "product_type": product_type or "其它",
                "specs": [],
                "amount": 0
            }
            
            # 按规格处理数据
            for spec, monthly_amounts in specs.items():
                spec_data = {
                    "spec": spec or "无规格",
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                # 计算每个月的订单金额
                for month_str, month_start, month_end in month_ranges:
                    month_amount = round(monthly_amounts.get(month_str, 0), 2)
                    spec_data["monthly_amounts"][month_str] = month_amount
                    spec_data["amount"] += month_amount
                
                spec_data["amount"] = round(spec_data["amount"], 2)
                type_data["specs"].append(spec_data)
                type_data["amount"] += spec_data["amount"]
                type_total += spec_data["amount"]
            
            type_data["amount"] = round(type_data["amount"], 2)
            product_stats.append(type_data)
            total_amount += type_total
        
        # 按产品类型的总金额降序排序
        product_stats.sort(key=lambda x: x["amount"], reverse=True)
        
        # 分页处理
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_products = product_stats[start_idx:end_idx]
        
        # 计算当前页产品的月度合计金额
        monthly_totals = {}
        for month_info in month_list:
            month_str = month_info["month"]
            month_total = 0
            for product in paginated_products:
                for spec in product["specs"]:
                    month_total += spec["monthly_amounts"].get(month_str, 0)
            monthly_totals[month_str] = round(month_total, 2)
        
        # 计算当前页产品的年度合计
        yearly_total = sum(product["amount"] for product in paginated_products)
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "year": year,
                "month": month,
                "products": paginated_products,
                "monthly_totals": monthly_totals,
                "yearly_total": round(yearly_total, 2),
                "total_products": len(product_stats),
                "current_page": page,
                "total_pages": (len(product_stats) + limit - 1) // limit,
                "limit": limit,
                "months": month_list
            }
        }
    except Exception as e:
        print(f"获取产品统计报表数据失败: {e}")
        import traceback
        traceback.print_exc()
        return {
            "code": 1,
            "msg": f"获取产品统计报表数据失败: {str(e)}",
            "data": {
                "year": year or datetime.datetime.now().year,
                "month": month or datetime.datetime.now().month,
                "products": [],
                "monthly_totals": {},
                "yearly_total": 0,
                "total_products": 0,
                "current_page": page,
                "total_pages": 0,
                "limit": limit,
                "months": []
            }
        }


@router.get("/product/types")
async def get_product_types(
    db: Session = Depends(get_db_jns)
):
    """获取所有产品类型列表（去重）"""
    try:
        # 查询所有不同的产品类型
        product_types = db.query(Order.产品类型).distinct().all()
        # 提取产品类型值，过滤None值，并排序
        types = [pt[0] for pt in product_types if pt[0]]
        types.sort()
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "types": types
            }
        }
    except Exception as e:
        print(f"获取产品类型列表失败: {e}")
        import traceback
        traceback.print_exc()
        return {
            "code": 1,
            "msg": f"获取产品类型列表失败: {str(e)}",
            "data": {
                "types": []
            }
        }

@router.get("/product/detail")
async def get_product_detail(
    product_type: str = Query(..., description="产品类型"),
    spec: str = Query(..., description="规格"),
    year: int = Query(None, description="年份，默认当前年份"),
    month: int = Query(None, description="月份，默认当前月份"),
    db: Session = Depends(get_db_jns)
):
    """获取产品详情数据，按宽度分类"""
    try:
        # 处理year和month参数
        if not year:
            year = datetime.datetime.now().year
        if not month:
            month = datetime.datetime.now().month
        
        # 生成近12个月的日期列表
        months = []
        for i in range(11, -1, -1):
            # 计算月份，确保正确处理月份边界
            current_month = month - i
            current_year = year
            
            # 处理月份小于1的情况
            while current_month < 1:
                current_month += 12
                current_year -= 1
            
            # 处理月份大于12的情况
            while current_month > 12:
                current_month -= 12
                current_year += 1
            
            month_date = datetime.datetime(current_year, current_month, 1)
            months.append(month_date)
        
        # 生成月份列表
        month_list = []
        for month_date in months:
            month_list.append({
                "month": f"{month_date.year}-{str(month_date.month).zfill(2)}",
                "month_name": f"{month_date.year}年{month_date.month}月"
            })
        
        # 预处理月份范围，避免重复计算
        month_ranges = []
        for month_date in months:
            month_str = f"{month_date.year}-{str(month_date.month).zfill(2)}"
            month_start = month_date
            if month_date.month == 12:
                month_end = datetime.datetime(month_date.year + 1, 1, 1)
            else:
                month_end = datetime.datetime(month_date.year, month_date.month + 1, 1)
            month_ranges.append((month_str, month_start, month_end))
        
        # 构建日期范围
        if months:
            start_date = months[0]  # 最早的月份
            end_date = months[-1]  # 最晚的月份
            # 结束日期需要加1个月，以包含整个月
            if end_date.month == 12:
                end_date = datetime.datetime(end_date.year + 1, 1, 1)
            else:
                end_date = datetime.datetime(end_date.year, end_date.month + 1, 1)
        else:
            # 如果没有月份数据，使用当前月份
            start_date = datetime.datetime(year, month, 1)
            if month == 12:
                end_date = datetime.datetime(year + 1, 1, 1)
            else:
                end_date = datetime.datetime(year, month + 1, 1)
        
        # 构建查询
        query = db.query(
            Order.产品类型,
            Order.规格,
            Order.型号,
            OrderList.订单日期,
            Order.金额
        ).outerjoin(
            OrderList, Order.oid == OrderList.id
        ).filter(
            Order.产品类型 == product_type,
            Order.规格 == spec,
            OrderList.订单日期 >= start_date,
            OrderList.订单日期 < end_date
        )
        
        # 执行查询
        all_orders = query.all()
        
        # 构建宽度的月度金额映射
        width_map = {}
        for product_type, spec, model, order_date, amount in all_orders:
            # 从型号中提取宽度信息（取型号字符串中第一个减号前的数字部分，保留小数点）
            width = "未知"
            if model:
                model_str = str(model)
                if "-" in model_str:
                    width_part = model_str.split("-")[0]
                    # 提取数字和小数点部分
                    width_num = "".join(c for c in width_part if c.isdigit() or c == '.')
                    if width_num:
                        # 确保格式正确，避免出现多个小数点
                        if width_num.count('.') > 1:
                            # 只保留第一个小数点
                            parts = width_num.split('.')
                            width_num = parts[0] + '.' + ''.join(parts[1:])
                        width = width_num
            
            if width not in width_map:
                width_map[width] = {}
            month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
            if month_str not in width_map[width]:
                width_map[width][month_str] = 0
            # 处理金额为None的情况
            if amount is not None:
                width_map[width][month_str] += amount
        
        # 构建宽度统计数据
        width_stats = []
        total_amount = 0
        monthly_totals = {}
        
        # 初始化月度合计
        for month in month_list:
            monthly_totals[month["month"]] = 0
        
        # 按宽度组织数据
        for width, monthly_amounts in width_map.items():
            width_data = {
                "width": width,
                "amount": 0,
                "monthly_amounts": {}
            }
            
            # 计算每个月的订单金额
            for month_str, month_start, month_end in month_ranges:
                month_amount = round(monthly_amounts.get(month_str, 0), 2)
                width_data["monthly_amounts"][month_str] = month_amount
                width_data["amount"] += month_amount
                monthly_totals[month_str] += month_amount
            
            width_data["amount"] = round(width_data["amount"], 2)
            width_stats.append(width_data)
            total_amount += width_data["amount"]
        
        # 按宽度数值排序
        width_stats.sort(key=lambda x: float(x["width"]) if x["width"] != "未知" and x["width"].replace('.', '', 1).isdigit() else (float('inf') if x["width"] == "未知" else 0))
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "widths": width_stats,
                "monthly_totals": monthly_totals,
                "yearly_total": round(total_amount, 2),
                "months": month_list
            }
        }
    except Exception as e:
        print(f"获取产品详情失败: {e}")
        import traceback
        traceback.print_exc()
        return {
            "code": 1,
            "msg": f"获取产品详情失败: {str(e)}",
            "data": {}
        }

@router.get("/product/export")
async def export_product_report(
    product_type: Optional[str] = Query(None, description="产品类型"),
    year: int = Query(None, description="年份，默认当前年份"),
    month: int = Query(None, description="月份，默认当前月份"),
    db: Session = Depends(get_db_jns)
):
    """导出产品统计报表数据为PDF"""
    try:
        # 处理year参数，确保它是一个数字
        if isinstance(year, dict):
            # 如果year是一个字典，尝试获取其值
            year = year.get('year', datetime.datetime.now().year)
        elif not year:
            # 如果year为None，使用当前年份
            year = datetime.datetime.now().year
        
        # 生成近12个月的日期列表
        # 从当前月份开始，往前推11个月，确保包含当前月份
        months = []
        for i in range(11, -1, -1):
            # 计算月份，确保正确处理月份边界
            current_month = month - i
            current_year = year
            
            # 处理月份小于1的情况
            while current_month < 1:
                current_month += 12
                current_year -= 1
            
            # 处理月份大于12的情况
            while current_month > 12:
                current_month -= 12
                current_year += 1
            
            month_date = datetime.datetime(current_year, current_month, 1)
            months.append(month_date)
        
        # 生成月份列表
        month_list = []
        for month_date in months:
            month_list.append({
                "month": f"{month_date.year}-{str(month_date.month).zfill(2)}",
                "month_name": f"{month_date.year}年{month_date.month}月"
            })
        
        # 预处理月份范围，避免重复计算
        month_ranges = []
        for month_date in months:
            month_str = f"{month_date.year}-{str(month_date.month).zfill(2)}"
            month_start = month_date
            if month_date.month == 12:
                month_end = datetime.datetime(month_date.year + 1, 1, 1)
            else:
                month_end = datetime.datetime(month_date.year, month_date.month + 1, 1)
            month_ranges.append((month_str, month_start, month_end))
        
        # 构建日期范围
        if months:
            start_date = months[0]  # 最早的月份
            end_date = months[-1]  # 最晚的月份
            # 结束日期需要加1个月，以包含整个月
            if end_date.month == 12:
                end_date = datetime.datetime(end_date.year + 1, 1, 1)
            else:
                end_date = datetime.datetime(end_date.year, end_date.month + 1, 1)
        else:
            # 如果没有月份数据，使用当前月份
            start_date = datetime.datetime(year, month, 1)
            if month == 12:
                end_date = datetime.datetime(year + 1, 1, 1)
            else:
                end_date = datetime.datetime(year, month + 1, 1)
        
        # 构建查询
        query = db.query(
            Order.产品类型,
            Order.规格,
            OrderList.订单日期,
            Order.金额
        ).outerjoin(
            OrderList, Order.oid == OrderList.id
        ).filter(
            OrderList.订单日期 >= start_date,
            OrderList.订单日期 < end_date
        )
        
        # 如果指定了产品类型，添加筛选条件
        if product_type:
            query = query.filter(Order.产品类型 == product_type)
        
        # 执行查询
        all_orders = query.all()
        
        # 构建产品类型和规格的月度金额映射
        product_type_map = {}
        for product_type, spec, order_date, amount in all_orders:
            if product_type not in product_type_map:
                product_type_map[product_type] = {}
            if spec not in product_type_map[product_type]:
                product_type_map[product_type][spec] = {}
            month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
            if month_str not in product_type_map[product_type][spec]:
                product_type_map[product_type][spec][month_str] = 0
            # 处理金额为None的情况
            if amount is not None:
                product_type_map[product_type][spec][month_str] += amount
        
        # 构建产品统计数据
        product_stats = []
        total_amount = 0
        
        # 按产品类型和规格组织数据
        for product_type, specs in product_type_map.items():
            type_total = 0
            type_data = {
                "product_type": product_type or "其它",
                "specs": [],
                "amount": 0
            }
            
            # 按规格处理数据
            for spec, monthly_amounts in specs.items():
                spec_data = {
                    "spec": spec or "无规格",
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
                # 计算每个月的订单金额
                for month_str, month_start, month_end in month_ranges:
                    month_amount = round(monthly_amounts.get(month_str, 0), 2)
                    spec_data["monthly_amounts"][month_str] = month_amount
                    spec_data["amount"] += month_amount
                
                spec_data["amount"] = round(spec_data["amount"], 2)
                type_data["specs"].append(spec_data)
                type_data["amount"] += spec_data["amount"]
                type_total += spec_data["amount"]
            
            type_data["amount"] = round(type_data["amount"], 2)
            product_stats.append(type_data)
            total_amount += type_total
        
        # 按产品类型的总金额降序排序
        product_stats.sort(key=lambda x: x["amount"], reverse=True)
        
        # 生成PDF文件
        # 使用fpdf2库的默认设置，支持Unicode
        # 设置页面为横向
        pdf = FPDF(orientation='L')
        pdf.add_page()
        
        # 设置页边距
        pdf.set_margins(10, 10, 10)
        
        # 加载支持中文的字体
        font_loaded = False
        font_name = "helvetica"  # 默认字体
        if platform.system() == "Windows":
            # Windows系统下使用黑体字体
            font_path = "C:\\Windows\\Fonts\\simhei.ttf"
            print(f"Checking font path: {font_path}")
            print(f"Font file exists: {os.path.exists(font_path)}")
            if os.path.exists(font_path):
                try:
                    pdf.add_font("simhei", "", font_path, uni=True)
                    font_loaded = True
                    font_name = "simhei"
                    print("SimHei font loaded successfully")
                    print(f"Available fonts: {pdf.fonts}")
                except Exception as e:
                    print(f"Failed to load SimHei font: {e}")
        
        # 设置字体为支持中文的字体
        pdf.set_font(font_name, "", 16)
        print(f"Using font: {font_name}")
        
        # 添加标题（使用中文）
        pdf.cell(0, 15, "产品统计分析报表", 0, 1, "C")
        pdf.ln(10)
        
        # 添加筛选条件（使用中文）
        pdf.set_font(font_name, "", 12)
        pdf.cell(0, 10, f"产品类型: {product_type if product_type else '全部产品'}", 0, 1, "L")
        pdf.cell(0, 10, f"日期: {year}-{month:02d}", 0, 1, "L")
        pdf.cell(0, 10, f"总计: {total_amount}", 0, 1, "L")
        pdf.ln(10)
        
        # 计算表格列宽，确保表格内容在页面范围内完整呈现
        # 页面宽度约为277mm（A4纸横向宽度297mm减去左右边距20mm）
        # 规格列宽度
        spec_col_width = 35
        # 订单金额合计列宽度
        total_col_width = 25
        # 剩余宽度用于月份列
        remaining_width = 277 - spec_col_width - total_col_width
        # 月份列宽度
        month_col_width = remaining_width / len(month_list) if len(month_list) > 0 else 28
        
        # 计算表格列宽
        col_widths = [spec_col_width]  # 规格
        for _ in month_list:
            col_widths.append(month_col_width)  # 每个月份列
        col_widths.append(total_col_width)  # 订单金额合计
        
        # 添加表头（使用中文）
        pdf.set_font(font_name, "", 9)  # 减小表头字体大小
        headers = ["规格"] + [month["month"] for month in month_list] + ["订单金额合计"]
        for i, header in enumerate(headers):
            pdf.cell(col_widths[i], 10, header, 1, 0, "C")
        pdf.ln()
        
        # 收集所有规格数据
        all_specs = []
        for product in product_stats:
            for spec in product["specs"]:
                all_specs.append(spec)
        
        # 按订单金额合计降序排序
        all_specs.sort(key=lambda x: x["amount"], reverse=True)
        
        # 添加数据行
        pdf.set_font(font_name, "", 8)  # 减小字体大小以适应更多内容
        row_height = 10  # 固定行高
        for spec in all_specs:
            spec_name = spec["spec"]
            spec_amount = spec["amount"]
            
            # 规格名称（不自动换行，居中显示）
            # 截断过长的规格名称
            max_spec_length = 15  # 最大字符数
            if len(spec_name) > max_spec_length:
                spec_name = spec_name[:max_spec_length] + "..."
            
            pdf.cell(col_widths[0], row_height, spec_name, 1, 0, "C")
            
            # 月份金额
            for i, month in enumerate(month_list):
                amount = spec["monthly_amounts"].get(month["month"], 0)
                # 确保数字格式保持小数点后2位
                amount_str = f"{amount:.2f}"
                pdf.cell(col_widths[i+1], row_height, amount_str, 1, 0, "R")
            
            # 规格总金额
            amount_str = f"{spec_amount:.2f}"
            pdf.cell(col_widths[-1], row_height, amount_str, 1, 1, "R")
        
        # 添加页脚
        pdf.set_font(font_name, "", 8)
        pdf.ln(10)
        pdf.cell(0, 10, f"生成时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 0, 1, "C")
        
        # 输出PDF
        from io import BytesIO
        buffer = BytesIO()
        pdf.output(buffer)
        buffer.seek(0)
        
        # 对文件名进行URL编码，处理中文字符
        import urllib.parse
        filename = f"产品统计分析_{product_type if product_type else '全部产品'}_{year}{month:02d}.pdf"
        encoded_filename = urllib.parse.quote(filename)
        
        # 返回PDF文件
        from fastapi.responses import StreamingResponse
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={encoded_filename}; filename*=UTF-8''{encoded_filename}"
            }
        )
    except Exception as e:
        print(f"导出产品统计报表数据失败: {e}")
        import traceback
        traceback.print_exc()
        return {
            "code": 1,
            "msg": f"导出产品统计报表数据失败: {str(e)}",
            "data": {}
        }
        
        # 生成PDF文件
        # 使用fpdf2库的默认设置，支持Unicode
        # 设置页面为横向
        pdf = FPDF(orientation='L')
        pdf.add_page()
        
        # 设置页边距
        pdf.set_margins(10, 10, 10)
        
        # 加载支持中文的字体
        font_loaded = False
        font_name = "helvetica"  # 默认字体
        if platform.system() == "Windows":
            # Windows系统下使用黑体字体
            font_path = "C:\\Windows\\Fonts\\simhei.ttf"
            print(f"Checking font path: {font_path}")
            print(f"Font file exists: {os.path.exists(font_path)}")
            if os.path.exists(font_path):
                try:
                    pdf.add_font("simhei", "", font_path, uni=True)
                    font_loaded = True
                    font_name = "simhei"
                    print("SimHei font loaded successfully")
                    print(f"Available fonts: {pdf.fonts}")
                except Exception as e:
                    print(f"Failed to load SimHei font: {e}")
        
        # 设置字体为支持中文的字体
        pdf.set_font(font_name, "", 16)
        print(f"Using font: {font_name}")
        
        # 添加标题（使用中文）
        pdf.cell(0, 15, "行业统计分析报表", 0, 1, "C")
        pdf.ln(10)
        
        # 添加筛选条件（使用中文）
        pdf.set_font(font_name, "", 12)
        pdf.cell(0, 10, f"行业: {industry if isinstance(industry, str) and industry else '全部行业'}", 0, 1, "L")
        pdf.cell(0, 10, f"日期: {year}-{month:02d}", 0, 1, "L")
        pdf.cell(0, 10, f"总计: {total_amount}", 0, 1, "L")
        pdf.ln(10)
        
        # 添加客户订单金额统计表（使用中文）
        pdf.set_font(font_name, "", 14)
        pdf.cell(0, 12, "客户订单金额统计", 0, 1, "C")
        pdf.ln(8)
        
        # 计算表格列宽，确保表格内容在页面范围内完整呈现
        # 页面宽度约为277mm（A4纸横向宽度297mm减去左右边距20mm）
        # 客户名称列宽度（继续减少）
        customer_col_width = 28
        # 业务负责人列宽度（继续减少）
        manager_col_width = 22
        # 订单金额合计列宽度（减少）
        total_col_width = 30
        # 剩余宽度用于月份列
        remaining_width = 277 - customer_col_width - manager_col_width - total_col_width
        # 月份列宽度（增加）
        month_col_width = remaining_width / len(month_list) if len(month_list) > 0 else 25
        
        # 计算表格列宽
        col_widths = [customer_col_width, manager_col_width]  # 客户简称和业务负责人
        for _ in month_list:
            col_widths.append(month_col_width)  # 每个月份列
        col_widths.append(total_col_width)  # 订单金额合计
        
        # 添加表头（使用中文）
        pdf.set_font(font_name, "", 10)
        headers = ["客户简称", "业务负责人"] + [month["month"] for month in month_list] + ["订单金额合计"]
        for i, header in enumerate(headers):
            pdf.cell(col_widths[i], 12, header, 1, 0, "C")
        pdf.ln()
        
        # 添加数据行
        pdf.set_font(font_name, "", 10)
        for customer in customer_stats:
            # 直接使用客户名称，不需要编码处理
            customer_name = customer["customer_name"]
            customer_manager = customer["manager"]
            # 客户简称列和业务负责人列显示内容居中
            pdf.cell(col_widths[0], 12, customer_name, 1, 0, "C")
            pdf.cell(col_widths[1], 12, customer_manager, 1, 0, "C")
            for i, month in enumerate(month_list):
                amount = customer["monthly_amounts"].get(month["month"], 0)
                # 确保数字格式保持小数点后2位
                amount_str = f"{amount:.2f}"
                pdf.cell(col_widths[i+2], 12, amount_str, 1, 0, "R")
            # 确保数字格式保持小数点后2位
            amount_str = f"{customer['amount']:.2f}"
            pdf.cell(col_widths[-1], 12, amount_str, 1, 1, "R")
        
        # 只有当行业统计数据不为空时才添加行业统计表格
        if industry_stats:
            # 添加行业统计表格（使用中文）
            pdf.add_page()
            pdf.set_font(font_name, "", 14)
            pdf.cell(0, 12, "行业统计", 0, 1, "C")
            pdf.ln(8)
            
            # 计算行业统计表格列宽
            industry_col_width = 35
            remaining_width = 277 - industry_col_width - total_col_width
            month_col_width = remaining_width / len(month_list) if len(month_list) > 0 else 25
            
            # 添加表头（使用中文）
            pdf.set_font(font_name, "", 10)
            pdf.cell(industry_col_width, 12, "行业", 1, 0, "C")
            for month in month_list:
                # 使用月份的数字格式
                month_str = month["month"]
                pdf.cell(month_col_width, 12, month_str, 1, 0, "C")
            pdf.cell(total_col_width, 12, "订单金额合计", 1, 1, "C")
            
            # 添加数据行
            pdf.set_font(font_name, "", 10)
            for industry_stat in industry_stats:
                # 直接使用行业名称，不需要编码处理
                industry_name = industry_stat["industry"]
                pdf.cell(industry_col_width, 12, industry_name, 1, 0, "L")
                for month in month_list:
                    amount = industry_stat["monthly_amounts"].get(month["month"], 0)
                    # 确保数字格式保持小数点后2位
                    amount_str = f"{amount:.2f}"
                    pdf.cell(month_col_width, 12, amount_str, 1, 0, "R")
                # 确保数字格式保持小数点后2位
                amount_str = f"{industry_stat['amount']:.2f}"
                pdf.cell(total_col_width, 12, amount_str, 1, 1, "R")
            
            # 添加页脚
            pdf.set_font(font_name, "", 8)
            pdf.ln(10)
            pdf.cell(0, 10, f"生成时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 0, 1, "C")
        else:
            # 如果没有行业统计数据，直接在客户订单金额统计页面添加页脚
            pdf.set_font(font_name, "", 8)
            pdf.ln(10)
            pdf.cell(0, 10, f"生成时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 0, 1, "C")
        
        # 生成PDF字节流
        pdf_output = pdf.output(dest="S")
        
        # 将bytearray对象转换为字节串
        pdf_bytes = bytes(pdf_output)
        
        # 构建文件名（使用固定字符串，避免参数类型问题）
        filename = "Industry_Report.pdf"
        
        # 返回PDF响应
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=Industry_Report.pdf"
            }
        )
    except Exception as e:
        print(f"导出行业统计报表数据失败: {e}")
        import traceback
        traceback.print_exc()
        return {
            "code": 1,
            "msg": f"导出行业统计报表数据失败: {str(e)}",
            "data": {}
        }
