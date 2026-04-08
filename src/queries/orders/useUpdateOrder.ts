import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
      toast.success('订单更新成功')
    },
    onError: (error) => {
      console.error('更新订单失败:', error)
      toast.error('更新失败，请稍后重试')
    },
  })
}
