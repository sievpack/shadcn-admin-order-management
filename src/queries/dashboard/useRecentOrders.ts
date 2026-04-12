import { useQuery } from '@tanstack/react-query'
import { orderStatsAPI } from '@/lib/api'

export function useRecentOrders() {
  return useQuery({
    queryKey: ['orderStats', 'recentOrders'],
    queryFn: async () => {
      const response = await orderStatsAPI.getRecentOrders()
      if (response.data.code === 0) {
        return response.data.data
      }
      throw new Error(response.data.msg || '获取最近订单失败')
    },
  })
}
