import { SimpleDeleteDialog } from '@/components/common'

type OrderDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: number | null
  onDelete: (id: number) => void
}

export function OrderDeleteDialog({
  open,
  onOpenChange,
  orderId,
  onDelete,
}: OrderDeleteDialogProps) {
  const handleDelete = () => {
    if (orderId) {
      onDelete(orderId)
      onOpenChange(false)
    }
  }

  return (
    <SimpleDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title='确认删除订单'
      description='确定要删除这个订单吗？此操作无法撤销。'
      onConfirm={handleDelete}
    />
  )
}
