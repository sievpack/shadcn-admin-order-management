import { z } from 'zod'

// ==================== 通用类型 ====================

export const paginationParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export type PaginationParams = z.infer<typeof paginationParamsSchema>

// ==================== 订单模块 (Order) ====================

export const orderListParamsSchema = z.object({
  query: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  settlement: z.string().optional(),
  发货状态: z.string().optional(),
  items: z.boolean().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export type OrderListParams = z.infer<typeof orderListParamsSchema>

export const orderSchema = z.object({
  id: z.number(),
  order_number: z.string(),
  customer_name: z.string(),
  order_date: z.string(),
  delivery_date: z.string(),
  status: z.boolean(),
})

export type Order = z.infer<typeof orderSchema>

export const orderListResponseSchema = z.object({
  data: z.array(orderSchema),
  count: z.number(),
})

export type OrderListResponse = z.infer<typeof orderListResponseSchema>

export const createOrderSchema = z.object({
  order_number: z.string(),
  customer_name: z.string(),
  order_date: z.string(),
  delivery_date: z.string(),
  status: z.boolean().default(false),
})

export type CreateOrder = z.infer<typeof createOrderSchema>

export const updateOrderSchema = createOrderSchema.partial()

export type UpdateOrder = z.infer<typeof updateOrderSchema>

// ==================== 订单分项模块 (OrderItem) ====================

export const orderItemSchema = z.object({
  id: z.number(),
  oid: z.number(),
  订单编号: z.string(),
  合同编号: z.string(),
  订单日期: z.string(),
  交货日期: z.string(),
  规格: z.string(),
  产品类型: z.string(),
  型号: z.string(),
  数量: z.number(),
  单位: z.string(),
  销售单价: z.number(),
  金额: z.number(),
  备注: z.string(),
  客户名称: z.string(),
  结算方式: z.string(),
  发货单号: z.string(),
  快递单号: z.string(),
  客户物料编号: z.string(),
  外购: z.boolean(),
})

export type OrderItem = z.infer<typeof orderItemSchema>

export const orderItemParamsSchema = z.object({
  order_id: z.number().optional(),
  query: z.string().optional(),
  规格: z.string().optional(),
  型号: z.string().optional(),
  产品类型: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export type OrderItemParams = z.infer<typeof orderItemParamsSchema>

// 加工单打印数据
export const processingOrderPrintItemSchema = z.object({
  产品类型: z.string(),
  规格: z.string(),
  宽度: z.string(),
  长度: z.string(),
  节距: z.string(),
  数量: z.number(),
  单位: z.string(),
  备注: z.string(),
})

export type ProcessingOrderPrintItem = z.infer<
  typeof processingOrderPrintItemSchema
>

export const processingOrderPrintResponseSchema = z.object({
  code: z.number(),
  msg: z.string(),
  data: z
    .object({
      工单编号: z.string(),
      客户名称: z.string(),
      items: z.array(processingOrderPrintItemSchema),
      total_items: z.number(),
      total_pages: z.number(),
    })
    .nullable(),
})

export type ProcessingOrderPrintResponse = z.infer<
  typeof processingOrderPrintResponseSchema
>

export const orderItemListResponseSchema = z.object({
  data: z.array(orderItemSchema),
  count: z.number(),
})

export type OrderItemListResponse = z.infer<typeof orderItemListResponseSchema>

export const createOrderItemSchema = z.object({
  oid: z.number(),
  订单编号: z.string(),
  合同编号: z.string(),
  规格: z.string(),
  产品类型: z.string(),
  型号: z.string(),
  数量: z.number(),
  单位: z.string(),
  销售单价: z.number(),
  备注: z.string().optional().default(''),
  发货状态: z.number().optional().default(0),
  客户物料编号: z.string().optional().default(''),
  外购: z.boolean().optional().default(false),
})

export type CreateOrderItem = z.infer<typeof createOrderItemSchema>

// ==================== 客户模块 (Customer) ====================

export const customerSchema = z.object({
  id: z.number(),
  客户名称: z.string(),
  简称: z.string(),
  联系人: z.string(),
  联系电话: z.string(),
  手机: z.string(),
  结算方式: z.string(),
  是否含税: z.boolean(),
  对账时间: z.string(),
  开票时间: z.string(),
  结算周期: z.string(),
  业务负责人: z.string(),
  送货单版本: z.string(),
  收货地址: z.string(),
  备注: z.string(),
  状态: z.string(),
  status: z.string().optional(),
  create_at: z.string(),
  update_at: z.string(),
})

export type Customer = z.infer<typeof customerSchema>

export const customerListParamsSchema = paginationParamsSchema.extend({
  query: z.string().optional(),
  customer_name: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  settlement: z.string().optional(),
  状态: z.string().optional(),
})

export type CustomerListParams = z.infer<typeof customerListParamsSchema>

export const customerListResponseSchema = z.object({
  data: z.array(customerSchema),
  count: z.number(),
})

export type CustomerListResponse = z.infer<typeof customerListResponseSchema>

export const customerNamesResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      客户名称: z.string(),
    })
  ),
})

export type CustomerNamesResponse = z.infer<typeof customerNamesResponseSchema>

export const createCustomerSchema = z.object({
  客户名称: z.string(),
  简称: z.string().optional().default(''),
  联系人: z.string().optional().default(''),
  联系电话: z.string().optional().default(''),
  手机: z.string().optional().default(''),
  结算方式: z.string().optional().default('月结'),
  是否含税: z.boolean().optional().default(true),
  对账时间: z.string().optional().default(''),
  开票时间: z.string().optional().default(''),
  结算周期: z.string().optional().default(''),
  业务负责人: z.string().optional().default(''),
  送货单版本: z.string().optional().default(''),
  收货地址: z.string().optional().default(''),
  备注: z.string().optional().default(''),
  状态: z.string().optional().default('活跃'),
})

export type CreateCustomer = z.infer<typeof createCustomerSchema>

export const updateCustomerSchema = createCustomerSchema.partial()

export type UpdateCustomer = z.infer<typeof updateCustomerSchema>

// ==================== 编号生成模块 (Code) ====================

export const codeGenerateParamsSchema = z.object({
  prefix: z.string(),
})

export type CodeGenerateParams = z.infer<typeof codeGenerateParamsSchema>

export const codeGenerateResponseSchema = z.object({
  data: z.object({
    code: z.string(),
  }),
})

export type CodeGenerateResponse = z.infer<typeof codeGenerateResponseSchema>

// ==================== 订单统计模块 (OrderStats) ====================

export const salesStatsResponseSchema = z.object({
  data: z.object({
    totalOrders: z.number(),
    totalAmount: z.number(),
    avgOrderValue: z.number(),
  }),
})

export type SalesStatsResponse = z.infer<typeof salesStatsResponseSchema>

export const recentOrdersResponseSchema = z.object({
  data: z.array(orderSchema),
})

export type RecentOrdersResponse = z.infer<typeof recentOrdersResponseSchema>

export const salesTrendParamsSchema = z.object({
  period: z.string(),
})

export type SalesTrendParams = z.infer<typeof salesTrendParamsSchema>

export const salesTrendResponseSchema = z.object({
  data: z.array(
    z.object({
      date: z.string(),
      amount: z.number(),
    })
  ),
})

export type SalesTrendResponse = z.infer<typeof salesTrendResponseSchema>

// ==================== 发货模块 (Shipping) ====================

export const shippingSchema = z.object({
  id: z.number(),
  发货单号: z.string(),
  快递单号: z.string(),
  快递公司: z.string().optional(),
  客户名称: z.string(),
  发货日期: z.string().optional(),
})

export type Shipping = z.infer<typeof shippingSchema>

export const unshippedItemSchema = z.object({
  id: z.number(),
  订单编号: z.string(),
  客户名称: z.string(),
  规格: z.string(),
  产品类型: z.string(),
  型号: z.string(),
  数量: z.number(),
  单位: z.string(),
  交货日期: z.string(),
  ship_id: z.string().nullable(),
  合同编号: z.string().optional(),
  客户物料编号: z.string().optional(),
  备注: z.string().optional(),
  销售单价: z.number().optional(),
  金额: z.number().optional(),
  发货单号: z.string().optional(),
  快递单号: z.string().optional(),
})

export type UnshippedItem = z.infer<typeof unshippedItemSchema>

export const shippingListParamsSchema = paginationParamsSchema.extend({
  query: z.string().optional(),
  发货单号: z.string().optional(),
  快递单号: z.string().optional(),
  快递公司: z.string().optional(),
  客户名称: z.string().optional(),
  开始日期: z.string().optional(),
  结束日期: z.string().optional(),
  all: z.boolean().optional(),
})

export type ShippingListParams = z.infer<typeof shippingListParamsSchema>

export const shippingListResponseSchema = z.object({
  data: z.array(shippingSchema),
  count: z.number(),
})

export type ShippingListResponse = z.infer<typeof shippingListResponseSchema>

export const markShippedSchema = z.object({
  ids: z.array(z.number()),
  发货单号: z.string(),
  快递单号: z.string(),
  快递公司: z.string().optional(),
})

export type MarkShipped = z.infer<typeof markShippedSchema>

export const createShippingSchema = z.object({
  order_ids: z.array(z.number()),
  发货单号: z.string(),
  快递单号: z.string(),
  快递公司: z.string().optional(),
})

export type CreateShipping = z.infer<typeof createShippingSchema>

// ==================== 报价模块 (Quote) ====================

export const quoteSchema = z.object({
  id: z.number(),
  客户名称: z.string(),
  报价单号: z.string(),
  报价日期: z.string(),
  报价项目: z.string().optional(),
})

export type Quote = z.infer<typeof quoteSchema>

export const quoteItemSchema = z.object({
  id: z.number().optional(),
  客户物料编码: z.string().optional(),
  客户物料名称: z.string().optional(),
  客户规格型号: z.string().optional(),
  嘉尼索规格: z.string(),
  嘉尼索型号: z.string(),
  单位: z.string().optional(),
  数量: z.number(),
  未税单价: z.number().optional(),
  含税单价: z.number(),
  含税总价: z.number(),
})

export type QuoteItem = z.infer<typeof quoteItemSchema>

export const quoteWithItemsSchema = quoteSchema.extend({
  items: z.array(quoteItemSchema).optional(),
})

export type QuoteWithItems = z.infer<typeof quoteWithItemsSchema>

export const quoteListParamsSchema = paginationParamsSchema.extend({
  query: z.string().optional(),
  customer_name: z.string().optional(),
})

export type QuoteListParams = z.infer<typeof quoteListParamsSchema>

export const quoteListResponseSchema = z.object({
  data: z.array(quoteSchema),
  count: z.number(),
})

export type QuoteListResponse = z.infer<typeof quoteListResponseSchema>

export const createQuoteSchema = z.object({
  客户名称: z.string(),
  报价单号: z.string(),
  报价日期: z.string(),
  报价项目: z.string().optional(),
})

export type CreateQuote = z.infer<typeof createQuoteSchema>

export const updateQuoteSchema = createQuoteSchema.partial()

export type UpdateQuote = z.infer<typeof updateQuoteSchema>

// ==================== 报表模块 (Report) ====================

export const monthlyReportParamsSchema = z.object({
  year: z.coerce.number(),
  month: z.coerce.number(),
})

export type MonthlyReportParams = z.infer<typeof monthlyReportParamsSchema>

export const customerYearlyReportParamsSchema = z.object({
  year: z.coerce.number(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
})

export type CustomerYearlyReportParams = z.infer<
  typeof customerYearlyReportParamsSchema
>

export const industryReportParamsSchema = z.object({
  year: z.coerce.number(),
  month: z.coerce.number().optional(),
  industry: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
})

export type IndustryReportParams = z.infer<typeof industryReportParamsSchema>

export const productReportParamsSchema = z.object({
  year: z.coerce.number(),
  month: z.coerce.number().optional(),
  product_type: z.string().optional(),
  spec: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
})

export type ProductReportParams = z.infer<typeof productReportParamsSchema>

export const productTypesResponseSchema = z.object({
  data: z.array(
    z.object({
      产品类型: z.string(),
    })
  ),
})

export type ProductTypesResponse = z.infer<typeof productTypesResponseSchema>

// ==================== 用户模块 (User) ====================

export const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])

export type UserStatus = z.infer<typeof userStatusSchema>

export const userRoleSchema = z.union([
  z.literal('superadmin'),
  z.literal('admin'),
  z.literal('cashier'),
  z.literal('manager'),
])

export type UserRole = z.infer<typeof userRoleSchema>

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  role: userRoleSchema,
  status: userStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
})

export type User = z.infer<typeof userSchema>

export const userListParamsSchema = paginationParamsSchema.extend({
  search: z.string().optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
})

export type UserListParams = z.infer<typeof userListParamsSchema>

export const userListResponseSchema = z.object({
  data: z.array(userSchema),
  count: z.number(),
})

export type UserListResponse = z.infer<typeof userListResponseSchema>

export const createUserSchema = z.object({
  username: z.string(),
  password: z.string().min(6).max(100),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: userRoleSchema,
})

export type CreateUser = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  id: z.number(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
})

export type UpdateUser = z.infer<typeof updateUserSchema>

// ==================== 打印模块 (Print) ====================

export const printPreviewSchema = z.object({
  html: z.string(),
  title: z.string(),
})

export type PrintPreview = z.infer<typeof printPreviewSchema>

// ==================== 字典模块 (Dict) ====================

export const dictTypeSchema = z.object({
  id: z.number(),
  dict_name: z.string(),
  dict_type: z.string(),
  available: z.boolean(),
  description: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export type DictType = z.infer<typeof dictTypeSchema>

export const dictDataSchema = z.object({
  id: z.number(),
  dict_sort: z.number(),
  dict_label: z.string(),
  dict_value: z.string(),
  dict_type: z.string(),
  css_class: z.string().nullable(),
  list_class: z.string().nullable(),
  is_default: z.boolean(),
  available: z.boolean(),
  description: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export type DictData = z.infer<typeof dictDataSchema>

export const dictTypeListResponseSchema = z.object({
  data: z.array(dictTypeSchema),
})

export type DictTypeListResponse = z.infer<typeof dictTypeListResponseSchema>

export const dictDataListResponseSchema = z.object({
  data: z.array(dictDataSchema),
})

export type DictDataListResponse = z.infer<typeof dictDataListResponseSchema>

export const createDictTypeSchema = z.object({
  dict_name: z.string(),
  dict_type: z.string(),
  description: z.string().optional(),
  available: z.boolean().optional().default(true),
})

export type CreateDictType = z.infer<typeof createDictTypeSchema>

export const updateDictTypeSchema = z.object({
  dict_name: z.string().optional(),
  dict_type: z.string().optional(),
  description: z.string().optional(),
  available: z.boolean().optional(),
})

export type UpdateDictType = z.infer<typeof updateDictTypeSchema>

export const createDictDataSchema = z.object({
  dict_label: z.string(),
  dict_value: z.string(),
  dict_type: z.string(),
  dict_sort: z.number().optional(),
  css_class: z.string().optional(),
  list_class: z.string().optional(),
  is_default: z.boolean().optional().default(false),
  description: z.string().optional(),
  available: z.boolean().optional().default(true),
})

export type CreateDictData = z.infer<typeof createDictDataSchema>

export const updateDictDataSchema = z.object({
  dict_label: z.string().optional(),
  dict_value: z.string().optional(),
  dict_type: z.string().optional(),
  dict_sort: z.number().optional(),
  css_class: z.string().optional(),
  list_class: z.string().optional(),
  is_default: z.boolean().optional(),
  description: z.string().optional(),
  available: z.boolean().optional(),
})

export type UpdateDictData = z.infer<typeof updateDictDataSchema>

// ==================== 认证模块 (Auth) ====================

export const loginParamsSchema = z.object({
  username: z.string(),
  password: z.string(),
})

export type LoginParams = z.infer<typeof loginParamsSchema>

export const loginResponseSchema = z.object({
  data: z.object({
    token: z.string(),
  }),
})

export type LoginResponse = z.infer<typeof loginResponseSchema>

export const userInfoResponseSchema = z.object({
  data: userSchema,
})

export type UserInfoResponse = z.infer<typeof userInfoResponseSchema>

// ==================== 通用响应 ====================

export const apiResponseSchema = z.object({
  code: z.number(),
  msg: z.string(),
  data: z.unknown().optional(),
})

export type ApiResponse = z.infer<typeof apiResponseSchema>
