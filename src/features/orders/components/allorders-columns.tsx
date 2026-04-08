import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { DataTableRowActionsForItems } from './allorders-row-actions'

export interface OrderItem {
  id: number
  oid: number
  订单编号: string
  合同编号: string
  订单日期: string
  交货日期: string
  规格: string
  产品类型: string
  型号: string
  数量: number
  单位: string
  销售单价: number
  金额: number
  备注: string
  客户名称: string
  结算方式: string
  发货单号: string
  快递单号: string
  客户物料编号: string
  外购: boolean
}

export const allOrdersColumns = ({
  onViewItem,
  onEditItem,
  onDeleteItem,
}: {
  onViewItem?: (id: number, item: OrderItem) => void
  onEditItem?: (id: number, item: OrderItem) => void
  onDeleteItem?: (id: number) => void
}): ColumnDef<OrderItem>[] => [
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
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => <span>{row.getValue('id') || '-'}</span>,
    meta: { label: 'ID' },
  },
  {
    accessorKey: '合同编号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='合同编号' />
    ),
    cell: ({ row }) => <span>{row.getValue('合同编号') || '-'}</span>,
    meta: { label: '合同编号' },
  },
  {
    accessorKey: '产品类型',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='产品类型' />
    ),
    cell: ({ row }) => <span>{row.getValue('产品类型') || '-'}</span>,
    meta: { label: '产品类型' },
  },
  {
    accessorKey: '规格',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='规格' />
    ),
    cell: ({ row }) => <span>{row.getValue('规格') || '-'}</span>,
    meta: { label: '规格' },
  },
  {
    accessorKey: '型号',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='型号' />
    ),
    cell: ({ row }) => <span>{row.getValue('型号') || '-'}</span>,
    meta: { label: '型号' },
  },
  {
    accessorKey: '单位',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='单位' />
    ),
    cell: ({ row }) => <span>{row.getValue('单位') || '-'}</span>,
    meta: { label: '单位' },
  },
  {
    accessorKey: '数量',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='数量' />
    ),
    cell: ({ row }) => <span>{row.getValue('数量') ?? '-'}</span>,
    meta: { label: '数量' },
  },
  {
    accessorKey: '客户名称',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='客户名称' />
    ),
    cell: ({ row }) => <span>{row.getValue('客户名称') || '-'}</span>,
    meta: { label: '客户名称' },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DataTableRowActionsForItems
        row={row}
        onViewItem={onViewItem!}
        onEditItem={onEditItem!}
        onDeleteItem={onDeleteItem!}
      />
    ),
  },
]
