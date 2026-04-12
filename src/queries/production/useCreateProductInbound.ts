import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productInboundAPI } from '@/lib/production-api'
import { productInboundKeys } from './keys'

export function useCreateProductInbound() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await productInboundAPI.create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productInboundKeys.lists() })
    },
    onError: (error) => {
      console.error('创建失败:', error)
    },
  })
}
