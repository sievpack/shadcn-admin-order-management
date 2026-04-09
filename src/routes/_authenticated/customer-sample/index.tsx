import { createFileRoute } from '@tanstack/react-router'
import { CustomerSampleList } from '@/features/customer-sample/CustomerSampleList'

export const Route = createFileRoute('/_authenticated/customer-sample/')({
  component: CustomerSampleList,
})
