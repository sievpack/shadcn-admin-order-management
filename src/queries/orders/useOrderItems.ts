import { useQuery } from '@tanstack/react-query'
import { orderItemAPI } from '@/lib/api'
import { orderKeys } from './keys'

interface UseOrderItemsOptions {
  orderId: number
  enabled?: boolean
}

export function useOrderItems({
  orderId,
  enabled = true,
}: UseOrderItemsOptions) {
  return useQuery({
    queryKey: orderKeys.items(orderId),
    queryFn: () => orderItemAPI.getItemsByOrderId(orderId),
    enabled,
  })
}
