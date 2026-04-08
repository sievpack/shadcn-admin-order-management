import { createFileRoute } from '@tanstack/react-router'
import { AccountsPayableList } from '@/features/finance'

export const Route = createFileRoute('/_authenticated/finance/ap')({
  component: AccountsPayableList,
})
