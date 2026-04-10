import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { shippingAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type ShippingItem } from './shipping-provider'

type ShippingMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onDeleted?: () => void
}

const CONFIRM_WORD = 'DELETE'

export function ShippingMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onDeleted,
}: ShippingMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      showToastWithData({
        type: 'error',
        title: `请输入 "${CONFIRM_WORD}" 确认删除`,
      })
      return
    }

    const selectedItems = selectedRows.map(
      (row) => row.original as ShippingItem
    )
    let successCount = 0
    let failCount = 0

    for (const item of selectedItems) {
      try {
        const response = await shippingAPI.deleteShipping(
          item.发货单号,
          item.快递单号
        )
        if (response.data.code === 0) {
          successCount++
        } else {
          failCount++
        }
      } catch (error) {
        console.error('删除失败:', error)
        failCount++
      }
    }

    onOpenChange(false)
    setValue('')
    table.resetRowSelection()

    if (failCount === 0) {
      showToastWithData({
        type: 'success',
        title: `成功删除 ${successCount} 条发货单`,
        data: { 成功: successCount, 失败: failCount },
      })
    } else {
      showToastWithData({
        type: 'error',
        title: `删除结果`,
        data: { 成功: successCount, 失败: failCount },
      })
    }

    if (onDeleted) {
      onDeleted()
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
          删除 {selectedRows.length} 条发货单
        </span>
      }
      desc={
        <div className='flex flex-col gap-4'>
          <p className='mb-2'>
            确定要删除选中的发货单吗？
            <br />
            此操作无法撤销。
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span className=''>请输入 "{CONFIRM_WORD}" 确认删除：</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`输入 "${CONFIRM_WORD}" 确认`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>警告！</AlertTitle>
            <AlertDescription>请注意，此操作无法回滚。</AlertDescription>
          </Alert>
        </div>
      }
      confirmText='删除'
      destructive
    />
  )
}
