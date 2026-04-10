import { useMutation } from '@tanstack/react-query'
import { quoteAPI } from '@/lib/api'

export function useUpdateQuote() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await quoteAPI.updateQuote(data)
      return response.data
    },
    onError: (error) => {
      console.error('更新报价单失败:', error)
    },
  })
}
