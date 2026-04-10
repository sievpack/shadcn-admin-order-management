import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { orderItemKeys } from '@/queries/orders/keys'
import { useCreateOrder } from '@/queries/orders/useCreateOrder'
import { useCreateOrderItem } from '@/queries/orders/useCreateOrderItem'
import { useDeleteOrder } from '@/queries/orders/useDeleteOrder'
import { useDeleteOrderItem } from '@/queries/orders/useDeleteOrderItem'
import { useUpdateOrder } from '@/queries/orders/useUpdateOrder'
import { useUpdateOrderItem } from '@/queries/orders/useUpdateOrderItem'
import { Plus } from 'lucide-react'
import { orderItemAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { OrderAddDialog } from './components/order-add-dialog'
import { OrderDeleteDialog } from './components/order-delete-dialog'
import { OrderDetailDialog, OrderEditDialog } from './components/order-dialogs'
import { OrderItemAddDialog } from './components/orderitem-add-dialog'
import { OrderItemDeleteDialog } from './components/orderitem-delete-dialog'
import { OrderItemEditDialog } from './components/orderitem-edit-dialog'
import { type Order } from './components/orderlist-columns'
import { OrderListTable } from './components/orderlist-table'
import { ProcessingOrderPrintDialog } from './components/processing-order-print-dialog'

export function OrderList() {
  const queryClient = useQueryClient()
  const createOrder = useCreateOrder()
  const updateOrder = useUpdateOrder()
  const deleteOrder = useDeleteOrder()
  const createOrderItem = useCreateOrderItem()
  const updateOrderItem = useUpdateOrderItem()
  const deleteOrderItem = useDeleteOrderItem()

  const [refreshKey, setRefreshKey] = useState(0)
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

  const [showAddModal, setShowAddModal] = useState(false)

  const [printDialogOpen, setPrintDialogOpen] = useState(false)
  const [printOrderId, setPrintOrderId] = useState<number | null>(null)
  const [printOrderNumber, setPrintOrderNumber] = useState<string>('')

  const handleViewOrder = useCallback(async (id: number, order: Order) => {
    setSelectedOrder(order)
    setOrderItems([])
    setShowDetails(true)
    setDetailsLoading(true)
    try {
      const result = await orderItemAPI.getItemsByOrderId(id)
      setOrderItems(
        result?.data?.data?.list || result?.data?.list || result?.data || []
      )
    } catch (error) {
      console.error('获取订单详情失败:', error)
      setOrderItems([])
    } finally {
      setDetailsLoading(false)
    }
  }, [])

  const handleEditOrder = useCallback(async (id: number, order: Order) => {
    setDetailsLoading(true)
    try {
      const result = await orderItemAPI.getItemsByOrderId(id)
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
  }, [])

  const handleSaveOrder = useCallback(async () => {
    try {
      const updateData = {
        id: editFormData.id,
        delivery_date: editFormData.delivery_date,
        status: editFormData.status,
      }
      const orderResponse = await updateOrder.mutateAsync(updateData)
      if (orderResponse) {
        for (const item of orderItems) {
          await updateOrderItem.mutateAsync(item)
        }
        setShowEditModal(false)
        showToastWithData({
          type: 'success',
          title: '订单更新成功',
          data: orderResponse,
        })
        setRefreshKey((k) => k + 1)
      }
    } catch (error: any) {
      console.error('更新订单失败:', error)
      showToastWithData({
        type: 'error',
        title: '更新失败',
        data: { error: error.message },
      })
    }
  }, [editFormData, orderItems, updateOrder, updateOrderItem])

  const handleDeleteOrder = useCallback(
    async (id: number) => {
      try {
        const response = await deleteOrder.mutateAsync(id)
        showToastWithData({
          type: 'success',
          title: '删除成功',
          data: response,
        })
        setRefreshKey((k) => k + 1)
      } catch (error: any) {
        console.error('删除订单失败:', error)
        showToastWithData({
          type: 'error',
          title: '删除失败',
          data: { error: error.message },
        })
      }
    },
    [deleteOrder]
  )

  const handleDeleteOrderItem = useCallback((id: number) => {
    setItemToDelete(id)
    setItemToDeleteLabel(`ID: ${id}`)
    setDeleteItemDialogOpen(true)
  }, [])

  const handleEditOrderItem = useCallback((_id: number, item: any) => {
    setEditingItem(item)
    setEditItemDialogOpen(true)
  }, [])

  const handleSaveEditOrderItem = useCallback(
    async (data: any) => {
      try {
        await updateOrderItem.mutateAsync(data)
        showToastWithData({
          type: 'success',
          title: '更新成功',
          data,
        })
        setRefreshKey((k) => k + 1)
      } catch (error: any) {
        console.error('更新订单分项失败:', error)
        showToastWithData({
          type: 'error',
          title: '更新失败',
          data: { error: error.message },
        })
      }
    },
    [updateOrderItem]
  )

  const handleAddOrderItem = useCallback((order: Order) => {
    setAddingOrder(order)
    setAddItemDialogOpen(true)
  }, [])

  const handleSaveAddOrderItem = useCallback(
    async (data: any) => {
      try {
        await createOrderItem.mutateAsync(data)
        showToastWithData({
          type: 'success',
          title: '创建成功',
          data,
        })
        queryClient.invalidateQueries({
          queryKey: orderItemKeys.list(data.oid),
        })
        setRefreshKey((k) => k + 1)
        setAddItemDialogOpen(false)
      } catch (error: any) {
        console.error('创建订单分项失败:', error)
        showToastWithData({
          type: 'error',
          title: '创建失败',
          data: { error: error.message },
        })
      }
    },
    [createOrderItem, queryClient]
  )

  const handleConfirmDeleteOrderItem = useCallback(async () => {
    if (!itemToDelete) return
    try {
      await deleteOrderItem.mutateAsync(itemToDelete)
      showToastWithData({
        type: 'success',
        title: '删除成功',
        data: { id: itemToDelete },
      })
      setRefreshKey((k) => k + 1)
    } catch (error: any) {
      console.error('删除订单分项失败:', error)
      showToastWithData({
        type: 'error',
        title: '删除失败',
        data: { error: error.message },
      })
    } finally {
      setItemToDelete(null)
    }
  }, [itemToDelete, deleteOrderItem])

  const handleBulkDelete = useCallback(
    async (ids: number[]) => {
      try {
        for (const id of ids) {
          await deleteOrder.mutateAsync(id)
        }
        showToastWithData({
          type: 'success',
          title: `成功删除 ${ids.length} 个订单`,
          data: { 删除数量: ids.length },
        })
        setRefreshKey((k) => k + 1)
      } catch (error: any) {
        console.error('批量删除订单失败:', error)
        showToastWithData({
          type: 'error',
          title: '批量删除失败',
          data: { error: error.message },
        })
      }
    },
    [deleteOrder]
  )

  const handleAddOrder = useCallback(async () => {
    setShowAddModal(true)
  }, [])

  const handlePrintProcessingOrder = useCallback(
    (orderId: number, orderNumber: string) => {
      setPrintOrderId(orderId)
      setPrintOrderNumber(orderNumber)
      setPrintDialogOpen(true)
    },
    []
  )

  const handleSaveNewOrder = useCallback(
    async (formData: any, orderItems: any[]) => {
      try {
        const orderNumber = formData.order_number

        const orderResponse = await createOrder.mutateAsync({
          ...formData,
          order_number: orderNumber,
        })
        if (orderResponse) {
          const orderId = orderResponse.data.id

          for (const item of orderItems) {
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

            await createOrderItem.mutateAsync(orderItemData)
          }

          setShowAddModal(false)
          showToastWithData({
            type: 'success',
            title: '订单创建成功',
            data: orderResponse,
          })
          setRefreshKey((k) => k + 1)
        }
      } catch (error: any) {
        console.error('创建订单失败:', error)
        showToastWithData({
          type: 'error',
          title: '创建失败',
          data: { error: error.message },
        })
      }
    },
    [createOrder, createOrderItem]
  )

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

        <OrderListTable
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
          onPrintOrder={handlePrintProcessingOrder}
          refreshKey={refreshKey}
        />
      </Main>

      <OrderDetailDialog
        open={showDetails}
        onOpenChange={setShowDetails}
        order={selectedOrder}
        orderItems={orderItems}
        loading={detailsLoading}
        onPrint={handlePrintProcessingOrder}
      />

      <OrderEditDialog
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

      <OrderDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        orderId={orderToDelete}
        onDelete={handleDeleteOrder}
      />

      <OrderItemDeleteDialog
        open={deleteItemDialogOpen}
        onOpenChange={setDeleteItemDialogOpen}
        itemId={itemToDelete}
        itemLabel={itemToDeleteLabel}
        onDelete={handleConfirmDeleteOrderItem}
      />

      <OrderItemEditDialog
        open={editItemDialogOpen}
        onOpenChange={setEditItemDialogOpen}
        item={editingItem}
        onSave={handleSaveEditOrderItem}
      />

      <OrderAddDialog
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSave={handleSaveNewOrder}
      />

      {addingOrder && (
        <OrderItemAddDialog
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

      <ProcessingOrderPrintDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        orderId={printOrderId}
        orderNumber={printOrderNumber}
      />
    </>
  )
}
