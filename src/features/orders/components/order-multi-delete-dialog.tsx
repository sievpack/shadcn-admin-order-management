'use client'

import { type Table } from '@tanstack/react-table'
import { MultiDeleteDialog } from '@/components/common'
import { type Order } from './orderlist-columns'

type OrderMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onBulkDelete: (ids: number[]) => void
}

export function OrderMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onBulkDelete,
}: OrderMultiDeleteDialogProps<TData>) {
  return (
    <MultiDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      table={table}
      entityName='订单'
      onBulkDelete={onBulkDelete}
    />
  )
}
