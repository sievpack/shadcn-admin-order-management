from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """用户基础 Schema"""
    username: str
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str = "cashier"
    status: str = "active"


class UserCreate(BaseModel):
    """创建用户"""
    username: str
    password: str
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str = "cashier"


class UserUpdate(BaseModel):
    """更新用户"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None


class UserPasswordUpdate(BaseModel):
    """修改密码"""
    old_password: str
    new_password: str


class UserPasswordReset(BaseModel):
    """重置密码"""
    new_password: str


class UserResponse(BaseModel):
    """用户响应"""
    id: int
    username: str
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """用户列表响应"""
    list: list[UserResponse]
    total: int
    page: int
    page_size: int


class UserLoginResponse(BaseModel):
    """登录响应"""
    code: int = 200
    message: str = "登录成功"
    token: str
    token_type: str = "bearer"
    user: UserResponse
