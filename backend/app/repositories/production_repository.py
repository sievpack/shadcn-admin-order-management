from typing import Optional, Tuple, List
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.models.production import ProductionPlan, ProductionOrder, ProductionReport, MaterialConsumption, QualityInspection, ProductInbound
from app.repositories.base_repository import BaseRepository
from datetime import datetime


class ProductionPlanRepository(BaseRepository):
    def __init__(self):
        super().__init__(ProductionPlan)

    def get_by_id(self, db: Session, id: int) -> Optional[ProductionPlan]:
        return db.query(ProductionPlan).filter(ProductionPlan.id == id).first()

    def get_by_计划编号(self, db: Session, 计划编号: str) -> Optional[ProductionPlan]:
        return db.query(ProductionPlan).filter(ProductionPlan.计划编号 == 计划编号).first()

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
        query_obj = db.query(ProductionPlan)

        if query:
            query_obj = query_obj.filter(
                (ProductionPlan.计划编号.contains(query)) |
                (ProductionPlan.计划名称.contains(query)) |
                (ProductionPlan.产品型号.contains(query))
            )
        if 计划编号:
            query_obj = query_obj.filter(ProductionPlan.计划编号.contains(计划编号))
        if 计划名称:
            query_obj = query_obj.filter(ProductionPlan.计划名称.contains(计划名称))
        if 产品型号:
            query_obj = query_obj.filter(ProductionPlan.产品型号.contains(产品型号))
        if 计划状态:
            query_obj = query_obj.filter(ProductionPlan.计划状态 == 计划状态)
        if 优先级:
            query_obj = query_obj.filter(ProductionPlan.优先级 == 优先级)

        total = query_obj.count()
        items = query_obj.order_by(desc(ProductionPlan.id)).offset((page - 1) * page_size).limit(page_size).all()

        return items, total

    def get_all_计划编号(self, db: Session) -> List[str]:
        results = db.query(ProductionPlan.计划编号).filter(
            ProductionPlan.计划编号.isnot(None)
        ).distinct().all()
        return [r[0] for r in results if r[0]]

    def get_all_产品类型(self, db: Session) -> List[str]:
        results = db.query(ProductionPlan.产品类型).filter(
            ProductionPlan.产品类型.isnot(None)
        ).distinct().all()
        return [r[0] for r in results if r[0]]

    def get_all_产品型号(self, db: Session) -> List[str]:
        results = db.query(ProductionPlan.产品型号).filter(
            ProductionPlan.产品型号.isnot(None)
        ).distinct().all()
        return [r[0] for r in results if r[0]]

    def create(self, db: Session, **kwargs) -> ProductionPlan:
        plan = ProductionPlan(**kwargs)
        db.add(plan)
        db.flush()
        db.refresh(plan)
        return plan

    def update(self, db: Session, plan: ProductionPlan, **kwargs) -> ProductionPlan:
        for key, value in kwargs.items():
            if value is not None:
                setattr(plan, key, value)
        db.flush()
        db.refresh(plan)
        return plan

    def delete(self, db: Session, id: int) -> bool:
        plan = self.get_by_id(db, id)
        if not plan:
            return False
        db.delete(plan)
        return True

    def to_dict(self, plan: ProductionPlan) -> dict:
        return {
            'id': plan.id,
            '计划编号': plan.计划编号,
            '计划名称': plan.计划名称,
            '关联订单': plan.关联订单,
            '产品类型': plan.产品类型,
            '产品型号': plan.产品型号,
            '规格': plan.规格,
            '计划数量': plan.计划数量,
            '已排数量': plan.已排数量,
            '单位': plan.单位,
            '计划开始日期': plan.计划开始日期.strftime('%Y-%m-%d') if plan.计划开始日期 else None,
            '计划完成日期': plan.计划完成日期.strftime('%Y-%m-%d') if plan.计划完成日期 else None,
            '实际开始日期': plan.实际开始日期.strftime('%Y-%m-%d') if plan.实际开始日期 else None,
            '实际完成日期': plan.实际完成日期.strftime('%Y-%m-%d') if plan.实际完成日期 else None,
            '优先级': plan.优先级,
            '计划状态': plan.计划状态,
            '负责人': plan.负责人,
            '备注': plan.备注,
            'create_at': plan.create_at.strftime('%Y-%m-%d %H:%M:%S') if plan.create_at else None,
            'update_at': plan.update_at.strftime('%Y-%m-%d %H:%M:%S') if plan.update_at else None,
            'create_by': plan.create_by,
        }


class ProductionOrderRepository(BaseRepository):
    def __init__(self):
        super().__init__(ProductionOrder)

    def get_by_id(self, db: Session, id: int) -> Optional[ProductionOrder]:
        return db.query(ProductionOrder).filter(ProductionOrder.id == id).first()

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
        query_obj = db.query(ProductionOrder)

        if query:
            query_obj = query_obj.filter(
                (ProductionOrder.工单编号.contains(query)) |
                (ProductionOrder.计划编号.contains(query)) |
                (ProductionOrder.产品型号.contains(query))
            )
        if 工单编号:
            query_obj = query_obj.filter(ProductionOrder.工单编号.contains(工单编号))
        if 计划编号:
            query_obj = query_obj.filter(ProductionOrder.计划编号.contains(计划编号))
        if 产品型号:
            query_obj = query_obj.filter(ProductionOrder.产品型号.contains(产品型号))
        if 产线:
            query_obj = query_obj.filter(ProductionOrder.产线 == 产线)
        if 工单状态:
            query_obj = query_obj.filter(ProductionOrder.工单状态 == 工单状态)

        total = query_obj.count()
        items = query_obj.order_by(desc(ProductionOrder.id)).offset((page - 1) * page_size).limit(page_size).all()

        return items, total

    def get_all_工单编号(self, db: Session) -> List[str]:
        results = db.query(ProductionOrder.工单编号).filter(
            ProductionOrder.工单编号.isnot(None)
        ).distinct().all()
        return [r[0] for r in results if r[0]]

    def get_all_产线(self, db: Session) -> List[str]:
        results = db.query(ProductionOrder.产线).filter(
            ProductionOrder.产线.isnot(None)
        ).distinct().all()
        return [r[0] for r in results if r[0]]

    def get_all_by_计划编号(self, db: Session, 计划编号: str) -> List[ProductionOrder]:
        return db.query(ProductionOrder).filter(
            ProductionOrder.计划编号 == 计划编号
        ).order_by(desc(ProductionOrder.id)).all()

    def create(self, db: Session, **kwargs) -> ProductionOrder:
        order = ProductionOrder(**kwargs)
        db.add(order)
        db.flush()
        db.refresh(order)
        return order

    def update(self, db: Session, order: ProductionOrder, **kwargs) -> ProductionOrder:
        for key, value in kwargs.items():
            if value is not None:
                setattr(order, key, value)
        db.flush()
        db.refresh(order)
        return order

    def delete(self, db: Session, id: int) -> bool:
        order = self.get_by_id(db, id)
        if not order:
            return False
        db.delete(order)
        return True

    def to_dict(self, order: ProductionOrder) -> dict:
        return {
            'id': order.id,
            '工单编号': order.工单编号,
            '计划编号': order.计划编号,
            '产品类型': order.产品类型,
            '产品型号': order.产品型号,
            '规格': order.规格,
            '工单数量': order.工单数量,
            '已完成数量': order.已完成数量,
            '单位': order.单位,
            '产线': order.产线,
            '工单状态': order.工单状态,
            '计划开始': order.计划开始.strftime('%Y-%m-%d') if order.计划开始 else None,
            '计划结束': order.计划结束.strftime('%Y-%m-%d') if order.计划结束 else None,
            '实际开始': order.实际开始.strftime('%Y-%m-%d %H:%M:%S') if order.实际开始 else None,
            '实际结束': order.实际结束.strftime('%Y-%m-%d %H:%M:%S') if order.实际结束 else None,
            '工序': order.工序,
            '总工序': order.总工序,
            '报工备注': order.报工备注,
            'create_at': order.create_at.strftime('%Y-%m-%d %H:%M:%S') if order.create_at else None,
            'update_at': order.update_at.strftime('%Y-%m-%d %H:%M:%S') if order.update_at else None,
        }


class QualityInspectionRepository(BaseRepository):
    def __init__(self):
        super().__init__(QualityInspection)

    def get_by_id(self, db: Session, id: int) -> Optional[QualityInspection]:
        return db.query(QualityInspection).filter(QualityInspection.id == id).first()

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
        query_obj = db.query(QualityInspection)

        if query:
            query_obj = query_obj.filter(
                (QualityInspection.质检单号.contains(query)) |
                (QualityInspection.工单编号.contains(query))
            )
        if 质检单号:
            query_obj = query_obj.filter(QualityInspection.质检单号.contains(质检单号))
        if 工单编号:
            query_obj = query_obj.filter(QualityInspection.工单编号.contains(工单编号))
        if 质检结果:
            query_obj = query_obj.filter(QualityInspection.质检结果 == 质检结果)
        if 质检员:
            query_obj = query_obj.filter(QualityInspection.质检员.contains(质检员))

        total = query_obj.count()
        items = query_obj.order_by(desc(QualityInspection.id)).offset((page - 1) * page_size).limit(page_size).all()

        return items, total

    def get_all_质检员(self, db: Session) -> List[str]:
        results = db.query(QualityInspection.质检员).filter(
            QualityInspection.质检员.isnot(None)
        ).distinct().all()
        return [r[0] for r in results if r[0]]

    def create(self, db: Session, **kwargs) -> QualityInspection:
        qc = QualityInspection(**kwargs)
        db.add(qc)
        db.flush()
        db.refresh(qc)
        return qc

    def update(self, db: Session, qc: QualityInspection, **kwargs) -> QualityInspection:
        for key, value in kwargs.items():
            if value is not None:
                setattr(qc, key, value)
        db.flush()
        db.refresh(qc)
        return qc

    def delete(self, db: Session, id: int) -> bool:
        qc = self.get_by_id(db, id)
        if not qc:
            return False
        db.delete(qc)
        return True

    def to_dict(self, qc: QualityInspection) -> dict:
        return {
            'id': qc.id,
            '质检单号': qc.质检单号,
            '关联报工': qc.关联报工,
            '工单编号': qc.工单编号,
            '产品类型': qc.产品类型,
            '产品型号': qc.产品型号,
            '批次号': qc.批次号,
            '送检数量': qc.送检数量,
            '合格数量': qc.合格数量,
            '不良数量': qc.不良数量,
            '不良率': round(qc.不良数量 / qc.送检数量 * 100, 2) if qc.送检数量 > 0 else 0,
            '质检结果': qc.质检结果,
            '不良分类': qc.不良分类,
            '不良描述': qc.不良描述,
            '质检员': qc.质检员,
            '质检日期': qc.质检日期.strftime('%Y-%m-%d %H:%M:%S') if qc.质检日期 else None,
            '备注': qc.备注,
            'create_at': qc.create_at.strftime('%Y-%m-%d %H:%M:%S') if qc.create_at else None,
            'update_at': qc.update_at.strftime('%Y-%m-%d %H:%M:%S') if qc.update_at else None,
        }


class ProductInboundRepository(BaseRepository):
    def __init__(self):
        super().__init__(ProductInbound)

    def get_by_id(self, db: Session, id: int) -> Optional[ProductInbound]:
        return db.query(ProductInbound).filter(ProductInbound.id == id).first()

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
        query_obj = db.query(ProductInbound)

        if query:
            query_obj = query_obj.filter(
                (ProductInbound.入库单号.contains(query)) |
                (ProductInbound.工单编号.contains(query)) |
                (ProductInbound.质检单号.contains(query))
            )
        if 入库单号:
            query_obj = query_obj.filter(ProductInbound.入库单号.contains(入库单号))
        if 工单编号:
            query_obj = query_obj.filter(ProductInbound.工单编号.contains(工单编号))
        if 质检单号:
            query_obj = query_obj.filter(ProductInbound.质检单号.contains(质检单号))
        if 仓库:
            query_obj = query_obj.filter(ProductInbound.仓库 == 仓库)
        if 入库状态:
            query_obj = query_obj.filter(ProductInbound.入库状态 == 入库状态)

        total = query_obj.count()
        items = query_obj.order_by(desc(ProductInbound.id)).offset((page - 1) * page_size).limit(page_size).all()

        return items, total

    def get_all_仓库(self, db: Session) -> List[str]:
        results = db.query(ProductInbound.仓库).filter(
            ProductInbound.仓库.isnot(None)
        ).distinct().all()
        return [r[0] for r in results if r[0]]

    def create(self, db: Session, **kwargs) -> ProductInbound:
        inbound = ProductInbound(**kwargs)
        db.add(inbound)
        db.flush()
        db.refresh(inbound)
        return inbound

    def update(self, db: Session, inbound: ProductInbound, **kwargs) -> ProductInbound:
        for key, value in kwargs.items():
            if value is not None:
                setattr(inbound, key, value)
        db.flush()
        db.refresh(inbound)
        return inbound

    def delete(self, db: Session, id: int) -> bool:
        inbound = self.get_by_id(db, id)
        if not inbound:
            return False
        db.delete(inbound)
        return True

    def to_dict(self, inbound: ProductInbound) -> dict:
        return {
            'id': inbound.id,
            '入库单号': inbound.入库单号,
            '质检单号': inbound.质检单号,
            '工单编号': inbound.工单编号,
            '产品类型': inbound.产品类型,
            '产品型号': inbound.产品型号,
            '规格': inbound.规格,
            '入库数量': inbound.入库数量,
            '单位': inbound.单位,
            '批次号': inbound.批次号,
            '仓库': inbound.仓库,
            '库位': inbound.库位,
            '入库类型': inbound.入库类型,
            '入库状态': inbound.入库状态,
            '入库日期': inbound.入库日期.strftime('%Y-%m-%d %H:%M:%S') if inbound.入库日期 else None,
            '入库员': inbound.入库员,
            '收货人': inbound.收货人,
            '关联订单': inbound.关联订单,
            '备注': inbound.备注,
            'create_at': inbound.create_at.strftime('%Y-%m-%d %H:%M:%S') if inbound.create_at else None,
            'update_at': inbound.update_at.strftime('%Y-%m-%d %H:%M:%S') if inbound.update_at else None,
        }


class MaterialConsumptionRepository(BaseRepository):
    def __init__(self):
        super().__init__(MaterialConsumption)

    def get_by_id(self, db: Session, id: int) -> Optional[MaterialConsumption]:
        return db.query(MaterialConsumption).filter(MaterialConsumption.id == id).first()

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
        query_obj = db.query(MaterialConsumption)

        if query:
            query_obj = query_obj.filter(
                (MaterialConsumption.工单编号.contains(query)) |
                (MaterialConsumption.物料编码.contains(query)) |
                (MaterialConsumption.物料名称.contains(query))
            )
        if 工单编号:
            query_obj = query_obj.filter(MaterialConsumption.工单编号.contains(工单编号))
        if 物料编码:
            query_obj = query_obj.filter(MaterialConsumption.物料编码.contains(物料编码))
        if 物料名称:
            query_obj = query_obj.filter(MaterialConsumption.物料名称.contains(物料名称))

        total = query_obj.count()
        items = query_obj.order_by(desc(MaterialConsumption.id)).offset((page - 1) * page_size).limit(page_size).all()

        return items, total

    def get_all_物料(self, db: Session) -> List[str]:
        results = db.query(MaterialConsumption.物料名称).filter(
            MaterialConsumption.物料名称.isnot(None)
        ).distinct().all()
        return [r[0] for r in results if r[0]]

    def create(self, db: Session, **kwargs) -> MaterialConsumption:
        material = MaterialConsumption(**kwargs)
        db.add(material)
        db.flush()
        db.refresh(material)
        return material

    def delete(self, db: Session, id: int) -> bool:
        material = self.get_by_id(db, id)
        if not material:
            return False
        db.delete(material)
        return True

    def to_dict(self, material: MaterialConsumption) -> dict:
        return {
            'id': material.id,
            '工单编号': material.工单编号,
            '物料编码': material.物料编码,
            '物料名称': material.物料名称,
            '规格型号': material.规格型号,
            '消耗数量': float(material.消耗数量) if material.消耗数量 else 0,
            '单位': material.单位,
            '领料人': material.领料人,
            '领料日期': material.领料日期.strftime('%Y-%m-%d %H:%M:%S') if material.领料日期 else None,
            '备注': material.备注,
            'create_at': material.create_at.strftime('%Y-%m-%d %H:%M:%S') if material.create_at else None,
        }


class ProductionReportRepository(BaseRepository):
    def __init__(self):
        super().__init__(ProductionReport)

    def get_by_id(self, db: Session, id: int) -> Optional[ProductionReport]:
        return db.query(ProductionReport).filter(ProductionReport.id == id).first()

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
        query_obj = db.query(ProductionReport)

        if query:
            query_obj = query_obj.filter(
                (ProductionReport.工单编号.contains(query)) |
                (ProductionReport.报工编号.contains(query))
            )
        if 工单编号:
            query_obj = query_obj.filter(ProductionReport.工单编号.contains(工单编号))
        if 报工编号:
            query_obj = query_obj.filter(ProductionReport.报工编号.contains(报工编号))
        if 报工人:
            query_obj = query_obj.filter(ProductionReport.报工人.contains(报工人))

        total = query_obj.count()
        items = query_obj.order_by(desc(ProductionReport.id)).offset((page - 1) * page_size).limit(page_size).all()

        return items, total

    def get_all_报工人(self, db: Session) -> List[str]:
        results = db.query(ProductionReport.报工人).filter(
            ProductionReport.报工人.isnot(None)
        ).distinct().all()
        return [r[0] for r in results if r[0]]

    def create(self, db: Session, **kwargs) -> ProductionReport:
        report = ProductionReport(**kwargs)
        db.add(report)
        db.flush()
        db.refresh(report)
        return report

    def delete(self, db: Session, id: int) -> bool:
        report = self.get_by_id(db, id)
        if not report:
            return False
        db.delete(report)
        return True

    def to_dict(self, report: ProductionReport) -> dict:
        return {
            'id': report.id,
            '工单编号': report.工单编号,
            '报工编号': report.报工编号,
            '报工日期': report.报工日期.strftime('%Y-%m-%d %H:%M:%S') if report.报工日期 else None,
            '报工数量': report.报工数量,
            '合格数量': report.合格数量,
            '不良数量': report.不良数量,
            '不良原因': report.不良原因,
            '工序': report.工序,
            '报工人': report.报工人,
            '检验员': report.检验员,
            '备注': report.备注,
            'create_at': report.create_at.strftime('%Y-%m-%d %H:%M:%S') if report.create_at else None,
        }


production_plan_repository = ProductionPlanRepository()
production_order_repository = ProductionOrderRepository()
quality_inspection_repository = QualityInspectionRepository()
product_inbound_repository = ProductInboundRepository()
material_consumption_repository = MaterialConsumptionRepository()
production_report_repository = ProductionReportRepository()
