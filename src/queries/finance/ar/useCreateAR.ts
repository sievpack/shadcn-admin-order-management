import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { financeARAPI } from '@/lib/finance-api'

export function useCreateAR() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await financeARAPI.create(data)
      return response.data
    },
    onSuccess: () => {
      toast.success('应收账款创建成功')
    },
    onError: (error) => {
      console.error('创建失败:', error)
      toast.error('创建失败，请稍后重试')
    },
  })
}
