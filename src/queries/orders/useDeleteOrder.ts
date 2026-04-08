import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orderListAPI } from '@/lib/api'
import { orderKeys } from './keys'

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => orderListAPI.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      toast.success('订单删除成功')
    },
    onError: (error) => {
      console.error('删除订单失败:', error)
      toast.error('删除失败，请稍后重试')
    },
  })
}
