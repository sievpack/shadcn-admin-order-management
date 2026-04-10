import { useMutation } from '@tanstack/react-query'
import { customerAPI } from '@/lib/api'

export function useUpdateCustomer() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await customerAPI.updateCustomer(data)
      return response.data
    },
    onError: (error) => {
      console.error('更新客户失败:', error)
    },
  })
}
