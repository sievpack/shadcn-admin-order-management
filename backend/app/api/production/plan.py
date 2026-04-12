from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.production_service import production_plan_service, production_order_service
from app.core.response import success_response, error_response

router = APIRouter()


@router.get("/list")
async def get_plan_list(
    query: Optional[str] = None,
    计划编号: Optional[str] = None,
    计划名称: Optional[str] = None,
    产品型号: Optional[str] = None,
    计划状态: Optional[str] = None,
    优先级: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取生产计划列表"""
    items, total = production_plan_service.search(
        db, query=query, 计划编号=计划编号, 计划名称=计划名称, 产品型号=产品型号,
        计划状态=计划状态, 优先级=优先级, page=page, page_size=limit
    )
    data = [production_plan_service.to_dict(item) for item in items]
    return success_response(data=data, count=total)


@router.get("/names")
async def get_plan_codes(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有计划编号列表"""
    try:
        codes = production_plan_service.get_all_计划编号(db)
        return success_response(data=codes, count=len(codes))
    except Exception as e:
        return error_response(msg=f"获取计划编号失败: {str(e)}")


@router.get("/product-types")
async def get_product_types(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有产品类型列表"""
    try:
        types = production_plan_service.get_all_产品类型(db)
        return success_response(data=types, count=len(types))
    except Exception as e:
        return error_response(msg=f"获取产品类型失败: {str(e)}")


@router.get("/product-models")
async def get_product_models(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有产品型号列表"""
    try:
        models = production_plan_service.get_all_产品型号(db)
        return success_response(data=models, count=len(models))
    except Exception as e:
        return error_response(msg=f"获取产品型号失败: {str(e)}")


@router.get("/{plan_id}")
async def get_plan_detail(
    plan_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取生产计划详情"""
    plan = production_plan_service.get_by_id(db, plan_id)
    if not plan:
        return error_response(msg="生产计划不存在")
    return success_response(data=production_plan_service.to_dict(plan), count=1)


@router.get("/{plan_id}/orders")
async def get_plan_orders(
    plan_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取生产计划关联的工单列表"""
    plan = production_plan_service.get_by_id(db, plan_id)
    if not plan:
        return error_response(msg="生产计划不存在")
    orders, total = production_plan_service.get_orders_by_plan(db, plan_id)
    data = [production_order_service.to_dict(order) for order in orders]
    return success_response(data=data, count=total)


@router.post("/create")
async def create_plan(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """创建生产计划"""
    plan, error = production_plan_service.create(
        db,
        计划编号=data.get("计划编号"),
        计划名称=data.get("计划名称"),
        关联订单=data.get("关联订单"),
        产品类型=data.get("产品类型"),
        产品型号=data.get("产品型号"),
        规格=data.get("规格"),
        计划数量=data.get("计划数量"),
        已排数量=data.get("已排数量", 0),
        单位=data.get("单位"),
        计划开始日期=data.get("计划开始日期"),
        计划完成日期=data.get("计划完成日期"),
        实际开始日期=data.get("实际开始日期"),
        实际完成日期=data.get("实际完成日期"),
        优先级=data.get("优先级", "普通"),
        计划状态=data.get("计划状态", "待审核"),
        负责人=data.get("负责人"),
        备注=data.get("备注"),
        create_by=data.get("create_by"),
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return success_response(data={"id": plan.id, "计划编号": plan.计划编号}, msg="创建成功")


@router.put("/update")
async def update_plan(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """更新生产计划"""
    plan_id = data.get("id")
    if not plan_id:
        return error_response(msg="缺少计划ID")

    plan, error = production_plan_service.update(
        db, plan_id,
        计划编号=data.get("计划编号"),
        计划名称=data.get("计划名称"),
        关联订单=data.get("关联订单"),
        产品类型=data.get("产品类型"),
        产品型号=data.get("产品型号"),
        规格=data.get("规格"),
        计划数量=data.get("计划数量"),
        已排数量=data.get("已排数量"),
        单位=data.get("单位"),
        计划开始日期=data.get("计划开始日期"),
        计划完成日期=data.get("计划完成日期"),
        实际开始日期=data.get("实际开始日期"),
        实际完成日期=data.get("实际完成日期"),
        优先级=data.get("优先级"),
        计划状态=data.get("计划状态"),
        负责人=data.get("负责人"),
        备注=data.get("备注"),
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return success_response(data=production_plan_service.to_dict(plan), msg="更新成功")


@router.put("/approve/{plan_id}")
async def approve_plan(
    plan_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """审核生产计划"""
    success, error = production_plan_service.approve(db, plan_id)

    if not success:
        raise HTTPException(status_code=400, detail=error)

    return success_response(msg="审核成功")


@router.put("/reject/{plan_id}")
async def reject_plan(
    plan_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """驳回生产计划"""
    success, error = production_plan_service.reject(db, plan_id)

    if not success:
        raise HTTPException(status_code=400, detail=error)

    return success_response(msg="驳回成功")


@router.delete("/{plan_id}")
async def delete_plan(
    plan_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除生产计划"""
    success, error = production_plan_service.delete(db, plan_id)

    if not success:
        raise HTTPException(status_code=404, detail=error)

    return success_response(msg="删除成功")
