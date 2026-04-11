import { SimpleDeleteDialog } from '@/components/common'

type OrderItemDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: number | null
  itemLabel?: string
  onDelete: (id: number) => void
}

export function OrderItemDeleteDialog({
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
    <SimpleDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title='确认删除'
      description={`确定要删除订单分项"${itemLabel}"吗？此操作无法撤销。`}
      onConfirm={handleDelete}
    />
  )
}
