import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
    onSuccess: () => {
      toast.success('密码重置成功')
    },
    onError: (error) => {
      console.error('重置密码失败:', error)
      toast.error('重置失败，请稍后重试')
    },
  })
}
