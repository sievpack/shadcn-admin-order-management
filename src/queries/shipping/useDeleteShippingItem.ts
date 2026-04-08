import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { shippingAPI } from '@/lib/api'
import { shippingKeys } from './keys'

export function useDeleteShippingItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: number) => {
      const response = await shippingAPI.deleteShippingItem(orderId)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.lists() })
      toast.success('发货项删除成功')
    },
    onError: (error) => {
      console.error('删除发货项失败:', error)
      toast.error('删除失败，请稍后重试')
    },
  })
}
