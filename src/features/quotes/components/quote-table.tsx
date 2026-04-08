import { useState, useMemo, useCallback } from 'react'
import {
  type SortingState,
  type VisibilityState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type OnChangeFn,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { quoteColumns } from './quote-columns'
import { type Quote } from './quote-provider'

interface QuoteTableProps {
  data: Quote[]
  total?: number
  loading?: boolean
  serverPagination?: boolean
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  globalFilter?: string
  onGlobalFilterChange?: OnChangeFn<string>
  columnFilters?: { id: string; value: unknown }[]
  onColumnFiltersChange?: OnChangeFn<{ id: string; value: unknown }[]>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  onSearch?: (query: string) => void
  onFilterChange?: (columnId: string, value: string | undefined) => void
  onDateRangeChange?: (from: Date | undefined, to: Date | undefined) => void
  onReset?: () => void
}

export function QuoteTable({
  data,
  total = 0,
  loading = false,
  serverPagination = false,
  pagination,
  onPaginationChange,
  globalFilter: externalGlobalFilter,
  onGlobalFilterChange: externalOnGlobalFilterChange,
  columnFilters,
  onColumnFiltersChange: _externalOnColumnFiltersChange,
  sorting: externalSorting,
  onSortingChange: externalOnSortingChange,
  onSearch,
  onFilterChange,
  onDateRangeChange,
  onReset,
}: QuoteTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [internalSorting, setInternalSorting] = useState<SortingState>([
    { id: 'id', desc: false },
  ])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [internalGlobalFilter, setInternalGlobalFilter] = useState('')

  const effectiveSorting = serverPagination
    ? (externalSorting ?? internalSorting)
    : internalSorting
  const onSortingChange: OnChangeFn<SortingState> | undefined = serverPagination
    ? (externalOnSortingChange ?? setInternalSorting)
    : setInternalSorting

  const effectiveGlobalFilter = serverPagination
    ? (externalGlobalFilter ?? '')
    : internalGlobalFilter
  const onGlobalFilterChangeFn: OnChangeFn<string> | undefined =
    serverPagination ? externalOnGlobalFilterChange : setInternalGlobalFilter

  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    {
      pageIndex: 0,
      pageSize: 10,
    }
  )

  const handleInternalPaginationChange: OnChangeFn<PaginationState> = (
    updater
  ) => {
    const newPagination =
      typeof updater === 'function' ? updater(internalPagination) : updater
    setInternalPagination(newPagination)
  }

  const effectivePagination = serverPagination
    ? (pagination ?? internalPagination)
    : internalPagination

  const pageCount = serverPagination
    ? Math.ceil(total / effectivePagination.pageSize)
    : undefined

  const columns = useMemo(() => quoteColumns(), [])

  const handleSearchChange = useCallback(
    (value: string) => {
      if (serverPagination && onSearch) {
        onSearch(value)
      }
      onGlobalFilterChangeFn?.(value)
    },
    [serverPagination, onSearch, onGlobalFilterChangeFn]
  )

  const handleFilterChange = useCallback(
    (columnId: string, value: string | undefined) => {
      if (serverPagination && onFilterChange) {
        onFilterChange(columnId, value)
      }
    },
    [serverPagination, onFilterChange]
  )

  const handleDateRangeChange = useCallback(
    (from: Date | undefined, to: Date | undefined) => {
      if (serverPagination && onDateRangeChange) {
        onDateRangeChange(from, to)
      }
    },
    [serverPagination, onDateRangeChange]
  )

  const handleReset = useCallback(() => {
    if (serverPagination && onReset) {
      onReset()
    }
  }, [serverPagination, onReset])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: effectiveSorting,
      pagination: effectivePagination,
      columnVisibility,
      rowSelection,
      globalFilter: effectiveGlobalFilter,
      columnFilters: serverPagination ? (columnFilters ?? []) : [],
    },
    enableRowSelection: true,
    manualPagination: serverPagination,
    pageCount,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onPaginationChange: serverPagination
      ? onPaginationChange
      : handleInternalPaginationChange,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: onGlobalFilterChangeFn,
    globalFilterFn: serverPagination
      ? undefined
      : (row, _columnId, filterValue) => {
          const customerName = String(
            row.getValue('客户名称') || ''
          ).toLowerCase()
          const quoteNumber = String(
            row.getValue('报价单号') || ''
          ).toLowerCase()
          const searchValue = String(filterValue).toLowerCase()

          return (
            customerName.includes(searchValue) ||
            quoteNumber.includes(searchValue)
          )
        },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: serverPagination ? undefined : getFilteredRowModel(),
    getPaginationRowModel: serverPagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: serverPagination ? undefined : getFacetedRowModel(),
    getFacetedUniqueValues: serverPagination
      ? undefined
      : getFacetedUniqueValues(),
  })

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        serverPaginationMode={serverPagination}
        searchPlaceholder='搜索客户名称、报价单号...'
        onSearch={handleSearchChange}
        onFilterChange={handleFilterChange}
        onDateRangeChange={handleDateRangeChange}
        onReset={handleReset}
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'px-4',
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
      <DataTablePagination
        table={table}
        serverPaginationMode={serverPagination}
        className='mt-auto'
      />
    </div>
  )
}
