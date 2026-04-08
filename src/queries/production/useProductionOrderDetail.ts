import { useQuery } from '@tanstack/react-query'
import { productionOrderAPI } from '@/lib/production-api'
import { productionOrderKeys } from './keys'

interface UseProductionOrderDetailOptions {
  id: number
  enabled?: boolean
}

export function useProductionOrderDetail({
  id,
  enabled = true,
}: UseProductionOrderDetailOptions) {
  return useQuery({
    queryKey: productionOrderKeys.detail(id),
    queryFn: () => productionOrderAPI.getDetail(id),
    enabled,
  })
}
