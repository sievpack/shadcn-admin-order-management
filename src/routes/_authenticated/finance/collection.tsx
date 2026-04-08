import { createFileRoute } from '@tanstack/react-router'
import { CollectionRecordList } from '@/features/finance'

export const Route = createFileRoute('/_authenticated/finance/collection')({
  component: CollectionRecordList,
})
