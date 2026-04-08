from fastapi import APIRouter
from .plan import router as plan_router
from .order import router as order_router
from .report import router as report_router
from .qc import router as qc_router
from .inbound import router as inbound_router
from .material import router as material_router
from .stats import router as stats_router

router = APIRouter()

router.include_router(plan_router, prefix="/plan", tags=["生产计划"])
router.include_router(order_router, prefix="/order", tags=["生产工单"])
router.include_router(report_router, prefix="/report", tags=["报工记录"])
router.include_router(qc_router, prefix="/qc", tags=["质检记录"])
router.include_router(inbound_router, prefix="/inbound", tags=["成品入库"])
router.include_router(material_router, prefix="/material", tags=["物料消耗"])
router.include_router(stats_router, prefix="/stats", tags=["生产统计"])
