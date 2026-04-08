import { createFileRoute } from '@tanstack/react-router'
import { MaterialConsumptionList } from '@/features/production'

export const Route = createFileRoute('/_authenticated/production/material')({
  component: MaterialConsumptionList,
})
