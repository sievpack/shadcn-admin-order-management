import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { type Customer } from './customer-provider'

type CustomerViewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
}

function CustomerDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex flex-col gap-1'>
      <span className='text-xs text-muted-foreground'>{label}</span>
      <span className='text-sm font-medium'>{value || '-'}</span>
    </div>
  )
}

export function CustomerViewDialog({
  open,
  onOpenChange,
  customer,
}: CustomerViewDialogProps) {
  if (!customer) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>客户详情</DialogTitle>
          <DialogDescription>查看客户详细信息</DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-6'>
          <div>
            <h4 className='mb-3 text-sm font-medium'>基本信息</h4>
            <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
              <CustomerDetailRow label='客户名称' value={customer.客户名称} />
              <CustomerDetailRow label='简称' value={customer.简称} />
              <CustomerDetailRow label='联系人' value={customer.联系人} />
              <CustomerDetailRow label='联系电话' value={customer.联系电话} />
              <CustomerDetailRow label='手机' value={customer.手机} />
              <CustomerDetailRow
                label='业务负责人'
                value={customer.业务负责人}
              />
            </div>
          </div>
          <Separator />
          <div>
            <h4 className='mb-3 text-sm font-medium'>结算信息</h4>
            <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
              <div className='flex flex-col gap-1'>
                <span className='text-xs text-muted-foreground'>结算方式</span>
                <Badge
                  className={
                    {
                      现结: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700',
                      月结: 'border-blue-500/50 bg-blue-500/10 text-blue-700',
                      账期: 'border-orange-500/50 bg-orange-500/10 text-orange-700',
                    }[customer.结算方式] || ''
                  }
                >
                  {customer.结算方式 || '-'}
                </Badge>
              </div>
              <CustomerDetailRow
                label='是否含税'
                value={customer.是否含税 ? '是' : '否'}
              />
              <CustomerDetailRow label='对账时间' value={customer.对账时间} />
              <CustomerDetailRow label='开票时间' value={customer.开票时间} />
              <CustomerDetailRow label='结算周期' value={customer.结算周期} />
            </div>
          </div>
          <Separator />
          <div>
            <h4 className='mb-3 text-sm font-medium'>其他信息</h4>
            <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
              <CustomerDetailRow
                label='送货单版本'
                value={customer.送货单版本}
              />
              <CustomerDetailRow label='收货地址' value={customer.收货地址} />
            </div>
            {customer.备注 && (
              <div className='mt-4 flex flex-col gap-1'>
                <span className='text-xs text-muted-foreground'>备注</span>
                <span className='text-sm'>{customer.备注}</span>
              </div>
            )}
            <div className='mt-4 flex flex-col gap-1'>
              <span className='text-xs text-muted-foreground'>状态</span>
              <Badge
                className={
                  {
                    活跃: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400',
                    停用: 'border-red-500/50 bg-red-500/10 text-red-700 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-400',
                    潜在: 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400',
                  }[customer.状态?.trim() || '-']
                }
              >
                {customer.状态 || '-'}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
