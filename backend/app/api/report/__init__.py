from fastapi import APIRouter
from .monthly import router as monthly_router
from .customer_yearly import router as customer_yearly_router
from .industry import router as industry_router
from .product import router as product_router

router = APIRouter()

router.include_router(monthly_router, tags=["月度统计"])
router.include_router(customer_yearly_router, tags=["客户年度统计"])
router.include_router(industry_router, tags=["行业统计"])
router.include_router(product_router, tags=["产品统计"])
