from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
from app.repositories.production_repository import (
    production_plan_repository, production_order_repository,
    quality_inspection_repository, product_inbound_repository,
    material_consumption_repository, production_report_repository
)
from app.models.production import ProductionPlan, ProductionOrder, ProductionReport, QualityInspection, ProductInbound, MaterialConsumption


class ProductionPlanService:
    def __init__(self):
        self.repo = production_plan_repository

    def get_by_id(self, db: Session, id: int) -> Optional[ProductionPlan]:
        return self.repo.get_by_id(db, id)

    def search(
        self,
        db: Session,
        计划编号: Optional[str] = None,
        计划名称: Optional[str] = None,
        产品型号: Optional[str] = None,
        计划状态: Optional[str] = None,
        优先级: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[ProductionPlan], int]:
        return self.repo.search(
            db, 计划编号=计划编号, 计划名称=计划名称, 产品型号=产品型号,
            计划状态=计划状态, 优先级=优先级, page=page, page_size=page_size
        )

    def search_dict(self, db: Session, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        items, total = self.search(db, **kwargs)
        return [self.to_dict(item) for item in items], total

    def get_all_计划编号(self, db: Session) -> List[str]:
        return self.repo.get_all_计划编号(db)

    def get_all_产品类型(self, db: Session) -> List[str]:
        return self.repo.get_all_产品类型(db)

    def get_all_产品型号(self, db: Session) -> List[str]:
        return self.repo.get_all_产品型号(db)

    def create(self, db: Session, **kwargs) -> Tuple[Optional[ProductionPlan], Optional[str]]:
        try:
            plan = self.repo.create(db, **kwargs)
            return plan, None
        except Exception as e:
            return None, str(e)

    def update(self, db: Session, id: int, **kwargs) -> Tuple[Optional[ProductionPlan], Optional[str]]:
        plan = self.repo.get_by_id(db, id)
        if not plan:
            return None, "生产计划不存在"
        try:
            updated = self.repo.update(db, plan, **kwargs)
            return updated, None
        except Exception as e:
            return None, str(e)

    def approve(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        plan = self.repo.get_by_id(db, id)
        if not plan:
            return False, "生产计划不存在"
        if plan.计划状态 not in ['待审核', '已驳回']:
            return False, "当前状态不允许审核"
        try:
            plan.计划状态 = '已审核'
            plan.update_at = datetime.now()
            db.commit()
            return True, None
        except Exception as e:
            return False, str(e)

    def reject(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        plan = self.repo.get_by_id(db, id)
        if not plan:
            return False, "生产计划不存在"
        if plan.计划状态 != '待审核':
            return False, "当前状态不允许驳回"
        try:
            plan.计划状态 = '已驳回'
            plan.update_at = datetime.now()
            db.commit()
            return True, None
        except Exception as e:
            return False, str(e)

    def delete(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        success = self.repo.delete(db, id)
        if not success:
            return False, "生产计划不存在"
        return True, None

    def to_dict(self, plan: ProductionPlan) -> Dict[str, Any]:
        return self.repo.to_dict(plan)


class ProductionOrderService:
    def __init__(self):
        self.repo = production_order_repository

    def get_by_id(self, db: Session, id: int) -> Optional[ProductionOrder]:
        return self.repo.get_by_id(db, id)

    def search(
        self,
        db: Session,
        工单编号: Optional[str] = None,
        计划编号: Optional[str] = None,
        产品型号: Optional[str] = None,
        产线: Optional[str] = None,
        工单状态: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[ProductionOrder], int]:
        return self.repo.search(
            db, 工单编号=工单编号, 计划编号=计划编号, 产品型号=产品型号,
            产线=产线, 工单状态=工单状态, page=page, page_size=page_size
        )

    def search_dict(self, db: Session, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        items, total = self.search(db, **kwargs)
        return [self.to_dict(item) for item in items], total

    def get_all_工单编号(self, db: Session) -> List[str]:
        return self.repo.get_all_工单编号(db)

    def get_all_产线(self, db: Session) -> List[str]:
        return self.repo.get_all_产线(db)

    def create(self, db: Session, **kwargs) -> Tuple[Optional[ProductionOrder], Optional[str]]:
        try:
            order = self.repo.create(db, **kwargs)
            return order, None
        except Exception as e:
            return None, str(e)

    def update(self, db: Session, id: int, **kwargs) -> Tuple[Optional[ProductionOrder], Optional[str]]:
        order = self.repo.get_by_id(db, id)
        if not order:
            return None, "生产工单不存在"
        try:
            updated = self.repo.update(db, order, **kwargs)
            return updated, None
        except Exception as e:
            return None, str(e)

    def start(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        order = self.repo.get_by_id(db, id)
        if not order:
            return False, "生产工单不存在"
        if order.工单状态 not in ['待生产', '已暂停']:
            return False, "当前状态不允许开始生产"
        try:
            order.工单状态 = '生产中'
            order.实际开始 = datetime.now()
            order.update_at = datetime.now()
            db.commit()
            return True, None
        except Exception as e:
            return False, str(e)

    def finish(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        order = self.repo.get_by_id(db, id)
        if not order:
            return False, "生产工单不存在"
        if order.工单状态 != '生产中':
            return False, "当前状态不允许完工"
        try:
            order.工单状态 = '已完工'
            order.实际结束 = datetime.now()
            order.update_at = datetime.now()
            db.commit()
            return True, None
        except Exception as e:
            return False, str(e)

    def pause(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        order = self.repo.get_by_id(db, id)
        if not order:
            return False, "生产工单不存在"
        if order.工单状态 != '生产中':
            return False, "当前状态不允许暂停"
        try:
            order.工单状态 = '已暂停'
            order.update_at = datetime.now()
            db.commit()
            return True, None
        except Exception as e:
            return False, str(e)

    def delete(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        success = self.repo.delete(db, id)
        if not success:
            return False, "生产工单不存在"
        return True, None

    def to_dict(self, order: ProductionOrder) -> Dict[str, Any]:
        return self.repo.to_dict(order)


production_plan_service = ProductionPlanService()
production_order_service = ProductionOrderService()


class QualityInspectionService:
    def __init__(self):
        self.repo = quality_inspection_repository

    def get_by_id(self, db: Session, id: int) -> Optional[QualityInspection]:
        return self.repo.get_by_id(db, id)

    def search(
        self,
        db: Session,
        质检单号: Optional[str] = None,
        工单编号: Optional[str] = None,
        质检结果: Optional[str] = None,
        质检员: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[QualityInspection], int]:
        return self.repo.search(
            db, 质检单号=质检单号, 工单编号=工单编号, 质检结果=质检结果,
            质检员=质检员, start_date=start_date, end_date=end_date,
            page=page, page_size=page_size
        )

    def search_dict(self, db: Session, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        items, total = self.search(db, **kwargs)
        return [self.to_dict(item) for item in items], total

    def get_all_质检员(self, db: Session) -> List[str]:
        return self.repo.get_all_质检员(db)

    def create(self, db: Session, **kwargs) -> Tuple[Optional[QualityInspection], Optional[str]]:
        try:
            qc = self.repo.create(db, **kwargs)
            return qc, None
        except Exception as e:
            return None, str(e)

    def update(self, db: Session, id: int, **kwargs) -> Tuple[Optional[QualityInspection], Optional[str]]:
        qc = self.repo.get_by_id(db, id)
        if not qc:
            return None, "质检记录不存在"
        try:
            updated = self.repo.update(db, qc, **kwargs)
            return updated, None
        except Exception as e:
            return None, str(e)

    def delete(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        success = self.repo.delete(db, id)
        if not success:
            return False, "质检记录不存在"
        return True, None

    def to_dict(self, qc: QualityInspection) -> Dict[str, Any]:
        return self.repo.to_dict(qc)


class ProductInboundService:
    def __init__(self):
        self.repo = product_inbound_repository

    def get_by_id(self, db: Session, id: int) -> Optional[ProductInbound]:
        return self.repo.get_by_id(db, id)

    def search(
        self,
        db: Session,
        入库单号: Optional[str] = None,
        工单编号: Optional[str] = None,
        质检单号: Optional[str] = None,
        仓库: Optional[str] = None,
        入库状态: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[ProductInbound], int]:
        return self.repo.search(
            db, 入库单号=入库单号, 工单编号=工单编号,
            仓库=仓库, page=page, page_size=page_size
        )

    def search_dict(self, db: Session, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        items, total = self.search(db, **kwargs)
        return [self.to_dict(item) for item in items], total

    def get_all_仓库(self, db: Session) -> List[str]:
        return self.repo.get_all_仓库(db)

    def create(self, db: Session, **kwargs) -> Tuple[Optional[ProductInbound], Optional[str]]:
        try:
            inbound = self.repo.create(db, **kwargs)
            return inbound, None
        except Exception as e:
            return None, str(e)

    def update(self, db: Session, id: int, **kwargs) -> Tuple[Optional[ProductInbound], Optional[str]]:
        inbound = self.repo.get_by_id(db, id)
        if not inbound:
            return None, "入库记录不存在"
        try:
            updated = self.repo.update(db, inbound, **kwargs)
            return updated, None
        except Exception as e:
            return None, str(e)

    def delete(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        success = self.repo.delete(db, id)
        if not success:
            return False, "入库记录不存在"
        return True, None

    def to_dict(self, inbound: ProductInbound) -> Dict[str, Any]:
        return self.repo.to_dict(inbound)


class MaterialConsumptionService:
    def __init__(self):
        self.repo = material_consumption_repository

    def get_by_id(self, db: Session, id: int) -> Optional[MaterialConsumption]:
        return self.repo.get_by_id(db, id)

    def search(
        self,
        db: Session,
        工单编号: Optional[str] = None,
        物料编码: Optional[str] = None,
        物料名称: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[MaterialConsumption], int]:
        return self.repo.search(
            db, 工单编号=工单编号, page=page, page_size=page_size
        )

    def search_dict(self, db: Session, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        items, total = self.search(db, **kwargs)
        return [self.to_dict(item) for item in items], total

    def get_all_物料(self, db: Session) -> List[str]:
        return self.repo.get_all_物料(db)

    def create(self, db: Session, **kwargs) -> Tuple[Optional[MaterialConsumption], Optional[str]]:
        try:
            material = self.repo.create(db, **kwargs)
            return material, None
        except Exception as e:
            return None, str(e)

    def delete(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        success = self.repo.delete(db, id)
        if not success:
            return False, "物料消耗记录不存在"
        return True, None

    def to_dict(self, material: MaterialConsumption) -> Dict[str, Any]:
        return self.repo.to_dict(material)


class ProductionReportService:
    def __init__(self):
        self.repo = production_report_repository

    def get_by_id(self, db: Session, id: int) -> Optional[ProductionReport]:
        return self.repo.get_by_id(db, id)

    def search(
        self,
        db: Session,
        工单编号: Optional[str] = None,
        报工编号: Optional[str] = None,
        报工人: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[ProductionReport], int]:
        return self.repo.search(
            db, 工单编号=工单编号, 报工编号=报工编号, 报工人=报工人,
            start_date=start_date, end_date=end_date, page=page, page_size=page_size
        )

    def search_dict(self, db: Session, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        items, total = self.search(db, **kwargs)
        return [self.to_dict(item) for item in items], total

    def get_all_报工人(self, db: Session) -> List[str]:
        return self.repo.get_all_报工人(db)

    def create(self, db: Session, **kwargs) -> Tuple[Optional[ProductionReport], Optional[str]]:
        try:
            report = self.repo.create(db, **kwargs)
            return report, None
        except Exception as e:
            return None, str(e)

    def delete(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        success = self.repo.delete(db, id)
        if not success:
            return False, "报工记录不存在"
        return True, None

    def to_dict(self, report: ProductionReport) -> Dict[str, Any]:
        return self.repo.to_dict(report)


quality_inspection_service = QualityInspectionService()
product_inbound_service = ProductInboundService()
material_consumption_service = MaterialConsumptionService()
production_report_service = ProductionReportService()
