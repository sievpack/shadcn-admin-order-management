import { createFileRoute } from '@tanstack/react-router'
import { AccountsReceivableList } from '@/features/finance'

export const Route = createFileRoute('/_authenticated/finance/ar')({
  component: AccountsReceivableList,
})
