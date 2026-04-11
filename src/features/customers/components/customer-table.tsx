import { useState, useEffect } from 'react'
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
import { useCustomers } from '@/queries/customers/useCustomers'
import { customerAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
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
import {
  MultiDeleteDialog,
  DataTableBulkActions,
  presetBulkActions,
} from '@/components/common'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { customerColumns } from './customer-columns'
import { type Customer } from './customer-provider'
import { useCustomer } from './customer-provider'

const route = getRouteApi('/_authenticated/customerlist/')

interface CustomerTableProps {
  onRefresh?: () => void
}

export function CustomerTable({ onRefresh }: CustomerTableProps) {
  const { setRefreshData, refreshData } = useCustomer()
  const [rowSelection, setRowSelection] = useState({})
  const [showMultiDelete, setShowMultiDelete] = useState(false)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [internalSorting] = useState<SortingState>([
    { id: '客户名称', desc: false },
  ])

  // 设置 refreshData 回调
  useEffect(() => {
    setRefreshData(() => () => {
      onRefresh?.()
    })
  }, [setRefreshData, onRefresh])

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
    columnFilters: [
      { columnId: '状态', searchKey: 'status', type: 'array' },
      { columnId: '结算方式', searchKey: 'settlement', type: 'array' },
    ],
  })

  const statusFilter = (search as Record<string, unknown>)?.status as
    | string
    | undefined
  const settlementFilter = (search as Record<string, unknown>)?.settlement as
    | string
    | undefined

  const { data: customersResponse, isLoading } = useCustomers({
    params: {
      query: 'list',
      search: globalFilter || undefined,
      status: statusFilter || undefined,
      settlement: settlementFilter || undefined,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    },
  })

  const data = customersResponse?.data?.data || []
  const total =
    customersResponse?.data?.count || customersResponse?.data?.total || 0

  const columns = customerColumns()

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

  const handleBulkDelete = async (ids: (number | string)[]) => {
    try {
      for (const id of ids) {
        await customerAPI.deleteCustomer(id as number)
      }
      showToastWithData({
        type: 'success',
        title: `成功删除 ${ids.length} 个客户`,
        data: { count: ids.length },
      })
      setRowSelection({})
      onRefresh?.()
      refreshData()
    } catch (error: any) {
      showToastWithData({
        type: 'error',
        title: '批量删除失败',
        data: { error: error.message },
      })
    }
  }

  const bulkActions = [presetBulkActions.delete(() => setShowMultiDelete(true))]

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
        searchPlaceholder='搜索客户名称、联系人、联系电话...'
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
            columnId: '结算方式',
            title: '结算方式',
            options: [
              { label: '现结', value: '现结' },
              { label: '月结', value: '月结' },
              { label: '账期', value: '账期' },
            ],
          },
          {
            columnId: '状态',
            title: '状态',
            options: [
              { label: '活跃', value: '活跃' },
              { label: '停用', value: '停用' },
              { label: '潜在', value: '潜在' },
            ],
          },
        ]}
      />
      <DataTableBulkActions
        table={table}
        actions={bulkActions}
        entityName='客户'
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
            {isLoading ? (
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
      <MultiDeleteDialog
        open={showMultiDelete}
        onOpenChange={setShowMultiDelete}
        table={table}
        entityName='客户'
        onBulkDelete={handleBulkDelete}
      />
    </div>
  )
}
