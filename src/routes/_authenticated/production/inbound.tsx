import { createFileRoute } from '@tanstack/react-router'
import { ProductInboundList } from '@/features/production'

export const Route = createFileRoute('/_authenticated/production/inbound')({
  component: ProductInboundList,
})
