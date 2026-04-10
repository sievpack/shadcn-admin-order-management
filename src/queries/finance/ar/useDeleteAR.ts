import { useMutation } from '@tanstack/react-query'
import { financeARAPI } from '@/lib/finance-api'

export function useDeleteAR() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await financeARAPI.delete(id)
      return response.data
    },
    onError: (error) => {
      console.error('删除失败:', error)
    },
  })
}
