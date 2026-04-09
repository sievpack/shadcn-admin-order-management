import React, { useState, useEffect } from 'react'
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
import { ChevronDown, ChevronRight } from 'lucide-react'
import { customerSampleAPI } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { customerSampleColumns } from './customer-sample-columns'
import { type CustomerSample } from './customer-sample-provider'
import { useCustomerSample } from './customer-sample-provider'

const route = getRouteApi('/_authenticated/customer-sample/')

interface CustomerSampleTableProps {
  refreshKey?: number
}

export function CustomerSampleTable({
  refreshKey = 0,
}: CustomerSampleTableProps) {
  const { setRefreshData } = useCustomerSample()
  const [data, setData] = useState<CustomerSample[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility] = useState<VisibilityState>({})
  const [internalSorting] = useState<SortingState>([
    { id: '下单日期', desc: true },
  ])
  const [localRefreshKey, setLocalRefreshKey] = useState(0)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  useEffect(() => {
    setRefreshData(() => () => {
      setLocalRefreshKey((k) => k + 1)
    })
  }, [setRefreshData])

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
      { columnId: '产品类型', searchKey: '产品类型', type: 'string' },
    ],
  })

  const globalFilterValue = (search as Record<string, unknown>)?.filter as
    | string
    | undefined
  const productTypeFilter = (search as Record<string, unknown>)?.产品类型 as
    | string
    | undefined

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await customerSampleAPI.getList({
        search: globalFilterValue || undefined,
        产品类型: productTypeFilter || undefined,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      })
      if (response.data.code === 0) {
        setData(response.data.data || [])
        setTotal(response.data.count || 0)
      }
    } catch (error) {
      console.error('Failed to fetch customer samples:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    globalFilterValue,
    productTypeFilter,
    refreshKey,
    localRefreshKey,
  ])

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const columns = customerSampleColumns()

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
        searchPlaceholder='搜索样品单号、客户名称...'
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
            columnId: '产品类型',
            title: '产品类型',
            options: [
              { label: '砂轮', value: '砂轮' },
              { label: '磨具', value: '磨具' },
            ],
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table className='min-w-xl'>
          <TableHeader className='bg-muted/50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className='w-[40px]' />
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
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className='h-24 text-center'
                >
                  加载中...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && 'selected'}
                    className='group/row'
                  >
                    <TableCell className='w-[40px]'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8'
                        onClick={() => toggleRow(row.original.id)}
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
                  {expandedRows.has(row.original.id) && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + 1}
                        className='bg-muted/30 p-0'
                      >
                        <div className='p-4'>
                          <div className='mb-2 text-sm font-medium text-muted-foreground'>
                            样品详情
                          </div>
                          <div className='grid grid-cols-4 gap-x-6 gap-y-2 text-sm'>
                            <div>
                              <span className='text-muted-foreground'>
                                规格：
                              </span>
                              <span>{row.original.规格 || '-'}</span>
                            </div>
                            <div>
                              <span className='text-muted-foreground'>
                                产品类型：
                              </span>
                              <span>{row.original.产品类型 || '-'}</span>
                            </div>
                            <div>
                              <span className='text-muted-foreground'>
                                型号：
                              </span>
                              <span>{row.original.型号 || '-'}</span>
                            </div>
                            <div>
                              <span className='text-muted-foreground'>
                                单位：
                              </span>
                              <span>{row.original.单位 || '-'}</span>
                            </div>
                            <div>
                              <span className='text-muted-foreground'>
                                数量：
                              </span>
                              <span>{row.original.数量 || 0}</span>
                            </div>
                            <div>
                              <span className='text-muted-foreground'>
                                齿形：
                              </span>
                              <span>{row.original.齿形 || '-'}</span>
                            </div>
                            <div>
                              <span className='text-muted-foreground'>
                                材料：
                              </span>
                              <span>{row.original.材料 || '-'}</span>
                            </div>
                            <div>
                              <span className='text-muted-foreground'>
                                钢丝：
                              </span>
                              <span>{row.original.钢丝 || '-'}</span>
                            </div>
                            <div className='col-span-2'>
                              <span className='text-muted-foreground'>
                                喷码要求：
                              </span>
                              <span>{row.original.喷码要求 || '-'}</span>
                            </div>
                            <div className='col-span-2'>
                              <span className='text-muted-foreground'>
                                备注：
                              </span>
                              <span>{row.original.备注 || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
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
