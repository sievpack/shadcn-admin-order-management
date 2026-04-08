import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { DataTableRowActions } from './data-table-row-actions'
import type { ShippingItem } from './shipping-provider'

export function shippingColumns({
  onEditShipping,
  onAddItem,
}: {
  onEditShipping?: (id: number, item: ShippingItem) => void
  onAddItem?: (item: ShippingItem) => void
} = {}): ColumnDef<ShippingItem>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
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
      meta: {
        className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
      },
      cell: ({ row }) => (
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='ID' />
      ),
      cell: ({ row }) => <div className='max-w-16'>{row.getValue('id')}</div>,
      meta: {
        className: cn(
          'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
          'max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
        ),
      },
    },
    {
      accessorKey: '发货单号',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='发货单号' />
      ),
      cell: ({ row }) => (
        <div className='max-w-36'>{row.getValue('发货单号')}</div>
      ),
      meta: {
        className: cn(
          'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
          'max-md:sticky start-12 @4xl/content:table-cell @4xl/content:drop-shadow-none'
        ),
      },
    },
    {
      accessorKey: '快递单号',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='快递单号' />
      ),
      cell: ({ row }) => (
        <div className='max-w-36 ps-3'>{row.getValue('快递单号')}</div>
      ),
    },
    {
      accessorKey: '快递公司',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='快递公司' />
      ),
      cell: ({ row }) => (
        <div className='max-w-36 ps-3'>{row.getValue('快递公司') || '-'}</div>
      ),
    },
    {
      accessorKey: '客户名称',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='客户名称' />
      ),
      cell: ({ row }) => (
        <div className='w-fit ps-2 text-nowrap'>{row.getValue('客户名称')}</div>
      ),
    },
    {
      accessorKey: '发货日期',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='发货日期' />
      ),
      cell: ({ row }) => (
        <div className='text-center'>{row.getValue('发货日期') || '-'}</div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onEditShipping={onEditShipping}
          onAddItem={onAddItem}
        />
      ),
    },
  ]
}
