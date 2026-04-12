import { useMutation, useQueryClient } from '@tanstack/react-query'
import { qualityInspectionAPI } from '@/lib/production-api'
import { qualityInspectionKeys } from './keys'

export function useDeleteQualityInspection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await qualityInspectionAPI.delete(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qualityInspectionKeys.lists() })
    },
    onError: (error) => {
      console.error('删除失败:', error)
    },
  })
}
