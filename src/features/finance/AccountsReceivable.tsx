import { useState } from 'react'
import { Plus, Wand2 } from 'lucide-react'
import { financeARAPI } from '@/lib/finance-api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { type AccountsReceivable } from './components/ar-columns'
import {
  ARDetailDialog,
  ARDeleteDialog,
  AREditDialog,
  ARAddDialog,
} from './components/ar-dialogs'
import { ARTable } from './components/ar-table'
import { AutoARDialog } from './components/auto-ar-dialog'

export function AccountsReceivableList() {
  const [selectedRow, setSelectedRow] = useState<AccountsReceivable | null>(
    null
  )
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showAutoDialog, setShowAutoDialog] = useState(false)
  const [editForm, setEditForm] = useState<Partial<AccountsReceivable>>({})
  const [addForm, setAddForm] = useState<Partial<AccountsReceivable>>({
    收款状态: '未收款',
    账期类型: '月结30天',
    应收金额: 0,
    已收金额: 0,
    应收余额: 0,
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleView = (row: AccountsReceivable) => {
    setSelectedRow(row)
    setShowViewDialog(true)
  }

  const handleEdit = (row: AccountsReceivable) => {
    setSelectedRow(row)
    setEditForm(row)
    setShowEditDialog(true)
  }

  const handleDelete = (row: AccountsReceivable) => {
    setSelectedRow(row)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedRow) return
    try {
      const response = await financeARAPI.delete(selectedRow.id)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '删除成功',
          data: { id: selectedRow.id },
        })
        setShowDeleteDialog(false)
        setRefreshKey((k) => k + 1)
      } else {
        showToastWithData({
          type: 'error',
          title: '删除失败',
          data: { msg: response.data.msg },
        })
      }
    } catch (error: any) {
      showToastWithData({
        type: 'error',
        title: '删除失败',
        data: { error: error.message },
      })
    }
  }

  const handleUpdate = async () => {
    if (!selectedRow) return
    try {
      const updateData = {
        ...editForm,
        应收余额: (editForm.应收金额 || 0) - (editForm.已收金额 || 0),
      }
      const response = await financeARAPI.update({
        id: selectedRow.id,
        ...updateData,
      })
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '更新成功',
          data: updateData,
        })
        setShowEditDialog(false)
        setRefreshKey((k) => k + 1)
      } else {
        showToastWithData({
          type: 'error',
          title: '更新失败',
          data: { msg: response.data.msg },
        })
      }
    } catch (error: any) {
      showToastWithData({
        type: 'error',
        title: '更新失败',
        data: { error: error.message },
      })
    }
  }

  const handleAdd = async () => {
    try {
      setSaveLoading(true)
      const formData = {
        ...addForm,
        应收余额: (addForm.应收金额 || 0) - (addForm.已收金额 || 0),
      }
      const response = await financeARAPI.create(formData)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '创建成功',
          data: formData,
        })
        setShowAddDialog(false)
        setAddForm({
          收款状态: '未收款',
          账期类型: '月结30天',
          应收金额: 0,
          已收金额: 0,
          应收余额: 0,
        })
        setRefreshKey((k) => k + 1)
      } else {
        showToastWithData({
          type: 'error',
          title: '创建失败',
          data: { msg: response.data.msg },
        })
      }
    } catch (error: any) {
      showToastWithData({
        type: 'error',
        title: '创建失败',
        data: { error: error.message },
      })
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
            <h2 className='text-2xl font-bold tracking-tight'>应收账款</h2>
            <p className='text-muted-foreground'>管理客户应收款信息</p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowAutoDialog(true)}
            >
              <Wand2 className='mr-1 h-4 w-4' data-icon='inline-start' />
              自动应收
            </Button>
            <Button size='sm' onClick={() => setShowAddDialog(true)}>
              <Plus className='mr-1 h-4 w-4' data-icon='inline-start' />
              新增应收
            </Button>
          </div>
        </div>

        <ARTable
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          refreshKey={refreshKey}
        />
      </Main>

      <ARDetailDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        ar={selectedRow}
      />

      <AREditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        ar={selectedRow}
        editForm={editForm}
        onEditFormChange={setEditForm}
        onSave={handleUpdate}
      />

      <ARDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        ar={selectedRow}
        onDelete={handleConfirmDelete}
      />

      <ARAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        addForm={addForm}
        onAddFormChange={setAddForm}
        onSave={handleAdd}
        loading={saveLoading}
      />

      <AutoARDialog
        open={showAutoDialog}
        onOpenChange={setShowAutoDialog}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </>
  )
}
