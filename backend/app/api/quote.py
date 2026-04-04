from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func
import datetime

from app.db.database import get_db_jns
from app.models.quote import Quote

router = APIRouter()


@router.get("/data", response_model=dict)
async def get_quote_data(
    query: str = Query("list", description="查询类型: list/detail"),
    客户名称: Optional[str] = None,
    报价单号: Optional[str] = None,
    id: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000), # 增加最大限制到1000
    db: Session = Depends(get_db_jns)
):
    """获取报价单数据"""
    filters = []
    
    if 客户名称:
        filters.append(Quote.客户名称.contains(客户名称))
    
    if 报价单号:
        filters.append(Quote.报价单号.contains(报价单号))
    
    if query == "list":
        # 查询报价单列表
        if id:
            filters.append(Quote.id == id)
        
        # 查询报价单列表
        query_obj = db.query(Quote).filter(*filters).order_by(desc(Quote.id))
        total = query_obj.count()
        items = query_obj.offset((page - 1) * limit).limit(limit).all()
        
        data = [{
            'id': item.id,
            '客户名称': item.客户名称,
            '报价项目': item.报价项目,
            '报价单号': item.报价单号,
            '报价日期': item.报价日期.strftime('%Y-%m-%d') if item.报价日期 else None,
            '客户物料编码': item.客户物料编码,
            '客户物料名称': item.客户物料名称,
            '客户规格型号': item.客户规格型号,
            '嘉尼索规格': item.嘉尼索规格,
            '嘉尼索型号': item.嘉尼索型号,
            '单位': item.单位,
            '数量': item.数量,
            '未税单价': item.未税单价,
            '含税单价': item.含税单价,
            '含税总价': item.含税总价,
            '备注': item.备注
        } for item in items]
        
    elif query == "detail":
        # 查询报价单详情
        if not id:
            return {"code": 1, "msg": "缺少报价单ID", "count": 0, "data": []}
        
        item = db.query(Quote).filter(Quote.id == id).first()
        if not item:
            return {"code": 1, "msg": "报价单不存在", "count": 0, "data": []}
        
        data = [{
            'id': item.id,
            '客户名称': item.客户名称,
            '报价项目': item.报价项目,
            '报价单号': item.报价单号,
            '报价日期': item.报价日期.strftime('%Y-%m-%d') if item.报价日期 else None,
            '客户物料编码': item.客户物料编码,
            '客户物料名称': item.客户物料名称,
            '客户规格型号': item.客户规格型号,
            '嘉尼索规格': item.嘉尼索规格,
            '嘉尼索型号': item.嘉尼索型号,
            '单位': item.单位,
            '数量': item.数量,
            '未税单价': item.未税单价,
            '含税单价': item.含税单价,
            '含税总价': item.含税总价,
            '备注': item.备注
        }]
        total = 1
    else:
        return {"code": 1, "msg": "无效的查询类型", "count": 0, "data": []}
    
    return {
        "code": 0,
        "msg": "success",
        "count": total,
        "data": data
    }


@router.post("/create", response_model=dict)
async def create_quote(
    data: dict,
    db: Session = Depends(get_db_jns)
):
    """创建报价单"""
    try:
        new_quote = Quote(
            客户名称=data.get("客户名称"),
            报价项目=data.get("报价项目"),
            报价单号=data.get("报价单号"),
            报价日期=datetime.datetime.now(),
            客户物料编码=data.get("客户物料编码"),
            客户物料名称=data.get("客户物料名称"),
            客户规格型号=data.get("客户规格型号"),
            嘉尼索规格=data.get("嘉尼索规格"),
            嘉尼索型号=data.get("嘉尼索型号"),
            单位=data.get("单位"),
            数量=data.get("数量"),
            未税单价=data.get("未税单价"),
            含税单价=data.get("含税单价"),
            含税总价=data.get("含税总价"),
            备注=data.get("备注")
        )
        
        db.add(new_quote)
        db.commit()
        db.refresh(new_quote)
        
        return {
            "code": 0,
            "msg": "创建成功",
            "data": {
                "id": new_quote.id
            }
        }
    except Exception as e:
        db.rollback()
        return {
            "code": 1,
            "msg": f"创建失败: {str(e)}",
            "data": {}
        }


@router.put("/update", response_model=dict)
async def update_quote(
    data: dict,
    db: Session = Depends(get_db_jns)
):
    """更新报价单"""
    quote_id = data.get("id")
    if not quote_id:
        return {"code": 1, "msg": "缺少报价单ID", "data": {}}
    
    try:
        quote = db.query(Quote).filter(Quote.id == quote_id).first()
        if not quote:
            return {"code": 1, "msg": "报价单不存在", "data": {}}
        
        update_data = {
            "客户名称": data.get("客户名称"),
            "报价项目": data.get("报价项目"),
            "报价单号": data.get("报价单号"),
            "客户物料编码": data.get("客户物料编码"),
            "客户物料名称": data.get("客户物料名称"),
            "客户规格型号": data.get("客户规格型号"),
            "嘉尼索规格": data.get("嘉尼索规格"),
            "嘉尼索型号": data.get("嘉尼索型号"),
            "单位": data.get("单位"),
            "数量": data.get("数量"),
            "未税单价": data.get("未税单价"),
            "含税单价": data.get("含税单价"),
            "含税总价": data.get("含税总价"),
            "备注": data.get("备注")
        }
        
        # 过滤掉None值
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        for key, value in update_data.items():
            setattr(quote, key, value)
        
        db.commit()
        
        return {
            "code": 0,
            "msg": "更新成功",
            "data": {}
        }
    except Exception as e:
        db.rollback()
        return {
            "code": 1,
            "msg": f"更新失败: {str(e)}",
            "data": {}
        }


@router.delete("/delete/{id}", response_model=dict)
async def delete_quote(
    id: int,
    db: Session = Depends(get_db_jns)
):
    """删除报价单"""
    try:
        quote = db.query(Quote).filter(Quote.id == id).first()
        if not quote:
            return {"code": 1, "msg": "报价单不存在", "data": {}}
        
        db.delete(quote)
        db.commit()
        
        return {
            "code": 0,
            "msg": "删除成功",
            "data": {}
        }
    except Exception as e:
        db.rollback()
        return {
            "code": 1,
            "msg": f"删除失败: {str(e)}",
            "data": {}
        }
