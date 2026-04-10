import { useState, useCallback, useEffect, useRef } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { type DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateRangePicker } from '@/components/date-range-picker'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableViewOptions } from './view-options'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
  /** 文本过滤器 - 简单的输入框过滤 */
  textFilters?: {
    columnId: string
    placeholder: string
    value?: string
    onChange?: (value: string) => void
  }[]
  dateRangeFilter?: {
    startColumnId: string
    endColumnId: string
    title?: string
  }
  onSearch?: (query: string) => void
  onFilterChange?: (columnId: string, value: string | undefined) => void
  onDateRangeChange?: (from: Date | undefined, to: Date | undefined) => void
  onReset?: () => void
  /** 是否为服务器端分页模式，默认为 false（客户端分页） */
  serverPaginationMode?: boolean
  /** 外部传入的筛选值，格式为 { columnId: value } */
  filterValues?: Record<string, string>
  /** 隐藏视图选项按钮 */
  hideViewOptions?: boolean
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = '搜索...',
  searchKey,
  filters = [],
  textFilters = [],
  dateRangeFilter,
  onSearch,
  onFilterChange,
  onDateRangeChange,
  onReset,
  serverPaginationMode = false,
  filterValues,
  hideViewOptions = false,
}: DataTableToolbarProps<TData>) {
  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>(
    undefined
  )
  const [localSearchValue, setLocalSearchValue] = useState('')
  const [localFilterValues, setLocalFilterValues] = useState<
    Record<string, string>
  >({})
  const [clearFiltersKey] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isComposingRef = useRef(false)

  const globalFilterFromTable = table.getState().globalFilter
  const prevGlobalFilterRef = useRef(globalFilterFromTable)

  useEffect(() => {
    if (
      serverPaginationMode &&
      globalFilterFromTable &&
      globalFilterFromTable !== prevGlobalFilterRef.current
    ) {
      setLocalSearchValue(globalFilterFromTable)
      prevGlobalFilterRef.current = globalFilterFromTable
    }
  }, [serverPaginationMode, globalFilterFromTable])

  // 合并外部和本地筛选值 - 本地优先
  const effectiveFilterValues = serverPaginationMode
    ? { ...filterValues, ...localFilterValues }
    : undefined

  // 检查是否有任何筛选器激活
  const hasActiveFilters = serverPaginationMode
    ? Object.values(effectiveFilterValues || {}).some((v) => !!v)
    : table.getState().columnFilters?.length > 0

  const isFiltered =
    (serverPaginationMode &&
      (!!localSearchValue ||
        !!globalFilterFromTable ||
        hasActiveFilters ||
        !!localDateRange?.from ||
        !!localDateRange?.to)) ||
    (!serverPaginationMode &&
      (table.getState().columnFilters?.length > 0 ||
        (searchKey
          ? table.getColumn(searchKey)?.getFilterValue()
          : table.getState().globalFilter)))

  const handleSearch = useCallback(
    (value: string) => {
      if (serverPaginationMode) {
        if (isComposingRef.current) {
          return
        }
        if (onSearch) {
          onSearch(value)
        }
        return
      }
      if (searchKey) {
        table.getColumn(searchKey)?.setFilterValue(value)
      } else {
        table.setGlobalFilter(value)
      }
    },
    [serverPaginationMode, onSearch, searchKey]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && serverPaginationMode) {
        const value = (event.target as HTMLInputElement).value
        if (onSearch) {
          onSearch(value)
        }
      }
    },
    [serverPaginationMode, onSearch]
  )

  const handleFilterChange = useCallback(
    (columnId: string, value: string | undefined) => {
      if (serverPaginationMode) {
        setLocalFilterValues((prev) => {
          const newValues = { ...prev }
          if (value) {
            newValues[columnId] = value
          } else {
            delete newValues[columnId]
          }
          // 当清除筛选时，也需要通知 onFilterChange
          if (onFilterChange) {
            if (!value) {
              // 清除操作，传递 undefined
              onFilterChange(columnId, undefined)
            } else {
              // 设置操作，传递所有筛选器的完整状态
              Object.entries(newValues).forEach(([key, val]) => {
                onFilterChange(key, val)
              })
            }
          }
          return newValues
        })
      } else {
        const column = table.getColumn(columnId)
        if (column) {
          const filterValue = value ? value.split(',') : undefined
          column.setFilterValue(filterValue)
        }
      }
    },
    [serverPaginationMode, onFilterChange]
  )

  const handleDateRangeChange = useCallback(
    (dateRange: DateRange | undefined) => {
      setLocalDateRange(dateRange)
      if (serverPaginationMode) {
        if (onDateRangeChange) {
          onDateRangeChange(dateRange?.from, dateRange?.to)
        }
      } else if (dateRangeFilter) {
        if (dateRange?.from && dateRange?.to) {
          table
            .getColumn(dateRangeFilter.startColumnId)
            ?.setFilterValue(dateRange.from)
          table
            .getColumn(dateRangeFilter.endColumnId)
            ?.setFilterValue(dateRange.to)
        } else {
          table
            .getColumn(dateRangeFilter.startColumnId)
            ?.setFilterValue(undefined)
          table
            .getColumn(dateRangeFilter.endColumnId)
            ?.setFilterValue(undefined)
        }
      }
    },
    [serverPaginationMode, onDateRangeChange, dateRangeFilter, table]
  )

  const handleReset = useCallback(() => {
    if (serverPaginationMode) {
      if (onReset) {
        onReset()
      }
      setLocalDateRange(undefined)
      setLocalSearchValue('')
      setLocalFilterValues({})
    } else {
      table.resetColumnFilters()
      table.setGlobalFilter('')
      setLocalDateRange(undefined)
    }
  }, [serverPaginationMode, onReset])

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        {searchKey ? (
          <Input
            placeholder={searchPlaceholder}
            value={
              serverPaginationMode
                ? localSearchValue
                : ((table.getColumn(searchKey)?.getFilterValue() as string) ??
                  '')
            }
            onChange={(event) => {
              if (serverPaginationMode) {
                const value = event.target.value
                setLocalSearchValue(value)
                if (isComposingRef.current) {
                  return
                }
                onSearch?.(value)
              } else {
                handleSearch(event.target.value)
              }
            }}
            onCompositionStart={() => {
              isComposingRef.current = true
            }}
            onCompositionEnd={(event) => {
              isComposingRef.current = false
              if (serverPaginationMode) {
                const value = event.target.value
                setLocalSearchValue(value)
                onSearch?.(value)
              }
            }}
            onKeyDown={
              serverPaginationMode
                ? (event) => {
                    if (event.key === 'Enter') {
                      handleSearch((event.target as HTMLInputElement).value)
                    }
                  }
                : undefined
            }
            className='h-8 w-[150px] lg:w-[250px]'
          />
        ) : (
          <Input
            placeholder={searchPlaceholder}
            value={
              serverPaginationMode
                ? localSearchValue
                : (table.getState().globalFilter ?? '')
            }
            onChange={(event) => {
              if (serverPaginationMode) {
                const value = event.target.value
                setLocalSearchValue(value)
                if (isComposingRef.current) {
                  return
                }
                onSearch?.(value)
              } else {
                handleSearch(event.target.value)
              }
            }}
            onCompositionStart={() => {
              isComposingRef.current = true
            }}
            onCompositionEnd={(event) => {
              isComposingRef.current = false
              if (serverPaginationMode) {
                const value = event.target.value
                setLocalSearchValue(value)
                onSearch?.(value)
              }
            }}
            onKeyDown={
              serverPaginationMode
                ? (event) => {
                    if (event.key === 'Enter') {
                      handleSearch((event.target as HTMLInputElement).value)
                    }
                  }
                : undefined
            }
            className='h-8 w-[150px] lg:w-[250px]'
          />
        )}
        <div className='flex gap-x-2'>
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            if (!column) return null
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
                onFilterChange={(value) =>
                  handleFilterChange(filter.columnId, value)
                }
                serverPaginationMode={serverPaginationMode}
                clearKey={clearFiltersKey}
                selectedValues={effectiveFilterValues?.[filter.columnId]}
              />
            )
          })}
          {textFilters?.map((textFilter) => (
            <Input
              key={textFilter.columnId}
              placeholder={textFilter.placeholder}
              value={textFilter.value ?? ''}
              onChange={(e) => {
                if (isComposingRef.current) return
                textFilter.onChange?.(e.target.value)
              }}
              onCompositionStart={() => {
                isComposingRef.current = true
              }}
              onCompositionEnd={(e) => {
                isComposingRef.current = false
                textFilter.onChange?.(e.target.value)
              }}
              className='h-8 w-[100px]'
            />
          ))}
          {dateRangeFilter && (
            <div className='flex items-center gap-2'>
              <DateRangePicker
                value={localDateRange}
                onValueChange={handleDateRangeChange}
                placeholder={dateRangeFilter.title || '选择日期范围'}
              />
            </div>
          )}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={handleReset}
            className='h-8 px-2 lg:px-3'
          >
            重置
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      {!hideViewOptions && <DataTableViewOptions table={table} />}
    </div>
  )
}
