from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.production_service import production_order_service
from app.core.response import success_response, error_response

router = APIRouter()


@router.get("/list")
async def get_order_list(
    query: Optional[str] = None,
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
        db, query=query, 工单编号=工单编号, 计划编号=计划编号, 产品型号=产品型号,
        产线=产线, 工单状态=工单状态, page=page, page_size=limit
    )
    data = [production_order_service.to_dict(item) for item in items]
    return success_response(data=data, count=total)


@router.get("/codes")
async def get_order_codes(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有工单编号列表"""
    try:
        codes = production_order_service.get_all_工单编号(db)
        return success_response(data=codes, count=len(codes))
    except Exception as e:
        return error_response(msg=f"获取工单编号失败: {str(e)}")


@router.get("/lines")
async def get_production_lines(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有产线列表"""
    try:
        lines = production_order_service.get_all_产线(db)
        return success_response(data=lines, count=len(lines))
    except Exception as e:
        return error_response(msg=f"获取产线失败: {str(e)}")


@router.get("/{order_id}")
async def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取生产工单详情"""
    order = production_order_service.get_by_id(db, order_id)
    if not order:
        return error_response(msg="生产工单不存在")
    return success_response(data=production_order_service.to_dict(order), count=1)


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

    return success_response(data={"id": order.id, "工单编号": order.工单编号}, msg="创建成功")


@router.post("/create-from-plan")
async def create_order_from_plan(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """从生产计划创建工单"""
    plan_id = data.get("plan_id")
    工单数量 = data.get("工单数量")
    产线 = data.get("产线")

    if not plan_id:
        return error_response(msg="缺少计划ID")
    if not 工单数量 or 工单数量 <= 0:
        return error_response(msg="工单数量必须大于0")
    if not 产线:
        return error_response(msg="请选择产线")

    order, error = production_order_service.create_from_plan(
        db, plan_id=plan_id, 工单数量=工单数量, 产线=产线
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return success_response(data={"id": order.id, "工单编号": order.工单编号, "计划编号": order.计划编号}, msg="创建成功")


@router.put("/update")
async def update_order(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """更新生产工单"""
    order_id = data.get("id")
    if not order_id:
        return error_response(msg="缺少工单ID")

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
        raise HTTPException(status_code=400, detail=error)

    return success_response(data=production_order_service.to_dict(order), msg="更新成功")


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

    return success_response(msg="开始生产成功")


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

    return success_response(msg="完工确认成功")


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

    return success_response(msg="暂停成功")


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

    return success_response(msg="删除成功")
