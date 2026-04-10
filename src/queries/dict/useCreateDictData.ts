import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dictDataAPI } from '@/lib/api'
import { dictDataKeys } from './keys'

export function useCreateDictData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await dictDataAPI.createData(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictDataKeys.lists() })
    },
    onError: (error) => {
      console.error('创建字典数据失败:', error)
    },
  })
}
