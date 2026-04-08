# 代码审查报告

## 概述

| 项目 | 说明 |
|------|------|
| 审查日期 | 2026-04-07 |
| 技术栈 | React 19 + Vite 8 + TanStack Router/Query + Tailwind CSS 4 + shadcn/ui |
| 审查范围 | 前端核心组件和数据层 |

---

## 一、紧急问题（必须修复）

### 1.1 调试日志未移除

多个文件包含 `console.log` 调试语句，生产环境必须移除。

| 文件 | 行号 | 严重程度 |
|------|------|----------|
| `use-table-url-state.ts` | 206, 241 | 中 |
| `toolbar.tsx` | 118, 127 | 中 |
| `faceted-filter.tsx` | 49, 102, 116, 126, 127, 128 | 中 |
| `customer-table.tsx` | 78, 93, 95 | 中 |

**修复建议：**
```bash
# 使用 grep 查找所有 console.log
rg "console\.log" src/
```

**批量替换方案：**
```typescript
// 开发环境保留，生产环境移除
const debugLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args)
  }
}
```

---

### 1.2 API 层使用 `any` 类型

`api.ts` 中多处使用 `any` 类型，丢失类型安全。

**问题示例：**
```typescript
// api.ts:38
getOrders: (params?: any) => api.get('/order/list/data', { params }),

// api.ts:40
createOrder: (data: any) => api.post('/order/list/create', data),
```

**修复建议：**
```typescript
// 定义明确的参数和响应类型
interface OrderListParams {
  page?: number
  pageSize?: number
  status?: string
  search?: string
}

interface OrderListResponse {
  code: number
  msg: string
  data: Order[]
  count: number
}

getOrders: (params?: OrderListParams) => 
  api.get<OrderListResponse>('/order/list/data', { params }),
```

---

## 二、中等问题

### 2.1 TanStack Table 接口不匹配

**问题描述：**
`DataTableToolbar` 的 `onFilterChange(columnId, value)` 接口与 `useTableUrlState` 的 `onColumnFiltersChange(filters[])` 接口设计不匹配。

**影响：**
- 多选筛选器可能丢失其他筛选器的值
- 需要在调用方手动合并筛选器状态

**当前修复（已应用）：**
```typescript
// customer-table.tsx
onFilterChange={(columnId, value) => {
  const currentFilters = columnFilters || []
  const otherFilters = currentFilters.filter((f) => f.id !== columnId)
  const newFilters = value
    ? [...otherFilters, { id: columnId, value: value.split(',') }]
    : otherFilters
  onColumnFiltersChange?.(newFilters)
}}
```

**建议：**
后续统一接口设计，让 `onFilterChange` 直接传递所有筛选器的完整状态。

---

### 2.2 缺少请求参数验证

API 请求缺少 Zod schema 验证。

**当前代码：**
```typescript
// userAPI.createUser
createUser: (data: any) => {
  return api.post('/user/create', null, {
    params: {
      username: data.username,
      password: data.password,
      // ...
    },
  })
},
```

**建议：**
```typescript
import { z } from 'zod'

const CreateUserSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(6),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'user', 'guest']),
})

createUser: (data: unknown) => {
  const validated = CreateUserSchema.parse(data)
  return api.post('/user/create', null, { params: validated })
},
```

---

### 2.3 错误处理不一致

API 层和组件层错误处理方式不统一。

**问题：**
- `api.ts` 使用 `Promise.reject(error)` 抛出错误
- 部分组件使用 `try-catch`，部分使用 `.catch()`

**建议统一：**
```typescript
// 统一使用 async/await + try-catch
const fetchData = async () => {
  try {
    const response = await customerAPI.getCustomers(params)
    setData(response.data.data)
  } catch (error) {
    // 统一错误处理：toast + 日志
    handleServerError(error)
    throw error // 重新抛出让调用方知道
  }
}
```

---

## 三、低优先级问题

### 3.1 组件重复渲染

`use-table-url-state.ts` 的 `useEffect` 可能导致不必要的重复渲染。

**问题代码：**
```typescript
// 第206-212行
if (JSON.stringify(newColumnFilters) !== JSON.stringify(columnFilters)) {
  setColumnFilters(newColumnFilters)
}
```

**建议：**
```typescript
// 使用 shallow compare
import { isEqual } from 'lodash'
if (!isEqual(newColumnFilters, columnFilters)) {
  setColumnFilters(newColumnFilters)
}
```

---

### 3.2 API 响应类型命名

部分 API 响应直接使用 `data` 字段，类型定义不清晰。

**建议：**
```typescript
// 定义统一的 API 响应包装类型
interface ApiResponse<T> {
  code: number
  msg: string
  data: T
  count?: number
  total?: number
}

interface Customer {
  id: number
  name: string
  // ...
}

type CustomerListResponse = ApiResponse<Customer[]>
```

---

### 3.3 缺少 API 错误码文档

API 返回 `code: 0` 表示成功，其他错误码含义不明确。

**建议：**
```typescript
// 创建错误码常量
export const API_CODES = {
  SUCCESS: 0,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  VALIDATION_ERROR: 422,
} as const

// 使用
if (response.data.code === API_CODES.SUCCESS) {
  // success
}
```

---

## 四、安全问题

### 4.1 Token 存储在 localStorage

**问题：**
```typescript
// api.ts:14
const token = localStorage.getItem('token')
```

`localStorage` 易受 XSS 攻击。

**建议：**
- 使用 `httpOnly` Cookie 存储 token
- 或使用 `sessionStorage` + 加密

---

### 4.2 缺少 CSRF 保护

API 请求未携带 CSRF token。

**建议：**
```typescript
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf_token='))
    ?.split('=')[1]
  
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken
  }
  return config
})
```

---

### 4.3 敏感操作缺少确认

删除等敏感操作虽使用了确认框，但部分操作可考虑添加操作日志。

---

## 五、架构建议

### 5.1 状态管理模式

当前混合使用：
- `useTableUrlState` - URL 状态
- `localState` - 组件状态
- `TanStack Query` - 服务端状态

**建议：**
```
服务器状态 → TanStack Query (缓存、同步)
URL 状态 → useTableUrlState (搜索、筛选、分页)
本地 UI 状态 → useState/useReducer
```

---

### 5.2 API 层拆分

当前所有 API 集中在 `api.ts`，建议按领域拆分：

```
src/
  api/
    index.ts          # axios 实例和拦截器
    order.api.ts       # 订单相关
    customer.api.ts    # 客户相关
    user.api.ts        # 用户相关
    report.api.ts      # 报表相关
    types.ts           # 共享类型定义
```

---

### 5.3 Hook 封装

建议为每个数据域封装专用 hooks：

```typescript
// src/hooks/useCustomers.ts
export function useCustomers(params: CustomerParams) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerAPI.getCustomers(params),
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

// 使用
const { data, isLoading } = useCustomers({ status: 'active' })
```

---

## 六、测试建议

### 6.1 单元测试

建议添加：
- API 层的请求/响应处理
- `useTableUrlState` 的状态同步逻辑
- 表单验证 schema

### 6.2 组件测试

建议添加：
- `DataTableToolbar` 的交互测试
- `DataTableFacetedFilter` 的多选逻辑测试

### 6.3 E2E 测试

建议添加：
- 完整的筛选、搜索、分页流程
- 表单提交和验证流程

---

## 七、总结

### 立即修复
1. 移除所有 `console.log` 调试语句
2. 统一 API 响应类型定义

### 短期计划
1. 补充 Zod schema 验证
2. 统一错误处理方式
3. 拆分 API 层

### 长期优化
1. 安全加固（CSRF、token 存储）
2. 测试覆盖率提升
3. 状态管理模式统一

---

## 附录：文件清单

| 文件路径 | 问题数 | 优先级 |
|----------|--------|--------|
| `src/lib/api.ts` | 5 | 高 |
| `src/hooks/use-table-url-state.ts` | 2 | 中 |
| `src/components/data-table/toolbar.tsx` | 2 | 中 |
| `src/components/data-table/faceted-filter.tsx` | 5 | 中 |
| `src/features/customers/components/customer-table.tsx` | 3 | 中 |
