import { useQuery } from '@tanstack/react-query'
import { reportAPI } from '@/lib/api'
import { reportKeys } from './keys'

interface UseMonthlyReportOptions {
  year: number
  month: number
  customer?: string
  enabled?: boolean
}

export function useMonthlyReport({
  year,
  month,
  customer = 'all',
  enabled = true,
}: UseMonthlyReportOptions) {
  return useQuery({
    queryKey: reportKeys.monthly({ year, month, customer }),
    queryFn: () => reportAPI.getMonthlyReport({ year, month, customer }),
    enabled,
  })
}
