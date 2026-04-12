import logging
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.core.response import success_response, error_response
from app.services.customer_service import customer_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/data")
async def get_customer_data(
    query: str = Query("list", description="查询类型: list/detail"),
    search: Optional[str] = Query(None, description="全局搜索"),
    status: Optional[str] = Query(None, description="状态筛选"),
    settlement: Optional[str] = Query(None, description="结算方式筛选"),
    客户名称: Optional[str] = None,
    联系人: Optional[str] = None,
    手机: Optional[str] = None,
    id: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=10000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取客户数据"""
    try:
        if query == "list":
            items, total = customer_service.search(
                db, search=search, status=status, settlement=settlement,
                客户名称=客户名称, 联系人=联系人, 手机=手机,
                page=page, page_size=limit
            )

            data = [{
                'id': item.id,
                '客户名称': item.客户名称,
                '联系电话': item.联系电话,
                '收货地址': item.收货地址,
                '联系人': item.联系人,
                '手机': item.手机,
                '结算方式': item.结算方式,
                '是否含税': item.是否含税,
                '对账时间': item.对账时间,
                '开票时间': item.开票时间,
                '结算周期': item.结算周期,
                '业务负责人': item.业务负责人,
                '送货单版本': item.送货单版本,
                '备注': item.备注,
                '状态': item.状态,
                '简称': item.简称,
                'create_at': item.create_at.strftime('%Y-%m-%d %H:%M:%S') if item.create_at else None,
                'update_at': item.update_at.strftime('%Y-%m-%d %H:%M:%S') if item.update_at else None
            } for item in items]

            return success_response(data=data, count=total)

        elif query == "detail":
            if not id:
                return error_response(msg="缺少客户ID")

            item = customer_service.get(db, id)
            if not item:
                return error_response(msg="客户不存在")

            data = [{
                'id': item.id,
                '客户名称': item.客户名称,
                '联系电话': item.联系电话,
                '收货地址': item.收货地址,
                '联系人': item.联系人,
                '手机': item.手机,
                '结算方式': item.结算方式,
                '是否含税': item.是否含税,
                '对账时间': item.对账时间,
                '开票时间': item.开票时间,
                '结算周期': item.结算周期,
                '业务负责人': item.业务负责人,
                '送货单版本': item.送货单版本,
                '备注': item.备注,
                '状态': item.状态,
                '简称': item.简称,
                'create_at': item.create_at.strftime('%Y-%m-%d %H:%M:%S') if item.create_at else None,
                'update_at': item.update_at.strftime('%Y-%m-%d %H:%M:%S') if item.update_at else None
            }]

            return success_response(data=data, count=1)

        return error_response(msg="无效的查询类型")
    except Exception as e:
        return error_response(msg=f"获取失败: {str(e)}")


@router.post("/create")
async def create_customer(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """创建客户"""
    try:
        customer, error = customer_service.create(db, data)
        if error:
            return error_response(msg=error)
        return success_response(data={"id": customer.id}, msg="创建成功")
    except Exception as e:
        db.rollback()
        return error_response(msg=f"创建失败: {str(e)}")


@router.put("/update")
async def update_customer(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """更新客户"""
    customer_id = data.get("id")
    if not customer_id:
        return error_response(msg="缺少客户ID")

    try:
        customer, error = customer_service.update_customer(db, customer_id, data)
        if error:
            return error_response(msg=error)
        
        db.refresh(customer)
        
        return success_response(data={
            "id": customer.id,
            "客户名称": customer.客户名称,
            "简称": customer.简称,
            "联系人": customer.联系人,
            "联系电话": customer.联系电话,
            "手机": customer.手机,
            "结算方式": customer.结算方式,
            "是否含税": customer.是否含税,
            "收货地址": customer.收货地址,
            "备注": customer.备注,
            "状态": customer.状态,
        }, msg="更新成功")
    except Exception as e:
        db.rollback()
        return error_response(msg=f"更新失败: {str(e)}")


@router.delete("/delete/{id}")
async def delete_customer(
    id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除客户"""
    try:
        customer = customer_service.get(db, id)
        if not customer:
            return error_response(msg="客户不存在")
        customer_service.delete(db, id)
        return success_response(msg="删除成功")
    except Exception as e:
        db.rollback()
        return error_response(msg=f"删除失败: {str(e)}")


@router.get("/names")
async def get_customer_names(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有客户名称列表"""
    try:
        names = customer_service.get_all_names(db)
        return success_response(data=names, count=len(names))
    except Exception as e:
        return error_response(msg=f"获取客户名称失败: {str(e)}")