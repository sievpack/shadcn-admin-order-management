import requests
import json

# 测试订单子项目创建API
url = "http://localhost:8001/api/order/create_item"
headers = {"Content-Type": "application/json"}
data = {
    "oid": 110243,
    "订单编号": "DH-20260403-027",
    "合同编号": "TEST1",
    "订单日期": "2026-04-03",
    "交货日期": "2026-04-03",
    "规格": "TEST1",
    "产品类型": "TEST1",
    "型号": "TEST1",
    "数量": 1,
    "单位": "米",
    "销售单价": 2,
    "备注": "TEST1",
    "结算方式": "",
    "发货单号": "",
    "快递单号": "",
    "客户物料编号": "TEST1",
    "客户名称": "东莞曹燕平",
    "外购": 0
}

print("发送请求到:", url)
print("请求数据:", json.dumps(data, ensure_ascii=False, indent=2))

response = requests.post(url, headers=headers, json=data)

print("\n响应状态码:", response.status_code)
print("响应内容:", json.dumps(response.json(), ensure_ascii=False, indent=2))
