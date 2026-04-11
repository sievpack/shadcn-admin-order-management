import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.user_service import user_service
from app.schemas.user import UserResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/list")
async def get_user_list(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=1000),
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取用户列表"""
    items, total = user_service.search(
        db, search=search, role=role, status=status,
        page=page, page_size=limit
    )
    
    return {
        "code": 0,
        "msg": "success",
        "count": total,
        "data": [
            {
                "id": item.id,
                "username": item.username,
                "first_name": item.first_name,
                "last_name": item.last_name,
                "email": item.email,
                "phone": item.phone,
                "role": item.role,
                "status": item.status,
                "created_at": item.created_at.isoformat() if item.created_at else None,
                "updated_at": item.updated_at.isoformat() if item.updated_at else None
            }
            for item in items
        ]
    }


@router.get("/detail")
async def get_user_detail(
    id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取用户详情"""
    user = user_service.get(db, id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    return {
        "code": 0,
        "msg": "success",
        "data": {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "status": user.status,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None
        }
    }


@router.post("/create")
async def create_user(
    username: str = Query(...),
    password: str = Query(...),
    first_name: str = Query(...),
    last_name: str = Query(...),
    email: Optional[str] = Query(None),
    phone: Optional[str] = Query(None),
    role: str = Query("cashier"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """创建用户"""
    user, error = user_service.create(
        db,
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        role=role
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return {"code": 0, "msg": "用户创建成功", "data": {"id": user.id}}


@router.put("/update")
async def update_user(
    id: int = Query(...),
    first_name: Optional[str] = Query(None),
    last_name: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    phone: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """更新用户"""
    user = user_service.get(db, id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    update_data = {}
    if first_name is not None:
        update_data["first_name"] = first_name
    if last_name is not None:
        update_data["last_name"] = last_name
    if email is not None:
        update_data["email"] = email
    if phone is not None:
        update_data["phone"] = phone
    if role is not None:
        update_data["role"] = role
    if status is not None:
        update_data["status"] = status
    
    if update_data:
        updated_user = user_service.update(db, user.id, update_data)
        user = updated_user

    return {"code": 0, "msg": "用户更新成功", "data": {
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "status": user.status,
    }}


@router.delete("/delete/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除用户"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="不能删除自己")
    
    success = user_service.delete(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="用户不存在")

    return {"code": 0, "msg": "用户删除成功"}


@router.post("/reset-password")
async def reset_password(
    user_id: int = Query(...),
    new_password: str = Query(...),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """重置密码"""
    success = user_service.reset_password(db, user_id, new_password)
    if not success:
        raise HTTPException(status_code=404, detail="用户不存在")

    return {"code": 0, "msg": "密码重置成功"}


@router.put("/update-password")
async def update_password(
    old_password: str = Query(...),
    new_password: str = Query(...),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """修改密码"""
    success, msg = user_service.change_password(
        db, current_user.id, old_password, new_password
    )

    if not success:
        raise HTTPException(status_code=400, detail=msg)

    return {"code": 0, "msg": msg}