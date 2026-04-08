import { useQuery } from '@tanstack/react-query'
import { shippingAPI } from '@/lib/api'
import type { ShippingListParams } from '@/lib/api-types'
import { shippingKeys } from './keys'

interface UseShippingListOptions {
  params?: Partial<ShippingListParams>
  enabled?: boolean
}

export function useShippingList({
  params,
  enabled = true,
}: UseShippingListOptions = {}) {
  return useQuery({
    queryKey: shippingKeys.list(params ?? {}),
    queryFn: () => shippingAPI.getShippingList(params as ShippingListParams),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
