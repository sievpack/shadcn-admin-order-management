import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { ProductInboundRowActions } from './product-inbound-row-actions'

export interface ProductInbound {
  id: number
  入库单号: string
  质检编号: string
  工单编号: string
  产品类型: string
  产品型号: string
  规格: string
  入库数量: number
  单位: string
  批次号: string
  仓库: string
  库位: string
  入库类型: string
  入库状态: string
  入库日期: string
  入库员: string
  收货人: string
  关联订单: string
  备注: string
  create_at: string
}

export const productInboundColumns = ({
  onView,
  onDelete,
}: {
  onView?: (row: ProductInbound) => void
  onDelete?: (row: ProductInbound) => void
}): ColumnDef<ProductInbound>[] => [
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
    accessorKey: '入库单号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='入库单号' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('入库单号') || '-'}</span>
    ),
  },
  {
    accessorKey: '工单编号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='工单编号' />
    ),
  },
  {
    accessorKey: '产品型号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='产品型号' />
    ),
  },
  {
    accessorKey: '入库数量',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='入库数量' />
    ),
    cell: ({ row }) => {
      const quantity = row.getValue('入库数量') as number
      const unit = row.original.单位
      return (
        <span>
          {quantity} {unit}
        </span>
      )
    },
  },
  {
    accessorKey: '仓库',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='仓库' />
    ),
  },
  {
    accessorKey: '入库类型',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='入库类型' />
    ),
  },
  {
    accessorKey: '入库状态',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('入库状态') as string
      const styles: Record<string, string> = {
        已入库:
          'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300',
        待入库:
          'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300',
        已取消:
          'border-slate-500/50 bg-slate-500/10 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/20 dark:text-slate-300',
      }
      return (
        <Badge
          className={
            styles[status] ??
            'border-slate-500/50 bg-slate-500/10 text-slate-700'
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: '入库日期',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='入库日期' />
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ProductInboundRowActions row={row} onView={onView} onDelete={onDelete} />
    ),
  },
]
