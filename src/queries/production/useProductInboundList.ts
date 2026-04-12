import { useQuery } from '@tanstack/react-query'
import { productInboundAPI } from '@/lib/production-api'
import { productInboundKeys } from './keys'

interface UseProductInboundListOptions {
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

export function useProductInboundList({
  params = {},
  enabled = true,
  refreshKey = 0,
}: UseProductInboundListOptions = {}) {
  return useQuery({
    queryKey: productInboundKeys.list({ ...params, _refresh: refreshKey }),
    queryFn: () => productInboundAPI.getList(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
