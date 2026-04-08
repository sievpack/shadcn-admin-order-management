import { useQuery } from '@tanstack/react-query'
import { orderItemAPI } from '@/lib/api'
import type { OrderItemParams } from '@/lib/api-types'
import { orderItemKeys } from './keys'

interface UseAllOrderItemsOptions {
  params?: Partial<Pick<OrderItemParams, 'page' | 'limit' | 'query'>> & {
    规格?: string
    型号?: string
    产品类型?: string
  }
  enabled?: boolean
}

export function useAllOrderItems({
  params = {},
  enabled = true,
}: UseAllOrderItemsOptions = {}) {
  return useQuery({
    queryKey: orderItemKeys.allList(params),
    queryFn: () => orderItemAPI.getAllItems(params as OrderItemParams),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
