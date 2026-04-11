import { useState, useCallback, useMemo, startTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useDictDataByType } from '@/queries/dict/useDictData'
import { useAllOrderItems } from '@/queries/orders/useAllOrderItems'
import { useDeleteOrderItem } from '@/queries/orders/useDeleteOrderItem'
import { useUpdateOrderItem } from '@/queries/orders/useUpdateOrderItem'
import { showToastWithData } from '@/lib/show-submitted-data'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { type OrderItem } from './components/allorders-columns'
import { AllOrdersTable } from './components/allorders-table'
import { OrderItemEditDialog } from './components/orderitem-edit-dialog'
import { OrderItemViewDialog } from './components/orderitem-view-dialog'

const route = getRouteApi('/_authenticated/allorders/')

export function AllOrders() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()

  const { globalFilter, onGlobalFilterChange, pagination, onPaginationChange } =
    useTableUrlState({
      search,
      navigate,
      pagination: { defaultPage: 1, defaultPageSize: 10 },
      globalFilter: { enabled: true, key: 'filter' },
    })

  const syncBeltTypeParam = (search as Record<string, unknown>)
    ?.sync_belt_type as string | undefined
  const specParam = (search as Record<string, unknown>)?.spec as
    | string
    | undefined

  const { data: syncBeltTypeData } = useDictDataByType('sync_belt_pitch')
  const { data: specData } = useDictDataByType('sync_belt_spec')

  const syncBeltTypeOptions = useMemo(() => {
    if (!syncBeltTypeData?.data?.data) return []
    const data = syncBeltTypeData.data.data
    if (!Array.isArray(data)) return []
    return data.map((item: any) => ({
      label: item.dict_label,
      value: item.dict_label,
    }))
  }, [syncBeltTypeData])

  const specOptions = useMemo(() => {
    if (!specData?.data?.data) return []
    const data = specData.data.data
    if (!Array.isArray(data)) return []
    return data.map((item: any) => ({
      label: item.dict_label,
      value: item.dict_label,
    }))
  }, [specData])

  const { data: orderItemsResponse, isLoading } = useAllOrderItems({
    params: {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      query: globalFilter || undefined,
      产品类型: syncBeltTypeParam || undefined,
      规格: specParam || undefined,
    },
  })

  const deleteOrderItemMutation = useDeleteOrderItem()
  const updateOrderItemMutation = useUpdateOrderItem()

  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<OrderItem | null>(null)

  const orderItems = orderItemsResponse?.data?.data || []
  const total =
    orderItemsResponse?.data?.count || orderItemsResponse?.data?.total || 0

  const handleViewItem = useCallback((_id: number, item: OrderItem) => {
    setCurrentItem(item)
    setViewDialogOpen(true)
  }, [])

  const handleEditItem = useCallback((_id: number, item: OrderItem) => {
    setCurrentItem(item)
    setEditDialogOpen(true)
  }, [])

  const handleSaveItem = useCallback(
    async (data: Partial<OrderItem>) => {
      try {
        const response = await updateOrderItemMutation.mutateAsync(data as any)
        queryClient.invalidateQueries({ queryKey: ['orderItems'] })
        showToastWithData({
          type: 'success',
          title: '更新成功',
          data,
        })
        return response
      } catch (error: any) {
        console.error('更新订单分项失败:', error)
        showToastWithData({
          type: 'error',
          title: '更新失败',
          data: { error: error.message },
        })
        throw error
      }
    },
    [updateOrderItemMutation, queryClient]
  )

  const handleDeleteOrderItem = useCallback(
    async (id: number) => {
      try {
        await deleteOrderItemMutation.mutateAsync(id)
        showToastWithData({
          type: 'success',
          title: '删除成功',
          data: { id },
        })
        return true
      } catch (error: any) {
        showToastWithData({
          type: 'error',
          title: '删除失败',
          data: { error: error.message },
        })
        return false
      }
    },
    [deleteOrderItemMutation]
  )

  const handleBulkDelete = useCallback(
    async (ids: number[]) => {
      try {
        for (const id of ids) {
          await deleteOrderItemMutation.mutateAsync(id)
        }
        showToastWithData({
          type: 'success',
          title: `成功删除 ${ids.length} 条订单分项`,
          data: { 删除数量: ids.length },
        })
      } catch (error: any) {
        showToastWithData({
          type: 'error',
          title: '批量删除失败',
          data: { error: error.message },
        })
      }
    },
    [deleteOrderItemMutation]
  )

  const handleSyncBeltTypeFilterChange = useCallback(
    (value: string | undefined) => {
      startTransition(() => {
        navigate((prevSearch) => {
          const currentSearch = (prevSearch || {}) as Record<string, unknown>
          return {
            search: {
              ...currentSearch,
              sync_belt_type: value || undefined,
            },
          }
        })
      })
    },
    [navigate]
  )

  const handleSpecFilterChange = useCallback(
    (value: string | undefined) => {
      startTransition(() => {
        navigate((prevSearch) => {
          const currentSearch = (prevSearch || {}) as Record<string, unknown>
          return {
            search: {
              ...currentSearch,
              spec: value || undefined,
            },
          }
        })
      })
    },
    [navigate]
  )

  return (
    <>
      <AppHeader />

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>订单分项</h2>
            <p className='text-muted-foreground'>查看所有订单的分项明细</p>
          </div>
        </div>

        <AllOrdersTable
          data={orderItems}
          total={total}
          loading={isLoading}
          serverPagination={true}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          globalFilter={globalFilter}
          onGlobalFilterChange={onGlobalFilterChange}
          onBulkDelete={handleBulkDelete}
          onDeleteItem={handleDeleteOrderItem}
          onViewItem={handleViewItem}
          onEditItem={handleEditItem}
          syncBeltTypeOptions={syncBeltTypeOptions}
          syncBeltTypeFilter={syncBeltTypeParam}
          onSyncBeltTypeFilterChange={handleSyncBeltTypeFilterChange}
          specOptions={specOptions}
          specFilter={specParam}
          onSpecFilterChange={handleSpecFilterChange}
          onReset={() => {
            navigate({ search: {} })
          }}
        />
      </Main>

      <OrderItemViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        item={currentItem}
      />

      <OrderItemEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        item={currentItem}
        onSave={handleSaveItem}
      />
    </>
  )
}
