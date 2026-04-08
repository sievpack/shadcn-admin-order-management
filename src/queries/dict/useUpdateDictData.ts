import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { dictDataAPI } from '@/lib/api'
import { dictDataKeys } from './keys'

export function useUpdateDictData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await dictDataAPI.updateData(id, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictDataKeys.lists() })
      toast.success('字典数据更新成功')
    },
    onError: (error) => {
      console.error('更新字典数据失败:', error)
      toast.error('更新失败，请稍后重试')
    },
  })
}
