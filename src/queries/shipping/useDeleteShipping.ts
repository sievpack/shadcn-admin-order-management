import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
      toast.success('发货单删除成功')
    },
    onError: (error) => {
      console.error('删除发货单失败:', error)
      toast.error('删除失败，请稍后重试')
    },
  })
}
