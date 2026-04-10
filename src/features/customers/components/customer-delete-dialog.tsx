import { Trash2 } from 'lucide-react'
import { customerAPI } from '@/lib/api'
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
import { type Customer } from './customer-provider'
import { useCustomer } from './customer-provider'

type CustomerDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onRefresh: () => void
}

export function CustomerDeleteDialog({
  open,
  onOpenChange,
  customer,
  onRefresh,
}: CustomerDeleteDialogProps) {
  const { refreshData } = useCustomer()

  const handleDelete = async () => {
    if (!customer) return
    try {
      const response = await customerAPI.deleteCustomer(customer.id)
      if (response.data.code === 0) {
        showToastWithData({
          type: 'success',
          title: '客户删除成功',
          data: { 客户名称: customer.客户名称, id: customer.id },
        })
        onRefresh()
        refreshData()
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
        data: { error: error.message || '未知错误' },
      })
    } finally {
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='sm:max-w-md'>
        <div className='p-6'>
          <AlertDialogHeader className='flex flex-col items-center text-center'>
            <div className='mb-4 rounded-full bg-destructive/10 p-3 text-destructive'>
              <Trash2 className='h-6 w-6' />
            </div>
            <AlertDialogTitle className='text-lg font-semibold'>
              确认删除
            </AlertDialogTitle>
            <AlertDialogDescription className='mt-2 text-sm text-muted-foreground'>
              确定要删除客户「{customer?.客户名称}」吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <div className='border-t p-4'>
          <AlertDialogFooter className='flex justify-center gap-2'>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
              onClick={handleDelete}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
