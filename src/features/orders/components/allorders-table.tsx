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
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
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
import {
  DataTablePagination,
  DataTableToolbar,
  DataTableBulkActions,
} from '@/components/data-table'
import { TableLoading } from '@/components/table-loading'
import { allOrdersColumns } from './allorders-columns'
import { type OrderItem } from './allorders-columns'
import { OrderItemMultiDeleteDialog } from './orderitem-multi-delete-dialog'

interface AllOrdersTableProps {
  data: OrderItem[]
  total?: number
  onBulkDelete: (ids: number[]) => void
  onViewItem?: (id: number, item: OrderItem) => void
  onEditItem?: (id: number, item: OrderItem) => void
  onDeleteItem?: (id: number) => void
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
  onDateRangeChange?: (from: Date | undefined, to: Date | undefined) => void
  onReset?: () => void
  /** 同步带类型筛选选项 */
  syncBeltTypeOptions?: { label: string; value: string }[]
  /** 同步带类型筛选值 */
  syncBeltTypeFilter?: string
  onSyncBeltTypeFilterChange?: (value: string | undefined) => void
  /** 规格筛选选项 */
  specOptions?: { label: string; value: string }[]
  /** 规格筛选值 */
  specFilter?: string
  onSpecFilterChange?: (value: string | undefined) => void
}

export function AllOrdersTable({
  data,
  total = 0,
  onBulkDelete,
  onViewItem,
  onEditItem,
  onDeleteItem,
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
  onDateRangeChange,
  onReset,
  syncBeltTypeOptions = [],
  syncBeltTypeFilter,
  onSyncBeltTypeFilterChange,
  specOptions = [],
  specFilter,
  onSpecFilterChange,
}: AllOrdersTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [internalSorting, setInternalSorting] = useState<SortingState>([
    { id: 'id', desc: true },
  ])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [internalGlobalFilter, setInternalGlobalFilter] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
  const effectivePagination = serverPagination
    ? (pagination ?? internalPagination)
    : internalPagination

  const handleInternalPaginationChange: OnChangeFn<PaginationState> = (
    updater
  ) => {
    const newPagination =
      typeof updater === 'function' ? updater(internalPagination) : updater
    setInternalPagination(newPagination)
  }

  const pageCount = serverPagination
    ? Math.ceil(total / effectivePagination.pageSize)
    : undefined

  const columns = useMemo(
    () => allOrdersColumns({ onViewItem, onEditItem, onDeleteItem }),
    [onViewItem, onEditItem, onDeleteItem]
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      if (serverPagination && onSearch) {
        onSearch(value)
      }
      onGlobalFilterChangeFn?.(value)
    },
    [serverPagination, onSearch, onGlobalFilterChangeFn]
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
    if (serverPagination) {
      onReset?.()
      onGlobalFilterChangeFn?.('')
    }
  }, [serverPagination, onReset, onGlobalFilterChangeFn])

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
          const contractNo = String(
            row.getValue('合同编号') || ''
          ).toLowerCase()
          const spec = String(row.getValue('规格') || '').toLowerCase()
          const model = String(row.getValue('型号') || '').toLowerCase()
          const customerName = String(
            row.getValue('客户名称') || ''
          ).toLowerCase()
          const searchValue = String(filterValue).toLowerCase()

          return (
            contractNo.includes(searchValue) ||
            spec.includes(searchValue) ||
            model.includes(searchValue) ||
            customerName.includes(searchValue)
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

  // 获取选中的行ID
  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)

  // 处理批量删除确认
  const handleBulkDelete = () => {
    if (selectedRows.length > 0) {
      setShowDeleteConfirm(true)
    }
  }

  const handleSyncBeltTypeFilterChange = useCallback(
    (_columnId: string, value: string | undefined) => {
      if (serverPagination) {
        const currentFilters = columnFilters || []
        const otherFilters = currentFilters.filter((f) => f.id !== _columnId)
        const newFilters = value
          ? [...otherFilters, { id: _columnId, value: value.split(',') }]
          : otherFilters
        const allFilterValues: Record<string, string | undefined> = {}
        for (const f of newFilters) {
          allFilterValues[f.id] = (f.value as string[]).join(',')
        }
        onSyncBeltTypeFilterChange?.(allFilterValues['产品类型'])
        onSpecFilterChange?.(allFilterValues['规格'])
      }
    },
    [serverPagination, onSyncBeltTypeFilterChange, onSpecFilterChange]
  )

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
        searchPlaceholder='客户名称/发货单号/快递单号...'
        onSearch={handleSearchChange}
        onFilterChange={handleSyncBeltTypeFilterChange}
        onDateRangeChange={handleDateRangeChange}
        onReset={handleReset}
        filters={[
          ...(syncBeltTypeOptions.length > 0
            ? [
                {
                  columnId: '产品类型',
                  title: '同步带类型',
                  options: syncBeltTypeOptions,
                },
              ]
            : []),
          ...(specOptions.length > 0
            ? [
                {
                  columnId: '规格',
                  title: '规格',
                  options: specOptions,
                },
              ]
            : []),
        ]}
        filterValues={
          serverPagination
            ? {
                ...(syncBeltTypeFilter ? { 产品类型: syncBeltTypeFilter } : {}),
                ...(specFilter ? { 规格: specFilter } : {}),
              }
            : undefined
        }
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
              <TableLoading colSpan={columns.length + 1} />
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
        serverPaginationMode={serverPagination}
        onPageChange={(page) => {
          if (serverPagination && onPaginationChange) {
            onPaginationChange({
              pageIndex: page - 1,
              pageSize: table.getState().pagination.pageSize,
            })
          }
        }}
        onPageSizeChange={(pageSize) => {
          if (serverPagination && onPaginationChange) {
            onPaginationChange({
              pageIndex: 0,
              pageSize,
            })
          }
        }}
        className='mt-auto'
      />

      {/* 底部操作栏 - 选中行后显示 */}
      <DataTableBulkActions table={table} entityName='order item'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={handleBulkDelete}
              className='size-8'
              aria-label='Delete selected items'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除选中项</p>
          </TooltipContent>
        </Tooltip>
      </DataTableBulkActions>

      {/* 批量删除确认对话框 */}
      <OrderItemMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
        onBulkDelete={onBulkDelete}
      />
    </div>
  )
}
