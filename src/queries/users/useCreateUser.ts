import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
      toast.success('用户创建成功')
    },
    onError: (error) => {
      console.error('创建用户失败:', error)
      toast.error('创建失败，请稍后重试')
    },
  })
}
