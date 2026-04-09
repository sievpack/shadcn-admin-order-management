import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type CustomerSample } from './customer-sample-provider'

export function CustomerSampleDetailDialog({
  open,
  onOpenChange,
  data,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: CustomerSample | null
}) {
  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>样品详情</DialogTitle>
          <DialogDescription>样品单号：{data.样品单号}</DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='font-medium'>客户名称：</span>
            {data.客户名称}
          </div>
          <div>
            <span className='font-medium'>下单日期：</span>
            {data.下单日期}
          </div>
          <div>
            <span className='font-medium'>需求日期：</span>
            {data.需求日期 || '-'}
          </div>
          <div>
            <span className='font-medium'>规格：</span>
            {data.规格}
          </div>
          <div>
            <span className='font-medium'>产品类型：</span>
            {data.产品类型}
          </div>
          <div>
            <span className='font-medium'>型号：</span>
            {data.型号}
          </div>
          <div>
            <span className='font-medium'>单位：</span>
            {data.单位}
          </div>
          <div>
            <span className='font-medium'>数量：</span>
            {data.数量}
          </div>
          <div>
            <span className='font-medium'>齿形：</span>
            {data.齿形 || '-'}
          </div>
          <div>
            <span className='font-medium'>材料：</span>
            {data.材料 || '-'}
          </div>
          <div>
            <span className='font-medium'>钢丝：</span>
            {data.钢丝 || '-'}
          </div>
          <div>
            <span className='font-medium'>喷码要求：</span>
            {data.喷码要求 || '-'}
          </div>
          <div className='col-span-2'>
            <span className='font-medium'>备注：</span>
            {data.备注 || '-'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
