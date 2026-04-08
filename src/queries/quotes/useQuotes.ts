import type { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { quoteAPI } from '@/lib/api'
import { quoteListParamsSchema } from '@/lib/api-types'
import { quoteKeys } from './keys'

interface UseQuotesOptions {
  params?: z.infer<typeof quoteListParamsSchema>
  enabled?: boolean
}

export function useQuotes({ params, enabled = true }: UseQuotesOptions = {}) {
  return useQuery({
    queryKey: quoteKeys.list(params ?? {}),
    queryFn: () => quoteAPI.getQuotes(params),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
