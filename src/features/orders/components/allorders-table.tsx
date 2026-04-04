import { useState, useMemo } from 'react'
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
import { Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTablePagination, DataTableToolbar, DataTableBulkActions } from '@/components/data-table'
import { allOrdersColumns } from './allorders-columns'
import { type OrderItem } from './allorders-columns'

interface AllOrdersTableProps {
  data: OrderItem[]
  onBulkDelete: (ids: number[]) => void
  onViewItem?: (id: number, item: OrderItem) => void
  onEditItem?: (id: number, item: OrderItem) => void
  onDeleteItem?: (id: number) => void
}

export function AllOrdersTable({ data, onBulkDelete, onViewItem, onEditItem, onDeleteItem }: AllOrdersTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'id', desc: true }
  ])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const columns = useMemo(
    () => allOrdersColumns({ onViewItem, onEditItem, onDeleteItem }),
    [onViewItem, onEditItem, onDeleteItem]
  )

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
      const contractNo = String(row.getValue('合同编号') || '').toLowerCase()
      const spec = String(row.getValue('规格') || '').toLowerCase()
      const model = String(row.getValue('型号') || '').toLowerCase()
      const customerName = String(row.getValue('客户名称') || '').toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return (
        contractNo.includes(searchValue) ||
        spec.includes(searchValue) ||
        model.includes(searchValue) ||
        customerName.includes(searchValue)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onGlobalFilterChange: setGlobalFilter,
  })

  // 获取选中的行ID
  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id)

  // 处理批量删除确认
  const handleBulkDelete = () => {
    if (selectedRows.length > 0) {
      setShowDeleteConfirm(true)
    }
  }

  // 确认执行批量删除
  const confirmBulkDelete = () => {
    onBulkDelete(selectedRows)
    setShowDeleteConfirm(false)
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
        searchPlaceholder='搜索合同编号、规格、型号或客户名称...'
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
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除选中的 <strong>{selectedRows.length}</strong> 条记录吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
