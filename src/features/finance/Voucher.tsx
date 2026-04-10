import { useState } from 'react'
import { Plus } from 'lucide-react'
import { financeVoucherAPI } from '@/lib/finance-api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
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
        showToastWithData({
          type: 'success',
          title: '审核通过',
          data: response.data,
        })
        setRefreshKey((k) => k + 1)
      } else {
        showToastWithData({
          type: 'error',
          title: '审核失败',
          data: response.data,
        })
      }
    } catch (error) {
      showToastWithData({ type: 'error', title: '审核失败' })
    }
  }

  const handleAdd = async () => {
    try {
      setSaveLoading(true)
      const response = await financeVoucherAPI.create(addForm)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '创建成功',
          data: response.data,
        })
        setShowAddDialog(false)
        setAddForm({
          凭证日期: new Date().toISOString().split('T')[0],
          凭证类型: '记账凭证',
          借方金额: 0,
          贷方金额: 0,
        })
        setRefreshKey((k) => k + 1)
      } else {
        showToastWithData({
          type: 'error',
          title: '创建失败',
          data: response.data,
        })
      }
    } catch (error) {
      showToastWithData({ type: 'error', title: '创建失败' })
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <>
      <AppHeader />
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
