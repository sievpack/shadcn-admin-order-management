from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.customer import Customer
from app.repositories.customer_repository import customer_repository
from app.services.base_service import BaseService


class CustomerService(BaseService[Customer]):
    """客户 Service"""

    def __init__(self):
        super().__init__(customer_repository)

    def search(
        self,
        db: Session,
        search: str = None,
        status: str = None,
        settlement: str = None,
        客户名称: str = None,
        联系人: str = None,
        手机: str = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Customer], int]:
        """搜索客户"""
        skip = (page - 1) * page_size
        return self.repository.search(
            db, search, status, settlement,
            客户名称, 联系人, 手机, skip, page_size
        )

    def get_all_names(self, db: Session) -> List[str]:
        """获取所有客户名称"""
        return self.repository.get_all_names(db)

    def get_by_name(self, db: Session, name: str) -> Optional[Customer]:
        """根据客户名称获取客户"""
        return self.repository.get_by_name(db, name)

    def create(self, db: Session, data: dict) -> Tuple[Optional[Customer], Optional[str]]:
        """创建客户"""
        required_fields = ['客户名称']
        missing_fields = [f for f in required_fields if not data.get(f)]
        
        if missing_fields:
            return None, f"缺少必填字段: {', '.join(missing_fields)}"

        existing = self.get_by_name(db, data.get("客户名称"))
        if existing:
            return None, f"客户名称 '{data.get('客户名称')}' 已存在"

        customer = self.repository.create(db, {
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
            "状态": data.get("状态", "活跃"),
            "create_at": datetime.now(),
            "update_at": datetime.now()
        })
        return customer, None

    def update_customer(self, db: Session, customer_id: int, data: dict) -> Tuple[Optional[Customer], Optional[str]]:
        """更新客户"""
        customer = self.get(db, customer_id)
        if not customer:
            return None, "客户不存在"

        update_data = {k: v for k, v in data.items() if v is not None}
        update_data["update_at"] = datetime.now()

        if update_data:
            self.repository.update(db, customer, update_data)
        return customer, None


customer_service = CustomerService()