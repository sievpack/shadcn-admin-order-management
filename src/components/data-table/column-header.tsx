import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
} from '@radix-ui/react-icons'
import { type Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type DataTableColumnHeaderProps<TData, TValue> =
  React.HTMLAttributes<HTMLDivElement> & {
    column?: Column<TData, TValue>
    header?: any // React Table header object
    title?: string
  }

export function DataTableColumnHeader<TData, TValue>({
  column,
  header,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  // 使用 header 或 column
  const columnObj = header || column
  
  // 获取标题
  const columnTitle = title || columnObj?.columnDef?.header || ''
  
  if (!columnObj || !columnObj.getCanSort?.()) {
    return <div className={cn(className)}>{columnTitle}</div>
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 data-[state=open]:bg-accent'
          >
            <span>{columnTitle}</span>
            {columnObj.getIsSorted?.() === 'desc' ? (
              <ArrowDownIcon className='ms-2 h-4 w-4' />
            ) : columnObj.getIsSorted?.() === 'asc' ? (
              <ArrowUpIcon className='ms-2 h-4 w-4' />
            ) : (
              <CaretSortIcon className='ms-2 h-4 w-4' />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start'>
          <DropdownMenuItem onClick={() => columnObj.toggleSorting?.(false)}>
            <ArrowUpIcon className='size-3.5 text-muted-foreground/70' />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => columnObj.toggleSorting?.(true)}>
            <ArrowDownIcon className='size-3.5 text-muted-foreground/70' />
            Desc
          </DropdownMenuItem>
          {columnObj.getCanHide?.() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => columnObj.toggleVisibility?.(false)}>
                <EyeNoneIcon className='size-3.5 text-muted-foreground/70' />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
