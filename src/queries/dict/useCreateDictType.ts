import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { dictTypeAPI } from '@/lib/api'
import { dictTypeKeys } from './keys'

export function useCreateDictType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await dictTypeAPI.createType(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictTypeKeys.lists() })
      toast.success('字典类型创建成功')
    },
    onError: (error) => {
      console.error('创建字典类型失败:', error)
      toast.error('创建失败，请稍后重试')
    },
  })
}
