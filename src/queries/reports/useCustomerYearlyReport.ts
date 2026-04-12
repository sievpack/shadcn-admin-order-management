import { useQuery } from '@tanstack/react-query'
import { reportAPI } from '@/lib/api'
import { reportKeys } from './keys'

interface UseCustomerYearlyReportOptions {
  year: number
  page?: number
  limit?: number
  enabled?: boolean
  refreshKey?: number
}

export function useCustomerYearlyReport({
  year,
  page = 1,
  limit = 15,
  enabled = true,
  refreshKey = 0,
}: UseCustomerYearlyReportOptions) {
  return useQuery({
    queryKey: reportKeys.customerYearly({ year, page, limit }, refreshKey),
    queryFn: () =>
      reportAPI.getCustomerYearlyReport({
        year,
        page,
        limit,
      }),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}

export function useCustomerYearlyShipmentReport({
  year,
  page = 1,
  limit = 15,
  enabled = true,
  refreshKey = 0,
}: UseCustomerYearlyReportOptions) {
  return useQuery({
    queryKey: reportKeys.customerYearlyShipment(
      { year, page, limit },
      refreshKey
    ),
    queryFn: () =>
      reportAPI.getCustomerYearlyShipmentReport({
        year,
        page,
        limit,
      }),
    enabled,
    placeholderData: (previousData) => previousData,
  })
}
