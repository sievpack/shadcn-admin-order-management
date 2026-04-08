import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { ARRowActions } from './ar-row-actions'

export interface AccountsReceivable {
  id: number
  应收单号: string
  关联订单: string
  客户名称: string
  应收金额: number
  已收金额: number
  应收余额: number
  应收日期: string
  到期日期: string
  账期类型: string
  收款状态: string
  备注: string
  create_at: string
  create_by: string
}

export const accountsReceivableColumns = ({
  onView,
  onEdit,
  onDelete,
}: {
  onView?: (row: AccountsReceivable) => void
  onEdit?: (row: AccountsReceivable) => void
  onDelete?: (row: AccountsReceivable) => void
}): ColumnDef<AccountsReceivable>[] => [
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
    accessorKey: '应收单号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='应收单号' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('应收单号') || '-'}</span>
    ),
  },
  {
    accessorKey: '客户名称',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='客户名称' />
    ),
  },
  {
    accessorKey: '应收金额',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='应收金额' />
    ),
    cell: ({ row }) => (
      <span>¥{Number(row.getValue('应收金额') || 0).toFixed(2)}</span>
    ),
  },
  {
    accessorKey: '已收金额',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='已收金额' />
    ),
    cell: ({ row }) => (
      <span>¥{Number(row.getValue('已收金额') || 0).toFixed(2)}</span>
    ),
  },
  {
    accessorKey: '应收余额',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='应收余额' />
    ),
    cell: ({ row }) => (
      <span className='font-semibold text-primary'>
        ¥{Number(row.getValue('应收余额') || 0).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: '应收日期',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='应收日期' />
    ),
  },
  {
    accessorKey: '账期类型',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='账期' />
    ),
  },
  {
    accessorKey: '收款状态',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('收款状态') as string
      const variant =
        status === '已结清'
          ? 'default'
          : status === '部分收款'
            ? 'secondary'
            : 'destructive'
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ARRowActions
        row={row.original}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
]
