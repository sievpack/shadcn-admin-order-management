'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type OrderItem } from './allorders-columns'

type OrderItemMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onBulkDelete: (ids: number[]) => void
}

const CONFIRM_WORD = 'DELETE'

export function OrderItemMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onBulkDelete,
}: OrderItemMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`请输入 "${CONFIRM_WORD}" 确认删除。`)
      return
    }

    onOpenChange(false)

    const selectedOrderItems = selectedRows.map(
      (row) => row.original as OrderItem
    )
    const itemIds = selectedOrderItems.map((item) => item.id)

    if (itemIds.length > 0) {
      onBulkDelete(itemIds)
      table.resetRowSelection()
      toast.success(`已删除 ${selectedRows.length} 条订单分项`)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除 {selectedRows.length}{' '}
          {selectedRows.length > 1 ? '条订单分项' : '条订单分项'}
        </span>
      }
      desc={
        <div className='flex flex-col gap-4'>
          <p className='mb-2'>
            您确定要删除选中的订单分项吗？ <br />
            此操作无法撤销。
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span className=''>请输入 "{CONFIRM_WORD}" 确认：</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`输入 "${CONFIRM_WORD}" 确认。`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>警告！</AlertTitle>
            <AlertDescription>请小心操作，此操作无法回滚。</AlertDescription>
          </Alert>
        </div>
      }
      confirmText='删除'
      cancelBtnText='取消'
      destructive
    />
  )
}
