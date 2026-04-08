import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productionOrderAPI } from '@/lib/production-api'
import { productionOrderKeys } from './keys'

export function useDeleteProductionOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => productionOrderAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() })
      toast.success('生产工单删除成功')
    },
    onError: (error) => {
      console.error('删除生产工单失败:', error)
      toast.error('删除失败，请稍后重试')
    },
  })
}
