import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { qualityInspectionAPI, codeAPI } from '@/lib/production-api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { type QualityInspection } from './components/quality-inspection-columns'
import {
  QualityInspectionDetailDialog,
  QualityInspectionDeleteDialog,
  QualityInspectionAddDialog,
} from './components/quality-inspection-dialogs'
import { QualityInspectionTable } from './components/quality-inspection-table'

export function QualityInspectionList() {
  const [selectedRow, setSelectedRow] = useState<QualityInspection | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState<Partial<QualityInspection>>({
    送检数量: 0,
    合格数量: 0,
    不良数量: 0,
    不良率: 0,
  })
  const [addLoading, setAddLoading] = useState(false)
  const [inspectorOptions, setInspectorOptions] = useState<string[]>([])
  const [qcCodeGenerated, setQcCodeGenerated] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const generateQcCode = async () => {
      if (showAddDialog && !qcCodeGenerated) {
        try {
          const res = await codeAPI.generate('ZJ')
          if (res.data.code === 0) {
            setAddForm((prev) => ({
              ...prev,
              质检单号: res.data.data.code,
            }))
            setQcCodeGenerated(true)
          }
        } catch (error) {
          console.error('生成质检编号失败:', error)
        }
      }
      if (!showAddDialog) {
        setQcCodeGenerated(false)
      }
    }
    generateQcCode()
  }, [showAddDialog, qcCodeGenerated])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await qualityInspectionAPI.getInspectors()
        if (res.data.code === 0) {
          setInspectorOptions(res.data.data || [])
        }
      } catch (error) {
        console.error('获取选项失败:', error)
      }
    }
    if (showAddDialog) {
      fetchOptions()
    }
  }, [showAddDialog])

  const handleView = (row: QualityInspection) => {
    setSelectedRow(row)
    setShowDetailDialog(true)
  }

  const handleDelete = (row: QualityInspection) => {
    setSelectedRow(row)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async (row: QualityInspection) => {
    try {
      const response = await qualityInspectionAPI.delete(row.id)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '删除成功',
          data: { 质检单号: row.质检单号 },
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
      const response = await qualityInspectionAPI.create(addForm)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '创建成功',
          data: { 质检单号: addForm.质检单号 },
        })
        setShowAddDialog(false)
        setAddForm({
          送检数量: 0,
          合格数量: 0,
          不良数量: 0,
          不良率: 0,
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
      setAddLoading(false)
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
            <h2 className='text-2xl font-bold tracking-tight'>质检记录</h2>
            <p className='text-muted-foreground'>管理质检记录信息</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus data-icon='inline-start' />
            新增质检
          </Button>
        </div>

        <QualityInspectionTable
          onView={handleView}
          onDelete={handleDelete}
          refreshKey={refreshKey}
        />
      </Main>

      <QualityInspectionDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        inspection={selectedRow}
      />

      <QualityInspectionDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        inspection={selectedRow}
        onDelete={handleConfirmDelete}
      />

      <QualityInspectionAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        addForm={addForm}
        onAddFormChange={setAddForm}
        onSave={handleAdd}
        loading={addLoading}
        inspectorOptions={inspectorOptions}
      />
    </>
  )
}
