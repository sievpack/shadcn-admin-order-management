import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '@/lib/api'
import { userKeys } from './keys'

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await userAPI.updateUser(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
    onError: (error) => {
      console.error('更新用户失败:', error)
    },
  })
}
