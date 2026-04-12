import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productionPlanAPI } from '@/lib/production-api'
import { productionPlanKeys } from './keys'

export function useRejectProductionPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await productionPlanAPI.reject(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionPlanKeys.lists() })
    },
    onError: (error) => {
      console.error('驳回失败:', error)
    },
  })
}
