import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderListAPI } from '@/lib/api'
import { orderKeys } from './keys'

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => orderListAPI.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
    onError: (error) => {
      console.error('删除订单失败:', error)
    },
  })
}
