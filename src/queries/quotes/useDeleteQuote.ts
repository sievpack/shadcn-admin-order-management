import { useMutation } from '@tanstack/react-query'
import { quoteAPI } from '@/lib/api'

export function useDeleteQuote() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await quoteAPI.deleteQuote(id)
      return response.data
    },
    onError: (error) => {
      console.error('删除报价单失败:', error)
    },
  })
}
