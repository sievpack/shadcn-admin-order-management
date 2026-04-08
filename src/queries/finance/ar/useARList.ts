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
}

export function useARList({
  params = {},
  enabled = true,
}: UseARListOptions = {}) {
  return useQuery({
    queryKey: financeARKeys.list(params),
    queryFn: () => financeARAPI.getList(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
