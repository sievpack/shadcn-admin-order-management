import { useState } from 'react'
import { Plus } from 'lucide-react'
import { financeCollectionAPI } from '@/lib/finance-api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { type CollectionRecord } from './components/collection-columns'
import {
  CollectionAddDialog,
  CollectionDeleteDialog,
} from './components/collection-dialogs'
import { CollectionTable } from './components/collection-table'

export function CollectionRecordList() {
  const [selectedRow, setSelectedRow] = useState<CollectionRecord | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState<Partial<CollectionRecord>>({
    收款方式: '银行转账',
    收款日期: new Date().toISOString().split('T')[0],
    收款金额: 0,
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleDelete = (row: CollectionRecord) => {
    setSelectedRow(row)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedRow) return
    try {
      const response = await financeCollectionAPI.delete(selectedRow.id)
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

  const handleAdd = async () => {
    try {
      setSaveLoading(true)
      const response = await financeCollectionAPI.create(addForm)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '创建成功',
          data: addForm,
        })
        setShowAddDialog(false)
        setAddForm({
          收款方式: '银行转账',
          收款日期: new Date().toISOString().split('T')[0],
          收款金额: 0,
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
      <AppHeader />

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>收款记录</h2>
            <p className='text-muted-foreground'>管理客户收款信息</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus data-icon='inline-start' />
            新增收款
          </Button>
        </div>

        <CollectionTable onDelete={handleDelete} refreshKey={refreshKey} />
      </Main>

      <CollectionAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        addForm={addForm}
        onAddFormChange={setAddForm}
        onSave={handleAdd}
        loading={saveLoading}
      />

      <CollectionDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        record={selectedRow}
        onDelete={handleConfirmDelete}
      />
    </>
  )
}
