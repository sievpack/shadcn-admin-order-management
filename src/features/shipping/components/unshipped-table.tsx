import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { orderAPI } from '@/lib/api'
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
  DataTableToolbar,
  DataTableBulkActions,
  DataTablePagination,
} from '@/components/data-table'
import { unshippedColumns, type UnshippedItem } from './unshipped-columns'

const route = getRouteApi('/_authenticated/unshippedlist/')

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd')

interface UnshippedTableProps {
  onBulkMarkAsShipped?: (items: UnshippedItem[]) => void
  onViewItem?: (id: number, item: UnshippedItem) => void
  refreshKey?: number
}

export function UnshippedTable({
  onBulkMarkAsShipped,
  onViewItem,
  refreshKey = 0,
}: UnshippedTableProps) {
  const [data, setData] = useState<UnshippedItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [internalSorting, setInternalSorting] = useState<SortingState>([
    { id: 'id', desc: true },
  ])

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

  const startDateParam = (search as Record<string, unknown>)?.start_date as
    | string
    | undefined
  const endDateParam = (search as Record<string, unknown>)?.end_date as
    | string
    | undefined

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await orderAPI.getOrders({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        query: globalFilter || undefined,
        items: true,
        发货状态: 0,
        start_date: startDateParam,
        end_date: endDateParam,
      })

      if (response.data.code === 0) {
        const unshippedData = Array.isArray(response.data.data)
          ? response.data.data
          : []
        setData(unshippedData)
        setTotal(response.data.count || response.data.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch unshipped list:', error)
    } finally {
      setLoading(false)
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    globalFilter,
    startDateParam,
    endDateParam,
  ])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [globalFilter])

  useEffect(() => {
    ensurePageInRange(Math.ceil(total / pagination.pageSize))
  }, [total, pagination.pageSize, ensurePageInRange])

  useEffect(() => {
    if (refreshKey > 0) {
      setRowSelection({})
      fetchData()
    }
  }, [refreshKey])

  const columns = unshippedColumns({ onViewItem })

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
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original)

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
        searchPlaceholder='搜索合同编号、客户名称、规格、产品类型或型号...'
        onSearch={(value) => {
          onGlobalFilterChange?.(value)
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
          startColumnId: '订单日期',
          endColumnId: '订单日期',
          title: '订单日期',
        }}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table className='min-w-xl'>
          <TableHeader className='bg-muted/50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  加载中...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
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

      {selectedRows.length > 0 && onBulkMarkAsShipped && (
        <DataTableBulkActions table={table} entityName='未发货订单'>
          <Button
            variant='default'
            size='sm'
            onClick={() => onBulkMarkAsShipped(selectedRows)}
          >
            批量发货
          </Button>
        </DataTableBulkActions>
      )}
    </div>
  )
}
