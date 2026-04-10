import { useMutation } from '@tanstack/react-query'
import { customerAPI } from '@/lib/api'

export function useCreateCustomer() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await customerAPI.createCustomer(data)
      return response.data
    },
    onError: (error) => {
      console.error('创建客户失败:', error)
    },
  })
}
