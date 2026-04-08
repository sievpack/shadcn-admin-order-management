import { createFileRoute } from '@tanstack/react-router'
import { FinanceStats } from '@/features/finance'

export const Route = createFileRoute('/_authenticated/finance/stats')({
  component: FinanceStats,
})
