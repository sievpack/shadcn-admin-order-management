import { createFileRoute } from '@tanstack/react-router'
import { CustomerYearlyReport } from '@/features/reports/CustomerYearlyReport'

export const Route = createFileRoute('/_authenticated/customeryearlyreport/')({
  component: CustomerYearlyReport,
})
