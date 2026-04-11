import { useState } from 'react'
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
import { useDictData } from '@/queries/dict'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
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
  DataTablePagination,
  DataTableToolbar,
  DataTableBulkActions,
} from '@/components/data-table'
import { TableLoading } from '@/components/table-loading'
import { type DictData, dictDataColumns } from './dict-data-columns'

type DictDataTableProps = {
  search: Record<string, unknown>
  navigate: NavigateFn
  dictType?: string
  onEdit?: (row: DictData) => void
  onDelete?: (row: DictData) => void
  onMultiDelete?: (rows: DictData[]) => void
}

export function DictDataTable({
  search,
  navigate,
  dictType,
  onEdit,
  onDelete,
  onMultiDelete,
}: DictDataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true },
    columnFilters: [
      { columnId: 'dict_label', searchKey: 'search', type: 'string' },
    ],
  })

  const searchFilter = columnFilters.find((f) => f.id === 'dict_label')

  const { data: queryData, isLoading } = useDictData({
    params: {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: (searchFilter?.value as string) || undefined,
      dict_type: dictType,
    },
  })

  const tableData =
    queryData?.data?.code === 0 ? queryData.data.data.list || [] : []
  const total =
    queryData?.data?.count || queryData?.data?.total || tableData.length

  const columns = dictDataColumns({ onEdit, onDelete })

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
  })

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar table={table} searchPlaceholder='搜索字典数据...' />
      <DataTableBulkActions table={table} entityName='字典数据'>
        {onMultiDelete && (
          <Button
            variant='destructive'
            size='sm'
            onClick={() => {
              const selectedRows = table.getFilteredSelectedRowModel().rows
              const items = selectedRows.map((row) => row.original)
              onMultiDelete(items)
            }}
          >
            批量删除
          </Button>
        )}
      </DataTableBulkActions>
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader className='bg-muted/50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        header.column.columnDef.meta?.className
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
              <TableLoading colSpan={columns.length} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className
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
    </div>
  )
}
