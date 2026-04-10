import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '@/lib/api'
import { userKeys } from './keys'

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => userAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
    onError: (error) => {
      console.error('删除用户失败:', error)
    },
  })
}
