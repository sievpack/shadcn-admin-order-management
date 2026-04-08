import { useQuery } from '@tanstack/react-query'
import { financeAPAPI } from '@/lib/finance-api'
import { financeAPKeys } from '../keys'

interface UseAPListOptions {
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

export function useAPList({
  params = {},
  enabled = true,
}: UseAPListOptions = {}) {
  return useQuery({
    queryKey: financeAPKeys.list(params),
    queryFn: () => financeAPAPI.getList(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
