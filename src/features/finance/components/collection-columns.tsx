import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { CollectionRowActions } from './collection-row-actions'

export interface CollectionRecord {
  id: number
  收款单号: string
  关联应收: string
  收款金额: number
  收款方式: string
  收款日期: string
  核销状态: string
  操作人: string
  备注: string
  create_at: string
}

export const collectionColumns = ({
  onDelete,
}: {
  onDelete?: (row: CollectionRecord) => void
}): ColumnDef<CollectionRecord>[] => [
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
    accessorKey: '收款单号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='收款单号' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('收款单号') || '-'}</span>
    ),
  },
  {
    accessorKey: '关联应收',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='关联应收' />
    ),
  },
  {
    accessorKey: '收款金额',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='收款金额' />
    ),
    cell: ({ row }) => (
      <span>¥{Number(row.getValue('收款金额') || 0).toFixed(2)}</span>
    ),
  },
  {
    accessorKey: '收款方式',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='收款方式' />
    ),
  },
  {
    accessorKey: '收款日期',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='收款日期' />
    ),
  },
  {
    accessorKey: '核销状态',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
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
      <CollectionRowActions row={row.original} onDelete={onDelete} />
    ),
  },
]
