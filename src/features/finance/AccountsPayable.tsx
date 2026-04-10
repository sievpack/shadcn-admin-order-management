import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { financeAPAPI } from '@/lib/finance-api'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { type AccountsPayable } from './components/ap-columns'
import {
  APAddDialog,
  APDetailDialog,
  APDeleteDialog,
} from './components/ap-dialogs'
import { APTable } from './components/ap-table'

export function AccountsPayableList() {
  const [selectedRow, setSelectedRow] = useState<AccountsPayable | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState<Partial<AccountsPayable>>({
    付款状态: '未付款',
    账期类型: '月结30天',
    应付金额: 0,
    已付金额: 0,
    应付余额: 0,
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleView = (row: AccountsPayable) => {
    setSelectedRow(row)
    setShowViewDialog(true)
  }

  const handleDelete = (row: AccountsPayable) => {
    setSelectedRow(row)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedRow) return
    try {
      const response = await financeAPAPI.delete(selectedRow.id)
      if (response.data.code === 0) {
        toast.success('删除成功')
        setShowDeleteDialog(false)
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
      const formData = {
        ...addForm,
        应付余额: (addForm.应付金额 || 0) - (addForm.已付金额 || 0),
      }
      const response = await financeAPAPI.create(formData)
      if (response.data.code === 0) {
        toast.success('创建成功')
        setShowAddDialog(false)
        setAddForm({
          付款状态: '未付款',
          账期类型: '月结30天',
          应付金额: 0,
          已付金额: 0,
          应付余额: 0,
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
      <AppHeader />
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>应付账款</h2>
            <p className='text-muted-foreground'>管理供应商应付款信息</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus data-icon='inline-start' />
            新增应付
          </Button>
        </div>
        <APTable
          onView={handleView}
          onDelete={handleDelete}
          refreshKey={refreshKey}
        />
      </Main>
      <APDetailDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        ap={selectedRow}
      />
      <APDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        ap={selectedRow}
        onDelete={handleConfirmDelete}
      />
      <APAddDialog
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
