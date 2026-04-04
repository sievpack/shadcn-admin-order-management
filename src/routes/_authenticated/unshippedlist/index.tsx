import { createFileRoute } from '@tanstack/react-router'
import { UnshippedList } from '@/features/shipping/UnshippedList'

export const Route = createFileRoute('/_authenticated/unshippedlist/')({
  component: UnshippedList,
})
