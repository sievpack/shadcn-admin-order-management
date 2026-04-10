import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { dictTypeAPI, dictDataAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { type DictData } from '../data/dict-data-columns'
import { DictDataDialogs } from '../data/dict-data-dialogs'
import { type DictType } from './dict-type-columns'
import { DictTypeDialogs } from './dict-type-dialogs'
import { DictTypeTable } from './dict-type-table'

const route = getRouteApi('/_authenticated/dict/type/')

export function DictTypePage() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<
    'add' | 'edit' | 'delete' | 'view' | 'addData' | 'editData'
  >('add')
  const [selectedDictType, setSelectedDictType] = useState<DictType | null>(
    null
  )
  const [selectedDictData, setSelectedDictData] = useState<DictData | null>(
    null
  )
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAdd = () => {
    setSelectedDictType(null)
    setDialogMode('add')
    setDialogOpen(true)
  }

  const handleView = (row: DictType) => {
    setSelectedDictType(row)
    setDialogMode('view')
    setDialogOpen(true)
  }

  const handleEdit = (row: DictType) => {
    setSelectedDictType(row)
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const handleDelete = (row: DictType) => {
    setSelectedDictType(row)
    setDialogMode('delete')
    setDialogOpen(true)
  }

  const handleAddData = (row: DictType) => {
    setSelectedDictType(row)
    setDialogMode('addData')
    setDialogOpen(true)
  }

  const handleMultiDelete = async (rows: DictType[]) => {
    try {
      await Promise.all(rows.map((row) => dictTypeAPI.deleteType(row.id)))
      showToastWithData({
        type: 'success',
        title: `成功删除 ${rows.length} 条记录`,
        data: { 删除数量: rows.length },
      })
      setRefreshKey((k) => k + 1)
    } catch (error: any) {
      console.error('批量删除失败:', error)
      showToastWithData({
        type: 'error',
        title: '批量删除失败',
        data: { error: error.message },
      })
    }
  }

  const handleEditData = (row: DictData) => {
    setSelectedDictData(row)
    setDialogMode('editData')
    setDialogOpen(true)
  }

  const handleDeleteData = async (row: DictData) => {
    try {
      await dictDataAPI.deleteData(row.id)
      showToastWithData({
        type: 'success',
        title: '删除成功',
        data: { dict_label: row.dict_label },
      })
      setRefreshKey((k) => k + 1)
    } catch (error: any) {
      console.error('删除失败:', error)
      showToastWithData({
        type: 'error',
        title: '删除失败',
        data: { error: error.message },
      })
    }
  }

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <>
      <AppHeader />

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>字典管理</h2>
            <p className='text-muted-foreground'>管理系统字典类型</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus data-icon='inline-end' />
            <span>新增</span>
          </Button>
        </div>
        <DictTypeTable
          search={search as Record<string, unknown>}
          navigate={navigate}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddData={handleAddData}
          onMultiDelete={handleMultiDelete}
          onEditData={handleEditData}
          onDeleteData={handleDeleteData}
          refreshKey={refreshKey}
        />

        <DictTypeDialogs
          open={dialogOpen && dialogMode !== 'editData'}
          onOpenChange={setDialogOpen}
          dictType={selectedDictType}
          onSuccess={handleSuccess}
          mode={dialogMode as 'add' | 'edit' | 'delete' | 'view' | 'addData'}
        />

        <DictDataDialogs
          open={dialogOpen && dialogMode === 'editData'}
          onOpenChange={setDialogOpen}
          dictData={selectedDictData}
          onSuccess={handleSuccess}
          mode='edit'
        />
      </Main>
    </>
  )
}
