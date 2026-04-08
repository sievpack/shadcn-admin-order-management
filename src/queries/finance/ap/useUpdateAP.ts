import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { financeAPAPI } from '@/lib/finance-api'

export function useUpdateAP() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await financeAPAPI.update(data)
      return response.data
    },
    onSuccess: () => {
      toast.success('应付账款更新成功')
    },
    onError: (error) => {
      console.error('更新失败:', error)
      toast.error('更新失败，请稍后重试')
    },
  })
}
