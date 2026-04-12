import { useQuery } from '@tanstack/react-query'
import { productionReportAPI } from '@/lib/production-api'
import { productionReportKeys } from './keys'

interface UseProductionReportListOptions {
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

export function useProductionReportList({
  params = {},
  enabled = true,
  refreshKey = 0,
}: UseProductionReportListOptions = {}) {
  return useQuery({
    queryKey: productionReportKeys.list({ ...params, _refresh: refreshKey }),
    queryFn: () => productionReportAPI.getList(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
