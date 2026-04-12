import { useQuery } from '@tanstack/react-query'
import { productionPlanAPI } from '@/lib/production-api'
import { productionPlanKeys } from './keys'

interface UseProductionPlanListOptions {
  params?: {
    page?: number
    limit?: number
    query?: string
    start_date?: string
    end_date?: string
  }
  enabled?: boolean
  refreshKey?: number
}

export function useProductionPlanList({
  params = {},
  enabled = true,
  refreshKey = 0,
}: UseProductionPlanListOptions = {}) {
  return useQuery({
    queryKey: productionPlanKeys.list({ ...params, _refresh: refreshKey }),
    queryFn: () => productionPlanAPI.getList(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
