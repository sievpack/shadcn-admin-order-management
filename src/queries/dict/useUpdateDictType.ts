import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { dictTypeAPI } from '@/lib/api'
import { dictTypeKeys } from './keys'

export function useUpdateDictType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await dictTypeAPI.updateType(id, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictTypeKeys.lists() })
      toast.success('字典类型更新成功')
    },
    onError: (error) => {
      console.error('更新字典类型失败:', error)
      toast.error('更新失败，请稍后重试')
    },
  })
}
