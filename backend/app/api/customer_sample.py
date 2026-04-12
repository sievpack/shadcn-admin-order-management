from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.core.response import success_response, error_response
from app.services.customer_sample_service import customer_sample_service

router = APIRouter()


@router.get("/list")
async def get_list(
    search: Optional[str] = Query(None, description="全局搜索"),
    客户名称: Optional[str] = Query(None, description="客户名称"),
    产品类型: Optional[str] = Query(None, description="产品类型"),
    start_date: Optional[str] = Query(None, description="开始日期"),
    end_date: Optional[str] = Query(None, description="结束日期"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取客户样品列表"""
    try:
        items, total = customer_sample_service.search(
            db, search=search, 客户名称=客户名称, 产品类型=产品类型,
            start_date=start_date, end_date=end_date,
            page=page, page_size=limit
        )
        data = [customer_sample_service.to_dict(item) for item in items]
        return success_response(data=data, count=total)
    except Exception as e:
        return error_response(msg=f"获取失败: {str(e)}")


@router.get("/{id}")
async def get_detail(
    id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取客户样品详情"""
    try:
        obj = customer_sample_service.get(db, id)
        if not obj:
            return error_response(msg="记录不存在")
        return success_response(data=customer_sample_service.to_dict(obj), count=1)
    except Exception as e:
        return error_response(msg=f"获取失败: {str(e)}")


@router.post("/create")
async def create(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """创建客户样品"""
    obj, error = customer_sample_service.create(db, **data)
    if error:
        return error_response(msg=error)
    return success_response(data={"id": obj.id}, msg="创建成功")


@router.put("/update")
async def update(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """更新客户样品"""
    id = data.get('id')
    if not id:
        return error_response(msg="缺少ID")
    obj, error = customer_sample_service.update(db, id, **{k: v for k, v in data.items() if k != 'id'})
    if error:
        return error_response(msg=error)
    return success_response(data={"id": obj.id}, msg="更新成功")


@router.delete("/{id}")
async def delete(
    id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除客户样品"""
    success, error = customer_sample_service.delete(db, id)
    if not success:
        return error_response(msg=error)
    return success_response(msg="删除成功")
