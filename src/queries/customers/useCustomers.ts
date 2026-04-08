import { useQuery } from '@tanstack/react-query'
import { customerAPI } from '@/lib/api'
import { customerKeys } from './keys'

interface UseCustomersOptions {
  params: {
    query?: string
    search?: string
    status?: string
    settlement?: string
    page: number
    limit: number
  }
  enabled?: boolean
}

export function useCustomers({
  params = {},
  enabled = true,
}: UseCustomersOptions = {}) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerAPI.getCustomers(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
