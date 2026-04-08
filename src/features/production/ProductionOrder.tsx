import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { printWorkOrder } from '@/lib/print'
import {
  productionOrderAPI,
  productionPlanAPI,
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
} from './components/production-order-dialogs'
import { ProductionOrderTable } from './components/production-order-table'

export function ProductionOrderList() {
  const [selectedRow, setSelectedRow] = useState<ProductionOrder | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editForm, setEditForm] = useState<Partial<ProductionOrder>>({})
  const [addForm, setAddForm] = useState<Partial<ProductionOrder>>({
    工单状态: '待生产',
    工单数量: 0,
    已完成数量: 0,
  })
  const [addLoading, setAddLoading] = useState(false)
  const [planOptions, setPlanOptions] = useState<string[]>([])
  const [lineOptions, setLineOptions] = useState<string[]>([])
  const [orderCodeGenerated, setOrderCodeGenerated] = useState(false)

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
        const [planRes, lineRes] = await Promise.all([
          productionPlanAPI.getNames(),
          productionOrderAPI.getLines(),
        ])
        if (planRes.data.code === 0) {
          setPlanOptions(planRes.data.data || [])
        }
        if (lineRes.data.code === 0) {
          setLineOptions(lineRes.data.data || [])
        }
      } catch (error) {
        console.error('获取选项失败:', error)
      }
    }
    if (showAddDialog) {
      fetchOptions()
    }
  }, [showAddDialog])

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

  const handleFinish = async (row: ProductionOrder) => {
    try {
      const response = await productionOrderAPI.finish(row.id)
      if (response.data.code === 0) {
        toast.success('完工确认成功')
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
    </>
  )
}
