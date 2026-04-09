from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.production_service import quality_inspection_service

router = APIRouter()


@router.get("/list")
async def get_qc_list(
    query: Optional[str] = None,
    质检单号: Optional[str] = None,
    工单编号: Optional[str] = None,
    质检结果: Optional[str] = None,
    质检员: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取质检记录列表"""
    items, total = quality_inspection_service.search(
        db, query=query, 质检单号=质检单号, 工单编号=工单编号, 质检结果=质检结果,
        质检员=质检员, start_date=start_date, end_date=end_date,
        page=page, page_size=limit
    )
    data = [quality_inspection_service.to_dict(item) for item in items]

    return {
        "code": 0,
        "msg": "success",
        "count": total,
        "data": data
    }


@router.get("/inspectors")
async def get_inspectors(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有质检员列表"""
    try:
        inspectors = quality_inspection_service.get_all_质检员(db)
        return {"code": 0, "msg": "success", "count": len(inspectors), "data": inspectors}
    except Exception as e:
        return {"code": 1, "msg": f"获取质检员列表失败: {str(e)}", "count": 0, "data": []}


@router.get("/stats")
async def get_qc_stats(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取质检统计"""
    from sqlalchemy import func
    from app.models.production import QualityInspection
    
    try:
        total_qc = db.query(func.count(QualityInspection.id)).scalar()
        total_inspected = db.query(func.sum(QualityInspection.送检数量)).scalar() or 0
        total_qualified = db.query(func.sum(QualityInspection.合格数量)).scalar() or 0
        total_defect = db.query(func.sum(QualityInspection.不良数量)).scalar() or 0
        
        qualified_count = db.query(func.count(QualityInspection.id)).filter(
            QualityInspection.质检结果 == '合格'
        ).scalar()
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "质检次数": total_qc,
                "送检数量": total_inspected,
                "合格数量": total_qualified,
                "不良数量": total_defect,
                "合格次数": qualified_count,
                "合格率": round(total_qualified / total_inspected * 100, 2) if total_inspected > 0 else 0
            }
        }
    except Exception as e:
        return {"code": 1, "msg": f"获取统计失败: {str(e)}", "data": {}}


@router.get("/{qc_id}")
async def get_qc_detail(
    qc_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取质检记录详情"""
    qc = quality_inspection_service.get_by_id(db, qc_id)
    if not qc:
        return {"code": 1, "msg": "质检记录不存在", "count": 0, "data": {}}

    return {
        "code": 0,
        "msg": "success",
        "count": 1,
        "data": quality_inspection_service.to_dict(qc)
    }


@router.post("/create")
async def create_qc(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """创建质检记录"""
    qc, error = quality_inspection_service.create(
        db,
        质检单号=data.get("质检单号"),
        关联报工=data.get("关联报工"),
        工单编号=data.get("工单编号"),
        产品类型=data.get("产品类型"),
        产品型号=data.get("产品型号"),
        批次号=data.get("批次号"),
        送检数量=data.get("送检数量"),
        合格数量=data.get("合格数量"),
        不良数量=data.get("不良数量", 0),
        质检结果=data.get("质检结果"),
        不良分类=data.get("不良分类"),
        不良描述=data.get("不良描述"),
        质检员=data.get("质检员"),
        质检日期=data.get("质检日期"),
        备注=data.get("备注"),
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return {
        "code": 0,
        "msg": "创建成功",
        "data": {"id": qc.id, "质检单号": qc.质检单号}
    }


@router.put("/update")
async def update_qc(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """更新质检记录"""
    qc_id = data.get("id")
    if not qc_id:
        return {"code": 1, "msg": "缺少质检ID", "data": {}}

    qc, error = quality_inspection_service.update(
        db, qc_id,
        送检数量=data.get("送检数量"),
        合格数量=data.get("合格数量"),
        不良数量=data.get("不良数量"),
        质检结果=data.get("质检结果"),
        不良分类=data.get("不良分类"),
        不良描述=data.get("不良描述"),
        质检员=data.get("质检员"),
        备注=data.get("备注"),
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return {
        "code": 0,
        "msg": "更新成功",
        "data": {
            "id": qc.id,
            "质检单号": qc.质检单号,
            "关联报工": qc.关联报工,
            "工单编号": qc.工单编号,
            "产品类型": qc.产品类型,
            "产品型号": qc.产品型号,
            "批次号": qc.批次号,
            "送检数量": qc.送检数量,
            "合格数量": qc.合格数量,
            "不良数量": qc.不良数量,
            "质检结果": qc.质检结果,
            "不良分类": qc.不良分类,
            "不良描述": qc.不良描述,
            "质检员": qc.质检员,
            "质检日期": qc.质检日期.strftime('%Y-%m-%d %H:%M:%S') if qc.质检日期 else None,
            "备注": qc.备注,
        }
    }


@router.delete("/{qc_id}")
async def delete_qc(
    qc_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除质检记录"""
    success, error = quality_inspection_service.delete(db, qc_id)

    if not success:
        raise HTTPException(status_code=404, detail=error)

    return {"code": 0, "msg": "删除成功", "data": {}}