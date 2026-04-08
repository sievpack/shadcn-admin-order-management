import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { financeAPAPI } from '@/lib/finance-api'

export function useCreateAP() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await financeAPAPI.create(data)
      return response.data
    },
    onSuccess: () => {
      toast.success('应付账款创建成功')
    },
    onError: (error) => {
      console.error('创建失败:', error)
      toast.error('创建失败，请稍后重试')
    },
  })
}
