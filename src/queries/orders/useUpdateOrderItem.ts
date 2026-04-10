import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderItemAPI } from '@/lib/api'
import type { CreateOrderItem } from '@/lib/api-types'
import { orderItemKeys } from './keys'

interface UpdateOrderItemData extends CreateOrderItem {
  id: number
}

export function useUpdateOrderItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateOrderItemData) => {
      const response = await orderItemAPI.updateItem(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderItemKeys.allLists() })
    },
    onError: (error) => {
      console.error('更新订单分项失败:', error)
    },
  })
}
