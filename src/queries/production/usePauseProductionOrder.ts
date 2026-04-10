import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productionOrderAPI } from '@/lib/production-api'
import { productionOrderKeys } from './keys'

export function usePauseProductionOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => productionOrderAPI.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() })
    },
    onError: (error) => {
      console.error('暂停生产工单失败:', error)
    },
  })
}
