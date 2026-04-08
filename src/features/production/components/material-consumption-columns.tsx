import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { MaterialConsumptionRowActions } from './material-consumption-row-actions'

export interface MaterialConsumption {
  id: number
  工单编号: string
  物料编码: string
  物料名称: string
  规格型号: string
  消耗数量: number
  单位: string
  领料人: string
  领料日期: string
  备注: string
  create_at: string
}

export const materialConsumptionColumns = ({
  onDelete,
}: {
  onDelete?: (row: MaterialConsumption) => void
}): ColumnDef<MaterialConsumption>[] => [
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
    accessorKey: '物料编码',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='物料编码' />
    ),
  },
  {
    accessorKey: '物料名称',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='物料名称' />
    ),
  },
  {
    accessorKey: '规格型号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='规格型号' />
    ),
  },
  {
    accessorKey: '消耗数量',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='消耗数量' />
    ),
    cell: ({ row }) => {
      const quantity = row.getValue('消耗数量') as number
      const unit = row.original.单位
      return (
        <span>
          {quantity} {unit}
        </span>
      )
    },
  },
  {
    accessorKey: '领料人',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='领料人' />
    ),
  },
  {
    accessorKey: '领料日期',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='领料日期' />
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <MaterialConsumptionRowActions row={row.original} onDelete={onDelete} />
    ),
  },
]
