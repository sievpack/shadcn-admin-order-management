import { type ColumnDef } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { ProductionPlanRowActions } from './production-row-actions'

export interface ProductionPlan {
  id: number
  计划编号: string
  计划名称: string
  关联订单: string
  产品类型: string
  产品型号: string
  规格: string
  计划数量: number
  已排数量: number
  单位: string
  计划开始日期: string
  计划完成日期: string
  实际开始日期: string
  实际完成日期: string
  优先级: string
  计划状态: string
  负责人: string
  备注: string
  create_at: string
}

export const productionPlanColumns = ({
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onGenerateOrder,
}: {
  onView?: (row: ProductionPlan) => void
  onEdit?: (row: ProductionPlan) => void
  onDelete?: (row: ProductionPlan) => void
  onApprove?: (row: ProductionPlan) => void
  onReject?: (row: ProductionPlan) => void
  onGenerateOrder?: (row: ProductionPlan) => void
}): ColumnDef<ProductionPlan>[] => [
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
    accessorKey: '计划编号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='计划编号' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('计划编号') || '-'}</span>
    ),
  },
  {
    accessorKey: '计划名称',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='计划名称' />
    ),
  },
  {
    accessorKey: '产品型号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='产品型号' />
    ),
  },
  {
    accessorKey: '计划数量',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='计划数量' />
    ),
    cell: ({ row }) => {
      const quantity = row.getValue('计划数量') as number
      const unit = row.original.单位
      return (
        <span>
          {quantity} {unit}
        </span>
      )
    },
  },
  {
    accessorKey: '计划开始日期',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='开始日期' />
    ),
  },
  {
    accessorKey: '计划完成日期',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='完成日期' />
    ),
  },
  {
    accessorKey: '优先级',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='优先级' />
    ),
    cell: ({ row }) => {
      const priority = row.getValue('优先级') as string
      const styles: Record<string, string> = {
        紧急: 'border-red-500/50 bg-red-500/10 text-red-700 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-300',
        高: 'border-orange-500/50 bg-orange-500/10 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/20 dark:text-orange-300',
        普通: 'border-slate-500/50 bg-slate-500/10 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/20 dark:text-slate-300',
        低: 'border-green-500/50 bg-green-500/10 text-green-700 dark:border-green-500/30 dark:bg-green-500/20 dark:text-green-300',
      }
      return (
        <Badge
          className={
            styles[priority] ??
            'border-slate-500/50 bg-slate-500/10 text-slate-700'
          }
        >
          {priority}
        </Badge>
      )
    },
  },
  {
    accessorKey: '计划状态',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('计划状态') as string
      const styles: Record<string, string> = {
        待审核:
          'border-slate-500/50 bg-slate-500/10 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/20 dark:text-slate-300',
        已审核:
          'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300',
        生产中:
          'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300',
        已完成:
          'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300',
        已取消:
          'border-red-500/50 bg-red-500/10 text-red-700 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-300',
      }
      const isInProgress = status === '待审核' || status === '生产中'
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
    id: 'actions',
    cell: ({ row }) => (
      <ProductionPlanRowActions
        row={row}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onApprove={onApprove}
        onReject={onReject}
        onGenerateOrder={onGenerateOrder}
      />
    ),
  },
]
