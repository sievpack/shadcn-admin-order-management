# 项目技术栈

- React 19 + Vite 8
- TanStack Router (路由) + TanStack Query (数据请求)
- Tailwind CSS 4 + shadcn/ui (基于 Radix UI)
- Zustand (状态管理)
- Zod (表单验证)

---

# 通用礼节 (General Etiquette)

所有修改必须先读文件内容才能编辑。

优先保证代码简洁易懂。别搞过度设计，简单实用就好。

写代码时，要注意圈复杂度，函数尽量小，尽量可以复用，尽量不写重复代码。写代码时，注意模块设计，尽量使用设计模式。

前端页面遵循尽量组件化，组件要求放在同文件夹下的components文件夹内，前端页面的通知必须使用Sonner，所有删除必须有确认框，批量删除操作有安全确认框（必须输入DELETE），才能点击确认。

给我解释代码的时候，说人话，别拽专业术语。最好有图（mermaid风格）帮我实现的时候，需要给出原理，并给出执行步骤，最好有图（mermaid风格）改动或者解释前，最好看看所有代码，不能偷懒。

改动前，要做最小化修改，尽量不修改到其他模块的代码改动后，假定10条case输入，并给出预期结果

给出的mermaid图，必须自检语法，可以被渲染，在暗黑主题上清晰可见给出的mermaid图，必须要可以被暗黑主题渲染清晰

确保代码通过测试、规范，并根据情况调整顺序

Plan模式下的开发方案以md格式保存至项目文件夹的\.opencode\documents内

---

# 文档查询与 Bug 修复规则

## Context7 官方文档查询

**必须使用 Context7 查询官方文档的场景：**

1. **文档查询**：当用户询问某个库/框架的 API 用法、配置选项、最佳实践时
2. **Bug 修复**：当遇到 Bug 需要查找解决方案时，先用 Context7 查询官方文档确认正确用法
3. **技术验证**：当不确定某个 API 是否存在或它的确切签名时

**查询优先级：**
1. 首先使用 `context7_resolve-library-id` 确定正确的库 ID
2. 然后使用 `context7_query-docs` 查询具体内容
3. 项目相关库优先使用 `/websites/react_dev` (React)、`/facebook/react` (React)、`/tanstack/table` (TanStack Table) 等

**禁止：** 在有官方文档的情况下，仅凭记忆或猜测给出答案。

---

# TanStack Table 服务器端筛选重要规则

## 服务器端筛选模式配置

使用 `serverPaginationMode={true}` 时，**必须**禁用 `getFilteredRowModel`：

```tsx
// customer-table.tsx
const table = useReactTable({
  // ...
  getFilteredRowModel: undefined, // 服务器端筛选时不使用，否则本地数据会被二次筛选
})
```

## DataTableToolbar 与 useTableUrlState 接口不匹配

| 组件 | 方法 | 期望 |
|------|------|------|
| `DataTableToolbar` | `onFilterChange(columnId, value)` | 传递**单个**筛选器变化 |
| `useTableUrlState` | `onColumnFiltersChange(filters[])` | 接收**所有**活动筛选器数组 |

**修复方案**：在接收 `onFilterChange` 回调的组件中（如 customer-table.tsx），需要合并所有筛选器：

```tsx
onFilterChange={(columnId, value) => {
  const currentFilters = columnFilters || []
  const otherFilters = currentFilters.filter((f) => f.id !== columnId)
  const newFilters = value
    ? [...otherFilters, { id: columnId, value: value.split(',') }]
    : otherFilters
  onColumnFiltersChange?.(newFilters)
}}
```

**toolbar.tsx 的 handleFilterChange** 也需要遍历所有筛选器传递完整状态，不能只传单个变化的筛选器。

---

# 前端页面模板规则

- 所有页面的Loading过程，必须 使用 Loader2 图标 + animate-spin 类。
- 组件放在同文件夹的 `components` 子目录下
- 组件命名以 `各自的功能模块` 开头（如 `功能模块英文名称-columns.tsx`、`功能模块英文名称-dialogs.tsx` 等）
- 导入路径使用相对路径 `./components/xxx`

除非提前声明不以此模板开发，否则所有新增或修改的前端页面都必须遵循此规范。

# 后台统一事务管理 

- Service 层调用 db.commit()
- API 层不再调用 db.commit()务管理 

# Follow these steps for each interaction:

1. User Identification:
   - You should assume that you are interacting with default_user
   - If you have not identified default_user, proactively try to do so.

2. Memory Retrieval:
   - Always begin your chat by saying only "Remembering..." and retrieve all relevant information from your knowledge graph
   - Always refer to your knowledge graph as your "memory"

3. Memory
   - While conversing with the user, be attentive to any new information that falls into these categories:
     a) Basic Identity (age, gender, location, job title, education level, etc.)
     b) Behaviors (interests, habits, etc.)
     c) Preferences (communication style, preferred language, etc.)
     d) Goals (goals, targets, aspirations, etc.)
     e) Relationships (personal and professional relationships up to 3 degrees of separation)

4. Memory Update:
   - If any new information was gathered during the interaction, update your memory as follows:
     a) Create entities for recurring organizations, people, and significant events
     b) Connect them to the current entities using relations
     c) Store facts about them as observations

---

# TanStack Query + 组件化开发规范

## 必须遵循的架构模式

### 1. 数据层分离

```
页面组件 (Page.tsx)
├── TanStack Query Hooks (queries/)     ← 服务端数据
└── 本地 UI 状态                       ← 客户端交互状态
```

**关键原则**：
- TanStack Query 管理服务端数据获取、缓存、重试
- 本地状态管理 UI 交互（展开行、选中项、Dialog 开关等）

### 2. Query Hooks 必须返回响应数据

```tsx
// ✅ 正确：mutationFn 必须返回 response.data
mutationFn: async (data) => {
  const response = await api.createOrder(data)
  return response.data  // 返回 { id: xxx, ... }
}

// ❌ 错误：返回 undefined，导致后续代码无法使用响应数据
mutationFn: (data) => api.createOrder(data)
```

### 3. 父子组件数据同步机制

当子组件（如 Dialog）修改数据后，父组件需要刷新展示：

**使用 `refreshKey` 机制**：
```tsx
// 父组件
const [refreshKey, setRefreshKey] = useState(0)

const handleSave = async (data) => {
  await createMutation.mutateAsync(data)
  setRefreshKey(k => k + 1)  // 触发刷新
}

return <TableComponent refreshKey={refreshKey} onRefresh={handleRefresh} />
```

**子组件接收并响应 refreshKey**：
```tsx
useEffect(() => {
  if (refreshKey > 0) {
    // 清除本地缓存
    setChildData({})
    // 重新获取已展开行的数据
    for (const id of expandedRows) {
      fetchChildData(id)
    }
  }
}, [refreshKey, expandedRows])
```

### 4. 组件拆分规范

| 组件类型 | 存放位置 | 说明 |
|---------|---------|------|
| 页面容器 | `features/模块名/` | 状态管理、Dialg 组合 |
| 表格组件 | `features/模块名/components/` | 渲染逻辑 |
| 可复用行组件 | `features/模块名/components/` | 如 `expanded-xxx.tsx` |
| 表格列定义 | `features/模块名/components/` | 如 `xxx-columns.tsx` |
| Dialog 组件 | `features/模块名/components/` | 如 `xxx-dialogs.tsx` |
| Query Hooks | `features/模块名/hooks/` 或 `queries/模块名/` | 数据获取 |
| Dialog 状态 Hook | `features/模块名/hooks/` | UI 状态管理 |

### 5. 禁止的模式

```tsx
// ❌ 禁止：在组件内部用 useEffect + fetchData 获取数据
useEffect(() => {
  setLoading(true)
  api.getData().then(res => {
    setData(res.data)
    setLoading(false)
  })
}, [])

// ✅ 必须：使用 TanStack Query
const { data, isLoading } = useQuery({
  queryKey: ['data'],
  queryFn: () => api.getData()
})
```

### 6. 展开行数据获取

对于可展开的表格行（如订单分项），子数据获取应该：

1. 在 Table 组件内部管理 `childData` state
2. 展开时调用 API 获取数据
3. mutation 成功后通过 `refreshKey` 触发刷新

---

## 重构经验总结

### 经验 1：mutationFn 必须返回数据

TanStack Query 的 `useMutation` 默认不返回响应数据。如果业务逻辑需要响应中的 ID 等字段，必须显式返回：

```tsx
// 创建订单后需要订单 ID 来保存订单分项
mutationFn: async (data) => {
  const response = await orderListAPI.createOrder(data)
  return response.data  // 必须返回
}
```

### 经验 2：TanStack Query 缓存 ≠ 本地状态

TanStack Query 缓存是全局的，而展开行的子数据存在组件本地。当 mutation 使 Query 缓存失效后，本地的 `childData` 不会自动清除，需要 `refreshKey` 机制来同步。

### 经验 3：组件拆分降低复杂度

| 文件 | 重构前 | 重构后 |
|------|--------|--------|
| `orderlist-table.tsx` | 490 行 | ~380 行 |
| 数据获取 | `useEffect + fetchData` | TanStack Query `useOrders` |
| 展开行 | 内联 ~100 行 | `<ExpandedOrderItems />` 组件 |
| 状态管理 | 散落各处 | Query hooks + 本地 state |

---

# 实验性规则 (Experimental Rule)

当你被要求修复一个 Bug 时，请遵循以下步骤：

1. **理解问题 (Understand):** 仔细阅读 Bug 描述和相关代码，复述你对问题的理解。
2. **分析原因 (Analyze):** 每次都先到D:\shadcn-admin\.opencode\documents\fixbug搜索md文档，是否有与本次修复有关的文档，如果没有提出至少两种可能的根本原因。
3. **制定计划 (Plan):** 描述你打算如何验证这些原因，并给出修复方案。
4. **请求确认 (Confirm):** 在动手修改前，向我确认你的计划。
5. **执行修复 (Execute):** 实施修复。
6. **审查 (Review):** 查看自己的修改有没有问题。
7. **解释说明 (Explain):** 解释你做了哪些修改以及为什么。
8. **存储记忆 (Memory):** 每次修改询问我是否成功，如果回复成功，调用memory记忆本次Bug修复，并写一个详细的文档存放到本项目文件夹的.opencode/documents/fixbug文件夹下面。

---

# MCP Interactive Feedback 规则

1. 在任何流程、任务、对话进行时，无论是询问、回复、或完成阶段性任务，皆必须调用 MCP mcp-feedback-enhanced。
2. 每当收到用户反馈，若反馈内容非空，必须再次调用 question，并根据反馈内容调整行为。
3. 仅当用户明确表示「结束」或「不再需要交互」时，才可停止调用 question，流程才算结束。
4. 除非收到结束指令，否则所有步骤都必须重复调用 question。
5. 完成任务前，必须使用 question 工具向用户询问反馈。

---

### 日期选择必须使用 DatePicker 组件

所有日期输入必须使用 `DatePicker` 组件，禁止使用原生 `<input type="date">`：

**Correct:**

```tsx
import { DatePicker } from '@/components/date-picker'

<DatePicker
  value={formData.date}
  onChange={(date) => setFormData({ ...formData, date })}
  placeholder="选择日期"
/>
```

**Incorrect:**

```tsx
<Input type="date" value={formData.date} onChange={(e) => ...} />
```

---

# 后台接口代码规范

## 架构分层

```
API 层 (app/api/) → Service 层 (app/services/) → Repository 层 (app/repositories/) → Model 层 (app/models/)
```

## 必须遵循的规则

### 1. 三层架构

| 层 | 职责 | 目录 |
|---|------|------|
| API | 路由处理、参数校验、认证 | `app/api/` |
| Service | 业务逻辑、事务控制 | `app/services/` |
| Repository | 数据访问、CRUD | `app/repositories/` |

### 2. API 层规范

```python
# ✅ 正确：使用 Service 层 + JWT 认证
@router.get("/list")
async def get_list(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    items, total = my_service.search(db, page=page, page_size=limit)
    return {"code": 0, "msg": "success", "count": total, "data": items}

# ❌ 错误：直接操作数据库、无认证
@router.get("/list")
async def get_list(db: Session = Depends(get_db_jns)):
    ...
```

### 3. 统一响应格式

```python
# 列表响应
{"code": 0, "msg": "success", "count": total, "data": [...]}

# 详情响应
{"code": 0, "msg": "success", "count": 1, "data": {...}}

# 操作响应
{"code": 0, "msg": "操作成功", "data": {"id": 1}}

# 错误响应
{"code": 1, "msg": "错误原因", "data": {}}
```

### 4. Service 层规范

```python
class MyService:
    def __init__(self):
        self.repo = my_repository

    def search(self, db: Session, **kwargs) -> Tuple[List, int]:
        return self.repo.search(db, **kwargs)

    def search_dict(self, db: Session, **kwargs) -> Tuple[List[Dict], int]:
        items, total = self.search(db, **kwargs)
        return [self.to_dict(item) for item in items], total

    def create(self, db: Session, **kwargs) -> Tuple[Optional[Model], Optional[str]]:
        try:
            obj = self.repo.create(db, **kwargs)
            return obj, None
        except Exception as e:
            return None, str(e)

    def to_dict(self, obj: Model) -> Dict:
        return self.repo.to_dict(obj)
```

### 5. Repository 层规范

```python
class MyRepository(BaseRepository):
    def __init__(self):
        super().__init__(MyModel)

    def search(self, db: Session, name: str = None, page: int = 1, page_size: int = 20) -> Tuple[List, int]:
        query = db.query(MyModel)
        if name:
            query = query.filter(MyModel.name.contains(name))
        total = query.count()
        items = query.order_by(desc(MyModel.id)).offset((page-1)*page_size).limit(page_size).all()
        return items, total

    def to_dict(self, obj: MyModel) -> dict:
        return {
            'id': obj.id,
            'name': obj.name,
            'create_at': obj.create_at.strftime('%Y-%m-%d %H:%M:%S') if obj.create_at else None,
        }
```

### 6. JWT 认证

所有 API 必须添加 `current_user: User = Depends(get_current_active_user)` 认证依赖。

### 7. 导出声明

新增 Service/Repository 后，必须更新 `__init__.py`：

```python
# app/repositories/__init__.py
from app.repositories.my_repository import MyRepository, my_repository
__all__ = [..., "MyRepository", "my_repository"]

# app/services/__init__.py
from app.services.my_service import MyService, my_service
__all__ = [..., "MyService", "my_service"]
```

---

## 测试要求

### API 导入测试

```bash
cd backend && python -c "from app.api.{module} import router; print('OK')"
```

### Service 导入测试

```bash
cd backend && python -c "from app.services.my_service import my_service; print('OK')"
```

### 手动测试

1. 启动后端：`python -m uvicorn app.main:app --reload`
2. 启动前端：`npm run dev`
3. 浏览器测试 CRUD 功能
4. 验证 JWT：退出登录后直接访问页面，应重定向到登录页

### 提交前检查清单

- [ ] Service 层已实现业务逻辑
- [ ] API 层使用 `get_current_active_user` 认证
- [ ] 响应格式符合统一标准
- [ ] `__init__.py` 已更新导出
- [ ] 导入测试通过
- [ ] 手动测试通过

---

# 新增功能模块规范

## 项目结构模板

### 后端目录结构

```
backend/app/
├── api/                          # API 层
│   ├── auth.py                   # 认证（固定）
│   ├── user.py                   # 用户（固定）
│   ├── customer.py                # 客户
│   ├── order/                    # 订单（子模块）
│   │   ├── list.py              # 列表相关
│   │   ├── item.py              # 订单分项
│   │   └── stats.py             # 统计
│   ├── production/               # 生产模块（子模块）
│   │   ├── plan.py              # 生产计划
│   │   ├── order.py             # 生产工单
│   │   ├── qc.py                # 质检记录
│   │   ├── inbound.py           # 成品入库
│   │   ├── material.py          # 物料消耗
│   │   ├── report.py            # 报工记录
│   │   └── stats.py             # 生产统计
│   └── report.py                 # 报表
├── repositories/                  # Repository 层
│   ├── base_repository.py        # 基类（固定）
│   ├── user_repository.py        # 用户
│   ├── customer_repository.py    # 客户
│   ├── order_repository.py       # 订单
│   ├── production_repository.py  # 生产（多表合一个文件）
│   └── ...
├── services/                     # Service 层
│   ├── base_service.py           # 基类（固定）
│   ├── user_service.py          # 用户
│   ├── customer_service.py      # 客户
│   ├── order_service.py         # 订单
│   ├── production_service.py    # 生产（多表合一个文件）
│   └── ...
└── models/                       # Model 层
    ├── user.py                  # 用户模型
    ├── customer.py              # 客户模型
    ├── order.py                 # 订单模型
    └── production.py             # 生产模型（多表合一个文件）
```

### 前端目录结构

```
src/features/
├── users/                       # 用户模块
│   ├── index.tsx               # 页面入口
│   └── components/
│       ├── users-columns.tsx    # 列定义
│       ├── users-table.tsx      # 表格组件
│       ├── users-dialogs.tsx    # 对话框集合
│       ├── users-action-dialogs.tsx  # 操作对话框
│       ├── users-primary-buttons.tsx  # 主按钮
│       ├── users-delete-dialog.tsx    # 删除确认
│       ├── users-invite-dialog.tsx    # 邀请对话框
│       ├── users-multi-delete-dialog.tsx  # 批量删除
│       ├── users-provider.tsx   # 状态提供
│       └── data-table-row-actions.tsx   # 行操作
├── orders/                       # 订单模块
│   ├── OrderList.tsx           # 页面入口
│   └── components/
│       ├── orderlist-columns.tsx
│       ├── orderlist-table.tsx
│       ├── orderitem-view-dialog.tsx
│       ├── orderitem-edit-dialog.tsx
│       └── orderitem-multi-delete-dialog.tsx
├── production/                   # 生产模块
│   ├── ProductionPlan.tsx      # 生产计划
│   ├── ProductionOrder.tsx     # 生产工单
│   ├── QualityInspection.tsx     # 质检记录
│   ├── ProductInbound.tsx       # 成品入库
│   ├── MaterialConsumption.tsx  # 物料消耗
│   ├── ProductionReport.tsx     # 报工记录
│   ├── ProductionStats.tsx      # 生产统计
│   └── components/
│       ├── production-plan-columns.tsx
│       ├── production-plan-table.tsx
│       ├── production-plan-dialogs.tsx
│       ├── production-plan-row-actions.tsx
│       ├── production-order-columns.tsx
│       └── ...
└── reports/                     # 报表模块
    ├── MonthlyReport.tsx
    ├── IndustryReport.tsx
    ├── CustomerYearlyReport.tsx
    └── ProductReport.tsx
```

---

## 命名习惯规范

### 后端命名

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| Model 类 | 中文表名 | `QualityInspection`、`ProductInbound` |
| 表名 | 中文 | `'质检记录表'`、`'成品入库表'` |
| Repository 类 | `模块名Repository` | `QualityInspectionRepository` |
| Service 类 | `模块名Service` | `QualityInspectionService` |
| API 文件 | 模块名拼音 | `qc.py`、`inbound.py` |
| API 路由前缀 | `/模块名` | `/production/qc` |
| 字段 | 中文 | `质检单号`、`入库数量` |

### 前端命名

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| 页面组件 | `模块名.tsx` | `QualityInspection.tsx` |
| 表格列 | `模块名-columns.tsx` | `quality-inspection-columns.tsx` |
| 表格组件 | `模块名-table.tsx` | `quality-inspection-table.tsx` |
| 对话框 | `模块名-dialogs.tsx` | `quality-inspection-dialogs.tsx` |
| 行操作 | `模块名-row-actions.tsx` | `quality-inspection-row-actions.tsx` |
| API 文件 | `xxx-api.ts` | `production-api.ts` |

---

## 文件分层规范

### 后端必须三层架构

```
API 层 → Service 层 → Repository 层 → Model 层
```

**禁止**：
- API 层直接操作数据库
- API 层直接 return db.query()

**必须**：
- 所有数据操作通过 Repository
- 业务逻辑在 Service 层
- API 层只做参数校验和响应组装

### 前端组件分层

```
页面入口 (Page.tsx)
├── TanStack Query Hooks (queries/)
├── 表格组件 (xxx-table.tsx)
├── 列定义 (xxx-columns.tsx)
├── 对话框 (xxx-dialogs.tsx)
└── 行操作 (xxx-row-actions.tsx)
```

---

Always respond in 中文
