import { useQuery } from '@tanstack/react-query'
import { reportAPI } from '@/lib/api'
import { reportKeys } from './keys'

export function useProductTypes() {
  return useQuery({
    queryKey: reportKeys.productTypes(),
    queryFn: () => reportAPI.getProductTypes(),
    staleTime: 5 * 60 * 1000,
  })
}
