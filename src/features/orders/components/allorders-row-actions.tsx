import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { Eye, Edit, Trash2, Printer } from 'lucide-react'
import { printWorkOrder } from '@/lib/print'
import {
  DataTableRowActionsWithGroups as CommonRowActions,
  presetActions,
} from '@/components/common'
import { SimpleDeleteDialog } from '@/components/common'
import { type OrderItem } from './allorders-columns'

type DataTableRowActionsForItemsProps = {
  row: Row<OrderItem>
  onViewItem: (id: number, item: OrderItem) => void
  onEditItem: (id: number, item: OrderItem) => void
  onDeleteItem: (id: number) => void
}

export function DataTableRowActionsForItems({
  row,
  onViewItem,
  onEditItem,
  onDeleteItem,
}: DataTableRowActionsForItemsProps) {
  const item = row.original
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const actions = [
    presetActions.view((r) => onViewItem(r.id, r)),
    presetActions.edit((r) => onEditItem(r.id, r)),
    { separator: true, label: '', onClick: () => {} },
    {
      label: '打印',
      icon: <Printer className='h-4 w-4' />,
      onClick: () => printWorkOrder(item.id),
    },
    { separator: true, label: '', onClick: () => {} },
    presetActions.delete((r) => {
      onDeleteItem(r.id)
    }),
  ]

  return (
    <>
      <CommonRowActions row={row} actions={actions} />
      <SimpleDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='确认删除'
        description={`确定要删除订单分项"${item.订单编号}"吗？此操作无法撤销。`}
        onConfirm={() => {
          setDeleteDialogOpen(false)
          onDeleteItem(item.id)
        }}
      />
    </>
  )
}
