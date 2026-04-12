from fastapi import APIRouter, Depends

from app.models.user import User
from app.api.auth import get_current_active_user
from app.core.code_generator import generate_code, CODE_PREFIXES
from app.core.response import success_response, error_response

router = APIRouter()


@router.get("/generate-code")
async def generate_code_api(
    prefix: str = "DD",
    current_user: User = Depends(get_current_active_user)
):
    """生成编号接口
    
    Args:
        prefix: 编号前缀
        - DD: 订单 (默认)
        - PC: 生产计划
        - WO: 生产工单
        - BG: 报工记录
        - ZJ: 质检记录
        - RK: 成品入库
        - FH: 发货单
        - YS: 应收账款
        - YF: 应付账款
        - SK: 收款记录
        - FK: 付款记录
        - PZ: 凭证管理
        - YP: 样品单
        
    Returns:
        {
            "code": 0,
            "msg": "success",
            "data": {
                "code": "PC-20250406-123456",
                "prefix": "PC",
                "name": "生产计划"
            }
        }
    """
    prefix = prefix.upper()
    if prefix not in CODE_PREFIXES:
        return error_response(msg=f"无效的前缀，可用前缀: {', '.join(CODE_PREFIXES.keys())}")
    
    generated_code = generate_code(prefix)
    return success_response(data={
        "code": generated_code,
        "prefix": prefix,
        "name": CODE_PREFIXES[prefix]
    })


@router.get("/generate-codes")
async def generate_codes_api(
    prefixes: str = "DD,PC,WO",
    current_user: User = Depends(get_current_active_user)
):
    """批量生成编号
    
    Args:
        prefixes: 逗号分隔的前缀列表，如 "DD,PC,WO"
        
    Returns:
        {
            "code": 0,
            "msg": "success",
            "data": [
                {"prefix": "DD", "code": "DD-20250406-123456", "name": "订单"},
                {"prefix": "PC", "code": "PC-20250406-123457", "name": "生产计划"},
                {"prefix": "WO", "code": "WO-20250406-123458", "name": "生产工单"}
            ]
        }
    """
    prefix_list = [p.strip().upper() for p in prefixes.split(",")]
    invalid_prefixes = [p for p in prefix_list if p not in CODE_PREFIXES]
    
    if invalid_prefixes:
        return error_response(msg=f"无效的前缀: {', '.join(invalid_prefixes)}，可用前缀: {', '.join(CODE_PREFIXES.keys())}")
    
    codes = []
    for prefix in prefix_list:
        codes.append({
            "prefix": prefix,
            "code": generate_code(prefix),
            "name": CODE_PREFIXES[prefix]
        })
    
    return success_response(data=codes)
