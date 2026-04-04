import { createFileRoute } from '@tanstack/react-router'
import { QuoteList } from '@/features/quotes/QuoteList'

export const Route = createFileRoute('/_authenticated/quotelist/')({
  component: QuoteList,
})
