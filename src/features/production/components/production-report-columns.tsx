import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { ProductionReportRowActions } from './production-report-row-actions'

export interface ProductionReport {
  id: number
  工单编号: string
  报工编号: string
  报工日期: string
  报工数量: number
  合格数量: number
  不良数量: number
  不良原因: string
  工序: string
  报工人: string
  检验员: string
  备注: string
  create_at: string
}

export const productionReportColumns = ({
  onView,
  onDelete,
}: {
  onView?: (row: ProductionReport) => void
  onDelete?: (row: ProductionReport) => void
}): ColumnDef<ProductionReport>[] => [
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
    accessorKey: '报工编号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='报工编号' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.getValue('报工编号') || '-'}</span>
    ),
  },
  {
    accessorKey: '工单编号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='工单编号' />
    ),
  },
  {
    accessorKey: '报工数量',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='报工数量' />
    ),
  },
  {
    accessorKey: '合格数量',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='合格数量' />
    ),
    cell: ({ row }) => {
      const qualified = row.getValue('合格数量') as number
      return <Badge variant='secondary'>{qualified}</Badge>
    },
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
    accessorKey: '报工人',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='报工人' />
    ),
  },
  {
    accessorKey: '报工日期',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='报工日期' />
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ProductionReportRowActions
        row={row}
        onView={onView}
        onDelete={onDelete}
      />
    ),
  },
]
