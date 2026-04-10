import { useMutation } from '@tanstack/react-query'
import { financeAPAPI } from '@/lib/finance-api'

export function useDeleteAP() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await financeAPAPI.delete(id)
      return response.data
    },
    onError: (error) => {
      console.error('删除失败:', error)
    },
  })
}
