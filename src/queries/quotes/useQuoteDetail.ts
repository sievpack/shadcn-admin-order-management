import { useQuery } from '@tanstack/react-query'
import { quoteAPI } from '@/lib/api'
import { quoteKeys } from './keys'

interface UseQuoteDetailOptions {
  id: number
  enabled?: boolean
}

export function useQuoteDetail({ id, enabled = true }: UseQuoteDetailOptions) {
  return useQuery({
    queryKey: quoteKeys.detail(id),
    queryFn: () => quoteAPI.getQuoteDetail(id),
    enabled,
  })
}
