from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.order_service import order_service

router = APIRouter()


@router.get("/all")
async def get_all_order_items(
    page: int = 1,
    limit: int = 10,
    query: Optional[str] = None,
    规格: Optional[str] = None,
    型号: Optional[str] = None,
    产品类型: Optional[str] = None,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取订单分项数据（支持分页）"""
    try:
        items, total = order_service.search(
            db, query=query, 规格=规格, 型号=型号, 产品类型=产品类型,
            page=page, page_size=limit
        )

        return {"code": 0, "msg": "success", "total": total, "data": [
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
        ]}
    except Exception as e:
        print(f"获取订单分项失败: {e}")
        import traceback
        traceback.print_exc()
        return {"code": 1, "msg": f"获取失败: {str(e)}", "total": 0, "data": []}


@router.get("/all-no-pagination")
async def get_all_order_items_no_pagination(
    query: Optional[str] = None,
    规格: Optional[str] = None,
    型号: Optional[str] = None,
    产品类型: Optional[str] = None,
    客户名称: Optional[str] = None,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有订单分项数据（不分页，返回全部）"""
    try:
        items = order_service.get_all_no_pagination(
            db, query=query, 规格=规格, 型号=型号, 产品类型=产品类型, 客户名称=客户名称
        )

        return {"code": 0, "msg": "success", "total": len(items), "data": [
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
        ]}
    except Exception as e:
        print(f"获取所有订单分项失败: {e}")
        import traceback
        traceback.print_exc()
        return {"code": 1, "msg": f"获取失败: {str(e)}", "total": 0, "data": []}


@router.get("/list/{order_id}")
async def get_order_items(
    order_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取订单项列表"""
    try:
        items = order_service.get_by_oid(db, order_id)
        return {"code": 0, "msg": "success", "data": {
            "list": [
                {
                    "id": item.id,
                    "oid": item.oid,
                    "订单编号": item.订单编号,
                    "合同编号": item.合同编号,
                    "规格": item.规格,
                    "产品类型": item.产品类型,
                    "型号": item.型号,
                    "数量": item.数量,
                    "单位": item.单位,
                    "销售单价": float(item.销售单价) if item.销售单价 else 0,
                    "金额": float(item.金额) if item.金额 else 0,
                    "备注": item.备注,
                    "结算方式": item.结算方式,
                    "发货单号": item.发货单号,
                    "快递单号": item.快递单号,
                    "客户物料编号": item.客户物料编号,
                    "外购": item.外购 if item.外购 is not None else False
                }
                for item in items
            ]
        }}
    except Exception as e:
        print(f"获取订单项失败: {e}")
        import traceback
        traceback.print_exc()
        return {"code": 1, "msg": f"获取失败: {str(e)}", "data": {"list": []}}


@router.post("/create")
async def create_order_item(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """创建订单项"""
    try:
        print("=== 开始处理订单子项目创建请求 ===")
        print(f"接收到的数据: {data}")

        order, error = order_service.create_order_item(db, data)

        if error:
            print(f"创建订单项失败: {error}")
            return {"code": 1, "msg": error, "data": {}}

        db.commit()
        print(f"订单项创建成功，ID: {order.id}")
        return {"code": 0, "msg": "创建成功", "data": {"id": order.id}}
    except Exception as e:
        db.rollback()
        error_msg = f"创建订单项失败: {str(e)}"
        print(f"{error_msg}")
        import traceback
        traceback.print_exc()
        return {"code": 1, "msg": error_msg, "data": {}}


@router.put("/update")
async def update_order_item(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """更新订单项"""
    try:
        item_id = data.get('id')
        if not item_id:
            return {"code": 1, "msg": "缺少订单项ID", "data": {}}

        item = order_service.get(db, item_id)
        if not item:
            return {"code": 1, "msg": "订单项不存在", "data": {}}

        updateable_fields = ['合同编号', '订单日期', '交货日期', '规格', '产品类型',
                           '型号', '数量', '单位', '销售单价', '备注', '结算方式',
                           '发货单号', '快递单号', '客户物料编号', '外购']

        update_data = {}
        for field in updateable_fields:
            if field in data and data[field] is not None:
                update_data[field] = data[field]

        if update_data:
            order_service.update(db, item_id, update_data)
            db.commit()
            # 验证更新是否成功
            updated_item = order_service.get(db, item_id)
            if not updated_item:
                return {"code": 1, "msg": "更新后数据获取失败", "data": {}}
            
            # 返回更新后的数据
            return {
                "code": 0,
                "msg": "更新成功",
                "data": {
                    "id": updated_item.id,
                    "oid": updated_item.oid,
                    "订单编号": updated_item.订单编号,
                    "合同编号": updated_item.合同编号,
                    "订单日期": updated_item.订单日期.strftime('%Y-%m-%d') if updated_item.订单日期 else None,
                    "交货日期": updated_item.交货日期.strftime('%Y-%m-%d') if updated_item.交货日期 else None,
                    "规格": updated_item.规格,
                    "产品类型": updated_item.产品类型,
                    "型号": updated_item.型号,
                    "数量": updated_item.数量,
                    "单位": updated_item.单位,
                    "销售单价": float(updated_item.销售单价) if updated_item.销售单价 else 0,
                    "金额": float(updated_item.金额) if updated_item.金额 else 0,
                    "备注": updated_item.备注,
                    "客户名称": updated_item.客户名称,
                    "结算方式": updated_item.结算方式,
                    "发货单号": updated_item.发货单号,
                    "快递单号": updated_item.快递单号,
                    "客户物料编号": updated_item.客户物料编号,
                    "外购": updated_item.外购 if updated_item.外购 is not None else False
                }
            }

        return {"code": 0, "msg": "无更新内容", "data": {}}
    except Exception as e:
        db.rollback()
        return {"code": 1, "msg": f"更新失败: {str(e)}", "data": {}}


@router.delete("/delete/{item_id}")
async def delete_order_item(
    item_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除订单项"""
    try:
        item = order_service.get(db, item_id)
        if not item:
            return {"code": 1, "msg": "订单项不存在", "data": {}}

        order_service.delete(db, item_id)
        db.commit()
        return {"code": 0, "msg": "删除成功", "data": {}}
    except Exception as e:
        db.rollback()
        return {"code": 1, "msg": f"删除失败: {str(e)}", "data": {}}