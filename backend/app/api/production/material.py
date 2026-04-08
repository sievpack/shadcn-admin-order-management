from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.production_service import material_consumption_service

router = APIRouter()


@router.get("/list")
async def get_material_list(
    工单编号: Optional[str] = None,
    物料编码: Optional[str] = None,
    物料名称: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取物料消耗列表"""
    items, total = material_consumption_service.search(
        db, 工单编号=工单编号, 物料编码=物料编码, 物料名称=物料名称,
        start_date=start_date, end_date=end_date, page=page, page_size=limit
    )
    data = [material_consumption_service.to_dict(item) for item in items]

    return {
        "code": 0,
        "msg": "success",
        "count": total,
        "data": data
    }


@router.get("/materials")
async def get_materials(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有物料列表"""
    from app.models.production import MaterialConsumption
    
    try:
        materials = db.query(
            MaterialConsumption.物料编码,
            MaterialConsumption.物料名称,
            MaterialConsumption.规格型号,
            MaterialConsumption.单位
        ).filter(
            MaterialConsumption.物料编码.isnot(None)
        ).distinct().all()
        
        material_list = [
            {
                '物料编码': m[0],
                '物料名称': m[1],
                '规格型号': m[2],
                '单位': m[3]
            }
            for m in materials if m[0]
        ]
        return {"code": 0, "msg": "success", "count": len(material_list), "data": material_list}
    except Exception as e:
        return {"code": 1, "msg": f"获取物料列表失败: {str(e)}", "count": 0, "data": []}


@router.get("/stats")
async def get_material_stats(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取物料消耗统计"""
    from sqlalchemy import func
    from app.models.production import MaterialConsumption
    
    try:
        total_records = db.query(func.count(MaterialConsumption.id)).scalar()
        total_quantity = db.query(func.sum(MaterialConsumption.消耗数量)).scalar() or 0
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "消耗记录数": total_records,
                "消耗总数量": float(total_quantity),
            }
        }
    except Exception as e:
        return {"code": 1, "msg": f"获取统计失败: {str(e)}", "data": {}}


@router.post("/create")
async def create_material(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """创建物料消耗记录"""
    material, error = material_consumption_service.create(
        db,
        工单编号=data.get("工单编号"),
        物料编码=data.get("物料编码"),
        物料名称=data.get("物料名称"),
        规格型号=data.get("规格型号"),
        消耗数量=data.get("消耗数量"),
        单位=data.get("单位"),
        领料人=data.get("领料人"),
        领料日期=data.get("领料日期"),
        备注=data.get("备注"),
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return {
        "code": 0,
        "msg": "创建成功",
        "data": {"id": material.id}
    }


@router.delete("/{material_id}")
async def delete_material(
    material_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除物料消耗记录"""
    success, error = material_consumption_service.delete(db, material_id)

    if not success:
        raise HTTPException(status_code=404, detail=error)

    return {"code": 0, "msg": "删除成功", "data": {}}