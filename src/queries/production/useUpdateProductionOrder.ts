import { useMutation, useQueryClient } from '@tanstack/react-query'
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
    },
    onError: (error) => {
      console.error('更新生产工单失败:', error)
    },
  })
}
