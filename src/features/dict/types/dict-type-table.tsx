import { useState, useCallback, useEffect } from 'react'
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
import { useDictTypes } from '@/queries/dict'
import { ChevronDown, ChevronRight, Edit, Loader2, Trash2 } from 'lucide-react'
import { dictDataAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { Badge } from '@/components/ui/badge'
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
import { type DictData } from '../data/dict-data-columns'
import { type DictType, dictTypeColumns } from './dict-type-columns'

type DictTypeTableProps = {
  search: Record<string, unknown>
  navigate: NavigateFn
  onView?: (row: DictType) => void
  onEdit?: (row: DictType) => void
  onDelete?: (row: DictType) => void
  onAddData?: (row: DictType) => void
  onMultiDelete?: (rows: DictType[]) => void
  onEditData?: (row: DictData) => void
  onDeleteData?: (row: DictData) => void
  refreshKey?: number
}

export function DictTypeTable({
  search,
  navigate,
  onView,
  onEdit,
  onDelete,
  onAddData,
  onMultiDelete,
  onEditData,
  onDeleteData,
  refreshKey = 0,
}: DictTypeTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [childData, setChildData] = useState<Record<number, DictData[]>>({})
  const [loadingChildren, setLoadingChildren] = useState<Set<number>>(new Set())

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
      { columnId: 'dict_name', searchKey: 'search', type: 'string' },
    ],
  })

  const searchFilter = columnFilters.find((f) => f.id === 'dict_name')

  const { data: queryData, isLoading } = useDictTypes({
    params: {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: (searchFilter?.value as string) || undefined,
    },
  })

  const tableData = queryData?.data?.code === 0 ? queryData.data.data || [] : []
  const total = queryData?.data?.count || tableData.length

  const fetchChildData = useCallback(
    async (dictTypeId: number, dictType: string) => {
      setLoadingChildren((prev) => new Set(prev).add(dictTypeId))
      try {
        const response = await dictDataAPI.getDataByType(dictType)
        if (response.data.code === 0) {
          setChildData((prev) => ({
            ...prev,
            [dictTypeId]: response.data.data || [],
          }))
        }
      } catch (error) {
        console.error('Failed to fetch child data:', error)
      } finally {
        setLoadingChildren((prev) => {
          const newSet = new Set(prev)
          newSet.delete(dictTypeId)
          return newSet
        })
      }
    },
    []
  )

  const toggleRow = (dictType: DictType) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(dictType.id)) {
        newSet.delete(dictType.id)
      } else {
        newSet.add(dictType.id)
        if (!childData[dictType.id]) {
          fetchChildData(dictType.id, dictType.dict_type)
        }
      }
      return newSet
    })
  }

  useEffect(() => {
    if (refreshKey > 0) {
      setChildData({})
      for (const id of expandedRows) {
        const dictType = tableData.find((d: DictType) => d.id === id)
        if (dictType) {
          fetchChildData(id, dictType.dict_type)
        }
      }
    }
  }, [refreshKey, expandedRows, tableData])

  const columns = dictTypeColumns({ onView, onEdit, onDelete, onAddData })

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
      <DataTableToolbar table={table} searchPlaceholder='搜索字典...' />
      <DataTableBulkActions table={table} entityName='字典类型'>
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
                <TableHead className='w-[40px]' />
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={header.column.columnDef.meta?.className}
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
              <TableLoading colSpan={columns.length + 1} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <>
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='group/row'
                  >
                    <TableCell className='w-[40px]'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8'
                        onClick={() => toggleRow(row.original)}
                      >
                        {expandedRows.has(row.original.id) ? (
                          <ChevronDown className='h-4 w-4' />
                        ) : (
                          <ChevronRight className='h-4 w-4' />
                        )}
                      </Button>
                    </TableCell>
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
                  {expandedRows.has(row.original.id) && (
                    <TableRow key={`${row.id}-expanded`}>
                      <TableCell
                        colSpan={columns.length + 1}
                        className='bg-muted/30 p-0'
                      >
                        <div className='p-4'>
                          <div className='mb-2 text-sm font-medium text-muted-foreground'>
                            字典数据 ({childData[row.original.id]?.length || 0}{' '}
                            条)
                          </div>
                          {loadingChildren.has(row.original.id) ? (
                            <div className='py-4 text-center'>
                              <Loader2 className='mx-auto h-5 w-5 animate-spin text-muted-foreground' />
                            </div>
                          ) : childData[row.original.id]?.length ? (
                            <Table>
                              <TableHeader className='bg-muted/50'>
                                <TableRow>
                                  <TableHead className='w-[60px]'>
                                    排序
                                  </TableHead>
                                  <TableHead>字典标签</TableHead>
                                  <TableHead>字典值</TableHead>
                                  <TableHead className='w-[60px]'>
                                    默认
                                  </TableHead>
                                  <TableHead className='w-[80px]'>
                                    状态
                                  </TableHead>
                                  <TableHead className='w-[100px]'>
                                    操作
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {childData[row.original.id].map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell className='text-center'>
                                      {item.dict_sort}
                                    </TableCell>
                                    <TableCell className='font-medium'>
                                      {item.dict_label}
                                    </TableCell>
                                    <TableCell className='font-mono text-sm'>
                                      {item.dict_value}
                                    </TableCell>
                                    <TableCell className='text-center'>
                                      {item.is_default == 1 ||
                                      item.is_default === '1' ||
                                      item.is_default === true ? (
                                        <Badge variant='default'>是</Badge>
                                      ) : (
                                        '-'
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          item.available == 1 ||
                                          item.available === '1' ||
                                          item.available === true
                                            ? 'default'
                                            : 'secondary'
                                        }
                                      >
                                        {item.available == 1 ||
                                        item.available === '1' ||
                                        item.available === true
                                          ? '启用'
                                          : '禁用'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className='flex gap-1'>
                                        {onEditData && (
                                          <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8'
                                            onClick={() => onEditData(item)}
                                          >
                                            <Edit className='h-4 w-4' />
                                          </Button>
                                        )}
                                        {onDeleteData && (
                                          <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 text-red-500'
                                            onClick={() => onDeleteData(item)}
                                          >
                                            <Trash2 className='h-4 w-4' />
                                          </Button>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className='py-4 text-center text-muted-foreground'>
                              暂无字典数据
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
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
    </div>
  )
}
