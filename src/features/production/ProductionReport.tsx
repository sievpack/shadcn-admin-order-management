import { useState, useEffect } from 'react'
import {
  useProductionOrderCodes,
  useProductionWorkers,
  useGenerateReportCode,
} from '@/queries/production/useProductionOptions'
import { Plus } from 'lucide-react'
import { productionReportAPI } from '@/lib/production-api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
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
  const [reportCodeGenerated, setReportCodeGenerated] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)

  const { data: orderCodesData } = useProductionOrderCodes()
  const orderOptions = orderCodesData?.data?.data || []
  const { data: workersData } = useProductionWorkers()
  const workerOptions = workersData?.data?.data || []

  const { mutate: generateReportCode } = useGenerateReportCode({
    onSuccess: (res) => {
      if (res.data.code === 0) {
        setAddForm((prev) => ({
          ...prev,
          报工编号: res.data.data.code,
        }))
        setReportCodeGenerated(true)
      }
    },
  })

  useEffect(() => {
    if (showAddDialog && !reportCodeGenerated) {
      generateReportCode()
    }
    if (!showAddDialog) {
      setReportCodeGenerated(false)
    }
  }, [showAddDialog, reportCodeGenerated, generateReportCode])

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
        showToastWithData({
          type: 'success',
          title: '删除成功',
          data: { 报工编号: row.报工编号 },
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
      const response = await productionReportAPI.create(addForm)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '创建成功',
          data: { 报工编号: addForm.报工编号 },
        })
        setShowAddDialog(false)
        setAddForm({
          报工数量: 0,
          合格数量: 0,
          不良数量: 0,
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
      <AppHeader />

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
