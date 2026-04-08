import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { quoteAPI } from '@/lib/api'

export function useUpdateQuote() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await quoteAPI.updateQuote(data)
      return response.data
    },
    onSuccess: () => {
      toast.success('报价单更新成功')
    },
    onError: (error) => {
      console.error('更新报价单失败:', error)
      toast.error('更新失败，请稍后重试')
    },
  })
}
