import { useQuery } from '@tanstack/react-query'
import { productionOrderAPI } from '@/lib/production-api'
import { productionOrderKeys } from './keys'

interface ProductionOrderListParams {
  page?: number
  limit?: number
  query?: string
  status?: string[]
  start_date?: string
  end_date?: string
}

interface UseProductionOrdersOptions {
  params?: ProductionOrderListParams
  enabled?: boolean
  refreshKey?: number
}

export function useProductionOrders({
  params = {},
  enabled = true,
  refreshKey = 0,
}: UseProductionOrdersOptions = {}) {
  return useQuery({
    queryKey: [
      ...productionOrderKeys.list(params),
      { _refresh: refreshKey },
    ] as const,
    queryFn: () => productionOrderAPI.getList(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
