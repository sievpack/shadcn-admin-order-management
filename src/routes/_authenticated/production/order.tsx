import { createFileRoute } from '@tanstack/react-router'
import { ProductionOrderList } from '@/features/production'

export const Route = createFileRoute('/_authenticated/production/order')({
  component: ProductionOrderList,
})
