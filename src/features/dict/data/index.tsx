import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { dictDataAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { type DictData } from './dict-data-columns'
import { DictDataDialogs } from './dict-data-dialogs'
import { DictDataTable } from './dict-data-table'

const route = getRouteApi('/_authenticated/dict/data/')

export function DictDataPage() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'delete'>('add')
  const [selectedDictData, setSelectedDictData] = useState<DictData | null>(
    null
  )
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAdd = () => {
    setSelectedDictData(null)
    setDialogMode('add')
    setDialogOpen(true)
  }

  const handleEdit = (row: DictData) => {
    setSelectedDictData(row)
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const handleDelete = (row: DictData) => {
    setSelectedDictData(row)
    setDialogMode('delete')
    setDialogOpen(true)
  }

  const handleMultiDelete = async (rows: DictData[]) => {
    try {
      await Promise.all(rows.map((row) => dictDataAPI.deleteData(row.id)))
      toast.success(`成功删除 ${rows.length} 条记录`)
      setRefreshKey((k) => k + 1)
    } catch (error) {
      console.error('批量删除失败:', error)
      toast.error('批量删除失败')
    }
  }

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1)
  }

  const dictType = search.dict_type as string | undefined

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>字典数据</h2>
            <p className='text-muted-foreground'>管理系统字典数据</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus data-icon='inline-end' />
            <span>新增</span>
          </Button>
        </div>
        <DictDataTable
          key={refreshKey}
          search={search as Record<string, unknown>}
          navigate={navigate}
          dictType={dictType}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMultiDelete={handleMultiDelete}
        />
      </Main>

      <DictDataDialogs
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        dictData={selectedDictData}
        onSuccess={handleSuccess}
        mode={dialogMode}
        dictType={dictType}
      />
    </>
  )
}
