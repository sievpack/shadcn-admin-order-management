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
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { productionPlanAPI } from '@/lib/production-api'
import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import {
  type ProductionPlan,
  productionPlanColumns,
} from './production-plan-columns'

const route = getRouteApi('/_authenticated/production/plan')

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd')

interface ProductionPlanTableProps {
  onView?: (row: ProductionPlan) => void
  onEdit?: (row: ProductionPlan) => void
  onDelete?: (row: ProductionPlan) => void
  onApprove?: (row: ProductionPlan) => void
  onReject?: (row: ProductionPlan) => void
  refreshKey?: number
}

export function ProductionPlanTable({
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  refreshKey = 0,
}: ProductionPlanTableProps) {
  const [data, setData] = useState<ProductionPlan[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [internalSorting, setInternalSorting] = useState<SortingState>([])

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
    columnFilters: [{ columnId: 'status', searchKey: 'status', type: 'array' }],
  })

  const statusFilter = (search as Record<string, unknown>)?.status as
    | string[]
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
      const response = await productionPlanAPI.getList({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        query: globalFilter || undefined,
        status: statusFilter,
        start_date: startDateParam,
        end_date: endDateParam,
      })

      if (response.data.code === 0) {
        const listData = Array.isArray(response.data.data)
          ? response.data.data
          : []
        setData(listData)
        setTotal(response.data.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch production plans:', error)
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

  useEffect(() => {
    ensurePageInRange(Math.ceil(total / pagination.pageSize))
  }, [total, pagination.pageSize, ensurePageInRange])

  useEffect(() => {
    if (refreshKey > 0) {
      fetchData()
    }
  }, [refreshKey])

  const columns = productionPlanColumns({
    onView,
    onEdit,
    onDelete,
    onApprove,
    onReject,
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
        searchPlaceholder='搜索计划编号或名称...'
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
          startColumnId: '创建日期',
          endColumnId: '创建日期',
          title: '创建日期',
        }}
        filters={[]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table className='min-w-xl'>
          <TableHeader className='bg-muted/50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
                    <TableCell key={cell.id}>
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
    </div>
  )
}
