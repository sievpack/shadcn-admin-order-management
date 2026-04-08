import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { APRowActions } from './ap-row-actions'

export interface AccountsPayable {
  id: number
  应付单号: string
  关联订单: string
  供应商名称: string
  应付金额: number
  已付金额: number
  应付余额: number
  应付日期: string
  到期日期: string
  账期类型: string
  付款状态: string
  备注: string
  create_at: string
}

export const accountsPayableColumns = ({
  onView,
  onEdit,
  onDelete,
}: {
  onView?: (row: AccountsPayable) => void
  onEdit?: (row: AccountsPayable) => void
  onDelete?: (row: AccountsPayable) => void
}): ColumnDef<AccountsPayable>[] => [
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
    accessorKey: '应付单号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='应付单号' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('应付单号') || '-'}</span>
    ),
  },
  {
    accessorKey: '供应商名称',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='供应商' />
    ),
  },
  {
    accessorKey: '应付金额',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='应付金额' />
    ),
    cell: ({ row }) => (
      <span>¥{Number(row.getValue('应付金额') || 0).toFixed(2)}</span>
    ),
  },
  {
    accessorKey: '已付金额',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='已付金额' />
    ),
    cell: ({ row }) => (
      <span>¥{Number(row.getValue('已付金额') || 0).toFixed(2)}</span>
    ),
  },
  {
    accessorKey: '应付余额',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='应付余额' />
    ),
    cell: ({ row }) => (
      <span className='font-semibold text-primary'>
        ¥{Number(row.getValue('应付余额') || 0).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: '应付日期',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='应付日期' />
    ),
  },
  {
    accessorKey: '账期类型',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='账期' />
    ),
  },
  {
    accessorKey: '付款状态',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('付款状态') as string
      const variant =
        status === '已结清'
          ? 'default'
          : status === '部分付款'
            ? 'secondary'
            : 'destructive'
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <APRowActions
        row={row.original}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
]
