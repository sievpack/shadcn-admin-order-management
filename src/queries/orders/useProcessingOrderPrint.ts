import { useQuery } from '@tanstack/react-query'
import { printAPI } from '@/lib/api'
import type { ProcessingOrderPrintResponse } from '@/lib/api-types'

export function useProcessingOrderPrint(orderId: number | null) {
  return useQuery({
    queryKey: ['processingOrderPrint', orderId],
    queryFn: async () => {
      if (!orderId) return null
      const response = await printAPI.getProcessingPrint(orderId)
      return response.data as ProcessingOrderPrintResponse
    },
    enabled: !!orderId,
  })
}
