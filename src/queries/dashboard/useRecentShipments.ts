import { useQuery } from '@tanstack/react-query'
import { shippingAPI } from '@/lib/api'

export function useRecentShipments() {
  return useQuery({
    queryKey: ['shipping', 'recentShipments'],
    queryFn: async () => {
      const response = await shippingAPI.getShippingList({ page: 1, limit: 5 })
      if (response.data.code === 0) {
        return response.data.data.shipments || []
      }
      throw new Error(response.data.msg || '获取最近发货失败')
    },
  })
}
