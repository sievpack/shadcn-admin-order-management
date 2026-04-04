from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import order, ship, auth, customer, quote, report
from app.db.database import db_binds

app = FastAPI(
    title=settings.APP_NAME,
    description="JNS订单管理系统API",
    version="1.0.0",
    debug=settings.DEBUG
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(order.router, prefix="/api/order", tags=["订单管理"])
app.include_router(ship.router, prefix="/api/ship", tags=["发货管理"])
app.include_router(auth.router, prefix="/api/auth", tags=["认证管理"])
app.include_router(customer.router, prefix="/api/customer", tags=["客户管理"])
app.include_router(quote.router, prefix="/api/quote", tags=["报价单管理"])
app.include_router(report.router, prefix="/api/report", tags=["报表管理"])


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