from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.notification_service import notification_service

router = APIRouter()


class MarkReadRequest(BaseModel):
    notification_id: str


@router.get("")
async def get_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user)
):
    """获取历史通知（分页）"""
    notifications, total = notification_service.get_list(
        current_user.id, page, page_size
    )
    return {
        "code": 0,
        "msg": "success",
        "count": total,
        "data": notifications,
        "page": page,
        "page_size": page_size
    }


@router.post("/mark-read")
async def mark_notification_read(
    req: MarkReadRequest,
    current_user: User = Depends(get_current_active_user)
):
    """标记单条已读
    
    Returns:
        - 成功: {"code": 0, "msg": "success"}
        - 失败: HTTP 404
    """
    success = notification_service.mark_read(current_user.id, req.notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"code": 0, "msg": "success"}


@router.post("/mark-all-read")
async def mark_all_read(
    current_user: User = Depends(get_current_active_user)
):
    """标记全部已读"""
    count = notification_service.mark_all_read(current_user.id)
    return {"code": 0, "msg": f"marked {count} notifications as read"}


@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_active_user)
):
    """获取未读数量"""
    count = notification_service.get_unread_count(current_user.id)
    return {"code": 0, "msg": "success", "data": count}
