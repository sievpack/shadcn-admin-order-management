from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import ship, auth, customer, quote, report, code, print_service, dict as dict_api, ws
from app.api.order import router as order_router
from app.api.customer_sample import router as customer_sample_router
from app.api.production import router as production_router
from app.api.finance import router as finance_router
from app.api.notification import router as notification_router
from app.api import user
from app.db.database import db_binds


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时导入并启动轮询服务
    from app.services.shipment_poller import start_pollers
    from app.services import order_poller  # noqa: 导入注册订单轮询
    await start_pollers()
    yield
    # 关闭时停止轮询服务
    from app.services.shipment_poller import stop_pollers
    await stop_pollers()

app = FastAPI(
    title=settings.APP_NAME,
    description="JNS订单管理系统API",
    version="1.0.0",
    debug=settings.DEBUG,
    lifespan=lifespan
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(order_router, prefix="/api/order", tags=["订单管理"])
app.include_router(ship.router, prefix="/api/ship", tags=["发货管理"])
app.include_router(auth.router, prefix="/api/auth", tags=["认证管理"])
app.include_router(customer.router, prefix="/api/customer", tags=["客户管理"])
app.include_router(quote.router, prefix="/api/quote", tags=["报价单管理"])
app.include_router(report.router, prefix="/api/report", tags=["报表管理"])
app.include_router(production_router, prefix="/api/production", tags=["生产管理"])
app.include_router(finance_router, prefix="/api/finance", tags=["财务管理"])
app.include_router(user.router, prefix="/api/user", tags=["用户管理"])
app.include_router(code.router, prefix="/api/code", tags=["编号生成"])
app.include_router(print_service.router, prefix="/api/print", tags=["打印管理"])
app.include_router(dict_api.router, prefix="/api/dict", tags=["字典管理"])
app.include_router(customer_sample_router, prefix="/api/customer-sample", tags=["客户样品"])
app.include_router(notification_router, prefix="/api/notifications", tags=["通知管理"])
app.include_router(ws.router, prefix="/ws", tags=["WebSocket"])


@app.get("/")
async def root():
    return {
        "message": "JNS订单管理系统API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )