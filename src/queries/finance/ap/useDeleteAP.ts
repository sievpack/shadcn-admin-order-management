import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { financeAPAPI } from '@/lib/finance-api'

export function useDeleteAP() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await financeAPAPI.delete(id)
      return response.data
    },
    onSuccess: () => {
      toast.success('应付账款删除成功')
    },
    onError: (error) => {
      console.error('删除失败:', error)
      toast.error('删除失败，请稍后重试')
    },
  })
}
