from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, List

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """通用 API 响应格式"""
    code: int = 0
    msg: str = "success"
    data: Optional[T] = None


class PageResult(BaseModel, Generic[T]):
    """分页结果"""
    items: List[T]
    total: int
    page: int
    page_size: int


class PageParams(BaseModel):
    """分页参数"""
    page: int = 1
    page_size: int = 10

    @property
    def skip(self) -> int:
        return (self.page - 1) * self.page_size


class SuccessResponse(BaseModel):
    """操作成功响应"""
    code: int = 0
    msg: str = "操作成功"
    data: Optional[dict] = None


class ErrorResponse(BaseModel):
    """错误响应"""
    code: int = 1
    msg: str = "操作失败"
    data: Optional[dict] = None
