import { useMemo, useEffect } from 'react'
import { useQuotes } from '@/queries/quotes/useQuotes'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { QuoteDialogs } from './components/quote-dialogs'
import { QuoteProvider, useQuote } from './components/quote-provider'
import { type Quote } from './components/quote-provider'
import { QuoteTable } from './components/quote-table'

function QuoteListContent() {
  const {
    data: quotesResponse,
    isLoading,
    refetch,
  } = useQuotes({
    params: { query: 'list', page: 1, limit: 1000 },
  })

  const quotes = useMemo(() => {
    if (!quotesResponse?.data?.data) return []
    const uniqueQuotes: Quote[] = []
    const seenQuoteNumbers = new Set<string>()

    for (const quote of quotesResponse.data.data || []) {
      if (!seenQuoteNumbers.has(quote.报价单号)) {
        seenQuoteNumbers.add(quote.报价单号)
        uniqueQuotes.push(quote)
      }
    }
    return uniqueQuotes
  }, [quotesResponse?.data?.data])

  const { setRefreshData } = useQuote()
  useEffect(() => {
    setRefreshData(() => () => refetch())
  }, [refetch, setRefreshData])

  const handleAddQuote = () => {
    toast.info('添加报价单功能开发中')
  }

  return (
    <>
      <Header>
        <SearchComponent />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>客户报价单</h2>
            <p className='text-muted-foreground'>查看和管理客户报价单</p>
          </div>
          <Button onClick={handleAddQuote}>
            <Plus data-icon='inline-start' />
            新增报价单
          </Button>
        </div>

        <QuoteTable data={quotes} loading={isLoading} />
      </Main>

      <QuoteDialogs />
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
