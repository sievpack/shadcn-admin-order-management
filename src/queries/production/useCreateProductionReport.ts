import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productionReportAPI } from '@/lib/production-api'
import { productionReportKeys } from './keys'

export function useCreateProductionReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await productionReportAPI.create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionReportKeys.lists() })
    },
    onError: (error) => {
      console.error('创建失败:', error)
    },
  })
}
