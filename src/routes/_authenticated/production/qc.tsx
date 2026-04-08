import { createFileRoute } from '@tanstack/react-router'
import { QualityInspectionList } from '@/features/production'

export const Route = createFileRoute('/_authenticated/production/qc')({
  component: QualityInspectionList,
})
