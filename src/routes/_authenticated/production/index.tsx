import { createFileRoute } from '@tanstack/react-router'
import { ProductionPlanList } from '@/features/production'

export const Route = createFileRoute('/_authenticated/production/')({
  component: ProductionPlanList,
})
