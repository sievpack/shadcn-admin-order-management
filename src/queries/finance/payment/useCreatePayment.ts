import { useMutation, useQueryClient } from '@tanstack/react-query'
import { financePaymentAPI } from '@/lib/finance-api'
import { financePaymentKeys } from '../keys'

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await financePaymentAPI.create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financePaymentKeys.lists() })
    },
    onError: (error) => {
      console.error('创建失败:', error)
    },
  })
}
