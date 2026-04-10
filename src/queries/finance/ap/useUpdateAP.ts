import { useMutation } from '@tanstack/react-query'
import { financeAPAPI } from '@/lib/finance-api'

export function useUpdateAP() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await financeAPAPI.update(data)
      return response.data
    },
    onError: (error) => {
      console.error('更新失败:', error)
    },
  })
}
