import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type MultiDeleteDialogProps<TData> = {
  table: Table<TData>
  open: boolean
  onOpenChange: (open: boolean) => void
  onBulkDelete: (ids: number[]) => void
  entityName?: string
}

export function MultiDeleteDialog<TData>({
  table,
  open,
  onOpenChange,
  onBulkDelete,
  entityName = 'item',
}: MultiDeleteDialogProps<TData>) {
  const [confirmText, setConfirmText] = useState('')
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleConfirm = () => {
    if (confirmText.toUpperCase() === 'DELETE') {
      const ids = selectedRows.map((row) => row.original.id as number)
      onBulkDelete(ids)
      setConfirmText('')
      onOpenChange(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmText('')
    }
    onOpenChange(open)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认批量删除</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className='space-y-2'>
              <p>
                确定要删除选中的 {selectedRows.length} 个 {entityName}{' '}
                吗？此操作无法撤销。
              </p>
              <p className='font-medium text-destructive'>
                此操作将永久删除数据，请谨慎操作。
              </p>
              <div className='mt-4 space-y-2'>
                <label className='text-sm font-medium'>
                  请输入{' '}
                  <span className='font-bold text-destructive'>DELETE </span>
                  确认删除：
                </label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder='输入 DELETE 确认'
                  className='border-destructive/50 focus:border-destructive'
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={confirmText.toUpperCase() !== 'DELETE'}
            className='bg-destructive hover:bg-destructive/90 disabled:opacity-50'
          >
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
