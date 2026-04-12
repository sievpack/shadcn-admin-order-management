import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface OrderCreatedDetailDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  notification: {
    id: string
    notification_type: string
    title: string
    content: string
    timestamp?: number
    detail?: {
      订单编号?: string
      订单日期?: string
      交货日期?: string
      客户名称?: string
      订单总金额?: number
      订单项目?: Array<{
        合同编号?: string
        产品类型?: string
        型号?: string
        规格?: string
        数量?: number
        单位?: string
        销售单价?: number
        金额?: number
      }>
    }
  }
}

export function OrderCreatedDetailDialog({
  open = true,
  onOpenChange,
  notification,
}: OrderCreatedDetailDialogProps) {
  const detail = notification.detail || {}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>{notification.title}</DialogTitle>
          <DialogDescription>{notification.content}</DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-6 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label>订单编号</Label>
              <Input value={detail.订单编号 || '-'} disabled />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>客户名称</Label>
              <Input value={detail.客户名称 || '-'} disabled />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label>订单日期</Label>
              <Input
                value={
                  detail.订单日期
                    ? format(new Date(detail.订单日期), 'yyyy-MM-dd')
                    : '-'
                }
                disabled
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>交货日期</Label>
              <Input
                value={
                  detail.交货日期
                    ? format(new Date(detail.交货日期), 'yyyy-MM-dd')
                    : '-'
                }
                disabled
              />
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <Label>订单总金额</Label>
            <Input
              value={detail.订单总金额 ? `¥${detail.订单总金额}` : '-'}
              disabled
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label>订单项目</Label>
            {detail.订单项目 && detail.订单项目.length > 0 ? (
              <div className='overflow-hidden rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>合同编号</TableHead>
                      <TableHead>产品类型</TableHead>
                      <TableHead>型号</TableHead>
                      <TableHead>规格</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>单位</TableHead>
                      <TableHead>单价</TableHead>
                      <TableHead>金额</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.订单项目.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.合同编号 || '-'}</TableCell>
                        <TableCell>{item.产品类型 || '-'}</TableCell>
                        <TableCell>{item.型号 || '-'}</TableCell>
                        <TableCell>{item.规格 || '-'}</TableCell>
                        <TableCell>{item.数量 || 0}</TableCell>
                        <TableCell>{item.单位 || '件'}</TableCell>
                        <TableCell>¥{item.销售单价 || 0}</TableCell>
                        <TableCell>¥{item.金额 || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className='text-muted-foreground'>暂无订单项目</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
