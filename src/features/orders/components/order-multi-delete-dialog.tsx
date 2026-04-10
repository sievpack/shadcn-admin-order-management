'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Order } from './orderlist-columns'

type OrderMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onBulkDelete: (ids: number[]) => void
}

const CONFIRM_WORD = 'DELETE'

export function OrderMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onBulkDelete,
}: OrderMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      showToastWithData({
        type: 'error',
        title: `请输入 "${CONFIRM_WORD}" 确认删除。`,
      })
      return
    }

    onOpenChange(false)

    const selectedOrders = selectedRows.map((row) => row.original as Order)
    const orderIds = selectedOrders.map((order) => order.id)

    if (orderIds.length > 0) {
      onBulkDelete(orderIds)
      table.resetRowSelection()
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
          {selectedRows.length > 1 ? '个订单' : '个订单'}
        </span>
      }
      desc={
        <div className='flex flex-col gap-4'>
          <p className='mb-2'>
            您确定要删除选中的订单吗？ <br />
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
      cancelBtnText='取消'
      confirmText='删除'
      destructive
    />
  )
}
