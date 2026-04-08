import { createFileRoute } from '@tanstack/react-router'
import { TemplateBulkDelete } from '@/template/pages/template-bulk-delete'

export const Route = createFileRoute('/_authenticated/templatebulk/')({
  component: TemplateBulkDelete,
})
