import { useMutation, useQueryClient } from '@tanstack/react-query'
import { qualityInspectionAPI } from '@/lib/production-api'
import { qualityInspectionKeys } from './keys'

export function useCreateQualityInspection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await qualityInspectionAPI.create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qualityInspectionKeys.lists() })
    },
    onError: (error) => {
      console.error('创建失败:', error)
    },
  })
}
