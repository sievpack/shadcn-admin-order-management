import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customerAPI } from '@/lib/api'

export function useUpdateCustomer() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await customerAPI.updateCustomer(data)
      return response.data
    },
    onSuccess: () => {
      toast.success('客户更新成功')
    },
    onError: (error) => {
      console.error('更新客户失败:', error)
      toast.error('更新失败，请稍后重试')
    },
  })
}
