import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { dictTypeAPI } from '@/lib/api'
import { dictTypeKeys } from './keys'

export function useDeleteDictType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => dictTypeAPI.deleteType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictTypeKeys.lists() })
      toast.success('字典类型删除成功')
    },
    onError: (error) => {
      console.error('删除字典类型失败:', error)
      toast.error('删除失败，请稍后重试')
    },
  })
}
