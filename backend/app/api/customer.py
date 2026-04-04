from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func
import datetime

from app.db.database import get_db_jns
from app.models.customer import Customer


router = APIRouter()


@router.get("/data", response_model=dict)
async def get_customer_data(
    query: str = Query("list", description="查询类型: list/detail"),
    客户名称: Optional[str] = None,
    联系人: Optional[str] = None,
    手机: Optional[str] = None,
    id: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db_jns)
):
    """获取客户数据"""
    filters = []
    
    if 客户名称:
        filters.append(Customer.客户名称.contains(客户名称))
    
    if 联系人:
        filters.append(Customer.联系人.contains(联系人))
    
    if 手机:
        filters.append(Customer.手机.contains(手机))
    
    if query == "list":
        # 查询客户列表
        if id:
            filters.append(Customer.id == id)
        
        query_obj = db.query(Customer).filter(*filters).order_by(desc(Customer.id))
        total = query_obj.count()
        items = query_obj.offset((page - 1) * limit).limit(limit).all()
        
        data = [{
            'id': item.id,
            '客户名称': item.客户名称,
            '联系电话': item.联系电话,
            '收货地址': item.收货地址,
            '联系人': item.联系人,
            '手机': item.手机,
            '结算方式': item.结算方式,
            '是否含税': item.是否含税,
            '对账时间': item.对账时间,
            '开票时间': item.开票时间,
            '结算周期': item.结算周期,
            '业务负责人': item.业务负责人,
            '送货单版本': item.送货单版本,
            '备注': item.备注,
            '简称': item.简称,
            'create_at': item.create_at.strftime('%Y-%m-%d %H:%M:%S') if item.create_at else None,
            'update_at': item.update_at.strftime('%Y-%m-%d %H:%M:%S') if item.update_at else None,
            'status': '活跃'
        } for item in items]
        
    elif query == "detail":
        # 查询客户详情
        if not id:
            return {"code": 1, "msg": "缺少客户ID", "count": 0, "data": []}
        
        item = db.query(Customer).filter(Customer.id == id).first()
        if not item:
            return {"code": 1, "msg": "客户不存在", "count": 0, "data": []}
        
        data = [{
            'id': item.id,
            '客户名称': item.客户名称,
            '联系电话': item.联系电话,
            '收货地址': item.收货地址,
            '联系人': item.联系人,
            '手机': item.手机,
            '结算方式': item.结算方式,
            '是否含税': item.是否含税,
            '对账时间': item.对账时间,
            '开票时间': item.开票时间,
            '结算周期': item.结算周期,
            '业务负责人': item.业务负责人,
            '送货单版本': item.送货单版本,
            '备注': item.备注,
            '简称': item.简称,
            'create_at': item.create_at.strftime('%Y-%m-%d %H:%M:%S') if item.create_at else None,
            'update_at': item.update_at.strftime('%Y-%m-%d %H:%M:%S') if item.update_at else None,
            'status': '活跃'
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
async def create_customer(
    data: dict,
    db: Session = Depends(get_db_jns)
):
    """创建客户"""
    try:
        new_customer = Customer(
            客户名称=data.get("客户名称"),
            联系电话=data.get("联系电话"),
            收货地址=data.get("收货地址"),
            联系人=data.get("联系人"),
            手机=data.get("手机"),
            结算方式=data.get("结算方式"),
            是否含税=data.get("是否含税"),
            对账时间=data.get("对账时间"),
            开票时间=data.get("开票时间"),
            结算周期=data.get("结算周期"),
            业务负责人=data.get("业务负责人"),
            送货单版本=data.get("送货单版本"),
            备注=data.get("备注"),
            简称=data.get("简称"),
            create_at=datetime.datetime.now(),
            update_at=datetime.datetime.now()
        )
        
        db.add(new_customer)
        db.commit()
        db.refresh(new_customer)
        
        return {
            "code": 0,
            "msg": "创建成功",
            "data": {
                "id": new_customer.id
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
async def update_customer(
    data: dict,
    db: Session = Depends(get_db_jns)
):
    """更新客户"""
    customer_id = data.get("id")
    if not customer_id:
        return {"code": 1, "msg": "缺少客户ID", "data": {}}
    
    try:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            return {"code": 1, "msg": "客户不存在", "data": {}}
        
        update_data = {
            "客户名称": data.get("客户名称"),
            "联系电话": data.get("联系电话"),
            "收货地址": data.get("收货地址"),
            "联系人": data.get("联系人"),
            "手机": data.get("手机"),
            "结算方式": data.get("结算方式"),
            "是否含税": data.get("是否含税"),
            "对账时间": data.get("对账时间"),
            "开票时间": data.get("开票时间"),
            "结算周期": data.get("结算周期"),
            "业务负责人": data.get("业务负责人"),
            "送货单版本": data.get("送货单版本"),
            "备注": data.get("备注"),
            "简称": data.get("简称"),
            "update_at": datetime.datetime.now()
        }
        
        # 过滤掉None值
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        for key, value in update_data.items():
            setattr(customer, key, value)
        
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
async def delete_customer(
    id: int,
    db: Session = Depends(get_db_jns)
):
    """删除客户"""
    try:
        customer = db.query(Customer).filter(Customer.id == id).first()
        if not customer:
            return {"code": 1, "msg": "客户不存在", "data": {}}
        
        db.delete(customer)
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


@router.get("/names", response_model=dict)
async def get_customer_names(
    db: Session = Depends(get_db_jns)
):
    """获取所有客户名称列表"""
    try:
        customers = db.query(Customer.客户名称).filter(Customer.客户名称.isnot(None)).distinct().all()
        customer_names = [name[0] for name in customers if name[0]]
        
        return {
            "code": 0,
            "msg": "success",
            "count": len(customer_names),
            "data": customer_names
        }
    except Exception as e:
        return {
            "code": 1,
            "msg": f"获取客户名称失败: {str(e)}",
            "count": 0,
            "data": []
        }
