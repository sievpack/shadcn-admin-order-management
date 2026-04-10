import { useMutation, useQueryClient } from '@tanstack/react-query'
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
    },
    onError: (error) => {
      console.error('创建字典类型失败:', error)
    },
  })
}
