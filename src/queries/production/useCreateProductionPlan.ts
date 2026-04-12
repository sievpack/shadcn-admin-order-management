import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productionPlanAPI } from '@/lib/production-api'
import { productionPlanKeys } from './keys'

export function useCreateProductionPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await productionPlanAPI.create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionPlanKeys.lists() })
    },
    onError: (error) => {
      console.error('创建失败:', error)
    },
  })
}
