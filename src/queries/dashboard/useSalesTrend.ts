import { useQuery } from '@tanstack/react-query'
import { orderStatsAPI } from '@/lib/api'

export function useSalesTrend(params: { time_range: string }) {
  return useQuery({
    queryKey: ['orderStats', 'salesTrend', params],
    queryFn: async () => {
      const response = await orderStatsAPI.getTrend(params)
      if (response.data.code === 0) {
        return response.data.data
      }
      throw new Error(response.data.msg || '获取销售趋势失败')
    },
  })
}
