import { useQuery } from '@tanstack/react-query'
import { authAPI } from '@/lib/api'
import { userKeys } from './keys'

export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: () => authAPI.getUserInfo(),
  })
}
