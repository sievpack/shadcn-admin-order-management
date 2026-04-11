import React, { useState, useEffect, useCallback, useRef } from 'react'
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
import { ChevronDown, ChevronRight, Loader2, Plus, Minus } from 'lucide-react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { TableLoading } from '@/components/table-loading'
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
  const [isAllExpanded, setIsAllExpanded] = useState(false)
  const autoExpandedRef = useRef(false)

  const search = route.useSearch()
  const navigate = route.useNavigate()

  const fetchChildData = useCallback((orderId: number) => {
    setLoadingChildren((prev) => new Set(prev).add(orderId))
    orderItemAPI
      .getItemsByOrderId(orderId)
      .then((response) => {
        if (response.data.code === 0) {
          setChildData((prev) => ({
            ...prev,
            [orderId]: response.data.data.list || [],
          }))
        }
      })
      .catch((error) => {
        console.error('Failed to fetch child data:', error)
      })
      .finally(() => {
        setLoadingChildren((prev) => {
          const newSet = new Set(prev)
          newSet.delete(orderId)
          return newSet
        })
      })
  }, [])

  // 当 refreshKey 变化时，清除子数据缓存并重新获取
  useEffect(() => {
    if (refreshKey > 0) {
      setChildData({})
      for (const orderId of expandedRows) {
        fetchChildData(orderId)
      }
    }
  }, [refreshKey, expandedRows, fetchChildData])

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
    columnFilters: [
      { columnId: '发货状态', searchKey: '发货状态', type: 'array' },
    ],
  })

  const 发货状态Filter = (search as Record<string, unknown>)?.发货状态 as
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
      发货状态: 发货状态Filter,
      start_date: startDateParam,
      end_date: endDateParam,
    },
  })

  const ordersData = ordersResponse?.data?.data || []
  const total = ordersResponse?.data?.count || ordersResponse?.data?.total || 0

  const data: Order[] = ordersData.map((item: any) => ({
    id: item.id,
    order_number: item.订单编号,
    customer_name: item.客户名称,
    order_date: item.订单日期,
    delivery_date: item.交货日期,
    发货状态: item.发货状态,
  }))

  // 自动展开逾期订单（部分发货或未发货且交期 <= 今天）
  useEffect(() => {
    if (data.length > 0 && !autoExpandedRef.current) {
      autoExpandedRef.current = true
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const overdueIds = data
        .filter((order) => {
          if (order.发货状态 === 'shipped') return false
          if (order.发货状态 === undefined) return false
          if (!order.delivery_date) return false
          const deliveryDate = new Date(order.delivery_date)
          deliveryDate.setHours(0, 0, 0, 0)
          return deliveryDate <= today
        })
        .map((order) => order.id)
      if (overdueIds.length > 0) {
        setExpandedRows((prev) => {
          const newSet = new Set(prev)
          for (const id of overdueIds) {
            newSet.add(id)
          }
          return newSet
        })
        for (const id of overdueIds) {
          fetchChildData(id)
        }
      }
    }
  }, [data, fetchChildData])

  // 重置自动展开标记当数据加载时
  useEffect(() => {
    autoExpandedRef.current = false
    setIsAllExpanded(false)
  }, [pagination.pageIndex])

  // 监听 expandedRows 变化，手动全部折叠时更新 isAllExpanded
  useEffect(() => {
    if (isAllExpanded && expandedRows.size === 0) {
      setIsAllExpanded(false)
    }
  }, [expandedRows, isAllExpanded])

  const columns = orderListColumns({
    onViewOrder,
    onEditOrder,
    onDeleteOrder,
    onAddOrderItem,
    onPrintOrder,
  })

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
            columnId: '发货状态',
            title: '发货状态',
            options: [
              { label: '未发货', value: 'pending' },
              { label: '部分发货', value: 'partial' },
              { label: '已发货', value: 'shipped' },
            ],
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table className='min-w-xl'>
          <TableHeader className='bg-muted/50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className='w-[40px]'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6'
                        onClick={() => {
                          if (isAllExpanded) {
                            setExpandedRows(new Set())
                            setIsAllExpanded(false)
                          } else {
                            const allIds = data.map((order) => order.id)
                            setExpandedRows((prev) => {
                              const newSet = new Set(prev)
                              for (const id of allIds) {
                                newSet.add(id)
                                if (!childData[id]) {
                                  fetchChildData(id)
                                }
                              }
                              return newSet
                            })
                            setIsAllExpanded(true)
                          }
                        }}
                      >
                        {isAllExpanded ? (
                          <Minus data-icon='inline-start' />
                        ) : (
                          <Plus data-icon='inline-start' />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isAllExpanded ? '全部折叠' : '全部展开'}
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
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
              <TableLoading colSpan={columns.length + 1} />
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
                          <ChevronDown data-icon='inline-start' />
                        ) : (
                          <ChevronRight data-icon='inline-start' />
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
                            <div className='py-4 text-center'>
                              <Loader2 className='mx-auto h-5 w-5 animate-spin text-muted-foreground' />
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
      <DataTablePagination
        table={table}
        serverPaginationMode={true}
        onPageChange={(page) => {
          onPaginationChange?.({
            pageIndex: page - 1,
            pageSize: pagination.pageSize,
          })
        }}
        onPageSizeChange={(pageSize) => {
          onPaginationChange?.({ pageIndex: 0, pageSize })
        }}
        className='mt-auto'
      />
      <DataTableBulkActions table={table} onBulkDelete={onBulkDelete!} />
    </div>
  )
}
