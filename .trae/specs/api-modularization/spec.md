# 接口模块化重构 Spec

## Why
当前后端 `order.py` 文件过度集中（597行），包含订单列表、订单分项、统计等多种功能，导致代码维护困难、职责不清晰。需要按功能域进行模块化拆分，提高代码可维护性和可扩展性。

## What Changes
- 将 `order.py` 拆分为 `order/list.py`（订单列表）、`order/item.py`（订单分项）和 `order/stats.py`（统计）三个独立模块
- 更新前端 API 调用以适配新的接口路径
- 创建完整的 API 接口技术文档

## Impact
- Affected specs: 订单管理模块、API 调用层
- Affected code: 
  - `backend/app/api/order.py` → 拆分为 `backend/app/api/order/` 目录
  - `backend/app/main.py` → 路由注册更新
  - `frontend/src/lib/api.ts` → API 路径更新

---

## ADDED Requirements

### Requirement: 订单列表模块独立
系统 SHALL 提供独立的订单列表模块 `order/list.py`，包含订单主表的完整 CRUD 功能。

#### Scenario: 订单列表查询
- **WHEN** 前端调用 `GET /api/order-list/data` 接口
- **THEN** 返回分页的订单列表数据
- **AND** 响应格式为 `{ code: 0, msg: "success", total: number, data: [] }`

#### Scenario: 订单创建
- **WHEN** 前端调用 `POST /api/order-list/create` 接口
- **THEN** 创建新的订单主表记录
- **AND** 返回新创建的订单 ID

#### Scenario: 订单更新
- **WHEN** 前端调用 `PUT /api/order-list/update` 接口
- **THEN** 更新指定的订单记录

#### Scenario: 订单删除
- **WHEN** 前端调用 `DELETE /api/order-list/delete/{id}` 接口
- **THEN** 删除指定的订单记录及其关联的订单分项

---

### Requirement: 订单分项模块独立
系统 SHALL 提供独立的订单分项模块 `order/item.py`，包含订单分项的完整 CRUD 功能。

#### Scenario: 获取所有订单分项
- **WHEN** 前端调用 `GET /api/order-item/all` 接口
- **THEN** 返回所有订单分项数据（不分页）

#### Scenario: 获取指定订单的分项
- **WHEN** 前端调用 `GET /api/order-item/list/{order_id}` 接口
- **THEN** 返回指定订单的所有分项数据

#### Scenario: 订单分项创建
- **WHEN** 前端调用 `POST /api/order-item/create` 接口
- **THEN** 创建新的订单分项记录

#### Scenario: 订单分项更新
- **WHEN** 前端调用 `PUT /api/order-item/update` 接口
- **THEN** 更新指定的订单分项记录

#### Scenario: 订单分项删除
- **WHEN** 前端调用 `DELETE /api/order-item/delete/{id}` 接口
- **THEN** 删除指定的订单分项记录

---

### Requirement: 统计模块独立
系统 SHALL 提供独立的统计模块 `order/stats.py`，包含销售统计和趋势分析功能。

#### Scenario: 销售统计
- **WHEN** 前端调用 `GET /api/order-stats/stats` 接口
- **THEN** 返回今日/本月销售统计数据
- **AND** 数据包含订单数量、销售金额、客户数量等指标

#### Scenario: 销售趋势
- **WHEN** 前端调用 `GET /api/order-stats/trend?period=month` 接口
- **THEN** 返回指定周期的销售趋势数据
- **AND** 支持周期参数：week、month、year

---

### Requirement: 技术文档完整
系统 SHALL 提供完整的技术文档，包括：

1. **现有接口架构分析报告**
   - 接口分布统计
   - 调用频率分析
   - 耦合度评估

2. **模块拆分详细方案**
   - 每个模块的职责边界
   - 文件命名规范
   - 存放路径规范

3. **接口迁移实施步骤**
   - 前后端对接时间表
   - 接口变更清单
   - 兼容性处理方案

4. **代码规范与最佳实践**
   - 模块命名约定
   - 接口设计标准
   - 错误处理机制

5. **测试验证策略**
   - 单元测试策略
   - 集成测试策略
   - 验收标准

---

## MODIFIED Requirements

### Requirement: API 路由注册
`main.py` 中的路由注册 SHALL 更新为模块化结构：

```python
# 原结构
app.include_router(order.router, prefix="/api/order", tags=["订单"])

# 新结构
from app.api.order import router as order_router
app.include_router(order_router, prefix="/api/order", tags=["订单管理"])
```

### Requirement: 前端 API 调用
前端 `api.ts` SHALL 更新为模块化 API 结构：

```typescript
// 原结构
export const orderAPI = { ... } // 混合所有订单相关接口

// 新结构
export const orderListAPI = { ... }   // 订单列表接口
export const orderItemAPI = { ... }   // 订单分项接口
export const orderStatsAPI = { ... }  // 统计接口
```

---

## REMOVED Requirements

### Requirement: 原 order.py 单文件结构
**Reason**: 职责不单一，代码过于集中（597行），维护成本高
**Migration**: 按功能域拆分为独立模块，保持接口功能不变

---

## 接口路径映射表

| 原路径 | 新路径 | 模块 |
|--------|--------|------|
| `/api/order/data` | `/api/order/list/data` | list.py |
| `/api/order/all` | `/api/order/list/all` | list.py |
| `/api/order/create` | `/api/order/list/create` | list.py |
| `/api/order/update_order` | `/api/order/list/update` | list.py |
| `/api/order/delete/{id}` | `/api/order/list/delete/{id}` | list.py |
| `/api/order/generate_order_id` | `/api/order/list/generate-id` | list.py |
| `/api/order/all-items` | `/api/order/item/all` | item.py |
| `/api/order/items/{id}` | `/api/order/item/list/{id}` | item.py |
| `/api/order/create_item` | `/api/order/item/create` | item.py |
| `/api/order/update` | `/api/order/item/update` | item.py |
| `/api/order/remove/{id}` | `/api/order/item/delete/{id}` | item.py |
| `/api/order/stats` | `/api/order/stats/stats` | stats.py |
| `/api/order/sales-trend` | `/api/order/stats/trend` | stats.py |

---

## 文件结构变更

### 变更前
```
backend/app/api/
├── order.py          # 597行，15个接口
├── ship.py
├── auth.py
├── customer.py
├── quote.py
└── report.py
```

### 变更后
```
backend/app/api/
├── order/
│   ├── __init__.py   # 路由聚合
│   ├── list.py       # 订单列表模块 (~150行)
│   ├── item.py       # 订单分项模块 (~200行)
│   └── stats.py      # 统计模块 (~150行)
├── ship.py
├── auth.py
├── customer.py
├── quote.py
└── report.py
```

---

## 验收标准

### 功能验收
- [ ] 所有原有功能正常工作
- [ ] 接口响应数据格式不变
- [ ] 前端页面显示正常
- [ ] 无新增 Bug

### 性能验收
- [ ] 接口响应时间 ≤ 原响应时间
- [ ] 并发处理能力 ≥ 原能力
- [ ] 内存占用无明显增加

### 代码质量验收
- [ ] 单文件代码行数 < 250 行
- [ ] 单模块接口数量 5-6 个
- [ ] 代码测试覆盖率 ≥ 80%
- [ ] 无 Lint 错误和警告
