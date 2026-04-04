import { createFileRoute } from '@tanstack/react-router'
import { ShippingList } from '@/features/shipping/ShippingList'

export const Route = createFileRoute('/_authenticated/shippinglist/')({
  component: ShippingList,
})
