import { useMutation, useQueryClient } from '@tanstack/react-query'
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
    },
    onError: (error) => {
      console.error('删除发货项失败:', error)
    },
  })
}
