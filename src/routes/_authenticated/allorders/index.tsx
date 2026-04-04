import { createFileRoute } from '@tanstack/react-router'
import { AllOrders } from '@/features/orders/AllOrders'

export const Route = createFileRoute('/_authenticated/allorders/')({
  component: AllOrders,
})
