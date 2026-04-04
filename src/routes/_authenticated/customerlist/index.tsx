import { createFileRoute } from '@tanstack/react-router'
import { CustomerList } from '@/features/customers/CustomerList'

export const Route = createFileRoute('/_authenticated/customerlist/')({
  component: CustomerList,
})
