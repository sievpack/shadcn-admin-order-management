import { useQuery } from '@tanstack/react-query'
import { dictDataAPI } from '@/lib/api'
import { dictDataKeys } from './keys'

interface DictDataListParams {
  page?: number
  limit?: number
  search?: string
  dict_type?: string
}

interface UseDictDataOptions {
  params?: DictDataListParams
  enabled?: boolean
}

export function useDictData({
  params = {},
  enabled = true,
}: UseDictDataOptions = {}) {
  return useQuery({
    queryKey: dictDataKeys.list(params),
    queryFn: () => dictDataAPI.getData(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}

export function useDictDataByType(dictType: string, enabled = true) {
  return useQuery({
    queryKey: dictDataKeys.byType(dictType),
    queryFn: () => dictDataAPI.getDataByType(dictType),
    enabled,
  })
}
