import { useState, useCallback } from 'react'
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
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { DataTableBulkActions } from './components/template-bulk-actions'

const route = getRouteApi('/_authenticated/templatebulk/')

interface DemoItem {
  id: number
  name: string
  description: string
  status: 'active' | 'inactive' | 'pending'
  category: string
  createdAt: string
}

const demoData: DemoItem[] = [
  {
    id: 1,
    name: '产品 A',
    description: '这是一个示例产品描述',
    status: 'active',
    category: '电子产品',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: '产品 B',
    description: '这是一个示例产品描述',
    status: 'inactive',
    category: '家居用品',
    createdAt: '2024-01-16',
  },
  {
    id: 3,
    name: '产品 C',
    description: '这是一个示例产品描述',
    status: 'pending',
    category: '服装',
    createdAt: '2024-01-17',
  },
  {
    id: 4,
    name: '产品 D',
    description: '这是一个示例产品描述',
    status: 'active',
    category: '电子产品',
    createdAt: '2024-01-18',
  },
  {
    id: 5,
    name: '产品 E',
    description: '这是一个示例产品描述',
    status: 'inactive',
    category: '家居用品',
    createdAt: '2024-01-19',
  },
  {
    id: 6,
    name: '产品 F',
    description: '这是一个示例产品描述',
    status: 'pending',
    category: '服装',
    createdAt: '2024-01-20',
  },
  {
    id: 7,
    name: '产品 G',
    description: '这是一个示例产品描述',
    status: 'active',
    category: '电子产品',
    createdAt: '2024-01-21',
  },
  {
    id: 8,
    name: '产品 H',
    description: '这是一个示例产品描述',
    status: 'inactive',
    category: '家居用品',
    createdAt: '2024-01-22',
  },
  {
    id: 9,
    name: '产品 I',
    description: '这是一个示例产品描述',
    status: 'pending',
    category: '服装',
    createdAt: '2024-01-23',
  },
  {
    id: 10,
    name: '产品 J',
    description: '这是一个示例产品描述',
    status: 'active',
    category: '电子产品',
    createdAt: '2024-01-24',
  },
]

const columns = [
  {
    id: 'select',
    header: ({
      table,
    }: {
      table: ReturnType<typeof useReactTable<DemoItem>>
    }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({
      row,
    }: {
      row: {
        getIsSelected: () => boolean
        toggleSelected: (value: boolean) => void
      }
    }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => (
      <span>{row.getValue('id')}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: '名称',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => (
      <span>{row.getValue('name')}</span>
    ),
  },
  {
    accessorKey: 'description',
    header: '描述',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => (
      <span className='max-w-[200px] truncate'>
        {row.getValue('description')}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const status = row.getValue('status') as DemoItem['status']
      const variants: Record<
        DemoItem['status'],
        'default' | 'secondary' | 'outline'
      > = {
        active: 'default',
        inactive: 'secondary',
        pending: 'outline',
      }
      const labels: Record<DemoItem['status'], string> = {
        active: '活跃',
        inactive: '停用',
        pending: '待处理',
      }
      return <Badge variant={variants[status]}>{labels[status]}</Badge>
    },
  },
  {
    accessorKey: 'category',
    header: '分类',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => (
      <span>{row.getValue('category')}</span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: '创建日期',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => (
      <span>{row.getValue('createdAt')}</span>
    ),
  },
]

export function TemplateBulkDelete() {
  const [data] = useState<DemoItem[]>(demoData)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility] = useState<VisibilityState>({})
  const [sorting] = useState<SortingState>([])

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
    columnFilters: [{ columnId: 'status', searchKey: 'status', type: 'array' }],
  })

  const statusFilter = (search as Record<string, unknown>)?.status as
    | string
    | undefined

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: true,
    manualPagination: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: () => {},
    onPaginationChange,
    onColumnVisibilityChange: () => {},
    onGlobalFilterChange,
    onColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: undefined,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const handleBulkDelete = useCallback((ids: number[]) => {
    toast.success(`成功删除 ${ids.length} 个项目`)
  }, [])

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        serverPaginationMode={false}
        searchPlaceholder='搜索名称或描述...'
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
            columnId: 'status',
            title: '状态',
            options: [
              { label: '活跃', value: 'active' },
              { label: '停用', value: 'inactive' },
              { label: '待处理', value: 'pending' },
            ],
          },
          {
            columnId: 'category',
            title: '分类',
            options: [
              { label: '电子产品', value: '电子产品' },
              { label: '家居用品', value: '家居用品' },
              { label: '服装', value: '服装' },
            ],
          },
        ]}
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
            {table.getRowModel().rows?.length ? (
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
      <DataTableBulkActions
        table={table}
        onBulkDelete={handleBulkDelete}
        entityName='项目'
      />
    </div>
  )
}
