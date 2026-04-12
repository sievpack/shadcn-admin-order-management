import logging
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.core.response import success_response, error_response
from app.services.finance_service import accounts_receivable_service, accounts_payable_service, collection_record_service, payment_record_service, voucher_service, accounts_receivable_batch_service, finance_stats_service

logger = logging.getLogger(__name__)

router = APIRouter()


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
    return success_response(data=data, count=total)


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

    return success_response(data=result_list, count=len(result_list))


@router.get("/ar/{ar_id}")
async def get_ar_detail(
    ar_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    item = accounts_receivable_service.get_by_id(db, ar_id)
    if not item:
        return error_response(msg="应收账款不存在")
    return success_response(data=accounts_receivable_service.to_dict(item), count=1)


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
        return error_response(msg=error)
    return success_response(data={"id": ar.id}, msg="创建成功")


@router.put("/ar/update")
async def update_ar(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    ar_id = data.get("id")
    if not ar_id:
        return error_response(msg="缺少ID")

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
        return error_response(msg=error)
    return success_response(data=accounts_receivable_service.to_dict(ar), msg="更新成功")


@router.delete("/ar/{ar_id}")
async def delete_ar(
    ar_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    success, error = accounts_receivable_service.delete(db, ar_id)

    if not success:
        return error_response(msg=error or "删除失败")
    return success_response(msg="删除成功")


@router.get("/ar/aging")
async def get_ar_aging(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    result = accounts_receivable_service.get_aging(db)
    return success_response(data=result, count=len(result))


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
    return success_response(data=data, count=total)


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
        return error_response(msg=error)
    return success_response(data={"id": ap.id}, msg="创建成功")


@router.get("/ap/aging")
async def get_ap_aging(
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    result = accounts_payable_service.get_aging(db)
    return success_response(data=result, count=len(result))


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
    items, total = collection_record_service.search(
        db, 收款单号=收款单号, 关联应收=关联应收, 核销状态=核销状态, page=page, page_size=limit
    )
    data = [collection_record_service.to_dict(item) for item in items]
    return success_response(data=data, count=total)


@router.post("/collection/create")
async def create_collection(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    new_item, error = collection_record_service.create(
        db,
        收款单号=data.get("收款单号"),
        关联应收=data.get("关联应收"),
        收款金额=data.get("收款金额", 0),
        收款方式=data.get("收款方式"),
        收款日期=data.get("收款日期"),
        核销状态=data.get("核销状态", "未核销"),
        操作人=data.get("操作人"),
        备注=data.get("备注"),
        create_by=data.get("create_by"),
    )

    if error:
        return error_response(msg=f"创建失败: {error}")
    return success_response(data={"id": new_item.id}, msg="创建成功")


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
    items, total = payment_record_service.search(
        db, 付款单号=付款单号, 关联应付=关联应付, page=page, page_size=limit
    )
    data = [payment_record_service.to_dict(item) for item in items]
    return success_response(data=data, count=total)


@router.post("/payment/create")
async def create_payment(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    new_item, error = payment_record_service.create(
        db,
        付款单号=data.get("付款单号"),
        关联应付=data.get("关联应付"),
        付款金额=data.get("付款金额", 0),
        付款方式=data.get("付款方式"),
        付款日期=data.get("付款日期"),
        核销状态=data.get("核销状态", "未核销"),
        操作人=data.get("操作人"),
        备注=data.get("备注"),
        create_by=data.get("create_by"),
    )

    if error:
        return error_response(msg=f"创建失败: {error}")
    return success_response(data={"id": new_item.id}, msg="创建成功")


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
    items, total = voucher_service.search(
        db, 凭证编号=凭证编号, 审核状态=审核状态, page=page, page_size=limit
    )
    data = [voucher_service.to_dict(item) for item in items]
    return success_response(data=data, count=total)


@router.post("/voucher/create")
async def create_voucher(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    new_item, error = voucher_service.create(
        db,
        凭证编号=data.get("凭证编号"),
        凭证日期=data.get("凭证日期"),
        凭证类型=data.get("凭证类型", "记账凭证"),
        摘要=data.get("摘要"),
        科目=data.get("科目"),
        借方金额=data.get("借方金额", 0),
        贷方金额=data.get("贷方金额", 0),
        审核状态=data.get("审核状态", "待审核"),
        审核人=data.get("审核人"),
        附件数量=data.get("附件数量", 0),
        备注=data.get("备注"),
        create_by=data.get("create_by"),
    )

    if error:
        return error_response(msg=f"创建失败: {error}")
    return success_response(data={"id": new_item.id}, msg="创建成功")


@router.put("/voucher/approve/{voucher_id}")
async def approve_voucher(
    voucher_id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    success, error = voucher_service.approve(db, voucher_id)
    if not success:
        return error_response(msg=error or "审核失败")
    return success_response(msg="审核成功")


# ==================== 收入统计 API ====================
@router.get("/stats/income")
async def get_income_stats(
    year: Optional[int] = None,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    months = finance_stats_service.get_income_stats(db, year)
    return success_response(data=months, count=12)


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
    created_records, skipped_records = accounts_receivable_batch_service.batch_create_from_shipment(
        db, year, month, receivable_date, customer_name
    )

    return success_response(
        data={
            "created": created_records,
            "skipped": skipped_records
        },
        msg=f"成功创建{len(created_records)}条应收单，跳过{len(skipped_records)}条"
    )

