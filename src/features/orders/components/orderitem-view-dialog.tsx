import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type OrderItem } from './allorders-columns'

interface OrderItemViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: OrderItem | null
}

export function OrderItemViewDialog({
  open,
  onOpenChange,
  item,
}: OrderItemViewDialogProps) {
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>订单分项详情</DialogTitle>
          <DialogDescription>查看订单分项详细信息</DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-muted-foreground'>ID</p>
            <p className='font-medium'>{item.id}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-muted-foreground'>订单编号</p>
            <p className='font-medium'>{item.订单编号 || '-'}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-muted-foreground'>合同编号</p>
            <p className='font-medium'>{item.合同编号 || '-'}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-muted-foreground'>客户名称</p>
            <p className='font-medium'>{item.客户名称 || '-'}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-muted-foreground'>订单日期</p>
            <p className='font-medium'>{item.订单日期 || '-'}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-muted-foreground'>交货日期</p>
            <p className='font-medium'>{item.交货日期 || '-'}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-muted-foreground'>结算方式</p>
            <p className='font-medium'>{item.结算方式 || '-'}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-muted-foreground'>发货单号</p>
            <p className='font-medium'>{item.发货单号 || '-'}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-muted-foreground'>快递单号</p>
            <p className='font-medium'>{item.快递单号 || '-'}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-muted-foreground'>客户物料编号</p>
            <p className='font-medium'>{item.客户物料编号 || '-'}</p>
          </div>
          <div className='col-span-2 flex flex-col gap-1'>
            <p className='text-xs text-muted-foreground'>产品规格</p>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='default'>{item.产品类型 || '-'}</Badge>
              <Badge variant='secondary'>{item.规格 || '-'}</Badge>
              <Badge variant='outline'>{item.型号 || '-'}</Badge>
            </div>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-muted-foreground'>数量</p>
            <p className='font-medium'>
              {item.数量} {item.单位 || ''}
            </p>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-muted-foreground'>销售单价</p>
            <p className='font-medium'>
              {item.销售单价 != null ? `¥${item.销售单价.toFixed(2)}` : '-'}
            </p>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-muted-foreground'>金额</p>
            <p className='font-medium'>
              {item.金额 != null ? `¥${item.金额.toFixed(2)}` : '-'}
            </p>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-muted-foreground'>外购</p>
            <p className='font-medium'>{item.外购 ? '是' : '否'}</p>
          </div>
          <div className='col-span-2 flex flex-col gap-1'>
            <p className='text-xs text-muted-foreground'>备注</p>
            <p className='font-medium whitespace-pre-wrap'>
              {item.备注 || '-'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
