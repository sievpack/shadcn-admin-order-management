import { useQuery } from '@tanstack/react-query'
import { orderStatsAPI } from '@/lib/api'

export function useSalesStats() {
  return useQuery({
    queryKey: ['orderStats', 'salesStats'],
    queryFn: async () => {
      const response = await orderStatsAPI.getStats()
      if (response.data.code === 0) {
        return response.data.data
      }
      throw new Error(response.data.msg || '获取销售统计数据失败')
    },
  })
}
