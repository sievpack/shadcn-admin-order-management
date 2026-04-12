import { useQuery } from '@tanstack/react-query'
import { financePaymentAPI } from '@/lib/finance-api'
import { financePaymentKeys } from '../keys'

interface UsePaymentListOptions {
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

export function usePaymentList({
  params = {},
  enabled = true,
  refreshKey = 0,
}: UsePaymentListOptions = {}) {
  return useQuery({
    queryKey: financePaymentKeys.list({ ...params, _refresh: refreshKey }),
    queryFn: () => financePaymentAPI.getList(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
