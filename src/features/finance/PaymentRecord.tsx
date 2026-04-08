import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { financePaymentAPI } from '@/lib/finance-api'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { type PaymentRecord } from './components/payment-columns'
import { PaymentAddDialog } from './components/payment-dialogs'
import { PaymentTable } from './components/payment-table'

export function PaymentRecordList() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState<Partial<PaymentRecord>>({
    付款方式: '银行转账',
    付款日期: new Date().toISOString().split('T')[0],
    付款金额: 0,
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleDelete = async (row: PaymentRecord) => {
    try {
      const response = await financePaymentAPI.delete(row.id)
      if (response.data.code === 0) {
        toast.success('删除成功')
        setRefreshKey((k) => k + 1)
      } else {
        toast.error(response.data.msg)
      }
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const handleAdd = async () => {
    try {
      setSaveLoading(true)
      const response = await financePaymentAPI.create(addForm)
      if (response.data.code === 0) {
        toast.success('创建成功')
        setShowAddDialog(false)
        setAddForm({
          付款方式: '银行转账',
          付款日期: new Date().toISOString().split('T')[0],
          付款金额: 0,
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
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>付款记录</h2>
            <p className='text-muted-foreground'>管理供应商付款信息</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus data-icon='inline-start' />
            新增付款
          </Button>
        </div>
        <PaymentTable onDelete={handleDelete} refreshKey={refreshKey} />
      </Main>
      <PaymentAddDialog
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
