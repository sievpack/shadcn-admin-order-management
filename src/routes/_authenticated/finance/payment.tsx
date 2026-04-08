import { createFileRoute } from '@tanstack/react-router'
import { PaymentRecordList } from '@/features/finance'

export const Route = createFileRoute('/_authenticated/finance/payment')({
  component: PaymentRecordList,
})
