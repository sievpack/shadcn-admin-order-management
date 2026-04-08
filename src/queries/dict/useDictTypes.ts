import { useQuery } from '@tanstack/react-query'
import { dictTypeAPI } from '@/lib/api'
import { dictTypeKeys } from './keys'

interface DictTypeListParams {
  page?: number
  limit?: number
  search?: string
}

interface UseDictTypesOptions {
  params?: DictTypeListParams
  enabled?: boolean
}

export function useDictTypes({
  params = {},
  enabled = true,
}: UseDictTypesOptions = {}) {
  return useQuery({
    queryKey: dictTypeKeys.list(params),
    queryFn: () => dictTypeAPI.getTypes(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
