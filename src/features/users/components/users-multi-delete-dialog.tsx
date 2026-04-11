'use client'

import { type Table } from '@tanstack/react-table'
import { MultiDeleteDialog } from '@/components/common'

type UsersMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

export function UsersMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: UsersMultiDeleteDialogProps<TData>) {
  return (
    <MultiDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      table={table}
      entityName='用户'
      onBulkDelete={async (ids) => {
        // TODO: 调用实际的用户批量删除 API
        console.log('Delete users:', ids)
      }}
    />
  )
}
