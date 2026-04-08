from fastapi import FastAPI

app = FastAPI(
    title="Simple Server",
    description="A simple server for testing",
    version="1.0.0"
)

@app.get("/recent-orders")
async def get_recent_orders():
    return {
        "code": 0,
        "msg": "success",
        "data": [
            {
                "客户名称": "长安东南",
                "合同编号": "CGDD001",
                "订单金额": 12500.00
            },
            {
                "客户名称": "上海大众",
                "合同编号": "CGDD002",
                "订单金额": 8900.50
            },
            {
                "客户名称": "北京现代",
                "合同编号": "CGDD003",
                "订单金额": 15600.75
            },
            {
                "客户名称": "广州本田",
                "合同编号": "CGDD004",
                "订单金额": 9850.25
            },
            {
                "客户名称": "深圳比亚迪",
                "合同编号": "CGDD005",
                "订单金额": 13200.00
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "simple_server:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )
