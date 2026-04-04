import { createFileRoute } from '@tanstack/react-router'
import { MonthlyReport } from '@/features/reports/MonthlyReport'

export const Route = createFileRoute('/_authenticated/monthlyreport/')({
  component: MonthlyReport,
})
