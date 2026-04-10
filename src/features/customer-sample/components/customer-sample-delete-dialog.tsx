import { customerSampleAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
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
import { type CustomerSample } from './customer-sample-provider'

type CustomerSampleDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: CustomerSample | null
  onDeleteSuccess: () => void
}

export function CustomerSampleDeleteDialog({
  open,
  onOpenChange,
  data,
  onDeleteSuccess,
}: CustomerSampleDeleteDialogProps) {
  const handleDelete = async () => {
    if (!data) return
    try {
      const response = await customerSampleAPI.delete(data.id)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '删除成功',
          data: { 样品单号: data.样品单号, id: data.id },
        })
        onDeleteSuccess()
      } else {
        showToastWithData({
          type: 'error',
          title: '删除失败',
          data: { msg: response.data.msg },
        })
      }
    } catch (error: any) {
      showToastWithData({
        type: 'error',
        title: '删除失败',
        data: { error: error.message },
      })
    } finally {
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除样品「{data?.样品单号}」吗？此操作无法撤销。
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
