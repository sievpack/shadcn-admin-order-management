import { useQuery } from '@tanstack/react-query'
import { shippingAPI } from '@/lib/api'
import { shippingKeys } from './keys'

interface UseShippingDetailOptions {
  shippingNumber: string
  enabled?: boolean
}

export function useShippingDetail({
  shippingNumber,
  enabled = true,
}: UseShippingDetailOptions) {
  return useQuery({
    queryKey: shippingKeys.detail(shippingNumber),
    queryFn: () => shippingAPI.getShippingDetail(shippingNumber),
    enabled,
  })
}
