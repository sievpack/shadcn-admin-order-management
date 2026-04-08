import { useQuery } from '@tanstack/react-query'
import { userAPI } from '@/lib/api'
import { userKeys } from './keys'

interface UseUserDetailOptions {
  id: number
  enabled?: boolean
}

export function useUserDetail({ id, enabled = true }: UseUserDetailOptions) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userAPI.getUserDetail(id),
    enabled,
  })
}
