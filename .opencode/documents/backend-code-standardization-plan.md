# 后台代码完全规范化整改计划

## 整改目标

1. **统一响应格式**：`{code, msg, count, data}`
2. **日志规范化**：全部替换 `print` → `logger`
3. **事务管理**：API 层 `db.commit()` 移至 Service 层

## 问题统计

| 问题类型 | 数量 | 优先级 |
|---------|------|--------|
| API 层 db.commit() | 33处 | P1 |
| print 语句 | 100+处 | P2 |
| 响应格式不统一 | 多个文件 | P2 |

## 整改步骤

### Step 1: 统一响应格式

建立统一的响应辅助函数，确保所有 API 返回格式一致：

```python
# app/core/response.py
def success_response(data=None, msg="success", count=None):
    return {"code": 0, "msg": msg, "count": count, "data": data}

def error_response(msg, data=None):
    return {"code": 1, "msg": msg, "data": data or {}}
```

### Step 2: 日志规范化

替换规则：
- `print(...)` → `logger.info(...)` 或 `logger.error(...)`
- 确保所有 API/Service 文件顶部有 `logger = logging.getLogger(__name__)`

### Step 3: 事务管理重构

将 API 层的 `db.commit()` 移至 Service 层：

**Before (API 层)**:
```python
@router.post("/")
async def create_item(...):
    item = service.create(db, **data)
    db.commit()  # 违规
    return {"code": 0, "data": item}
```

**After (Service 层)**:
```python
class OrderService:
    def create(self, db, **kwargs):
        obj = self.repo.create(db, **kwargs)
        db.commit()  # Service 层处理
        return obj
```

## 整改文件清单

### API 层文件（需要修复 db.commit 和 print）

1. `api/order/item.py` - db.commit: 168,208,262 / print: 9处
2. `api/order/list.py` - db.commit: 139,159,183,217 / print: 2处
3. `api/user.py` - db.commit: 108,146,175,192,212 / print: 0处
4. `api/ship_temp.py` - db.commit: 222,268,647,693 / print: 10处
5. `api/quote.py` - db.commit: 89,131,167 / print: 0处
6. `api/ship.py` - db.commit: 25,45,135,167,193,225 / print: 0处
7. `api/customer.py` - db.commit: 107,131,170 / print: 0处
8. `api/finance/__init__.py` - db.commit: 436,487,541,561,691 / print: 0处

### Service 层文件（需要添加 logger 和 db.commit）

1. `order_service.py`
2. `customer_service.py`
3. `ship_service.py`
4. `quote_service.py`
5. `finance_service.py`

## 执行顺序

1. 创建统一的响应辅助函数
2. 修改 Service 层 - 添加 logger 和 db.commit()
3. 修改 API 层 - 移除 db.commit()，替换 print
4. 验证所有导入测试

## 验收标准

- [ ] 所有 API 层无 db.commit()
- [ ] 所有 print 替换为 logger
- [ ] 响应格式统一为 {code, msg, count, data}
- [ ] 所有 API 导入测试通过
