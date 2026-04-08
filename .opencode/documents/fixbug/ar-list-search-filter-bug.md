# Bug修复记录：应收账款页面搜索和筛选功能失效

## 问题描述
- **模块**：应收账款页面 (AccountsReceivable)
- **症状**：
  1. 输入搜索内容后，表格无反应，返回全部数据
  2. 选择筛选器（收款状态）后，表格无反应，返回全部数据
- **影响**：用户无法通过搜索和筛选功能过滤数据

## 根因分析

### 问题1：搜索功能失效
**原因**：`finance_repository.py` 中 `query` 参数的过滤逻辑错误，使用了 `exists()` 子查询导致过滤失效。

```python
# 错误写法
if query:
    query_obj = query_obj.filter(
        db.query(AccountsReceivable).filter(
            AccountsReceivable.应收单号.contains(query) |
            AccountsReceivable.客户名称.contains(query)
        ).exists()
    )

# 正确写法
if query:
    query_obj = query_obj.filter(
        AccountsReceivable.应收单号.contains(query) |
        AccountsReceivable.客户名称.contains(query)
    )
```

### 问题2：筛选功能失效
**原因**：API 参数名不匹配。前端 URL 传的是 `status`，但后端 API 定义的参数名是 `收款状态`。

| 层级 | 文件 | 问题 |
|------|------|------|
| API | `finance/__init__.py` | 参数名定义为 `收款状态`，但 URL 传 `status` |
| 前端 | `ar-table.tsx` | URL 参数 key 为 `status` |

**修复**：将 API 参数名改为 `status`，内部映射到 `收款状态`：

```python
@router.get("/ar/list")
async def get_ar_list(
    query: Optional[str] = None,
    应收单号: Optional[str] = None,
    客户名称: Optional[str] = None,
    status: Optional[str] = Query(None, description='收款状态'),  # 改为 status
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    ...
):
    items, total = accounts_receivable_service.search(
        db, query=query, 应收单号=应收单号, 客户名称=客户名称, 收款状态=status,  # 内部映射
        page=page, page_size=limit
    )
```

## 修改文件

1. **backend/app/repositories/finance_repository.py**
   - 修复 `search` 方法中 `query` 参数的过滤逻辑

2. **backend/app/api/finance/__init__.py**
   - 将 `收款状态` 参数改为 `status`

## 验证结果
- [x] 搜索功能：输入关键词后返回匹配数据
- [x] 筛选功能：选择收款状态后返回对应状态的数据
- [x] API 参数名称与前端一致

## 修复日期
2026-04-08

## 相关组件
- `ar-table.tsx` - 表格组件（参照 customer-table.tsx 重写）
- `finance_repository.py` - 应收账款 Repository
- `finance/__init__.py` - 应收账款 API

## 经验总结

1. **参数名称一致性**：前后端参数名称必须保持一致，前端用 `status`，后端也应为 `status`
2. **SQLAlchemy 过滤**：使用 `exists()` 子查询时注意正确写法，直接 `OR` 过滤更简单
3. **参照实现**：遇到类似问题时，参照已正常工作的 customer-table.tsx 快速定位差异
