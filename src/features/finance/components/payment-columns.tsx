import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { PaymentRowActions } from './payment-row-actions'

export interface PaymentRecord {
  id: number
  付款单号: string
  关联应付: string
  付款金额: number
  付款方式: string
  付款日期: string
  核销状态: string
  操作人: string
  备注: string
  create_at: string
}

export const paymentColumns = ({
  onDelete,
}: {
  onDelete?: (row: PaymentRecord) => void
}): ColumnDef<PaymentRecord>[] => [
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
    accessorKey: '付款单号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='付款单号' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('付款单号') || '-'}</span>
    ),
  },
  {
    accessorKey: '关联应付',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='关联应付' />
    ),
  },
  {
    accessorKey: '付款金额',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='付款金额' />
    ),
    cell: ({ row }) => (
      <span>¥{Number(row.getValue('付款金额') || 0).toFixed(2)}</span>
    ),
  },
  {
    accessorKey: '付款方式',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='付款方式' />
    ),
  },
  {
    accessorKey: '付款日期',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='付款日期' />
    ),
  },
  {
    accessorKey: '核销状态',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('核销状态') as string
      const variant = status === '已核销' ? 'default' : 'secondary'
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: '操作人',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='操作人' />
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <PaymentRowActions row={row.original} onDelete={onDelete} />
    ),
  },
]
