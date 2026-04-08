import type { z } from 'zod'
import axios from 'axios'
/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
  orderListParamsSchema,
  createOrderSchema,
  updateOrderSchema,
  markShippedSchema,
  codeGenerateParamsSchema,
  orderItemParamsSchema,
  createOrderItemSchema,
  salesTrendParamsSchema,
  shippingListParamsSchema,
  createShippingSchema,
  customerListParamsSchema,
  createCustomerSchema,
  updateCustomerSchema,
  quoteListParamsSchema,
  createQuoteSchema,
  updateQuoteSchema,
  monthlyReportParamsSchema,
  customerYearlyReportParamsSchema,
  industryReportParamsSchema,
  productReportParamsSchema,
  userListParamsSchema,
  createUserSchema,
  updateUserSchema,
  printPreviewSchema,
  createDictTypeSchema,
  updateDictTypeSchema,
  createDictDataSchema,
  updateDictDataSchema,
  loginParamsSchema,
  paginationParamsSchema,
} from './api-types'
import { validateData, validateParams } from './api-validation'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/sign-in'
    }
    return Promise.reject(error)
  }
)

// 订单列表 API
export const orderListAPI = {
  getOrders: (params?: z.infer<typeof orderListParamsSchema>) => {
    const validatedParams = validateParams(
      orderListParamsSchema,
      params,
      'orderListParams'
    )
    return api.get('/order/list/data', { params: validatedParams })
  },
  getAllOrders: () => api.get('/order/list/all'),
  createOrder: (data: z.infer<typeof createOrderSchema>) => {
    return api.post('/order/list/create', data)
  },
  updateOrder: (data: z.infer<typeof updateOrderSchema> & { id: number }) => {
    return api.put('/order/list/update', data)
  },
  deleteOrder: (id: number) => api.delete(`/order/list/delete/${id}`),
  markShipped: (data: z.infer<typeof markShippedSchema>) => {
    return api.post('/order/list/mark-shipped', data)
  },
}

// 编号生成 API
export const codeAPI = {
  generate: (params: z.infer<typeof codeGenerateParamsSchema>) => {
    const validatedParams = validateParams(
      codeGenerateParamsSchema,
      params,
      'codeGenerateParams'
    )
    return api.get('/code/generate-code', { params: validatedParams })
  },
  generateMultiple: (prefixes: string) =>
    api.get('/code/generate-codes', { params: { prefixes } }),
}

// 订单分项 API
export const orderItemAPI = {
  getAllItems: (params?: z.infer<typeof orderItemParamsSchema>) => {
    const validatedParams = validateParams(
      orderItemParamsSchema,
      params,
      'orderItemParams'
    )
    return api.get('/order/item/all', { params: validatedParams })
  },
  getAllItemsNoPagination: () => api.get('/order/item/all-no-pagination'),
  getItemsByOrderId: (orderId: number) =>
    api.get(`/order/item/list/${orderId}`),
  createItem: (data: z.infer<typeof createOrderItemSchema>) => {
    return api.post('/order/item/create', data)
  },
  updateItem: (
    data: z.infer<typeof createOrderItemSchema> & { id: number }
  ) => {
    return api.put('/order/item/update', data)
  },
  deleteItem: (id: number) => api.delete(`/order/item/delete/${id}`),
}

// 订单统计 API
export const orderStatsAPI = {
  getStats: () => api.get('/order/stats/sales-stats'),
  getRecentOrders: () => api.get('/order/stats/recent-orders'),
  getTrend: (params: z.infer<typeof salesTrendParamsSchema>) => {
    const validatedParams = validateParams(
      salesTrendParamsSchema,
      params,
      'salesTrendParams'
    )
    return api.get('/order/stats/sales-trend', { params: validatedParams })
  },
}

// 发货 API
export const shippingAPI = {
  getShippingList: (params?: z.infer<typeof shippingListParamsSchema>) => {
    const validatedParams = validateParams(
      shippingListParamsSchema,
      params,
      'shippingListParams'
    )
    return api.get('/ship/shipping/list', { params: validatedParams })
  },
  getShippingDetail: (shippingNumber: string) =>
    api.get('/ship/shipping/detail', { params: { 发货单号: shippingNumber } }),
  deleteShipping: (shippingNumber: string, expressNumber: string) =>
    api.delete('/ship/shipping/delete', {
      params: { 发货单号: shippingNumber, 快递单号: expressNumber },
    }),
  deleteShippingItem: (orderId: number) =>
    api.delete('/ship/shipping/delete-item', { params: { order_id: orderId } }),
  createShipping: (data: z.infer<typeof createShippingSchema>) => {
    return api.post('/ship/shipping/create', data)
  },
}

// 保持向后兼容
export const orderAPI = {
  // 订单列表
  getOrders: orderListAPI.getOrders,
  getAllOrders: orderListAPI.getAllOrders,
  createOrder: orderListAPI.createOrder,
  updateOrder: orderListAPI.updateOrder,
  deleteOrder: orderListAPI.deleteOrder,
  markShipped: orderListAPI.markShipped,
  generateOrderId: (prefix?: string) =>
    codeAPI.generate({ prefix: prefix || 'DD' }),

  // 订单分项
  getAllOrderItems: orderItemAPI.getAllItemsNoPagination,
  getOrderItems: orderItemAPI.getItemsByOrderId,
  createOrderItem: orderItemAPI.createItem,
  updateOrderItem: orderItemAPI.updateItem,
  deleteOrderItem: orderItemAPI.deleteItem,

  // 统计
  getSalesStats: orderStatsAPI.getStats,
  getSalesTrend: orderStatsAPI.getTrend,

  // 发货
  getShippingList: shippingAPI.getShippingList,
  deleteShipping: shippingAPI.deleteShipping,
}

export const authAPI = {
  login: (data: z.infer<typeof loginParamsSchema>) => {
    const validatedData = validateData(loginParamsSchema, data, 'loginParams')
    return api.post(
      '/auth/login',
      `username=${encodeURIComponent(validatedData.username)}&password=${encodeURIComponent(validatedData.password)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
  },
  logout: () => api.post('/auth/logout'),
  getUserInfo: () => api.get('/auth/me'),
}

export const customerAPI = {
  getCustomers: (params?: z.infer<typeof customerListParamsSchema>) => {
    const validatedParams = validateParams(
      customerListParamsSchema,
      params,
      'customerListParams'
    )
    return api.get('/customer/data', { params: validatedParams })
  },
  getCustomerDetail: (id: number) =>
    api.get('/customer/data', { params: { query: 'detail', id } }),
  getCustomerNames: () => api.get('/customer/names'),
  createCustomer: (data: z.infer<typeof createCustomerSchema>) => {
    return api.post('/customer/create', data)
  },
  updateCustomer: (
    data: z.infer<typeof updateCustomerSchema> & { id: number }
  ) => {
    return api.put('/customer/update', data)
  },
  deleteCustomer: (id: number) => api.delete(`/customer/delete/${id}`),
}

export const quoteAPI = {
  getQuotes: (params?: z.infer<typeof quoteListParamsSchema>) => {
    const validatedParams = validateParams(
      quoteListParamsSchema,
      params,
      'quoteListParams'
    )
    return api.get('/quote/data', { params: validatedParams })
  },
  getQuoteDetail: (id: number) =>
    api.get('/quote/data', { params: { query: 'detail', id } }),
  createQuote: (data: z.infer<typeof createQuoteSchema>) => {
    return api.post('/quote/create', data)
  },
  updateQuote: (data: z.infer<typeof updateQuoteSchema> & { id: number }) => {
    return api.put('/quote/update', data)
  },
  deleteQuote: (id: number) => api.delete(`/quote/delete/${id}`),
}

export const reportAPI = {
  getMonthlyReport: (params: z.infer<typeof monthlyReportParamsSchema>) => {
    const validatedParams = validateParams(
      monthlyReportParamsSchema,
      params,
      'monthlyReportParams'
    )
    return api.get('/report/monthly', { params: validatedParams })
  },
  getCustomerYearlyReport: (
    params: z.infer<typeof customerYearlyReportParamsSchema>
  ) => {
    const validatedParams = validateParams(
      customerYearlyReportParamsSchema,
      params,
      'customerYearlyReportParams'
    )
    return api.get('/report/customer-yearly', { params: validatedParams })
  },
  getCustomerYearlyShipmentReport: (
    params: z.infer<typeof customerYearlyReportParamsSchema>
  ) => {
    const validatedParams = validateParams(
      customerYearlyReportParamsSchema,
      params,
      'customerYearlyReportParams'
    )
    return api.get('/report/customer-yearly/shipment', {
      params: validatedParams,
    })
  },
  getIndustryReport: (params: z.infer<typeof industryReportParamsSchema>) => {
    const validatedParams = validateParams(
      industryReportParamsSchema,
      params,
      'industryReportParams'
    )
    return api.get('/report/industry', { params: validatedParams })
  },
  exportIndustryReport: (
    params: z.infer<typeof industryReportParamsSchema>
  ) => {
    const validatedParams = validateParams(
      industryReportParamsSchema,
      params,
      'industryReportParams'
    )
    return api.get('/report/industry/export', {
      params: validatedParams,
      responseType: 'blob',
    })
  },
  getProductReport: (params: z.infer<typeof productReportParamsSchema>) => {
    const validatedParams = validateParams(
      productReportParamsSchema,
      params,
      'productReportParams'
    )
    return api.get('/report/product', { params: validatedParams })
  },
  exportProductReport: (params: z.infer<typeof productReportParamsSchema>) => {
    const validatedParams = validateParams(
      productReportParamsSchema,
      params,
      'productReportParams'
    )
    return api.get('/report/product/export', {
      params: validatedParams,
      responseType: 'blob',
    })
  },
  getIndustryReportData: (
    params: z.infer<typeof industryReportParamsSchema>
  ) => {
    const validatedParams = validateParams(
      industryReportParamsSchema,
      params,
      'industryReportParams'
    )
    return api.get('/report/industry/export-data', { params: validatedParams })
  },
  getProductReportData: (params: z.infer<typeof productReportParamsSchema>) => {
    const validatedParams = validateParams(
      productReportParamsSchema,
      params,
      'productReportParams'
    )
    return api.get('/report/product/export-data', { params: validatedParams })
  },
  getProductTypes: () => api.get('/report/product/types'),
  getProductDetail: (params: z.infer<typeof productReportParamsSchema>) => {
    const validatedParams = validateParams(
      productReportParamsSchema,
      params,
      'productReportParams'
    )
    return api.get('/report/product/detail', { params: validatedParams })
  },
}

export const userAPI = {
  getUsers: (params?: z.infer<typeof userListParamsSchema>) => {
    const validatedParams = validateParams(
      userListParamsSchema,
      params,
      'userListParams'
    )
    return api.get('/user/list', { params: validatedParams })
  },
  getUserDetail: (id: number) => api.get('/user/detail', { params: { id } }),
  createUser: (data: z.infer<typeof createUserSchema>) => {
    return api.post('/user/create', null, {
      params: {
        username: data.username,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        role: data.role,
      },
    })
  },
  updateUser: (data: z.infer<typeof updateUserSchema>) => {
    return api.put('/user/update', null, {
      params: {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        role: data.role,
        status: data.status,
      },
    })
  },
  deleteUser: (id: number) => api.delete(`/user/delete/${id}`),
  resetPassword: (userId: number, newPassword: string) =>
    api.post('/user/reset-password', null, {
      params: { user_id: userId, new_password: newPassword },
    }),
}

export const printAPI = {
  printWorkOrder: (orderId: number) => api.get(`/print/workorder/${orderId}`),
  printDelivery: (shipId: number) => api.get(`/print/delivery/${shipId}`),
  printOrder: (orderId: number) => api.get(`/print/order/${orderId}`),
  printReport: (reportId: number) => api.get(`/print/report/${reportId}`),
  preview: (data: z.infer<typeof printPreviewSchema>, type: string) =>
    api.post(`/print/preview?type=${type}`, data),
  getProcessingPrint: (orderId: number) =>
    api.get(`/order/processing/processing-print/${orderId}`),
}

// 字典管理 API
export const dictTypeAPI = {
  getTypes: (params?: z.infer<typeof paginationParamsSchema>) => {
    const validatedParams = validateParams(
      paginationParamsSchema,
      params,
      'dictTypeParams'
    )
    return api.get('/dict/type', { params: validatedParams })
  },
  getAllTypes: () => api.get('/dict/type/all'),
  createType: (data: z.infer<typeof createDictTypeSchema>) => {
    return api.post('/dict/type', null, { params: data })
  },
  updateType: (id: number, data: z.infer<typeof updateDictTypeSchema>) => {
    return api.put(`/dict/type/${id}`, null, { params: data })
  },
  deleteType: (id: number) => api.delete(`/dict/type/${id}`),
}

export const dictDataAPI = {
  getData: (params?: z.infer<typeof paginationParamsSchema>) => {
    const validatedParams = validateParams(
      paginationParamsSchema,
      params,
      'dictDataParams'
    )
    return api.get('/dict/data', { params: validatedParams })
  },
  getDataByType: (dictType: string) => api.get(`/dict/data/type/${dictType}`),
  createData: (data: z.infer<typeof createDictDataSchema>) => {
    return api.post('/dict/data', null, { params: data })
  },
  updateData: (id: number, data: z.infer<typeof updateDictDataSchema>) => {
    return api.put(`/dict/data/${id}`, null, { params: data })
  },
  deleteData: (id: number) => api.delete(`/dict/data/${id}`),
}

export default api
