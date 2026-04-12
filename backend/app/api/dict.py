from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.core.response import success_response, error_response
from app.services.dict_service import dict_type_service, dict_data_service

router = APIRouter()


@router.get("/type")
async def get_dict_type_list(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=1000),
    search: Optional[str] = None,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取字典类型列表"""
    items, total = dict_type_service.search(db, search=search, page=page, page_size=limit)

    data = [{
        'id': item.id,
        'dict_name': item.dict_name,
        'dict_type': item.dict_type,
        'available': item.available,
        'description': item.description,
        'created_at': item.created_at.isoformat() if item.created_at else None,
        'updated_at': item.updated_at.isoformat() if item.updated_at else None,
    } for item in items]

    return success_response(data=data, count=total, msg="success")


@router.get("/type/all")
async def get_all_dict_types(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取所有字典类型（不分页）"""
    items = dict_type_service.get_all_available(db)

    data = [{'id': item.id, 'dict_name': item.dict_name, 'dict_type': item.dict_type} for item in items]

    return success_response(data=data)


@router.post("/type")
async def create_dict_type(
    dict_name: str = Query(...),
    dict_type: str = Query(...),
    description: Optional[str] = Query(None),
    available: bool = Query(True),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """创建字典类型"""
    dict_type_obj, error = dict_type_service.create(
        db, dict_name=dict_name, dict_type=dict_type,
        description=description, available=available, creator_id=current_user.id
    )
    if error:
        return error_response(msg=error)

    return success_response(data={
        'id': dict_type_obj.id,
        'dict_name': dict_type_obj.dict_name,
        'dict_type': dict_type_obj.dict_type,
        'available': dict_type_obj.available,
        'description': dict_type_obj.description,
    })


@router.put("/type/{type_id}")
async def update_dict_type(
    type_id: int,
    dict_name: Optional[str] = Query(None),
    dict_type: Optional[str] = Query(None),
    description: Optional[str] = Query(None),
    available: Optional[bool] = Query(None),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """更新字典类型"""
    dict_type_obj, error = dict_type_service.update_dict_type(
        db, type_id, dict_name=dict_name, dict_type=dict_type,
        description=description, available=available
    )
    if error:
        return error_response(msg=error)

    return success_response(data={
        'id': dict_type_obj.id,
        'dict_name': dict_type_obj.dict_name,
        'dict_type': dict_type_obj.dict_type,
        'available': dict_type_obj.available,
        'description': dict_type_obj.description,
    })


@router.delete("/type/{type_id}")
async def delete_dict_type(
    type_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除字典类型"""
    success, error = dict_type_service.delete_type(db, type_id)
    if not success:
        return error_response(msg=error)

    return success_response(msg="success")


@router.get("/data")
async def get_dict_data_list(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=1000),
    dict_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取字典数据列表"""
    items, total = dict_data_service.search(
        db, dict_type=dict_type, search=search, page=page, page_size=limit
    )

    data = [{
        'id': item.id,
        'dict_sort': item.dict_sort,
        'dict_label': item.dict_label,
        'dict_value': item.dict_value,
        'dict_type': item.dict_type,
        'css_class': item.css_class,
        'list_class': item.list_class,
        'is_default': item.is_default,
        'available': item.available,
        'description': item.description,
        'created_at': item.created_at.isoformat() if item.created_at else None,
        'updated_at': item.updated_at.isoformat() if item.updated_at else None,
    } for item in items]

    return success_response(data=data, count=total, msg="success")


@router.get("/data/type/{dict_type}")
async def get_dict_data_by_type(
    dict_type: str,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """根据类型获取字典数据"""
    items = dict_data_service.get_by_type(db, dict_type)

    data = [{
        'id': item.id,
        'dict_sort': item.dict_sort,
        'dict_label': item.dict_label,
        'dict_value': item.dict_value,
        'dict_type': item.dict_type,
        'css_class': item.css_class,
        'list_class': item.list_class,
        'is_default': item.is_default,
        'available': item.available,
    } for item in items]

    return success_response(data=data)


@router.post("/data")
async def create_dict_data(
    dict_label: str = Query(...),
    dict_value: str = Query(...),
    dict_type: str = Query(...),
    dict_sort: int = Query(0),
    css_class: Optional[str] = Query(None),
    list_class: Optional[str] = Query(None),
    is_default: bool = Query(False),
    description: Optional[str] = Query(None),
    available: bool = Query(True),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """创建字典数据"""
    dict_data_obj = dict_data_service.create(
        db, dict_label=dict_label, dict_value=dict_value, dict_type=dict_type,
        dict_sort=dict_sort, css_class=css_class, list_class=list_class,
        is_default=is_default, description=description, available=available,
        creator_id=current_user.id
    )

    return success_response(data={
        'id': dict_data_obj.id,
        'dict_label': dict_data_obj.dict_label,
        'dict_value': dict_data_obj.dict_value,
        'dict_type': dict_data_obj.dict_type,
    })


@router.put("/data/{data_id}")
async def update_dict_data(
    data_id: int,
    dict_label: Optional[str] = Query(None),
    dict_value: Optional[str] = Query(None),
    dict_type: Optional[str] = Query(None),
    dict_sort: Optional[int] = Query(None),
    css_class: Optional[str] = Query(None),
    list_class: Optional[str] = Query(None),
    is_default: Optional[bool] = Query(None),
    description: Optional[str] = Query(None),
    available: Optional[bool] = Query(None),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """更新字典数据"""
    dict_data_obj, error = dict_data_service.update_dict_data(
        db, data_id, dict_label=dict_label, dict_value=dict_value, dict_type=dict_type,
        dict_sort=dict_sort, css_class=css_class, list_class=list_class,
        is_default=is_default, description=description, available=available
    )
    if error:
        return error_response(msg=error)

    return success_response(data={
        'id': dict_data_obj.id,
        'dict_label': dict_data_obj.dict_label,
        'dict_value': dict_data_obj.dict_value,
        'dict_type': dict_data_obj.dict_type,
    })


@router.delete("/data/{data_id}")
async def delete_dict_data(
    data_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除字典数据"""
    dict_data_obj = dict_data_service.get(db, data_id)
    if not dict_data_obj:
        return error_response(msg="字典数据不存在")

    dict_data_service.delete(db, data_id)
    return success_response(msg="success")