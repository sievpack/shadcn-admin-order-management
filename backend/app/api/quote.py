from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.quote_service import quote_service

router = APIRouter()


@router.get("/data")
async def get_quote_data(
    query: str = Query("list", description="查询类型: list/detail"),
    客户名称: Optional[str] = None,
    报价单号: Optional[str] = None,
    id: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取报价单数据"""
    if query == "list":
        items, total = quote_service.search_distinct(
            db, 客户名称=客户名称, 报价单号=报价单号,
            page=page, page_size=limit
        )
        data = [quote_service.to_dict(item) for item in items]
        return {
            "code": 0,
            "msg": "success",
            "count": total,
            "data": data
        }

    elif query == "detail":
        if not id:
            return {"code": 1, "msg": "缺少报价单ID", "count": 0, "data": []}

        quote = quote_service.get_by_id(db, id)
        if not quote:
            return {"code": 1, "msg": "报价单不存在", "count": 0, "data": []}

        items, total = quote_service.search(db, 报价单号=quote.报价单号, page=1, page_size=1000)
        quote_dict = quote_service.to_dict(quote)
        quote_dict['items'] = [quote_service.to_item_dict(item) for item in items]
        return {
            "code": 0,
            "msg": "success",
            "count": 1,
            "data": [quote_dict]
        }

    else:
        return {"code": 1, "msg": "无效的查询类型", "count": 0, "data": []}


@router.post("/create")
async def create_quote(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """创建报价单"""
    quote, error = quote_service.create(
        db,
        客户名称=data.get("客户名称"),
        报价项目=data.get("报价项目"),
        报价单号=data.get("报价单号"),
        客户物料编码=data.get("客户物料编码"),
        客户物料名称=data.get("客户物料名称"),
        客户规格型号=data.get("客户规格型号"),
        嘉尼索规格=data.get("嘉尼索规格"),
        嘉尼索型号=data.get("嘉尼索型号"),
        单位=data.get("单位"),
        数量=data.get("数量"),
        未税单价=data.get("未税单价"),
        含税单价=data.get("含税单价"),
        备注=data.get("备注")
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    db.commit()

    return {
        "code": 0,
        "msg": "创建成功",
        "data": {"id": quote.id}
    }


@router.put("/update")
async def update_quote(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """更新报价单"""
    quote_id = data.get("id")
    if not quote_id:
        return {"code": 1, "msg": "缺少报价单ID", "data": {}}

    quote, error = quote_service.update(
        db, quote_id,
        客户名称=data.get("客户名称"),
        报价项目=data.get("报价项目"),
        报价单号=data.get("报价单号"),
        客户物料编码=data.get("客户物料编码"),
        客户物料名称=data.get("客户物料名称"),
        客户规格型号=data.get("客户规格型号"),
        嘉尼索规格=data.get("嘉尼索规格"),
        嘉尼索型号=data.get("嘉尼索型号"),
        单位=data.get("单位"),
        数量=data.get("数量"),
        未税单价=data.get("未税单价"),
        含税单价=data.get("含税单价"),
        备注=data.get("备注")
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    db.commit()

    return {
        "code": 0,
        "msg": "更新成功",
        "data": {
            "id": quote.id,
            "客户名称": quote.客户名称,
            "报价项目": quote.报价项目,
            "报价单号": quote.报价单号,
            "客户物料编码": quote.客户物料编码,
            "客户物料名称": quote.客户物料名称,
            "客户规格型号": quote.客户规格型号,
            "嘉尼索规格": quote.嘉尼索规格,
            "嘉尼索型号": quote.嘉尼索型号,
            "单位": quote.单位,
            "数量": quote.数量,
            "未税单价": float(quote.未税单价) if quote.未税单价 else 0,
            "含税单价": float(quote.含税单价) if quote.含税单价 else 0,
            "备注": quote.备注,
        }
    }


@router.delete("/delete/{id}")
async def delete_quote(
    id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除报价单"""
    success, error = quote_service.delete(db, id)

    if not success:
        raise HTTPException(status_code=404, detail=error)

    db.commit()

    return {"code": 0, "msg": "删除成功", "data": {}}
