import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import {
  productionPlanAPI,
  productionOrderAPI,
  codeAPI,
} from '@/lib/production-api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { NotificationIcon } from '@/components/notifications/notification-icon'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { type ProductionPlan } from './components/production-plan-columns'
import {
  ProductionPlanDetailDialog,
  ProductionPlanDeleteDialog,
  ProductionPlanEditDialog,
  ProductionPlanAddDialog,
  GenerateOrderDialog,
} from './components/production-plan-dialogs'
import { ProductionPlanTable } from './components/production-plan-table'

export function ProductionPlanList() {
  const [selectedRow, setSelectedRow] = useState<ProductionPlan | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editForm, setEditForm] = useState<Partial<ProductionPlan>>({})
  const [addForm, setAddForm] = useState<Partial<ProductionPlan>>({
    计划状态: '待审核',
    优先级: '普通',
    计划数量: 0,
    已排数量: 0,
  })
  const [addLoading, setAddLoading] = useState(false)
  const [planCodeGenerated, setPlanCodeGenerated] = useState(false)

  const [showGenerateOrderDialog, setShowGenerateOrderDialog] = useState(false)
  const [generateOrderForm, setGenerateOrderForm] = useState({
    工单数量: 0,
    产线: '',
  })
  const [lines, setLines] = useState<{ label: string; value: string }[]>([])
  const [generateLoading, setGenerateLoading] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const generatePlanCode = async () => {
      if (showAddDialog && !planCodeGenerated) {
        try {
          const res = await codeAPI.generate('PC')
          if (res.data.code === 0) {
            setAddForm((prev) => ({
              ...prev,
              计划编号: res.data.data.code,
            }))
            setPlanCodeGenerated(true)
          }
        } catch (error) {
          console.error('生成计划编号失败:', error)
        }
      }
      if (!showAddDialog) {
        setPlanCodeGenerated(false)
      }
    }
    generatePlanCode()
  }, [showAddDialog, planCodeGenerated])

  useEffect(() => {
    const fetchLines = async () => {
      if (showGenerateOrderDialog) {
        try {
          const res = await productionOrderAPI.getLines()
          if (res.data.code === 0) {
            setLines(
              res.data.data.map((line: string) => ({
                label: line,
                value: line,
              }))
            )
          }
        } catch (error) {
          console.error('获取产线列表失败:', error)
        }
      }
    }
    fetchLines()
  }, [showGenerateOrderDialog])

  const handleView = (row: ProductionPlan) => {
    setSelectedRow(row)
    setShowDetailDialog(true)
  }

  const handleEdit = (row: ProductionPlan) => {
    setSelectedRow(row)
    setEditForm(row)
    setShowEditDialog(true)
  }

  const handleDelete = (row: ProductionPlan) => {
    setSelectedRow(row)
    setShowDeleteDialog(true)
  }

  const handleApprove = async (row: ProductionPlan) => {
    try {
      const response = await productionPlanAPI.approve(row.id)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '审核通过',
          data: { 计划编号: row.计划编号 },
        })
        setRefreshKey((k) => k + 1)
      } else {
        showToastWithData({
          type: 'error',
          title: '审核失败',
          data: { msg: response.data.msg },
        })
      }
    } catch (error: any) {
      showToastWithData({
        type: 'error',
        title: '审核失败',
        data: { error: error.message },
      })
    }
  }

  const handleReject = async (row: ProductionPlan) => {
    try {
      const response = await productionPlanAPI.reject(row.id)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '已驳回',
          data: { 计划编号: row.计划编号 },
        })
        setRefreshKey((k) => k + 1)
      } else {
        showToastWithData({
          type: 'error',
          title: '驳回失败',
          data: { msg: response.data.msg },
        })
      }
    } catch (error: any) {
      showToastWithData({
        type: 'error',
        title: '驳回失败',
        data: { error: error.message },
      })
    }
  }

  const handleGenerateOrder = (row: ProductionPlan) => {
    setSelectedRow(row)
    const remainingQty = row.计划数量 - row.已排数量
    setGenerateOrderForm({
      工单数量: remainingQty,
      产线: '',
    })
    setShowGenerateOrderDialog(true)
  }

  const handleConfirmGenerateOrder = async () => {
    if (!selectedRow) return
    try {
      setGenerateLoading(true)
      const response = await productionOrderAPI.createFromPlan({
        plan_id: selectedRow.id,
        工单数量: generateOrderForm.工单数量,
        产线: generateOrderForm.产线,
      })
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: `工单 ${response.data.data.工单编号} 创建成功`,
          data: {
            工单编号: response.data.data.工单编号,
            数量: generateOrderForm.工单数量,
          },
        })
        setShowGenerateOrderDialog(false)
        setRefreshKey((k) => k + 1)
      } else {
        showToastWithData({
          type: 'error',
          title: '创建工单失败',
          data: { msg: response.data.msg },
        })
      }
    } catch (error: any) {
      showToastWithData({
        type: 'error',
        title: '创建工单失败',
        data: { error: error.message },
      })
    } finally {
      setGenerateLoading(false)
    }
  }

  const handleConfirmDelete = async (row: ProductionPlan) => {
    try {
      const response = await productionPlanAPI.delete(row.id)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '删除成功',
          data: { 计划编号: row.计划编号 },
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
      const response = await productionPlanAPI.update({
        id: selectedRow.id,
        ...editForm,
      })
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '更新成功',
          data: { 计划编号: selectedRow.计划编号 },
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
      const response = await productionPlanAPI.create(addForm)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '创建成功',
          data: { 计划编号: addForm.计划编号 },
        })
        setShowAddDialog(false)
        setAddForm({
          计划状态: '待审核',
          优先级: '普通',
          计划数量: 0,
          已排数量: 0,
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
          <NotificationIcon />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>生产计划</h2>
            <p className='text-muted-foreground'>管理生产计划信息</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus data-icon='inline-start' />
            新增计划
          </Button>
        </div>

        <ProductionPlanTable
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onApprove={handleApprove}
          onReject={handleReject}
          onGenerateOrder={handleGenerateOrder}
          refreshKey={refreshKey}
        />
      </Main>

      <ProductionPlanDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        plan={selectedRow}
        refreshKey={refreshKey}
      />

      <ProductionPlanEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        plan={selectedRow}
        editForm={editForm}
        onEditFormChange={setEditForm}
        onSave={handleUpdate}
      />

      <ProductionPlanDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        plan={selectedRow}
        onDelete={handleConfirmDelete}
      />

      <ProductionPlanAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        addForm={addForm}
        onAddFormChange={setAddForm}
        onSave={handleAdd}
        loading={addLoading}
      />

      <GenerateOrderDialog
        open={showGenerateOrderDialog}
        onOpenChange={setShowGenerateOrderDialog}
        plan={selectedRow}
        lines={lines}
        formData={generateOrderForm}
        onFormChange={setGenerateOrderForm}
        onSave={handleConfirmGenerateOrder}
        loading={generateLoading}
      />
    </>
  )
}
