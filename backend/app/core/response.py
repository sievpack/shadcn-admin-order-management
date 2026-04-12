# 统一响应格式辅助函数
from typing import Any, Optional


def success_response(data: Any = None, msg: str = "success", count: Optional[int] = None):
    """
    统一成功响应格式

    Args:
        data: 响应数据
        msg: 响应消息
        count: 总数（用于分页列表）

    Returns:
        统一格式的响应字典
    """
    response = {"code": 0, "msg": msg}
    if count is not None:
        response["count"] = count
    response["data"] = data
    return response


def error_response(msg: str, data: Any = None):
    """
    统一错误响应格式

    Args:
        msg: 错误消息
        data: 错误详情数据

    Returns:
        统一格式的错误响应字典
    """
    response = {"code": 1, "msg": msg}
    response["data"] = data if data is not None else {}
    return response
