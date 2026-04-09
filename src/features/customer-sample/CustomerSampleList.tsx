import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CustomerSampleDialogs } from './components/customer-sample-dialogs'
import {
  CustomerSampleProvider,
  useCustomerSample,
} from './components/customer-sample-provider'
import { CustomerSampleTable } from './components/customer-sample-table'

function CustomerSampleListContent() {
  const { setOpen } = useCustomerSample()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
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
            <h2 className='text-2xl font-bold tracking-tight'>客户样品</h2>
            <p className='text-muted-foreground'>查看和管理客户样品信息</p>
          </div>
          <Button onClick={() => setOpen('add')}>
            <Plus data-icon='inline-start' />
            新增样品
          </Button>
        </div>

        <CustomerSampleTable refreshKey={refreshKey} />
      </Main>

      <CustomerSampleDialogs onRefresh={handleRefresh} />
    </>
  )
}

export function CustomerSampleList() {
  return (
    <CustomerSampleProvider>
      <CustomerSampleListContent />
    </CustomerSampleProvider>
  )
}
