import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { orderItemAPI } from '@/lib/api'
import { orderItemKeys } from './keys'

export function useDeleteOrderItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => orderItemAPI.deleteItem(id),
    onSuccess: () => {
      toast.success('订单分项删除成功')
    },
    onError: (error) => {
      console.error('删除订单分项失败:', error)
      toast.error('删除失败，请稍后重试')
    },
  })
}
