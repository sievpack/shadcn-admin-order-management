import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { DictDataPage } from '@/features/dict/data'

const dictDataSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  search: z.string().optional().catch(''),
  dict_type: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/dict/data/')({
  validateSearch: dictDataSearchSchema,
  component: () => <DictDataPage />,
})
