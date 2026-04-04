import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { orderAPI } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { OrderListTable } from './components/orderlist-table'
import { type Order } from './components/orderlist-columns'
import { OrderDetailDialog, OrderEditDialog } from './components/order-dialogs'
import { OrderDeleteDialog } from './components/order-delete-dialog'
import { OrderAddDialog } from './components/order-add-dialog'

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  // 订单详情相关状态
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false)
  
  // 编辑订单相关状态
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})
  
  // 删除确认对话框
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null)
  
  // 新增订单相关状态
  const [showAddModal, setShowAddModal] = useState(false)
  const [addLoading, setAddLoading] = useState<boolean>(false)

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await orderAPI.getAllOrders()
      if (response.data.code === 0) {
        let ordersData = response.data.data || []
        
        // 转换数据结构以适配前端
        const transformedOrders = ordersData.map((item: any) => ({
          id: item.id,
          order_number: item.订单编号,
          customer_name: item.客户名称,
          order_date: item.订单日期,
          delivery_date: item.交货日期,
          status: item.status
        }))
        
        setOrders(transformedOrders)
      } else {
        setError('API返回错误: ' + response.data.msg)
        setOrders([])
      }
    } catch (error: any) {
      console.error('获取订单失败:', error)
      setError('获取数据失败: ' + error.message)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleViewOrder = async (id: number, order: Order) => {
    setDetailsLoading(true)
    try {
      const response = await orderAPI.getOrderItems(id)
      setOrderItems(response.data.data || [])
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
      const response = await orderAPI.getOrderItems(id)
      setOrderItems(response.data.data || [])
      setSelectedOrder(order)
      // 确保订单日期和交期日期格式正确
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
        delivery_date: order.delivery_date ? formatDate(order.delivery_date) : ''
      }
      setEditFormData(formData)
      setShowEditModal(true)
    } catch (error) {
      console.error('获取订单详情失败:', error)
      setOrderItems([])
      setSelectedOrder(order)
      // 确保订单日期和交期日期格式正确
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
        delivery_date: order.delivery_date ? formatDate(order.delivery_date) : ''
      }
      setEditFormData(formData)
      setShowEditModal(true)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleSaveOrder = async () => {
    setLoading(true)
    try {
      // 只更新可编辑的字段：交期日期和状态
      const updateData = {
        id: editFormData.id,
        delivery_date: editFormData.delivery_date,
        status: editFormData.status
      }
      const orderResponse = await orderAPI.updateOrder(updateData)
      if (orderResponse.data.code === 0) {
        for (const item of orderItems) {
          await orderAPI.updateOrderItem(item)
        }
        await fetchOrders()
        setShowEditModal(false)
        toast.success('订单更新成功')
      } else {
        toast.error('更新失败: ' + orderResponse.data.msg)
      }
    } catch (error) {
      console.error('更新订单失败:', error)
      toast.error('更新失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async (id: number) => {
    setLoading(true)
    try {
      const response = await orderAPI.deleteOrder(id)
      if (response.data.code === 0) {
        await fetchOrders()
        toast.success('订单删除成功')
      } else {
        toast.error('删除失败: ' + response.data.msg)
      }
    } catch (error) {
      console.error('删除订单失败:', error)
      toast.error('删除失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async (ids: number[]) => {
    setLoading(true)
    try {
      for (const id of ids) {
        await orderAPI.deleteOrder(id)
      }
      await fetchOrders()
      toast.success(`成功删除 ${ids.length} 个订单`)
    } catch (error) {
      console.error('批量删除订单失败:', error)
      toast.error('批量删除失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 打开新增订单对话框
  const handleAddOrder = () => {
    setShowAddModal(true)
  }

  // 保存新增订单
  const handleSaveNewOrder = async (formData: any, orderItems: any[]) => {
    setAddLoading(true)
    try {
      // 首先创建订单主表
      const orderResponse = await orderAPI.createOrder(formData)
      if (orderResponse.data.code === 0) {
        const orderId = orderResponse.data.data.id
        
        // 然后创建订单子项目
        console.log('订单子项目列表:', orderItems)
        for (const item of orderItems) {
          // 构建订单子项目数据，确保所有字段都有值
          // 根据数据库表结构，订单表需要以下必填字段：
          // 订单编号、合同编号、订单日期、交货日期、规格、产品类型、型号、数量、单位、销售单价、客户名称、外购
          // 注意：金额是数据库自动计算的字段，不需要传递
          const orderItemData = {
            oid: orderId,
            订单编号: formData.order_number || '',
            合同编号: item.合同编号 || formData.order_number || '',
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
            发货单号: item.发货单号 || '',
            快递单号: item.快递单号 || '',
            客户物料编号: item.客户物料编号 || '',
            客户名称: formData.customer_name || '',
            外购: item.外购 === true ? 1 : 0  // 数据库中是 bit 类型，需要转换为 0 或 1
          }
          
          console.log('完整的订单子项目数据:', JSON.stringify(orderItemData, null, 2))
          const itemResponse = await orderAPI.createOrderItem(orderItemData)
          
          if (itemResponse.data.code !== 0) {
            console.error('创建订单子项目失败:', itemResponse.data.msg)
            console.error('请求数据:', JSON.stringify(orderItemData, null, 2))
            toast.error(`创建订单子项目失败: ${itemResponse.data.msg}`)
            // 继续创建其他子项目，不中断流程
          }
        }
        
        // 重新获取订单列表
        await fetchOrders()
        setShowAddModal(false)
        toast.success('订单创建成功')
      } else {
        toast.error('创建失败: ' + orderResponse.data.msg)
      }
    } catch (error) {
      console.error('创建订单失败:', error)
      toast.error('创建失败，请稍后重试')
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
            <h2 className='text-2xl font-bold tracking-tight'>订单列表</h2>
            <p className='text-muted-foreground'>管理所有订单信息</p>
          </div>
          <Button onClick={handleAddOrder}>
            <Plus data-icon="inline-start" />
            新增订单
          </Button>
        </div>

        {error && (
          <div className='mb-4 px-4 py-3 bg-destructive/10 border-l-4 border-destructive'>
            <p className='text-destructive'>{error}</p>
          </div>
        )}

        {loading && (
          <div className='mb-4 px-4 py-3 bg-primary/10 border-l-4 border-primary'>
            <p className='text-primary'>正在加载数据...</p>
          </div>
        )}

        {!loading && !error && (
          <OrderListTable 
            data={orders} 
            onViewOrder={handleViewOrder} 
            onEditOrder={handleEditOrder} 
            onDeleteOrder={(id) => {
              setOrderToDelete(id)
              setDeleteDialogOpen(true)
            }} 
            onBulkDelete={handleBulkDelete}
          />
        )}
      </Main>

      {/* 订单详情对话框 */}
      <OrderDetailDialog 
        open={showDetails} 
        onOpenChange={setShowDetails} 
        order={selectedOrder} 
        orderItems={orderItems} 
        loading={detailsLoading}
      />

      {/* 编辑订单对话框 */}
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

      {/* 删除确认对话框 */}
      <OrderDeleteDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        orderId={orderToDelete} 
        onDelete={handleDeleteOrder} 
      />
      
      {/* 新增订单对话框 */}
      <OrderAddDialog 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
        onSave={handleSaveNewOrder} 
        loading={addLoading} 
      />
    </>
  )
}
