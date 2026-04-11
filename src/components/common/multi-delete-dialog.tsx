import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { showToastWithData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'

type MultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  entityName?: string
  onBulkDelete: (ids: (number | string)[]) => void | Promise<void>
}

const CONFIRM_WORD = 'DELETE'

export function MultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  entityName = '数据',
  onBulkDelete,
}: MultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      showToastWithData({
        type: 'error',
        title: `请输入 "${CONFIRM_WORD}" 确认删除。`,
      })
      return
    }

    const ids = selectedRows.map((row) => row.original.id as number | string)

    onOpenChange(false)
    setValue('')
    table.resetRowSelection()

    try {
      await onBulkDelete(ids)
    } catch (error) {
      console.error('批量删除失败:', error)
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
          />
          删除 {selectedRows.length} 个 {entityName}
        </span>
      }
      desc={
        <div className='flex flex-col gap-4'>
          <p className='mb-2'>
            确定要删除选中的 {selectedRows.length} 个 {entityName} 吗？
            <br />
            此操作无法撤销。
          </p>

          <Label className='flex flex-col items-start gap-1.5'>
            <span>请输入 "{CONFIRM_WORD}" 确认删除：</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`输入 "${CONFIRM_WORD}" 确认`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>警告！</AlertTitle>
            <AlertDescription>此操作无法撤销，请谨慎操作。</AlertDescription>
          </Alert>
        </div>
      }
      confirmText='删除'
      destructive
    />
  )
}
