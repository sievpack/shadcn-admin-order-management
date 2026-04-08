import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
      toast.success('用户更新成功')
    },
    onError: (error) => {
      console.error('更新用户失败:', error)
      toast.error('更新失败，请稍后重试')
    },
  })
}
