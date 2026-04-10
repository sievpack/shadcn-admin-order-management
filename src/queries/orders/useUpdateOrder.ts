import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderListAPI } from '@/lib/api'
import type { UpdateOrder } from '@/lib/api-types'
import { orderKeys } from './keys'

interface UpdateOrderData extends UpdateOrder {
  id: number
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateOrderData) => {
      const response = await orderListAPI.updateOrder(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
    onError: (error) => {
      console.error('更新订单失败:', error)
    },
  })
}
