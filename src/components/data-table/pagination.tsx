import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { cn, getPageNumbers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type DataTablePaginationProps<TData> = {
  table: Table<TData>
  className?: string
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  /** 是否为服务器端分页模式，默认为 false */
  serverPaginationMode?: boolean
}

export function DataTablePagination<TData>({
  table,
  className,
  onPageChange,
  onPageSizeChange,
  serverPaginationMode = false,
}: DataTablePaginationProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  const handlePageChange = (pageIndex: number) => {
    if (serverPaginationMode && onPageChange) {
      onPageChange(pageIndex + 1)
    } else if (!serverPaginationMode) {
      table.setPageIndex(pageIndex)
    }
  }

  const handlePageSizeChange = (size: number) => {
    if (serverPaginationMode && onPageSizeChange) {
      onPageSizeChange(size)
    } else if (!serverPaginationMode) {
      table.setPageSize(size)
    }
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between overflow-clip px-2',
        '@max-2xl/content:flex-col-reverse @max-2xl/content:gap-4',
        className
      )}
      style={{ overflowClipMargin: 1 }}
    >
      <div className='flex w-full items-center justify-between'>
        <div className='flex w-[150px] items-center justify-center text-sm font-medium @2xl/content:hidden'>
          第 {currentPage} 页，共 {totalPages} 页
        </div>
        <div className='flex items-center gap-2 @max-2xl/content:flex-row-reverse'>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              handlePageSizeChange(Number(value))
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 15, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className='hidden text-sm font-medium sm:block'>每页行数</p>
        </div>
      </div>

      <div className='flex items-center sm:space-x-6 lg:space-x-8'>
        <div className='flex w-[200px] items-center justify-center text-sm font-medium @max-3xl/content:hidden'>
          第 {currentPage} 页，共 {totalPages} 页
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            className='size-8 p-0 @max-md/content:hidden'
            onClick={() => handlePageChange(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>首页</span>
            <DoubleArrowLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => handlePageChange(currentPage - 1 - 1)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>上一页</span>
            <ChevronLeftIcon className='h-4 w-4' />
          </Button>

          {pageNumbers.map((pageNumber, index) => (
            <div key={`${pageNumber}-${index}`} className='flex items-center'>
              {pageNumber === '...' ? (
                <span className='px-1 text-sm text-muted-foreground'>...</span>
              ) : (
                <Button
                  variant={currentPage === pageNumber ? 'default' : 'outline'}
                  className='h-8 min-w-8 px-2'
                  onClick={() => handlePageChange((pageNumber as number) - 1)}
                >
                  <span className='sr-only'>第 {pageNumber} 页</span>
                  {pageNumber}
                </Button>
              )}
            </div>
          ))}

          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => handlePageChange(currentPage)}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>下一页</span>
            <ChevronRightIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='size-8 p-0 @max-md/content:hidden'
            onClick={() => handlePageChange(totalPages - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>末页</span>
            <DoubleArrowRightIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
