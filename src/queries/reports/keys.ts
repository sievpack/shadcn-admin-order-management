export const reportKeys = {
  all: ['reports'] as const,
  monthly: (params?: { year?: number; month?: number; customer?: string }) =>
    [...reportKeys.all, 'monthly', params] as const,
  product: (
    params?: {
      product_type?: string
      year?: number
      month?: number
      page?: number
      limit?: number
    },
    _refresh?: number
  ) => [...reportKeys.all, 'product', params, _refresh] as const,
  productTypes: () => [...reportKeys.all, 'productTypes'] as const,
  productDetail: (params?: {
    product_type?: string
    spec?: string
    year?: number
    month?: number
  }) => [...reportKeys.all, 'productDetail', params] as const,
  industry: (
    params?: {
      industry?: string
      year?: number
      month?: number
      page?: number
      limit?: number
    },
    _refresh?: number
  ) => [...reportKeys.all, 'industry', params, _refresh] as const,
  industryStats: () => [...reportKeys.all, 'industryStats'] as const,
  customerYearly: (
    params?: { year?: number; page?: number; limit?: number },
    _refresh?: number
  ) => [...reportKeys.all, 'customerYearly', params, _refresh] as const,
  customerYearlyShipment: (
    params?: { year?: number; page?: number; limit?: number },
    _refresh?: number
  ) => [...reportKeys.all, 'customerYearlyShipment', params, _refresh] as const,
}
