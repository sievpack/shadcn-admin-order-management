import { createFileRoute } from '@tanstack/react-router'
import { ProductionReportList } from '@/features/production'

export const Route = createFileRoute('/_authenticated/production/report')({
  component: ProductionReportList,
})
