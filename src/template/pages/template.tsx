import { useState } from 'react'
import { useOrderService } from '@/services/orderService'
import { Plus } from 'lucide-react'
import { codeAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { TemplateAddDialog } from './components/template-add-dialog'
import { type Order } from './components/template-columns'
import { TemplateDeleteDialog } from './components/template-delete-dialog'
import {
  TemplateDetailDialog,
  TemplateEditDialog,
} from './components/template-dialogs'
import { TemplateItemAddDialog } from './components/template-item-add-dialog'
import { TemplateItemDeleteDialog } from './components/template-item-delete-dialog'
import { TemplateItemEditDialog } from './components/template-item-edit-dialog'
import { TemplateTable } from './components/template-table'

export function Template() {
  const {
    getOrderItems,
    createOrder,
    createOrderItem,
    updateOrder,
    updateOrderItem,
    deleteOrder,
    deleteOrderItem,
  } = useOrderService()

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false)

  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null)

  const [deleteItemDialogOpen, setDeleteItemDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const [itemToDeleteLabel, setItemToDeleteLabel] = useState<string>('')

  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false)
  const [addingOrder, setAddingOrder] = useState<Order | null>(null)

  const [refreshKey, setRefreshKey] = useState(0)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const [showAddModal, setShowAddModal] = useState(false)
  const [addLoading, setAddLoading] = useState<boolean>(false)
  const [generatedOrderCode, setGeneratedOrderCode] = useState('')

  const handleViewOrder = async (id: number, order: Order) => {
    setDetailsLoading(true)
    try {
      const result = await getOrderItems.execute(id)
      setOrderItems(result?.data || [])
      setSelectedOrder(order)
      setShowDetails(true)
    } catch (error) {
      console.error('获取订单详情失败:', error)
      setOrderItems([])
      setSelectedOrder(order)
      setShowDetails(true)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleEditOrder = async (id: number, order: Order) => {
    setDetailsLoading(true)
    try {
      const result = await getOrderItems.execute(id)
      setOrderItems(result?.data || [])
      setSelectedOrder(order)
      const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      const formData = {
        ...order,
        order_date: order.order_date ? formatDate(order.order_date) : '',
        delivery_date: order.delivery_date
          ? formatDate(order.delivery_date)
          : '',
      }
      setEditFormData(formData)
      setShowEditModal(true)
    } catch (error) {
      console.error('获取订单详情失败:', error)
      setOrderItems([])
      setSelectedOrder(order)
      const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      const formData = {
        ...order,
        order_date: order.order_date ? formatDate(order.order_date) : '',
        delivery_date: order.delivery_date
          ? formatDate(order.delivery_date)
          : '',
      }
      setEditFormData(formData)
      setShowEditModal(true)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleSaveOrder = async () => {
    try {
      const updateData = {
        id: editFormData.id,
        delivery_date: editFormData.delivery_date,
        status: editFormData.status,
      }
      const orderResponse = await updateOrder.execute(updateData)
      if (orderResponse) {
        for (const item of orderItems) {
          await updateOrderItem.execute(item)
        }
        setShowEditModal(false)
        showToastWithData({
          type: 'success',
          title: '订单更新成功',
          data: orderResponse,
        })
        setRefreshKey((k) => k + 1)
      }
    } catch (error) {
      console.error('更新订单失败:', error)
      showToastWithData({ type: 'error', title: '更新失败，请稍后重试' })
    }
  }

  const handleDeleteOrder = async (id: number) => {
    try {
      const response = await deleteOrder.execute(id)
      if (response) {
        showToastWithData({
          type: 'success',
          title: '订单删除成功',
          data: response,
        })
        setRefreshKey((k) => k + 1)
      }
    } catch (error) {
      console.error('删除订单失败:', error)
      showToastWithData({ type: 'error', title: '删除失败，请稍后重试' })
    }
  }

  const handleDeleteOrderItem = (id: number) => {
    setItemToDelete(id)
    setItemToDeleteLabel(`ID: ${id}`)
    setDeleteItemDialogOpen(true)
  }

  const handleEditOrderItem = (_id: number, item: any) => {
    setEditingItem(item)
    setEditItemDialogOpen(true)
  }

  const handleSaveEditOrderItem = async (data: any) => {
    try {
      const response = await updateOrderItem.execute(data)
      showToastWithData({
        type: 'success',
        title: '订单分项更新成功',
        data: response,
      })
      setRefreshKey((k) => k + 1)
    } catch (error) {
      console.error('更新订单分项失败:', error)
      showToastWithData({ type: 'error', title: '更新失败，请稍后重试' })
    }
  }

  const handleAddOrderItem = (order: Order) => {
    setAddingOrder(order)
    setAddItemDialogOpen(true)
  }

  const handleSaveAddOrderItem = async (data: any) => {
    try {
      const response = await createOrderItem.execute(data)
      showToastWithData({
        type: 'success',
        title: '订单分项创建成功',
        data: response,
      })
      setAddItemDialogOpen(false)
      setRefreshKey((k) => k + 1)
      if (addingOrder) {
        setExpandedRows((prev) => new Set(prev).add(addingOrder.id))
        setAddingOrder(null)
      }
    } catch (error) {
      console.error('创建订单分项失败:', error)
      showToastWithData({ type: 'error', title: '创建失败，请稍后重试' })
    }
  }

  const handleConfirmDeleteOrderItem = async () => {
    if (!itemToDelete) return
    try {
      const response = await deleteOrderItem.execute(itemToDelete)
      showToastWithData({
        type: 'success',
        title: '订单分项删除成功',
        data: response,
      })
      setRefreshKey((k) => k + 1)
    } catch (error) {
      console.error('删除订单分项失败:', error)
      showToastWithData({ type: 'error', title: '删除失败，请稍后重试' })
    } finally {
      setItemToDelete(null)
    }
  }

  const handleBulkDelete = async (ids: number[]) => {
    try {
      for (const id of ids) {
        await deleteOrder.execute(id)
      }
      showToastWithData({
        type: 'success',
        title: `成功删除 ${ids.length} 个订单`,
        data: { count: ids.length },
      })
      setRefreshKey((k) => k + 1)
    } catch (error) {
      console.error('批量删除订单失败:', error)
      showToastWithData({ type: 'error', title: '批量删除失败，请稍后重试' })
    }
  }

  const handleAddOrder = async () => {
    try {
      const res = await codeAPI.generate({ prefix: 'DD' })
      if (res.data.code === 0) {
        setGeneratedOrderCode(res.data.data.code)
      }
    } catch (error) {
      console.error('生成订单编号失败:', error)
    }
    setShowAddModal(true)
  }

  const handleSaveNewOrder = async (formData: any, orderItemsData: any[]) => {
    setAddLoading(true)
    try {
      const orderNumber = generatedOrderCode || formData.order_number

      const orderResponse = await createOrder.execute({
        ...formData,
        order_number: orderNumber,
      })
      if (orderResponse) {
        const orderId = orderResponse.data.id

        for (const item of orderItemsData) {
          const orderItemData = {
            oid: orderId,
            订单编号: orderNumber,
            合同编号: item.合同编号 || orderNumber,
            订单日期: formData.order_date || '',
            交货日期: formData.delivery_date || '',
            规格: item.规格 || '',
            产品类型: item.产品类型 || '',
            型号: item.型号 || '',
            数量: Number(item.数量) || 0,
            单位: item.单位 || '',
            销售单价: Number(item.销售单价) || 0,
            备注: item.备注 || '',
            结算方式: item.结算方式 || '',
            客户物料编号: item.客户物料编号 || '',
            客户名称: formData.customer_name || '',
            外购: item.外购 === true ? 1 : 0,
          }

          await createOrderItem.execute(orderItemData)
        }

        setShowAddModal(false)
        showToastWithData({
          type: 'success',
          title: '订单创建成功',
          data: orderResponse,
        })
        setRefreshKey((k) => k + 1)
      }
    } catch (error) {
      console.error('创建订单失败:', error)
      showToastWithData({ type: 'error', title: '创建失败，请稍后重试' })
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
            <h2 className='text-2xl font-bold tracking-tight'>订单列表</h2>
            <p className='text-muted-foreground'>管理所有订单信息</p>
          </div>
          <Button onClick={handleAddOrder}>
            <Plus data-icon='inline-start' />
            新增订单
          </Button>
        </div>

        <TemplateTable
          onViewOrder={handleViewOrder}
          onEditOrder={handleEditOrder}
          onDeleteOrder={(id) => {
            setOrderToDelete(id)
            setDeleteDialogOpen(true)
          }}
          onBulkDelete={handleBulkDelete}
          onEditOrderItem={handleEditOrderItem}
          onDeleteOrderItem={handleDeleteOrderItem}
          onAddOrderItem={handleAddOrderItem}
          refreshKey={refreshKey}
          expandedRows={expandedRows}
          onExpandedRowsChange={setExpandedRows}
        />
      </Main>

      <TemplateDetailDialog
        open={showDetails}
        onOpenChange={setShowDetails}
        order={selectedOrder}
        orderItems={orderItems}
        loading={detailsLoading}
      />

      <TemplateEditDialog
        open={showEditModal}
        onOpenChange={setShowEditModal}
        order={selectedOrder}
        orderItems={orderItems}
        onSave={handleSaveOrder}
        editFormData={editFormData}
        onEditFormDataChange={setEditFormData}
        onOrderItemsChange={setOrderItems}
        loading={detailsLoading}
      />

      <TemplateDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        orderId={orderToDelete}
        onDelete={handleDeleteOrder}
      />

      <TemplateItemDeleteDialog
        open={deleteItemDialogOpen}
        onOpenChange={setDeleteItemDialogOpen}
        itemId={itemToDelete}
        itemLabel={itemToDeleteLabel}
        onDelete={handleConfirmDeleteOrderItem}
      />

      <TemplateItemEditDialog
        open={editItemDialogOpen}
        onOpenChange={setEditItemDialogOpen}
        item={editingItem}
        onSave={handleSaveEditOrderItem}
      />

      <TemplateAddDialog
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSave={handleSaveNewOrder}
        loading={addLoading}
      />

      {addingOrder && (
        <TemplateItemAddDialog
          open={addItemDialogOpen}
          onOpenChange={(open) => {
            setAddItemDialogOpen(open)
            if (!open) {
              setAddingOrder(null)
            }
          }}
          orderId={addingOrder.id}
          orderNumber={addingOrder.order_number}
          customerName={addingOrder.customer_name}
          orderDate={addingOrder.order_date}
          deliveryDate={addingOrder.delivery_date}
          onSave={handleSaveAddOrderItem}
        />
      )}
    </>
  )
}
