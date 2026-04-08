import { createFileRoute } from '@tanstack/react-router'
import { Template } from '@/template/pages/template'

export const Route = createFileRoute('/_authenticated/template/')({
  component: Template,
})
