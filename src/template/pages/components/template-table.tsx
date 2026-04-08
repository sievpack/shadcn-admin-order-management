import React, { useEffect, useState, useCallback, useRef } from 'react'
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
import { ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react'
import { orderItemAPI, orderListAPI } from '@/lib/api'
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
import { type Order, templateColumns, type OrderItem } from './template-columns'

const route = getRouteApi('/_authenticated/template/')

interface TemplateTableProps {
  onViewOrder?: (id: number, order: Order) => void
  onEditOrder?: (id: number, order: Order) => void
  onDeleteOrder?: (id: number) => void
  onBulkDelete?: (ids: number[]) => void
  onEditOrderItem?: (id: number, item: OrderItem) => void
  onDeleteOrderItem?: (id: number) => void
  onAddOrderItem?: (order: Order) => void
  refreshKey?: number
  expandedRows?: Set<number>
  onExpandedRowsChange?: (expanded: Set<number>) => void
}

export function TemplateTable({
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onBulkDelete,
  onEditOrderItem,
  onDeleteOrderItem,
  onAddOrderItem,
  refreshKey = 0,
  expandedRows: externalExpandedRows,
  onExpandedRowsChange,
}: TemplateTableProps) {
  const [data, setData] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility] = useState<VisibilityState>({})
  const [internalSorting] = useState<SortingState>([])
  const [internalExpandedRows, setInternalExpandedRows] = useState<Set<number>>(
    new Set()
  )
  const [childData, setChildData] = useState<Record<number, OrderItem[]>>({})
  const [loadingChildren, setLoadingChildren] = useState<Set<number>>(new Set())

  const expandedRows = externalExpandedRows ?? internalExpandedRows
  const setExpandedRows = onExpandedRowsChange ?? setInternalExpandedRows

  const search = route.useSearch()
  const navigate = route.useNavigate()

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
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

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await orderListAPI.getOrders({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        query: globalFilter || undefined,
        status: statusFilter,
        start_date: startDateParam,
        end_date: endDateParam,
        ...(Array.isArray(statusFilter) &&
          statusFilter.length === 1 && { status: statusFilter[0] }),
      })

      if (response.data.code === 0) {
        const ordersData = Array.isArray(response.data.data)
          ? response.data.data
          : []
        const transformedOrders = ordersData.map((item: any) => ({
          id: item.id,
          order_number: item.订单编号,
          customer_name: item.客户名称,
          order_date: item.订单日期,
          delivery_date: item.交货日期,
          status: item.status,
        }))
        setData(transformedOrders)
        setTotal(response.data.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    globalFilter,
    statusFilter,
    startDateParam,
    endDateParam,
  ])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const prevRefreshKeyRef = useRef(refreshKey)

  useEffect(() => {
    if (refreshKey > 0 && refreshKey !== prevRefreshKeyRef.current) {
      prevRefreshKeyRef.current = refreshKey
      fetchData()
    }
  }, [refreshKey, fetchData])

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
    const newSet = new Set(expandedRows)
    if (newSet.has(order.id)) {
      newSet.delete(order.id)
    } else {
      newSet.add(order.id)
      if (!childData[order.id]) {
        fetchChildData(order.id)
      }
    }
    setExpandedRows(newSet)
  }

  const columns = templateColumns({
    onViewOrder,
    onEditOrder,
    onDeleteOrder,
    onAddOrderItem,
  })

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
    onSortingChange: () => {},
    onPaginationChange,
    onColumnVisibilityChange: () => {},
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
        onReset={() => {
          navigate({})
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
            {loading ? (
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
                          ) : childData[row.original.id]?.length ? (
                            <Table>
                              <TableHeader className='bg-muted/50'>
                                <TableRow>
                                  <TableHead>产品类型</TableHead>
                                  <TableHead>规格</TableHead>
                                  <TableHead>型号</TableHead>
                                  <TableHead className='text-right'>
                                    数量
                                  </TableHead>
                                  <TableHead>单位</TableHead>
                                  <TableHead className='text-right'>
                                    销售单价
                                  </TableHead>
                                  <TableHead className='text-right'>
                                    金额
                                  </TableHead>
                                  <TableHead>备注</TableHead>
                                  <TableHead>客户物料编号</TableHead>
                                  <TableHead className='w-[80px]'>
                                    操作
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {childData[row.original.id].map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>{item.产品类型}</TableCell>
                                    <TableCell>{item.规格}</TableCell>
                                    <TableCell>{item.型号}</TableCell>
                                    <TableCell className='text-right'>
                                      {item.数量}
                                    </TableCell>
                                    <TableCell>{item.单位}</TableCell>
                                    <TableCell className='text-right'>
                                      {item.销售单价}
                                    </TableCell>
                                    <TableCell className='text-right'>
                                      {item.金额}
                                    </TableCell>
                                    <TableCell>{item.备注 || '-'}</TableCell>
                                    <TableCell>
                                      {item.客户物料编号 || '-'}
                                    </TableCell>
                                    <TableCell>
                                      <div className='flex gap-1'>
                                        {onEditOrderItem && (
                                          <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8'
                                            onClick={() =>
                                              onEditOrderItem(item.id, item)
                                            }
                                          >
                                            <Edit className='h-4 w-4' />
                                          </Button>
                                        )}
                                        {onDeleteOrderItem && (
                                          <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 text-red-500'
                                            onClick={() =>
                                              onDeleteOrderItem(item.id)
                                            }
                                          >
                                            <Trash2 className='h-4 w-4' />
                                          </Button>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className='py-4 text-center text-muted-foreground'>
                              暂无订单分项
                            </div>
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
