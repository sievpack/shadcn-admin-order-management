import { useQuery } from '@tanstack/react-query'
import { userAPI } from '@/lib/api'
import { userKeys } from './keys'

interface UserListParams {
  page?: number
  limit?: number
  search?: string
  role?: string
  status?: string
}

interface UseUsersOptions {
  params?: UserListParams
  enabled?: boolean
}

export function useUsers({
  params = {},
  enabled = true,
}: UseUsersOptions = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userAPI.getUsers(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
