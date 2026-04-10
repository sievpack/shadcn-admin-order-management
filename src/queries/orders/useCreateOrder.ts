import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderListAPI } from '@/lib/api'
import type { CreateOrder } from '@/lib/api-types'
import { orderKeys } from './keys'

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateOrder) => {
      const response = await orderListAPI.createOrder(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
    onError: (error) => {
      console.error('创建订单失败:', error)
    },
  })
}
