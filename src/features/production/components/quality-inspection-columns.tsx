import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { QualityInspectionRowActions } from './quality-inspection-row-actions'

export interface QualityInspection {
  id: number
  质检单号: string
  关联报工: string
  工单编号: string
  产品类型: string
  产品型号: string
  批次号: string
  送检数量: number
  合格数量: number
  不良数量: number
  不良率: number
  质检结果: string
  不良分类: string
  不良描述: string
  质检员: string
  质检日期: string
  备注: string
  create_at: string
}

export const qualityInspectionColumns = ({
  onView,
  onDelete,
}: {
  onView?: (row: QualityInspection) => void
  onDelete?: (row: QualityInspection) => void
}): ColumnDef<QualityInspection>[] => [
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
    accessorKey: '质检单号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='质检单号' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('质检单号') || '-'}</span>
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
    accessorKey: '送检数量',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='送检数量' />
    ),
  },
  {
    accessorKey: '合格数量',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='合格数量' />
    ),
  },
  {
    accessorKey: '不良数量',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='不良数量' />
    ),
    cell: ({ row }) => {
      const defective = row.getValue('不良数量') as number
      if (defective > 0) {
        return <Badge variant='destructive'>{defective}</Badge>
      }
      return <span className='text-muted-foreground'>{defective}</span>
    },
  },
  {
    accessorKey: '质检结果',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='质检结果' />
    ),
    cell: ({ row }) => {
      const result = row.getValue('质检结果') as string
      const styles: Record<string, string> = {
        合格: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300',
        不合格:
          'border-red-500/50 bg-red-500/10 text-red-700 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-300',
        待质检:
          'border-slate-500/50 bg-slate-500/10 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/20 dark:text-slate-300',
      }
      return (
        <Badge
          className={
            styles[result] ??
            'border-slate-500/50 bg-slate-500/10 text-slate-700'
          }
        >
          {result}
        </Badge>
      )
    },
  },
  {
    accessorKey: '质检员',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='质检员' />
    ),
  },
  {
    accessorKey: '质检日期',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='质检日期' />
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <QualityInspectionRowActions
        row={row.original}
        onView={onView}
        onDelete={onDelete}
      />
    ),
  },
]
