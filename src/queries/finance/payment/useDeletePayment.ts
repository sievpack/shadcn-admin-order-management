import { useMutation, useQueryClient } from '@tanstack/react-query'
import { financePaymentAPI } from '@/lib/finance-api'
import { financePaymentKeys } from '../keys'

export function useDeletePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await financePaymentAPI.delete(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financePaymentKeys.lists() })
    },
    onError: (error) => {
      console.error('删除失败:', error)
    },
  })
}
