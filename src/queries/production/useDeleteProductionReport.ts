import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productionReportAPI } from '@/lib/production-api'
import { productionReportKeys } from './keys'

export function useDeleteProductionReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await productionReportAPI.delete(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionReportKeys.lists() })
    },
    onError: (error) => {
      console.error('删除失败:', error)
    },
  })
}
