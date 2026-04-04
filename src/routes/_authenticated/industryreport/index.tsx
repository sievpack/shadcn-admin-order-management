import { createFileRoute } from '@tanstack/react-router'
import { IndustryReport } from '@/features/reports/IndustryReport'

export const Route = createFileRoute('/_authenticated/industryreport/')({
  component: IndustryReport,
})
