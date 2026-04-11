import { type Row } from '@tanstack/react-table'
import { Eye, Edit, Trash2, Plus, Printer } from 'lucide-react'
import {
  DataTableRowActionsWithGroups as CommonRowActions,
  presetActions,
} from '@/components/common'
import { type Order } from './orderlist-columns'

type DataTableRowActionsProps = {
  row: Row<Order>
  onViewOrder: (id: number, order: Order) => void
  onEditOrder: (id: number, order: Order) => void
  onDeleteOrder: (id: number) => void
  onAddOrderItem?: (order: Order) => void
  onPrintOrder?: (id: number, orderNumber: string) => void
}

export function DataTableRowActions({
  row,
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onAddOrderItem,
  onPrintOrder,
}: DataTableRowActionsProps) {
  const order = row.original

  const actions = [
    presetActions.view((r) => onViewOrder(r.id, r)),
    presetActions.edit((r) => onEditOrder(r.id, r)),
    ...(onPrintOrder
      ? [
          { separator: true, label: '', onClick: () => {} },
          {
            label: '打印加工单',
            icon: <Printer className='h-4 w-4' />,
            onClick: (r: Order) => onPrintOrder(r.id, r.order_number),
          },
        ]
      : []),
    ...(onAddOrderItem
      ? [
          { separator: true, label: '', onClick: () => {} },
          {
            label: '添加分项',
            icon: <Plus className='h-4 w-4' />,
            onClick: (r: Order) => onAddOrderItem(r),
          },
        ]
      : []),
    { separator: true, label: '', onClick: () => {} },
    presetActions.delete((r) => onDeleteOrder(r.id)),
  ]

  return <CommonRowActions row={row} actions={actions} />
}
