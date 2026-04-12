import { useQuery } from '@tanstack/react-query'
import { financeStatsAPI } from '@/lib/finance-api'

export function useFinanceIncome(year?: number) {
  return useQuery({
    queryKey: ['finance', 'stats', 'income', year] as const,
    queryFn: () => financeStatsAPI.getIncome(year),
    staleTime: 1000 * 60,
  })
}
