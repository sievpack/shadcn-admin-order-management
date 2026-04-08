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

Plan模式下的开发方案以md格式保存至项目文件夹的\.opencode\documents内

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
2. **分析原因 (Analyze):** 提出至少两种可能的根本原因。
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

# shadcn/ui 规则

## Base vs Radix API 差异

### Composition: asChild (radix) vs render (base)

Radix 使用 `asChild` 替换默认元素。Base 使用 `render`。不要给 trigger 添加额外包装元素。

**Incorrect:**

```tsx
<DialogTrigger>
  <div>
    <Button>Open</Button>
  </div>
</DialogTrigger>
```

**Correct (radix):**

```tsx
<DialogTrigger asChild>
  <Button>Open</Button>
</DialogTrigger>
```

**Correct (base):**

```tsx
<DialogTrigger render={<Button />}>Open</DialogTrigger>
```

### Button / trigger as non-button element (base only)

当 `render` 将元素改为非按钮（`<a>`, `<span>`）时，添加 `nativeButton={false}`。

**Correct (base):**

```tsx
<Button render={<a href="/docs" />} nativeButton={false}>
  Read the docs
</Button>
```

### Select

- **items prop (base only)**: Base 需要在根上使用 `items` prop
- **Placeholder**: Base 使用 `{ value: null }` 项，Radix 使用 `<SelectValue placeholder="...">`
- **Content positioning**: Base 使用 `alignItemWithTrigger`，Radix 使用 `position`

### ToggleGroup

- **base**: 使用 `multiple` 布尔 prop，`defaultValue` 始终是数组
- **radix**: 使用 `type="single"` 或 `type="multiple"`，`defaultValue` 是字符串

### Slider

- **base**: 单滑块接受数字 `defaultValue={50}`
- **radix**: 始终需要数组 `defaultValue={[50]}`

### Accordion

- **base**: 使用 `multiple` 布尔 prop，`defaultValue` 是数组
- **radix**: 使用 `type="single"` 或 `type="multiple"`，`defaultValue` 是字符串

---

## Component Composition 组件组合

### Items always inside their Group component

永远不要直接在 content 容器中渲染 items。

**Correct:**

```tsx
<SelectContent>
  <SelectGroup>
    <SelectItem value="apple">Apple</SelectItem>
  </SelectGroup>
</SelectContent>
```

### Callouts use Alert

```tsx
<Alert>
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>Something needs attention.</AlertDescription>
</Alert>
```

### Empty states use Empty component

```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon"><FolderIcon /></EmptyMedia>
    <EmptyTitle>No projects yet</EmptyTitle>
    <EmptyDescription>Get started by creating a new project.</EmptyDescription>
  </EmptyHeader>
</Empty>
```

### Toast notifications use sonner

```tsx
import { toast } from "sonner"

toast.success("Changes saved.")
toast.error("Something went wrong.")
```

### Choosing between overlay components

| Use case | Component |
|----------|-----------|
| Focused task that requires input | `Dialog` |
| Destructive action confirmation | `AlertDialog` |
| Side panel with details or filters | `Sheet` |
| Mobile-first bottom panel | `Drawer` |
| Quick info on hover | `HoverCard` |
| Small contextual content on click | `Popover` |

### Dialog, Sheet, and Drawer always need a Title

`DialogTitle`, `SheetTitle`, `DrawerTitle` 对 accessibility 是必需的。

```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>Edit Profile</DialogTitle>
    <DialogDescription>Update your profile.</DialogDescription>
  </DialogHeader>
  ...
</DialogContent>
```

### Card structure

使用完整组合结构：

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

### Button has no isPending or isLoading prop

组合使用 `Spinner` + `data-icon` + `disabled`:

```tsx
<Button disabled>
  <Spinner data-icon="inline-start" />
  Saving...
</Button>
```

### TabsTrigger must be inside TabsList

```tsx
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
  </TabsList>
  <TabsContent value="account">...</TabsContent>
</Tabs>
```

### Avatar always needs AvatarFallback

```tsx
<Avatar>
  <AvatarImage src="/avatar.png" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### Use existing components instead of custom markup

| Instead of | Use |
|---|---|
| `<hr>` or `<div className="border-t">` | `<Separator />` |
| `<div className="animate-pulse">` with styled divs | `<Skeleton />` |
| `<span className="rounded-full ...">` | `<Badge />` |

---

## Icons

**Always use the project's configured `iconLibrary` for imports.** 项目使用 `lucide-react`。

### Icons in Button use data-icon attribute

**Correct:**

```tsx
<Button>
  <SearchIcon data-icon="inline-start"/>
  Search
</Button>

<Button>
  Next
  <ArrowRightIcon data-icon="inline-end"/>
</Button>
```

### No sizing classes on icons inside components

**Correct:**

```tsx
<Button>
  <SearchIcon data-icon="inline-start" />
  Search
</Button>

<DropdownMenuItem>
  <SettingsIcon />
  Settings
</DropdownMenuItem>
```

### Pass icons as component objects, not string keys

**Correct:**

```tsx
import { CheckIcon } from "lucide-react"

function StatusBadge({ icon: Icon }: { icon: React.ComponentType }) {
  return <Icon />
}

<StatusBadge icon={CheckIcon} />
```

---

## Styling & Customization

### Semantic colors

使用语义化颜色，不要使用原始 Tailwind 颜色：

**Correct:**

```tsx
<div className="bg-primary text-primary-foreground">
  <p className="text-muted-foreground">Secondary text</p>
</div>
```

### No raw color values for status/state indicators

使用 Badge variants 或语义化 token。

**Correct:**

```tsx
<Badge variant="secondary">+20.1%</Badge>
<span className="text-destructive">-3.2%</span>
```

### Built-in variants first

```tsx
// Correct
<Button variant="outline">Click me</Button>

// Incorrect
<Button className="border border-input bg-transparent hover:bg-accent">
```

### className for layout only

使用 `className` 仅用于布局（`max-w-md`, `mx-auto`, `mt-4`），不要用于覆盖组件颜色或字体。

**Correct:**

```tsx
<Card className="max-w-md mx-auto">
  <CardContent>Dashboard</CardContent>
</Card>
```

### No space-x-* / space-y-*

使用 `gap-*` 替代。

```tsx
<div className="flex flex-col gap-4">
  <Input />
  <Input />
  <Button>Submit</Button>
</div>
```

### Prefer size-* over w-* h-* when equal

`size-10` not `w-10 h-10`

### Prefer truncate shorthand

`truncate` not `overflow-hidden text-ellipsis whitespace-nowrap`

### No manual dark: color overrides

使用语义化 token，它们通过 CSS 变量处理 light/dark。

### Use cn() for conditional classes

```tsx
import { cn } from "@/lib/utils"

<div className={cn("flex items-center", isActive ? "bg-primary" : "bg-muted")}>
```

### No manual z-index on overlay components

Dialog、Sheet、Drawer 等组件自己处理层叠，不要添加 `z-50` 或 `z-[999]`。

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

## 后端新增模块模板

### 1. 在 Model 中添加（如需要新表）

```python
# app/models/production.py
class MyModule(Base):
    __tablename__ = '我的表名'
    __bind_key__ = 'DB_JNS'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    字段1 = Column(String(50))
    create_at = Column(DateTime, default=datetime.datetime.now)
```

### 2. 在 Repository 中添加

```python
# app/repositories/my_repository.py
from app.repositories.base_repository import BaseRepository

class MyModuleRepository(BaseRepository):
    def __init__(self):
        super().__init__(MyModule)

    def search(self, db: Session, 字段1=None, page=1, page_size=20):
        query = db.query(MyModule)
        if 字段1:
            query = query.filter(MyModule.字段1.contains(字段1))
        total = query.count()
        items = query.order_by(desc(MyModule.id)).offset((page-1)*page_size).limit(page_size).all()
        return items, total

    def to_dict(self, obj: MyModule) -> dict:
        return {
            'id': obj.id,
            '字段1': obj.字段1,
            'create_at': obj.create_at.strftime('%Y-%m-%d %H:%M:%S') if obj.create_at else None,
        }

my_module_repository = MyModuleRepository()
```

### 3. 在 Service 中添加

```python
# app/services/my_service.py
from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.orm import Session
from app.repositories.my_repository import my_module_repository

class MyModuleService:
    def __init__(self):
        self.repo = my_module_repository

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

    def to_dict(self, obj) -> Dict[str, Any]:
        return self.repo.to_dict(obj)

my_module_service = MyModuleService()
```

### 4. 在 API 中添加

```python
# app/api/my_module.py
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.my_service import my_module_service

router = APIRouter()

@router.get("/list")
async def get_list(
    字段1: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    items, total = my_module_service.search(db, 字段1=字段1, page=page, page_size=limit)
    data = [my_module_service.to_dict(item) for item in items]
    return {"code": 0, "msg": "success", "count": total, "data": data}

@router.post("/create")
async def create(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    obj, error = my_module_service.create(db, **data)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {"code": 0, "msg": "创建成功", "data": {"id": obj.id}}
```

### 5. 更新 __init__.py

```python
# app/repositories/__init__.py
from app.repositories.my_repository import MyModuleRepository, my_module_repository
__all__ = [..., "MyModuleRepository", "my_module_repository"]

# app/services/__init__.py
from app.services.my_service import MyModuleService, my_module_service
__all__ = [..., "MyModuleService", "my_module_service"]
```

### 6. 注册路由

```python
# app/main.py 或 app/api/__init__.py
from app.api.my_module import router as my_module_router
app.include_router(my_module_router, prefix="/my-module", tags=["我的模块"])
```

---

## 前端新增模块模板

### 1. 页面入口

```tsx
// src/features/my-module/MyModule.tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { myModuleAPI } from '@/lib/my-module-api'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { type MyModule } from './components/my-module-columns'
import {
  MyModuleDetailDialog,
  MyModuleDeleteDialog,
  MyModuleAddDialog,
} from './components/my-module-dialogs'
import { MyModuleTable } from './components/my-module-table'

export function MyModuleList() {
  const [selectedRow, setSelectedRow] = useState<MyModule | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleView = (row: MyModule) => {
    setSelectedRow(row)
    setShowDetailDialog(true)
  }

  const handleDelete = (row: MyModule) => {
    setSelectedRow(row)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async (row: MyModule) => {
    try {
      const response = await myModuleAPI.delete(row.id)
      if (response.data.code === 0) {
        toast.success('删除成功')
        setShowDeleteDialog(false)
        setRefreshKey((k) => k + 1)
      } else {
        toast.error(response.data.msg)
      }
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const handleAdd = async () => {
    try {
      const response = await myModuleAPI.create(addForm)
      if (response.data.code === 0) {
        toast.success('创建成功')
        setShowAddDialog(false)
        setRefreshKey((k) => k + 1)
      } else {
        toast.error(response.data.msg)
      }
    } catch (error) {
      toast.error('创建失败')
    }
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>我的模块</h2>
            <p className='text-muted-foreground'>管理模块信息</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus data-icon='inline-start' />
            新增
          </Button>
        </div>

        <MyModuleTable
          onView={handleView}
          onDelete={handleDelete}
          refreshKey={refreshKey}
        />
      </Main>

      <MyModuleDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        data={selectedRow}
      />

      <MyModuleDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        data={selectedRow}
        onDelete={handleConfirmDelete}
      />

      <MyModuleAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleAdd}
      />
    </>
  )
}
```

### 2. API 文件

```typescript
// src/lib/my-module-api.ts
import api from './api'

export const myModuleAPI = {
  getList: (params?: any) => api.get('/my-module/list', { params }),
  getDetail: (id: number) => api.get(`/my-module/${id}`),
  create: (data: any) => api.post('/my-module/create', data),
  update: (data: any) => api.put('/my-module/update', data),
  delete: (id: number) => api.delete(`/my-module/${id}`),
}
```

### 3. 列定义

```tsx
// src/features/my-module/components/my-module-columns.tsx
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableRowActions } from './my-module-row-actions'

export interface MyModule {
  id: number
  字段1: string
  create_at: string
}

export const myModuleColumns = ({
  onView,
  onDelete,
}: {
  onView?: (row: MyModule) => void
  onDelete?: (row: MyModule) => void
}): ColumnDef<MyModule>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <span>{row.getValue('id')}</span>,
  },
  {
    accessorKey: '字段1',
    header: '字段1',
    cell: ({ row }) => <span>{row.getValue('字段1')}</span>,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        onView={onView}
        onDelete={onDelete}
      />
    ),
  },
]
```

### 4. 对话框组件

```tsx
// src/features/my-module/components/my-module-dialogs.tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

export function MyModuleDetailDialog({
  open,
  onOpenChange,
  data,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: MyModule | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>详情</DialogTitle>
        </DialogHeader>
        {data && (
          <div className="grid gap-2">
            <div>ID: {data.id}</div>
            <div>字段1: {data.字段1}</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function MyModuleDeleteDialog({
  open,
  onOpenChange,
  data,
  onDelete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: MyModule | null
  onDelete: (row: MyModule) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>确定要删除这条记录吗？</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={() => data && onDelete(data)}
          >
            删除
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function MyModuleAddDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}) {
  const [loading, setLoading] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {/* 表单项 */}
          <Button onClick={onSave} disabled={loading}>
            {loading && <Spinner data-icon="inline-start" />}
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 统一响应格式

```typescript
// 列表响应
{ "code": 0, "msg": "success", "count": 100, "data": [...] }

// 详情响应
{ "code": 0, "msg": "success", "count": 1, "data": {...} }

// 操作响应
{ "code": 0, "msg": "操作成功", "data": { "id": 1 } }

// 错误响应
{ "code": 1, "msg": "错误原因", "data": {} }
```

---

## 提交前检查清单

### 后端
- [ ] Model 已添加
- [ ] Repository 已添加并实现 CRUD
- [ ] Service 已添加并实现业务逻辑
- [ ] API 已添加并使用 JWT 认证
- [ ] `__init__.py` 已更新导出
- [ ] 路由已注册
- [ ] 导入测试通过

### 前端
- [ ] API 文件已创建
- [ ] 页面入口已创建
- [ ] 列定义已创建
- [ ] 表格组件已创建
- [ ] 对话框组件已创建
- [ ] 行操作已创建
- [ ] 页面已注册路由

---

Always respond in 中文
