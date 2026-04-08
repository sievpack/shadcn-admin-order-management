from fastapi import APIRouter
from .list import router as list_router
from .item import router as item_router
from .stats import router as stats_router
from .processing_print import router as processing_print_router

router = APIRouter()
router.include_router(list_router, prefix="/list", tags=["订单列表"])
router.include_router(item_router, prefix="/item", tags=["订单分项"])
router.include_router(stats_router, prefix="/stats", tags=["订单统计"])
router.include_router(processing_print_router, prefix="/processing", tags=["加工单打印"])
