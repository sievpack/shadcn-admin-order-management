import { useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CustomerDialogs } from './components/customer-dialogs'
import { CustomerProvider, useCustomer } from './components/customer-provider'
import { CustomerTable } from './components/customer-table'

function CustomerListContent() {
  const { setOpen } = useCustomer()

  const handleRefresh = useCallback(() => {}, [])

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
            <h2 className='text-2xl font-bold tracking-tight'>客户资料</h2>
            <p className='text-muted-foreground'>查看和管理客户信息</p>
          </div>
          <Button onClick={() => setOpen('add')}>
            <Plus data-icon='inline-start' />
            新增客户
          </Button>
        </div>

        <CustomerTable onRefresh={handleRefresh} />
      </Main>

      <CustomerDialogs onRefresh={handleRefresh} />
    </>
  )
}

export function CustomerList() {
  return (
    <CustomerProvider>
      <CustomerListContent />
    </CustomerProvider>
  )
}
