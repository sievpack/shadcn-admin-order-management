import { createFileRoute } from '@tanstack/react-router'
import { VoucherList } from '@/features/finance'

export const Route = createFileRoute('/_authenticated/finance/voucher')({
  component: VoucherList,
})
