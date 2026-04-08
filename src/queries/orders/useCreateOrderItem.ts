import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
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
    onSuccess: () => {
      toast.success('订单分项创建成功')
    },
    onError: (error) => {
      console.error('创建订单分项失败:', error)
      toast.error('创建失败，请稍后重试')
    },
  })
}
