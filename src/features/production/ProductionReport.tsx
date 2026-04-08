import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  productionReportAPI,
  productionOrderAPI,
  codeAPI,
} from '@/lib/production-api'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { type ProductionReport } from './components/production-report-columns'
import {
  ProductionReportDetailDialog,
  ProductionReportDeleteDialog,
  ProductionReportAddDialog,
} from './components/production-report-dialogs'
import { ProductionReportTable } from './components/production-report-table'

export function ProductionReportList() {
  const [selectedRow, setSelectedRow] = useState<ProductionReport | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState<Partial<ProductionReport>>({
    报工数量: 0,
    合格数量: 0,
    不良数量: 0,
  })
  const [addLoading, setAddLoading] = useState(false)
  const [orderOptions, setOrderOptions] = useState<string[]>([])
  const [workerOptions, setWorkerOptions] = useState<string[]>([])
  const [reportCodeGenerated, setReportCodeGenerated] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const generateReportCode = async () => {
      if (showAddDialog && !reportCodeGenerated) {
        try {
          const res = await codeAPI.generate('BG')
          if (res.data.code === 0) {
            setAddForm((prev) => ({
              ...prev,
              报工编号: res.data.data.code,
            }))
            setReportCodeGenerated(true)
          }
        } catch (error) {
          console.error('生成报工编号失败:', error)
        }
      }
      if (!showAddDialog) {
        setReportCodeGenerated(false)
      }
    }
    generateReportCode()
  }, [showAddDialog, reportCodeGenerated])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [orderRes, workerRes] = await Promise.all([
          productionOrderAPI.getCodes(),
          productionReportAPI.getWorkers(),
        ])
        if (orderRes.data.code === 0) {
          setOrderOptions(orderRes.data.data || [])
        }
        if (workerRes.data.code === 0) {
          setWorkerOptions(workerRes.data.data || [])
        }
      } catch (error) {
        console.error('获取选项失败:', error)
      }
    }
    if (showAddDialog) {
      fetchOptions()
    }
  }, [showAddDialog])

  const handleView = (row: ProductionReport) => {
    setSelectedRow(row)
    setShowDetailDialog(true)
  }

  const handleDelete = (row: ProductionReport) => {
    setSelectedRow(row)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async (row: ProductionReport) => {
    try {
      const response = await productionReportAPI.delete(row.id)
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
      setAddLoading(true)
      const response = await productionReportAPI.create(addForm)
      if (response.data.code === 0) {
        toast.success('创建成功')
        setShowAddDialog(false)
        setAddForm({
          报工数量: 0,
          合格数量: 0,
          不良数量: 0,
        })
        setRefreshKey((k) => k + 1)
      } else {
        toast.error(response.data.msg)
      }
    } catch (error) {
      toast.error('创建失败')
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
            <h2 className='text-2xl font-bold tracking-tight'>报工记录</h2>
            <p className='text-muted-foreground'>管理报工记录信息</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus data-icon='inline-start' />
            新增报工
          </Button>
        </div>

        <ProductionReportTable
          onView={handleView}
          onDelete={handleDelete}
          refreshKey={refreshKey}
        />
      </Main>

      <ProductionReportDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        report={selectedRow}
      />

      <ProductionReportDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        report={selectedRow}
        onDelete={handleConfirmDelete}
      />

      <ProductionReportAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        addForm={addForm}
        onAddFormChange={setAddForm}
        onSave={handleAdd}
        loading={addLoading}
        orderOptions={orderOptions}
        workerOptions={workerOptions}
      />
    </>
  )
}
