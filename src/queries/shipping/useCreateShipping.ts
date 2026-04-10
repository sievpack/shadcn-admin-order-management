import { useMutation, useQueryClient } from '@tanstack/react-query'
import { shippingAPI } from '@/lib/api'
import type { CreateShipping } from '@/lib/api-types'
import { shippingKeys } from './keys'

export function useCreateShipping() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateShipping) => {
      const response = await shippingAPI.createShipping(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.lists() })
    },
    onError: (error) => {
      console.error('创建发货单失败:', error)
    },
  })
}
