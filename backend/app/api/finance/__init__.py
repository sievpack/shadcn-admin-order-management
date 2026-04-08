from typing import Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, extract

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.finance_service import accounts_receivable_service, accounts_payable_service

router = APIRouter()


def generate_code(prefix: str) -> str:
    today = datetime.now().strftime('%Y%m%d')
    return f"{prefix}-{today}-001"


# ==================== 应收账款 API ====================
@router.get("/ar/list")
async def get_ar_list(
    query: Optional[str] = None,
    应收单号: Optional[str] = None,
    客户名称: Optional[str] = None,
    status: Optional[str] = Query(None, description='收款状态'),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    items, total = accounts_receivable_service.search(
        db, query=query, 应收单号=应收单号, 客户名称=客户名称, 收款状态=status, page=page, page_size=limit
    )
    data = [accounts_receivable_service.to_dict(item) for item in items]
    return {"code": 0, "msg": "success", "count": total, "data": data}


@router.get("/ar/export-monthly-shipment")
async def export_monthly_shipment(
    year: int = Query(2026, description="年份"),
    month: int = Query(3, description="月份"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """导出指定月份发货数据汇总（按客户）
    
    返回所有有发货记录的客户及其月发货金额、外购金额，用于导出表格
    """
    from app.models.ship import Ship
    from app.models.order import Order
    from app.models.customer import Customer

    start_date_str = f'{year}-{month:02d}-01'
    if month == 12:
        end_date_str = f'{year + 1}-01-01'
    else:
        end_date_str = f'{year}-{month + 1:02d}-01'

    query_obj = db.query(
        Ship.客户名称,
        Order.金额,
        Order.外购
    ).join(
        Order, Order.ship_id == Ship.id
    ).join(
        Customer, Order.客户名称 == Customer.客户名称
    ).filter(
        Customer.状态 != '停用',
        Ship.发货日期 >= start_date_str,
        Ship.发货日期 < end_date_str
    )

    customer_shipments = query_obj.all()

    customer_amount_map = {}
    for cust_name, amount, 外购 in customer_shipments:
        if cust_name not in customer_amount_map:
            customer_amount_map[cust_name] = {
                "客户名称": cust_name,
                "发货单数": 0,
                "发货金额": 0,
                "外购金额": 0
            }
        customer_amount_map[cust_name]["发货单数"] += 1
        if amount is not None:
            if 外购 == 1:
                customer_amount_map[cust_name]["外购金额"] += amount
            else:
                customer_amount_map[cust_name]["发货金额"] += amount

    result_list = [
        {
            "客户名称": data["客户名称"],
            "发货单数": data["发货单数"],
            "发货金额": round(data["发货金额"], 2),
            "外购金额": round(data["外购金额"], 2),
            f"{year}年{month}月": f"{year}-{month:02d}"
        }
        for data in customer_amount_map.values()
    ]

    result_list.sort(key=lambda x: x["发货金额"], reverse=True)

    return {
        "code": 0,
        "msg": "success",
        "count": len(result_list),
        "data": result_list
    }


@router.get("/ar/{ar_id}")
async def get_ar_detail(
    ar_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    item = accounts_receivable_service.get_by_id(db, ar_id)
    if not item:
        return {"code": 1, "msg": "应收账款不存在", "data": {}}
    return {"code": 0, "msg": "success", "count": 1, "data": accounts_receivable_service.to_dict(item)}


@router.post("/ar/create")
async def create_ar(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    ar, error = accounts_receivable_service.create(
        db,
        应收单号=data.get("应收单号") or generate_code("AR"),
        关联订单=data.get("关联订单"),
        客户名称=data.get("客户名称"),
        应收金额=data.get("应收金额", 0),
        已收金额=data.get("已收金额", 0),
        应收余额=data.get("应收余额", 0),
        应收日期=data.get("应收日期"),
        到期日期=data.get("到期日期"),
        账期类型=data.get("账期类型", "月结30天"),
        收款状态=data.get("收款状态", "未收款"),
        备注=data.get("备注"),
        create_by=data.get("create_by"),
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return {"code": 0, "msg": "创建成功", "data": {"id": ar.id}}


@router.put("/ar/update")
async def update_ar(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    ar_id = data.get("id")
    if not ar_id:
        return {"code": 1, "msg": "缺少ID", "data": {}}

    ar, error = accounts_receivable_service.update(
        db, ar_id,
        关联订单=data.get("关联订单"),
        客户名称=data.get("客户名称"),
        应收金额=data.get("应收金额"),
        已收金额=data.get("已收金额"),
        应收余额=data.get("应收余额"),
        应收日期=data.get("应收日期"),
        到期日期=data.get("到期日期"),
        账期类型=data.get("账期类型"),
        收款状态=data.get("收款状态"),
        备注=data.get("备注"),
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return {
        "code": 0,
        "msg": "更新成功",
        "data": {
            "id": ar.id,
            "关联订单": ar.关联订单,
            "客户名称": ar.客户名称,
            "应收金额": float(ar.应收金额) if ar.应收金额 else 0,
            "已收金额": float(ar.已收金额) if ar.已收金额 else 0,
            "应收余额": float(ar.应收余额) if ar.应收余额 else 0,
            "应收日期": ar.应收日期.strftime('%Y-%m-%d') if ar.应收日期 else None,
            "到期日期": ar.到期日期.strftime('%Y-%m-%d') if ar.到期日期 else None,
            "账期类型": ar.账期类型,
            "收款状态": ar.收款状态,
            "备注": ar.备注,
        }
    }


@router.delete("/ar/{ar_id}")
async def delete_ar(
    ar_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    success, error = accounts_receivable_service.delete(db, ar_id)

    if not success:
        raise HTTPException(status_code=404, detail=error)

    return {"code": 0, "msg": "删除成功", "data": {}}


@router.get("/ar/aging")
async def get_ar_aging(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    result = accounts_receivable_service.get_aging(db)
    return {"code": 0, "msg": "success", "count": len(result), "data": result}


# ==================== 应付账款 API ====================
@router.get("/ap/list")
async def get_ap_list(
    应付单号: Optional[str] = None,
    供应商名称: Optional[str] = None,
    付款状态: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    items, total = accounts_payable_service.search(
        db, 应付单号=应付单号, 供应商名称=供应商名称, 付款状态=付款状态, page=page, page_size=limit
    )
    data = [accounts_payable_service.to_dict(item) for item in items]
    return {"code": 0, "msg": "success", "count": total, "data": data}


@router.post("/ap/create")
async def create_ap(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    ap, error = accounts_payable_service.create(
        db,
        应付单号=data.get("应付单号") or generate_code("AP"),
        关联订单=data.get("关联订单"),
        供应商名称=data.get("供应商名称"),
        应付金额=data.get("应付金额", 0),
        已付金额=data.get("已付金额", 0),
        应付余额=data.get("应付余额", 0),
        应付日期=data.get("应付日期"),
        到期日期=data.get("到期日期"),
        账期类型=data.get("账期类型", "月结30天"),
        付款状态=data.get("付款状态", "未付款"),
        备注=data.get("备注"),
        create_by=data.get("create_by"),
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return {"code": 0, "msg": "创建成功", "data": {"id": ap.id}}


@router.get("/ap/aging")
async def get_ap_aging(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    result = accounts_payable_service.get_aging(db)
    return {"code": 0, "msg": "success", "count": len(result), "data": result}


# ==================== 其他财务 API (保持原架构) ====================
from app.models.finance import (
    AccountsReceivable, CollectionRecord, ARWriteOff,
    AccountsPayable, PaymentRecord, APWriteOff, Voucher
)


def ar_to_dict(item: AccountsReceivable) -> dict:
    return {
        'id': item.id,
        '应收单号': item.应收单号,
        '关联订单': item.关联订单,
        '客户名称': item.客户名称,
        '应收金额': float(item.应收金额) if item.应收金额 else 0,
        '已收金额': float(item.已收金额) if item.已收金额 else 0,
        '应收余额': float(item.应收余额) if item.应收余额 else 0,
        '应收日期': item.应收日期.strftime('%Y-%m-%d') if item.应收日期 else None,
        '到期日期': item.到期日期.strftime('%Y-%m-%d') if item.到期日期 else None,
        '账期类型': item.账期类型,
        '收款状态': item.收款状态,
        '备注': item.备注,
        'create_at': item.create_at.strftime('%Y-%m-%d %H:%M:%S') if item.create_at else None,
        'update_at': item.update_at.strftime('%Y-%m-%d %H:%M:%S') if item.update_at else None,
        'create_by': item.create_by,
    }


def collection_to_dict(item: CollectionRecord) -> dict:
    return {
        'id': item.id,
        '收款单号': item.收款单号,
        '关联应收': item.关联应收,
        '收款金额': float(item.收款金额) if item.收款金额 else 0,
        '收款方式': item.收款方式,
        '收款日期': item.收款日期.strftime('%Y-%m-%d') if item.收款日期 else None,
        '核销状态': item.核销状态,
        '操作人': item.操作人,
        '备注': item.备注,
        'create_at': item.create_at.strftime('%Y-%m-%d %H:%M:%S') if item.create_at else None,
        'create_by': item.create_by,
    }


def ap_to_dict(item: AccountsPayable) -> dict:
    return {
        'id': item.id,
        '应付单号': item.应付单号,
        '关联订单': item.关联订单,
        '供应商名称': item.供应商名称,
        '应付金额': float(item.应付金额) if item.应付金额 else 0,
        '已付金额': float(item.已付金额) if item.已付金额 else 0,
        '应付余额': float(item.应付余额) if item.应付余额 else 0,
        '应付日期': item.应付日期.strftime('%Y-%m-%d') if item.应付日期 else None,
        '到期日期': item.到期日期.strftime('%Y-%m-%d') if item.到期日期 else None,
        '账期类型': item.账期类型,
        '付款状态': item.付款状态,
        '备注': item.备注,
        'create_at': item.create_at.strftime('%Y-%m-%d %H:%M:%S') if item.create_at else None,
        'update_at': item.update_at.strftime('%Y-%m-%d %H:%M:%S') if item.update_at else None,
        'create_by': item.create_by,
    }


def payment_to_dict(item: PaymentRecord) -> dict:
    return {
        'id': item.id,
        '付款单号': item.付款单号,
        '关联应付': item.关联应付,
        '付款金额': float(item.付款金额) if item.付款金额 else 0,
        '付款方式': item.付款方式,
        '付款日期': item.付款日期.strftime('%Y-%m-%d') if item.付款日期 else None,
        '核销状态': item.核销状态,
        '操作人': item.操作人,
        '备注': item.备注,
        'create_at': item.create_at.strftime('%Y-%m-%d %H:%M:%S') if item.create_at else None,
        'create_by': item.create_by,
    }


def ap_writeoff_to_dict(item: APWriteOff) -> dict:
    return {
        'id': item.id,
        '核销编号': item.核销编号,
        '应付单号': item.应付单号,
        '付款单号': item.付款单号,
        '核销金额': float(item.核销金额) if item.核销金额 else 0,
        '核销日期': item.核销日期.strftime('%Y-%m-%d') if item.核销日期 else None,
        '核销人': item.核销人,
        '备注': item.备注,
        'create_at': item.create_at.strftime('%Y-%m-%d %H:%M:%S') if item.create_at else None,
    }


def voucher_to_dict(item: Voucher) -> dict:
    return {
        'id': item.id,
        '凭证编号': item.凭证编号,
        '凭证日期': item.凭证日期.strftime('%Y-%m-%d') if item.凭证日期 else None,
        '凭证类型': item.凭证类型,
        '摘要': item.摘要,
        '科目': item.科目,
        '借方金额': float(item.借方金额) if item.借方金额 else 0,
        '贷方金额': float(item.贷方金额) if item.贷方金额 else 0,
        '审核状态': item.审核状态,
        '审核人': item.审核人,
        '附件数量': item.附件数量,
        '备注': item.备注,
        'create_at': item.create_at.strftime('%Y-%m-%d %H:%M:%S') if item.create_at else None,
        'update_at': item.update_at.strftime('%Y-%m-%d %H:%M:%S') if item.update_at else None,
        'create_by': item.create_by,
    }


# ==================== 收款记录 API ====================
@router.get("/collection/list")
async def get_collection_list(
    收款单号: Optional[str] = None,
    关联应收: Optional[str] = None,
    核销状态: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    filters = []
    if 收款单号:
        filters.append(CollectionRecord.收款单号.contains(收款单号))
    if 关联应收:
        filters.append(CollectionRecord.关联应收.contains(关联应收))
    if 核销状态:
        filters.append(CollectionRecord.核销状态 == 核销状态)

    query_obj = db.query(CollectionRecord).filter(*filters).order_by(desc(CollectionRecord.id))
    total = query_obj.count()
    items = query_obj.offset((page - 1) * limit).limit(limit).all()

    return {"code": 0, "msg": "success", "count": total, "data": [collection_to_dict(i) for i in items]}


@router.post("/collection/create")
async def create_collection(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    from decimal import Decimal
    try:
        new_item = CollectionRecord(
            收款单号=data.get("收款单号") or generate_code("CR"),
            关联应收=data.get("关联应收"),
            收款金额=Decimal(str(data.get("收款金额", 0))),
            收款方式=data.get("收款方式"),
            收款日期=data.get("收款日期"),
            核销状态=data.get("核销状态", "未核销"),
            操作人=data.get("操作人"),
            备注=data.get("备注"),
            create_by=data.get("create_by"),
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return {"code": 0, "msg": "创建成功", "data": {"id": new_item.id}}
    except Exception as e:
        db.rollback()
        return {"code": 1, "msg": f"创建失败: {str(e)}", "data": {}}


# ==================== 付款记录 API ====================
@router.get("/payment/list")
async def get_payment_list(
    付款单号: Optional[str] = None,
    关联应付: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    filters = []
    if 付款单号:
        filters.append(PaymentRecord.付款单号.contains(付款单号))
    if 关联应付:
        filters.append(PaymentRecord.关联应付.contains(关联应付))

    query_obj = db.query(PaymentRecord).filter(*filters).order_by(desc(PaymentRecord.id))
    total = query_obj.count()
    items = query_obj.offset((page - 1) * limit).limit(limit).all()

    return {"code": 0, "msg": "success", "count": total, "data": [payment_to_dict(i) for i in items]}


@router.post("/payment/create")
async def create_payment(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    from decimal import Decimal
    try:
        new_item = PaymentRecord(
            付款单号=data.get("付款单号") or generate_code("PY"),
            关联应付=data.get("关联应付"),
            付款金额=Decimal(str(data.get("付款金额", 0))),
            付款方式=data.get("付款方式"),
            付款日期=data.get("付款日期"),
            核销状态=data.get("核销状态", "未核销"),
            操作人=data.get("操作人"),
            备注=data.get("备注"),
            create_by=data.get("create_by"),
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return {"code": 0, "msg": "创建成功", "data": {"id": new_item.id}}
    except Exception as e:
        db.rollback()
        return {"code": 1, "msg": f"创建失败: {str(e)}", "data": {}}


# ==================== 凭证 API ====================
@router.get("/voucher/list")
async def get_voucher_list(
    凭证编号: Optional[str] = None,
    审核状态: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    filters = []
    if 凭证编号:
        filters.append(Voucher.凭证编号.contains(凭证编号))
    if 审核状态:
        filters.append(Voucher.审核状态 == 审核状态)

    query_obj = db.query(Voucher).filter(*filters).order_by(desc(Voucher.id))
    total = query_obj.count()
    items = query_obj.offset((page - 1) * limit).limit(limit).all()

    return {"code": 0, "msg": "success", "count": total, "data": [voucher_to_dict(i) for i in items]}


@router.post("/voucher/create")
async def create_voucher(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    from decimal import Decimal
    try:
        new_item = Voucher(
            凭证编号=data.get("凭证编号") or generate_code("VCH"),
            凭证日期=data.get("凭证日期"),
            凭证类型=data.get("凭证类型", "记账凭证"),
            摘要=data.get("摘要"),
            科目=data.get("科目"),
            借方金额=Decimal(str(data.get("借方金额", 0))),
            贷方金额=Decimal(str(data.get("贷方金额", 0))),
            审核状态=data.get("审核状态", "待审核"),
            审核人=data.get("审核人"),
            附件数量=data.get("附件数量", 0),
            备注=data.get("备注"),
            create_by=data.get("create_by"),
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return {"code": 0, "msg": "创建成功", "data": {"id": new_item.id}}
    except Exception as e:
        db.rollback()
        return {"code": 1, "msg": f"创建失败: {str(e)}", "data": {}}


@router.put("/voucher/approve/{voucher_id}")
async def approve_voucher(
    voucher_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    item = db.query(Voucher).filter(Voucher.id == voucher_id).first()
    if not item:
        return {"code": 1, "msg": "凭证不存在", "data": {}}
    try:
        item.审核状态 = "已审核"
        item.update_at = datetime.now()
        db.commit()
        return {"code": 0, "msg": "审核成功", "data": {}}
    except Exception as e:
        db.rollback()
        return {"code": 1, "msg": f"审核失败: {str(e)}", "data": {}}


# ==================== 收入统计 API ====================
@router.get("/stats/income")
async def get_income_stats(
    year: Optional[int] = None,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    if year is None:
        year = datetime.now().year

    months = []
    for month in range(1, 13):
        ar_items = db.query(AccountsReceivable).filter(
            extract('month', AccountsReceivable.应收日期) == month,
            extract('year', AccountsReceivable.应收日期) == year
        ).all()

        total_ar = sum(float(item.应收金额 or 0) for item in ar_items)
        total_received = sum(float(item.已收金额 or 0) for item in ar_items)

        collection_items = db.query(CollectionRecord).filter(
            extract('month', CollectionRecord.收款日期) == month,
            extract('year', CollectionRecord.收款日期) == year
        ).all()
        total_collection = sum(float(item.收款金额 or 0) for item in collection_items)

        months.append({
            'month': f"{year}-{month:02d}",
            '应收金额': total_ar,
            '已收金额': total_received,
            '收款金额': total_collection,
        })

    return {"code": 0, "msg": "success", "count": 12, "data": months}


# ==================== 批量生成应收账款 API ====================
@router.post("/ar/batch-create-from-shipment")
async def batch_create_ar_from_shipment(
    year: int = Query(2026, description="年份"),
    month: int = Query(3, description="月份"),
    receivable_date: str = Query("2026-04-30", description="应收日期"),
    customer_name: Optional[str] = Query(None, description="客户名称（可选，不传则生成所有客户）"),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """从发货数据批量生成应收账款
    
    将指定月份的发货数据按客户汇总，批量创建应收账款记录
    """
    from app.models.ship import Ship
    from app.models.order import Order
    from app.models.customer import Customer
    from app.api.code import generate_code

    target_year_start = datetime(year, month, 1, 0, 0, 0, 0)
    if month == 12:
        target_year_end = datetime(year + 1, 1, 1, 0, 0, 0, 0)
    else:
        target_year_end = datetime(year, month + 1, 1, 0, 0, 0, 0)

    query_obj = db.query(
        Ship.客户名称,
        Order.金额
    ).outerjoin(
        Order, Order.发货单号 == Ship.发货单号
    ).join(
        Customer, Ship.客户名称 == Customer.客户名称
    ).filter(
        Customer.状态 != '停用',
        Ship.发货日期 >= target_year_start,
        Ship.发货日期 < target_year_end
    )

    if customer_name:
        query_obj = query_obj.filter(Ship.客户名称 == customer_name)

    customer_shipments = query_obj.all()

    customer_amount_map = {}
    for customer_name, amount in customer_shipments:
        if customer_name not in customer_amount_map:
            customer_amount_map[customer_name] = 0
        if amount is not None:
            customer_amount_map[customer_name] += amount

    created_records = []
    skipped_records = []
    for customer_name, total_amount in customer_amount_map.items():
        if total_amount <= 0:
            continue

        existing_ar = db.query(AccountsReceivable).filter(
            AccountsReceivable.客户名称 == customer_name,
            extract('year', AccountsReceivable.应收日期) == year,
            extract('month', AccountsReceivable.应收日期) == month
        ).first()

        if existing_ar:
            skipped_records.append({
                "customer_name": customer_name,
                "reason": "已存在该月份应收单",
                "existing_ar_id": existing_ar.id,
                "应收单号": existing_ar.应收单号
            })
            continue

        try:
            from decimal import Decimal
            new_ar = AccountsReceivable(
                应收单号=generate_code("YS"),
                客户名称=customer_name,
                应收金额=Decimal(str(round(total_amount, 2))),
                已收金额=Decimal("0"),
                应收余额=Decimal(str(round(total_amount, 2))),
                应收日期=datetime.strptime(receivable_date, '%Y-%m-%d').date(),
                到期日期=None,
                账期类型="月结30天",
                收款状态="未收款",
                备注=f"由{year}年{month}月发货数据自动生成",
                create_by=current_user.username if current_user else "system"
            )
            db.add(new_ar)
            db.commit()
            db.refresh(new_ar)
            created_records.append({
                "customer_name": customer_name,
                "应收单号": new_ar.应收单号,
                "应收金额": float(new_ar.应收金额),
                "ar_id": new_ar.id
            })
        except Exception as e:
            db.rollback()
            skipped_records.append({
                "customer_name": customer_name,
                "reason": f"创建失败: {str(e)}"
            })

    return {
        "code": 0,
        "msg": f"成功创建{len(created_records)}条应收单，跳过{len(skipped_records)}条",
        "data": {
            "created": created_records,
            "skipped": skipped_records
        }
    }

