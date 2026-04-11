import { useState } from 'react'
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
import { useMaterialConsumptionList } from '@/queries/production'
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
import { TableLoading } from '@/components/table-loading'
import {
  type MaterialConsumption,
  materialConsumptionColumns,
} from './material-consumption-columns'

const route = getRouteApi('/_authenticated/production/material')

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd')

interface MaterialConsumptionTableProps {
  onDelete?: (row: MaterialConsumption) => void
}

export function MaterialConsumptionTable({
  onDelete,
}: MaterialConsumptionTableProps) {
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
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [],
  })

  const startDateParam = (search as Record<string, unknown>)?.start_date as
    | string
    | undefined
  const endDateParam = (search as Record<string, unknown>)?.end_date as
    | string
    | undefined

  const { data: response, isLoading } = useMaterialConsumptionList({
    params: {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      query: globalFilter || undefined,
      start_date: startDateParam,
      end_date: endDateParam,
    },
  })

  const tableData = response?.data?.data || []
  const total = response?.data?.count || response?.data?.total || 0

  const columns = materialConsumptionColumns({ onDelete })

  const table = useReactTable({
    data: tableData,
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
        searchPlaceholder='搜索物料或工单...'
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
          startColumnId: '消耗日期',
          endColumnId: '消耗日期',
          title: '消耗日期',
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
            {isLoading ? (
              <TableLoading colSpan={columns.length} />
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
