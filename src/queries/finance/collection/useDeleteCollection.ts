import { useMutation, useQueryClient } from '@tanstack/react-query'
import { financeCollectionAPI } from '@/lib/finance-api'
import { financeCollectionKeys } from '../keys'

export function useDeleteCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await financeCollectionAPI.delete(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeCollectionKeys.lists() })
    },
    onError: (error) => {
      console.error('删除失败:', error)
    },
  })
}
