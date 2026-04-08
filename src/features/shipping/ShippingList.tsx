import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ShippingDialogs } from './components/shipping-dialogs'
import { ShippingProvider, useShipping } from './components/shipping-provider'
import type { ShippingItem } from './components/shipping-provider'
import { ShippingTable } from './components/shipping-table'

function ShippingListContent() {
  const { setOpen, setCurrentRow } = useShipping()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const handleEditShipping = useCallback(
    (_id: number, item: ShippingItem) => {
      setCurrentRow(item)
      setOpen('edit')
    },
    [setCurrentRow, setOpen]
  )

  const handleAddItem = useCallback(
    (item: ShippingItem) => {
      setCurrentRow(item)
      setOpen('addItem')
    },
    [setCurrentRow, setOpen]
  )

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
            <h2 className='text-2xl font-bold tracking-tight'>已发货列表</h2>
            <p className='text-muted-foreground'>查看和管理所有发货记录</p>
          </div>
          <Button onClick={() => setOpen('new')}>
            <Plus data-icon='inline-start' />
            新增发货
          </Button>
        </div>

        <ShippingTable
          refreshKey={refreshKey}
          onEditShipping={handleEditShipping}
          onAddItem={handleAddItem}
        />
      </Main>

      <ShippingDialogs onRefresh={handleRefresh} />
    </>
  )
}

export function ShippingList() {
  return (
    <ShippingProvider>
      <ShippingListContent />
    </ShippingProvider>
  )
}
