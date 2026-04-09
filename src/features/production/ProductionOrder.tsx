import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { printWorkOrder } from '@/lib/print'
import {
  productionOrderAPI,
  productionPlanAPI,
  productionReportAPI,
  codeAPI,
} from '@/lib/production-api'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
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
  const [planOptions, setPlanOptions] = useState<string[]>([])
  const [lineOptions, setLineOptions] = useState<string[]>([])
  const [workerOptions, setWorkerOptions] = useState<string[]>([])
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

  useEffect(() => {
    const generateOrderCode = async () => {
      if (showAddDialog && !orderCodeGenerated) {
        try {
          const res = await codeAPI.generate('WO')
          if (res.data.code === 0) {
            setAddForm((prev) => ({
              ...prev,
              工单编号: res.data.data.code,
            }))
            setOrderCodeGenerated(true)
          }
        } catch (error) {
          console.error('生成工单编号失败:', error)
        }
      }
      if (!showAddDialog) {
        setOrderCodeGenerated(false)
      }
    }
    generateOrderCode()
  }, [showAddDialog, orderCodeGenerated])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [planRes, lineRes, workerRes] = await Promise.all([
          productionPlanAPI.getNames(),
          productionOrderAPI.getLines(),
          productionReportAPI.getWorkers(),
        ])
        if (planRes.data.code === 0) {
          setPlanOptions(planRes.data.data || [])
        }
        if (lineRes.data.code === 0) {
          setLineOptions(lineRes.data.data || [])
        }
        if (workerRes.data.code === 0) {
          setWorkerOptions(workerRes.data.data || [])
        }
      } catch (error) {
        console.error('获取选项失败:', error)
      }
    }
    if (showAddDialog || showEditDialog || showReportDialog) {
      fetchOptions()
    }
  }, [showAddDialog, showEditDialog, showReportDialog])

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

  const handleStart = async (row: ProductionOrder) => {
    try {
      const response = await productionOrderAPI.start(row.id)
      if (response.data.code === 0) {
        toast.success('开始生产成功')
        setRefreshKey((k) => k + 1)
      } else {
        toast.error(response.data.msg)
      }
    } catch (error) {
      toast.error('操作失败')
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
        toast.success('完工确认成功')
        setShowFinishDialog(false)
        setRefreshKey((k) => k + 1)
      } else {
        toast.error(response.data.msg)
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  const handlePause = async (row: ProductionOrder) => {
    try {
      const response = await productionOrderAPI.pause(row.id)
      if (response.data.code === 0) {
        toast.success('已暂停')
        setRefreshKey((k) => k + 1)
      } else {
        toast.error(response.data.msg)
      }
    } catch (error) {
      toast.error('操作失败')
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
      toast.error('报工数量必须大于0')
      return
    }
    if (reportForm.不良数量 < 0) {
      toast.error('不良数量不能为负数')
      return
    }
    if (!reportForm.报工人) {
      toast.error('请选择报工人')
      return
    }
    try {
      setReportLoading(true)
      const res = await codeAPI.generate('BG')
      const 报工编号 = res.data.code === 0 ? res.data.data.code : ''
      const response = await productionReportAPI.create({
        ...reportForm,
        报工编号,
        报工日期: new Date().toISOString().split('T')[0],
      })
      if (response.data.code === 0) {
        const data = response.data.data
        if (data.is_completed) {
          toast.success('报工成功，工单已完成！')
        } else {
          const remaining = data.remaining || 0
          toast.success(`报工成功，剩余 ${remaining} 件`)
        }
        setShowReportDialog(false)
        setRefreshKey((k) => k + 1)
      } else {
        toast.error(response.data.msg)
      }
    } catch (error) {
      toast.error('报工失败')
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
        toast.success('更新成功')
        setShowEditDialog(false)
        setRefreshKey((k) => k + 1)
      } else {
        toast.error(response.data.msg)
      }
    } catch (error) {
      toast.error('更新失败')
    }
  }

  const handleAdd = async () => {
    try {
      setAddLoading(true)
      const response = await productionOrderAPI.create(addForm)
      if (response.data.code === 0) {
        toast.success('创建成功')
        setShowAddDialog(false)
        setAddForm({
          工单状态: '待生产',
          工单数量: 0,
          已完成数量: 0,
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
