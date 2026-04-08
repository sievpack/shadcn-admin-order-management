import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customerAPI } from '@/lib/api'

export function useCreateCustomer() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await customerAPI.createCustomer(data)
      return response.data
    },
    onSuccess: () => {
      toast.success('客户创建成功')
    },
    onError: (error) => {
      console.error('创建客户失败:', error)
      toast.error('创建失败，请稍后重试')
    },
  })
}
