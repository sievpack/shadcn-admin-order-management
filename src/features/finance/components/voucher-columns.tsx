import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { VoucherRowActions } from './voucher-row-actions'

export interface Voucher {
  id: number
  凭证编号: string
  凭证日期: string
  凭证类型: string
  摘要: string
  科目: string
  借方金额: number
  贷方金额: number
  审核状态: string
  审核人: string
  备注: string
  create_at: string
}

export const voucherColumns = ({
  onApprove,
}: {
  onApprove?: (row: Voucher) => void
}): ColumnDef<Voucher>[] => [
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
    accessorKey: '凭证编号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='凭证编号' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('凭证编号') || '-'}</span>
    ),
  },
  {
    accessorKey: '凭证日期',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='凭证日期' />
    ),
  },
  {
    accessorKey: '凭证类型',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='凭证类型' />
    ),
  },
  {
    accessorKey: '摘要',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='摘要' />
    ),
  },
  {
    accessorKey: '科目',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='科目' />
    ),
  },
  {
    accessorKey: '借方金额',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='借方金额' />
    ),
    cell: ({ row }) => (
      <span className='text-right'>
        ¥{Number(row.getValue('借方金额') || 0).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: '贷方金额',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='贷方金额' />
    ),
    cell: ({ row }) => (
      <span className='text-right'>
        ¥{Number(row.getValue('贷方金额') || 0).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: '审核状态',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('审核状态') as string
      const variant = status === '已审核' ? 'default' : 'secondary'
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <VoucherRowActions row={row} onApprove={onApprove} />,
  },
]
