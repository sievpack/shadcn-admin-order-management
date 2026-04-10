import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productionOrderAPI } from '@/lib/production-api'
import { productionOrderKeys } from './keys'

export function useStartProductionOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => productionOrderAPI.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() })
    },
    onError: (error) => {
      console.error('启动生产工单失败:', error)
    },
  })
}
