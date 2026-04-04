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
import { type Order, orderListColumns } from './orderlist-columns'
import { DataTableBulkActions } from './data-table-bulk-actions'

interface OrderListTableProps {
  data: Order[]
  onViewOrder?: (id: number, order: Order) => void
  onEditOrder?: (id: number, order: Order) => void
  onDeleteOrder?: (id: number) => void
  onBulkDelete?: (ids: number[]) => void
}

export function OrderListTable({ data, onViewOrder, onEditOrder, onDeleteOrder, onBulkDelete }: OrderListTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'id', desc: true }
  ])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = orderListColumns({
    onViewOrder,
    onEditOrder,
    onDeleteOrder
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      // 处理文本搜索
      const id = String(row.original.id).toLowerCase()
      const orderNumber = String(row.getValue('order_number')).toLowerCase()
      const customerName = String(row.getValue('customer_name')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      // 处理日期范围过滤
      const orderDate = row.getValue('order_date')
      const startDateFilter = table.getColumn('order_date')?.getFilterValue()
      const endDateFilter = table.getColumn('order_date')?.getFilterValue()

      let dateFilterPass = true
      if (startDateFilter instanceof Date && endDateFilter instanceof Date) {
        try {
          const rowDate = new Date(orderDate)
          rowDate.setHours(0, 0, 0, 0)
          
          const startDate = new Date(startDateFilter)
          startDate.setHours(0, 0, 0, 0)
          
          const endDate = new Date(endDateFilter)
          endDate.setHours(23, 59, 59, 999)
          
          dateFilterPass = rowDate >= startDate && rowDate <= endDate
        } catch {
          dateFilterPass = false
        }
      }

      return (
        (id.includes(searchValue) ||
        orderNumber.includes(searchValue) ||
        customerName.includes(searchValue)) &&
        dateFilterPass
      )
    },
    columnFilters: [
      {
        id: 'status',
        value: undefined,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onGlobalFilterChange: setGlobalFilter,
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
        searchPlaceholder='搜索订单编号或客户名称...'
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
        dateRangeFilter={{
          startColumnId: 'order_date',
          endColumnId: 'order_date',
          title: '订单日期',
        }}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table className='min-w-xl'>
          <TableHeader>
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
      <DataTableBulkActions table={table} onBulkDelete={onBulkDelete!} />
    </div>
  )
}
