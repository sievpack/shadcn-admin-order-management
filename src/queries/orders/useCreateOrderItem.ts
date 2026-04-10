import { useMutation } from '@tanstack/react-query'
import { orderItemAPI } from '@/lib/api'
import type { CreateOrderItem } from '@/lib/api-types'

interface CreateOrderItemData extends CreateOrderItem {
  oid: number
}

export function useCreateOrderItem() {
  return useMutation({
    mutationFn: async (data: CreateOrderItemData) => {
      const response = await orderItemAPI.createItem(data)
      return response.data
    },
    onError: (error) => {
      console.error('创建订单分项失败:', error)
    },
  })
}
