import { useState, useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useDictDataByType } from '@/queries/dict/useDictData'
import { useAllOrderItems } from '@/queries/orders/useAllOrderItems'
import { useDeleteOrderItem } from '@/queries/orders/useDeleteOrderItem'
import { useUpdateOrderItem } from '@/queries/orders/useUpdateOrderItem'
import { toast } from 'sonner'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
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

  const specParam = (search as Record<string, unknown>)?.spec as
    | string
    | undefined
  const modelParam = (search as Record<string, unknown>)?.model as
    | string
    | undefined
  const syncBeltTypeParam = (search as Record<string, unknown>)
    ?.sync_belt_type as string | undefined

  const { data: syncBeltTypeData } = useDictDataByType('sync_belt_pitch')

  const syncBeltTypeOptions = useMemo(() => {
    if (!syncBeltTypeData?.data?.data) return []
    const data = syncBeltTypeData.data.data
    if (!Array.isArray(data)) return []
    return data.map((item: any) => ({
      label: item.dict_label,
      value: item.dict_label, // 使用 dict_label 作为 value，确保唯一性
    }))
  }, [syncBeltTypeData])

  const { data: orderItemsResponse, isLoading } = useAllOrderItems({
    params: {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      query: globalFilter || undefined,
      规格: specParam || undefined,
      型号: modelParam || undefined,
      产品类型: syncBeltTypeParam || undefined,
    },
  })

  const deleteOrderItemMutation = useDeleteOrderItem()
  const updateOrderItemMutation = useUpdateOrderItem()

  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<OrderItem | null>(null)

  const orderItems = orderItemsResponse?.data?.data || []
  const total = orderItemsResponse?.data?.total || 0

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
        await updateOrderItemMutation.mutateAsync(data as any)
        queryClient.invalidateQueries({ queryKey: ['orderItems'] })
      } catch (error) {
        console.error('更新订单分项失败:', error)
        throw error
      }
    },
    [updateOrderItemMutation, queryClient]
  )

  const handleDeleteOrderItem = useCallback(
    async (id: number) => {
      try {
        await deleteOrderItemMutation.mutateAsync(id)
        return true
      } catch {
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
        toast.success(`成功删除 ${ids.length} 条订单分项`)
      } catch {
        toast.error('批量删除失败，请稍后重试')
      }
    },
    [deleteOrderItemMutation]
  )

  const handleSpecFilterChange = useCallback(
    (value: string) => {
      const currentSearch = search as Record<string, unknown>
      navigate({
        search: {
          ...currentSearch,
          spec: value || undefined,
        },
      })
    },
    [search, navigate]
  )

  const handleModelFilterChange = useCallback(
    (value: string) => {
      const currentSearch = search as Record<string, unknown>
      navigate({
        search: {
          ...currentSearch,
          model: value || undefined,
        },
      })
    },
    [search, navigate]
  )

  const handleSyncBeltTypeFilterChange = useCallback(
    (value: string | undefined) => {
      const currentSearch = search as Record<string, unknown>
      navigate({
        search: {
          ...currentSearch,
          sync_belt_type: value || undefined,
        },
      })
    },
    [search, navigate]
  )

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
          specFilter={specParam}
          onSpecFilterChange={handleSpecFilterChange}
          modelFilter={modelParam}
          onModelFilterChange={handleModelFilterChange}
          syncBeltTypeOptions={syncBeltTypeOptions}
          syncBeltTypeFilter={syncBeltTypeParam}
          onSyncBeltTypeFilterChange={handleSyncBeltTypeFilterChange}
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
