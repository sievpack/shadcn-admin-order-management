import React, { useEffect, useState } from 'react'
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
import { useShippingList } from '@/queries/shipping/useShippingList'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { shippingAPI } from '@/lib/api'
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
import { ExpandedShippingItems } from './expanded-shipping-items'
import { shippingColumns } from './shipping-columns'
import { type ShippingItem } from './shipping-provider'

const route = getRouteApi('/_authenticated/shippinglist/')

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd')

interface ShippingOrderItem {
  id: number
  订单编号: string
  规格: string
  产品类型: string
  型号: string
  数量: number
  单位: string
  销售单价: number
  金额: number
  合同编号: string
  备注: string
}

interface ShippingDetail {
  发货单号: string
  快递单号: string
  快递公司: string
  客户名称: string
  发货日期: string
  快递费用: number
  备注: string
  总金额: number
  订单项目: ShippingOrderItem[]
}

interface ShippingTableProps {
  refreshKey?: number
  onEditShipping?: (id: number, item: ShippingItem) => void
  onAddItem?: (item: ShippingItem) => void
}

export function ShippingTable({
  refreshKey = 0,
  onEditShipping,
  onAddItem,
}: ShippingTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [childData, setChildData] = useState<
    Record<number, ShippingDetail | null>
  >({})
  const [loadingChildren, setLoadingChildren] = useState<Set<number>>(new Set())

  const search = route.useSearch()
  const navigate = route.useNavigate()

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
  })

  const startDateParam = (search as Record<string, unknown>)?.开始日期 as
    | string
    | undefined
  const endDateParam = (search as Record<string, unknown>)?.结束日期 as
    | string
    | undefined

  const { data: shippingResponse, isLoading } = useShippingList({
    params: {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      query: globalFilter || undefined,
      开始日期: startDateParam,
      结束日期: endDateParam,
      all: false,
    },
  })

  const data = Array.isArray(shippingResponse?.data?.data)
    ? shippingResponse.data.data
    : []
  const total =
    shippingResponse?.data?.count ??
    shippingResponse?.data?.total ??
    (shippingResponse?.data?.data as unknown as { total?: number })?.total ??
    0

  useEffect(() => {
    ensurePageInRange(Math.ceil(total / pagination.pageSize))
  }, [total, pagination.pageSize, ensurePageInRange])

  useEffect(() => {
    if (refreshKey > 0) {
      // TanStack Query handles refetching via queryClient.invalidateQueries
      // This is kept for backward compatibility with parent components
    }
  }, [refreshKey])

  // 当 refreshKey 变化时，清除子数据缓存并重新获取
  useEffect(() => {
    if (refreshKey > 0) {
      setChildData({})
      for (const shippingId of expandedRows) {
        fetchChildData(shippingId)
      }
    }
  }, [refreshKey, expandedRows])

  const handleRefreshDetail = () => {
    setChildData({})
    for (const shippingId of expandedRows) {
      fetchChildData(shippingId)
    }
  }

  const fetchChildData = async (shippingId: number) => {
    setLoadingChildren((prev) => new Set(prev).add(shippingId))
    try {
      const row = data.find((item: any) => item.id === shippingId)
      if (!row) return

      const response = await shippingAPI.getShippingDetail(row.发货单号)
      if (response.data.code === 0) {
        setChildData((prev) => ({
          ...prev,
          [shippingId]: response.data.data,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch shipping detail:', error)
    } finally {
      setLoadingChildren((prev) => {
        const newSet = new Set(prev)
        newSet.delete(shippingId)
        return newSet
      })
    }
  }

  const toggleRow = (row: any) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(row.id)) {
        newSet.delete(row.id)
      } else {
        newSet.add(row.id)
        if (!childData[row.id]) {
          fetchChildData(row.id)
        }
      }
      return newSet
    })
  }

  const columns = shippingColumns({ onEditShipping, onAddItem })

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
        searchPlaceholder='搜索发货单号、快递单号、客户名称...'
        onSearch={(value) => {
          onGlobalFilterChange?.(value)
        }}
        onDateRangeChange={(from, to) => {
          const searchRecord = search as Record<string, unknown>
          const newSearch = {
            ...searchRecord,
            开始日期: from ? formatDate(from) : undefined,
            结束日期: to ? formatDate(to) : undefined,
          }
          navigate({ search: newSearch })
        }}
        onReset={() => {
          navigate({ search: {} })
        }}
        dateRangeFilter={{
          startColumnId: '发货日期',
          endColumnId: '发货日期',
          title: '发货日期',
        }}
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
                          {loadingChildren.has(row.original.id) ? (
                            <div className='py-4 text-center text-muted-foreground'>
                              加载中...
                            </div>
                          ) : (
                            <ExpandedShippingItems
                              detail={childData[row.original.id] || null}
                              onRefresh={handleRefreshDetail}
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
    </div>
  )
}
