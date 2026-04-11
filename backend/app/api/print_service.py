from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import os
import copy
from jinja2 import Template

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user

router = APIRouter()

# 模板目录
TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), 'templates')


def render_template(template_name: str, context: dict) -> str:
    """渲染模板文件"""
    template_path = os.path.join(TEMPLATE_DIR, template_name)
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"模板文件不存在: {template_path}")
    
    with open(template_path, 'r', encoding='utf-8') as f:
        template_content = f.read()
    
    template = Template(template_content)
    
    # 预处理 context，将所有值转换为字符串（保留列表和字典结构）
    def process_value(value):
        if value is None:
            return ''
        elif isinstance(value, list):
            return [process_value(item) for item in value]
        elif isinstance(value, dict):
            return {k: process_value(v) for k, v in value.items()}
        elif isinstance(value, (int, float)):
            return value
        else:
            return str(value)
    
    processed_context = {key: process_value(value) for key, value in context.items()}
    
    return template.render(**processed_context)


def prepare_delivery_data(data: dict) -> dict:
    """准备送货单数据"""
    items = data.get('items', [])
    
    if not items:
        items = []
    elif not isinstance(items, list):
        items = [items]
    
    total_amount = sum(float(item.get('金额', 0) or 0) for item in items)
    
    items_per_page = 8
    total_pages = (len(items) + items_per_page - 1) // items_per_page if items else 1
    
    pages = []
    for page_num in range(total_pages):
        start_idx = page_num * items_per_page
        end_idx = min(start_idx + items_per_page, len(items))
        page_items = items[start_idx:end_idx]
        
        # 深拷贝避免修改原始数据
        page_items = [copy.deepcopy(item) for item in page_items]
        
        # 添加序号
        for i, item in enumerate(page_items):
            item['index'] = start_idx + i + 1
        
        is_first = page_num == 0
        is_last = page_num == total_pages - 1
        
        pages.append({
            'page_num': page_num + 1,
            'items': page_items,
            'is_first': is_first,
            'is_last': is_last,
            'show_total': is_first or is_last
        })
    
    return {
        '发货单号': data.get('发货单号', ''),
        '客户名称': data.get('客户名称', ''),
        '发货日期': data.get('发货日期', ''),
        '快递公司': data.get('快递公司', ''),
        '快递单号': data.get('快递单号', ''),
        'pages': pages,
        'total_pages': total_pages,
        'total_amount': f'{total_amount:.2f}',
        'print_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }


def prepare_workorder_data(data: dict) -> dict:
    """准备生产工单数据"""
    return {
        '工单编号': data.get('工单编号', ''),
        '计划编号': data.get('计划编号', ''),
        '产线': data.get('产线', ''),
        '工单状态': data.get('工单状态', ''),
        'create_at': data.get('create_at', ''),
        '计划开始': data.get('计划开始', ''),
        '计划结束': data.get('计划结束', ''),
        '实际开始': data.get('实际开始', ''),
        '实际结束': data.get('实际结束', ''),
        '产品类型': data.get('产品类型', ''),
        '产品型号': data.get('产品型号', ''),
        '规格': data.get('规格', ''),
        '单位': data.get('单位', ''),
        '工单数量': data.get('工单数量', 0),
        '已完成数量': data.get('已完成数量', 0),
        '工序': data.get('工序', ''),
        '总工序': data.get('总工序', ''),
        'print_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }


def prepare_order_data(data: dict) -> dict:
    """准备订单合同数据"""
    items = data.get('items', [])
    
    # 深拷贝避免修改原始数据
    items = [copy.deepcopy(item) for item in items]
    
    # 添加序号
    for i, item in enumerate(items):
        item['index'] = i + 1
    
    return {
        '订单编号': data.get('订单编号', ''),
        '客户名称': data.get('客户名称', ''),
        '订单日期': data.get('订单日期', ''),
        '交货日期': data.get('交货日期', ''),
        '合同编号': data.get('合同编号', ''),
        'items': items,
        'print_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }


def prepare_report_data(data: dict) -> dict:
    """准备报工记录数据"""
    return {
        '报工编号': data.get('报工编号', ''),
        '工单编号': data.get('工单编号', ''),
        '报工日期': data.get('报工日期', ''),
        '报工人': data.get('报工人', ''),
        '检验员': data.get('检验员', ''),
        '报工数量': data.get('报工数量', 0),
        '合格数量': data.get('合格数量', 0),
        '不良数量': data.get('不良数量', 0),
        '工序': data.get('工序', ''),
        'print_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }


@router.get("/workorder/{order_id}", response_model=dict)
async def print_workorder(
    order_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """打印生产工单"""
    try:
        from app.models.production import ProductionOrder
        order = db.query(ProductionOrder).filter(ProductionOrder.id == order_id).first()
        
        if not order:
            return {"code": 1, "msg": "工单不存在", "data": {}}
        
        data = {
            "工单编号": order.工单编号,
            "计划编号": order.计划编号,
            "产线": order.产线,
            "工单状态": order.工单状态,
            "产品类型": order.产品类型,
            "产品型号": order.产品型号,
            "规格": order.规格,
            "单位": order.单位,
            "工单数量": order.工单数量,
            "已完成数量": order.已完成数量,
            "工序": order.工序,
            "总工序": order.总工序,
            "计划开始": order.计划开始.strftime('%Y-%m-%d') if order.计划开始 else '',
            "计划结束": order.计划结束.strftime('%Y-%m-%d') if order.计划结束 else '',
            "实际开始": order.实际开始.strftime('%Y-%m-%d %H:%M') if order.实际开始 else '',
            "实际结束": order.实际结束.strftime('%Y-%m-%d %H:%M') if order.实际结束 else '',
            "create_at": order.create_at.strftime('%Y-%m-%d %H:%M:%S') if order.create_at else '',
        }
        
        context = prepare_workorder_data(data)
        html = render_template('workorder.html', context)
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "type": "workorder",
                "html": html,
                "title": f"生产工单 - {order.工单编号}"
            }
        }
    except Exception as e:
        return {"code": 1, "msg": f"获取打印数据失败: {str(e)}", "data": {}}


@router.get("/delivery/{ship_id}", response_model=dict)
async def print_delivery(
    ship_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """打印送货单"""
    try:
        from app.models.ship import Ship
        from app.models.order import Order
        
        ship = db.query(Ship).filter(Ship.id == ship_id).first()
        if not ship:
            return {"code": 1, "msg": "发货记录不存在", "data": {}}
        
        # 安全获取字段值
        def safe_str(value):
            if value is None:
                return ''
            return str(value)
        
        def safe_date_str(value):
            if value is None:
                return ''
            return value.strftime('%Y-%m-%d')
        
        orders = db.query(Order).filter(Order.ship_id == ship_id).all()
        
        items = []
        for order in orders:
            # 安全获取字段值
            销售单价_val = float(order.销售单价) if order.销售单价 else 0.0
            金额_val = float(order.金额) if order.金额 else 0.0
            
            order_dict = {
                "产品型号": safe_str(order.型号),
                "规格": safe_str(order.规格),
                "产品类型": safe_str(order.产品类型),
                "数量": int(order.数量) if order.数量 else 0,
                "单位": safe_str(order.单位),
                "销售单价": 销售单价_val,
                "金额": 金额_val,
            }
            items.append(order_dict)
        
        data = {
            "发货单号": safe_str(ship.发货单号),
            "快递单号": safe_str(ship.快递单号),
            "快递公司": safe_str(ship.快递公司),
            "客户名称": safe_str(ship.客户名称),
            "发货日期": safe_date_str(ship.发货日期),
            "items": items,
        }
        
        # 准备数据
        context = prepare_delivery_data(data)
        html = render_template('delivery.html', context)
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "type": "delivery",
                "html": html,
                "title": f"送货单 - {ship.发货单号}"
            }
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"code": 1, "msg": f"获取打印数据失败: {str(e)}", "data": {}}


@router.get("/order/{order_id}", response_model=dict)
async def print_order(
    order_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """打印订单合同"""
    try:
        from app.models.order import Order, OrderList
        
        order_list = db.query(OrderList).filter(OrderList.id == order_id).first()
        if not order_list:
            return {"code": 1, "msg": "订单不存在", "data": {}}
        
        orders = db.query(Order).filter(Order.oid == order_id).all()
        
        items = []
        for order in orders:
            items.append({
                "产品型号": order.型号,
                "规格": order.规格,
                "产品类型": order.产品类型,
                "数量": order.数量,
                "单位": order.单位,
                "销售单价": f"{float(order.销售单价 or 0):.2f}",
                "金额": f"{float(order.金额 or 0):.2f}",
            })
        
        data = {
            "订单编号": order_list.订单编号,
            "客户名称": order_list.客户名称,
            "订单日期": order_list.订单日期.strftime('%Y-%m-%d') if order_list.订单日期 else '',
            "交货日期": order_list.交货日期.strftime('%Y-%m-%d') if order_list.交货日期 else '',
            "合同编号": orders[0].合同编号 if orders else '',
            "items": items,
        }
        
        context = prepare_order_data(data)
        html = render_template('order.html', context)
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "type": "order",
                "html": html,
                "title": f"订单合同 - {order_list.订单编号}"
            }
        }
    except Exception as e:
        return {"code": 1, "msg": f"获取打印数据失败: {str(e)}", "data": {}}


@router.get("/report/{report_id}", response_model=dict)
async def print_report(
    report_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """打印报工记录"""
    try:
        from app.models.production import ProductionReport
        report = db.query(ProductionReport).filter(ProductionReport.id == report_id).first()
        
        if not report:
            return {"code": 1, "msg": "报工记录不存在", "data": {}}
        
        data = {
            "报工编号": report.报工编号,
            "工单编号": report.工单编号,
            "报工日期": report.报工日期.strftime('%Y-%m-%d') if report.报工日期 else '',
            "报工人": report.报工人,
            "检验员": report.检验员 or '',
            "报工数量": report.报工数量,
            "合格数量": report.合格数量,
            "不良数量": report.不良数量,
            "工序": report.工序 or '',
        }
        
        context = prepare_report_data(data)
        html = render_template('report.html', context)
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "type": "report",
                "html": html,
                "title": f"报工记录 - {report.报工编号}"
            }
        }
    except Exception as e:
        return {"code": 1, "msg": f"获取打印数据失败: {str(e)}", "data": {}}


@router.post("/preview", response_model=dict)
async def print_preview(
    data: dict,
    type: str = Query(..., description="打印类型: workorder, delivery, order, report"),
    current_user: User = Depends(get_current_active_user)
):
    """自定义打印预览"""
    type_map = {
        "workorder": ("生产工单", prepare_workorder_data, "workorder.html"),
        "delivery": ("送货单", prepare_delivery_data, "delivery.html"),
        "order": ("订单合同", prepare_order_data, "order.html"),
        "report": ("报工记录", prepare_report_data, "report.html"),
    }
    
    if type not in type_map:
        return {"code": 1, "msg": "无效的打印类型", "data": {}}
    
    title, prepare_func, template_name = type_map[type]
    
    try:
        context = prepare_func(data)
        html = render_template(template_name, context)
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "type": type,
                "html": html,
                "title": title
            }
        }
    except Exception as e:
        return {"code": 1, "msg": f"生成打印模板失败: {str(e)}", "data": {}}
