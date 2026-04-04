import requests
import json

# 测试数据库连接API
url = "http://localhost:8000/api/order/test_db"
headers = {"Content-Type": "application/json"}

print("发送请求到:", url)

response = requests.post(url, headers=headers)

print("\n响应状态码:", response.status_code)
print("响应内容:", json.dumps(response.json(), ensure_ascii=False, indent=2))
