import { toast } from 'sonner'
import { orderAPI } from '@/lib/api'
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
import { type ShippingItem } from './shipping-columns'

type ShippingDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: ShippingItem
  onDeleted?: () => void
}

export function ShippingDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onDeleted,
}: ShippingDeleteDialogProps) {
  const handleDelete = async () => {
    try {
      const response = await orderAPI.deleteShipping(
        currentRow.发货单号,
        currentRow.快递单号
      )
      if (response.data.code === 0) {
        toast.success('删除成功')
        onDeleted?.()
        onOpenChange(false)
      } else {
        toast.error(response.data.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败，请稍后重试')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            你确定要删除发货单 {currentRow.发货单号} 吗？此操作无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='bg-destructive hover:bg-destructive/90'
          >
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
