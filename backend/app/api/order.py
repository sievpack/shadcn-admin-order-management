from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime, timedelta
from app.db.database import get_db_jns
from app.models.order import Order, OrderList
from app.schemas.order import OrderCreate, OrderUpdate
import random
import string

router = APIRouter()


def generate_order_number():
    """生成订单编号"""
    date_str = datetime.now().strftime('%Y%m%d')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"DH-{date_str}-{random_str}"


@router.get("/data")
async def get_orders(
    page: int = 1,
    pageSize: int = 10,
    query: Optional[str] = None,
    id: Optional[int] = None,
    db: Session = Depends(get_db_jns)
):
    """获取订单列表"""
    try:
        query_obj = db.query(OrderList)

        if id:
            query_obj = query_obj.filter(OrderList.id == id)
        elif query:
            search_pattern = f"%{query}%"
            query_obj = query_obj.filter(
                OrderList.订单编号.like(search_pattern) |
                OrderList.客户名称.like(search_pattern)
            )

        total = query_obj.count()
        items = query_obj.order_by(OrderList.id.desc()).offset((page - 1) * pageSize).limit(pageSize).all()

        return {
            "code": 0,
            "msg": "success",
            "total": total,
            "data": [
                {
                    "id": item.id,
                    "订单编号": item.订单编号,
                    "客户名称": item.客户名称,
                    "订单日期": item.订单日期.strftime('%Y-%m-%d') if item.订单日期 else None,
                    "交货日期": item.交货日期.strftime('%Y-%m-%d') if item.交货日期 else None,
                    "status": item.status
                }
                for item in items
            ]
        }
    except Exception as e:
        print(f"获取订单列表失败: {e}")
        return {
            "code": 1,
            "msg": "获取失败",
            "data": {}
        }


@router.get("/all")
async def get_all_orders(db: Session = Depends(get_db_jns)):
    """获取所有订单"""
    try:
        orders = db.query(OrderList).order_by(OrderList.id.desc()).all()
        return {
            "code": 0,
            "msg": "获取成功",
            "data": [
                {
                    "id": order.id,
                    "订单编号": order.订单编号,
                    "客户名称": order.客户名称,
                    "订单日期": order.订单日期.strftime('%Y-%m-%d') if order.订单日期 else None,
                    "交货日期": order.交货日期.strftime('%Y-%m-%d') if order.交货日期 else None,
                    "status": order.status
                }
                for order in orders
            ]
        }
    except Exception as e:
        print(f"获取所有订单失败: {e}")
        return {
            "code": 1,
            "msg": "获取失败",
            "data": []
        }


@router.get("/all-items")
async def get_all_order_items(
    db: Session = Depends(get_db_jns)
):
    """获取所有订单分项数据（不分页，返回全部）"""
    try:
        query_obj = db.query(Order).order_by(Order.id.desc())
        total = query_obj.count()
        items = query_obj.all()

        return {
            "code": 0,
            "msg": "获取成功",
            "total": total,
            "data": [
                {
                    "id": item.id,
                    "oid": item.oid,
                    "订单编号": item.订单编号,
                    "合同编号": item.合同编号,
                    "订单日期": item.订单日期.strftime('%Y-%m-%d') if item.订单日期 else None,
                    "交货日期": item.交货日期.strftime('%Y-%m-%d') if item.交货日期 else None,
                    "规格": item.规格,
                    "产品类型": item.产品类型,
                    "型号": item.型号,
                    "数量": item.数量,
                    "单位": item.单位,
                    "销售单价": float(item.销售单价) if item.销售单价 else 0,
                    "金额": float(item.金额) if item.金额 else 0,
                    "备注": item.备注,
                    "客户名称": item.客户名称,
                    "结算方式": item.结算方式,
                    "发货单号": item.发货单号,
                    "快递单号": item.快递单号,
                    "客户物料编号": item.客户物料编号,
                    "外购": item.外购 if item.外购 is not None else False
                }
                for item in items
            ]
        }
    except Exception as e:
        print(f"获取所有订单分项失败: {e}")
        import traceback
        traceback.print_exc()
        return {
            "code": 1,
            "msg": f"获取失败: {str(e)}",
            "total": 0,
            "data": []
        }


@router.get("/items/{order_id}")
async def get_order_items(order_id: int, db: Session = Depends(get_db_jns)):
    """获取订单项列表"""
    try:
        items = db.query(Order).filter(Order.oid == order_id).all()
        return {
            "code": 0,
            "msg": "获取成功",
            "data": [
                {
                    "id": item.id,
                    "oid": item.oid,
                    "合同编号": item.合同编号,
                    "规格": item.规格,
                    "产品类型": item.产品类型,
                    "型号": item.型号,
                    "数量": item.数量,
                    "单位": item.单位,
                    "销售单价": item.销售单价,
                    "金额": item.金额,
                    "备注": item.备注,
                    "结算方式": item.结算方式,
                    "发货单号": item.发货单号,
                    "快递单号": item.快递单号,
                    "客户物料编号": item.客户物料编号,
                    "外购": item.外购,
                }
                for item in items
            ]
        }
    except Exception as e:
        print(f"获取订单项失败: {e}")
        return {
            "code": 1,
            "msg": "获取失败",
            "data": []
        }


@router.post("/create")
async def create_order(
    data: dict,
    db: Session = Depends(get_db_jns)
):
    """创建订单"""
    try:
        order = OrderList(
            订单编号=data.get("order_number"),
            客户名称=data.get("customer_name"),
            订单日期=datetime.strptime(data.get("order_date"), '%Y-%m-%d') if data.get("order_date") else datetime.now(),
            交货日期=datetime.strptime(data.get("delivery_date"), '%Y-%m-%d') if data.get("delivery_date") else datetime.now(),
            status=data.get("status", False)
        )
        
        db.add(order)
        db.commit()
        db.refresh(order)
        
        return {
            "code": 0,
            "msg": "创建成功",
            "data": {"id": order.id}
        }
    except Exception as e:
        print(f"创建订单失败: {e}")
        db.rollback()
        return {
            "code": 1,
            "msg": "创建失败",
            "data": {}
        }


@router.post("/test_db")
async def test_db_connection(
    db: Session = Depends(get_db_jns)
):
    """测试数据库连接"""
    try:
        print("=== 测试数据库连接 ===")
        result = db.execute("SELECT 1")
        print(f"数据库连接测试结果: {result.fetchone()}")
        
        order_list_count = db.query(OrderList).count()
        print(f"订单列表数量: {order_list_count}")
        
        return {
            "code": 0,
            "msg": "数据库连接测试成功",
            "data": {"order_list_count": order_list_count}
        }
    except Exception as e:
        import traceback
        error_message = f"数据库连接测试失败: {str(e)}"
        error_stack = traceback.format_exc()
        print(f"=== 发生异常 ===")
        print(f"数据库连接测试失败: {e}")
        print(f"错误堆栈: {error_stack}")
        return {
            "code": 1,
            "msg": error_message,
            "data": {"error": error_message, "stack": error_stack}
        }


@router.post("/create_item")
async def create_order_item(
    data: dict,
    db: Session = Depends(get_db_jns)
):
    """创建订单项"""
    try:
        print("=== 开始处理订单子项目创建请求 ===")
        print(f"接收到的数据: {data}")
        
        required_fields = ['oid', '订单编号', '合同编号', '订单日期', '交货日期', '规格', '产品类型', '型号', '数量', '单位', '销售单价', '客户名称', '外购']
        missing_fields = []
        for field in required_fields:
            if field not in data or data[field] is None or data[field] == '':
                missing_fields.append(field)
        
        if missing_fields:
            error_msg = f"缺少必填字段: {', '.join(missing_fields)}"
            print(f"创建订单项失败: {error_msg}")
            return {
                "code": 1,
                "msg": error_msg,
                "data": {"missing_fields": missing_fields}
            }
        
        print("=== 验证通过，开始创建订单项 ===")
        
        from sqlalchemy import insert
        
        insert_data = {
            "oid": data.get("oid"),
            "订单编号": data.get("订单编号"),
            "合同编号": data.get("合同编号"),
            "订单日期": datetime.strptime(data.get("订单日期"), '%Y-%m-%d').date() if data.get("订单日期") else datetime.now().date(),
            "交货日期": datetime.strptime(data.get("交货日期"), '%Y-%m-%d').date() if data.get("交货日期") else datetime.now().date(),
            "规格": data.get("规格"),
            "产品类型": data.get("产品类型"),
            "型号": data.get("型号"),
            "数量": int(data.get("数量")) if data.get("数量") else 0,
            "单位": data.get("单位"),
            "销售单价": float(data.get("销售单价")) if data.get("销售单价") else 0.0,
            "备注": data.get("备注"),
            "客户名称": data.get("客户名称"),
            "结算方式": data.get("结算方式"),
            "发货单号": data.get("发货单号"),
            "快递单号": data.get("快递单号"),
            "客户物料编号": data.get("客户物料编号"),
            "外购": data.get("外购", False) if isinstance(data.get("外购"), bool) else bool(data.get("外购"))
        }
        
        print(f"准备插入数据: {insert_data}")
        
        stmt = insert(Order).values(**insert_data).returning(Order.id)
        result = db.execute(stmt)
        new_id = result.scalar_one()
        db.commit()
        
        print(f"订单项创建成功，ID: {new_id}")
        
        return {
            "code": 0,
            "msg": "创建成功",
            "data": {"id": new_id}
        }
    except Exception as e:
        db.rollback()
        error_msg = f"创建订单项失败: {str(e)}"
        print(f"{error_msg}")
        import traceback
        traceback.print_exc()
        return {
            "code": 1,
            "msg": error_msg,
            "data": {}
        }


@router.put("/update_order")
async def update_order(data: dict, db: Session = Depends(get_db_jns)):
    """更新订单"""
    try:
        order_id = data.get('id')
        if not order_id:
            return {"code": 1, "msg": "缺少订单ID", "data": {}}
        
        order = db.query(OrderList).filter(OrderList.id == order_id).first()
        if not order:
            return {"code": 1, "msg": "订单不存在", "data": {}}
        
        if 'delivery_date' in data and data['delivery_date']:
            order.交货日期 = datetime.strptime(data['delivery_date'], '%Y-%m-%d')
        if 'status' in data:
            order.status = data['status']
        
        db.commit()
        
        return {"code": 0, "msg": "更新成功", "data": {}}
    except Exception as e:
        db.rollback()
        return {"code": 1, "msg": f"更新失败: {str(e)}", "data": {}}


@router.put("/update")
async def update_order_item(data: dict, db: Session = Depends(get_db_jns)):
    """更新订单项"""
    try:
        item_id = data.get('id')
        if not item_id:
            return {"code": 1, "msg": "缺少订单项ID", "data": {}}
        
        item = db.query(Order).filter(Order.id == item_id).first()
        if not item:
            return {"code": 1, "msg": "订单项不存在", "data": {}}
        
        updateable_fields = ['规格', '产品类型', '型号', '数量', '单位', '销售单价', '备注', '结算方式', '发货单号', '快递单号', '客户物料编号', '外购']
        for field in updateable_fields:
            if field in data and data[field] is not None:
                setattr(item, field, data[field])
        
        db.commit()
        
        return {"code": 0, "msg": "更新成功", "data": {}}
    except Exception as e:
        db.rollback()
        return {"code": 1, "msg": f"更新失败: {str(e)}", "data": {}}


@router.delete("/delete/{order_id}")
async def delete_order(order_id: int, db: Session = Depends(get_db_jns)):
    """删除订单"""
    try:
        order = db.query(OrderList).filter(OrderList.id == order_id).first()
        if not order:
            return {"code": 1, "msg": "订单不存在", "data": {}}
        
        db.query(Order).filter(Order.oid == order_id).delete()
        db.delete(order)
        db.commit()
        
        return {"code": 0, "msg": "删除成功", "data": {}}
    except Exception as e:
        db.rollback()
        return {"code": 1, "msg": f"删除失败: {str(e)}", "data": {}}


@router.delete("/remove/{item_id}")
async def delete_order_item(item_id: int, db: Session = Depends(get_db_jns)):
    """删除订单项"""
    try:
        item = db.query(Order).filter(Order.id == item_id).first()
        if not item:
            return {"code": 1, "msg": "订单项不存在", "data": {}}
        
        db.delete(item)
        db.commit()
        
        return {"code": 0, "msg": "删除成功", "data": {}}
    except Exception as e:
        db.rollback()
        return {"code": 1, "msg": f"删除失败: {str(e)}", "data": {}}


@router.get("/generate_order_id")
async def generate_order_id():
    """生成订单编号"""
    try:
        order_number = generate_order_number()
        return {
            "code": 0,
            "msg": "success",
            "data": {"order_number": order_number}
        }
    except Exception as e:
        return {
            "code": 1,
            "msg": f"生成订单编号失败: {str(e)}",
            "data": {}
        }


@router.get("/stats")
async def get_sales_stats(db: Session = Depends(get_db_jns)):
    """获取销售统计数据"""
    try:
        today = datetime.now().date()
        today_start = datetime(today.year, today.month, today.day)
        month_start = today.replace(day=1)
        
        today_order_amount = 0
        today_shipped_amount = 0
        month_order_amount = 0
        month_shipped_amount = 0
        
        try:
            today_order_result = db.query(func.coalesce(func.sum(Order.金额), 0)).filter(
                Order.订单日期 >= today_start
            ).scalar()
            today_order_amount = float(today_order_result) if today_order_result else 0
        except:
            pass
        
        try:
            month_order_result = db.query(func.coalesce(func.sum(Order.金额), 0)).filter(
                Order.订单日期 >= month_start
            ).scalar()
            month_order_amount = float(month_order_result) if month_order_result else 0
        except:
            pass
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "today_order_amount": today_order_amount,
                "today_shipped_amount": today_shipped_amount,
                "month_order_amount": month_order_amount,
                "month_shipped_amount": month_shipped_amount,
                "month_outsource_order_amount": 0,
                "month_outsource_shipped_amount": 0,
                "unpaid_order_amount": 0,
                "unshipped_order_amount": 0,
                "yearly_total": month_order_amount,
                "monthly_totals": {},
                "recent_12_months": []
            }
        }
    except Exception as e:
        print(f"获取销售统计失败: {e}")
        import traceback
        traceback.print_exc()
        return {
            "code": 1,
            "msg": f"获取失败: {str(e)}",
            "data": {}
        }


@router.get("/sales-trend")
async def get_sales_trend(period: str = "month", db: Session = Depends(get_db_jns)):
    """获取销售趋势数据"""
    try:
        trend_data = []
        
        if period == "month":
            for i in range(30, 0, -1):
                date = (datetime.now() - timedelta(days=i)).date()
                date_str = date.strftime('%Y-%m-%d')
                
                order_value = 0
                ship_value = 0
                
                try:
                    day_start = datetime(date.year, date.month, date.day)
                    day_end = day_start + timedelta(days=1)
                    
                    order_result = db.query(func.coalesce(func.sum(Order.金额), 0)).filter(
                        Order.订单日期 >= day_start.date(),
                        Order.订单日期 < day_end.date()
                    ).scalar()
                    order_value = float(order_result) if order_result else 0
                except:
                    pass
                
                trend_data.append({
                    "date": date_str,
                    "order_value": order_value,
                    "ship_value": ship_value
                })
        elif period == "week":
            for i in range(7, 0, -1):
                date = (datetime.now() - timedelta(days=i)).date()
                date_str = date.strftime('%Y-%m-%d')
                
                order_value = 0
                ship_value = 0
                
                try:
                    day_start = datetime(date.year, date.month, date.day)
                    day_end = day_start + timedelta(days=1)
                    
                    order_result = db.query(func.coalesce(func.sum(Order.金额), 0)).filter(
                        Order.订单日期 >= day_start.date(),
                        Order.订单日期 < day_end.date()
                    ).scalar()
                    order_value = float(order_result) if order_result else 0
                except:
                    pass
                
                trend_data.append({
                    "date": date_str,
                    "order_value": order_value,
                    "ship_value": ship_value
                })
        elif period == "year":
            for i in range(12, 0, -1):
                date = (datetime.now() - relativedelta(months=i)).date()
                month_start = date.replace(day=1)
                if date.month == 12:
                    month_end = date.replace(year=date.year + 1, month=1, day=1)
                else:
                    month_end = date.replace(month=date.month + 1, day=1)
                
                date_str = date.strftime('%Y-%m')
                
                order_value = 0
                ship_value = 0
                
                try:
                    order_result = db.query(func.coalesce(func.sum(Order.金额), 0)).filter(
                        Order.订单日期 >= month_start.date(),
                        Order.订单日期 < month_end.date()
                    ).scalar()
                    order_value = float(order_result) if order_result else 0
                except:
                    pass
                
                trend_data.append({
                    "date": date_str,
                    "order_value": order_value,
                    "ship_value": ship_value
                })
        
        return {
            "code": 0,
            "msg": "success",
            "data": trend_data
        }
    except Exception as e:
        print(f"获取销售趋势失败: {e}")
        import traceback
        traceback.print_exc()
        return {
            "code": 1,
            "msg": f"获取失败: {str(e)}",
            "data": []
        }

try:
    from dateutil.relativedelta import relativedelta
except ImportError:
    pass
