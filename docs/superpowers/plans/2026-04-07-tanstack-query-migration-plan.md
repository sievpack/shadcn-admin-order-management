# TanStack Query 渐进式迁移 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为订单模块创建 TanStack Query hooks，建立渐进式迁移范式

**Architecture:** 
- 创建 `src/queries/` 目录存放 TanStack Query hooks
- 保留现有 `services/` 和 `lib/api.ts` 不变
- 新 hooks 直接调用 API 函数，组件通过 hooks 间接使用数据
- 使用 query keys 统一管理缓存失效

**Tech Stack:** TanStack Query v5, React Query, Zod

---

## 文件结构

```
src/
├── queries/                      # 新增
│   └── orders/
│       ├── keys.ts              # Query Keys 定义
│       ├── useOrders.ts         # 订单列表查询
│       ├── useOrderItems.ts     # 订单分项查询
│       ├── useCreateOrder.ts    # 创建订单 mutation
│       ├── useUpdateOrder.ts    # 更新订单 mutation
│       └── useDeleteOrder.ts    # 删除订单 mutation
├── services/
│   └── orderService.ts          # 保留不变（待后续迁移）
├── features/orders/
│   └── OrderList.tsx           # 修改：使用 TanStack Query
```

---

## Task 1: 创建 Query Keys 定义

**Files:**
- Create: `src/queries/orders/keys.ts`

- [ ] **Step 1: 创建 keys.ts 文件**

```typescript
// src/queries/orders/keys.ts

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => 
    [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
  items: (orderId: number) => [...orderKeys.detail(orderId), 'items'] as const,
}
```

---

## Task 2: 创建 useOrders - 订单列表查询

**Files:**
- Create: `src/queries/orders/useOrders.ts`

- [ ] **Step 1: 创建 useOrders.ts**

```typescript
// src/queries/orders/useOrders.ts
import { useQuery } from '@tanstack/react-query'
import { orderListAPI } from '@/lib/api'
import { orderKeys } from './keys'
import type { OrderListParams } from '@/lib/api-types'

interface UseOrdersOptions {
  params?: OrderListParams
  enabled?: boolean
}

export function useOrders({ params = {}, enabled = true }: UseOrdersOptions = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderListAPI.getOrders(params),
    enabled,
    // 保留旧数据 while 加载新数据，减少闪烁
    placeholderData: (previousData) => previousData,
  })
}
```

---

## Task 3: 创建 useOrderItems - 订单分项查询

**Files:**
- Create: `src/queries/orders/useOrderItems.ts`

- [ ] **Step 1: 创建 useOrderItems.ts**

```typescript
// src/queries/orders/useOrderItems.ts
import { useQuery } from '@tanstack/react-query'
import { orderItemAPI } from '@/lib/api'
import { orderKeys } from './keys'

interface UseOrderItemsOptions {
  orderId: number
  enabled?: boolean
}

export function useOrderItems({ orderId, enabled = true }: UseOrderItemsOptions) {
  return useQuery({
    queryKey: orderKeys.items(orderId),
    queryFn: () => orderItemAPI.getItemsByOrderId(orderId),
    enabled,
  })
}
```

---

## Task 4: 创建 useCreateOrder - 创建订单 Mutation

**Files:**
- Create: `src/queries/orders/useCreateOrder.ts`

- [ ] **Step 1: 创建 useCreateOrder.ts**

```typescript
// src/queries/orders/useCreateOrder.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderListAPI } from '@/lib/api'
import { orderKeys } from './keys'
import { toast } from 'sonner'
import type { CreateOrder } from '@/lib/api-types'

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOrder) => orderListAPI.createOrder(data),
    onSuccess: () => {
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

## Task 5: 创建 useUpdateOrder - 更新订单 Mutation

**Files:**
- Create: `src/queries/orders/useUpdateOrder.ts`

- [ ] **Step 1: 创建 useUpdateOrder.ts**

```typescript
// src/queries/orders/useUpdateOrder.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderListAPI } from '@/lib/api'
import { orderKeys } from './keys'
import { toast } from 'sonner'
import type { UpdateOrder } from '@/lib/api-types'

interface UpdateOrderData extends UpdateOrder {
  id: number
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateOrderData) => orderListAPI.updateOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      toast.success('订单更新成功')
    },
    onError: (error) => {
      console.error('更新订单失败:', error)
      toast.error('更新失败，请稍后重试')
    },
  })
}
```

---

## Task 6: 创建 useDeleteOrder - 删除订单 Mutation

**Files:**
- Create: `src/queries/orders/useDeleteOrder.ts`

- [ ] **Step 1: 创建 useDeleteOrder.ts**

```typescript
// src/queries/orders/useDeleteOrder.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderListAPI } from '@/lib/api'
import { orderKeys } from './keys'
import { toast } from 'sonner'

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => orderListAPI.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      toast.success('订单删除成功')
    },
    onError: (error) => {
      console.error('删除订单失败:', error)
      toast.error('删除失败，请稍后重试')
    },
  })
}
```

---

## Task 7: 修改 OrderList.tsx 使用 TanStack Query

**Files:**
- Modify: `src/features/orders/OrderList.tsx:21-313`

- [ ] **Step 1: 替换 useOrderService 为 TanStack Query hooks**

在 OrderList.tsx 中：

```tsx
// 删除这行
// import { useOrderService } from '@/services/orderService'

// 添加这些导入
import { useOrders } from '@/queries/orders/useOrders'
import { useOrderItems } from '@/queries/orders/useOrderItems'
import { useCreateOrder } from '@/queries/orders/useCreateOrder'
import { useUpdateOrder } from '@/queries/orders/useUpdateOrder'
import { useDeleteOrder } from '@/queries/orders/useDeleteOrder'

// 删除 useOrderService 调用
// const { getOrderItems, createOrder, ... } = useOrderService()

// 添加 TanStack Query hooks
const { data: ordersData, isLoading } = useOrders()
const createOrder = useCreateOrder()
const updateOrder = useUpdateOrder()
const deleteOrder = useDeleteOrder()
```

- [ ] **Step 2: 更新数据获取逻辑**

```tsx
// 原来的 getOrderItems.execute(id) 替换为
const { data: orderItemsResult } = useOrderItems({ orderId: id })
// orderItemsResult?.data 为订单分项数据

// 原来的 createOrder.execute(data) 替换为
createOrder.mutate(data)

// 原来的 updateOrder.execute(data) 替换为
updateOrder.mutate(data)

// 原来的 deleteOrder.execute(id) 替换为
deleteOrder.mutate(id)
```

- [ ] **Step 3: 删除不再需要的状态**

```tsx
// 删除这些状态（TanStack Query 自动管理）
// const [loading, setLoading] = useState<boolean>(false)
// const [refreshKey, setRefreshKey] = useState(0)
```

- [ ] **Step 4: 更新 OrderListTable 组件**

```tsx
// 传递 TanStack Query 的数据到表格
<OrderListTable
  data={ordersData?.data?.data || []}
  total={ordersData?.data?.total || 0}
  isLoading={isLoading}
  // ... 其他 props
/>
```

---

## Task 8: 创建 queries/index.ts 导出文件（可选）

**Files:**
- Create: `src/queries/index.ts`

- [ ] **Step 1: 创建导出文件**

```typescript
// src/queries/index.ts
export * from './orders/keys'
export * from './orders/useOrders'
export * from './orders/useOrderItems'
export * from './orders/useCreateOrder'
export * from './orders/useUpdateOrder'
export * from './orders/useDeleteOrder'
```

---

## 验收标准

- [ ] `src/queries/orders/` 目录结构正确
- [ ] `useOrders` hook 可正常获取订单列表
- [ ] `useCreateOrder` mutation 可创建订单并自动刷新列表
- [ ] `useUpdateOrder` mutation 可更新订单并自动刷新列表
- [ ] `useDeleteOrder` mutation 可删除订单并自动刷新列表
- [ ] `OrderList.tsx` 正常运行，无编译错误
- [ ] 页面加载时无数据闪烁（placeholderData 生效）
- [ ] 网络错误时自动重试并显示错误 toast
