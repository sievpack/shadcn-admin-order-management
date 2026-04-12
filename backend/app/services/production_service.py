from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
from app.repositories.production_repository import (
    production_plan_repository, production_order_repository,
    quality_inspection_repository, product_inbound_repository,
    material_consumption_repository, production_report_repository
)
from app.models.production import ProductionPlan, ProductionOrder, ProductionReport, QualityInspection, ProductInbound, MaterialConsumption
from app.core.code_generator import generate_code


class ProductionPlanService:
    def __init__(self):
        self.repo = production_plan_repository

    def get_by_id(self, db: Session, id: int) -> Optional[ProductionPlan]:
        return self.repo.get_by_id(db, id)

    def search(
        self,
        db: Session,
        query: Optional[str] = None,
        计划编号: Optional[str] = None,
        计划名称: Optional[str] = None,
        产品型号: Optional[str] = None,
        计划状态: Optional[str] = None,
        优先级: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[ProductionPlan], int]:
        return self.repo.search(
            db, query=query, 计划编号=计划编号, 计划名称=计划名称, 产品型号=产品型号,
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

    def get_orders_by_plan(self, db: Session, plan_id: int) -> Tuple[List[ProductionOrder], int]:
        plan = self.repo.get_by_id(db, plan_id)
        if not plan:
            return [], 0
        orders = production_order_repository.get_all_by_计划编号(db, plan.计划编号)
        return orders, len(orders)

    def create(self, db: Session, **kwargs) -> Tuple[Optional[ProductionPlan], Optional[str]]:
        try:
            plan = self.repo.create(db, **kwargs)
            db.commit()
            return plan, None
        except Exception as e:
            return None, str(e)

    def update(self, db: Session, id: int, **kwargs) -> Tuple[Optional[ProductionPlan], Optional[str]]:
        plan = self.repo.get_by_id(db, id)
        if not plan:
            return None, "生产计划不存在"
        try:
            updated = self.repo.update(db, plan, **kwargs)
            db.commit()
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
        db.commit()
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
        query: Optional[str] = None,
        工单编号: Optional[str] = None,
        计划编号: Optional[str] = None,
        产品型号: Optional[str] = None,
        产线: Optional[str] = None,
        工单状态: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[ProductionOrder], int]:
        return self.repo.search(
            db, query=query, 工单编号=工单编号, 计划编号=计划编号, 产品型号=产品型号,
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
            db.commit()
            return order, None
        except Exception as e:
            return None, str(e)

    def create_from_plan(self, db: Session, plan_id: int, 工单数量: int, 产线: str) -> Tuple[Optional[ProductionOrder], Optional[str]]:
        plan = production_plan_repository.get_by_id(db, plan_id)
        if not plan:
            return None, "生产计划不存在"
        
        if plan.计划状态 not in ['已审核', '生产中']:
            return None, "计划状态不允许生成工单"
        
        remaining = plan.计划数量 - plan.已排数量
        if 工单数量 > remaining:
            return None, f"工单数量超过剩余可排数量，剩余: {remaining}"
        
        try:
            order = self.repo.create(db,
                工单编号=generate_code('WO'),
                计划编号=plan.计划编号,
                产品类型=plan.产品类型,
                产品型号=plan.产品型号,
                规格=plan.规格,
                工单数量=工单数量,
                已完成数量=0,
                单位=plan.单位,
                产线=产线,
                工单状态='待生产',
                计划开始=plan.计划开始日期,
                计划结束=plan.计划完成日期,
                工序='1',
                总工序='1',
            )
            
            plan.已排数量 += 工单数量
            if plan.计划状态 not in ['生产中']:
                plan.计划状态 = '生产中'
            plan.update_at = datetime.now()
            
            db.commit()
            return order, None
        except Exception as e:
            db.rollback()
            return None, str(e)

    def update(self, db: Session, id: int, **kwargs) -> Tuple[Optional[ProductionOrder], Optional[str]]:
        order = self.repo.get_by_id(db, id)
        if not order:
            return None, "生产工单不存在"
        
        new_工单数量 = kwargs.get('工单数量')
        new_已完成数量 = kwargs.get('已完成数量')
        effective_工单数量 = new_工单数量 if new_工单数量 is not None else order.工单数量
        
        if new_工单数量 is not None and new_工单数量 != order.工单数量:
            plan = production_plan_repository.get_by_计划编号(db, order.计划编号)
            if plan:
                diff = new_工单数量 - order.工单数量
                plan.已排数量 += diff
                plan.update_at = datetime.now()
            
            if new_已完成数量 is not None and new_已完成数量 > new_工单数量:
                return None, f"已完成数量不能超过工单数量（{new_工单数量}）"
        
        if new_已完成数量 is not None and new_工单数量 is None and new_已完成数量 > order.工单数量:
            return None, f"已完成数量不能超过工单数量（{order.工单数量}）"
        
        try:
            updated = self.repo.update(db, order, **kwargs)
            db.commit()
            return updated, None
        except Exception as e:
            return None, str(e)

    def start(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        order = self.repo.get_by_id(db, id)
        if not order:
            return False, "生产工单不存在"
        if order.工单状态 not in ['待生产', '已暂停']:
            return False, "当前状态不允许开始生产"
        
        plan = production_plan_repository.get_by_计划编号(db, order.计划编号)
        if not plan:
            return False, "关联的生产计划不存在"
        if plan.计划状态 not in ['已审核', '生产中', '待生产', '暂停中']:
            return False, "计划状态不允许开始生产"
        
        try:
            order.工单状态 = '生产中'
            order.实际开始 = datetime.now()
            order.update_at = datetime.now()
            
            # 如果计划还在暂停中，改为生产中
            if plan.计划状态 == '暂停中':
                plan.计划状态 = '生产中'
            if not plan.实际开始日期:
                plan.实际开始日期 = datetime.now().date()
            plan.update_at = datetime.now()
            
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
        
        plan = production_plan_repository.get_by_计划编号(db, order.计划编号)
        if not plan:
            return False, "关联的生产计划不存在"
        
        try:
            order.工单状态 = '已完工'
            order.实际结束 = datetime.now()
            order.update_at = datetime.now()
            
            # 累加已完成数量到计划
            plan.已完成数量 += order.工单数量
            if not plan.实际完成日期:
                plan.实际完成日期 = datetime.now().date()
            plan.update_at = datetime.now()
            
            # 检查是否所有工单都已完工
            all_orders = production_order_repository.get_all_by_计划编号(db, order.计划编号)
            all_finished = all(o.工单状态 == '已完工' for o in all_orders)
            if all_finished:
                plan.计划状态 = '已完成'
            
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
        
        plan = production_plan_repository.get_by_计划编号(db, order.计划编号)
        if not plan:
            return False, "关联的生产计划不存在"
        
        try:
            order.工单状态 = '已暂停'
            order.update_at = datetime.now()
            
            # 只有所有生产中的工单都暂停了，才将计划设为暂停
            all_orders = production_order_repository.get_all_by_计划编号(db, order.计划编号)
            running_orders = [o for o in all_orders if o.工单状态 == '生产中']
            if len(running_orders) == 0:
                # 没有正在生产的工单了，检查是否有已完工的
                finished_orders = [o for o in all_orders if o.工单状态 == '已完工']
                if len(finished_orders) == len(all_orders):
                    plan.计划状态 = '已完成'
                else:
                    plan.计划状态 = '暂停中'
                plan.update_at = datetime.now()
            
            db.commit()
            return True, None
        except Exception as e:
            return False, str(e)

    def delete(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        success = self.repo.delete(db, id)
        if not success:
            return False, "生产工单不存在"
        try:
            db.commit()
            return True, None
        except Exception as e:
            return False, str(e)

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
        query: Optional[str] = None,
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
            db, query=query, 质检单号=质检单号, 工单编号=工单编号, 质检结果=质检结果,
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
            db.commit()
            return qc, None
        except Exception as e:
            return None, str(e)

    def update(self, db: Session, id: int, **kwargs) -> Tuple[Optional[QualityInspection], Optional[str]]:
        qc = self.repo.get_by_id(db, id)
        if not qc:
            return None, "质检记录不存在"
        try:
            updated = self.repo.update(db, qc, **kwargs)
            db.commit()
            return updated, None
        except Exception as e:
            return None, str(e)

    def delete(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        success = self.repo.delete(db, id)
        if not success:
            return False, "质检记录不存在"
        db.commit()
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
        query: Optional[str] = None,
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
            db, query=query, 入库单号=入库单号, 工单编号=工单编号, 质检单号=质检单号,
            仓库=仓库, 入库状态=入库状态, start_date=start_date, end_date=end_date,
            page=page, page_size=page_size
        )

    def search_dict(self, db: Session, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        items, total = self.search(db, **kwargs)
        return [self.to_dict(item) for item in items], total

    def get_all_仓库(self, db: Session) -> List[str]:
        return self.repo.get_all_仓库(db)

    def create(self, db: Session, **kwargs) -> Tuple[Optional[ProductInbound], Optional[str]]:
        try:
            inbound = self.repo.create(db, **kwargs)
            db.commit()
            return inbound, None
        except Exception as e:
            return None, str(e)

    def update(self, db: Session, id: int, **kwargs) -> Tuple[Optional[ProductInbound], Optional[str]]:
        inbound = self.repo.get_by_id(db, id)
        if not inbound:
            return None, "入库记录不存在"
        try:
            updated = self.repo.update(db, inbound, **kwargs)
            db.commit()
            return updated, None
        except Exception as e:
            return None, str(e)

    def delete(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        success = self.repo.delete(db, id)
        if not success:
            return False, "入库记录不存在"
        db.commit()
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
        query: Optional[str] = None,
        工单编号: Optional[str] = None,
        物料编码: Optional[str] = None,
        物料名称: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[MaterialConsumption], int]:
        return self.repo.search(
            db, query=query, 工单编号=工单编号, 物料编码=物料编码, 物料名称=物料名称,
            start_date=start_date, end_date=end_date, page=page, page_size=page_size
        )

    def search_dict(self, db: Session, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        items, total = self.search(db, **kwargs)
        return [self.to_dict(item) for item in items], total

    def get_all_物料(self, db: Session) -> List[str]:
        return self.repo.get_all_物料(db)

    def create(self, db: Session, **kwargs) -> Tuple[Optional[MaterialConsumption], Optional[str]]:
        try:
            material = self.repo.create(db, **kwargs)
            db.commit()
            return material, None
        except Exception as e:
            return None, str(e)

    def delete(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        success = self.repo.delete(db, id)
        if not success:
            return False, "物料消耗记录不存在"
        db.commit()
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
        query: Optional[str] = None,
        工单编号: Optional[str] = None,
        报工编号: Optional[str] = None,
        报工人: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[ProductionReport], int]:
        return self.repo.search(
            db, query=query, 工单编号=工单编号, 报工编号=报工编号, 报工人=报工人,
            start_date=start_date, end_date=end_date, page=page, page_size=page_size
        )

    def search_dict(self, db: Session, **kwargs) -> Tuple[List[Dict[str, Any]], int]:
        items, total = self.search(db, **kwargs)
        return [self.to_dict(item) for item in items], total

    def get_all_报工人(self, db: Session) -> List[str]:
        return self.repo.get_all_报工人(db)

    def create(self, db: Session, **kwargs) -> Tuple[Optional[ProductionReport], Optional[str], Optional[dict]]:
        from app.models.production import ProductionOrder
        from datetime import datetime
        
        try:
            report = self.repo.create(db, **kwargs)
            
            order = db.query(ProductionOrder).filter(
                ProductionOrder.工单编号 == report.工单编号
            ).first()
            
            result_info = None
            if order:
                order.已完成数量 = (order.已完成数量 or 0) + report.合格数量
                order.update_at = datetime.now()
                
                remaining = order.工单数量 - order.已完成数量
                result_info = {
                    "工单编号": order.工单编号,
                    "已完成数量": order.已完成数量,
                    "工单数量": order.工单数量,
                    "remaining": remaining,
                    "is_completed": remaining <= 0
                }
            
            db.commit()
            return report, None, result_info
        except Exception as e:
            return None, str(e), None

    def delete(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        from app.models.production import ProductionOrder
        from datetime import datetime
        
        report = self.repo.get_by_id(db, id)
        if not report:
            return False, "报工记录不存在"
        
        order = db.query(ProductionOrder).filter(
            ProductionOrder.工单编号 == report.工单编号
        ).first()
        if order:
            order.已完成数量 = max(0, (order.已完成数量 or 0) - report.合格数量)
            order.update_at = datetime.now()
        
        success = self.repo.delete(db, id)
        if not success:
            return False, "报工记录不存在"
        
        db.commit()
        return True, None

    def to_dict(self, report: ProductionReport) -> Dict[str, Any]:
        return self.repo.to_dict(report)


quality_inspection_service = QualityInspectionService()
product_inbound_service = ProductInboundService()
material_consumption_service = MaterialConsumptionService()
production_report_service = ProductionReportService()
