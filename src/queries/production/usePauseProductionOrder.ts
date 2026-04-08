import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productionOrderAPI } from '@/lib/production-api'
import { productionOrderKeys } from './keys'

export function usePauseProductionOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => productionOrderAPI.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() })
      toast.success('生产工单已暂停')
    },
    onError: (error) => {
      console.error('暂停生产工单失败:', error)
      toast.error('操作失败，请稍后重试')
    },
  })
}
