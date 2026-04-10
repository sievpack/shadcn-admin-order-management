import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '@/lib/api'
import { userKeys } from './keys'

export function useResetPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      newPassword,
    }: {
      userId: number
      newPassword: string
    }) => userAPI.resetPassword(userId, newPassword),
    onError: (error) => {
      console.error('重置密码失败:', error)
    },
  })
}
