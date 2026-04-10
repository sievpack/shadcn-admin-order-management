import { useMutation, useQueryClient } from '@tanstack/react-query'
import { shippingAPI } from '@/lib/api'
import { shippingKeys } from './keys'

export function useDeleteShipping() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      shippingNumber,
      expressNumber,
    }: {
      shippingNumber: string
      expressNumber: string
    }) => {
      const response = await shippingAPI.deleteShipping(
        shippingNumber,
        expressNumber
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.lists() })
    },
    onError: (error) => {
      console.error('删除发货单失败:', error)
    },
  })
}
