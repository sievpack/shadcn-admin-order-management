import { createFileRoute } from '@tanstack/react-router'
import { ProductReport } from '@/features/reports/ProductReport'

export const Route = createFileRoute('/_authenticated/productreport/')({
  component: ProductReport,
})
