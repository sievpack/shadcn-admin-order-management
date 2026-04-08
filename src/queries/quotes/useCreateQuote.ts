import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { quoteAPI } from '@/lib/api'

export function useCreateQuote() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await quoteAPI.createQuote(data)
      return response.data
    },
    onSuccess: () => {
      toast.success('报价单创建成功')
    },
    onError: (error) => {
      console.error('创建报价单失败:', error)
      toast.error('创建失败，请稍后重试')
    },
  })
}
