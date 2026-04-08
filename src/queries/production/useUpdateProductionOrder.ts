import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productionOrderAPI } from '@/lib/production-api'
import { productionOrderKeys } from './keys'

export function useUpdateProductionOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await productionOrderAPI.update(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() })
      toast.success('生产工单更新成功')
    },
    onError: (error) => {
      console.error('更新生产工单失败:', error)
      toast.error('更新失败，请稍后重试')
    },
  })
}
