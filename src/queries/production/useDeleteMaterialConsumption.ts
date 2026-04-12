import { useMutation, useQueryClient } from '@tanstack/react-query'
import { materialConsumptionAPI } from '@/lib/production-api'
import { materialConsumptionKeys } from './keys'

export function useDeleteMaterialConsumption() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await materialConsumptionAPI.delete(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: materialConsumptionKeys.lists(),
      })
    },
    onError: (error) => {
      console.error('删除失败:', error)
    },
  })
}
