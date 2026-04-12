import { useQuery } from '@tanstack/react-query'
import { qualityInspectionAPI } from '@/lib/production-api'
import { qualityInspectionKeys } from './keys'

interface UseQualityInspectionListOptions {
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

export function useQualityInspectionList({
  params = {},
  enabled = true,
  refreshKey = 0,
}: UseQualityInspectionListOptions = {}) {
  return useQuery({
    queryKey: qualityInspectionKeys.list({ ...params, _refresh: refreshKey }),
    queryFn: () => qualityInspectionAPI.getList(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
