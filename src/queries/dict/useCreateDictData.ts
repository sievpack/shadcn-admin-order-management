import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
      toast.success('字典数据创建成功')
    },
    onError: (error) => {
      console.error('创建字典数据失败:', error)
      toast.error('创建失败，请稍后重试')
    },
  })
}
