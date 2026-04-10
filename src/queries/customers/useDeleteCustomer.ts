import { useMutation } from '@tanstack/react-query'
import { customerAPI } from '@/lib/api'

export function useDeleteCustomer() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await customerAPI.deleteCustomer(id)
      return response.data
    },
    onError: (error) => {
      console.error('删除客户失败:', error)
    },
  })
}
