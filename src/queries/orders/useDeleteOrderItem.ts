import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderItemAPI } from '@/lib/api'
import { orderItemKeys } from './keys'

export function useDeleteOrderItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => orderItemAPI.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderItemKeys.allLists() })
    },
    onError: (error) => {
      console.error('删除订单分项失败:', error)
    },
  })
}
