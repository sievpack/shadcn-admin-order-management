import { useState, useEffect } from 'react'
import {
  useProductionWarehouses,
  useGenerateInboundCode,
} from '@/queries/production/useProductionOptions'
import { Plus } from 'lucide-react'
import { productInboundAPI } from '@/lib/production-api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { type ProductInbound } from './components/product-inbound-columns'
import {
  ProductInboundDetailDialog,
  ProductInboundDeleteDialog,
  ProductInboundAddDialog,
} from './components/product-inbound-dialogs'
import { ProductInboundTable } from './components/product-inbound-table'

export function ProductInboundList() {
  const [selectedRow, setSelectedRow] = useState<ProductInbound | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState<Partial<ProductInbound>>({
    入库数量: 0,
  })
  const [addLoading, setAddLoading] = useState(false)
  const [inboundCodeGenerated, setInboundCodeGenerated] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)

  const { data: warehousesData } = useProductionWarehouses()
  const warehouseOptions = warehousesData?.data?.data || []

  const { mutate: generateInboundCode } = useGenerateInboundCode({
    onSuccess: (res) => {
      if (res.data.code === 0) {
        setAddForm((prev) => ({
          ...prev,
          入库单号: res.data.data.code,
        }))
        setInboundCodeGenerated(true)
      }
    },
  })

  useEffect(() => {
    if (showAddDialog && !inboundCodeGenerated) {
      generateInboundCode()
    }
    if (!showAddDialog) {
      setInboundCodeGenerated(false)
    }
  }, [showAddDialog, inboundCodeGenerated, generateInboundCode])

  const handleView = (row: ProductInbound) => {
    setSelectedRow(row)
    setShowDetailDialog(true)
  }

  const handleDelete = (row: ProductInbound) => {
    setSelectedRow(row)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async (row: ProductInbound) => {
    try {
      const response = await productInboundAPI.delete(row.id)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '删除成功',
          data: { 入库单号: row.入库单号 },
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
      const response = await productInboundAPI.create(addForm)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '创建成功',
          data: { 入库单号: addForm.入库单号 },
        })
        setShowAddDialog(false)
        setAddForm({ 入库数量: 0 })
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
            <h2 className='text-2xl font-bold tracking-tight'>成品入库</h2>
            <p className='text-muted-foreground'>管理成品入库信息</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus data-icon='inline-start' />
            新增入库
          </Button>
        </div>

        <ProductInboundTable
          onView={handleView}
          onDelete={handleDelete}
          refreshKey={refreshKey}
        />
      </Main>

      <ProductInboundDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        inbound={selectedRow}
      />

      <ProductInboundDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        inbound={selectedRow}
        onDelete={handleConfirmDelete}
      />

      <ProductInboundAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        addForm={addForm}
        onAddFormChange={setAddForm}
        onSave={handleAdd}
        loading={addLoading}
        warehouseOptions={warehouseOptions}
      />
    </>
  )
}
