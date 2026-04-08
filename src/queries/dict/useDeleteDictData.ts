import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { dictDataAPI } from '@/lib/api'
import { dictDataKeys } from './keys'

export function useDeleteDictData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => dictDataAPI.deleteData(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictDataKeys.lists() })
      toast.success('字典数据删除成功')
    },
    onError: (error) => {
      console.error('删除字典数据失败:', error)
      toast.error('删除失败，请稍后重试')
    },
  })
}
