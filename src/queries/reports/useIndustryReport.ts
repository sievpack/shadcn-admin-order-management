import { useQuery } from '@tanstack/react-query'
import { reportAPI } from '@/lib/api'
import { reportKeys } from './keys'

interface UseIndustryReportOptions {
  industry: string
  year: number
  month: number
  page?: number
  limit?: number
  enabled?: boolean
  refreshKey?: number
}

export function useIndustryReport({
  industry,
  year,
  month,
  page = 1,
  limit = 10,
  enabled = true,
  refreshKey = 0,
}: UseIndustryReportOptions) {
  return useQuery({
    queryKey: reportKeys.industry(
      { industry, year, month, page, limit },
      refreshKey
    ),
    queryFn: () =>
      reportAPI.getIndustryReport({
        industry,
        year,
        month,
        page,
        limit,
      }),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}

export function useIndustryStats() {
  return useQuery({
    queryKey: reportKeys.industryStats(),
    queryFn: () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      return reportAPI.getIndustryReport({
        industry: '',
        year,
        month,
        page: 1,
        limit: 10,
      })
    },
  })
}
