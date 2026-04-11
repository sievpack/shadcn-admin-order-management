'use client'

import { type Table } from '@tanstack/react-table'
import { MultiDeleteDialog } from '@/components/common'

type OrderItemMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onBulkDelete: (ids: number[]) => void
}

export function OrderItemMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onBulkDelete,
}: OrderItemMultiDeleteDialogProps<TData>) {
  return (
    <MultiDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      table={table}
      entityName='订单分项'
      onBulkDelete={onBulkDelete}
    />
  )
}
