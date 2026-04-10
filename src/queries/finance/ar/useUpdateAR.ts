import { useMutation } from '@tanstack/react-query'
import { financeARAPI } from '@/lib/finance-api'

export function useUpdateAR() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await financeARAPI.update(data)
      return response.data
    },
    onError: (error) => {
      console.error('更新失败:', error)
    },
  })
}
