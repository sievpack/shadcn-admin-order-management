import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productInboundAPI } from '@/lib/production-api'
import { productInboundKeys } from './keys'

export function useDeleteProductInbound() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await productInboundAPI.delete(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productInboundKeys.lists() })
    },
    onError: (error) => {
      console.error('删除失败:', error)
    },
  })
}
