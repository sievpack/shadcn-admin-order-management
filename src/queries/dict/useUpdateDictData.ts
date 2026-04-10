import { useMutation, useQueryClient } from '@tanstack/react-query'
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
    },
    onError: (error) => {
      console.error('更新字典数据失败:', error)
    },
  })
}
