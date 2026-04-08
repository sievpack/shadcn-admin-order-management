import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { financeARAPI } from '@/lib/finance-api'

export function useUpdateAR() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await financeARAPI.update(data)
      return response.data
    },
    onSuccess: () => {
      toast.success('应收账款更新成功')
    },
    onError: (error) => {
      console.error('更新失败:', error)
      toast.error('更新失败，请稍后重试')
    },
  })
}
