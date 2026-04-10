import { useState } from 'react'
import { Plus } from 'lucide-react'
import { materialConsumptionAPI } from '@/lib/production-api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { NotificationIcon } from '@/components/notifications/notification-icon'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { type MaterialConsumption } from './components/material-consumption-columns'
import {
  MaterialConsumptionDeleteDialog,
  MaterialConsumptionAddDialog,
} from './components/material-consumption-dialogs'
import { MaterialConsumptionTable } from './components/material-consumption-table'

export function MaterialConsumptionList() {
  const [selectedRow, setSelectedRow] = useState<MaterialConsumption | null>(
    null
  )
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState<Partial<MaterialConsumption>>({
    消耗数量: 0,
  })
  const [addLoading, setAddLoading] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)

  const handleDelete = (row: MaterialConsumption) => {
    setSelectedRow(row)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async (row: MaterialConsumption) => {
    try {
      const response = await materialConsumptionAPI.delete(row.id)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '删除成功',
          data: { id: row.id },
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
      setAddLoading(true)
      const response = await materialConsumptionAPI.create(addForm)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '创建成功',
          data: addForm,
        })
        setShowAddDialog(false)
        setAddForm({ 消耗数量: 0 })
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
      setAddLoading(false)
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
            <h2 className='text-2xl font-bold tracking-tight'>物料消耗</h2>
            <p className='text-muted-foreground'>管理物料消耗信息</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus data-icon='inline-start' />
            新增记录
          </Button>
        </div>

        <MaterialConsumptionTable
          onDelete={handleDelete}
          refreshKey={refreshKey}
        />
      </Main>

      <MaterialConsumptionDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        record={selectedRow}
        onDelete={handleConfirmDelete}
      />

      <MaterialConsumptionAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        addForm={addForm}
        onAddFormChange={setAddForm}
        onSave={handleAdd}
        loading={addLoading}
      />
    </>
  )
}
