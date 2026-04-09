import api from './api'

export const codeAPI = {
  generate: (prefix: string) =>
    api.get('/code/generate-code', { params: { prefix } }),
  generateMultiple: (prefixes: string) =>
    api.get('/code/generate-codes', { params: { prefixes } }),
}

export const productionPlanAPI = {
  getList: (params?: any) => api.get('/production/plan/list', { params }),
  getDetail: (id: number) => api.get(`/production/plan/${id}`),
  getOrders: (planId: number) => api.get(`/production/plan/${planId}/orders`),
  create: (data: any) => api.post('/production/plan/create', data),
  update: (data: any) => api.put('/production/plan/update', data),
  approve: (id: number) => api.put(`/production/plan/approve/${id}`),
  reject: (id: number) => api.put(`/production/plan/reject/${id}`),
  delete: (id: number) => api.delete(`/production/plan/${id}`),
  getNames: () => api.get('/production/plan/names'),
  getProductTypes: () => api.get('/production/plan/product-types'),
  getProductModels: () => api.get('/production/plan/product-models'),
}

export const productionOrderAPI = {
  getList: (params?: any) => api.get('/production/order/list', { params }),
  getDetail: (id: number) => api.get(`/production/order/${id}`),
  create: (data: any) => api.post('/production/order/create', data),
  createFromPlan: (data: any) =>
    api.post('/production/order/create-from-plan', data),
  update: (data: any) => api.put('/production/order/update', data),
  start: (id: number) => api.put(`/production/order/start/${id}`),
  finish: (id: number) => api.put(`/production/order/finish/${id}`),
  pause: (id: number) => api.put(`/production/order/pause/${id}`),
  delete: (id: number) => api.delete(`/production/order/${id}`),
  getCodes: () => api.get('/production/order/codes'),
  getLines: () => api.get('/production/order/lines'),
}

export const productionReportAPI = {
  getList: (params?: any) => api.get('/production/report/list', { params }),
  create: (data: any) => api.post('/production/report/create', data),
  delete: (id: number) => api.delete(`/production/report/${id}`),
  getWorkers: () => api.get('/production/report/workers'),
  getStats: () => api.get('/production/report/stats'),
}

export const qualityInspectionAPI = {
  getList: (params?: any) => api.get('/production/qc/list', { params }),
  getDetail: (id: number) => api.get(`/production/qc/${id}`),
  create: (data: any) => api.post('/production/qc/create', data),
  update: (data: any) => api.put('/production/qc/update', data),
  delete: (id: number) => api.delete(`/production/qc/${id}`),
  getInspectors: () => api.get('/production/qc/inspectors'),
  getStats: () => api.get('/production/qc/stats'),
}

export const productInboundAPI = {
  getList: (params?: any) => api.get('/production/inbound/list', { params }),
  getDetail: (id: number) => api.get(`/production/inbound/${id}`),
  create: (data: any) => api.post('/production/inbound/create', data),
  update: (data: any) => api.put('/production/inbound/update', data),
  delete: (id: number) => api.delete(`/production/inbound/${id}`),
  getWarehouses: () => api.get('/production/inbound/warehouses'),
  getStats: () => api.get('/production/inbound/stats'),
}

export const materialConsumptionAPI = {
  getList: (params?: any) => api.get('/production/material/list', { params }),
  create: (data: any) => api.post('/production/material/create', data),
  delete: (id: number) => api.delete(`/production/material/${id}`),
  getMaterials: () => api.get('/production/material/materials'),
  getStats: () => api.get('/production/material/stats'),
}

export const productionStatsAPI = {
  getSummary: () => api.get('/production/stats/summary'),
  getMonthly: (year?: number) =>
    api.get('/production/stats/monthly', { params: { year } }),
  getProduct: () => api.get('/production/stats/product'),
  getLine: () => api.get('/production/stats/line'),
  getQc: () => api.get('/production/stats/qc'),
  getPlanStatus: () => api.get('/production/stats/plan-status'),
  getOrderStatus: () => api.get('/production/stats/order-status'),
}
