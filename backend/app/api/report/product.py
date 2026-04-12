import logging
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import datetime
from fpdf import FPDF
import os
import platform

from app.db.database import get_db_jns
from app.core.response import success_response, error_response

logger = logging.getLogger(__name__)
from app.models.order import Order, OrderList
from app.models.user import User
from app.api.auth import get_current_active_user


router = APIRouter()


@router.get("/product/export-data", response_model=dict)
async def get_product_export_data(
    product_type: Optional[str] = Query(None, description="产品类型"),
    year: int = Query(None, description="年份，默认当前年份"),
    month: int = Query(None, description="月份，默认当前月份"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取产品统计报表导出数据（不分页，返回全部数据）"""
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
        
        month_ranges = []
        for month_date in months:
            month_str = f"{month_date.year}-{str(month_date.month).zfill(2)}"
            month_start = month_date
            if month_date.month == 12:
                month_end = datetime.datetime(month_date.year + 1, 1, 1)
            else:
                month_end = datetime.datetime(month_date.year, month_date.month + 1, 1)
            month_ranges.append((month_str, month_start, month_end))
        
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
        
        if product_type:
            query = query.filter(Order.产品类型 == product_type)
        
        all_orders = query.all()
        
        product_type_map = {}
        for product_type, spec, order_date, amount in all_orders:
            if product_type not in product_type_map:
                product_type_map[product_type] = {}
            if spec not in product_type_map[product_type]:
                product_type_map[product_type][spec] = {}
            month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
            if month_str not in product_type_map[product_type][spec]:
                product_type_map[product_type][spec][month_str] = 0
            if amount is not None:
                product_type_map[product_type][spec][month_str] += amount
        
        product_stats = []
        total_amount = 0
        
        for product_type, specs in product_type_map.items():
            type_total = 0
            type_data = {
                "product_type": product_type or "其它",
                "specs": [],
                "amount": 0
            }
            
            for spec, monthly_amounts in specs.items():
                spec_data = {
                    "spec": spec or "无规格",
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
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
        
        product_stats.sort(key=lambda x: x["amount"], reverse=True)
        
        monthly_totals = {}
        for month_info in month_list:
            month_str = month_info["month"]
            month_total = 0
            for product in product_stats:
                for spec in product["specs"]:
                    month_total += spec["monthly_amounts"].get(month_str, 0)
            monthly_totals[month_str] = round(month_total, 2)
        
        yearly_total = sum(product["amount"] for product in product_stats)
        
        return success_response(data={
            "year": year,
            "month": month,
            "products": product_stats,
            "monthly_totals": monthly_totals,
            "yearly_total": round(yearly_total, 2),
            "total_amount": round(total_amount, 2),
            "months": month_list
        })
    except Exception as e:
        logger.error(f"获取产品统计导出数据失败: {e}")
        import traceback
        traceback.print_exc()
        return error_response(msg=f"获取产品统计导出数据失败: {str(e)}")


@router.get("/product", response_model=dict)
async def get_product_report(
    product_type: Optional[str] = Query(None, description="产品类型"),
    year: int = Query(None, description="年份，默认当前年份"),
    month: int = Query(None, description="月份，默认当前月份"),
    page: int = Query(1, description="页码"),
    limit: int = Query(10, description="每页数量"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取产品统计报表数据"""
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
        
        month_ranges = []
        for month_date in months:
            month_str = f"{month_date.year}-{str(month_date.month).zfill(2)}"
            month_start = month_date
            if month_date.month == 12:
                month_end = datetime.datetime(month_date.year + 1, 1, 1)
            else:
                month_end = datetime.datetime(month_date.year, month_date.month + 1, 1)
            month_ranges.append((month_str, month_start, month_end))
        
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
        
        if product_type:
            query = query.filter(Order.产品类型 == product_type)
        
        all_orders = query.all()
        
        product_type_map = {}
        for product_type, spec, order_date, amount in all_orders:
            if product_type not in product_type_map:
                product_type_map[product_type] = {}
            if spec not in product_type_map[product_type]:
                product_type_map[product_type][spec] = {}
            month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
            if month_str not in product_type_map[product_type][spec]:
                product_type_map[product_type][spec][month_str] = 0
            if amount is not None:
                product_type_map[product_type][spec][month_str] += amount
        
        product_stats = []
        total_amount = 0
        
        for product_type, specs in product_type_map.items():
            type_total = 0
            type_data = {
                "product_type": product_type or "其它",
                "specs": [],
                "amount": 0
            }
            
            for spec, monthly_amounts in specs.items():
                spec_data = {
                    "spec": spec or "无规格",
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
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
        
        product_stats.sort(key=lambda x: x["amount"], reverse=True)
        
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_products = product_stats[start_idx:end_idx]
        
        monthly_totals = {}
        for month_info in month_list:
            month_str = month_info["month"]
            month_total = 0
            for product in paginated_products:
                for spec in product["specs"]:
                    month_total += spec["monthly_amounts"].get(month_str, 0)
            monthly_totals[month_str] = round(month_total, 2)
        
        yearly_total = sum(product["amount"] for product in paginated_products)
        
        return success_response(data={
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
        })
    except Exception as e:
        logger.error(f"获取产品统计报表数据失败: {e}")
        import traceback
        traceback.print_exc()
        return error_response(msg=f"获取产品统计报表数据失败: {str(e)}")


@router.get("/product/types")
async def get_product_types(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有产品类型列表（去重）"""
    try:
        product_types = db.query(Order.产品类型).distinct().all()
        types = [pt[0] for pt in product_types if pt[0]]
        types.sort()
        
        return success_response(data={
            "types": types
        })
    except Exception as e:
        logger.error(f"获取产品类型列表失败: {e}")
        import traceback
        traceback.print_exc()
        return error_response(msg=f"获取产品类型列表失败: {str(e)}")


@router.get("/product/detail")
async def get_product_detail(
    product_type: str = Query(..., description="产品类型"),
    spec: str = Query(..., description="规格"),
    year: int = Query(None, description="年份，默认当前年份"),
    month: int = Query(None, description="月份，默认当前月份"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取产品详情数据，按宽度分类"""
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
        
        month_ranges = []
        for month_date in months:
            month_str = f"{month_date.year}-{str(month_date.month).zfill(2)}"
            month_start = month_date
            if month_date.month == 12:
                month_end = datetime.datetime(month_date.year + 1, 1, 1)
            else:
                month_end = datetime.datetime(month_date.year, month_date.month + 1, 1)
            month_ranges.append((month_str, month_start, month_end))
        
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
        
        all_orders = query.all()
        
        width_map = {}
        for product_type, spec, model, order_date, amount in all_orders:
            width = "未知"
            if model:
                model_str = str(model)
                if "-" in model_str:
                    width_part = model_str.split("-")[0]
                    width_num = "".join(c for c in width_part if c.isdigit() or c == '.')
                    if width_num:
                        if width_num.count('.') > 1:
                            parts = width_num.split('.')
                            width_num = parts[0] + '.' + ''.join(parts[1:])
                        width = width_num
            
            if width not in width_map:
                width_map[width] = {}
            month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
            if month_str not in width_map[width]:
                width_map[width][month_str] = 0
            if amount is not None:
                width_map[width][month_str] += amount
        
        width_stats = []
        total_amount = 0
        monthly_totals = {}
        
        for month in month_list:
            monthly_totals[month["month"]] = 0
        
        for width, monthly_amounts in width_map.items():
            width_data = {
                "width": width,
                "amount": 0,
                "monthly_amounts": {}
            }
            
            for month_str, month_start, month_end in month_ranges:
                month_amount = round(monthly_amounts.get(month_str, 0), 2)
                width_data["monthly_amounts"][month_str] = month_amount
                width_data["amount"] += month_amount
                monthly_totals[month_str] += month_amount
            
            width_data["amount"] = round(width_data["amount"], 2)
            width_stats.append(width_data)
            total_amount += width_data["amount"]
        
        width_stats.sort(key=lambda x: float(x["width"]) if x["width"] != "未知" and x["width"].replace('.', '', 1).isdigit() else (float('inf') if x["width"] == "未知" else 0))
        
        return success_response(data={
            "widths": width_stats,
            "monthly_totals": monthly_totals,
            "yearly_total": round(total_amount, 2),
            "months": month_list
        })
    except Exception as e:
        logger.error(f"获取产品详情失败: {e}")
        import traceback
        traceback.print_exc()
        return error_response(msg=f"获取产品详情失败: {str(e)}")


@router.get("/product/export")
async def export_product_report(
    product_type: Optional[str] = Query(None, description="产品类型"),
    year: int = Query(None, description="年份，默认当前年份"),
    month: int = Query(None, description="月份，默认当前月份"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """导出产品统计报表数据为PDF"""
    try:
        if isinstance(year, dict):
            year = year.get('year', datetime.datetime.now().year)
        elif not year:
            year = datetime.datetime.now().year
        
        if isinstance(month, dict):
            month = month.get('month', datetime.datetime.now().month)
        elif not month:
            month = datetime.datetime.now().month
        
        year = int(year)
        month = int(month)
        
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
        
        month_ranges = []
        for month_date in months:
            month_str = f"{month_date.year}-{str(month_date.month).zfill(2)}"
            month_start = month_date
            if month_date.month == 12:
                month_end = datetime.datetime(month_date.year + 1, 1, 1)
            else:
                month_end = datetime.datetime(month_date.year, month_date.month + 1, 1)
            month_ranges.append((month_str, month_start, month_end))
        
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
        
        if product_type:
            query = query.filter(Order.产品类型 == product_type)
        
        all_orders = query.all()
        
        product_type_map = {}
        for product_type, spec, order_date, amount in all_orders:
            if product_type not in product_type_map:
                product_type_map[product_type] = {}
            if spec not in product_type_map[product_type]:
                product_type_map[product_type][spec] = {}
            month_str = f"{order_date.year}-{str(order_date.month).zfill(2)}"
            if month_str not in product_type_map[product_type][spec]:
                product_type_map[product_type][spec][month_str] = 0
            if amount is not None:
                product_type_map[product_type][spec][month_str] += amount
        
        product_stats = []
        total_amount = 0
        
        for product_type, specs in product_type_map.items():
            type_total = 0
            type_data = {
                "product_type": product_type or "其它",
                "specs": [],
                "amount": 0
            }
            
            for spec, monthly_amounts in specs.items():
                spec_data = {
                    "spec": spec or "无规格",
                    "amount": 0,
                    "monthly_amounts": {}
                }
                
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
        
        product_stats.sort(key=lambda x: x["amount"], reverse=True)
        
        pdf = FPDF(orientation='L')
        pdf.add_page()
        pdf.set_margins(10, 10, 10)
        
        font_name = "helvetica"
        if platform.system() == "Windows":
            font_path = "C:\\Windows\\Fonts\\simhei.ttf"
            if os.path.exists(font_path):
                try:
                    pdf.add_font("simhei", "", font_path, uni=True)
                    font_name = "simhei"
                except Exception as e:
                    logger.warning(f"Failed to load SimHei font: {e}")
        
        pdf.set_font(font_name, "", 16)
        pdf.cell(0, 15, "产品统计分析报表", 0, 1, "C")
        pdf.ln(10)
        
        pdf.set_font(font_name, "", 12)
        pdf.cell(0, 10, f"产品类型: {product_type if product_type else '全部产品'}", 0, 1, "L")
        pdf.cell(0, 10, f"日期: {year}-{month:02d}", 0, 1, "L")
        pdf.cell(0, 10, f"总计: {total_amount}", 0, 1, "L")
        pdf.ln(10)
        
        spec_col_width = 35
        total_col_width = 25
        remaining_width = 277 - spec_col_width - total_col_width
        month_col_width = remaining_width / len(month_list) if len(month_list) > 0 else 28
        
        col_widths = [spec_col_width]
        for _ in month_list:
            col_widths.append(month_col_width)
        col_widths.append(total_col_width)
        
        pdf.set_font(font_name, "", 9)
        headers = ["规格"] + [month["month"] for month in month_list] + ["订单金额合计"]
        for i, header in enumerate(headers):
            pdf.cell(col_widths[i], 10, header, 1, 0, "C")
        pdf.ln()
        
        all_specs = []
        for product in product_stats:
            for spec in product["specs"]:
                all_specs.append(spec)
        
        all_specs.sort(key=lambda x: x["amount"], reverse=True)
        
        pdf.set_font(font_name, "", 8)
        row_height = 10
        for spec in all_specs:
            spec_name = spec["spec"]
            spec_amount = spec["amount"]
            
            max_spec_length = 15
            if len(spec_name) > max_spec_length:
                spec_name = spec_name[:max_spec_length] + "..."
            
            pdf.cell(col_widths[0], row_height, spec_name, 1, 0, "C")
            
            for i, m in enumerate(month_list):
                amount = spec["monthly_amounts"].get(m["month"], 0)
                amount_str = f"{amount:.2f}"
                pdf.cell(col_widths[i+1], row_height, amount_str, 1, 0, "R")
            
            amount_str = f"{spec_amount:.2f}"
            pdf.cell(col_widths[-1], row_height, amount_str, 1, 1, "R")
        
        pdf.set_font(font_name, "", 8)
        pdf.ln(10)
        pdf.cell(0, 10, f"生成时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 0, 1, "C")
        
        from io import BytesIO
        buffer = BytesIO()
        pdf.output(buffer)
        buffer.seek(0)
        
        import urllib.parse
        filename = f"产品统计分析_{product_type if product_type else '全部产品'}_{year}{month:02d}.pdf"
        encoded_filename = urllib.parse.quote(filename)
        
        from fastapi.responses import StreamingResponse
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={encoded_filename}; filename*=UTF-8''{encoded_filename}"
            }
        )
    except Exception as e:
        logger.error(f"导出产品统计报表数据失败: {e}")
        import traceback
        traceback.print_exc()
        return error_response(msg=f"导出产品统计报表数据失败: {str(e)}")
