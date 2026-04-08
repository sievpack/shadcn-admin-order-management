import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productionOrderAPI } from '@/lib/production-api'
import { productionOrderKeys } from './keys'

export function useStartProductionOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => productionOrderAPI.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() })
      toast.success('生产工单已启动')
    },
    onError: (error) => {
      console.error('启动生产工单失败:', error)
      toast.error('操作失败，请稍后重试')
    },
  })
}
