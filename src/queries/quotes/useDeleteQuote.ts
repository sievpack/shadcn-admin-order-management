import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { quoteAPI } from '@/lib/api'

export function useDeleteQuote() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await quoteAPI.deleteQuote(id)
      return response.data
    },
    onSuccess: () => {
      toast.success('报价单删除成功')
    },
    onError: (error) => {
      console.error('删除报价单失败:', error)
      toast.error('删除失败，请稍后重试')
    },
  })
}
