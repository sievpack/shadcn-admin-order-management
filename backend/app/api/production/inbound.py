from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.production_service import product_inbound_service

router = APIRouter()


@router.get("/list")
async def get_inbound_list(
    query: Optional[str] = None,
    入库单号: Optional[str] = None,
    工单编号: Optional[str] = None,
    质检单号: Optional[str] = None,
    仓库: Optional[str] = None,
    入库状态: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取成品入库列表"""
    items, total = product_inbound_service.search(
        db, query=query, 入库单号=入库单号, 工单编号=工单编号, 质检单号=质检单号,
        仓库=仓库, 入库状态=入库状态, start_date=start_date, end_date=end_date,
        page=page, page_size=limit
    )
    data = [product_inbound_service.to_dict(item) for item in items]

    return {
        "code": 0,
        "msg": "success",
        "count": total,
        "data": data
    }


@router.get("/warehouses")
async def get_warehouses(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有仓库列表"""
    try:
        warehouses = product_inbound_service.get_all_仓库(db)
        return {"code": 0, "msg": "success", "count": len(warehouses), "data": warehouses}
    except Exception as e:
        return {"code": 1, "msg": f"获取仓库列表失败: {str(e)}", "count": 0, "data": []}


@router.get("/stats")
async def get_inbound_stats(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取入库统计"""
    from sqlalchemy import func
    from app.models.production import ProductInbound
    
    try:
        total_inbound = db.query(func.count(ProductInbound.id)).scalar()
        total_quantity = db.query(func.sum(ProductInbound.入库数量)).scalar() or 0
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "入库次数": total_inbound,
                "入库数量": total_quantity,
            }
        }
    except Exception as e:
        return {"code": 1, "msg": f"获取统计失败: {str(e)}", "data": {}}


@router.get("/{inbound_id}")
async def get_inbound_detail(
    inbound_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取成品入库详情"""
    inbound = product_inbound_service.get_by_id(db, inbound_id)
    if not inbound:
        return {"code": 1, "msg": "入库记录不存在", "count": 0, "data": {}}

    return {
        "code": 0,
        "msg": "success",
        "count": 1,
        "data": product_inbound_service.to_dict(inbound)
    }


@router.post("/create")
async def create_inbound(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """创建成品入库"""
    inbound, error = product_inbound_service.create(
        db,
        入库单号=data.get("入库单号"),
        质检单号=data.get("质检单号"),
        工单编号=data.get("工单编号"),
        产品类型=data.get("产品类型"),
        产品型号=data.get("产品型号"),
        规格=data.get("规格"),
        入库数量=data.get("入库数量"),
        单位=data.get("单位"),
        批次号=data.get("批次号"),
        仓库=data.get("仓库", "成品仓"),
        库位=data.get("库位"),
        入库类型=data.get("入库类型", "生产入库"),
        入库状态=data.get("入库状态", "已入库"),
        入库日期=data.get("入库日期"),
        入库员=data.get("入库员"),
        收货人=data.get("收货人"),
        关联订单=data.get("关联订单"),
        备注=data.get("备注"),
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return {
        "code": 0,
        "msg": "创建成功",
        "data": {"id": inbound.id, "入库单号": inbound.入库单号}
    }


@router.put("/update")
async def update_inbound(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """更新成品入库"""
    inbound_id = data.get("id")
    if not inbound_id:
        return {"code": 1, "msg": "缺少入库ID", "data": {}}

    inbound, error = product_inbound_service.update(
        db, inbound_id,
        质检单号=data.get("质检单号"),
        工单编号=data.get("工单编号"),
        产品类型=data.get("产品类型"),
        产品型号=data.get("产品型号"),
        规格=data.get("规格"),
        入库数量=data.get("入库数量"),
        单位=data.get("单位"),
        批次号=data.get("批次号"),
        仓库=data.get("仓库"),
        库位=data.get("库位"),
        入库类型=data.get("入库类型"),
        入库状态=data.get("入库状态"),
        入库日期=data.get("入库日期"),
        入库员=data.get("入库员"),
        收货人=data.get("收货人"),
        关联订单=data.get("关联订单"),
        备注=data.get("备注"),
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return {
        "code": 0,
        "msg": "更新成功",
        "data": {
            "id": inbound.id,
            "入库单号": inbound.入库单号,
            "质检单号": inbound.质检单号,
            "工单编号": inbound.工单编号,
            "产品类型": inbound.产品类型,
            "产品型号": inbound.产品型号,
            "规格": inbound.规格,
            "入库数量": inbound.入库数量,
            "单位": inbound.单位,
            "批次号": inbound.批次号,
            "仓库": inbound.仓库,
            "库位": inbound.库位,
            "入库类型": inbound.入库类型,
            "入库状态": inbound.入库状态,
            "入库日期": inbound.入库日期.strftime('%Y-%m-%d') if inbound.入库日期 else None,
            "入库员": inbound.入库员,
            "收货人": inbound.收货人,
            "关联订单": inbound.关联订单,
            "备注": inbound.备注,
        }
    }


@router.delete("/{inbound_id}")
async def delete_inbound(
    inbound_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除成品入库"""
    success, error = product_inbound_service.delete(db, inbound_id)

    if not success:
        raise HTTPException(status_code=404, detail=error)

    return {"code": 0, "msg": "删除成功", "data": {}}