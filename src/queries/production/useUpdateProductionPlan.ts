import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productionPlanAPI } from '@/lib/production-api'
import { productionPlanKeys } from './keys'

export function useUpdateProductionPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await productionPlanAPI.update(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionPlanKeys.lists() })
    },
    onError: (error) => {
      console.error('更新失败:', error)
    },
  })
}
