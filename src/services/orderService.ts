import { orderAPI } from '@/lib/api'
import { useApi } from '@/hooks/useApi'
import { usePagination } from '@/hooks/usePagination'
import { type Order } from '@/features/orders/components/orderlist-columns'
import { type UnshippedItem } from '@/features/shipping/components/unshipped-columns'

export function useOrderService() {
  // 获取所有订单
  const getAllOrders = useApi<Order[]>(orderAPI.getAllOrders)

  // 获取订单详情
  const getOrderItems = useApi<any[]>(orderAPI.getOrderItems)

  // 创建订单
  const createOrder = useApi<{ id: number }>(orderAPI.createOrder)

  // 创建订单子项目
  const createOrderItem = useApi(orderAPI.createOrderItem)

  // 更新订单
  const updateOrder = useApi(orderAPI.updateOrder)

  // 更新订单子项目
  const updateOrderItem = useApi(orderAPI.updateOrderItem)

  // 删除订单
  const deleteOrder = useApi(orderAPI.deleteOrder)

  // 删除订单子项目
  const deleteOrderItem = useApi(orderAPI.deleteOrderItem)

  return {
    getAllOrders,
    getOrderItems,
    createOrder,
    createOrderItem,
    updateOrder,
    updateOrderItem,
    deleteOrder,
    deleteOrderItem,
  }
}

export function useShippingService() {
  // 获取发货数据
  const getShipData = useApi<UnshippedItem[]>(orderAPI.getOrders)

  // 删除发货
  const deleteShipping = useApi(orderAPI.deleteShipping)

  // 标记发货
  const markShipped = useApi<{ updated: number }>(orderAPI.markShipped)

  return {
    getShipData,
    deleteShipping,
    markShipped,
  }
}

export function useUnshippedService() {
  const { getShipData, markShipped } = useShippingService()
  const pagination = usePagination<UnshippedItem>({ pageSize: 10000 })

  const fetchUnshippedList = async () => {
    const params = {
      query: 'items',
      发货状态: 0,
      page: 1,
      limit: 10000,
    }

    const result = await getShipData.execute(params)
    if (result) {
      pagination.setPageData(result.data || [], result.count || 0, false)
    }
  }

  const refreshData = async () => {
    pagination.reset()
    await fetchUnshippedList()
  }

  return {
    ...pagination,
    fetchUnshippedList,
    refreshData,
    loading: getShipData.loading,
    error: getShipData.error,
    markShipped,
  }
}
