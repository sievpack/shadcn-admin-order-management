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
}

export function useProductionOrders({
  params = {},
  enabled = true,
}: UseProductionOrdersOptions = {}) {
  return useQuery({
    queryKey: productionOrderKeys.list(params),
    queryFn: () => productionOrderAPI.getList(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
