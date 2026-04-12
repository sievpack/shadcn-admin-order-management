import { useQuery } from '@tanstack/react-query'
import { materialConsumptionAPI } from '@/lib/production-api'
import { materialConsumptionKeys } from './keys'

interface UseMaterialConsumptionListOptions {
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

export function useMaterialConsumptionList({
  params = {},
  enabled = true,
  refreshKey = 0,
}: UseMaterialConsumptionListOptions = {}) {
  return useQuery({
    queryKey: materialConsumptionKeys.list({ ...params, _refresh: refreshKey }),
    queryFn: () => materialConsumptionAPI.getList(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
