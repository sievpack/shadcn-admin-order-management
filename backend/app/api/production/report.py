from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.production_service import production_report_service

router = APIRouter()


@router.get("/list")
async def get_report_list(
    query: Optional[str] = None,
    工单编号: Optional[str] = None,
    报工编号: Optional[str] = None,
    报工人: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取报工记录列表"""
    items, total = production_report_service.search(
        db, query=query, 工单编号=工单编号, 报工编号=报工编号, 报工人=报工人,
        start_date=start_date, end_date=end_date, page=page, page_size=limit
    )
    data = [production_report_service.to_dict(item) for item in items]

    return {
        "code": 0,
        "msg": "success",
        "count": total,
        "data": data
    }


@router.get("/workers")
async def get_workers(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有报工人列表"""
    try:
        workers = production_report_service.get_all_报工人(db)
        return {"code": 0, "msg": "success", "count": len(workers), "data": workers}
    except Exception as e:
        return {"code": 1, "msg": f"获取报工人列表失败: {str(e)}", "count": 0, "data": []}


@router.get("/stats")
async def get_report_stats(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取报工统计"""
    from sqlalchemy import func
    from app.models.production import ProductionReport
    
    try:
        total_reports = db.query(func.count(ProductionReport.id)).scalar()
        total_quantity = db.query(func.sum(ProductionReport.报工数量)).scalar() or 0
        qualified_quantity = db.query(func.sum(ProductionReport.合格数量)).scalar() or 0
        defect_quantity = db.query(func.sum(ProductionReport.不良数量)).scalar() or 0
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "报工次数": total_reports,
                "报工数量": total_quantity,
                "合格数量": qualified_quantity,
                "不良数量": defect_quantity,
                "合格率": round(qualified_quantity / total_quantity * 100, 2) if total_quantity > 0 else 0
            }
        }
    except Exception as e:
        return {"code": 1, "msg": f"获取统计失败: {str(e)}", "data": {}}


@router.post("/create")
async def create_report(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """创建报工记录"""
    report, error, result_info = production_report_service.create(
        db,
        工单编号=data.get("工单编号"),
        报工编号=data.get("报工编号"),
        报工日期=data.get("报工日期"),
        报工数量=data.get("报工数量"),
        合格数量=data.get("合格数量"),
        不良数量=data.get("不良数量", 0),
        不良原因=data.get("不良原因"),
        工序=data.get("工序"),
        报工人=data.get("报工人"),
        检验员=data.get("检验员"),
        备注=data.get("备注"),
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    response_data = {"id": report.id, "报工编号": report.报工编号}
    if result_info:
        response_data.update(result_info)
    
    msg = "创建成功"
    if result_info and result_info.get("is_completed"):
        msg = "创建成功，工单已完成"
    
    return {
        "code": 0,
        "msg": msg,
        "data": response_data
    }


@router.delete("/{report_id}")
async def delete_report(
    report_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除报工记录"""
    success, error = production_report_service.delete(db, report_id)
    if not success:
        raise HTTPException(status_code=404, detail=error)

    return {"code": 0, "msg": "删除成功", "data": {}}