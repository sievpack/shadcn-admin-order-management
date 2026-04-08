import api from './api'

export const financeARAPI = {
  getList: (params?: any) => api.get('/finance/ar/list', { params }),
  getDetail: (id: number) => api.get(`/finance/ar/${id}`),
  create: (data: any) => api.post('/finance/ar/create', data),
  update: (data: any) => api.put('/finance/ar/update', data),
  delete: (id: number) => api.delete(`/finance/ar/${id}`),
  getAging: () => api.get('/finance/ar/aging'),
}

export const financeCollectionAPI = {
  getList: (params?: any) => api.get('/finance/collection/list', { params }),
  create: (data: any) => api.post('/finance/collection/create', data),
  delete: (id: number) => api.delete(`/finance/collection/${id}`),
}

export const financeARWriteOffAPI = {
  create: (data: any) => api.post('/finance/ar/write-off', data),
}

export const financeAPAPI = {
  getList: (params?: any) => api.get('/finance/ap/list', { params }),
  create: (data: any) => api.post('/finance/ap/create', data),
  update: (data: any) => api.put('/finance/ap/update', data),
  delete: (id: number) => api.delete(`/finance/ap/${id}`),
  getAging: () => api.get('/finance/ap/aging'),
}

export const financePaymentAPI = {
  getList: (params?: any) => api.get('/finance/payment/list', { params }),
  create: (data: any) => api.post('/finance/payment/create', data),
  delete: (id: number) => api.delete(`/finance/payment/${id}`),
}

export const financeAPWriteOffAPI = {
  create: (data: any) => api.post('/finance/ap/write-off', data),
}

export const financeVoucherAPI = {
  getList: (params?: any) => api.get('/finance/voucher/list', { params }),
  create: (data: any) => api.post('/finance/voucher/create', data),
  approve: (id: number) => api.put(`/finance/voucher/approve/${id}`),
}

export const financeStatsAPI = {
  getIncome: (year?: number) =>
    api.get('/finance/stats/income', { params: { year } }),
}
