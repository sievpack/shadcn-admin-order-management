import { useQuery } from '@tanstack/react-query'
import { orderListAPI } from '@/lib/api'
import type { OrderListParams } from '@/lib/api-types'
import { orderKeys } from './keys'

interface UseOrdersOptions {
  params?: OrderListParams
  enabled?: boolean
}

export function useOrders({
  params = {},
  enabled = true,
}: UseOrdersOptions = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderListAPI.getOrders(params),
    enabled,
  })
}
