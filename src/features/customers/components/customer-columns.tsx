import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Customer } from './customer-provider'
import { DataTableRowActions } from './data-table-row-actions'

export function customerColumns(): ColumnDef<Customer>[] {
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
      accessorKey: '客户名称',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='客户名称' />
      ),
      cell: ({ row }) => (
        <div className='max-w-40 font-medium'>{row.getValue('客户名称')}</div>
      ),
      meta: {
        className: cn(
          'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
          'max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
        ),
      },
    },
    {
      accessorKey: '简称',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='简称' />
      ),
      cell: ({ row }) => (
        <div className='max-w-24'>{row.getValue('简称') || '-'}</div>
      ),
    },
    {
      accessorKey: '联系人',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='联系人' />
      ),
      cell: ({ row }) => (
        <div className='max-w-24'>{row.getValue('联系人') || '-'}</div>
      ),
    },
    {
      accessorKey: '联系电话',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='联系电话' />
      ),
      cell: ({ row }) => (
        <div className='max-w-32'>{row.getValue('联系电话') || '-'}</div>
      ),
    },
    {
      accessorKey: '结算方式',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='结算方式' />
      ),
      cell: ({ row }) => {
        const value = row.getValue('结算方式') as string
        const styles: Record<string, string> = {
          现结: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400',
          月结: 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400',
          账期: 'border-orange-500/50 bg-orange-500/10 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/20 dark:text-orange-400',
        }
        return (
          <div className='max-w-24'>
            <Badge className={styles[value] ?? ''}>{value || '-'}</Badge>
          </div>
        )
      },
    },
    {
      accessorKey: '业务负责人',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='业务负责人' />
      ),
      cell: ({ row }) => (
        <div className='max-w-28'>{row.getValue('业务负责人') || '-'}</div>
      ),
    },
    {
      accessorKey: '备注',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='备注' />
      ),
      cell: ({ row }) => (
        <div className='max-w-40 truncate'>{row.getValue('备注') || '-'}</div>
      ),
    },
    {
      accessorKey: '状态',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='状态' />
      ),
      cell: ({ row }) => {
        const value = (row.getValue('状态') as string)?.trim() || '-'
        const styles: Record<string, string> = {
          活跃: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400',
          停用: 'border-red-500/50 bg-red-500/10 text-red-700 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-400',
          潜在: 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400',
        }
        return (
          <div className='max-w-24'>
            <Badge className={styles[value] ?? ''}>{value}</Badge>
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: DataTableRowActions,
    },
  ]
}
