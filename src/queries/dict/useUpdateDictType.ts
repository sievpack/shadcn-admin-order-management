import { useMutation, useQueryClient } from '@tanstack/react-query'
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
    },
    onError: (error) => {
      console.error('更新字典类型失败:', error)
    },
  })
}
