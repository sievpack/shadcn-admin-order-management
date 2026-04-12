import { useMutation, useQueryClient } from '@tanstack/react-query'
import { financePaymentAPI } from '@/lib/finance-api'
import { financePaymentKeys } from '../keys'

export function useUpdatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await financePaymentAPI.update(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financePaymentKeys.lists() })
    },
    onError: (error) => {
      console.error('更新失败:', error)
    },
  })
}
