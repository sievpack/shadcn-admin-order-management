import * as React from 'react'
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { type Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

type DataTableFacetedFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  onFilterChange?: (value: string | undefined) => void
  /** 是否为服务器端分页模式，默认为 false */
  serverPaginationMode?: boolean
  /** 用于触发清空的 key，当变化时清空本地状态 */
  clearKey?: number
  /** 外部传入的选中值，用于同步 URL 状态 */
  selectedValues?: string
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  onFilterChange,
  serverPaginationMode = false,
  clearKey = 0,
  selectedValues,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = serverPaginationMode
    ? undefined
    : column?.getFacetedUniqueValues()
  const initialSelectedValues = serverPaginationMode
    ? new Set<string>()
    : new Set(column?.getFilterValue() as string[])
  const [localSelectedValues, setLocalSelectedValues] = React.useState(
    initialSelectedValues
  )
  const localSelectedValuesRef = React.useRef(localSelectedValues)
  localSelectedValuesRef.current = localSelectedValues
  const isInternalChangeRef = React.useRef(false)
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  React.useEffect(() => {
    if (clearKey > 0 && serverPaginationMode) {
      setLocalSelectedValues(new Set())
      if (onFilterChange) {
        onFilterChange(undefined)
      }
    }
  }, [clearKey, serverPaginationMode, onFilterChange])

  React.useEffect(() => {
    if (serverPaginationMode && !isInternalChangeRef.current) {
      if (selectedValues === undefined || selectedValues === '') {
        setLocalSelectedValues(new Set())
      } else {
        const newSet = new Set(selectedValues.split(','))
        setLocalSelectedValues(newSet)
      }
    }
  }, [serverPaginationMode, selectedValues])

  React.useEffect(() => {
    isInternalChangeRef.current = false
  })

  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const selectedValuesSet = serverPaginationMode
    ? localSelectedValues
    : new Set(column?.getFilterValue() as string[])

  const handleSelect = (optionValue: string, isSelected: boolean) => {
    if (serverPaginationMode) {
      isInternalChangeRef.current = true
      const newSelected = new Set(localSelectedValuesRef.current)
      if (isSelected) {
        newSelected.delete(optionValue)
      } else {
        newSelected.add(optionValue)
      }
      setLocalSelectedValues(newSelected)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      debounceTimerRef.current = setTimeout(() => {
        const filterValues = Array.from(newSelected)
        if (onFilterChange) {
          onFilterChange(
            filterValues.length ? filterValues.join(',') : undefined
          )
        }
      }, 0)
    } else {
      const currentFilter = (column?.getFilterValue() as string[]) || []
      const newFilter = isSelected
        ? currentFilter.filter((v) => v !== optionValue)
        : [...currentFilter, optionValue]
      column?.setFilterValue(newFilter.length ? newFilter : undefined)
    }
  }

  const handleClear = () => {
    if (serverPaginationMode) {
      setLocalSelectedValues(new Set())
      if (onFilterChange) {
        onFilterChange(undefined)
      }
    } else {
      column?.setFilterValue(undefined)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <PlusCircledIcon className='size-4' />
          {title}
          {selectedValuesSet.size > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal lg:hidden'
              >
                {selectedValuesSet.size}
              </Badge>
              <div className='hidden gap-1 lg:flex'>
                {selectedValuesSet.size > 2 ? (
                  <Badge
                    variant='secondary'
                    className='rounded-sm px-1 font-normal'
                  >
                    {selectedValuesSet.size} 已选
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValuesSet.has(option.value))
                    .map((option) => (
                      <Badge
                        variant='secondary'
                        key={option.value}
                        className='rounded-sm px-1 font-normal'
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0' align='start'>
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>无结果</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValuesSet.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value, isSelected)}
                  >
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className={cn('h-4 w-4 text-background')} />
                    </div>
                    {option.icon && (
                      <option.icon className='size-4 text-muted-foreground' />
                    )}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className='ms-auto flex h-4 w-4 items-center justify-center font-mono text-xs'>
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValuesSet.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClear}
                    className='justify-center text-center'
                  >
                    清除过滤
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
