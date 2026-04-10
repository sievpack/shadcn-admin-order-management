import { useMutation } from '@tanstack/react-query'
import { financeAPAPI } from '@/lib/finance-api'

export function useCreateAP() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await financeAPAPI.create(data)
      return response.data
    },
    onError: (error) => {
      console.error('创建失败:', error)
    },
  })
}
