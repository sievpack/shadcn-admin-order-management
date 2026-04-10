import { useState } from 'react'
import { useQuotes } from '@/queries/quotes/useQuotes'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { QuoteDialogs } from './components/quote-dialogs'
import { QuoteProvider, useQuote } from './components/quote-provider'
import { QuoteTable } from './components/quote-table'

function QuoteListContent() {
  const { setOpen } = useQuote()
  const [refreshKey, setRefreshKey] = useState(0)

  const {
    data: quotesResponse,
    isLoading,
    refetch,
  } = useQuotes({
    params: { query: 'list', page: 1, limit: 100 },
  })

  const quotes = quotesResponse?.data?.data || []

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    refetch()
  }

  return (
    <>
      <AppHeader />

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>客户报价单</h2>
            <p className='text-muted-foreground'>查看和管理客户报价单</p>
          </div>
          <Button onClick={() => setOpen('add')}>
            <Plus data-icon='inline-start' />
            新增报价单
          </Button>
        </div>

        <QuoteTable data={quotes} loading={isLoading} />
      </Main>

      <QuoteDialogs onRefresh={handleRefresh} />
    </>
  )
}

export function QuoteList() {
  return (
    <QuoteProvider>
      <QuoteListContent />
    </QuoteProvider>
  )
}
