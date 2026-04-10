import { useMutation } from '@tanstack/react-query'
import { financeARAPI } from '@/lib/finance-api'

export function useCreateAR() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await financeARAPI.create(data)
      return response.data
    },
    onError: (error) => {
      console.error('创建失败:', error)
    },
  })
}
