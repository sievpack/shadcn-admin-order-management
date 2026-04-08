import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orderItemAPI } from '@/lib/api'
import type { CreateOrderItem } from '@/lib/api-types'
import { orderItemKeys } from './keys'

interface UpdateOrderItemData extends CreateOrderItem {
  id: number
}

export function useUpdateOrderItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateOrderItemData) => orderItemAPI.updateItem(data),
    onSuccess: () => {
      toast.success('订单分项更新成功')
    },
    onError: (error) => {
      console.error('更新订单分项失败:', error)
      toast.error('更新失败，请稍后重试')
    },
  })
}
