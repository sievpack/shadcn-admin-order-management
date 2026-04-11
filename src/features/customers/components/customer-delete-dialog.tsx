import { customerAPI } from '@/lib/api'
import { showToastWithData } from '@/lib/show-submitted-data'
import { SimpleDeleteDialog } from '@/components/common'
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
    }
  }

  return (
    <SimpleDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      entityName={customer?.客户名称}
      onConfirm={handleDelete}
    />
  )
}
