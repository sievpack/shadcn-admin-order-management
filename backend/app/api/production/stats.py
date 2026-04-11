from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.db.database import get_db_jns
from app.models.production import (
    ProductionPlan, ProductionOrder, ProductionReport,
    QualityInspection, ProductInbound
)
from app.models.user import User
from app.api.auth import get_current_active_user


router = APIRouter()


@router.get("/summary", response_model=dict)
async def get_production_summary(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取生产概览统计"""
    try:
        plan_count = db.query(func.count(ProductionPlan.id)).scalar()
        order_count = db.query(func.count(ProductionOrder.id)).scalar()
        report_count = db.query(func.count(ProductionReport.id)).scalar()
        qc_count = db.query(func.count(QualityInspection.id)).scalar()
        inbound_count = db.query(func.count(ProductInbound.id)).scalar()
        
        active_orders = db.query(func.count(ProductionOrder.id)).filter(
            ProductionOrder.工单状态 == '生产中'
        ).scalar()
        
        completed_orders = db.query(func.count(ProductionOrder.id)).filter(
            ProductionOrder.工单状态 == '已完工'
        ).scalar()
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "生产计划数": plan_count,
                "生产工单数": order_count,
                "报工记录数": report_count,
                "质检记录数": qc_count,
                "入库记录数": inbound_count,
                "进行中工单": active_orders,
                "已完成工单": completed_orders,
            }
        }
    except Exception as e:
        return {"code": 1, "msg": f"获取概览失败: {str(e)}", "data": {}}


@router.get("/monthly", response_model=dict)
async def get_monthly_stats(
    year: Optional[int] = None,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取月度生产统计"""
    try:
        from sqlalchemy import text
        
        if year:
            query = db.query(
                func.month(ProductionOrder.计划开始).label('月份'),
                func.sum(ProductionOrder.工单数量).label('计划数量'),
                func.sum(ProductionOrder.已完成数量).label('完成数量')
            ).filter(
                func.year(ProductionOrder.计划开始) == year
            ).group_by(func.month(ProductionOrder.计划开始)).all()
        else:
            query = db.query(
                func.month(ProductionOrder.计划开始).label('月份'),
                func.sum(ProductionOrder.工单数量).label('计划数量'),
                func.sum(ProductionOrder.已完成数量).label('完成数量')
            ).group_by(func.month(ProductionOrder.计划开始)).all()
        
        data = []
        for item in query:
            plan_qty = item.计划数量 or 0
            complete_qty = item.完成数量 or 0
            data.append({
                '月份': str(item.月份).zfill(2),
                '计划数量': plan_qty,
                '完成数量': complete_qty,
                '完成率': round(complete_qty / plan_qty * 100, 2) if plan_qty > 0 else 0
            })
        
        return {
            "code": 0,
            "msg": "success",
            "count": len(data),
            "data": data
        }
    except Exception as e:
        return {"code": 1, "msg": f"获取月度统计失败: {str(e)}", "count": 0, "data": []}


@router.get("/product", response_model=dict)
async def get_product_stats(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取产品生产统计"""
    try:
        query = db.query(
            ProductionOrder.产品型号,
            func.sum(ProductionOrder.工单数量).label('计划数量'),
            func.sum(ProductionOrder.已完成数量).label('完成数量')
        ).group_by(ProductionOrder.产品型号).all()
        
        data = []
        for item in query:
            plan_qty = item.计划数量 or 0
            complete_qty = item.完成数量 or 0
            data.append({
                '产品型号': item.产品型号,
                '计划数量': plan_qty,
                '完成数量': complete_qty,
                '完成率': round(complete_qty / plan_qty * 100, 2) if plan_qty > 0 else 0
            })
        
        return {
            "code": 0,
            "msg": "success",
            "count": len(data),
            "data": data
        }
    except Exception as e:
        return {"code": 1, "msg": f"获取产品统计失败: {str(e)}", "count": 0, "data": []}


@router.get("/line", response_model=dict)
async def get_line_stats(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取产线统计"""
    try:
        query = db.query(
            ProductionOrder.产线,
            func.count(ProductionOrder.id).label('工单数量'),
            func.sum(ProductionOrder.已完成数量).label('完成数量')
        ).filter(
            ProductionOrder.产线.isnot(None)
        ).group_by(ProductionOrder.产线).all()
        
        data = []
        for item in query:
            complete_qty = item.完成数量 or 0
            order_count = item.工单数量 or 0
            avg_complete = complete_qty / order_count if order_count > 0 else 0
            data.append({
                '产线': item.产线,
                '工单数量': order_count,
                '完成数量': complete_qty,
                '平均完成': round(avg_complete, 2)
            })
        
        return {
            "code": 0,
            "msg": "success",
            "count": len(data),
            "data": data
        }
    except Exception as e:
        return {"code": 1, "msg": f"获取产线统计失败: {str(e)}", "count": 0, "data": []}


@router.get("/qc", response_model=dict)
async def get_qc_stats(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取质检统计"""
    try:
        query = db.query(
            func.month(QualityInspection.质检日期).label('月份'),
            func.sum(QualityInspection.送检数量).label('送检数量'),
            func.sum(QualityInspection.合格数量).label('合格数量'),
            func.sum(QualityInspection.不良数量).label('不良数量')
        ).group_by(func.month(QualityInspection.质检日期)).all()
        
        data = []
        for item in query:
            inspected = item.送检数量 or 0
            qualified = item.合格数量 or 0
            defect = item.不良数量 or 0
            data.append({
                '月份': str(item.月份).zfill(2),
                '送检数量': inspected,
                '合格数量': qualified,
                '不良数量': defect,
                '合格率': round(qualified / inspected * 100, 2) if inspected > 0 else 0
            })
        
        return {
            "code": 0,
            "msg": "success",
            "count": len(data),
            "data": data
        }
    except Exception as e:
        return {"code": 1, "msg": f"获取质检统计失败: {str(e)}", "count": 0, "data": []}


@router.get("/plan-status", response_model=dict)
async def get_plan_status_stats(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取计划状态统计"""
    try:
        query = db.query(
            ProductionPlan.计划状态,
            func.count(ProductionPlan.id).label('数量')
        ).group_by(ProductionPlan.计划状态).all()
        
        data = [{'状态': item.计划状态, '数量': item.数量} for item in query]
        
        return {
            "code": 0,
            "msg": "success",
            "count": len(data),
            "data": data
        }
    except Exception as e:
        return {"code": 1, "msg": f"获取状态统计失败: {str(e)}", "count": 0, "data": []}


@router.get("/order-status", response_model=dict)
async def get_order_status_stats(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取工单状态统计"""
    try:
        query = db.query(
            ProductionOrder.工单状态,
            func.count(ProductionOrder.id).label('数量')
        ).group_by(ProductionOrder.工单状态).all()
        
        data = [{'状态': item.工单状态, '数量': item.数量} for item in query]
        
        return {
            "code": 0,
            "msg": "success",
            "count": len(data),
            "data": data
        }
    except Exception as e:
        return {"code": 1, "msg": f"获取状态统计失败: {str(e)}", "count": 0, "data": []}
