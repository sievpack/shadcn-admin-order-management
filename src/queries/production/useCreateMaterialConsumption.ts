import { useMutation, useQueryClient } from '@tanstack/react-query'
import { materialConsumptionAPI } from '@/lib/production-api'
import { materialConsumptionKeys } from './keys'

export function useCreateMaterialConsumption() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await materialConsumptionAPI.create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: materialConsumptionKeys.lists(),
      })
    },
    onError: (error) => {
      console.error('创建失败:', error)
    },
  })
}
