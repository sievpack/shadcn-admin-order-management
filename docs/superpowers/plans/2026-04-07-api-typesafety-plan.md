# API层类型安全实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `src/lib/api.ts` 中所有 API 添加 TypeScript 类型安全和 Zod 运行时验证

**Architecture:** 创建 `src/lib/api-types.ts` 集中定义所有类型和 Zod schema，创建 `src/lib/api-validation.ts` 提供开发环境验证函数，修改 `src/lib/api.ts` 使用新类型

**Tech Stack:** TypeScript, Zod, axios

---

## 文件结构

```
src/lib/
├── api.ts              # 修改：添加类型导入和验证
├── api-types.ts        # 新建：所有 API 类型和 Zod schema
└── api-validation.ts   # 新建：开发环境验证函数
```

---

## Task 1: 创建 api-types.ts

**Files:**
- Create: `src/lib/api-types.ts`

- [ ] **Step 1: 创建基础类型定义**

```typescript
import { z } from 'zod'

// ============ 通用类型 ============

export const paginationParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
})

export const idParamSchema = z.object({
  id: z.number(),
})

// ============ 订单模块 ============

export const orderListParamsSchema = z.object({
  query: z.literal('list').optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  settlement: z.string().optional(),
  ...paginationParamsSchema.shape,
})

export const orderSchema = z.object({
  id: z.number(),
  order_number: z.string(),
  合同编号: z.string().optional(),
  customer_name: z.string(),
  order_date: z.string(),
  delivery_date: z.string().optional(),
  status: z.boolean().optional(),
  settlement: z.string().optional(),
  total_amount: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const orderListResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.array(orderSchema),
  total: z.number().optional(),
  count: z.number().optional(),
})

export const orderResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: orderSchema,
})

export const createOrderSchema = z.object({
  order_number: z.string().optional(),
  customer_name: z.string(),
  order_date: z.string(),
  delivery_date: z.string().optional(),
  status: z.boolean().optional(),
  settlement: z.string().optional(),
})

export const updateOrderSchema = createOrderSchema.partial()

// ============ 订单分项模块 ============

export const orderItemSchema = z.object({
  id: z.number(),
  oid: z.number(),
  订单编号: z.string(),
  合同编号: z.string().optional(),
  规格: z.string().optional(),
  产品类型: z.string().optional(),
  型号: z.string().optional(),
  数量: z.number(),
  单位: z.string().optional(),
  销售单价: z.number().optional(),
  金额: z.number().optional(),
  备注: z.string().optional(),
  结算方式: z.string().optional(),
  发货单号: z.string().nullable().optional(),
  快递单号: z.string().nullable().optional(),
  客户物料编号: z.string().optional(),
  外购: z.boolean(),
})

export const orderItemParamsSchema = z.object({
  ...paginationParamsSchema.shape,
})

export const orderItemListResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.array(orderItemSchema),
  total: z.number().optional(),
  count: z.number().optional(),
})

export const createOrderItemSchema = z.object({
  oid: z.number().optional(),
  订单编号: z.string(),
  合同编号: z.string().optional(),
  规格: z.string().optional(),
  产品类型: z.string().optional(),
  型号: z.string().optional(),
  数量: z.number(),
  单位: z.string().optional(),
  销售单价: z.number().optional(),
  备注: z.string().optional(),
  结算方式: z.string().optional(),
  客户物料编号: z.string().optional(),
  外购: z.boolean(),
})

// ============ 客户模块 ============

export const customerSchema = z.object({
  id: z.number(),
  customer_name: z.string(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  settlement: z.string().optional(),
  status: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const customerListParamsSchema = z.object({
  query: z.literal('list').optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  settlement: z.string().optional(),
  ...paginationParamsSchema.shape,
})

export const customerListResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.array(customerSchema),
  total: z.number().optional(),
  count: z.number().optional(),
})

export const customerNamesResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.array(z.object({
    id: z.number(),
    customer_name: z.string(),
  })),
})

export const createCustomerSchema = z.object({
  customer_name: z.string(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  settlement: z.string().optional(),
  status: z.string().optional(),
})

export const updateCustomerSchema = createCustomerSchema.partial()

// ============ 编号生成模块 ============

export const codeGenerateParamsSchema = z.object({
  prefix: z.string(),
})

export const codeGenerateResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.object({
    code: z.string(),
  }),
})

// ============ 订单统计模块 ============

export const salesStatsResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.object({
    total_orders: z.number(),
    total_amount: z.number(),
    pending_orders: z.number(),
    shipped_orders: z.number(),
  }),
})

export const recentOrdersResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.array(orderSchema),
})

export const salesTrendParamsSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']),
})

export const salesTrendResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.array(z.object({
    date: z.string(),
    orders: z.number(),
    amount: z.number(),
  })),
})

// ============ 发货模块 ============

export const shippingSchema = z.object({
  id: z.number(),
  发货单号: z.string(),
  快递单号: z.string().optional(),
  快递公司: z.string().optional(),
  created_at: z.string().optional(),
})

export const shippingListParamsSchema = z.object({
  ...paginationParamsSchema.shape,
})

export const shippingListResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.array(shippingSchema),
  total: z.number().optional(),
  count: z.number().optional(),
})

export const markShippedSchema = z.object({
  ids: z.array(z.number()),
  发货单号: z.string(),
  快递单号: z.string(),
  快递公司: z.string().optional(),
})

export const createShippingSchema = z.object({
  发货单号: z.string(),
  快递单号: z.string().optional(),
  快递公司: z.string().optional(),
})

// ============ 报价模块 ============

export const quoteSchema = z.object({
  id: z.number(),
  quote_number: z.string(),
  customer_name: z.string(),
  quote_date: z.string(),
  expiry_date: z.string().optional(),
  status: z.string().optional(),
  total_amount: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const quoteListParamsSchema = z.object({
  query: z.literal('list').optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  ...paginationParamsSchema.shape,
})

export const quoteListResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.array(quoteSchema),
  total: z.number().optional(),
  count: z.number().optional(),
})

export const createQuoteSchema = z.object({
  quote_number: z.string().optional(),
  customer_name: z.string(),
  quote_date: z.string(),
  expiry_date: z.string().optional(),
  status: z.string().optional(),
})

export const updateQuoteSchema = createQuoteSchema.partial()

// ============ 报表模块 ============

export const monthlyReportParamsSchema = z.object({
  year: z.number().int().positive(),
  month: z.number().int().min(1).max(12),
  ...paginationParamsSchema.shape,
})

export const monthlyReportResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.array(z.object({
    month: z.string(),
    orders: z.number(),
    amount: z.number(),
  })),
})

export const customerYearlyReportParamsSchema = z.object({
  customer_id: z.number().optional(),
  year: z.number().int().positive(),
})

export const industryReportParamsSchema = z.object({
  year: z.number().int().positive().optional(),
  month: z.number().int().min(1).max(12).optional(),
})

export const productReportParamsSchema = z.object({
  product_type: z.string().optional(),
  year: z.number().int().positive(),
  month: z.number().int().min(1).max(12),
})

export const productTypesResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.array(z.string()),
})

// ============ 用户模块 ============

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['superadmin', 'admin', 'cashier', 'manager']),
  status: z.enum(['active', 'inactive', 'invited', 'suspended']).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const userListParamsSchema = z.object({
  ...paginationParamsSchema.shape,
})

export const userListResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.array(userSchema),
  total: z.number().optional(),
  count: z.number().optional(),
})

export const createUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional().or(z.string().optional()),
  phone: z.string().optional(),
  role: z.enum(['superadmin', 'admin', 'cashier', 'manager']),
})

export const updateUserSchema = z.object({
  id: z.number(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional().or(z.string().optional()),
  phone: z.string().optional(),
  role: z.enum(['superadmin', 'admin', 'cashier', 'manager']).optional(),
  status: z.enum(['active', 'inactive', 'invited', 'suspended']).optional(),
})

// ============ 打印模块 ============

export const printPreviewSchema = z.object({
  data: z.record(z.unknown()),
  type: z.string(),
})

// ============ 字典模块 ============

export const dictTypeSchema = z.object({
  id: z.number(),
  dict_name: z.string(),
  dict_type: z.string(),
  description: z.string().optional(),
  available: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const dictDataSchema = z.object({
  id: z.number(),
  dict_label: z.string(),
  dict_value: z.string(),
  dict_type: z.string(),
  dict_sort: z.number().optional(),
  css_class: z.string().optional(),
  list_class: z.string().optional(),
  is_default: z.boolean().optional(),
  description: z.string().optional(),
  available: z.boolean().optional(),
})

export const dictTypeListResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.array(dictTypeSchema),
  total: z.number().optional(),
})

export const dictDataListResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.array(dictDataSchema),
  total: z.number().optional(),
})

export const createDictTypeSchema = z.object({
  dict_name: z.string(),
  dict_type: z.string(),
  description: z.string().optional(),
  available: z.boolean().optional(),
})

export const updateDictTypeSchema = createDictTypeSchema.partial()

export const createDictDataSchema = z.object({
  dict_label: z.string(),
  dict_value: z.string(),
  dict_type: z.string(),
  dict_sort: z.number().optional(),
  css_class: z.string().optional(),
  list_class: z.string().optional(),
  is_default: z.boolean().optional(),
  description: z.string().optional(),
  available: z.boolean().optional(),
})

export const updateDictDataSchema = createDictDataSchema.partial()

// ============ 认证模块 ============

export const loginParamsSchema = z.object({
  username: z.string(),
  password: z.string(),
})

export const loginResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  token: z.string().optional(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    role: z.string(),
  }).optional(),
})

export const userInfoResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.object({
    id: z.number(),
    username: z.string(),
    role: z.string(),
    userInfo: z.record(z.unknown()).optional(),
  }),
})

// ============ 通用响应 ============

export const apiResponseSchema = z.object({
  code: z.number(),
  msg: z.string().optional(),
  data: z.unknown().optional(),
})
```

---

## Task 2: 创建 api-validation.ts

**Files:**
- Create: `src/lib/api-validation.ts`

- [ ] **Step 1: 创建验证函数**

```typescript
import { z } from 'zod'

/**
 * 开发环境验证函数 - 对数据进行 Zod schema 验证
 * 生产环境直接返回原数据，跳过验证以提升性能
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  name: string
): T {
  if (import.meta.env.DEV) {
    const result = schema.safeParse(data)
    if (!result.success) {
      console.error(`[API Validation Error] ${name}:`, result.error.format())
      throw new Error(`Invalid ${name}: ${result.error.message}`)
    }
    return result.data
  }
  return data as T
}

/**
 * 开发环境验证请求参数
 */
export function validateParams<T>(
  schema: z.ZodSchema<T>,
  params: unknown,
  name: string
): T | undefined {
  if (params === undefined) {
    return undefined
  }
  if (import.meta.env.DEV) {
    const result = schema.safeParse(params)
    if (!result.success) {
      console.warn(`[API Params Warning] ${name}:`, result.error.format())
      // 参数验证失败不抛出错误，只警告，避免阻塞请求
    }
    return result.success ? result.data : (params as T)
  }
  return params as T
}

/**
 * 开发环境验证响应数据
 */
export function validateResponse<T>(
  schema: z.ZodSchema<T>,
  response: unknown,
  name: string
): T {
  if (import.meta.env.DEV) {
    const result = schema.safeParse(response)
    if (!result.success) {
      console.error(`[API Response Validation Error] ${name}:`, result.error.format())
      // 响应验证失败不抛出错误，只记录错误，因为数据已经返回
    }
    return result.success ? result.data : (response as T)
  }
  return response as T
}
```

---

## Task 3: 更新 api.ts

**Files:**
- Modify: `src/lib/api.ts`

- [ ] **Step 1: 添加类型导入**

```typescript
import axios from 'axios'
import { z } from 'zod'
import {
  // Order
  orderListParamsSchema,
  orderSchema,
  orderListResponseSchema,
  createOrderSchema,
  updateOrderSchema,
  orderItemSchema,
  orderItemListResponseSchema,
  createOrderItemSchema,
  // Customer
  customerListParamsSchema,
  customerSchema,
  customerListResponseSchema,
  customerNamesResponseSchema,
  createCustomerSchema,
  updateCustomerSchema,
  // Quote
  quoteListParamsSchema,
  quoteSchema,
  quoteListResponseSchema,
  createQuoteSchema,
  updateQuoteSchema,
  // Report
  monthlyReportParamsSchema,
  salesStatsResponseSchema,
  recentOrdersResponseSchema,
  salesTrendParamsSchema,
  salesTrendResponseSchema,
  customerYearlyReportParamsSchema,
  industryReportParamsSchema,
  productReportParamsSchema,
  productTypesResponseSchema,
  // User
  userListParamsSchema,
  userSchema,
  userListResponseSchema,
  createUserSchema,
  updateUserSchema,
  // Shipping
  shippingListParamsSchema,
  shippingSchema,
  shippingListResponseSchema,
  markShippedSchema,
  createShippingSchema,
  // Dict
  dictTypeSchema,
  dictDataSchema,
  dictTypeListResponseSchema,
  dictDataListResponseSchema,
  createDictTypeSchema,
  updateDictTypeSchema,
  createDictDataSchema,
  updateDictDataSchema,
  // Auth
  loginParamsSchema,
  loginResponseSchema,
  userInfoResponseSchema,
  // Code
  codeGenerateParamsSchema,
  codeGenerateResponseSchema,
} from './api-types'
import { validateParams, validateResponse } from './api-validation'
```

- [ ] **Step 2: 更新订单列表 API**

```typescript
// 订单列表 API
export const orderListAPI = {
  getOrders: (params?: z.infer<typeof orderListParamsSchema>) => {
    const validatedParams = validateParams(orderListParamsSchema, params, 'orderListParams')
    return api.get('/order/list/data', { params: validatedParams })
  },
  getAllOrders: () => api.get('/order/list/all'),
  createOrder: (data: z.infer<typeof createOrderSchema>) => {
    const validatedData = validateParams(createOrderSchema, data, 'createOrder')
    return api.post('/order/list/create', validatedData)
  },
  updateOrder: (data: z.infer<typeof updateOrderSchema> & { id: number }) => {
    const validatedData = validateParams(updateOrderSchema, data, 'updateOrder')
    return api.put('/order/list/update', validatedData)
  },
  deleteOrder: (id: number) => api.delete(`/order/list/delete/${id}`),
  markShipped: (data: z.infer<typeof markShippedSchema>) => {
    const validatedData = validateParams(markShippedSchema, data, 'markShipped')
    return api.post('/order/list/mark-shipped', validatedData)
  },
}
```

- [ ] **Step 3: 更新其他 API 模块**

继续按照 Step 2 的模式更新:
- `codeAPI` - 编号生成 API
- `orderItemAPI` - 订单分项 API
- `orderStatsAPI` - 订单统计 API
- `shippingAPI` - 发货 API
- `authAPI` - 认证 API
- `customerAPI` - 客户 API
- `quoteAPI` - 报价 API
- `reportAPI` - 报表 API
- `userAPI` - 用户 API
- `printAPI` - 打印 API
- `dictTypeAPI` - 字典类型 API
- `dictDataAPI` - 字典数据 API

---

## Task 4: 类型检查和验证

**Files:**
- Run: `npm run typecheck`

- [ ] **Step 1: 运行 TypeScript 类型检查**

Run: `npm run typecheck`
Expected: 无 TypeScript 编译错误

- [ ] **Step 2: 运行 lint 检查**

Run: `npm run lint`
Expected: 无 lint 错误

---

## Task 5: 功能验证清单

验证每个模块的 API 调用是否正常工作：

| 模块 | API方法 | 验证页面 | 预期结果 |
|------|---------|----------|----------|
| Order | getOrders | /orders | 订单列表正常显示 |
| Order | createOrder | /orders 新增 | 订单创建成功 |
| Customer | getCustomers | /customers | 客户列表正常显示 |
| Quote | getQuotes | /quotes | 报价列表正常显示 |
| Report | getMonthlyReport | /reports | 月报数据正常显示 |
| User | getUsers | /users | 用户列表正常显示 |
| Shipping | getShippingList | /shipping | 发货列表正常显示 |
| Auth | login | /sign-in | 登录成功跳转首页 |

---

## 注意事项

1. **中文字段名**：直接使用字符串（如 `customer_name`、`订单编号`）
2. **日期字段**：统一使用字符串格式，解析由业务层处理
3. **可选参数**：使用 Zod 的 `.optional()` 和 `?.`
4. **分页参数范围**：`page >= 1`, `limit <= 100`
5. **生产环境验证**：跳过运行时验证，仅依赖 TypeScript 编译时类型检查
