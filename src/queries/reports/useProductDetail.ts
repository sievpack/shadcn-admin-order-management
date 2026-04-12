import { useQuery } from '@tanstack/react-query'
import { reportAPI } from '@/lib/api'
import { reportKeys } from './keys'

interface UseProductDetailOptions {
  product_type: string
  spec: string
  year: number
  month: number
  enabled?: boolean
}

export function useProductDetail({
  product_type,
  spec,
  year,
  month,
  enabled = true,
}: UseProductDetailOptions) {
  return useQuery({
    queryKey: reportKeys.productDetail({ product_type, spec, year, month }),
    queryFn: () =>
      reportAPI.getProductDetail({
        product_type,
        spec,
        year,
        month,
      }),
    enabled,
  })
}
