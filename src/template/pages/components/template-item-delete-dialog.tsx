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

type OrderItemDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: number | null
  itemLabel?: string
  onDelete: (id: number) => void
}

export function TemplateItemDeleteDialog({
  open,
  onOpenChange,
  itemId,
  itemLabel,
  onDelete,
}: OrderItemDeleteDialogProps) {
  const handleDelete = () => {
    if (itemId) {
      onDelete(itemId)
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            你确定要删除订单分项 &quot;{itemLabel}&quot; 吗？此操作无法撤销。
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
