import { useQuery } from '@tanstack/react-query'
import { reportAPI } from '@/lib/api'
import { reportKeys } from './keys'

interface UseProductReportOptions {
  product_type: string
  year: number
  month: number
  page?: number
  limit?: number
  enabled?: boolean
  refreshKey?: number
}

export function useProductReport({
  product_type,
  year,
  month,
  page = 1,
  limit = 10,
  enabled = true,
  refreshKey = 0,
}: UseProductReportOptions) {
  return useQuery({
    queryKey: reportKeys.product(
      { product_type, year, month, page, limit },
      refreshKey
    ),
    queryFn: () =>
      reportAPI.getProductReport({
        product_type,
        year,
        month,
        page,
        limit,
      }),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
