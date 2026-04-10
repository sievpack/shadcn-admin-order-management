import { useMutation } from '@tanstack/react-query'
import { quoteAPI } from '@/lib/api'

export function useCreateQuote() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await quoteAPI.createQuote(data)
      return response.data
    },
    onError: (error) => {
      console.error('创建报价单失败:', error)
    },
  })
}
