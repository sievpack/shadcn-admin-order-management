import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useOrders } from '@/queries/orders/useOrders'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { orderItemAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { ExpandedOrderItems } from './expanded-order-items'
import { type Order, orderListColumns } from './orderlist-columns'

const route = getRouteApi('/_authenticated/orderlist/')

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd')

interface OrderItem {
  id: number
  订单编号: string
  合同编号: string
  订单日期: string
  交货日期: string
  规格: string
  产品类型: string
  型号: string
  数量: number
  单位: string
  销售单价: number
  金额: number
  备注: string
  结算方式: string
  客户物料编号: string
  客户名称: string
  外购: boolean
}

interface OrderListTableProps {
  onViewOrder?: (id: number, order: Order) => void
  onEditOrder?: (id: number, order: Order) => void
  onDeleteOrder?: (id: number) => void
  onBulkDelete?: (ids: number[]) => void
  onEditOrderItem?: (id: number, item: OrderItem) => void
  onDeleteOrderItem?: (id: number) => void
  onAddOrderItem?: (order: Order) => void
  onPrintOrder?: (id: number, orderNumber: string) => void
  refreshKey?: number
}

export function OrderListTable({
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onBulkDelete,
  onEditOrderItem,
  onDeleteOrderItem,
  onAddOrderItem,
  onPrintOrder,
  refreshKey = 0,
}: OrderListTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [childData, setChildData] = useState<Record<number, OrderItem[]>>({})
  const [loadingChildren, setLoadingChildren] = useState<Set<number>>(new Set())

  const search = route.useSearch()
  const navigate = route.useNavigate()

  // 当 refreshKey 变化时，清除子数据缓存并重新获取
  useEffect(() => {
    if (refreshKey > 0) {
      // 清除所有缓存
      setChildData({})
      // 如果有展开的行，重新获取它们的数据
      for (const orderId of expandedRows) {
        fetchChildData(orderId)
      }
    }
  }, [refreshKey, expandedRows])

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [{ columnId: 'status', searchKey: 'status', type: 'array' }],
  })

  const statusFilter = (search as Record<string, unknown>)?.status as
    | string
    | undefined

  const startDateParam = (search as Record<string, unknown>)?.start_date as
    | string
    | undefined
  const endDateParam = (search as Record<string, unknown>)?.end_date as
    | string
    | undefined

  const { data: ordersResponse, isLoading } = useOrders({
    params: {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      query: globalFilter || undefined,
      status: statusFilter,
      start_date: startDateParam,
      end_date: endDateParam,
    },
  })

  const ordersData = ordersResponse?.data?.data || []
  const total = ordersResponse?.data?.total || 0

  const data: Order[] = ordersData.map((item: any) => ({
    id: item.id,
    order_number: item.订单编号,
    customer_name: item.客户名称,
    order_date: item.订单日期,
    delivery_date: item.交货日期,
    status: item.status,
  }))

  const columns = orderListColumns({
    onViewOrder,
    onEditOrder,
    onDeleteOrder,
    onAddOrderItem,
    onPrintOrder,
  })

  const fetchChildData = async (orderId: number) => {
    setLoadingChildren((prev) => new Set(prev).add(orderId))
    try {
      const response = await orderItemAPI.getItemsByOrderId(orderId)
      if (response.data.code === 0) {
        setChildData((prev) => ({
          ...prev,
          [orderId]: response.data.data.list || [],
        }))
      }
    } catch (error) {
      console.error('Failed to fetch child data:', error)
    } finally {
      setLoadingChildren((prev) => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const toggleRow = (order: Order) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(order.id)) {
        newSet.delete(order.id)
      } else {
        newSet.add(order.id)
        if (!childData[order.id]) {
          fetchChildData(order.id)
        }
      }
      return newSet
    })
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: internalSorting,
      pagination,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: true,
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setInternalSorting,
    onPaginationChange,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange,
    onColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: undefined,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        serverPaginationMode={true}
        searchPlaceholder='搜索订单编号或客户名称...'
        onSearch={(value) => {
          onGlobalFilterChange?.(value)
        }}
        onFilterChange={(columnId, value) => {
          const currentFilters = columnFilters || []
          const otherFilters = currentFilters.filter((f) => f.id !== columnId)
          const newFilters = value
            ? [...otherFilters, { id: columnId, value: value.split(',') }]
            : otherFilters
          onColumnFiltersChange?.(newFilters)
        }}
        onDateRangeChange={(from, to) => {
          const searchRecord = search as Record<string, unknown>
          const newSearch = {
            ...searchRecord,
            start_date: from ? formatDate(from) : undefined,
            end_date: to ? formatDate(to) : undefined,
          }
          navigate({ search: newSearch })
        }}
        onReset={() => {
          navigate({ search: {} })
        }}
        dateRangeFilter={{
          startColumnId: 'order_date',
          endColumnId: 'order_date',
          title: '订单日期',
        }}
        filters={[
          {
            columnId: 'status',
            title: '状态',
            options: [
              { label: '未完成', value: 'false' },
              { label: '已完成', value: 'true' },
            ],
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table className='min-w-xl'>
          <TableHeader className='bg-muted/50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className='w-[40px]' />
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className='h-24 text-center'
                >
                  加载中...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && 'selected'}
                    className='group/row'
                  >
                    <TableCell className='w-[40px]'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8'
                        onClick={() => toggleRow(row.original)}
                      >
                        {expandedRows.has(row.original.id) ? (
                          <ChevronDown className='h-4 w-4' />
                        ) : (
                          <ChevronRight className='h-4 w-4' />
                        )}
                      </Button>
                    </TableCell>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                          cell.column.columnDef.meta?.className,
                          cell.column.columnDef.meta?.tdClassName
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRows.has(row.original.id) && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + 1}
                        className='bg-muted/30 p-0'
                      >
                        <div className='p-4'>
                          <div className='mb-2 text-sm font-medium text-muted-foreground'>
                            订单分项 ({childData[row.original.id]?.length || 0}{' '}
                            条)
                          </div>
                          {loadingChildren.has(row.original.id) ? (
                            <div className='py-4 text-center text-muted-foreground'>
                              加载中...
                            </div>
                          ) : (
                            <ExpandedOrderItems
                              items={childData[row.original.id] || []}
                              onEdit={onEditOrderItem}
                              onDelete={onDeleteOrderItem}
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className='h-24 text-center'
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <DataTableBulkActions table={table} onBulkDelete={onBulkDelete!} />
    </div>
  )
}
