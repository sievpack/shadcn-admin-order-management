import axios from 'axios'

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

export const orderAPI = {
  getOrders: (params?: any) => api.get('/order/data', { params }),
  getAllOrders: () => api.get('/order/all'),
  getAllOrderItems: () => api.get('/order/all-items'),
  getOrderItems: (id: number, params?: any) => api.get(`/order/items/${id}`, { params }),
  updateOrder: (data: any) => api.put('/order/update_order', data),
  deleteOrderItem: (id: number) => api.delete(`/order/remove/${id}`),
  updateOrderItem: (data: any) => api.put('/order/update', data),
  deleteOrder: (id: number) => api.delete(`/order/delete/${id}`),
  generateOrderId: () => api.get('/order/generate_order_id'),
  createOrder: (data: any) => api.post('/order/create', data),
  createOrderItem: (data: any) => api.post('/order/create_item', data),
  getSalesStats: () => api.get('/order/stats'),
  getSalesTrend: (period: string) => api.get('/order/sales-trend', { params: { period } }),
  getShippingList: (params?: any) => api.get('/order/shipping/list', { params }),
  deleteShipping: (shippingNumber: string, expressNumber: string) => api.delete('/order/shipping/delete', { params: { 发货单号: shippingNumber, 快递单号: expressNumber } }),
}

export const authAPI = {
  login: (data: { username: string; password: string }) => {
    return api.post('/auth/login', `username=${encodeURIComponent(data.username)}&password=${encodeURIComponent(data.password)}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },
  logout: () => api.post('/auth/logout'),
  getUserInfo: () => api.get('/auth/me'),
}

export const customerAPI = {
  getCustomers: (params?: any) => api.get('/customer/data', { params }),
  getCustomerDetail: (id: number) => api.get('/customer/data', { params: { query: 'detail', id } }),
  getCustomerNames: () => api.get('/customer/names'),
  createCustomer: (data: any) => api.post('/customer/create', data),
  updateCustomer: (data: any) => api.put('/customer/update', data),
  deleteCustomer: (id: number) => api.delete(`/customer/delete/${id}`),
}

export const quoteAPI = {
  getQuotes: (params?: any) => api.get('/quote/data', { params }),
  getQuoteDetail: (id: number) => api.get('/quote/data', { params: { query: 'detail', id } }),
  createQuote: (data: any) => api.post('/quote/create', data),
  updateQuote: (data: any) => api.put('/quote/update', data),
  deleteQuote: (id: number) => api.delete(`/quote/delete/${id}`),
}

export const reportAPI = {
  getMonthlyReport: (params?: any) => api.get('/report/monthly', { params }),
  getCustomerYearlyReport: (params?: any) => api.get('/report/customer-yearly', { params }),
  getIndustryReport: (params?: any) => api.get('/report/industry', { params }),
  exportIndustryReport: (params?: any) => api.get('/report/industry/export', { params, responseType: 'blob' }),
  getProductReport: (params?: any) => api.get('/report/product', { params }),
  exportProductReport: (params?: any) => api.get('/report/product/export', { params, responseType: 'blob' }),
  getProductTypes: () => api.get('/report/product/types'),
  getProductDetail: (params?: any) => api.get('/report/product/detail', { params }),
}

export default api
