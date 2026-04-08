import { useQuery } from '@tanstack/react-query'
import { customerAPI } from '@/lib/api'
import { customerKeys } from './keys'

interface UseCustomerDetailOptions {
  id: number
  enabled?: boolean
}

export function useCustomerDetail({
  id,
  enabled = true,
}: UseCustomerDetailOptions) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerAPI.getCustomerDetail(id),
    enabled,
  })
}
