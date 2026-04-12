import { useQuery } from '@tanstack/react-query'
import { financeCollectionAPI } from '@/lib/finance-api'
import { financeCollectionKeys } from '../keys'

interface UseCollectionListOptions {
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

export function useCollectionList({
  params = {},
  enabled = true,
  refreshKey = 0,
}: UseCollectionListOptions = {}) {
  return useQuery({
    queryKey: financeCollectionKeys.list({ ...params, _refresh: refreshKey }),
    queryFn: () => financeCollectionAPI.getList(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
