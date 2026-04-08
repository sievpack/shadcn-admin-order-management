import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type ColumnDef } from '@tanstack/react-table'
import { type Row } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import { useQuote } from './quote-provider'
import { type Quote } from './quote-provider'

function QuoteRowActions({ row }: { row: Row<Quote> }) {
  const { setCurrentRow, setOpen } = useQuote()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>打开菜单</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('view')
          }}
        >
          查看
          <DropdownMenuShortcut>
            <Eye size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function quoteColumns(): ColumnDef<Quote>[] {
  return [
    {
      accessorKey: '客户名称',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='客户名称' />
      ),
      cell: ({ row }) => (
        <div className='max-w-40 font-medium'>{row.getValue('客户名称')}</div>
      ),
    },
    {
      accessorKey: '报价单号',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='报价单号' />
      ),
      cell: ({ row }) => (
        <div className='max-w-32'>{row.getValue('报价单号')}</div>
      ),
    },
    {
      accessorKey: '报价日期',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='报价日期' />
      ),
      cell: ({ row }) => (
        <div className='max-w-28'>{row.getValue('报价日期') || '-'}</div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => <QuoteRowActions row={row} />,
    },
  ]
}
