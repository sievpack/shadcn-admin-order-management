import { type ColumnDef } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { ProductionOrderRowActions } from './production-order-row-actions'

export interface ProductionOrder {
  id: number
  工单编号: string
  计划编号: string
  产品类型: string
  产品型号: string
  规格: string
  工单数量: number
  已完成数量: number
  单位: string
  产线: string
  工单状态: string
  计划开始: string
  计划结束: string
  实际开始: string
  实际结束: string
  工序: string
  总工序: string
  报工备注: string
  create_at: string
}

export const productionOrderColumns = ({
  onView,
  onEdit,
  onDelete,
  onStart,
  onFinish,
  onPause,
  onPrint,
  onReport,
}: {
  onView?: (row: ProductionOrder) => void
  onEdit?: (row: ProductionOrder) => void
  onDelete?: (row: ProductionOrder) => void
  onStart?: (row: ProductionOrder) => void
  onFinish?: (row: ProductionOrder) => void
  onPause?: (row: ProductionOrder) => void
  onPrint?: (row: ProductionOrder) => void
  onReport?: (row: ProductionOrder) => void
}): ColumnDef<ProductionOrder>[] => [
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
    accessorKey: '工单编号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='工单编号' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('工单编号') || '-'}</span>
    ),
  },
  {
    accessorKey: '计划编号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='计划编号' />
    ),
    cell: ({ row }) => <span>{row.getValue('计划编号') || '-'}</span>,
  },
  {
    accessorKey: '产品型号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='产品型号' />
    ),
  },
  {
    accessorKey: '工单数量',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='工单数量' />
    ),
    cell: ({ row }) => {
      const quantity = row.getValue('工单数量') as number
      const unit = row.original.单位
      return (
        <span>
          {quantity} {unit}
        </span>
      )
    },
  },
  {
    accessorKey: '已完成数量',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='已完成' />
    ),
    cell: ({ row }) => {
      const completed = row.getValue('已完成数量') as number
      const total = row.original.工单数量
      return (
        <span>
          {completed} / {total}
        </span>
      )
    },
  },
  {
    accessorKey: '产线',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='产线' />
    ),
  },
  {
    accessorKey: '工单状态',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('工单状态') as string
      const styles: Record<string, string> = {
        待生产:
          'border-slate-500/50 bg-slate-500/10 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/20 dark:text-slate-300',
        生产中:
          'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300',
        已完工:
          'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300',
        已暂停:
          'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300',
        已取消:
          'border-red-500/50 bg-red-500/10 text-red-700 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-300',
      }
      const isInProgress = status === '待生产' || status === '生产中'
      return (
        <Badge
          className={
            styles[status] ??
            'border-slate-500/50 bg-slate-500/10 text-slate-700'
          }
        >
          {isInProgress && (
            <Loader2
              className='me-1 inline h-3 w-3 animate-spin'
              data-icon='inline-start'
            />
          )}
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: '计划开始',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='计划开始' />
    ),
  },
  {
    accessorKey: '计划结束',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='计划结束' />
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ProductionOrderRowActions
        row={row.original}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onStart={onStart}
        onFinish={onFinish}
        onPause={onPause}
        onPrint={onPrint}
        onReport={onReport}
      />
    ),
  },
]
