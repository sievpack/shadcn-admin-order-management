import { useMutation, useQueryClient } from '@tanstack/react-query'
import { financeCollectionAPI } from '@/lib/finance-api'
import { financeCollectionKeys } from '../keys'

export function useCreateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await financeCollectionAPI.create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeCollectionKeys.lists() })
    },
    onError: (error) => {
      console.error('创建失败:', error)
    },
  })
}
