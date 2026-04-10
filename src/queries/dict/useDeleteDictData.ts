import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dictDataAPI } from '@/lib/api'
import { dictDataKeys } from './keys'

export function useDeleteDictData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => dictDataAPI.deleteData(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictDataKeys.lists() })
    },
    onError: (error) => {
      console.error('删除字典数据失败:', error)
    },
  })
}
