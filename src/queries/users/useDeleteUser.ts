import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { userAPI } from '@/lib/api'
import { userKeys } from './keys'

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => userAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      toast.success('用户删除成功')
    },
    onError: (error) => {
      console.error('删除用户失败:', error)
      toast.error('删除失败，请稍后重试')
    },
  })
}
