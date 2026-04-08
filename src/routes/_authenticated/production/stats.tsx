import { createFileRoute } from '@tanstack/react-router'
import { ProductionStats } from '@/features/production'

export const Route = createFileRoute('/_authenticated/production/stats')({
  component: ProductionStats,
})
