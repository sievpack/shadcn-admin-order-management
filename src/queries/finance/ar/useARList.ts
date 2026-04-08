import { useQuery } from '@tanstack/react-query'
import { financeARAPI } from '@/lib/finance-api'
import { financeARKeys } from '../keys'

interface UseARListOptions {
  params?: {
    page?: number
    limit?: number
    query?: string
    status?: string | string[]
    start_date?: string
    end_date?: string
  }
  enabled?: boolean
  refreshKey?: number
}

export function useARList({
  params = {},
  enabled = true,
  refreshKey = 0,
}: UseARListOptions = {}) {
  return useQuery({
    queryKey: financeARKeys.list({ ...params, _refresh: refreshKey }),
    queryFn: () => financeARAPI.getList(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
