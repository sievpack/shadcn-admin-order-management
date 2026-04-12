import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productionPlanAPI } from '@/lib/production-api'
import { productionPlanKeys } from './keys'

export function useDeleteProductionPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await productionPlanAPI.delete(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionPlanKeys.lists() })
    },
    onError: (error) => {
      console.error('删除失败:', error)
    },
  })
}
