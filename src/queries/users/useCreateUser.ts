import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '@/lib/api'
import { userKeys } from './keys'

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await userAPI.createUser(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
    onError: (error) => {
      console.error('创建用户失败:', error)
    },
  })
}
