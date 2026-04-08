import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customerAPI } from '@/lib/api'

export function useDeleteCustomer() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await customerAPI.deleteCustomer(id)
      return response.data
    },
    onSuccess: () => {
      toast.success('客户删除成功')
    },
    onError: (error) => {
      console.error('删除客户失败:', error)
      toast.error('删除失败，请稍后重试')
    },
  })
}
