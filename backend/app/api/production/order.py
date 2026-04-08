from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.production_service import production_order_service

router = APIRouter()


@router.get("/list")
async def get_order_list(
    工单编号: Optional[str] = None,
    计划编号: Optional[str] = None,
    产品型号: Optional[str] = None,
    产线: Optional[str] = None,
    工单状态: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取生产工单列表"""
    items, total = production_order_service.search(
        db, 工单编号=工单编号, 计划编号=计划编号, 产品型号=产品型号,
        产线=产线, 工单状态=工单状态, page=page, page_size=limit
    )
    data = [production_order_service.to_dict(item) for item in items]

    return {
        "code": 0,
        "msg": "success",
        "count": total,
        "data": data
    }


@router.get("/codes")
async def get_order_codes(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有工单编号列表"""
    try:
        codes = production_order_service.get_all_工单编号(db)
        return {"code": 0, "msg": "success", "count": len(codes), "data": codes}
    except Exception as e:
        return {"code": 1, "msg": f"获取工单编号失败: {str(e)}", "count": 0, "data": []}


@router.get("/lines")
async def get_production_lines(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有产线列表"""
    try:
        lines = production_order_service.get_all_产线(db)
        return {"code": 0, "msg": "success", "count": len(lines), "data": lines}
    except Exception as e:
        return {"code": 1, "msg": f"获取产线失败: {str(e)}", "count": 0, "data": []}


@router.get("/{order_id}")
async def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取生产工单详情"""
    order = production_order_service.get_by_id(db, order_id)
    if not order:
        return {"code": 1, "msg": "生产工单不存在", "count": 0, "data": {}}

    return {
        "code": 0,
        "msg": "success",
        "count": 1,
        "data": production_order_service.to_dict(order)
    }


@router.post("/create")
async def create_order(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """创建生产工单"""
    order, error = production_order_service.create(
        db,
        工单编号=data.get("工单编号"),
        计划编号=data.get("计划编号"),
        产品类型=data.get("产品类型"),
        产品型号=data.get("产品型号"),
        规格=data.get("规格"),
        工单数量=data.get("工单数量"),
        已完成数量=data.get("已完成数量", 0),
        单位=data.get("单位"),
        产线=data.get("产线"),
        工单状态=data.get("工单状态", "待生产"),
        计划开始=data.get("计划开始"),
        计划结束=data.get("计划结束"),
        实际开始=data.get("实际开始"),
        实际结束=data.get("实际结束"),
        工序=data.get("工序", "1"),
        总工序=data.get("总工序", "1"),
        报工备注=data.get("报工备注"),
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return {
        "code": 0,
        "msg": "创建成功",
        "data": {"id": order.id, "工单编号": order.工单编号}
    }


@router.put("/update")
async def update_order(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """更新生产工单"""
    order_id = data.get("id")
    if not order_id:
        return {"code": 1, "msg": "缺少工单ID", "data": {}}

    order, error = production_order_service.update(
        db, order_id,
        工单编号=data.get("工单编号"),
        计划编号=data.get("计划编号"),
        产品类型=data.get("产品类型"),
        产品型号=data.get("产品型号"),
        规格=data.get("规格"),
        工单数量=data.get("工单数量"),
        已完成数量=data.get("已完成数量"),
        单位=data.get("单位"),
        产线=data.get("产线"),
        工单状态=data.get("工单状态"),
        计划开始=data.get("计划开始"),
        计划结束=data.get("计划结束"),
        实际开始=data.get("实际开始"),
        实际结束=data.get("实际结束"),
        工序=data.get("工序"),
        总工序=data.get("总工序"),
        报工备注=data.get("报工备注"),
    )

    if error:
        raise HTTPException(status_code=404, detail=error)

    return {"code": 0, "msg": "更新成功", "data": {}}


@router.put("/start/{order_id}")
async def start_production(
    order_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """开始生产"""
    success, error = production_order_service.start(db, order_id)

    if not success:
        raise HTTPException(status_code=400, detail=error)

    return {"code": 0, "msg": "开始生产成功", "data": {}}


@router.put("/finish/{order_id}")
async def finish_production(
    order_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """完工确认"""
    success, error = production_order_service.finish(db, order_id)

    if not success:
        raise HTTPException(status_code=400, detail=error)

    return {"code": 0, "msg": "完工确认成功", "data": {}}


@router.put("/pause/{order_id}")
async def pause_production(
    order_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """暂停生产"""
    success, error = production_order_service.pause(db, order_id)

    if not success:
        raise HTTPException(status_code=400, detail=error)

    return {"code": 0, "msg": "暂停成功", "data": {}}


@router.delete("/{order_id}")
async def delete_order(
    order_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除生产工单"""
    success, error = production_order_service.delete(db, order_id)

    if not success:
        raise HTTPException(status_code=404, detail=error)

    return {"code": 0, "msg": "删除成功", "data": {}}
