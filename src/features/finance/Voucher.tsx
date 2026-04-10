import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { financeVoucherAPI } from '@/lib/finance-api'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { NotificationIcon } from '@/components/notifications/notification-icon'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { type Voucher } from './components/voucher-columns'
import { VoucherAddDialog } from './components/voucher-dialogs'
import { VoucherTable } from './components/voucher-table'

export function VoucherList() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState<Partial<Voucher>>({
    凭证日期: new Date().toISOString().split('T')[0],
    凭证类型: '记账凭证',
    借方金额: 0,
    贷方金额: 0,
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleApprove = async (row: Voucher) => {
    try {
      const response = await financeVoucherAPI.approve(row.id)
      if (response.data.code === 0) {
        toast.success('审核通过')
        setRefreshKey((k) => k + 1)
      } else {
        toast.error(response.data.msg)
      }
    } catch (error) {
      toast.error('审核失败')
    }
  }

  const handleAdd = async () => {
    try {
      setSaveLoading(true)
      const response = await financeVoucherAPI.create(addForm)
      if (response.data.code === 0) {
        toast.success('创建成功')
        setShowAddDialog(false)
        setAddForm({
          凭证日期: new Date().toISOString().split('T')[0],
          凭证类型: '记账凭证',
          借方金额: 0,
          贷方金额: 0,
        })
        setRefreshKey((k) => k + 1)
      } else {
        toast.error(response.data.msg)
      }
    } catch (error) {
      toast.error('创建失败')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <>
      <Header>
        <SearchComponent />
        <div className='ms-auto flex items-center space-x-4'>
          <NotificationIcon />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>凭证管理</h2>
            <p className='text-muted-foreground'>管理会计凭证</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus data-icon='inline-start' />
            新增凭证
          </Button>
        </div>
        <VoucherTable onApprove={handleApprove} refreshKey={refreshKey} />
      </Main>
      <VoucherAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        addForm={addForm}
        onAddFormChange={setAddForm}
        onSave={handleAdd}
        loading={saveLoading}
      />
    </>
  )
}
