import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dictTypeAPI } from '@/lib/api'
import { dictTypeKeys } from './keys'

export function useDeleteDictType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => dictTypeAPI.deleteType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictTypeKeys.lists() })
    },
    onError: (error) => {
      console.error('删除字典类型失败:', error)
    },
  })
}
