# TanStack Query 渐进式迁移方案

**日期**: 2026-04-07
**状态**: 已批准
**优先级**: 高

---

## 1. 背景

当前项目使用自定义 `useApi` hook 进行数据请求，存在以下问题：
- 无缓存机制，相同数据重复请求
- 无请求去重，多组件请求同一数据会重复调用
- 无智能重试，失败需手动处理
- 无乐观更新，用户体验较差

TanStack Query 已配置在 `main.tsx` 中但未使用。

---

## 2. 目标

- 保留现有 `services/` 和 `lib/api.ts` 不影响现有功能
- 新功能直接使用 TanStack Query
- 旧功能渐进迁移，不做一次性大规模替换
- 为项目提供：智能缓存、自动重试、乐观更新、后台刷新

---

## 3. 方案：渐进式 Query Hooks

### 3.1 目录结构

```
src/
├── queries/                    # 新增：TanStack Query hooks
│   ├── orders/
│   │   ├── keys.ts            # queryKeys 定义
│   │   ├── useOrders.ts       # 订单列表查询
│   │   ├── useOrderDetail.ts  # 订单详情查询
│   │   ├── useCreateOrder.ts  # 创建订单 mutation
│   │   ├── useUpdateOrder.ts  # 更新订单 mutation
│   │   ├── useDeleteOrder.ts  # 删除订单 mutation
│   │   └── useOrderItems.ts   # 订单分项查询
│   └── customers/
│       ├── keys.ts
│       ├── useCustomers.ts
│       └── ...
├── services/                   # 保留现有代码
│   └── orderService.ts        # useApi 版本（待迁移）
```

### 3.2 Query Keys 规范

所有 query keys 统一管理，便于缓存失效：

```typescript
// queries/orders/keys.ts
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
  items: (orderId: number) => [...orderKeys.detail(orderId), 'items'] as const,
}
```

### 3.3 QueryClient 配置

`main.tsx` 中的智能缓存配置：

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5分钟内数据被视为新鲜
      gcTime: 1000 * 60 * 30,         // 30分钟无访问后清理
      retry: 3,                         // 失败自动重试3次
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,      // 窗口聚焦时后台刷新
      refetchOnMount: true,            // 组件挂载时检查数据新鲜度
    },
    mutations: {
      retry: 0,                         // mutation 默认不重试
    },
  },
})
```

### 3.4 使用示例

**订单列表查询**：

```typescript
// queries/orders/useOrders.ts
import { useQuery } from '@tanstack/react-query'
import { orderListAPI } from '@/lib/api'
import { orderKeys } from './keys'

interface UseOrdersParams {
  page?: number
  limit?: number
  query?: string
  status?: string
  start_date?: string
  end_date?: string
}

export function useOrders(params: UseOrdersParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderListAPI.getOrders({
      page: (params.page || 1) + 1,
      limit: params.limit || 10,
      query: params.query,
      status: params.status,
      start_date: params.start_date,
      end_date: params.end_date,
    }),
    placeholderData: (previousData) => previousData, // 保留旧数据while加载新数据
  })
}
```

**创建订单（带乐观更新）**：

```typescript
// queries/orders/useCreateOrder.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderAPI } from '@/lib/api'
import { orderKeys } from './keys'
import { toast } from 'sonner'

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: orderAPI.createOrder,
    onSuccess: () => {
      // 乐观更新：立即使列表缓存失效
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      toast.success('订单创建成功')
    },
    onError: (error) => {
      console.error('创建订单失败:', error)
      toast.error('创建失败，请稍后重试')
    },
  })
}
```

---

## 4. 迁移优先级

### 第一阶段：试点（当前）
1. 创建 `queries/orders/` 目录和基础文件
2. 改造订单列表页面 `OrderList.tsx`
3. 验证缓存、去重、刷新机制

### 第二阶段：扩展
1. 迁移订单详情、创建、编辑、删除
2. 创建 `queries/customers/` 改造客户模块
3. 逐步覆盖其他高频模块

### 第三阶段：收尾
1. 剩余模块渐进迁移
2. 移除不再使用的 `useApi` 代码
3. 统一错误处理和加载状态

---

## 5. 注意事项

- 现有 `services/orderService.ts` 保持不变，确保现有功能正常
- 新功能开发统一使用 TanStack Query 方式
- 所有 API 响应格式保持 `{ code: number, data: T, total?: number }`
- 使用 `toast` (sonner) 进行操作反馈

---

## 6. 验收标准

- [ ] 订单列表页面可正常加载和交互
- [ ] 切换页面后返回，数据从缓存加载无闪烁
- [ ] 创建/更新/删除操作后列表自动刷新
- [ ] 网络错误时自动重试并显示错误提示
