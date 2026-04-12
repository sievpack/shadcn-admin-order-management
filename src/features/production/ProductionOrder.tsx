import { useState, useEffect } from 'react'
import {
  useProductionPlanNames,
  useProductionLines,
  useProductionWorkers,
  useGenerateOrderCode,
  useGenerateReportCode,
} from '@/queries/production/useProductionOptions'
import { Plus } from 'lucide-react'
import { printWorkOrder } from '@/lib/print'
import {
  productionOrderAPI,
  productionPlanAPI,
  productionReportAPI,
} from '@/lib/production-api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { type ProductionOrder } from './components/production-order-columns'
import {
  ProductionOrderDetailDialog,
  ProductionOrderDeleteDialog,
  ProductionOrderEditDialog,
  ProductionOrderAddDialog,
  ProductionOrderFinishDialog,
} from './components/production-order-dialogs'
import { ProductionOrderTable } from './components/production-order-table'
import { ProductionReportAddDialog } from './components/production-report-dialogs'

const formatDateLocal = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function ProductionOrderList() {
  const [selectedRow, setSelectedRow] = useState<ProductionOrder | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showFinishDialog, setShowFinishDialog] = useState(false)
  const [editForm, setEditForm] = useState<Partial<ProductionOrder>>({})
  const [addForm, setAddForm] = useState<Partial<ProductionOrder>>({
    工单状态: '待生产',
    工单数量: 0,
    已完成数量: 0,
  })
  const [addLoading, setAddLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [orderCodeGenerated, setOrderCodeGenerated] = useState(false)
  const [reportForm, setReportForm] = useState<{
    工单编号: string
    报工数量: number
    合格数量: number
    不良数量: number
    报工人: string
    备注: string
  }>({
    工单编号: '',
    报工数量: 0,
    合格数量: 0,
    不良数量: 0,
    报工人: '',
    备注: '',
  })

  const [refreshKey, setRefreshKey] = useState(0)

  const { data: planNamesData } = useProductionPlanNames()
  const planOptions = planNamesData?.data?.data || []
  const { data: linesData } = useProductionLines()
  const lineOptions = linesData?.data?.data || []
  const { data: workersData } = useProductionWorkers()
  const workerOptions = workersData?.data?.data || []

  const { mutate: generateOrderCode } = useGenerateOrderCode({
    onSuccess: (res) => {
      if (res.data.code === 0) {
        setAddForm((prev) => ({
          ...prev,
          工单编号: res.data.data.code,
        }))
        setOrderCodeGenerated(true)
      }
    },
  })

  const { mutate: generateReportCode } = useGenerateReportCode()

  useEffect(() => {
    if (showAddDialog && !orderCodeGenerated) {
      generateOrderCode()
    }
    if (!showAddDialog) {
      setOrderCodeGenerated(false)
    }
  }, [showAddDialog, orderCodeGenerated, generateOrderCode])

  const handleView = (row: ProductionOrder) => {
    setSelectedRow(row)
    setShowDetailDialog(true)
  }

  const handleEdit = (row: ProductionOrder) => {
    setSelectedRow(row)
    setEditForm(row)
    setShowEditDialog(true)
  }

  const handleDelete = (row: ProductionOrder) => {
    setSelectedRow(row)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async (row: ProductionOrder) => {
    try {
      const response = await productionOrderAPI.delete(row.id)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '删除成功',
          data: { 工单编号: row.工单编号 },
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

  const handleStart = async (row: ProductionOrder) => {
    try {
      const response = await productionOrderAPI.start(row.id)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '开始生产成功',
          data: { 工单编号: row.工单编号 },
        })
        setRefreshKey((k) => k + 1)
      } else {
        showToastWithData({
          type: 'error',
          title: '操作失败',
          data: { msg: response.data.msg },
        })
      }
    } catch (error: any) {
      showToastWithData({
        type: 'error',
        title: '操作失败',
        data: { error: error.message },
      })
    }
  }

  const handleFinish = (row: ProductionOrder) => {
    setSelectedRow(row)
    setShowFinishDialog(true)
  }

  const handleConfirmFinish = async () => {
    if (!selectedRow) return
    try {
      const response = await productionOrderAPI.finish(selectedRow.id)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '完工确认成功',
          data: { 工单编号: selectedRow.工单编号 },
        })
        setShowFinishDialog(false)
        setRefreshKey((k) => k + 1)
      } else {
        showToastWithData({
          type: 'error',
          title: '操作失败',
          data: { msg: response.data.msg },
        })
      }
    } catch (error: any) {
      showToastWithData({
        type: 'error',
        title: '操作失败',
        data: { error: error.message },
      })
    }
  }

  const handlePause = async (row: ProductionOrder) => {
    try {
      const response = await productionOrderAPI.pause(row.id)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '已暂停',
          data: { 工单编号: row.工单编号 },
        })
        setRefreshKey((k) => k + 1)
      } else {
        showToastWithData({
          type: 'error',
          title: '操作失败',
          data: { msg: response.data.msg },
        })
      }
    } catch (error: any) {
      showToastWithData({
        type: 'error',
        title: '操作失败',
        data: { error: error.message },
      })
    }
  }

  const handleReport = (row: ProductionOrder) => {
    setSelectedRow(row)
    setReportForm({
      工单编号: row.工单编号,
      报工数量: row.工单数量 - row.已完成数量,
      合格数量: row.工单数量 - row.已完成数量,
      不良数量: 0,
      报工人: '',
      备注: '',
    })
    setShowReportDialog(true)
  }

  const handleReportSubmit = async () => {
    if (reportLoading) return

    if (!reportForm.报工数量 || reportForm.报工数量 <= 0) {
      showToastWithData({ type: 'error', title: '报工数量必须大于0' })
      return
    }
    if (reportForm.不良数量 < 0) {
      showToastWithData({ type: 'error', title: '不良数量不能为负数' })
      return
    }
    if (!reportForm.报工人) {
      showToastWithData({ type: 'error', title: '请选择报工人' })
      return
    }
    try {
      setReportLoading(true)
      const res = await generateReportCode()
      const 报工编号 = res?.data?.code === 0 ? res.data.data.code : ''
      const response = await productionReportAPI.create({
        ...reportForm,
        报工编号,
        报工日期: formatDateLocal(new Date()),
      })
      if (response.data.code === 0) {
        const data = response.data.data
        if (data.is_completed) {
          showToastWithData({
            type: 'success',
            title: '报工成功，工单已完成！',
            data: {
              工单编号: reportForm.工单编号,
              报工数量: reportForm.报工数量,
            },
          })
        } else {
          const remaining = data.remaining || 0
          showToastWithData({
            type: 'success',
            title: `报工成功，剩余 ${remaining} 件`,
            data: {
              工单编号: reportForm.工单编号,
              报工数量: reportForm.报工数量,
              剩余: remaining,
            },
          })
        }
        setShowReportDialog(false)
        setRefreshKey((k) => k + 1)
      } else {
        showToastWithData({
          type: 'error',
          title: '报工失败',
          data: { msg: response.data.msg },
        })
      }
    } catch (error: any) {
      showToastWithData({
        type: 'error',
        title: '报工失败',
        data: { error: error.message },
      })
    } finally {
      setReportLoading(false)
    }
  }

  const handlePrint = (row: ProductionOrder) => {
    printWorkOrder(row.id)
  }

  const handleUpdate = async () => {
    if (!selectedRow) return
    try {
      const response = await productionOrderAPI.update({
        id: selectedRow.id,
        ...editForm,
      })
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '更新成功',
          data: { 工单编号: selectedRow.工单编号 },
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
      setAddLoading(true)
      const response = await productionOrderAPI.create(addForm)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '创建成功',
          data: { 工单编号: addForm.工单编号 },
        })
        setShowAddDialog(false)
        setAddForm({
          工单状态: '待生产',
          工单数量: 0,
          已完成数量: 0,
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
            <h2 className='text-2xl font-bold tracking-tight'>生产工单</h2>
            <p className='text-muted-foreground'>管理生产工单信息</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus data-icon='inline-start' />
            新增工单
          </Button>
        </div>

        <ProductionOrderTable
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStart={handleStart}
          onFinish={handleFinish}
          onPause={handlePause}
          onPrint={handlePrint}
          onReport={handleReport}
          refreshKey={refreshKey}
        />
      </Main>

      <ProductionOrderDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        order={selectedRow}
      />

      <ProductionOrderEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        order={selectedRow}
        editForm={editForm}
        onEditFormChange={setEditForm}
        onSave={handleUpdate}
        lineOptions={lineOptions}
      />

      <ProductionOrderDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        order={selectedRow}
        onDelete={handleConfirmDelete}
      />

      <ProductionOrderAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        addForm={addForm}
        onAddFormChange={setAddForm}
        onSave={handleAdd}
        loading={addLoading}
        planOptions={planOptions}
        lineOptions={lineOptions}
      />

      <ProductionReportAddDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        addForm={reportForm as any}
        onAddFormChange={(data: any) => setReportForm(data)}
        onSave={handleReportSubmit}
        loading={reportLoading}
        orderOptions={[selectedRow?.工单编号 || '']}
        workerOptions={workerOptions}
        orderReadOnly
      />

      <ProductionOrderFinishDialog
        open={showFinishDialog}
        onOpenChange={setShowFinishDialog}
        order={selectedRow}
        onConfirm={handleConfirmFinish}
      />
    </>
  )
}
